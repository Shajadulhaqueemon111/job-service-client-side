"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Shield,
  KeyRound,
  History,
  UserCheck,
} from "lucide-react";
import { TwoFactorSecurityCard } from "@/components/auth/two-factor-card";
import { PasswordChangeCard } from "@/components/auth/password-change-card";
import { UserActivityLogsCard } from "@/components/auth/user-activity-logs-card";
import { toast } from "sonner";

export default function CustomerProfilePage() {
  const { user, refreshUser } = useAuth();
  const { isBn } = useI18n();

  const [activeTab, setActiveTab] = useState<"profile" | "password" | "2fa" | "audit">("profile");

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address, avatar }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setMessage({
        type: "success",
        text: isBn ? "প্রোফাইল সফলভাবে আপডেট করা হয়েছে!" : "Profile updated successfully!",
      });
      toast.success(
        isBn ? "প্রোফাইল সফলভাবে আপডেট করা হয়েছে!" : "Profile updated successfully!"
      );
      await refreshUser();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      setMessage({ type: "error", text: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Page Title */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {isBn ? "প্রোফাইল সেটিংস ও নিরাপত্তা" : "Profile Settings & Security"}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {isBn
            ? "আপনার ব্যক্তিগত তথ্য, পাসওয়ার্ড পরিবর্তন এবং ২-ধাপ যাচাইকরণ পরিচালনা করুন"
            : "Manage your contact info, change password, 2-step verification, and audit logs"}
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Avatar
            src={avatar || user?.avatar}
            fallback={name || "User"}
            size="xl"
            className="ring-4 ring-white/30"
          />
          <div>
            <h2 className="text-lg font-black">{user?.name || name}</h2>
            <p className="text-xs text-emerald-100 font-mono">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] uppercase font-black bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full inline-block">
                {user?.role}
              </span>
              <span className="text-[10px] uppercase font-black bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>2FA Active</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === "profile"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <User className="h-3.5 w-3.5" />
          <span>{isBn ? "ব্যক্তিগত তথ্য" : "Profile Info"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("password")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === "password"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <KeyRound className="h-3.5 w-3.5" />
          <span>{isBn ? "পাসওয়ার্ড পরিবর্তন" : "Change Password"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("2fa")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === "2fa"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          <span>{isBn ? "২-ধাপ যাচাইকরণ (2FA)" : "Two-Step Verification"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === "audit"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <History className="h-3.5 w-3.5" />
          <span>{isBn ? "অ্যাক্টিভিটি ও অডিট লগ" : "Security Logs"}</span>
        </button>
      </div>

      {/* TAB 1: Profile Information */}
      {activeTab === "profile" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {message && (
            <div
              className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                  : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-5">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800">
              {isBn ? "সাধারণ তথ্য সম্পাদনা করুন" : "Personal Information"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 flex items-center gap-1 text-slate-700 dark:text-slate-300">
                  <User className="h-3.5 w-3.5" />
                  <span>{isBn ? "পুরো নাম" : "Full Name"}</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 flex items-center gap-1 text-slate-700 dark:text-slate-300">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{isBn ? "মোবাইল নম্বর (01XXXXXXXXX)" : "Contact Phone (01XXXXXXXXX)"}</span>
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 flex items-center gap-1 text-slate-700 dark:text-slate-300">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{isBn ? "ঠিকানা" : "Street Address"}</span>
                </label>
                <Textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. House 12, Road 4, Sector 7, Uttara, Dhaka"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                  {isBn ? "প্রোফাইল ছবি ইউআরএল" : "Avatar Image URL"}
                </label>
                <Input
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="gradient"
                  disabled={loading}
                  className="font-bold text-xs rounded-xl"
                >
                  {loading
                    ? isBn
                      ? "সংরক্ষণ হচ্ছে..."
                      : "Saving..."
                    : isBn
                    ? "তথ্য সংরক্ষণ করুন"
                    : "Save Information"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: Password Change */}
      {activeTab === "password" && (
        <div className="animate-in fade-in duration-150">
          <PasswordChangeCard />
        </div>
      )}

      {/* TAB 3: Two-Step Verification */}
      {activeTab === "2fa" && (
        <div className="animate-in fade-in duration-150">
          <TwoFactorSecurityCard />
        </div>
      )}

      {/* TAB 4: Security Activity & Audit Logs */}
      {activeTab === "audit" && (
        <div className="animate-in fade-in duration-150">
          <UserActivityLogsCard />
        </div>
      )}
    </div>
  );
}
