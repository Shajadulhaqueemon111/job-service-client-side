"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBDT, formatBDPhone } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { bdPhoneRegex } from "@/validators/auth";
import {
  Wallet,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Printer,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  defaultPhone?: string;
  onSuccess: () => void;
}

type MfsMethod = "bkash" | "nagad";

export function WithdrawModal({
  isOpen,
  onClose,
  availableBalance,
  defaultPhone = "",
  onSuccess,
}: WithdrawModalProps) {
  const { isBn } = useI18n();

  const [paymentMethod, setPaymentMethod] = useState<MfsMethod>("bkash");
  const [amount, setAmount] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>(defaultPhone);
  const [accountType, setAccountType] = useState<"personal" | "agent">("personal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success payout state
  const [payoutResult, setPayoutResult] = useState<{
    amount: number;
    transactionId: string;
    accountNumber: string;
    paymentMethod: MfsMethod;
    processedAt: string;
    newBalance: number;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setError(null);
      setPayoutResult(null);
      setAmount("");
      if (defaultPhone) setAccountNumber(defaultPhone);
    }
  }, [isOpen, defaultPhone]);

  const isBkash = paymentMethod === "bkash";
  const brandName = isBkash ? "bKash" : "Nagad";
  const brandNameBn = isBkash ? "বিকাশ" : "নগদ";
  const brandColor = isBkash ? "#E2136E" : "#F7941D";

  const numAmount = Number(amount) || 0;

  const handleQuickAmount = (val: number) => {
    const capped = Math.min(val, availableBalance);
    setAmount(capped.toString());
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (numAmount < 100) {
      setError(
        isBn
          ? "নূন্যতম ১০০ টাকা উত্তোলন করতে হবে"
          : "Minimum withdrawal amount is ৳100"
      );
      return;
    }

    if (numAmount > availableBalance) {
      setError(
        isBn
          ? `অপর্যাপ্ত ব্যালেন্স। আপনার উত্তোলনযোগ্য ব্যালেন্স ৳${availableBalance}`
          : `Insufficient balance. Available balance is ৳${availableBalance}`
      );
      return;
    }

    const cleanPhone = accountNumber.trim();
    if (!cleanPhone || !bdPhoneRegex.test(cleanPhone)) {
      setError(
        isBn
          ? "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)"
          : "Please enter a valid 11-digit Bangladeshi mobile number"
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/provider/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAmount,
          paymentMethod,
          accountNumber: cleanPhone,
          accountType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Withdrawal failed. Please try again.");
      }

      setPayoutResult({
        amount: data.payout.amount,
        transactionId: data.payout.transactionId,
        accountNumber: data.payout.accountNumber,
        paymentMethod,
        processedAt: data.payout.processedAt,
        newBalance: data.newBalance,
      });

      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error processing withdrawal");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTrx = () => {
    if (payoutResult?.transactionId) {
      navigator.clipboard.writeText(payoutResult.transactionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        if (!loading) onClose();
      }}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-emerald-500" />
          <span>
            {payoutResult
              ? isBn
                ? "টাকা উত্তোলন সফল হয়েছে"
                : "Withdrawal Successful"
              : isBn
              ? "বিকাশ ও নগদে টাকা উত্তোলন"
              : "Withdraw Earnings via MFS"}
          </span>
        </div>
      }
      description={
        <span>
          {payoutResult
            ? isBn
              ? "আপনার উপার্জিত অর্থ সফলভাবে পাঠানো হয়েছে"
              : "Your earnings have been transferred to your mobile wallet"
            : isBn
            ? "আপনার অর্জিত টাকা যেকোনো সময় সরাসরি বিকাশ বা নগদে তুলে নিন"
            : "Cash out your available service earnings instantly to bKash or Nagad"}
        </span>
      }
    >
      <div className="space-y-4 pt-1">
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-300 font-semibold flex items-center gap-2">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* FORM VIEW */}
        {!payoutResult && (
          <form onSubmit={handleWithdrawSubmit} className="space-y-4">
            {/* Available Balance Header */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between border border-slate-800 shadow-md">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  {isBn ? "উত্তোলনযোগ্য ব্যালেন্স" : "Available Balance"}
                </span>
                <p className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                  {formatBDT(availableBalance)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                  0% Cashout Fee
                </span>
              </div>
            </div>

            {/* Method Tabs */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {isBn ? "উত্তোলনের মাধ্যম নির্বাচন করুন" : "Select Payout Method"}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* bKash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("bkash")}
                  className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all text-left relative ${
                    isBkash
                      ? "border-[#E2136E] bg-[#E2136E]/5 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900"
                  }`}
                >
                  <div className="h-9 w-9 rounded-xl bg-[#E2136E] flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm">
                    bK
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                      {isBn ? "বিকাশ ওয়ালেট" : "bKash Wallet"}
                    </div>
                    <span className="text-[10px] text-slate-400">Instant Transfer</span>
                  </div>
                  {isBkash && (
                    <div className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-[#E2136E]" />
                  )}
                </button>

                {/* Nagad */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("nagad")}
                  className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all text-left relative ${
                    !isBkash
                      ? "border-[#F7941D] bg-[#F7941D]/5 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900"
                  }`}
                >
                  <div className="h-9 w-9 rounded-xl bg-[#F7941D] flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm">
                    NG
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                      {isBn ? "নগদ ওয়ালেট" : "Nagad Wallet"}
                    </div>
                    <span className="text-[10px] text-slate-400">Instant Transfer</span>
                  </div>
                  {!isBkash && (
                    <div className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-[#F7941D]" />
                  )}
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isBn ? "উত্তোলনের পরিমাণ (টাকা)" : "Withdrawal Amount (BDT)"} *
                </label>
                <span className="text-[10px] text-slate-400">Min: ৳100</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-mono font-bold text-slate-400 text-sm">
                  ৳
                </span>
                <Input
                  type="number"
                  required
                  min={100}
                  max={availableBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 1000"
                  className="pl-8 font-mono font-bold text-sm rounded-xl"
                />
              </div>

              {/* Quick Amount Pills */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {[500, 1000, 2000, 5000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    disabled={availableBalance < val}
                    onClick={() => handleQuickAmount(val)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-colors"
                  >
                    +৳{val}
                  </button>
                ))}
                {availableBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(availableBalance)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200 transition-colors ml-auto"
                  >
                    {isBn ? "সব ব্যালেন্স" : "All Balance"} (৳{availableBalance})
                  </button>
                )}
              </div>
            </div>

            {/* Wallet Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isBn
                  ? `আপনার ${brandNameBn} নম্বর`
                  : `Your ${brandName} Account Number`}{" "}
                *
              </label>
              <div className="relative">
                <Smartphone className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  type="tel"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="017XXXXXXXX"
                  maxLength={11}
                  className="pl-9 font-mono text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Account Type */}
            <div className="flex items-center gap-4 text-xs font-medium text-slate-700 dark:text-slate-300">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="accountType"
                  value="personal"
                  checked={accountType === "personal"}
                  onChange={() => setAccountType("personal")}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span>{isBn ? "পার্সোনাল অ্যাকাউন্ট" : "Personal Account"}</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="accountType"
                  value="agent"
                  checked={accountType === "agent"}
                  onChange={() => setAccountType("agent")}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span>{isBn ? "এজেন্ট অ্যাকাউন্ট" : "Agent Account"}</span>
              </label>
            </div>

            {/* Security Guarantee */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>
                {isBn
                  ? "টাকা সরাসরি আপনার বিকাশ/নগদ ওয়ালেটে তাৎক্ষণিকভাবে জমা হবে।"
                  : "Payout will be instantly credited to your verified MFS wallet."}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                {isBn ? "বাতিল" : "Cancel"}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading || numAmount < 100 || numAmount > availableBalance}
                className="font-bold text-white gap-1.5 shadow-md"
                style={{ backgroundColor: brandColor }}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>{isBn ? "প্রসেস হচ্ছে..." : "Processing..."}</span>
                  </>
                ) : (
                  <>
                    <span>
                      {isBn
                        ? `${formatBDT(numAmount || 0)} উত্তোলন করুন`
                        : `Withdraw ${formatBDT(numAmount || 0)}`}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* SUCCESS VOUCHER VIEW */}
        {payoutResult && (
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md animate-bounce">
                <Check className="h-6 w-6 stroke-[3]" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {isBn
                  ? `৳${payoutResult.amount} উত্তোলন সফল হয়েছে!`
                  : `৳${payoutResult.amount} Withdrawn Successfully!`}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {isBn
                  ? `আপনার ${brandNameBn} নম্বরে (${payoutResult.accountNumber}) টাকা পাঠানো হয়েছে।`
                  : `Transferred to your ${brandName} account (${payoutResult.accountNumber}).`}
              </p>
            </div>

            {/* Voucher Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 font-medium">TrxID:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                    {payoutResult.transactionId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyTrx}
                    className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">{isBn ? "মাধ্যম" : "Method"}:</span>
                <span className="font-bold uppercase" style={{ color: brandColor }}>
                  {payoutResult.paymentMethod}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">{isBn ? "প্রাপক নম্বর" : "Account Number"}:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {formatBDPhone(payoutResult.accountNumber)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">{isBn ? "উত্তোলনের অংক" : "Amount"}:</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                  {formatBDT(payoutResult.amount)}
                </span>
              </div>

              <div className="flex justify-between pt-1 border-t border-dashed border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">{isBn ? "অবশিষ্ট ওয়ালেট ব্যালেন্স" : "Remaining Balance"}:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {formatBDT(payoutResult.newBalance)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5 text-xs font-semibold"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>{isBn ? "প্রিন্ট ভাউচার" : "Print Voucher"}</span>
              </Button>

              <Button
                type="button"
                variant="gradient"
                size="sm"
                onClick={onClose}
                className="font-bold text-xs"
              >
                {isBn ? "ঠিক আছে" : "Done"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
