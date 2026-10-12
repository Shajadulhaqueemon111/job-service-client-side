"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateBD } from "@/lib/utils";

interface ReportItem {
  _id: string;
  reporter: {
    name: string;
    email: string;
  };
  targetType: string;
  targetId: string;
  reason: string;
  details?: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      if (data.reports) setReports(data.reports);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-zinc-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Trust, Safety & Moderation Reports</h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Review reports filed against service providers, inaccurate profiles, or reviews
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
            <p className="font-semibold text-slate-800 dark:text-zinc-200">Clean Slate!</p>
            <p className="text-slate-500">No pending moderation reports right now.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Reporter</th>
                  <th className="py-3 px-4">Target Type</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {reports.map((rep) => (
                  <tr key={rep._id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {rep.reporter?.name || "Anonymous"}
                    </td>
                    <td className="py-3.5 px-4 uppercase text-slate-700 dark:text-zinc-300 font-semibold">
                      {rep.targetType}
                    </td>
                    <td className="py-3.5 px-4 text-rose-600 dark:text-rose-400 font-semibold">{rep.reason}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400 max-w-xs truncate">
                      {rep.details || "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={rep.status === "pending" ? "warning" : "default"}
                        className="text-[10px] capitalize"
                      >
                        {rep.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400">{formatDateBD(rep.createdAt)}</td>
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
