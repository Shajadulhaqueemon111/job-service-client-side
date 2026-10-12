"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  CircleDollarSign,
  Search,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDateBD, formatBDT } from "@/lib/utils";
import { SectionCards, DashboardMetricCard } from "@/components/dashboard-01/section-cards";

const trendChartConfig = {
  requests: {
    label: "Total Requests",
    color: "#10b981", // Emerald 500
  },
  completed: {
    label: "Completed Jobs",
    color: "#06b6d4", // Cyan 500
  },
} satisfies ChartConfig;

const categoryChartConfig = {
  count: {
    label: "Requests",
    color: "#6366f1", // Indigo 500
  },
} satisfies ChartConfig;

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          setMonthlyTrends(data.monthlyTrends || []);
          setCategoryDistribution(data.categoryDistribution || []);
          setRecentRequests(data.recentRequests || []);
        }
      } catch (err) {
        console.error("Error loading admin stats", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const metricCards: DashboardMetricCard[] = useMemo(() => {
    return [
      {
        title: "Total Customers",
        value: stats?.totalUsers || 0,
        badge: {
          text: "+18% this month",
          trend: "up",
        },
        footer: {
          trendText: "Active client base",
          trend: "up",
          subtext: "Registered consumers across Bangladesh",
        },
      },
      {
        title: "Active Providers",
        value: stats?.totalProviders || 0,
        badge: {
          text: "64 Districts",
          trend: "up",
        },
        footer: {
          trendText: "Verified technicians",
          trend: "up",
          subtext: "Electrical, plumbing, appliance repair",
        },
      },
      {
        title: "Pending Approvals",
        value: stats?.pendingProviders || 0,
        badge: {
          text: (stats?.pendingProviders || 0) > 0 ? "Needs Review" : "All Verified",
          trend: (stats?.pendingProviders || 0) > 0 ? "down" : "neutral",
        },
        footer: {
          trendText: `${stats?.pendingProviders || 0} applications queue`,
          subtext: "NID & Trade license verifications",
        },
      },
      {
        title: "Platform Profit",
        value: formatBDT(stats?.totalPlatformProfit || 0),
        badge: {
          text: "10% Commission",
          trend: "up",
        },
        footer: {
          trendText: `Gross GMV: ${formatBDT(stats?.totalGrossVolume || 0)}`,
          trend: "up",
          subtext: "Earned from fulfilled service bookings",
        },
      },
    ];
  }, [stats]);

  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return recentRequests;
    const q = searchQuery.toLowerCase();
    return recentRequests.filter(
      (r) =>
        r.title?.toLowerCase().includes(q) ||
        r.user?.name?.toLowerCase().includes(q) ||
        r.provider?.businessTitle?.toLowerCase().includes(q) ||
        r.status?.toLowerCase().includes(q)
    );
  }, [recentRequests, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Platform Profit Highlight Banner - Theme Aware */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 dark:from-emerald-950 dark:via-zinc-900 dark:to-zinc-950 text-white border border-emerald-500/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-white/20 dark:bg-emerald-500/20 text-white dark:text-emerald-400 border border-white/20 dark:border-emerald-500/30 flex items-center justify-center shrink-0 shadow-xs">
            <CircleDollarSign className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 dark:text-emerald-400">
                পোর্টালের মোট লাভ (Platform Net Profit - 10%)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 dark:bg-emerald-500/20 text-white dark:text-emerald-300">
                কমিশন মডেল
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-0.5">
              {formatBDT(stats?.totalPlatformProfit || 0)}
            </div>
            <p className="text-[11px] text-emerald-100/80 dark:text-zinc-400 mt-0.5">
              মোট কাজের ভলিউম: <span className="text-white font-mono font-bold">{formatBDT(stats?.totalGrossVolume || 0)}</span> (সম্পন্ন হওয়া সার্ভিস বুকিং থেকে অর্জিত)
            </p>
          </div>
        </div>

        <Link href="/admin/revenue">
          <Button variant="outline" size="sm" className="rounded-xl border-white/30 dark:border-emerald-700 bg-white/10 hover:bg-white/20 text-white dark:text-emerald-300 dark:hover:bg-emerald-950 text-xs font-bold gap-1.5 self-start sm:self-auto shadow-xs">
            <span>লাভের বিস্তারিত খতিয়ান দেখুন</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* SHADCN DASHBOARD-01: Section Cards */}
      <SectionCards cards={metricCards} />

      {/* SHADCN DASHBOARD-01: Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Growth Area Chart (2 Columns) */}
        <Card className="lg:col-span-2 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 text-slate-900 dark:text-zinc-100 shadow-xs rounded-2xl overflow-hidden">
          <CardHeader className="p-6 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800/80">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                <span>Service Requests & Completion Trend</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Monthly request volume compared with successfully completed jobs
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs py-1 px-3 self-start sm:self-auto gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 rounded-xl">
              <Calendar className="h-3 w-3" />
              <span>Last 6 Months</span>
            </Badge>
          </CardHeader>

          <CardContent className="p-6 pt-4">
            <ChartContainer config={trendChartConfig} className="h-[280px] w-full">
              <AreaChart
                data={monthlyTrends}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  dataKey="requests"
                  type="monotone"
                  fill="url(#fillRequests)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                />
                <Area
                  dataKey="completed"
                  type="monotone"
                  fill="url(#fillCompleted)"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown Bar Chart (1 Column) */}
        <Card className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 text-slate-900 dark:text-zinc-100 shadow-xs rounded-2xl overflow-hidden flex flex-col justify-between">
          <CardHeader className="p-6 pb-2 border-b border-slate-100 dark:border-zinc-800/80">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                <span>Demand by Category</span>
              </CardTitle>
              <Layers className="h-4 w-4 text-slate-400" />
            </div>
            <CardDescription className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Top requested categories in Dhaka & divisions
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 pt-4">
            <ChartContainer config={categoryChartConfig} className="h-[250px] w-full">
              <BarChart
                data={categoryDistribution}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="category"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                  width={80}
                  className="text-[11px] font-medium"
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideIndicator />}
                />
                <Bar
                  dataKey="count"
                  fill="#6366f1"
                  radius={[0, 8, 8, 0]}
                  barSize={18}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>

          <div className="p-4 px-6 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-500 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-900/50">
            <span>Highest demand: <b>AC Repair</b></span>
            <Link href="/admin/categories" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1">
              <span>View all categories</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>
      </div>

      {/* SHADCN DASHBOARD-01: Recent Platform Service Requests */}
      <Card className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 text-slate-900 dark:text-zinc-100 shadow-xs rounded-2xl overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                <span>Recent Platform Service Requests</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Total requests across the system: {stats?.totalRequests || 0}
              </CardDescription>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search requests, users, providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No service requests match your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Service</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Provider</th>
                    <th className="py-3.5 px-4">Budget</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {filteredRequests.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                        {r.title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-zinc-300 font-medium">
                        {r.user?.name || "Customer"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-zinc-300">
                        {r.provider?.businessTitle || "Unassigned"}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {formatBDT(r.finalPrice || r.estimatedBudget || 0)}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            r.status === "completed"
                              ? "default"
                              : r.status === "accepted"
                              ? "verified"
                              : r.status === "pending"
                              ? "warning"
                              : "secondary"
                          }
                          className="text-[10px] capitalize font-bold rounded-lg"
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                        {formatDateBD(r.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
