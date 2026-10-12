"use client";

import React from "react";
import Link from "next/link";
import {
  Wind,
  Zap,
  Wrench,
  GraduationCap,
  Sparkles,
  Paintbrush,
  Tv,
  Hammer,
  ArrowRight,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface CategoryItem {
  name: string;
  nameBn: string;
  slug: string;
  iconName: string;
  desc: string;
  descBn: string;
  count: string;
  color: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    name: "AC Repair & Servicing",
    nameBn: "এসি মেরামত ও সার্ভিসিং",
    slug: "ac-repair",
    iconName: "Wind",
    desc: "Jet wash, gas recharge, installation",
    descBn: "জেট ওয়াশ, গ্যাস রিফিল, ইনস্টলেশন",
    count: "3,200+ Pros",
    color: "from-blue-500/20 to-cyan-500/20 text-blue-600 dark:text-blue-400",
  },
  {
    name: "Electrician",
    nameBn: "ইলেকট্রিশিয়ান সার্ভিস",
    slug: "electrician",
    iconName: "Zap",
    desc: "Wiring, circuit breaker, fan repair",
    descBn: "ওয়্যারিং, সার্কিট ব্রেকার, ফ্যান ফিটিং",
    count: "4,150+ Pros",
    color: "from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400",
  },
  {
    name: "Plumbing & Sanitary",
    nameBn: "প্লাম্বিং ও পাইপলাইন",
    slug: "plumber",
    iconName: "Wrench",
    desc: "Leakage, motor pump, bathroom fittings",
    descBn: "লিক ঠিক করা, পানির মোটর, ফিটিংস",
    count: "2,840+ Pros",
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400",
  },
  {
    name: "Home & Online Tutor",
    nameBn: "গৃহশিক্ষক ও টিউটরিং",
    slug: "tutor",
    iconName: "GraduationCap",
    desc: "SSC, HSC, English Version, Math",
    descBn: "এসএসসি, এইচএসসি, গণিত ও বিজ্ঞান",
    count: "5,300+ Tutors",
    color: "from-purple-500/20 to-indigo-500/20 text-purple-600 dark:text-purple-400",
  },
  {
    name: "House Cleaning",
    nameBn: "বাসা ও অফিস ক্লিনিং",
    slug: "house-cleaning",
    iconName: "Sparkles",
    desc: "Deep clean, sofa wash, kitchen scrub",
    descBn: "ডিপ ক্লিন, সোফা ওয়াশ, কিচেন স্ক্রাব",
    count: "1,900+ Pros",
    color: "from-rose-500/20 to-pink-500/20 text-rose-600 dark:text-rose-400",
  },
  {
    name: "Home Painting",
    nameBn: "রঙ মিস্ত্রি ও পেইন্টিং",
    slug: "home-painting",
    iconName: "Paintbrush",
    desc: "Damp proofing, plastic paint, polish",
    descBn: "ড্যাম্প প্রুফিং, আধুনিক রঙ, পালিশ",
    count: "1,450+ Pros",
    color: "from-teal-500/20 to-emerald-500/20 text-teal-600 dark:text-teal-400",
  },
  {
    name: "Appliance Repair",
    nameBn: "হোম অ্যাপ্লায়েন্স মেরামত",
    slug: "appliance-repair",
    iconName: "Tv",
    desc: "Fridge, washing machine, oven, TV",
    descBn: "ফ্রিজ, ওয়াশিং মেশিন, ওভেন, টিভি",
    count: "2,200+ Pros",
    color: "from-sky-500/20 to-blue-500/20 text-sky-600 dark:text-sky-400",
  },
  {
    name: "Carpentry & Furniture",
    nameBn: "কাঠমিস্ত্রি ও ফার্নিচার",
    slug: "carpentry",
    iconName: "Hammer",
    desc: "Door locks, custom closet, furniture fix",
    descBn: "দরজার লক, আলমারি, ফার্নিচার ফিক্সিং",
    count: "1,120+ Pros",
    color: "from-yellow-500/20 to-amber-500/20 text-yellow-600 dark:text-yellow-400",
  },
];

const iconMap: Record<string, React.ReactNode> = {
  Wind: <Wind className="h-6 w-6" />,
  Zap: <Zap className="h-6 w-6" />,
  Wrench: <Wrench className="h-6 w-6" />,
  GraduationCap: <GraduationCap className="h-6 w-6" />,
  Sparkles: <Sparkles className="h-6 w-6" />,
  Paintbrush: <Paintbrush className="h-6 w-6" />,
  Tv: <Tv className="h-6 w-6" />,
  Hammer: <Hammer className="h-6 w-6" />,
};

export function CategoryGrid() {
  const { t, isBn } = useI18n();

  return (
    <section className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.categories.title}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t.categories.subtitle}
          </p>
        </div>

        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 group shrink-0"
        >
          <span>{t.categories.viewAll}</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/services?category=${cat.slug}`}
            className="group relative p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-900 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div
                className={`h-12 w-12 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                {iconMap[cat.iconName]}
              </div>

              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                {isBn ? cat.nameBn : cat.name}
              </h3>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                {isBn ? cat.descBn : cat.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              <span>{cat.count}</span>
              <span className="text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                Explore <ArrowRight className="h-3 w-3 inline" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
