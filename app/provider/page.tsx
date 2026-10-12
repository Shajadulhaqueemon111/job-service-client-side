"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Calendar,
  MapPin,
  Star,
  Check,
  X,
  Briefcase,
  AlertCircle,
  Wallet,
  ArrowDownToLine,
  MessageSquare,
  Search,
  TrendingUp,
  Receipt,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatBDT, formatDateBD, formatBDPhone } from "@/lib/utils";
import { WithdrawModal } from "@/components/provider/WithdrawModal";
import { JobChatModal } from "@/components/chat/JobChatModal";
import { SectionCards, MetricCardItem } from "@/components/dashboard/SectionCards";
import { ChartAreaInteractive } from "@/components/dashboard/ChartAreaInteractive";
import { ChartConfig } from "@/components/ui/chart";

interface ServiceRequestItem {
  _id: string;
  title: string;
  description: string;
  division: string;
  district: string;
  address: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  estimatedBudget?: number;
  finalPrice?: number;
  status: "pending" | "accepted" | "completed" | "rejected" | "cancelled";
  providerNotes?: string;
  cancellationReason?: string;
  createdAt: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
}

const providerChartConfig = {
  requests: {
    label: "Orders & Leads",
    color: "#10b981", // Emerald 500
  },
  earnings: {
    label: "Revenue (BDT)",
    color: "#06b6d4", // Cyan 500
  },
} satisfies ChartConfig;

