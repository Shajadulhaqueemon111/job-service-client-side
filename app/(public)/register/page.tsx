"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Wrench, User, Briefcase, Mail, Lock, Phone, MapPin, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { BD_DIVISIONS } from "@/lib/bd-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "provider" ? "provider" : "user";
  const { refreshUser } = useAuth();
  const { t, isBn } = useI18n();

  const [role, setRole] = useState<"user" | "provider">(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Provider specific fields
  const [businessTitle, setBusinessTitle] = useState("");
  const [category, setCategory] = useState("");
  const [division, setDivision] = useState("Dhaka");
  const [district, setDistrict] = useState("Dhaka");

  const [categories, setCategories] = useState<{ _id: string; name: string; nameBn: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0) {
            setCategory(data.categories[0]._id);
          }
        }
      })
      .catch((err) => console.error("Error loading categories", err));
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate BD phone format client-side first
    const bdRegex = /^(?:\+88)?(01[3-9]\d{8})$/;
    if (!bdRegex.test(phone)) {
      setError(
        isBn
          ? "সঠিক বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)"
          : "Please enter a valid 11-digit Bangladesh phone number (01XXXXXXXXX)"
      );
      setLoading(false);
      return;
    }

    try {
      const payload: Record<string, unknown> = {
        name,
        email,
        phone,
        password,
        role,
      };

      if (role === "provider") {
        payload.businessTitle = businessTitle || `${name}'s Services`;
        payload.category = category;
        payload.division = division;
        payload.district = district;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      await refreshUser();

      if (role === "provider") {
        router.push("/provider");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
              <Wrench className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
              {t.common.siteName}
            </span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {isBn ? "নতুন অ্যাকাউন্ট তৈরি করুন" : "Create an Account"}
          </h1>
          <p className="text-xs text-slate-500">
            {isBn
              ? "কয়েক মিনিটেই যোগ দিন বাংলাদেশের সর্ববৃহৎ লোকাল সার্ভিস প্ল্যাটফর্মে"
              : "Join Bangladesh's premier marketplace for local on-demand services"}
          </p>
        </div>

        {/* Tab switch for User vs Provider */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setRole("user")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              role === "user"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <User className="h-4 w-4" />
            <span>{isBn ? "গ্রাহক / কাস্টমার" : "Customer / Client"}</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("provider")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              role === "provider"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>{isBn ? "সার্ভিস প্রোভাইডার" : "Service Specialist"}</span>
          </button>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/90 p-6 sm:p-8 shadow-xl backdrop-blur-sm space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span>{isBn ? "আপনার পুরো নাম" : "Full Name"} *</span>
              </label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Md. Shakil Ahmed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{t.common.email} *</span>
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{t.common.phone} (01XXXXXXXXX) *</span>
                </label>
                <Input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01712345678"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Lock className="h-3.5 w-3.5" />
                <span>Password (min. 6 characters) *</span>
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {/* Provider specific inputs */}
            {role === "provider" && (
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-3">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                  {isBn ? "প্রোভাইডার প্রোফাইল তথ্য" : "Specialist Profile Details"}
                </span>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    {isBn ? "ব্যবসা / সার্ভিসের নাম" : "Business Title / Shop Name"}
                  </label>
                  <Input
                    value={businessTitle}
                    onChange={(e) => setBusinessTitle(e.target.value)}
                    placeholder="e.g. Master AC Cool & Servicing"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    {isBn ? "সার্ভিস ক্যাটাগরি" : "Primary Category"} *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {isBn ? c.nameBn : c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold mb-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{t.common.division}</span>
                    </label>
                    <select
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 focus:outline-none"
                    >
                      {BD_DIVISIONS.map((d) => (
                        <option key={d.id} value={d.name}>
                          {isBn ? d.nameBn : d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">
                      {t.common.district}
                    </label>
                    <Input
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Dhaka or Chattogram"
                    />
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="gradient"
              disabled={loading}
              className="w-full py-2.5 font-bold rounded-xl gap-2 mt-2"
            >
              <span>{loading ? t.common.loading : t.common.register}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            {isBn ? "ইতিমধ্যে অ্যাকাউন্ট আছে?" : "Already have an account?"}{" "}
            <Link href="/login" className="font-bold text-emerald-600 hover:underline">
              {t.common.login}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading registration...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
