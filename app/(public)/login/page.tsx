"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Wrench,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Briefcase,
  KeyRound,
  RotateCcw,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const { refreshUser } = useAuth();
  const { t, isBn } = useI18n();

  // Step state: "credentials" or "2fa"
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");

  // Credentials state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 2FA state
  const [tempToken, setTempToken] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  // Common state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref for OTP inputs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for resending OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "2fa" && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  // Handle Step 1: Credentials submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Check if 2-Step Verification is required
      if (data.requires2FA) {
        setTempToken(data.tempToken);
        setMaskedEmail(data.email || email);
        setMaskedPhone(data.phone || "");
        setDemoOtp(data.demoOtp || null);
        setStep("2fa");
        setOtpDigits(["", "", "", "", "", ""]);
        setResendCooldown(60);
        toast.info(
          isBn
            ? "২-ধাপ যাচাইকরণ কোড তৈরি করা হয়েছে।"
            : "Two-step verification code generated."
        );
        // Auto-focus first digit on next tick
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 150);
        return;
      }

      // Fallback if 2FA was not triggered
      await refreshUser();
      toast.success(isBn ? "সফলভাবে লগইন হয়েছে!" : "Logged in successfully!");

      handleRedirect(data.user?.role);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: 2FA OTP submission
  const handleVerify2FA = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join("");
    if (code.length !== 6) {
      setError(isBn ? "অনুগ্রহ করে ৬ ডিজিটের কোডটি লিখুন" : "Please enter the full 6-digit code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tempToken,
          code,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      await refreshUser();
      toast.success(
        isBn
          ? "২-ধাপ যাচাইকরণ সফল! স্বাগতম!"
          : "Two-step verification successful! Welcome!"
      );

      handleRedirect(data.user?.role);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRedirect = (role?: string) => {
    if (callbackUrl) {
      router.push(callbackUrl);
    } else if (role === "admin") {
      router.push("/admin");
    } else if (role === "provider") {
      router.push("/provider");
    } else {
      router.push("/dashboard");
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/2fa/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to resend code");
      }

      setDemoOtp(data.demoOtp || null);
      setResendCooldown(60);
      setOtpDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      toast.success(
        isBn
          ? "নতুন ভেরিফিকেশন কোড পাঠানো হয়েছে!"
          : "A fresh verification code has been generated!"
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resend code";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  // Handle OTP digit changes
  const handleDigitChange = (index: number, val: string) => {
    const sanitizedVal = val.replace(/\D/g, "");
    if (!sanitizedVal) {
      const newDigits = [...otpDigits];
      newDigits[index] = "";
      setOtpDigits(newDigits);
      return;
    }

    // If user pasted multiple digits into one field
    if (sanitizedVal.length > 1) {
      const pasted = sanitizedVal.slice(0, 6).split("");
      const newDigits = [...otpDigits];
      pasted.forEach((char, i) => {
        if (index + i < 6) newDigits[index + i] = char;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(index + pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      if (newDigits.every((d) => d !== "")) {
        handleVerify2FA(newDigits.join(""));
      }
      return;
    }

    const singleDigit = sanitizedVal.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = singleDigit;
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (index < 5 && singleDigit) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all 6 digits are filled, auto-verify
    if (newDigits.every((d) => d !== "")) {
      handleVerify2FA(newDigits.join(""));
    }
  };

  // Handle backspace navigation in OTP
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Auto-fill demo OTP code
  const fillDemoOtp = (code: string) => {
    const digits = code.split("").slice(0, 6);
    setOtpDigits(digits);
    handleVerify2FA(code);
  };

  // Quick fill credentials
  const fillCredentials = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Brand */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
              <Wrench className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
              {t.common.siteName}
            </span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {step === "credentials"
              ? isBn
                ? "স্বাগতম! আপনার অ্যাকাউন্টে লগইন করুন"
                : "Welcome Back"
              : isBn
              ? "২-ধাপ যাচাইকরণ (2FA)"
              : "Two-Step Verification"}
          </h1>
          <p className="text-xs text-slate-500">
            {step === "credentials"
              ? isBn
                ? "আপনার সেবা ও রিকোয়েস্ট পরিচালনা করুন"
                : "Manage your bookings and service requests"
              : isBn
              ? "আপনার অ্যাকাউন্টের বাড়তি সুরক্ষায় ৬ ডিজিটের ওটিপি যাচাই করুন"
              : "Enter the 6-digit security code to verify your identity"}
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/90 p-6 sm:p-8 shadow-xl backdrop-blur-sm space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold animate-in fade-in">
              {error}
            </div>
          )}

          {step === "credentials" ? (
            /* STEP 1: Email & Password */
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{t.common.email}</span>
                  </label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Password</span>
                  </label>
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 flex items-center gap-2 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    {isBn
                      ? "সকল ইউজারদের জন্য ২-ধাপ যাচাইকরণ (2FA) সক্রিয় রয়েছে।"
                      : "2-Step verification is enabled for enhanced account security."}
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  disabled={loading}
                  className="w-full py-2.5 font-bold rounded-xl gap-2 mt-2"
                >
                  <span>{loading ? t.common.loading : t.common.login}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              {/* Quick-Fill Demo Credentials */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                  Quick Demo Logins
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => fillCredentials("admin@shebabd.com", "Admin@123456")}
                    className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100 text-[10px] font-bold text-rose-700 dark:text-rose-300 flex flex-col items-center gap-1 transition-colors"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillCredentials("rafiq.ac@shebabd.com", "Password123")}
                    className="p-2 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100 text-[10px] font-bold text-blue-700 dark:text-blue-300 flex flex-col items-center gap-1 transition-colors"
                  >
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>Provider</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillCredentials("tarek@gmail.com", "Password123")}
                    className="p-2 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 flex flex-col items-center gap-1 transition-colors"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Customer</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 text-center text-xs text-slate-500">
                {isBn ? "নতুন ইউজার?" : "Don't have an account?"}{" "}
                <Link href="/register" className="font-bold text-emerald-600 hover:underline">
                  {t.common.register}
                </Link>
              </div>
            </>
          ) : (
            /* STEP 2: Two-Step Verification (OTP) */
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
              {/* Security Shield Icon Header */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-center space-y-1">
                <div className="h-11 w-11 rounded-full bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1">
                  <KeyRound className="h-6 w-6 animate-pulse" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isBn ? "যাচাইকরণ কোড পাঠানো হয়েছে" : "Verification Code Sent"}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  {maskedEmail} {maskedPhone ? `• ${maskedPhone}` : ""}
                </p>
              </div>

              {/* Demo OTP Banner for Instant Testing */}
              {demoOtp && (
                <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-300 dark:border-amber-700/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-extrabold tracking-wider text-amber-700 dark:text-amber-300">
                        {isBn ? "টেস্টিং ওটিপি কোড" : "Demo Verification Code"}
                      </p>
                      <p className="text-sm font-black font-mono tracking-widest text-slate-900 dark:text-amber-100">
                        {demoOtp}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fillDemoOtp(demoOtp)}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-colors cursor-pointer"
                  >
                    {isBn ? "অটো-ফিল করুন" : "Auto-fill"}
                  </button>
                </div>
              )}

              {/* 6 Digit Inputs */}
              <div>
                <label className="block text-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {isBn ? "৬ ডিজিটের ওটিপি লিখুন" : "Enter 6-digit Security Code"}
                </label>
                <div className="flex justify-center gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-11 h-13 text-center text-xl font-bold font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <Button
                  type="button"
                  variant="gradient"
                  disabled={loading || otpDigits.some((d) => !d)}
                  onClick={() => handleVerify2FA()}
                  className="w-full py-2.5 font-bold rounded-xl gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>
                    {loading
                      ? isBn
                        ? "যাচাই করা হচ্ছে..."
                        : "Verifying..."
                      : isBn
                      ? "কোড যাচাই ও লগইন করুন"
                      : "Verify & Sign In"}
                  </span>
                </Button>

                {/* Resend Code Button */}
                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isResending}
                    onClick={handleResendOtp}
                    className={`inline-flex items-center gap-1 font-semibold transition-colors ${
                      resendCooldown > 0
                        ? "text-slate-400 cursor-not-allowed"
                        : "text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    }`}
                  >
                    <RotateCcw className={`h-3 w-3 ${isResending ? "animate-spin" : ""}`} />
                    <span>
                      {resendCooldown > 0
                        ? isBn
                          ? `পুনরায় পাঠান (${resendCooldown}s)`
                          : `Resend code in ${resendCooldown}s`
                        : isBn
                        ? "পুনরায় কোড পাঠান"
                        : "Resend Code"}
                    </span>
                  </button>

                  {/* Switch account / back button */}
                  <button
                    type="button"
                    onClick={() => {
                      setStep("credentials");
                      setError(null);
                      setOtpDigits(["", "", "", "", "", ""]);
                    }}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    <span>{isBn ? "অন্য একাউন্ট" : "Back to login"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
