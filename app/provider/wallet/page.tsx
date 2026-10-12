"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  ArrowDownToLine,
  TrendingUp,
  Percent,
  CheckCircle2,
  Clock,
  Smartphone,
  Copy,
  Check,
  RefreshCw,
  Building,
  User,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBDT, formatDateBD, formatBDPhone } from "@/lib/utils";
import { WithdrawModal } from "@/components/provider/WithdrawModal";

interface EarningsItem {
  _id: string;
  title: string;
  customerName: string;
  customerPhone: string;
  category: string;
  grossAmount: number;
  commissionRate: number;
  commissionDeducted: number;
  netCredited: number;
  paymentMethod: string;
  transactionId: string;
  paidAt: string;
}

interface PayoutItem {
  _id: string;
  amount: number;
  paymentMethod: "bkash" | "nagad";
  accountNumber: string;
  accountType: string;
  status: "pending" | "approved" | "rejected";
  transactionId: string;
  processedAt: string;
  createdAt: string;
}

interface WalletData {
  balance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  pendingWithdrawal: number;
  totalGrossVolume: number;
  totalCommissionDeducted: number;
  phone: string;
  bkashNumber: string;
  nagadNumber: string;
}

export default function ProviderWalletPage() {
  const { user } = useAuth();
  const { isBn } = useI18n();

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [recentEarnings, setRecentEarnings] = useState<EarningsItem[]>([]);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"payouts" | "earnings">("payouts");
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [copiedTrx, setCopiedTrx] = useState<string | null>(null);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/provider/wallet");
      const data = await res.json();
      if (data.success) {
        setWallet(data.wallet);
        setRecentEarnings(data.recentEarnings || []);
        setPayouts(data.payouts || []);
      }
    } catch (err) {
      console.error("Failed to load provider wallet:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleCopyTrx = (trx: string) => {
    navigator.clipboard.writeText(trx);
    setCopiedTrx(trx);
    setTimeout(() => setCopiedTrx(null), 2000);
  };

  const balance = wallet?.balance || 0;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {isBn ? "মাই ওয়ালেট ও উপার্জন হিসাব" : "Earnings & Payout Wallet"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {isBn
                  ? "কাজের নিট উপার্জন ও সরাসরি বিকাশ বা নগদে টাকা উত্তোলনের হিসাব"
                  : "View net job earnings, automated platform deductions, and cash out via bKash & Nagad"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchWallet}
            disabled={loading}
            className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{isBn ? "রিফ্রেশ" : "Refresh"}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setWithdrawModalOpen(true)}
            disabled={balance < 100}
            className="font-bold text-xs bg-gradient-to-r from-[#E2136E] to-[#F7941D] hover:opacity-95 text-white gap-2 shadow-md shadow-pink-500/20"
          >
            <ArrowDownToLine className="h-4 w-4" />
            <span>
              {isBn ? "বিকাশ/নগদে টাকা তুলুন" : "Withdraw to bKash / Nagad"}
            </span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                {isBn ? "উত্তোলনযোগ্য ব্যালেন্স" : "Available Balance"}
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Wallet className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
              {formatBDT(balance)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {isBn
                ? "বিকাশ বা নগদে তোলার জন্য প্রস্তুত"
                : "Ready to cash out instantly"}
            </p>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>{isBn ? "১০০% নিরাপদ ওয়ালেট" : "Verified Escrow"}</span>
            </span>
            <button
              type="button"
              onClick={() => setWithdrawModalOpen(true)}
              disabled={balance < 100}
              className="text-xs font-bold text-white hover:text-emerald-300 underline disabled:opacity-50"
            >
              {isBn ? "উত্তোলন করুন →" : "Cashout →"}
            </button>
          </div>
        </div>

        {/* Total Net Earned */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                {isBn ? "মোট নিট উপার্জন" : "Total Net Earned"}
              </span>
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800">
                <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {formatBDT(wallet?.totalEarnings || 0)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {isBn
                ? "কমিশন বাদে মোট অর্জিত আয়"
                : "Cumulative 90% job payouts"}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
            {recentEarnings.length} {isBn ? "টি কাজ সম্পন্ন হয়েছে" : "completed jobs"}
          </div>
        </div>

        {/* Platform Fees Automatically Deducted */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                {isBn ? "প্ল্যাটফর্ম ফি অটো কর্তন" : "Portal 10% Auto Cut"}
              </span>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
                <Percent className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
              {formatBDT(wallet?.totalCommissionDeducted || 0)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {isBn
                ? "গ্রাহক পেমেন্টের সাথে সাথে কর্তিত ফি"
                : "Automatically deducted on client payment"}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-600 font-semibold">
            ✓ {isBn ? "কোনো লুকায়িত খরচ নেই" : "No hidden maintenance fees"}
          </div>
        </div>

        {/* Total Cashed Out via MFS */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                {isBn ? "মোট উত্তোলিত টাকা" : "Total Withdrawn"}
              </span>
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800">
                <Smartphone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="text-3xl font-black text-purple-600 dark:text-purple-400 font-mono tracking-tight">
              {formatBDT(wallet?.totalWithdrawn || 0)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {isBn
                ? "বিকাশ ও নগদ অ্যাকাউন্টে স্থানান্তরিত"
                : "Transferred to your bKash & Nagad"}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
            {payouts.length} {isBn ? "বার সফল ক্যাশআউট" : "payout requests"}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("payouts")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "payouts"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          {isBn ? "উত্তোলনের রেকর্ড (Withdrawals)" : "Withdrawal History"} ({payouts.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("earnings")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "earnings"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          {isBn ? "কাজের আয় ও কমিশন (Job Income)" : "Job Earnings Breakdown"} ({recentEarnings.length})
        </button>
      </div>

      {/* TAB 1: PAYOUTS / WITHDRAWALS */}
      {activeTab === "payouts" && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-16 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <RefreshCw className="h-6 w-6 animate-spin text-emerald-500" />
              <span>Loading payout history...</span>
            </div>
          ) : payouts.length === 0 ? (
            <div className="p-16 text-center text-xs text-slate-500 space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <ArrowDownToLine className="h-6 w-6" />
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {isBn ? "এখনও কোনো টাকা তোলা হয়নি।" : "No cashouts requested yet."}
              </p>
              <p className="text-slate-400 max-w-sm mx-auto">
                {isBn
                  ? "আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স থাকলে উপরের 'বিকাশ/নগদে টাকা তুলুন' বাটনে ক্লিক করে টাকা ক্যাশআউট করুন।"
                  : "When your available balance is ৳100 or more, use the withdraw button to cash out via bKash or Nagad."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">{isBn ? "তারিখ ও সময়" : "Date & Time"}</th>
                    <th className="py-3.5 px-4 text-center">{isBn ? "মাধ্যম" : "Method"}</th>
                    <th className="py-3.5 px-4">{isBn ? "অ্যাকাউন্ট নম্বর" : "Account Number"}</th>
                    <th className="py-3.5 px-4">{isBn ? "ট্রানজেকশন আইডি (TrxID)" : "TrxID"}</th>
                    <th className="py-3.5 px-4 text-right">{isBn ? "টাকার পরিমাণ" : "Amount"}</th>
                    <th className="py-3.5 px-4 text-center">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {payouts.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {formatDateBD(item.processedAt || item.createdAt)}
                      </td>

                      {/* Method Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black text-white ${
                            item.paymentMethod === "bkash"
                              ? "bg-[#E2136E]"
                              : "bg-[#F7941D]"
                          }`}
                        >
                          {item.paymentMethod.toUpperCase()}
                        </span>
                      </td>

                      {/* Account Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {formatBDPhone(item.accountNumber)}
                        <span className="text-[10px] font-normal text-slate-400 ml-1.5 capitalize">
                          ({item.accountType})
                        </span>
                      </td>

                      {/* TrxID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {item.transactionId}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyTrx(item.transactionId)}
                            title="Copy TrxID"
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"
                          >
                            {copiedTrx === item.transactionId ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {formatBDT(item.amount)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <Badge variant="verified" className="text-[10px] font-bold">
                          {item.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: JOB INCOME BREAKDOWN */}
      {activeTab === "earnings" && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          {recentEarnings.length === 0 ? (
            <div className="p-16 text-center text-xs text-slate-500">
              {isBn ? "কোনো কাজের পেমেন্ট রেকর্ড পাওয়া যায়নি।" : "No paid job earnings found."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">{isBn ? "কাজের শিরোনাম ও গ্রাহক" : "Job Title & Customer"}</th>
                    <th className="py-3.5 px-4 text-right">{isBn ? "গ্রাহক দিয়েছেন (মোট)" : "Gross Bill"}</th>
                    <th className="py-3.5 px-4 text-center">{isBn ? "কমিশন রেট" : "Rate"}</th>
                    <th className="py-3.5 px-4 text-right text-rose-500">{isBn ? "প্ল্যাটফর্ম ফি (অটো কর্তন)" : "Platform Cut"}</th>
                    <th className="py-3.5 px-4 text-right text-emerald-600">{isBn ? "আপনার নিট আয়" : "Your Net Earnings"}</th>
                    <th className="py-3.5 px-4 text-center">{isBn ? "পেমেন্ট মাধ্যম" : "MFS Method"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {recentEarnings.map((job) => (
                    <tr key={job._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Job details */}
                      <td className="py-3.5 px-4">
                        <div className="max-w-xs">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {job.title}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Customer: {job.customerName} ({formatBDPhone(job.customerPhone)})
                          </p>
                        </div>
                      </td>

                      {/* Gross Amount */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                        {formatBDT(job.grossAmount)}
                      </td>

                      {/* Commission Rate */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {job.commissionRate}%
                        </span>
                      </td>

                      {/* Platform Fee Auto Deducted */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-500">
                        -{formatBDT(job.commissionDeducted)}
                      </td>

                      {/* Provider Net Earnings Credited */}
                      <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        +{formatBDT(job.netCredited)}
                      </td>

                      {/* Payment Method & Trx */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black text-white ${
                              job.paymentMethod === "bkash"
                                ? "bg-[#E2136E]"
                                : job.paymentMethod === "nagad"
                                ? "bg-[#F7941D]"
                                : "bg-slate-600"
                            }`}
                          >
                            {job.paymentMethod.toUpperCase()}
                          </span>
                          {job.transactionId && (
                            <span className="font-mono text-[9px] text-slate-400 mt-0.5">
                              {job.transactionId}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        availableBalance={balance}
        defaultPhone={wallet?.phone}
        onSuccess={fetchWallet}
      />
    </div>
  );
}
