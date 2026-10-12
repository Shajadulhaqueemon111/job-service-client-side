"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, MapPin, ArrowRight, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { RatingStars } from "@/components/shared/RatingStars";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/utils";

// Fallback top providers display for instant SSR/client render
const FEATURED_PROVIDERS = [
  {
    id: "rafiq-ac",
    name: "Rafiqul Islam",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80",
    businessTitle: "Master AC Cool & Engineering Services",
    category: "AC Repair & Servicing",
    categoryBn: "এসি মেরামত ও সার্ভিসিং",
    location: "Mirpur-10, Dhaka",
    rating: 4.9,
    reviewCount: 38,
    jobsCompleted: 142,
    startingPrice: 600,
    skills: ["Jet Wash", "Inverter AC", "Gas Refill", "Leak Fix"],
    verified: true,
  },
  {
    id: "kamal-electric",
    name: "Kamal Hossain",
    avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=300&q=80",
    businessTitle: "Quick Fix Electrical Solutions Dhaka",
    category: "Electrician",
    categoryBn: "ইলেকট্রিশিয়ান সার্ভিস",
    location: "Dhanmondi, Dhaka",
    rating: 4.8,
    reviewCount: 29,
    jobsCompleted: 98,
    startingPrice: 400,
    skills: ["Wiring", "Short Circuit", "DB Box", "IPS Repair"],
    verified: true,
  },
  {
    id: "jahangir-plumbing",
    name: "Jahangir Alam",
    avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=300&q=80",
    businessTitle: "Dhaka Plumbing & Sanitary Pro Care",
    category: "Plumbing & Sanitary",
    categoryBn: "প্লাম্বিং ও পাইপলাইন",
    location: "Gulshan, Dhaka",
    rating: 4.9,
    reviewCount: 52,
    jobsCompleted: 210,
    startingPrice: 500,
    skills: ["Leak Detection", "Geyser Pipeline", "Motor Pump"],
    verified: true,
  },
  {
    id: "tanvir-tutor",
    name: "Engr. Tanvir Ahmed",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80",
    businessTitle: "EduCare Science & Mathematics Tuition",
    category: "Home & Online Tutor",
    categoryBn: "গৃহশিক্ষক ও টিউটরিং",
    location: "Uttara, Dhaka",
    rating: 5.0,
    reviewCount: 18,
    jobsCompleted: 65,
    startingPrice: 3500,
    skills: ["HSC Physics", "SSC Math", "English Version"],
    verified: true,
  },
];

export function TopProviders() {
  const { t, isBn } = useI18n();

  return (
    <section className="py-12 md:py-16 bg-slate-50/50 dark:bg-slate-900/30 border-y border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
              <ShieldCheck className="h-4 w-4" />
              <span>{isBn ? "বিশ্বস্ত প্রফেশনালস" : "Verified Experts"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.topProviders.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t.topProviders.subtitle}
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 group shrink-0"
          >
            <span>{t.topProviders.viewAll}</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_PROVIDERS.map((provider) => (
            <div
              key={provider.id}
              className="group rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header: Avatar, Name & Verified Badge */}
                <div className="flex items-start gap-3">
                  <Avatar src={provider.avatar} fallback={provider.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {provider.name}
                      </h4>
                      {provider.verified && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      )}
                    </div>
                    <Badge variant="secondary" className="text-[10px] mt-1 py-0 px-2 font-medium">
                      {isBn ? provider.categoryBn : provider.category}
                    </Badge>
                  </div>
                </div>

                {/* Business Title */}
                <h3 className="mt-4 font-bold text-sm text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {provider.businessTitle}
                </h3>

                {/* Rating & Reviews */}
                <div className="mt-3 flex items-center justify-between">
                  <RatingStars
                    rating={provider.rating}
                    size="sm"
                    showScore
                    reviewCount={provider.reviewCount}
                  />
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    {provider.jobsCompleted} {isBn ? "কাজ সম্পন্ন" : "jobs"}
                  </span>
                </div>

                {/* Location */}
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{provider.location}</span>
                </div>

                {/* Skills tags */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {provider.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price and CTA */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">{isBn ? "শুরু" : "Starting from"}</span>
                  <span className="font-extrabold text-base text-slate-900 dark:text-white">
                    {formatBDT(provider.startingPrice)}
                  </span>
                </div>

                <Link href={`/services`}>
                  <Button size="sm" variant="gradient" className="rounded-xl text-xs font-bold px-3 py-1.5">
                    {t.common.viewDetails}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
