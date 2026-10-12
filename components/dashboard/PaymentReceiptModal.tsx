"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatBDT, formatDateBD, formatBDPhone } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import {
  CheckCircle2,
  Copy,
  Printer,
  ShieldCheck,
  Receipt,
  Check,
  Building,
  User,
  Calendar,
} from "lucide-react";

export interface PaymentReceiptData {
  requestId: string;
  jobTitle: string;
  providerTitle: string;
  customerName?: string;
  customerPhone?: string;
  paymentMethod: "bkash" | "nagad" | "cash" | string;
  transactionId: string;
  senderMfsNumber?: string;
  amount: number;
  commissionAmount?: number;
  providerEarnings?: number;
  paidAt?: string | Date;
}

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PaymentReceiptData | null;
}

export function PaymentReceiptModal({
  isOpen,
  onClose,
  data,
}: PaymentReceiptModalProps) {
  const { isBn } = useI18n();
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const isBkash = data.paymentMethod === "bkash";
  const isNagad = data.paymentMethod === "nagad";
  const brandName = isBkash ? "bKash" : isNagad ? "Nagad" : "MFS";
  const brandColor = isBkash ? "#E2136E" : isNagad ? "#F7941D" : "#10B981";

  const handleCopyTrx = () => {
    if (data.transactionId) {
      navigator.clipboard.writeText(data.transactionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const commission = data.commissionAmount || Math.round(data.amount * 0.1);
  const providerNet = data.providerEarnings || data.amount - commission;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-emerald-500" />
          <span>{isBn ? "পেমেন্ট ই-রসিদ" : "Official Payment E-Receipt"}</span>
        </div>
      }
      description={
        <span>
          {isBn
            ? "ডিজিটাল পেমেন্ট নিশ্চিতকরণ ও মানি রিসিট"
            : "Digital Payment Voucher & Transaction Confirmation"}
        </span>
      }
    >
      <div className="space-y-4 pt-1 print:p-0">
        {/* Receipt Container */}
        <div
          id="printable-receipt"
          className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm relative overflow-hidden"
        >
          {/* Top Brand Banner */}
          <div
            className="absolute top-0 left-0 right-0 h-2.5"
            style={{ backgroundColor: brandColor }}
          />

          {/* Header Seal */}
          <div className="flex items-center justify-between pb-4 border-b border-dashed border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-md"
                style={{ backgroundColor: brandColor }}
              >
                {isBkash ? "bK" : isNagad ? "NG" : "৳"}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {brandName} Payment
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400">
                    VERIFIED
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">JobService BD Marketplace</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                {isBn ? "ভাউচার নং" : "Voucher Ref"}
              </span>
              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                #{data.requestId.substring(data.requestId.length - 8).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Amount Showcase */}
          <div className="py-4 text-center border-b border-dashed border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold">
              {isBn ? "পরিশোধিত সর্বমোট অংক" : "Total Amount Paid"}
            </span>
            <div
              className="text-3xl sm:text-4xl font-black font-mono mt-0.5"
              style={{ color: brandColor }}
            >
              {formatBDT(data.amount)}
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                {isBn
                  ? `${brandName}-এর মাধ্যমে পরিশোধ নিশ্চিত`
                  : `Successfully Paid via ${brandName}`}
              </span>
            </div>
          </div>

          {/* Key-Value Details */}
          <div className="py-4 space-y-2.5 text-xs">
            {/* Transaction ID */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800">
              <span className="text-slate-400 font-medium">
                {isBn ? "ট্রানজেকশন আইডি (TrxID)" : "Transaction ID (TrxID)"}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-slate-900 dark:text-white tracking-wider text-sm">
                  {data.transactionId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyTrx}
                  title="Copy TrxID"
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Job Title */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{isBn ? "সার্ভিসের নাম" : "Service Job"}:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-right max-w-[200px] truncate">
                {data.jobTitle}
              </span>
            </div>

            {/* Provider */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Building className="h-3.5 w-3.5 text-slate-400" />
                <span>{isBn ? "সার্ভিস প্রোভাইডার" : "Service Provider"}:</span>
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {data.providerTitle}
              </span>
            </div>

            {/* Sender Wallet */}
            {data.senderMfsNumber && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">
                  {isBn ? "গ্রাহকের ওয়ালেট নম্বর" : "Sender MFS Account"}:
                </span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {formatBDPhone(data.senderMfsNumber)}
                </span>
              </div>
            )}

            {/* Date */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>{isBn ? "পরিশোধের তারিখ ও সময়" : "Payment Date & Time"}:</span>
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {formatDateBD(data.paidAt || new Date())}
              </span>
            </div>
          </div>

          {/* Breakdown Notice */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200/60 dark:border-slate-800 text-[11px] space-y-1">
            <div className="flex justify-between text-slate-500">
              <span>{isBn ? "প্রোভাইডার পাবেন (৯০%)" : "Provider Net Share (90%)"}</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {formatBDT(providerNet)}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>{isBn ? "প্ল্যাটফর্ম ফি ও সুরক্ষা (১০%)" : "Platform Fee & Guarantee (10%)"}</span>
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                {formatBDT(commission)}
              </span>
            </div>
          </div>

          {/* Footer Security Badge */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>
              {isBn
                ? "JobService BD দ্বারা ১০০% সুরক্ষিত ও অনুমোদিত রসিদ"
                : "Protected & Verified by JobService BD Digital Escrow"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs font-semibold gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>{isBn ? "প্রিন্ট বা সেভ করুন" : "Print / PDF"}</span>
          </Button>

          <Button
            type="button"
            variant="gradient"
            size="sm"
            onClick={onClose}
            className="text-xs font-bold"
          >
            {isBn ? "ঠিক আছে" : "Close"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
