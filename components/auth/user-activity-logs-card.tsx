"use client";

import React, { useState, useEffect } from "react";
import { History, Shield, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";

interface UserLogItem {
  _id: string;
  action: string;
  description: string;
  ipAddress?: string;
  status: "success" | "failure" | "warning";
  createdAt: string;
}

export function UserActivityLogsCard() {
  const { isBn } = useI18n();
  const [logs, setLogs] = useState<UserLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/audit-logs");
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Error fetching user activity logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getStatusBadge = (status: "success" | "failure" | "warning") => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            <span>Success</span>
          </span>
        );
      case "failure":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
            <XCircle className="h-3 w-3" />
            <span>Failed</span>
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            <span>Warning</span>
          </span>
        );
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center shrink-0">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {isBn ? "সিকিউরিটি অ্যাক্টিভিটি ও অডিট লগ" : "Security Activity & Audit Log"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isBn
                ? "আপনার অ্যাকাউন্টে সাম্প্রতিক লগইন, পাসওয়ার্ড পরিবর্তন ও ভেরিফিকেশন রেকর্ড"
                : "Recent authentication, password updates, and verification events for your account"}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={fetchLogs}
          className="rounded-xl text-xs"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-emerald-600" />
          <span>{isBn ? "লগ লোড হচ্ছে..." : "Loading activity log..."}</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          {isBn ? "এখনো কোনো সিকিউরিটি অ্যাক্টিভিটি রেকর্ড নেই।" : "No security activity recorded yet."}
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {logs.map((log) => (
            <div key={log._id} className="py-3 flex items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5 min-w-0">
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                  {log.description}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>
                    {new Date(log.createdAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {log.ipAddress && (
                    <>
                      <span>•</span>
                      <span className="font-mono">{log.ipAddress}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="shrink-0">{getStatusBadge(log.status)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
