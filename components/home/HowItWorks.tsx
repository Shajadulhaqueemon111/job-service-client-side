"use client";

import React from "react";
import { Search, CalendarCheck, Sparkles, CheckCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export function HowItWorks() {
  const { t, isBn } = useI18n();

  const steps = [
    {
      num: "01",
      title: t.howItWorks.step1Title,
      desc: t.howItWorks.step1Desc,
      icon: <Search className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
      color: "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800",
    },
    {
      num: "02",
      title: t.howItWorks.step2Title,
      desc: t.howItWorks.step2Desc,
      icon: <CalendarCheck className="h-6 w-6 text-teal-600 dark:text-teal-400" />,
      color: "bg-teal-100 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800",
    },
    {
      num: "03",
      title: t.howItWorks.step3Title,
      desc: t.howItWorks.step3Desc,
      icon: <Sparkles className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />,
      color: "bg-cyan-100 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>{isBn ? "সহজ ও নির্ভরযোগ্য প্রক্রিয়া" : "Simple 3-Step Process"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.howItWorks.title}
          </h2>
          <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
            {t.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step) => (
            <div
              key={step.num}
              className="relative p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={`h-14 w-14 rounded-2xl border flex items-center justify-center ${step.color}`}>
                    {step.icon}
                  </div>
                  <span className="text-3xl font-black text-slate-200 dark:text-slate-800">
                    {step.num}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
