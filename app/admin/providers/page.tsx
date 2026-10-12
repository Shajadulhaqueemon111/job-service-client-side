"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  ExternalLink,
  Search,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBDT, formatBDPhone } from "@/lib/utils";

interface ProviderAdminItem {
  _id: string;
  businessTitle: string;
  phone: string;
  division: string;
  district: string;
  rating: number;
  completedJobsCount: number;
  isVerified: boolean;
  verificationStatus: "pending" | "approved" | "rejected";
  priceRangeMin: number;
  priceRangeMax: number;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  category: {
    name: string;
    nameBn: string;
  };
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<ProviderAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/providers?limit=50");
      const data = await res.json();
      if (data.success) {
        setProviders(data.providers || []);
      }
    } catch (err) {
      console.error("Error loading providers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleAction = async (providerId: string, action: string, isVerified?: boolean) => {
    setActionLoadingId(providerId);
    try {
      const res = await fetch(`/api/admin/providers/${providerId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, isVerified }),
      });

      if (res.ok) {
        fetchProviders();
      }
    } catch (err) {
      console.error("Action error", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = providers.filter((p) => {
    if (statusFilter !== "all" && p.verificationStatus !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.businessTitle?.toLowerCase().includes(q) ||
        p.user?.name?.toLowerCase().includes(q) ||
        p.phone?.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Provider Verification & Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Review service provider qualifications, toggle verification badges, or suspend accounts
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search provider by name, title, or phone..."
            className="text-xs bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-xl"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {["all", "pending", "approved", "rejected"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
              statusFilter === st
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-750"
            }`}
          >
            {st} ({providers.filter((p) => (st === "all" ? true : p.verificationStatus === st)).length})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading providers...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No providers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Verified</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={p.user?.avatar} fallback={p.user?.name || "P"} size="md" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white max-w-xs truncate">{p.businessTitle}</p>
                          <span className="text-[11px] text-slate-500 dark:text-zinc-400">{p.user?.name}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-zinc-300">
                      {p.category?.name}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400">
                      {p.district}, {p.division}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-zinc-300">
                      {formatBDPhone(p.phone)}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          p.verificationStatus === "approved"
                            ? "default"
                            : p.verificationStatus === "pending"
                            ? "warning"
                            : "destructive"
                        }
                        className="text-[10px] capitalize"
                      >
                        {p.verificationStatus}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleAction(p._id, "toggleVerified", !p.isVerified)}
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer ${
                          p.isVerified
                            ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                            : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700"
                        }`}
                      >
                        <ShieldCheck className="h-3 w-3" />
                        <span>{p.isVerified ? "Verified" : "Unverified"}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {p.verificationStatus === "pending" && (
                        <>
                          <Button
                            size="sm"
                            disabled={actionLoadingId === p._id}
                            onClick={() => handleAction(p._id, "approve")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-7 px-2.5 rounded-lg"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={actionLoadingId === p._id}
                            onClick={() => handleAction(p._id, "reject")}
                            className="text-[11px] h-7 px-2.5 rounded-lg"
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      <Link href={`/providers/${p._id}`} target="_blank">
                        <Button variant="outline" size="sm" className="text-[11px] h-7 px-2 border-slate-200 dark:border-zinc-700 rounded-lg">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
