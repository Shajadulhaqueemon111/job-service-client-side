"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBDT, formatBDPhone } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { bdPhoneRegex } from "@/validators/auth";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Sparkles,
  RefreshCw,
  Printer,
  Copy,
  Check,
  Receipt,
  Building,
} from "lucide-react";

export interface MfsPaymentRequestInfo {
  _id: string;
  title: string;
  providerTitle: string;
  amount: number;
  customerPhone?: string;
  customerName?: string;
}

interface MfsPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceRequest: MfsPaymentRequestInfo | null;
  onSuccess: () => void;
}

type MfsMethod = "bkash" | "nagad";

export function MfsPaymentModal({
  isOpen,
  onClose,
  serviceRequest,
  onSuccess,
}: MfsPaymentModalProps) {
  const { isBn } = useI18n();

  const [paymentMethod, setPaymentMethod] = useState<MfsMethod>("bkash");
  const [step, setStep] = useState<"details" | "gateway" | "success">("details");
  const [walletNumber, setWalletNumber] = useState(
    serviceRequest?.customerPhone || ""
  );
  const [otpCode, setOtpCode] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success data
  const [receiptData, setReceiptData] = useState<{
    transactionId: string;
    amount: number;
    paymentMethod: MfsMethod;
    paidAt: string;
    senderNumber: string;
  } | null>(null);

  const [trxCopied, setTrxCopied] = useState(false);

  // Reset when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setStep("details");
      setError(null);
      setOtpCode("");
      setPinCode("");
      setReceiptData(null);
      if (serviceRequest?.customerPhone) {
        setWalletNumber(serviceRequest.customerPhone);
      }
    }
  }, [isOpen, serviceRequest]);

  if (!serviceRequest) return null;

  const isBkash = paymentMethod === "bkash";
  const brandName = isBkash ? "bKash" : "Nagad";
  const brandNameBn = isBkash ? "বিকাশ" : "নগদ";
  const brandColor = isBkash ? "#E2136E" : "#F7941D";
  const brandLightBg = isBkash ? "bg-[#E2136E]/10" : "bg-[#F7941D]/10";
  const brandBorder = isBkash ? "border-[#E2136E]" : "border-[#F7941D]";

  const amount = serviceRequest.amount;
  const platformFee = Math.round(amount * 0.1);
  const providerEarnings = amount - platformFee;

  const handleProceedToGateway = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanNumber = walletNumber.trim();
    if (!cleanNumber) {
      setError(
        isBn
          ? `অনুগ্রহ করে আপনার ${brandNameBn} অ্যাকাউন্ট নম্বর দিন`
          : `Please enter your ${brandName} wallet number`
      );
      return;
    }

    if (!bdPhoneRegex.test(cleanNumber)) {
      setError(
        isBn
          ? "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)"
          : "Please enter a valid 11-digit Bangladeshi mobile number (01XXXXXXXXX)"
      );
      return;
    }

    setStep("gateway");
  };

  const handleFillDemoOtp = () => {
    setOtpCode("849201");
    setPinCode("12345");
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/requests/${serviceRequest._id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod,
          senderMfsNumber: walletNumber.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Payment failed. Please try again.");
      }

      setReceiptData({
        transactionId: data.payment.transactionId,
        amount: data.payment.amount,
        paymentMethod,
        paidAt: data.payment.paidAt,
        senderNumber: walletNumber.trim(),
      });
      setStep("success");
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Payment processing error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTrx = () => {
    if (receiptData?.transactionId) {
      navigator.clipboard.writeText(receiptData.transactionId);
      setTrxCopied(true);
      setTimeout(() => setTrxCopied(false), 2000);
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
          <CreditCard className="h-5 w-5 text-emerald-500" />
          <span>
            {step === "success"
              ? isBn
                ? "পেমেন্ট সফল হয়েছে"
                : "Payment Completed"
              : isBn
              ? "বিকাশ ও নগদ পেমেন্ট"
              : "bKash & Nagad Payment"}
          </span>
        </div>
      }
      description={
        <span>
          {step === "success"
            ? isBn
              ? "লেনদেন সফলভাবে সম্পন্ন ও সংরক্ষিত হয়েছে"
              : "Transaction successfully completed and recorded"
            : isBn
            ? "নিরাপদ মোবাইল ব্যাংকিংয়ের মাধ্যমে বিল পরিশোধ করুন"
            : "Pay service bill securely via Bangladeshi Mobile Financial Services"}
        </span>
      }
    >
      <div className="space-y-4 pt-1">
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-300 font-semibold flex items-center gap-2">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* STEP 1: METHOD SELECTION & WALLET NUMBER */}
        {step === "details" && (
          <form onSubmit={handleProceedToGateway} className="space-y-4">
            {/* Payment Method Switcher */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {isBn ? "পেমেন্ট মাধ্যম বেছে নিন" : "Select Payment Method"}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* bKash Option */}
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
                      {isBn ? "বিকাশ" : "bKash"}
                    </div>
                    <span className="text-[10px] text-slate-400">013-019 Wallet</span>
                  </div>
                  {isBkash && (
                    <div className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-[#E2136E]" />
                  )}
                </button>

                {/* Nagad Option */}
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
                      {isBn ? "নগদ" : "Nagad"}
                    </div>
                    <span className="text-[10px] text-slate-400">Post/Dak Vibhag</span>
                  </div>
                  {!isBkash && (
                    <div className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-[#F7941D]" />
                  )}
                </button>
              </div>
            </div>

            {/* Bill Breakdown Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800 space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    {isBn ? "কাজের বিবরণ" : "Service Order"}:
                  </span>
                  <p className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                    {serviceRequest.title}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {isBn ? "প্রোভাইডার:" : "Provider:"} {serviceRequest.providerTitle}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    {isBn ? "মোট বিল" : "Payable"}
                  </span>
                  <span
                    className="text-xl font-black font-mono"
                    style={{ color: brandColor }}
                  >
                    {formatBDT(amount)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 text-[11px] space-y-1 text-slate-500">
                <div className="flex justify-between">
                  <span>{isBn ? "সার্ভিস চার্জ (৯০%)" : "Service Charge (90%)"}</span>
                  <span className="font-mono">{formatBDT(providerEarnings)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isBn ? "প্ল্যাটফর্ম সুরক্ষা ও এসক্রো (১০%)" : "Platform Protection (10%)"}</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    {formatBDT(platformFee)}
                  </span>
                </div>
              </div>
            </div>

            {/* Wallet Number Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isBn
                  ? `আপনার ${brandNameBn} অ্যাকাউন্ট নম্বর`
                  : `Your ${brandName} Account Number`}{" "}
                *
              </label>
              <div className="relative">
                <Smartphone className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  type="tel"
                  required
                  value={walletNumber}
                  onChange={(e) => setWalletNumber(e.target.value)}
                  placeholder="017XXXXXXXX"
                  maxLength={11}
                  className="pl-9 font-mono text-xs rounded-xl"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {isBn
                  ? `যে ${brandNameBn} নম্বর থেকে টাকা পাঠানো হবে`
                  : `Enter the 11-digit mobile wallet number to pay from`}
              </p>
            </div>

            {/* Security Guarantee */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 text-[11px] text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>
                {isBn
                  ? "আপনার পেমেন্ট JobService BD এসক্রোতে নিরাপদ থাকবে।"
                  : "Your payment is protected under JobService BD safe escrow guarantee."}
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
                className="font-bold text-white gap-1.5 shadow-md"
                style={{ backgroundColor: brandColor }}
              >
                <span>{isBn ? "পরবর্তী ধাপ" : "Proceed to Pay"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: SIMULATED MFS GATEWAY (bKash/Nagad Web Checkout) */}
        {step === "gateway" && (
          <form onSubmit={handleConfirmPayment} className="space-y-4">
            {/* Branded Web Checkout Box */}
            <div
              className={`rounded-3xl border-2 ${brandBorder} overflow-hidden bg-white dark:bg-slate-900 shadow-lg`}
            >
              {/* Header */}
              <div
                className="p-4 text-white flex items-center justify-between"
                style={{ backgroundColor: brandColor }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-xs">
                    {isBkash ? "bK" : "NG"}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs">
                      {isBn ? `${brandNameBn} পেমেন্ট গেটওয়ে` : `${brandName} Payment Gateway`}
                    </h4>
                    <p className="text-[10px] text-white/80">JobService BD Merchant</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-white/80 block uppercase font-mono">
                    Payable
                  </span>
                  <span className="text-base font-black font-mono">
                    {formatBDT(amount)}
                  </span>
                </div>
              </div>

              {/* Form Body */}
              <div className="p-5 space-y-3.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px]">
                  <span className="text-slate-400 font-medium">Account:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {formatBDPhone(walletNumber)}
                  </span>
                </div>

                {/* OTP Simulation */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      {isBn ? "ভেরিফিকেশন কোড (OTP)" : "Verification OTP"}
                    </label>
                    <button
                      type="button"
                      onClick={handleFillDemoOtp}
                      className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>{isBn ? "ডেমো কোড বসান" : "Fill Demo OTP"}</span>
                    </button>
                  </div>
                  <Input
                    type="text"
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="e.g. 849201"
                    maxLength={6}
                    className="font-mono tracking-widest text-center text-sm rounded-xl font-bold"
                  />
                </div>

                {/* PIN Simulation */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn
                      ? `আপনার ${brandNameBn} পিন নম্বর দিন`
                      : `Enter ${brandName} PIN`}
                  </label>
                  <div className="relative">
                    <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                    <Input
                      type="password"
                      required
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="•••••"
                      maxLength={5}
                      className="pl-9 font-mono tracking-widest text-xs rounded-xl"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Lock className="h-3 w-3 text-slate-400" />
                    <span>
                      {isBn
                        ? "পিন নম্বর কখনোই কারো সাথে শেয়ার করবেন না।"
                        : "Never share your secret PIN with anyone."}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Gateway Actions */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep("details")}
                disabled={loading}
                className="gap-1 text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>{isBn ? "পিছনে" : "Back"}</span>
              </Button>

              <Button
                type="submit"
                size="sm"
                disabled={loading || !otpCode || !pinCode}
                className="font-bold text-white gap-2 shadow-md"
                style={{ backgroundColor: brandColor }}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>{isBn ? "যাচাই করা হচ্ছে..." : "Processing..."}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      {isBn
                        ? `${formatBDT(amount)} নিশ্চিত করুন`
                        : `Confirm & Pay ${formatBDT(amount)}`}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* STEP 3: PAYMENT COMPLETED & DIGITAL RECEIPT */}
        {step === "success" && receiptData && (
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md animate-bounce">
                <Check className="h-6 w-6 stroke-[3]" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {isBn
                  ? `৳${receiptData.amount} পেমেন্ট সফল হয়েছে!`
                  : `৳${receiptData.amount} Payment Successful!`}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {isBn
                  ? `${brandNameBn} থেকে টাকা পরিশোধ নিশ্চিত করা হয়েছে। আপনার ট্রানজেকশন সংরক্ষিত।`
                  : `Paid via ${brandName}. Your transaction has been recorded in the platform ledger.`}
              </p>
            </div>

            {/* Mini Voucher */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 font-medium">TrxID:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                    {receiptData.transactionId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyTrx}
                    className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                  >
                    {trxCopied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">{isBn ? "কাজের নাম" : "Job"}:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                  {serviceRequest.title}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">{isBn ? "প্রোভাইডার" : "Provider"}:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {serviceRequest.providerTitle}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">{isBn ? "পেমেন্ট মাধ্যম" : "Method"}:</span>
                <span className="font-bold uppercase" style={{ color: brandColor }}>
                  {receiptData.paymentMethod}
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
                <span>{isBn ? "রসিদ প্রিন্ট করুন" : "Print Voucher"}</span>
              </Button>

              <Button
                type="button"
                variant="gradient"
                size="sm"
                onClick={onClose}
                className="font-bold text-xs"
              >
                {isBn ? "ড্যাশবোর্ডে ফিরে যান" : "Done / Dashboard"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