export default function ProviderRequestsPage() {
  const { user } = useAuth();
  const { isBn } = useI18n();

  const [requests, setRequests] = useState<ServiceRequestItem[]>([]);
  const [providerProfile, setProviderProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Complete job dialog state
  const [completingRequestId, setCompletingRequestId] = useState<string | null>(null);
  const [finalPrice, setFinalPrice] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [chatModalData, setChatModalData] = useState<{
    requestId: string;
    jobTitle: string;
    partnerName: string;
    partnerRole: "customer" | "provider";
    partnerPhone?: string;
  } | null>(null);

  const fetchProviderData = async () => {
    setLoading(true);
    try {
      const [reqRes, provRes] = await Promise.all([
        fetch("/api/requests"),
        fetch("/api/providers/me"),
      ]);

      const reqData = await reqRes.json();
      if (reqData.success) {
        setRequests(reqData.requests || []);
      }

      const provData = await provRes.json();
      if (provData.success) {
        setProviderProfile(provData.provider);
      }
    } catch (err) {
      console.error("Error loading provider data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderData();
  }, []);

  const handleUpdateStatus = async (
    requestId: string,
    newStatus: "accepted" | "rejected" | "completed",
    notes?: string,
    price?: number
  ) => {
    setActionLoading(true);
    try {
      const payload: Record<string, unknown> = { status: newStatus };
      if (notes) payload.providerNotes = notes;
      if (price) payload.finalPrice = price;

      const res = await fetch(`/api/requests/${requestId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setCompletingRequestId(null);
        setFinalPrice("");
        setCompletionNotes("");
        fetchProviderData();
      }
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === "pending"),
    [requests]
  );
  const acceptedRequests = useMemo(
    () => requests.filter((r) => r.status === "accepted"),
    [requests]
  );
  const completedRequests = useMemo(
    () => requests.filter((r) => r.status === "completed"),
    [requests]
  );

  const totalEarnings = useMemo(
    () =>
      completedRequests.reduce(
        (sum, r) => sum + (r.finalPrice || r.estimatedBudget || 0),
        0
      ),
    [completedRequests]
  );

  // Chart data computed from orders history
  const chartData = useMemo(() => {
    if (!requests || requests.length === 0) {
      const today = new Date();
      return Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (6 - i));
        return {
          date: d.toISOString().split("T")[0],
          requests: 0,
          earnings: 0,
        };
      });
    }

    const map: Record<string, { requests: number; earnings: number }> = {};
    requests.forEach((r) => {
      const d = r.createdAt ? r.createdAt.split("T")[0] : new Date().toISOString().split("T")[0];
      if (!map[d]) {
        map[d] = { requests: 0, earnings: 0 };
      }
      map[d].requests += 1;
      if (r.status === "completed") {
        map[d].earnings += (r.finalPrice || r.estimatedBudget || 0);
      }
    });

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, val]) => ({
        date,
        requests: val.requests,
        earnings: val.earnings,
      }));
  }, [requests]);

  // Section cards for Dashboard-01 Block
  const metricCards: MetricCardItem[] = useMemo(() => {
    return [
      {
        title: isBn ? "নতুন রিকোয়েস্ট" : "Pending Leads",
        value: pendingRequests.length,
        badge: {
          text: pendingRequests.length > 0 ? "Action Needed" : "All Clear",
          trend: pendingRequests.length > 0 ? "up" : "neutral",
        },
        footer: {
          trendText: `${pendingRequests.length} awaiting response`,
          trend: pendingRequests.length > 0 ? "up" : undefined,
          text: isBn ? "দ্রুত এক্সেপ্ট করে কাজ শুরু করুন" : "Respond quickly to boost rating",
        },
      },
      {
        title: isBn ? "গৃহীত (চলমান কাজ)" : "Active Jobs",
        value: acceptedRequests.length,
        badge: {
          text: "In Progress",
          trend: "up",
        },
        footer: {
          trendText: `${acceptedRequests.length} scheduled jobs`,
          text: isBn ? "গ্রাহকের লোকেশনে সার্ভিস প্রদান করুন" : "Provide high quality service",
        },
      },
      {
        title: isBn ? "সম্পন্ন কাজ" : "Completed Jobs",
        value: completedRequests.length,
        badge: {
          text: "Fulfilled",
          trend: "up",
        },
        footer: {
          trendText: formatBDT(totalEarnings),
          trend: "up",
          text: isBn ? "মোট সার্ভিস ভলিউম" : "Gross billed volume",
        },
      },
      {
        title: isBn ? "উত্তোলনযোগ্য ব্যালেন্স" : "Available Balance",
        value: formatBDT(providerProfile?.walletBalance ?? 0),
        actionNode: (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setWithdrawModalOpen(true)}
            disabled={(providerProfile?.walletBalance || 0) < 100}
            className="text-[11px] h-7 px-2.5 font-bold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          >
            <ArrowDownToLine className="h-3 w-3 mr-1" />
            <span>{isBn ? "ক্যাশআউট" : "Cashout"}</span>
          </Button>
        ),
        customFooter: (
          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-[11px] text-slate-400">
              {isBn ? "নূন্যতম ১০০৳" : "Min. ৳100 via bKash/Nagad"}
            </span>
            <Link
              href="/provider/wallet"
              className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
            >
              <span>{isBn ? "লেজার দেখুন" : "View Ledger"}</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </Link>
          </div>
        ),
      },
    ];
  }, [
    isBn,
    pendingRequests.length,
    acceptedRequests.length,
    completedRequests.length,
    totalEarnings,
    providerProfile?.walletBalance,
  ]);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesStatus =
        statusFilter === "all" ? true : r.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.user?.name.toLowerCase().includes(q) ||
        r.phone?.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [requests, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* SHADCN DASHBOARD-01: Section Cards */}
      <SectionCards cards={metricCards} />

      {/* SHADCN DASHBOARD-01: Interactive Trend Area Chart */}
      <ChartAreaInteractive
        title={isBn ? "অর্ডার ও আয় অ্যানালিটিক্স" : "Order Flow & Revenue Analytics"}
        description={
          isBn
            ? "দৈনিক বুকিং এবং সম্পন্ন কাজের মোট আয়ের পরিসংখ্যান"
            : "Daily customer order volume compared with completed job earnings"
        }
        data={chartData}
        config={providerChartConfig}
        primaryKey="requests"
        secondaryKey="earnings"
      />

      {/* SHADCN DASHBOARD-01: Modern Job Management Card */}
      <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs rounded-3xl overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-emerald-600" />
                <span>{isBn ? "কাস্টমার রিকোয়েস্ট তালিকা" : "Incoming Service Requests"}</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isBn
                  ? `মোট ${requests.length} টি সার্ভিস রিকোয়েস্ট পাওয়া গেছে`
                  : `Showing ${filteredRequests.length} of ${requests.length} total customer bookings`}
              </CardDescription>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder={isBn ? "কাস্টমার বা ঠিকানা খুঁজুন..." : "Search client, job, area..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-4">
            {[
              { label: isBn ? "সকল রিকোয়েস্ট" : "All Requests", value: "all", count: requests.length },
              {
                label: isBn ? "নতুন পেন্ডিং" : "Pending Leads",
                value: "pending",
                count: pendingRequests.length,
              },
              {
                label: isBn ? "চলমান কাজ" : "Active Jobs",
                value: "accepted",
                count: acceptedRequests.length,
              },
              {
                label: isBn ? "সম্পন্ন" : "Completed",
                value: "completed",
                count: completedRequests.length,
              },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === tab.value
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/80"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    statusFilter === tab.value
                      ? "bg-emerald-700/80 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {loading ? (
            <div className="py-16 text-center text-sm text-slate-500">
              <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2" />
              <span>Loading customer requests...</span>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-8 space-y-3">
              <Briefcase className="h-10 w-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                {isBn ? "কোনো রিকোয়েস্ট পাওয়া যায়নি" : "No Requests Found"}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isBn
                  ? "নতুন কাস্টমার রিকোয়েস্ট আসলে এখানে তাৎক্ষণিক দেখতে পাবেন।"
                  : "When customers in your service area request an appointment, they will be listed here."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((req) => (
                <div
                  key={req._id}
                  className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-2xs hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDateBD(req.createdAt)}</span>
                        </span>
                        <Badge
                          variant={
                            req.status === "pending"
                              ? "warning"
                              : req.status === "accepted"
                              ? "verified"
                              : req.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                          className="capitalize text-[11px] font-bold"
                        >
                          {req.status}
                        </Badge>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                        {req.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                        {req.description}
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-xs text-slate-400 block font-medium">Customer Budget:</span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {formatBDT(req.finalPrice || req.estimatedBudget || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800/60 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Customer:</span>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{req.user?.name}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3 text-emerald-600" />
                        <span>{formatBDPhone(req.phone || req.user?.phone)}</span>
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-medium">Appointment:</span>
                      <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-emerald-600" />
                        <span>{formatDateBD(req.preferredDate)}</span>
                      </p>
                      <p className="text-[11px] text-slate-500">{req.preferredTime}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-medium">Location:</span>
                      <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{req.address}</span>
                      </p>
                      <p className="text-[11px] text-slate-500">{req.district}, {req.division}</p>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                    {/* Live Chat with Customer */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setChatModalData({
                          requestId: req._id,
                          jobTitle: req.title,
                          partnerName: req.user?.name || "Customer",
                          partnerRole: "customer",
                          partnerPhone: req.phone || req.user?.phone,
                        })
                      }
                      className="text-xs font-bold gap-1.5 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{isBn ? "কাস্টমারের সাথে চ্যাট" : "Chat with Client"}</span>
                    </Button>

                    {req.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionLoading}
                          onClick={() => handleUpdateStatus(req._id, "rejected")}
                          className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl"
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          <span>{isBn ? "প্রত্যাখ্যান" : "Reject"}</span>
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          disabled={actionLoading}
                          onClick={() => handleUpdateStatus(req._id, "accepted")}
                          className="text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>{isBn ? "রিকোয়েস্ট গ্রহণ করুন" : "Accept Request"}</span>
                        </Button>
                      </>
                    )}

                    {req.status === "accepted" && (
                      <Button
                        variant="gradient"
                        size="sm"
                        onClick={() => {
                          setCompletingRequestId(req._id);
                          setFinalPrice(String(req.estimatedBudget || ""));
                        }}
                        className="text-xs font-bold gap-1 rounded-xl shadow-xs"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{isBn ? "কাজ সম্পন্ন চিহ্নিত করুন" : "Mark as Completed"}</span>
                      </Button>
                    )}

                    {req.status === "completed" && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Job Completed</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completion Modal */}
      {completingRequestId && (
        <Dialog
          isOpen={!!completingRequestId}
          onClose={() => setCompletingRequestId(null)}
          title={isBn ? "কাজ সম্পন্ন করুন" : "Complete Service Job"}
          description={isBn ? "চূড়ান্ত বিল ও কাজের সারসংক্ষেপ প্রদান করুন" : "Confirm final bill amount and work summary"}
          maxWidth="sm"
        >
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold mb-1">
                {isBn ? "চূড়ান্ত মূল্য (টাকা)" : "Final Price (BDT)"} *
              </label>
              <Input
                type="number"
                required
                value={finalPrice}
                onChange={(e) => setFinalPrice(e.target.value)}
                placeholder="e.g. 1500"
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">
                {isBn ? "সার্ভিস নোট" : "Work Done / Notes"}
              </label>
              <Textarea
                rows={3}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="e.g. Cleaned indoor coils, refilled 200g R410 gas."
                className="rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompletingRequestId(null)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="gradient"
                size="sm"
                disabled={actionLoading || !finalPrice}
                onClick={() =>
                  handleUpdateStatus(
                    completingRequestId,
                    "completed",
                    completionNotes,
                    parseFloat(finalPrice)
                  )
                }
                className="rounded-xl"
              >
                {actionLoading ? "Saving..." : "Confirm & Complete"}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Withdraw Modal for MFS Cashout */}
      <WithdrawModal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        availableBalance={providerProfile?.walletBalance || 0}
        defaultPhone={providerProfile?.phone}
        onSuccess={fetchProviderData}
      />

      {/* Real-time Socket.IO Chat Modal */}
      {chatModalData && user && (
        <JobChatModal
          isOpen={!!chatModalData}
          onClose={() => setChatModalData(null)}
          requestId={chatModalData.requestId}
          jobTitle={chatModalData.jobTitle}
          currentUserId={user._id}
          currentUserName={user.name}
          currentUserRole="provider"
          partnerName={chatModalData.partnerName}
          partnerRole={chatModalData.partnerRole}
          partnerPhone={chatModalData.partnerPhone}
        />
      )}
    </div>
  );
}
