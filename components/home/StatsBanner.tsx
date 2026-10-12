"use client";

import React from "react";
import { Users, Map, CheckCircle2, Award } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export function StatsBanner() {
  const { t, isBn } = useI18n();

  const stats = [
    {
      label: isBn ? "ভেরিফাইড প্রোভাইডার" : "Verified Providers",
      value: "12,500+",
      icon: <Users className="h-6 w-6 text-emerald-400" />,
    },
    {
      label: isBn ? "জেলা কভারেজ" : "Districts Covered",
      value: "64",
      icon: <Map className="h-6 w-6 text-teal-400" />,
    },
    {
      label: isBn ? "সফল কাজ সম্পন্ন" : "Completed Requests",
      value: "98,000+",
      icon: <CheckCircle2 className="h-6 w-6 text-cyan-400" />,
    },
    {
      label: isBn ? "সন্তুষ্ট গ্রাহক রেটিং" : "Customer Satisfaction",
      value: "99.2%",
      icon: <Award className="h-6 w-6 text-amber-400" />,
    },
  ];

  return (
    <section className="py-12 bg-slate-950 text-white relative z-10 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-24 bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
          {stats.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-center mb-2">{item.icon}</div>
              <div className="text-2xl sm:text-4xl font-black text-white tracking-tight">{item.value}</div>
              <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
