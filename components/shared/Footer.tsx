"use client";

import React from "react";
import Link from "next/link";
import { Wrench, Phone, Mail, MapPin, ShieldCheck, Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { BD_DIVISIONS } from "@/lib/bd-data";

export function Footer() {
  const { t, isBn } = useI18n();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
                <Wrench className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                {t.common.siteName}
              </span>
            </Link>

            <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-sm">
              {t.common.siteTagline}
            </p>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>+880 9612-SHEBA (74322) | 01700-000000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>support@shebabd.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Gulshan-2, Dhaka 1212, Bangladesh</span>
              </div>
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">
              {isBn ? "জনপ্রিয় সার্ভিস" : "Popular Services"}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/services?category=ac-repair" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  {isBn ? "এসি মেরামত ও সার্ভিসিং" : "AC Repair & Servicing"}
                </Link>
              </li>
              <li>
                <Link href="/services?category=electrician" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  {isBn ? "ইলেকট্রিশিয়ান সার্ভিস" : "Electrician Services"}
                </Link>
              </li>
              <li>
                <Link href="/services?category=plumber" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  {isBn ? "প্লাম্বিং ও পাইপলাইন" : "Plumbing & Pipelines"}
                </Link>
              </li>
              <li>
                <Link href="/services?category=tutor" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  {isBn ? "হোম ও অনলাইন গৃহশিক্ষক" : "Home & Online Tutors"}
                </Link>
              </li>
              <li>
                <Link href="/services?category=house-cleaning" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  {isBn ? "বাসা ও অফিস ক্লিনিং" : "House & Office Cleaning"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Bangladesh Divisions */}
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">
              {isBn ? "বিভাগ সমূহ" : "Divisions"}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {BD_DIVISIONS.map((div) => (
                <li key={div.id}>
                  <Link
                    href={`/services?division=${div.name}`}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {isBn ? div.nameBn : div.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links & For Providers */}
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">
              {isBn ? "প্রোভাইডার কর্নার" : "For Providers"}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/register?role=provider" className="hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold text-emerald-600 dark:text-emerald-400">
                  {isBn ? "সার্ভিস প্রোভাইডার হিসেবে যোগ দিন" : "Join as Service Provider"}
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                  {isBn ? "প্রোভাইডার লগইন" : "Provider Login"}
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                  {isBn ? "কাজের সুযোগ দেখুন" : "Explore Requests"}
                </Link>
              </li>
              <li className="pt-2">
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="h-4 w-4" />
                  <span>100% Verified Bangladesh Marketplace</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ShebaBD. All rights reserved. Made with <Heart className="h-3 w-3 inline text-rose-500 fill-rose-500" /> for Bangladesh.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:underline">Privacy Policy</Link>
            <Link href="/" className="hover:underline">Terms of Service</Link>
            <Link href="/" className="hover:underline">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
