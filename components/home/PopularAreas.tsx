"use client";

import React from "react";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

const POPULAR_CITIES = [
  {
    division: "Dhaka",
    divisionBn: "ঢাকা",
    image: "https://images.unsplash.com/photo-1609137144822-26a978f6730a?w=600&q=80",
    topAreas: ["Mirpur", "Dhanmondi", "Gulshan", "Uttara", "Mohammadpur", "Banani"],
    topAreasBn: ["মিরপুর", "ধানমন্ডি", "গুলশান", "উত্তরা", "মোহাম্মদপুর", "বনানী"],
    providerCount: "6,800+ Providers",
  },
  {
    division: "Chattogram",
    divisionBn: "চট্টগ্রাম",
    image: "https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?w=600&q=80",
    topAreas: ["Agrabad", "Nasirabad", "Halishahar", "Khulshi", "Panchlaish"],
    topAreasBn: ["আগ্রাবাদ", "নাসিরাবাদ", "হালিশহর", "খুলশী", "পাঁচলাইশ"],
    providerCount: "2,400+ Providers",
  },
  {
    division: "Sylhet",
    divisionBn: "সিলেট",
    image: "https://images.unsplash.com/photo-1608976328267-e673d3ec06ce?w=600&q=80",
    topAreas: ["Zindabazar", "Amberkhana", "Shahi Eidgah", "Upashahar"],
    topAreasBn: ["জিন্দাবাজার", "আম্বরখানা", "শাহী ঈদগাহ", "উপশহর"],
    providerCount: "1,200+ Providers",
  },
  {
    division: "Rajshahi",
    divisionBn: "রাজশাহী",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=80",
    topAreas: ["Saheb Bazar", "Kazla", "Boalia", "Motihar"],
    topAreasBn: ["সাহেব বাজার", "কাজলা", "বোয়ালিয়া", "মতিহার"],
    providerCount: "950+ Providers",
  },
];

export function PopularAreas() {
  const { isBn } = useI18n();

  return (
    <section className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isBn ? "জনপ্রিয় এলাকাসমূহ" : "Popular Service Hubs by Division"}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isBn
              ? "আপনার এলাকার অভিজ্ঞ টেকনিশিয়ানদের দ্রুত খুঁজে নিন"
              : "Discover verified technicians ready to serve your local neighborhood"}
          </p>
        </div>

        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 group shrink-0"
        >
          <span>{isBn ? "সকল জেলা দেখুন" : "Browse All Districts"}</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {POPULAR_CITIES.map((city) => (
          <div
            key={city.division}
            className="group rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {isBn ? city.divisionBn : city.division}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold">{city.providerCount}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {(isBn ? city.topAreasBn : city.topAreas).map((area) => (
                <Link
                  key={area}
                  href={`/services?division=${city.division}&area=${encodeURIComponent(area)}`}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 border border-slate-200/60 dark:border-slate-800/60 transition-colors"
                >
                  {area}
                </Link>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Link
                href={`/services?division=${city.division}`}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-between"
              >
                <span>{isBn ? "এই বিভাগের সকল সেবা" : `View all in ${city.division}`}</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
