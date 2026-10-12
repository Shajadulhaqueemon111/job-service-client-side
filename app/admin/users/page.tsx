"use client";

import React, { useState, useEffect } from "react";
import { Users, Lock, Unlock, Search, ShieldAlert, CheckCircle2, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateBD, formatBDPhone } from "@/lib/utils";

interface UserItem {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "provider" | "admin";
  status: "active" | "blocked";
  twoFactorEnabled?: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Error loading users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "blocked" : "active";
    setActionLoadingId(userId);

    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error("Error updating user status", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">User Account Moderation</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            View registered customers, service providers, and suspend fraudulent or abusive accounts
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="text-xs bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-xl"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {["all", "user", "provider", "admin"].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
              roleFilter === r
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-750"
            }`}
          >
            {r}s ({users.filter((u) => (r === "all" ? true : u.role === r)).length})
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading users...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">2FA</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {filtered.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Avatar fallback={u.name} size="sm" />
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-zinc-300">{u.email}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-zinc-400">{formatBDPhone(u.phone)}</td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={u.role === "admin" ? "destructive" : u.role === "provider" ? "verified" : "secondary"}
                        className="text-[10px] uppercase font-bold"
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          u.twoFactorEnabled !== false
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700"
                        }`}
                      >
                        <ShieldCheck className="h-3 w-3" />
                        <span>{u.twoFactorEnabled !== false ? "Active" : "Disabled"}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          u.status === "active"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                        }`}
                      >
                        {u.status === "active" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <ShieldAlert className="h-3 w-3" />
                        )}
                        <span className="capitalize">{u.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400">{formatDateBD(u.createdAt)}</td>
                    <td className="py-3.5 px-4 text-right">
                      {u.role !== "admin" && (
                        <Button
                          size="sm"
                          variant={u.status === "active" ? "destructive" : "outline"}
                          disabled={actionLoadingId === u._id}
                          onClick={() => handleToggleStatus(u._id, u.status)}
                          className="text-[11px] h-7 px-3 gap-1 rounded-lg"
                        >
                          {u.status === "active" ? (
                            <>
                              <Lock className="h-3 w-3" />
                              <span>Block User</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="h-3 w-3" />
                              <span>Unblock</span>
                            </>
                          )}
                        </Button>
                      )}
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
