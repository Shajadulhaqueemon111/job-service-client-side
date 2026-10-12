"use client";

import React, { useState } from "react";
import { Lock, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function PasswordChangeCard() {
  const { isBn } = useI18n();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: isBn
          ? "নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।"
          : "New password must be at least 6 characters long.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({
        type: "error",
        text: isBn ? "নতুন পাসওয়ার্ড দুটি মিলছে না।" : "New passwords do not match.",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setMessage({
        type: "success",
        text: isBn ? "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!" : "Password changed successfully!",
      });
      toast.success(
        isBn ? "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!" : "Password changed successfully!"
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change password";
      setMessage({ type: "error", text: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-5">
      <div className="flex items-start gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="h-11 w-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center shrink-0">
          <KeyRound className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            {isBn ? "পাসওয়ার্ড পরিবর্তন করুন" : "Change Account Password"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isBn
              ? "অ্যাকাউন্টের সুরক্ষায় নিয়মিত শক্তিশালী পাসওয়ার্ড ব্যবহার করুন"
              : "Update your password regularly to keep your account safe"}
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold mb-1.5 flex items-center gap-1 text-slate-700 dark:text-slate-300">
            <Lock className="h-3.5 w-3.5" />
            <span>{isBn ? "বর্তমান পাসওয়ার্ড" : "Current Password"}</span>
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="text-xs pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">
              {isBn ? "নতুন পাসওয়ার্ড" : "New Password"}
            </label>
            <Input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">
              {isBn ? "নতুন পাসওয়ার্ড নিশ্চিত করুন" : "Confirm New Password"}
            </label>
            <Input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="gradient"
            size="sm"
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
            className="font-bold text-xs rounded-xl"
          >
            {loading
              ? isBn
                ? "পরিবর্তন হচ্ছে..."
                : "Updating..."
              : isBn
              ? "পাসওয়ার্ড আপডেট করুন"
              : "Update Password"}
          </Button>
        </div>
      </form>
    </div>
  );
}
