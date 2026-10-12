"use client";

import React, { useState } from "react";
import { ShieldCheck, ShieldAlert, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function TwoFactorSecurityCard() {
  const { user, refreshUser } = useAuth();
  const { isBn } = useI18n();

  const isEnabled = user?.twoFactorEnabled !== false;

  const [showToggleModal, setShowToggleModal] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async (targetState: boolean) => {
    if (!password) {
      setError(isBn ? "পাসওয়ার্ড দেওয়া আবশ্যক" : "Password is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/2fa/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: targetState,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update 2FA status");
      }

      toast.success(
        targetState
          ? isBn
            ? "২-ধাপ যাচাইকরণ সফলভাবে চালু করা হয়েছে!"
            : "Two-step verification has been enabled!"
          : isBn
          ? "২-ধাপ যাচাইকরণ বন্ধ করা হয়েছে।"
          : "Two-step verification has been disabled."
      );

      await refreshUser();
      setShowToggleModal(false);
      setPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update setting";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${
              isEnabled
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700"
            }`}
          >
            {isEnabled ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {isBn ? "২-ধাপ যাচাইকরণ (2-Step Verification)" : "Two-Step Verification (2FA)"}
              </h3>
              <span
                className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                  isEnabled
                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                {isEnabled ? (isBn ? "সক্রিয়" : "Active") : isBn ? "নিষ্ক্রিয়" : "Inactive"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isBn
                ? "লগইনের সময় ৬-সংখ্যার ওটিপি কোড ব্যবহার করে অ্যাকাউন্টকে সর্বোচ্চ নিরাপদ রাখুন"
                : "Require a 6-digit security code whenever logging in to safeguard your account"}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant={isEnabled ? "outline" : "gradient"}
          size="sm"
          onClick={() => {
            setError(null);
            setPassword("");
            setShowToggleModal(true);
          }}
          className="rounded-xl text-xs font-bold"
        >
          {isEnabled
            ? isBn
              ? "নিরাপত্তা পরিবর্তন করুন"
              : "Change 2FA Status"
            : isBn
            ? "চালু করুন"
            : "Enable 2FA"}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              {isBn ? "অননুমোদিত প্রবেশ রোধ" : "Unauthorized Access Prevention"}
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              {isBn
                ? "পাসওয়ার্ড ফাঁস হলেও ওটিপি ছাড়া কেউ প্রবেশ করতে পারবে না"
                : "Even if your password is compromised, logins require secondary verification"}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              {isBn ? "তাত্ক্ষণিক ওটিপি ভেরিফিকেশন" : "Instant Verification"}
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              {isBn
                ? "১০ মিনিটের জন্য কার্যকর সুরক্ষামূলক ওটিপি কোড"
                : "Dynamic single-use security token with 10-minute validity"}
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showToggleModal && (
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
              {isBn
                ? "নিরাপত্তা নিশ্চিত করতে বর্তমান পাসওয়ার্ড লিখুন"
                : "Confirm current password to change 2-step verification"}
            </span>
          </div>

          {error && (
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="text-xs"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant={isEnabled ? "destructive" : "gradient"}
                disabled={loading || !password}
                onClick={() => handleToggle(!isEnabled)}
                size="sm"
                className="whitespace-nowrap font-bold text-xs"
              >
                {loading
                  ? "..."
                  : isEnabled
                  ? isBn
                    ? "বন্ধ করুন"
                    : "Disable 2FA"
                  : isBn
                  ? "চালু করুন"
                  : "Enable 2FA"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowToggleModal(false);
                  setPassword("");
                  setError(null);
                }}
                className="text-xs"
              >
                {isBn ? "বাতিল" : "Cancel"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
