"use client";

import React, { useState, useEffect, useRef } from "react";
import { formatBDPhone } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { getSocket } from "@/lib/socket";
import {
  Send,
  MessageSquare,
  Clock,
  Sparkles,
  Phone,
  PhoneCall,
  Wifi,
  WifiOff,
  User,
  Wrench,
  X,
  CheckCheck,
  ShieldCheck,
  Zap,
} from "lucide-react";

export interface ChatMessage {
  _id: string;
  serviceRequest: string;
  sender: string;
  senderRole: "customer" | "provider" | "admin";
  senderName: string;
  senderAvatar?: string;
  content: string;
  isRead: boolean;
  createdAt: string | Date;
}

interface JobChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  jobTitle: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: "customer" | "provider" | "admin";
  partnerName: string;
  partnerRole: "customer" | "provider";
  partnerPhone?: string;
}

export function JobChatModal({
  isOpen,
  onClose,
  requestId,
  jobTitle,
  currentUserId,
  currentUserName,
  currentUserRole,
  partnerName,
  partnerRole,
  partnerPhone,
}: JobChatModalProps) {
  const { isBn } = useI18n();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Quick Chat Prompts (Common questions about timing, location, tools)
  const quickPrompts = [
    {
      label: isBn ? "⏱️ কত সময় লাগবে?" : "⏱️ How much time?",
      text: isBn
        ? "আসসালামু আলাইকুম, কাজটি সম্পন্ন করতে আনুমানিক কত সময় লাগবে ভাই?"
        : "Hello, approximately how much time will it take to finish the work?",
    },
    {
      label: isBn ? "🚗 কখন পৌঁছাবেন?" : "🚗 Arrival time?",
      text: isBn
        ? "ভাই আপনি কখন রওনা হচ্ছেন বা কতক্ষণে পৌঁছাতে পারবেন?"
        : "When will you start or by what time can you arrive?",
    },
    {
      label: isBn ? "📍 লোকেশন কনফার্ম" : "📍 Confirm address",
      text: isBn
        ? "ঠিকানা এবং বাসার লোকেশন কি পরিষ্কার বুঝতে পেরেছেন?"
        : "Did you find the exact house address and location properly?",
    },
    {
      label: isBn ? "🧰 কোনো পার্টস লাগবে?" : "🧰 Parts needed?",
      text: isBn
        ? "কাজের জন্য কোনো পার্টস বা মালামাল কি আগে থেকে কিনে রাখতে হবে?"
        : "Do I need to purchase any spare parts or tools in advance?",
    },
    {
      label: isBn ? "💰 বিল আলোচনা" : "💰 Bill Discussion",
      text: isBn
        ? "কাজের আনুমানিক খরচ ও পারিশ্রমিক সম্পর্কে নিশ্চিত হতে চাচ্ছি।"
        : "I would like to reconfirm the estimated service charges.",
    },
  ];

  // 1. Fetch historical messages
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/requests/${requestId}/messages`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        scrollToBottom();
      }
    } catch (err) {
      console.error("Failed to load chat messages:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Setup Socket.IO connection and room listeners
  useEffect(() => {
    if (!isOpen || !requestId) return;

    fetchMessages();

    const socket = getSocket();
    socket.connect();

    if (socket.connected) {
      setIsSocketConnected(true);
    }

    const onConnect = () => {
      setIsSocketConnected(true);
      socket.emit("join_room", {
        requestId,
        userRole: currentUserRole,
        userName: currentUserName,
      });
    };

    const onDisconnect = () => {
      setIsSocketConnected(false);
    };

    const onReceiveMessage = (newMsg: ChatMessage) => {
      if (newMsg.serviceRequest === requestId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
        setTimeout(scrollToBottom, 50);
      }
    };

    const onUserTyping = (data: { requestId: string; userName: string; isTyping: boolean }) => {
      if (data.requestId === requestId) {
        setPartnerTyping(data.isTyping);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receive_message", onReceiveMessage);
    socket.on("user_typing", onUserTyping);

    if (socket.connected) {
      socket.emit("join_room", {
        requestId,
        userRole: currentUserRole,
        userName: currentUserName,
      });
    }

    const pollInterval = setInterval(() => {
      if (!socket.connected) {
        fetchMessages();
      }
    }, 5000);

    return () => {
      clearInterval(pollInterval);
      socket.emit("leave_room", { requestId });
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receive_message", onReceiveMessage);
      socket.off("user_typing", onUserTyping);
    };
  }, [isOpen, requestId, currentUserId, currentUserName, currentUserRole]);

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    const socket = getSocket();
    if (socket.connected) {
      socket.emit("typing", {
        requestId,
        userName: currentUserName,
        userRole: currentUserRole,
        isTyping: true,
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", {
          requestId,
          userName: currentUserName,
          userRole: currentUserRole,
          isTyping: false,
        });
      }, 1500);
    }
  };

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Send message
  const handleSendMessage = async (customText?: string) => {
    const content = (customText || inputText).trim();
    if (!content || sending) return;

    setSending(true);

    const socket = getSocket();
    if (socket.connected) {
      socket.emit("typing", {
        requestId,
        userName: currentUserName,
        userRole: currentUserRole,
        isTyping: false,
      });
    }

    try {
      if (socket.connected) {
        socket.emit("send_message", {
          requestId,
          senderId: currentUserId,
          senderName: currentUserName,
          senderRole: currentUserRole,
          content,
        });
      } else {
        const res = await fetch(`/api/requests/${requestId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        const data = await res.json();
        if (data.success && data.message) {
          setMessages((prev) => [...prev, data.message]);
          setTimeout(scrollToBottom, 50);
        }
      }

      setInputText("");
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Premium Glass Container */}
      <div className="relative z-50 w-full max-w-2xl h-[660px] max-h-[94vh] flex flex-col rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.45)] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 ring-1 ring-black/5 dark:ring-white/10 animate-in zoom-in-95 duration-200">
        
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 shrink-0" />

        {/* Header Bar */}
        <div className="px-4 py-3.5 sm:px-5 sm:py-4 bg-slate-50/90 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
          {/* Partner Avatar & Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-extrabold text-base shadow-md ring-2 ring-emerald-500/20">
                {partnerRole === "provider" ? (
                  <Wrench className="h-5 w-5 text-white" />
                ) : (
                  <User className="h-5 w-5 text-white" />
                )}
              </div>
              {/* Online Pulse Dot */}
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                  isSocketConnected ? "bg-emerald-500" : "bg-amber-400"
                }`}
                title={isSocketConnected ? "Connected" : "Syncing"}
              >
                {isSocketConnected && (
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                )}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                  {partnerName}
                </h3>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wider uppercase border shadow-2xs ${
                    partnerRole === "provider"
                      ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  }`}
                >
                  {partnerRole === "provider" ? "Service Provider" : "Client"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[220px] sm:max-w-xs font-medium">
                {jobTitle}
              </p>
            </div>
          </div>

          {/* Action Buttons: Phone Call + Close */}
          <div className="flex items-center gap-2 shrink-0">
            {partnerPhone && (
              <a
                href={`tel:${partnerPhone}`}
                className="h-9 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs active:scale-95"
                title={`Call ${partnerPhone}`}
              >
                <PhoneCall className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline font-mono">{formatBDPhone(partnerPhone)}</span>
              </a>
            )}

            <button
              onClick={onClose}
              className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 transition-all flex items-center justify-center border border-slate-200/80 dark:border-slate-700/80 active:scale-95"
              title="Close Chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Live Channel Status Sub-bar */}
        <div className="px-4 py-1.5 bg-slate-100/70 dark:bg-slate-950/70 border-b border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between text-[11px] shrink-0 font-medium">
          <div className="flex items-center gap-2">
            {isSocketConnected ? (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isBn ? "সরাসরি যুক্ত (Live Socket)" : "Live Socket Connected"}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                <WifiOff className="h-3 w-3" />
                <span>{isBn ? "কানেকশন রিকানেক্ট হচ্ছে..." : "Connecting..."}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/80" />
            <span className="hidden sm:inline">{isBn ? "নিরাপদ চ্যাট রুম" : "Private Isolated Room"}</span>
          </div>
        </div>

        {/* Quick Discussion Topics (Scrollable Pills with NO white bar clash) */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 pr-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>{isBn ? "কুইক টপিক" : "Quick Topics"}:</span>
          </div>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(p.text)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shrink-0 active:scale-95 shadow-2xs"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Message Thread Feed */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-slate-50/50 dark:bg-slate-950/70 [scrollbar-width:thin]">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 gap-2">
              <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span>{isBn ? "মেসেজ হিস্ট্রি লোড হচ্ছে..." : "Loading conversation..."}</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-400">
              <div className="h-14 w-14 rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                <MessageSquare className="h-7 w-7" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                  {isBn ? "রিয়েল-টাইম লাইভ চ্যাট শুরু করুন" : "Start Live Conversation"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 leading-relaxed">
                  {isBn
                    ? "কাজের সময়, কখন পৌঁছাবেন, ঠিকানা এবং প্রয়োজনীয় সামগ্রী নিয়ে সরাসরি কথা বলুন।"
                    : "Discuss arrival time, job duration, specific parts needed, and location directions directly."}
                </p>
              </div>
              <div className="pt-2">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 px-3 py-1.5 rounded-full font-medium inline-flex items-center gap-1.5">
                  <Zap className="h-3 w-3" />
                  <span>{isBn ? "উপরের কুইক টপিক চাপুন বা নিচে মেসেজ লিখুন" : "Click any quick topic above or type below"}</span>
                </span>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender === currentUserId;
              return (
                <div
                  key={msg._id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"} animate-in fade-in duration-150`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                      {isMe ? (isBn ? "আপনি (You)" : "You") : msg.senderName}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div
                    className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      isMe
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-xs shadow-emerald-900/15"
                        : "bg-white dark:bg-slate-850 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-200/90 dark:border-slate-700/80 shadow-slate-900/5"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                        isMe ? "text-emerald-100/70" : "text-slate-400"
                      }`}
                    >
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isMe && <CheckCheck className="h-3 w-3 text-emerald-200" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Partner Live Typing Indicator Bubble */}
          {partnerTyping && (
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700/80 w-fit text-xs text-slate-600 dark:text-slate-300 animate-in fade-in">
              <span className="flex gap-1 items-center">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
              </span>
              <span className="font-medium italic">
                {partnerName} {isBn ? "লিখছেন..." : "is typing..."}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar (Sleek dark/light floating capsule) */}
        <div className="p-3 sm:p-4 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-inner">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={
                isBn
                  ? "মেসেজ লিখুন (যেমন: আসতে কতক্ষণ লাগবে?)..."
                  : "Type your message (Enter to send)..."
              }
              className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none py-1.5"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || sending}
              className="h-10 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 shadow-md shadow-emerald-600/25 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>{isBn ? "পাঠান" : "Send"}</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
