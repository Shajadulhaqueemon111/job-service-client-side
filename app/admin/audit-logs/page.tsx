"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { formatDateBD } from "@/lib/utils";

interface AuditLogItem {
  _id: string;
  userEmail: string;
  userName: string;
  userRole: "user" | "provider" | "admin" | "anonymous";
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  status: "success" | "failure" | "warning";
  details?: Record<string, unknown>;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter !== "all") params.set("action", actionFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (dateFilter) params.set("date", dateFilter);
      if (search.trim()) params.set("search", search.trim());
      params.set("page", page.toString());
      params.set("limit", "25");

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, statusFilter, dateFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "USER_LOGIN":
        return <Badge className="bg-emerald-950 text-emerald-300 border border-emerald-800">Login</Badge>;
      case "2FA_OTP_GENERATED":
        return <Badge className="bg-sky-950 text-sky-300 border border-sky-800">2FA OTP</Badge>;
      case "2FA_VERIFICATION_FAILED":
      case "LOGIN_FAILED":
        return <Badge className="bg-rose-950 text-rose-300 border border-rose-800">Auth Failed</Badge>;
      case "PASSWORD_CHANGED":
        return <Badge className="bg-amber-950 text-amber-300 border border-amber-800">Password</Badge>;
      case "PROFILE_UPDATED":
        return <Badge className="bg-indigo-950 text-indigo-300 border border-indigo-800">Profile</Badge>;
      case "USER_REGISTERED":
        return <Badge className="bg-teal-950 text-teal-300 border border-teal-800">Registered</Badge>;
      case "USER_STATUS_CHANGED":
        return <Badge className="bg-rose-950 text-rose-400 border border-rose-700">Status Change</Badge>;
      case "PAYMENT_COMPLETED":
        return <Badge className="bg-gradient-to-r from-[#E2136E]/20 to-[#F7941D]/20 text-white border border-[#E2136E]/40 font-bold">bKash/Nagad Paid</Badge>;
      case "WITHDRAWAL_COMPLETED":
        return <Badge className="bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">MFS Cashout</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const getStatusIcon = (status: "success" | "failure" | "warning") => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Success</span>
          </span>
        );
      case "failure":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400">
            <XCircle className="h-3.5 w-3.5" />
            <span>Failure</span>
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Warning</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">System Security & Audit Logs</h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              {total} events
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Track user logins, password modifications, 2FA authorizations, profile alterations, and moderation actions
          </p>
        </div>

        <Button
          onClick={() => fetchLogs()}
          variant="outline"
          size="sm"
          disabled={loading}
          className="rounded-xl border-slate-200 dark:border-zinc-700 text-xs font-bold gap-1 text-slate-700 dark:text-zinc-300 self-start sm:self-auto bg-white dark:bg-zinc-800"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email, name, description, IP..."
            className="pl-8 text-xs bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-xl"
          />
        </form>

        <div className="flex flex-wrap gap-2">
          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by action"
            className="px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 focus:outline-none"
          >
            <option value="all">All Actions</option>
            <option value="PAYMENT_COMPLETED">Payments (bKash/Nagad)</option>
            <option value="WITHDRAWAL_COMPLETED">Withdrawals (MFS Cashout)</option>
            <option value="USER_LOGIN">Logins</option>
            <option value="LOGIN_FAILED">Login Failures</option>
            <option value="2FA_OTP_GENERATED">2FA OTPs</option>
            <option value="PASSWORD_CHANGED">Password Changes</option>
            <option value="PROFILE_UPDATED">Profile Updates</option>
            <option value="USER_REGISTERED">Registrations</option>
            <option value="USER_STATUS_CHANGED">Status Changes</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by status"
            className="px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="warning">Warning</option>
          </select>

          {/* Date Filter */}
          <div className="w-44">
            <DatePicker
              value={dateFilter}
              onChange={(d) => {
                setDateFilter(d);
                setPage(1);
              }}
              placeholder="Filter by date"
              className="h-[38px] text-xs bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-rose-500" />
            <span>Loading security audit records...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
            <FileText className="h-8 w-8 text-slate-400" />
            <span>No audit logs found matching criteria.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Time</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">IP / Client</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                      {new Date(log.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>

                    {/* User */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Avatar fallback={log.userName} size="sm" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">{log.userName}</p>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">{log.userEmail}</p>
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 whitespace-nowrap">{getActionBadge(log.action)}</td>

                    {/* Description */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-zinc-200 font-medium max-w-xs sm:max-w-md truncate">
                      {log.description}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">{getStatusIcon(log.status)}</td>

                    {/* IP */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                      {log.ipAddress || "local"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 bg-slate-50/50 dark:bg-zinc-900/50">
            <span>
              Page {page} of {totalPages} ({total} total entries)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="border-slate-200 dark:border-zinc-700 text-xs rounded-lg"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="border-slate-200 dark:border-zinc-700 text-xs rounded-lg"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
