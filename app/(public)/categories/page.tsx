import React from "react";
import Link from "next/link";
import { Wrench, ArrowRight, ShieldCheck } from "lucide-react";
import { CategoryGrid } from "@/components/home/CategoryGrid";

export const metadata = {
  title: "Service Categories - ShebaBD",
  description: "Browse all on-demand service categories available in Bangladesh.",
};

export default function CategoriesPage() {
  return (
    <div className="py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Professional Local Services</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Explore Service Categories
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
          From emergency plumbing and AC repair to home tutoring and cleaning, find vetted professionals ready to help.
        </p>
      </div>

      <CategoryGrid />
    </div>
  );
}
