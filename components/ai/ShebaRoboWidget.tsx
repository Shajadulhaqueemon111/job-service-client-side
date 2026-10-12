"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import {
  Bot,
  Sparkles,
  Send,
  X,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Zap,
  Activity,
  ChevronDown,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  Wrench,
  CreditCard,
  Lock,
} from "lucide-react";

interface ActionItem {
  label: string;
  url?: string;
  actionType?: "open_chat" | "navigate" | "diagnose" | "call_support";
  requestId?: string;
}

interface DiagnosisItem {
  category: string;
  status: "ok" | "warning" | "error";
  title: string;
  description: string;
  fix: string;
  action?: ActionItem;
}

interface MessageItem {
  id: string;
  sender: "user" | "robo";
  text?: string;
  category?: string;
  problemSummary?: string;
  rootCause?: string;
  solutionSteps?: string[];
  actions?: ActionItem[];
  tip?: string;
  diagnoses?: DiagnosisItem[];
  healthScore?: number;
  createdAt: Date;
}

export function ShebaRoboWidget() {
  const { user } = useAuth();
  const { isBn } = useI18n();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [hasUnreadAlert, setHasUnreadAlert] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome_1",
          sender: "robo",
          text: isBn
            ? `আসসালামু আলাইকুম ${user?.name ? user.name + " " : ""}! আমি সেবারবো (ShebaRobo)—আপনার ব্যক্তিগত AI স্মার্ট অ্যাসিস্ট্যান্ট ও প্রবলেম সলভার। প্ল্যাটফর্মে কোনো সমস্যা (পেমেন্ট, দেরি, উইথড্র, সিকিউরিটি) হলে বলুন, আমি তাৎক্ষণিক সমাধান ও ফিক্স করার উপায় দেবো!`
            : `Hello ${user?.name ? user.name + " " : ""}! I am ShebaRobo, your AI assistant and issue-fixing agent. If you face any issues with payments, job delays, withdrawals, or 2FA, I will diagnose and give you the exact step-by-step solution!`,
          actions: [
            {
              label: isBn ? "🔍 সিস্টেম ডায়াগনস্টিক চালান" : "🔍 Run System Diagnostic",
              actionType: "diagnose",
            },
          ],
          createdAt: new Date(),
        },
      ]);
    }
  }, [user, isBn]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 150);
      setHasUnreadAlert(false);
    }
  }, [isOpen, messages]);

  // Quick problem templates
  const quickProblems = [
    {
      label: isBn ? "💸 পেমেন্ট / TrxID সমস্যা" : "💸 Payment / TrxID Issue",
      query: isBn
        ? "আমি বিকাশ/নগদে টাকা পাঠিয়েছি কিন্তু স্ট্যাটাস পেইড হচ্ছে না। কীভাবে ফিক্স করব?"
        : "I sent payment via bKash/Nagad but status is not marked as paid. How to fix?",
    },
    {
      label: isBn ? "⏱️ প্রোভাইডার আসতে দেরি করছে" : "⏱️ Provider Delay",
      query: isBn
        ? "প্রোভাইডার আসতে অনেক দেরি করছে বা কত সময় লাগবে বুঝতে পারছি না। কী করব?"
        : "Provider is arriving late or job timing is unclear. What should I do?",
    },
    {
      label: isBn ? "🏦 টাকা তোলা / উইথড্র সমস্যা" : "🏦 Payout / Withdraw Issue",
      query: isBn
        ? "আমি আমার ওয়ালেট থেকে বিকাশ বা নগদে টাকা তুলতে পারছি না। সমাধান কী?"
        : "I cannot withdraw money to bKash/Nagad from wallet. What is the solution?",
    },
    {
      label: isBn ? "🔐 ২-স্টেপ বা পাসওয়ার্ড সমস্যা" : "🔐 2FA & Password Issue",
      query: isBn
        ? "২-স্টেপ ভেরিফিকেশন ওটিপি বা পাসওয়ার্ড পরিবর্তন করতে পারছি না। সমাধান কী?"
        : "Having trouble with 2-Step OTP or password change. How to fix?",
    },
    {
      label: isBn ? "🔍 অ্যাকাউন্ট ডায়াগনস্টিক চালান" : "🔍 Run Account Diagnostic",
      actionType: "diagnose",
    },
  ];

  // Send query or trigger diagnostic
  const handleAsk = async (queryText?: string, isDiagnosticMode: boolean = false) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend && !isDiagnosticMode) return;

    // Append user message if not pure diagnose click
    if (!isDiagnosticMode && textToSend) {
      const userMsg: MessageItem = {
        id: `user_${Date.now()}`,
        sender: "user",
        text: textToSend,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputText("");
    }

    setLoading(true);

    try {
      const res = await fetch("/api/ai/sebarobo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: isDiagnosticMode ? "diagnose" : textToSend,
          mode: isDiagnosticMode ? "diagnose" : "chat",
          isBn,
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.mode === "diagnose") {
          const roboMsg: MessageItem = {
            id: `robo_diag_${Date.now()}`,
            sender: "robo",
            text: isBn
              ? `🔍 আপনার অ্যাকাউন্ট ও সিস্টেম ডায়াগনোসিস সম্পন্ন হয়েছে! হেলথ স্কোর: ${data.healthScore}%`
              : `🔍 Account & System Diagnostic Complete! Health Score: ${data.healthScore}%`,
            healthScore: data.healthScore,
            diagnoses: data.diagnoses || [],
            createdAt: new Date(),
          };
          setMessages((prev) => [...prev, roboMsg]);
        } else {
          const sol = data.diagnosticSolution || {};
          const roboMsg: MessageItem = {
            id: `robo_sol_${Date.now()}`,
            sender: "robo",
            text: data.geminiResponse || undefined,
            category: data.category,
            problemSummary: sol.problemSummary,
            rootCause: sol.rootCause,
            solutionSteps: sol.solutionSteps,
            actions: sol.actions || [],
            tip: sol.tip,
            createdAt: new Date(),
          };
          setMessages((prev) => [...prev, roboMsg]);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `robo_err_${Date.now()}`,
            sender: "robo",
            text: isBn
              ? "দুঃখিত, সংযোগে কিছু ত্রুটি হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।"
              : "Sorry, a connection error occurred. Please try again.",
            createdAt: new Date(),
          },
        ]);
      }
    } catch (err) {
      console.error("ShebaRobo error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `robo_err_${Date.now()}`,
          sender: "robo",
          text: isBn
            ? "সার্ভারে যোগাযোগ করতে সাময়িক বিঘ্ন ঘটেছে।"
            : "Temporary failure communicating with the server.",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleActionClick = (action: ActionItem) => {
    if (action.actionType === "diagnose") {
      handleAsk("", true);
    }
  };

  return (
    <>
      {/* Floating Trigger Launcher (Bottom Right) */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 group">
          {/* Tooltip Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 dark:bg-slate-800 text-white text-xs font-semibold shadow-lg border border-slate-700 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>{isBn ? "কোনো সমস্যা? সেবারবো AI সাহায্য করবে!" : "Issue? ShebaRobo will fix it!"}</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="relative h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white shadow-xl shadow-emerald-950/30 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ring-4 ring-emerald-500/20"
            title="Open ShebaRobo AI Issue Solver"
          >
            <Bot className="h-7 w-7 text-white animate-pulse" />
            {/* Sparkle badge */}
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-400 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center">
              <Sparkles className="h-2.5 w-2.5 text-slate-950" />
            </span>
          </button>
        </div>
      )}

      {/* Main ShebaRobo Assistant Drawer */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[95vw] sm:w-[480px] h-[670px] max-h-[94vh] flex flex-col rounded-3xl overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.55)] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 ring-1 ring-black/5 dark:ring-white/10 animate-in slide-in-from-bottom-6 duration-200">
          
          {/* Top Ambient Glow Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 shrink-0" />

          {/* Header */}
          <div className="px-4 py-3.5 sm:px-5 sm:py-3.5 bg-slate-50/90 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-indigo-600 text-white flex items-center justify-center shadow-md ring-2 ring-emerald-500/20">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                    ShebaRobo (সেবারবো)
                  </h3>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    AI AGENT
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {isBn ? "স্মার্ট সমস্যা সমাধানকারী ও পরামর্শক" : "Smart Issue Diagnostic & Resolver"}
                </p>
              </div>
            </div>

            {/* Quick Header Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleAsk("", true)}
                className="h-8 px-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-[11px] font-bold transition-all flex items-center gap-1"
                title="Run diagnostic"
              >
                <Activity className="h-3 w-3 text-emerald-500" />
                <span className="hidden sm:inline">{isBn ? "ডায়াগনোসিস" : "Diagnose"}</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 transition-all flex items-center justify-center border border-slate-200/80 dark:border-slate-700/80"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Problem Selector Pills */}
          <div className="px-3.5 py-2 bg-slate-100/60 dark:bg-slate-950/40 border-b border-slate-200/70 dark:border-slate-800/70 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>{isBn ? "সাধারণ সমস্যা" : "Common Issues"}:</span>
            </span>
            {quickProblems.map((prob, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (prob.actionType === "diagnose") {
                    handleAsk("", true);
                  } else if (prob.query) {
                    handleAsk(prob.query, false);
                  }
                }}
                className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shrink-0 active:scale-95 shadow-2xs"
              >
                {prob.label}
              </button>
            ))}
          </div>

          {/* Conversation Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/70 [scrollbar-width:thin]">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";

              if (isUser) {
                return (
                  <div key={msg.id} className="flex justify-end animate-in fade-in duration-150">
                    <div className="max-w-[85%] rounded-2xl rounded-br-xs px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs sm:text-sm font-medium shadow-sm">
                      {msg.text}
                    </div>
                  </div>
                );
              }

              // Robo Message
              return (
                <div key={msg.id} className="flex flex-col gap-2 items-start max-w-[95%] animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 px-1">
                    <div className="h-5 w-5 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                      <Bot className="h-3 w-3" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      ShebaRobo AI
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="w-full rounded-2xl rounded-tl-xs p-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/90 dark:border-slate-700/80 shadow-sm space-y-3">
                    
                    {/* General Intro / Generative Text */}
                    {msg.text && (
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    )}

                    {/* Diagnostic Health Card */}
                    {msg.diagnoses && msg.diagnoses.length > 0 && (
                      <div className="space-y-2.5 pt-1">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                            <Activity className="h-3.5 w-3.5 text-emerald-500" />
                            <span>{isBn ? "অ্যাকাউন্ট অডিট ফলাফল" : "Account Health Check"}</span>
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                              (msg.healthScore || 100) >= 80
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            Score: {msg.healthScore}%
                          </span>
                        </div>

                        <div className="space-y-2">
                          {msg.diagnoses.map((diag, dIdx) => (
                            <div
                              key={dIdx}
                              className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                                diag.status === "ok"
                                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60"
                                  : diag.status === "warning"
                                  ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60"
                                  : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60"
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold">
                                <span className="flex items-center gap-1.5">
                                  {diag.status === "ok" && (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                  )}
                                  {diag.status === "warning" && (
                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                  )}
                                  {diag.status === "error" && (
                                    <AlertCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                                  )}
                                  <span className="text-slate-900 dark:text-white">{diag.title}</span>
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                {diag.description}
                              </p>
                              <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 pt-0.5">
                                <span className="text-emerald-600 dark:text-emerald-400">💡 সমাধান: </span>
                                <span>{diag.fix}</span>
                              </div>

                              {diag.action && (
                                <div className="pt-1.5">
                                  {diag.action.url ? (
                                    <Link
                                      href={diag.action.url}
                                      onClick={() => setIsOpen(false)}
                                      className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-lg transition-colors"
                                    >
                                      <span>{diag.action.label}</span>
                                      <ArrowRight className="h-3 w-3" />
                                    </Link>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleActionClick(diag.action!)}
                                      className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-lg transition-colors"
                                    >
                                      <span>{diag.action.label}</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step-by-Step Issue Fix Card */}
                    {msg.problemSummary && (
                      <div className="space-y-2.5 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                        {/* Problem Identified */}
                        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs">
                          <p className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>{isBn ? "সমস্যার কারণ চিহ্নিত:" : "Problem Identified:"}</span>
                          </p>
                          <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed text-[11px]">
                            {msg.rootCause || msg.problemSummary}
                          </p>
                        </div>

                        {/* Step-by-Step Solution */}
                        {msg.solutionSteps && msg.solutionSteps.length > 0 && (
                          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 text-xs space-y-1.5">
                            <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                              <Zap className="h-3.5 w-3.5 text-emerald-600" />
                              <span>{isBn ? "যেভাবে সমাধান করবেন (Step-by-Step Fix):" : "How to Fix (Steps):"}</span>
                            </p>
                            <div className="space-y-1 pl-1 text-[11px] text-slate-700 dark:text-slate-200">
                              {msg.solutionSteps.map((step, sIdx) => (
                                <p key={sIdx} className="leading-relaxed font-medium">
                                  {step}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Pro Tip */}
                        {msg.tip && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                            💡 <span className="font-semibold">টিপ:</span> {msg.tip}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Quick Direct Action Buttons */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-700/60">
                        {msg.actions.map((act, aIdx) => {
                          if (act.url) {
                            return (
                              <Link
                                key={aIdx}
                                href={act.url}
                                onClick={() => setIsOpen(false)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-sm transition-all"
                              >
                                <span>{act.label}</span>
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                            );
                          }
                          return (
                            <button
                              key={aIdx}
                              type="button"
                              onClick={() => handleActionClick(act)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow-sm transition-all"
                            >
                              <span>{act.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-fit text-xs text-slate-500 animate-in fade-in">
                <Bot className="h-4 w-4 text-emerald-500 animate-spin" />
                <span className="font-medium italic">
                  {isBn ? "সেবারবো সমস্যাটি বিশ্লেষণ করছে..." : "ShebaRobo is analyzing your issue..."}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Input Area */}
          <div className="p-3 sm:p-3.5 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-inner">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
                placeholder={
                  isBn
                    ? "সমস্যাটি লিখুন (যেমন: পেমেন্ট করেছি কিন্তু হচ্ছে না)..."
                    : "Describe the issue (e.g. payment not confirmed)..."
                }
                className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none py-1.5"
              />
              <button
                type="button"
                onClick={() => handleAsk()}
                disabled={!inputText.trim() || loading}
                className="h-9 px-3.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 shadow-md shadow-emerald-600/25 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1 shrink-0"
              >
                <span>{isBn ? "সমাধান দিন" : "Solve"}</span>
                <Send className="h-3 w-3" />
              </button>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
