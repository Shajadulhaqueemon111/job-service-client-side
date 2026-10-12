"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CircleDollarSign,
  TrendingUp,
  Briefcase,
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  Filter,
  ArrowUpRight,
  Info,
  DollarSign,
  Calculator,
  RefreshCw,
  Percent,
  Wallet,
  CreditCard,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBDT, formatDateBD } from "@/lib/utils";

const revenueChartConfig = {
  gmv: {
    label: "Total Work Volume (৳)",
    color: "#0ea5e9", // Sky 500
  },
  profit: {
    label: "Admin Profit 10% (৳)",
    color: "#10b981", // Emerald 500
  },
} satisfies ChartConfig;

export default function AdminRevenueProfitPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [ledgerTab, setLedgerTab] = useState<"transactions" | "payouts">("transactions");

  // Commission demo calculator state
  const [calcInput, setCalcInput] = useState<number>(2500);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("period", period);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      params.set("page", page.toString());
      params.set("limit", "15");

      const res = await fetch(`/api/admin/revenue?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Error fetching revenue details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [period, statusFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRevenueData();
  };

  const metrics = data?.metrics || {
    grossMarketplaceVolume: 0,
    totalPlatformProfit: 0,
    totalProviderPayout: 0,
    totalCompletedJobs: 0,
    averageJobValue: 0,
    projectedPendingProfit: 0,
  };

  const commissionRate = data?.commissionRate || 10;
  const calculatedAdminProfit = Math.round(calcInput * (commissionRate / 100));
  const calculatedProviderShare = calcInput - calculatedAdminProfit;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Platform Revenue & Profit Accounting
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              {commissionRate}% Commission Model
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
            প্রতিটি কাজের (Work/Hire) জন্য গ্রাহকের প্রদত্ত টাকা থেকে পোর্টালের কমিশন ও লাভ (Profit) হিসাব এবং প্রোভাইডারের প্রদেয় অর্থের পূর্ণাঙ্গ বিবরণী
          </p>
        </div>

        {/* Time Period Filter */}
        <div className="flex items-center gap-2">
          {["7d", "30d", "90d", "all"].map((p) => (
            <button
              key={p}
              onClick={() => {
                setPeriod(p);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === p
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                  : "bg-slate-100 dark:bg-zinc-850 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-750"
              }`}
            >
              {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : p === "90d" ? "90 Days" : "All Time"}
            </button>
          ))}
          <Button
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={() => fetchRevenueData()}
            className="rounded-xl border-slate-200 dark:border-zinc-750 text-xs text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-850"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Admin Profit Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 dark:from-emerald-950 dark:via-zinc-900 dark:to-zinc-950 border border-emerald-500/30 shadow-md relative overflow-hidden group text-white">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 dark:bg-emerald-500/10 rounded-full blur-xl group-hover:scale-125 transition-all" />
          <div className="flex items-center justify-between text-white/90 dark:text-emerald-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              পোর্টালের মোট লাভ (Admin Profit)
            </span>
            <div className="p-2 rounded-xl bg-white/20 dark:bg-emerald-500/10 border border-white/20 dark:border-emerald-500/20 text-white dark:text-emerald-400">
              <CircleDollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono tracking-tight">
            {formatBDT(metrics.totalPlatformProfit)}
          </div>
          <p className="text-[11px] text-emerald-100/80 dark:text-emerald-300/80 font-medium mt-1">
            মোট সম্পন্ন কাজের {commissionRate}% সরাসরি অ্যাডমিনের আয়
          </p>
        </div>

        {/* Gross Work Volume (Client Paid) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              মোট কাজের ভলিউম (GMV)
            </span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20">
              <TrendingUp className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {formatBDT(metrics.grossMarketplaceVolume)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
            গ্রাহক কর্তৃক পরিশোধিত সর্বমোট টাকার অংক ({metrics.totalCompletedJobs} টি কাজ)
          </p>
        </div>

        {/* Provider Payouts */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              প্রোভাইডারদের পাওনা (90%)
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
              <Wallet className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {formatBDT(metrics.totalProviderPayout)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
            কমিশন বাদে টেকনিশিয়ানদের অর্জিত আয়
          </p>
        </div>

        {/* Average Profit per Hire & Projected Pending */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              চলমান কাজের সম্ভাব্য লাভ
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            +{formatBDT(metrics.projectedPendingProfit)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
            চলমান {metrics.pendingJobsCount} টি বুকিং সম্পন্ন হলে জমা হবে
          </p>
        </div>
      </div>

      {/* Revenue Formula & Interactive Commission Calculator */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <Calculator className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            লাভ নির্ধারণ ও কমিশন গণনার নিয়ম (Platform Profit Logic)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Formula box 1 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-750 space-y-1.5">
            <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              ১. গ্রাহকের পেমেন্ট (Job Value)
            </p>
            <p className="text-sm font-black text-slate-900 dark:text-white">গ্রাহক যা পরিশোধ করেন</p>
            <p className="text-slate-500 dark:text-zinc-400 text-[11px]">
              কাজের চুক্তি বা সমাপ্তির পর চূড়ান্ত মূল্য (Final Job Bill).
            </p>
          </div>

          {/* Formula box 2 */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
            <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              ২. আপনার প্ল্যাটফর্ম লাভ ({commissionRate}%)
            </p>
            <p className="text-sm font-black text-emerald-800 dark:text-emerald-300 font-mono">
              লাভ = মোট মূল্য × ১০%
            </p>
            <p className="text-emerald-900/70 dark:text-zinc-400 text-[11px]">
              প্রতিটি কাজ থেকে পোর্টাল স্বয়ংক্রিয়ভাবে ১০% নিট লাভ হিসেবে জমা রাখে।
            </p>
          </div>

          {/* Formula box 3 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-750 space-y-1.5">
            <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              ৩. প্রোভাইডারের আয় (৯০%)
            </p>
            <p className="text-sm font-black text-indigo-700 dark:text-indigo-300 font-mono">
              প্রদেয় = মোট মূল্য - লাভ
            </p>
            <p className="text-slate-500 dark:text-zinc-400 text-[11px]">
              কমিশন বাদে বাকি ৯০% টাকা প্রোভাইডারের ওয়ালেটে যুক্ত হয়।
            </p>
          </div>
        </div>

        {/* Live Interactive Sample Calculator */}
        <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-750 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              একটি কাজের নমুনা বিল পরীক্ষা করুন:
            </span>
            <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-1.5">
              <span className="text-xs text-slate-500 font-bold">৳</span>
              <input
                type="number"
                value={calcInput}
                onChange={(e) => setCalcInput(Math.max(0, Number(e.target.value)))}
                aria-label="Sample Job Amount"
                className="w-24 text-xs font-mono font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold">
                আপনার লাভ (১০%):
              </span>
              <span className="font-mono font-black text-emerald-700 dark:text-emerald-300 text-sm">
                {formatBDT(calculatedAdminProfit)}
              </span>
            </div>

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-zinc-700" />

            <div>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold">
                প্রোভাইডার পাবেন (৯০%):
              </span>
              <span className="font-mono font-black text-slate-800 dark:text-zinc-200 text-sm">
                {formatBDT(calculatedProviderShare)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                মাসভিত্তিক লাভ ও ভলিউম ট্রেন্ড (Volume vs Profit)
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                গত ৬ মাসে সম্পন্ন হওয়া কাজের মোট ভলিউম এবং অ্যাডমিন লাভের তুলনা
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-bold">
              ১০% মার্জিন
            </Badge>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ChartContainer config={revenueChartConfig} className="h-full w-full">
              <AreaChart
                data={data?.monthlyTrends || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="month" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  type="monotone"
                  dataKey="gmv"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorGmv)"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              ক্যাটাগরিভিত্তিক লাভ (Profit by Category)
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              কোন সেবায় সবচেয়ে বেশি লাভ অর্জিত হয়েছে
            </p>
          </div>

          <div className="space-y-3 divide-y divide-slate-100 dark:divide-zinc-800">
            {(data?.categoryBreakdown || []).slice(0, 5).map((cat: any) => (
              <div key={cat.name} className="pt-2.5 first:pt-0 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{cat.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                    {cat.jobCount} টি কাজ • মোট {formatBDT(cat.volume)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block text-sm">
                    +{formatBDT(cat.profit)}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-semibold">লাভ</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>এসি সার্ভিসিং ও প্লাম্বিং ক্যাটাগরিতে গড় মার্জিন সবচেয়ে বেশি।</span>
          </div>
        </div>
      </div>

      {/* Real-time Job-by-Job Profit Breakdown Ledger */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              প্রতিটি কাজের লাভ ও কমিশনের খতিয়ান (Hire-by-Hire Ledger)
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              প্রতিটি সম্পন্ন বা চলমান অর্ডারে গ্রাহক কে ছিলেন, কোন প্রোভাইডার হায়ার হয়েছে এবং কত টাকা লাভ হয়েছে
            </p>
          </div>

          {/* Ledger Filters */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative w-48 sm:w-64">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search job, client, provider..."
                className="pl-8 text-xs bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-xl"
              />
            </form>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter ledger by status"
              className="px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed (Paid)</option>
              <option value="accepted">Accepted (Pending)</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Ledger Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
          <button
            type="button"
            onClick={() => setLedgerTab("transactions")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              ledgerTab === "transactions"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-750"
            }`}
          >
            প্রতিটি কাজের লাভ ও কমিশন ({data?.transactions?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setLedgerTab("payouts")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              ledgerTab === "payouts"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-750"
            }`}
          >
            প্রোভাইডারদের ক্যাশআউট রেকর্ড ({data?.payouts?.length || 0})
          </button>
        </div>

        {/* Ledger Table */}
        <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-16 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <RefreshCw className="h-6 w-6 animate-spin text-emerald-500" />
              <span>Calculating job revenue breakdowns...</span>
            </div>
          ) : ledgerTab === "payouts" ? (
            (data?.payouts || []).length === 0 ? (
              <div className="p-16 text-center text-xs text-slate-500">
                কোনো প্রোভাইডার ক্যাশআউট রেকর্ড পাওয়া যায়নি।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 uppercase font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">প্রোভাইডার (Provider)</th>
                      <th className="py-3.5 px-4 text-center">উত্তোলন মাধ্যম</th>
                      <th className="py-3.5 px-4">অ্যাকাউন্ট নম্বর</th>
                      <th className="py-3.5 px-4">ট্রানজেকশন আইডি (TrxID)</th>
                      <th className="py-3.5 px-4 text-right">উত্তোলিত অংক</th>
                      <th className="py-3.5 px-4">তারিখ ও সময়</th>
                      <th className="py-3.5 px-4 text-center">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {data?.payouts?.map((payout: any) => (
                      <tr key={payout._id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 dark:text-white">{payout.provider?.businessTitle}</p>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                            {payout.provider?.name} ({payout.provider?.phone})
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black text-white ${
                              payout.paymentMethod === "bkash"
                                ? "bg-[#E2136E]"
                                : "bg-[#F7941D]"
                            }`}
                          >
                            {payout.paymentMethod?.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-zinc-200">
                          {payout.accountNumber}
                          <span className="text-[10px] font-normal text-slate-500 dark:text-zinc-400 ml-1 capitalize">
                            ({payout.accountType})
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-zinc-300">
                          {payout.transactionId}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                          {formatBDT(payout.amount)}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-zinc-400">
                          {formatDateBD(payout.processedAt)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                            PAID
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (data?.transactions || []).length === 0 ? (
            <div className="p-16 text-center text-xs text-slate-500">
              কোনো কাজের রেকর্ড পাওয়া যায়নি।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">কাজের বিবরণ (Work / Category)</th>
                    <th className="py-3.5 px-4">হায়ারকারী গ্রাহক (Customer)</th>
                    <th className="py-3.5 px-4">প্রোভাইডার (Provider)</th>
                    <th className="py-3.5 px-4 text-right">কাজের মোট বিল (Client Paid)</th>
                    <th className="py-3.5 px-4 text-center">কমিশন রেট</th>
                    <th className="py-3.5 px-4 text-right">আপনার লাভ (Admin Profit)</th>
                    <th className="py-3.5 px-4 text-right">প্রোভাইডার পাবেন (Net)</th>
                    <th className="py-3.5 px-4 text-center">পেমেন্ট (MFS)</th>
                    <th className="py-3.5 px-4 text-center">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {data?.transactions?.map((item: any) => (
                    <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                      {/* Work Details */}
                      <td className="py-3.5 px-4">
                        <div className="max-w-xs">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">{item.category}</span>
                            <span>•</span>
                            <span>{item.location}</span>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-zinc-200">{item.customer.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">{item.customer.phone}</p>
                        </div>
                      </td>

                      {/* Provider */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-zinc-200">{item.provider.businessTitle}</p>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">{item.provider.phone}</p>
                        </div>
                      </td>

                      {/* Total Job Price */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800 dark:text-zinc-200">
                        {formatBDT(item.jobAmount)}
                      </td>

                      {/* Commission Rate */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                          {item.commissionRate}%
                        </span>
                      </td>

                      {/* Admin Profit (Highlighted!) */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-extrabold text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-2 py-0.5 rounded-lg inline-block">
                          +{formatBDT(item.platformProfit)}
                        </span>
                      </td>

                      {/* Provider Share */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-zinc-400">
                        {formatBDT(item.providerShare)}
                      </td>

                      {/* MFS Payment Method & TrxID */}
                      <td className="py-3.5 px-4 text-center">
                        {item.paymentMethod === "bkash" ? (
                          <div className="flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#E2136E]/15 text-[#E2136E] border border-[#E2136E]/30">
                              bKash
                            </span>
                            {item.transactionId && (
                              <span className="font-mono text-[9px] text-slate-500 dark:text-zinc-400 mt-0.5">
                                {item.transactionId}
                              </span>
                            )}
                          </div>
                        ) : item.paymentMethod === "nagad" ? (
                          <div className="flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#F7941D]/15 text-[#F7941D] border border-[#F7941D]/30">
                              Nagad
                            </span>
                            {item.transactionId && (
                              <span className="font-mono text-[9px] text-slate-500 dark:text-zinc-400 mt-0.5">
                                {item.transactionId}
                              </span>
                            )}
                          </div>
                        ) : item.paymentStatus === "paid" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900 text-slate-400 border border-slate-800">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={
                            item.status === "completed"
                              ? "default"
                              : item.status === "accepted"
                              ? "outline"
                              : "secondary"
                          }
                          className="capitalize text-[10px] font-bold"
                        >
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {data?.pagination?.totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>
                Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} records)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="border-slate-800 text-xs"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.pagination.page >= data.pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                  className="border-slate-800 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
