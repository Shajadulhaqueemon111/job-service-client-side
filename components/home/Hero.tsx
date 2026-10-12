"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  ArrowRight,
  ShieldCheck,
  SlidersHorizontal,
  ChevronDown,
  X,
  Flame,
  Check,
  Sparkles,
  Wind,
  Zap,
  Wrench,
  GraduationCap,
  Paintbrush,
  Tv,
  Hammer,
  Clock,
  BadgePercent,
  Star,
  Building2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { BD_DIVISIONS } from "@/lib/bd-data";
import { Button } from "@/components/ui/button";

interface CategoryItem {
  _id: string;
  name: string;
  nameBn: string;
  slug: string;
  icon?: string;
  isPopular?: boolean;
}

// Icon mapper for categories
const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  "ac-repair": <Wind className="h-4 w-4 text-cyan-500" />,
  electrician: <Zap className="h-4 w-4 text-amber-500" />,
  plumber: <Wrench className="h-4 w-4 text-emerald-500" />,
  tutor: <GraduationCap className="h-4 w-4 text-indigo-500" />,
  "house-cleaning": <Sparkles className="h-4 w-4 text-pink-500" />,
  "home-painting": <Paintbrush className="h-4 w-4 text-purple-500" />,
  "appliance-repair": <Tv className="h-4 w-4 text-rose-500" />,
  carpentry: <Hammer className="h-4 w-4 text-orange-500" />,
};

// Default fallback categories for instant render
const DEFAULT_CATEGORIES: CategoryItem[] = [
  { _id: "1", name: "AC Repair & Servicing", nameBn: "এসি মেরামত ও সার্ভিসিং", slug: "ac-repair", isPopular: true },
  { _id: "2", name: "Electrician", nameBn: "ইলেকট্রিশিয়ান সার্ভিস", slug: "electrician", isPopular: true },
  { _id: "3", name: "Plumbing & Sanitary", nameBn: "প্লাম্বিং ও পাইপলাইন", slug: "plumber", isPopular: true },
  { _id: "4", name: "Home & Online Tutor", nameBn: "গৃহশিক্ষক ও টিউটরিং", slug: "tutor", isPopular: true },
  { _id: "5", name: "House Cleaning & Maid", nameBn: "বাসা ও অফিস ক্লিনিং", slug: "house-cleaning", isPopular: true },
  { _id: "6", name: "Home Painting & Polish", nameBn: "রঙ মিস্ত্রি ও পেইন্টিং", slug: "home-painting", isPopular: true },
  { _id: "7", name: "Appliance Repair", nameBn: "হোম অ্যাপ্লায়েন্স মেরামত", slug: "appliance-repair", isPopular: true },
  { _id: "8", name: "Carpentry & Furniture", nameBn: "কাঠমিস্ত্রি ও ফার্নিচার", slug: "carpentry", isPopular: false },
];

// Trending service search suggestions in Bangladesh
const TRENDING_SEARCHES = [
  { en: "AC Jet Wash & Gas Refill", bn: "এসি জেট ওয়াশ ও গ্যাস রিফিল", category: "ac-repair" },
  { en: "Short Circuit & Electric Wiring", bn: "শর্ট সার্কিট ও ওয়্যারিং সমাধান", category: "electrician" },
  { en: "Bathroom Leakage & Basin Plumbing", bn: "বাথরুম পাইপ লিকেজ ও ফিটিংস", category: "plumber" },
  { en: "HSC & SSC Science Home Tutor", bn: "এসএসসি ও এইচএসসি বিজ্ঞান শিক্ষক", category: "tutor" },
  { en: "Deep Home & Sofa Shampoo Cleaning", bn: "বাসা ডিপ ক্লিনিং ও সোফা ওয়াশ", category: "house-cleaning" },
  { en: "Wall Damp Proofing & Plastic Paint", bn: "দেয়ালে আধুনিক রঙ ও ড্যাম্প প্রুফ", category: "home-painting" },
  { en: "Refrigerator & Microwave Oven Repair", bn: "ফ্রিজ ও ওভেন মেরামত", category: "appliance-repair" },
];

export function Hero() {
  const { t, isBn } = useI18n();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [division, setDivision] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);

  // Popover controls
  const [searchFocused, setSearchFocused] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  // Search filter inside location popover
  const [locationQuery, setLocationQuery] = useState("");

  const searchBoxRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  // Fetch live categories from API
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchBoxRef.current && !searchBoxRef.current.contains(target)) {
        setSearchFocused(false);
      }
      if (locationRef.current && !locationRef.current.contains(target)) {
        setLocationOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(target)) {
        setCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchFocused(false);
    setLocationOpen(false);
    setCategoryOpen(false);

    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set("search", searchTerm.trim());
    if (division) params.set("division", division);
    if (category) params.set("category", category);
    router.push(`/services?${params.toString()}`);
  };

  const handleTagClick = (tag: string) => {
    router.push(`/services?search=${encodeURIComponent(tag)}`);
  };

  const selectTrendingSearch = (item: (typeof TRENDING_SEARCHES)[0]) => {
    setSearchTerm(isBn ? item.bn : item.en);
    if (item.category) setCategory(item.category);
    setSearchFocused(false);
    const params = new URLSearchParams();
    params.set("search", isBn ? item.bn : item.en);
    if (item.category) params.set("category", item.category);
    if (division) params.set("division", division);
    router.push(`/services?${params.toString()}`);
  };

  // Filtered categories based on user input
  const filteredSuggestions = searchTerm.trim()
    ? categories.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.nameBn.includes(searchTerm) ||
          c.slug.includes(searchTerm.toLowerCase())
      )
    : [];

  // Filtered divisions in location popup
  const filteredDivisions = locationQuery.trim()
    ? BD_DIVISIONS.filter(
        (d) =>
          d.name.toLowerCase().includes(locationQuery.toLowerCase()) ||
          d.nameBn.includes(locationQuery)
      )
    : BD_DIVISIONS;

  // Selected labels
  const selectedDivisionObj = BD_DIVISIONS.find((d) => d.name === division);
  const selectedCategoryObj = categories.find((c) => c.slug === category);

  return (
    <section className="relative z-20 pt-6 pb-16 md:pt-12 md:pb-24">
      {/* Dynamic Ambient Background Glows isolated to prevent horizontal scroll */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/20 via-teal-500/10 to-transparent blur-3xl" />
        <div className="absolute -top-16 right-10 w-96 h-96 rounded-full bg-emerald-400/15 blur-3xl animate-pulse" />
        <div className="absolute -top-16 left-10 w-96 h-96 rounded-full bg-teal-400/15 blur-3xl animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Trust Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm hover:scale-[1.02] transition-transform cursor-default">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t.hero.badge}</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.15]">
          {t.hero.title.split(" ").slice(0, 3).join(" ")}{" "}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            {t.hero.title.split(" ").slice(3).join(" ")}
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {t.hero.subtitle}
        </p>

        {/* ============================================================== */}
        {/* ULTRA-PREMIUM SEGMENTED ISLAND SEARCH BAR (Airbnb / Sheba Style) */}
        {/* ============================================================== */}
        <div className="mt-8 max-w-4xl mx-auto relative z-30">
          <div
            className={`relative rounded-3xl bg-white/95 dark:bg-zinc-900/95 border border-slate-200/90 dark:border-zinc-800/90 shadow-2xl shadow-slate-200/60 dark:shadow-zinc-950/80 backdrop-blur-2xl p-2 sm:p-2.5 transition-all ${
              searchFocused || locationOpen || categoryOpen ? "z-50" : "z-30"
            }`}
          >
            <div className="flex flex-col md:flex-row items-stretch gap-1.5 sm:gap-2">
              
              {/* ---------------------------------------------------- */}
              {/* SEGMENT 1: SERVICE / KEYWORD WITH LIVE AUTOCOMPLETE */}
              {/* ---------------------------------------------------- */}
              <div ref={searchBoxRef} className={`relative flex-1 ${searchFocused ? "z-50" : "z-20"}`}>
                <div
                  onClick={() => setSearchFocused(true)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl cursor-text transition-all ${
                    searchFocused
                      ? "bg-slate-100/90 dark:bg-zinc-800/90 ring-2 ring-emerald-500/20 shadow-xs"
                      : "hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <Search className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500">
                      {t.hero.serviceLabel}
                    </span>
                    <input
                      type="text"
                      value={searchTerm}
                      onFocus={() => setSearchFocused(true)}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                      }}
                      placeholder={t.hero.searchPlaceholder}
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none truncate"
                    />
                  </div>

                  {searchTerm && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchTerm("");
                      }}
                      className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                      title="Clear"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Autocomplete / Trending Dropdown Panel */}
                {searchFocused && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-[100] rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-4 text-left animate-in fade-in-0 zoom-in-95 duration-150">
                    {/* If typing: show filtered matching categories */}
                    {filteredSuggestions.length > 0 && (
                      <div className="mb-3">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
                          {isBn ? "ক্যাটাগরি ম্যাচ" : "Matching Categories"}
                        </div>
                        <div className="space-y-1">
                          {filteredSuggestions.map((cat) => (
                            <button
                              key={cat.slug}
                              type="button"
                              onClick={() => {
                                setCategory(cat.slug);
                                setSearchTerm(isBn ? cat.nameBn : cat.name);
                                setSearchFocused(false);
                              }}
                              className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-zinc-800 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800">
                                  {CATEGORY_ICON_MAP[cat.slug] || <SlidersHorizontal className="h-3.5 w-3.5" />}
                                </span>
                                <span>{isBn ? cat.nameBn : cat.name}</span>
                              </div>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                                {isBn ? "ফিল্টার" : "Category"}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trending in Bangladesh */}
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2.5">
                        <Flame className="h-3.5 w-3.5 text-amber-500" />
                        <span>{t.hero.trending}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {TRENDING_SEARCHES.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => selectTrendingSearch(item)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 text-xs font-medium text-slate-700 dark:text-zinc-300 transition-all cursor-pointer"
                          >
                            {isBn ? item.bn : item.en}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ---------------------------------------------------- */}
              {/* SEGMENT 2: LOCATION / DIVISION WITH CUSTOM POPOVER */}
              {/* ---------------------------------------------------- */}
              <div ref={locationRef} className={`relative md:w-56 ${locationOpen ? "z-50" : "z-20"}`}>
                <button
                  type="button"
                  onClick={() => {
                    setLocationOpen(!locationOpen);
                    setSearchFocused(false);
                    setCategoryOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                    locationOpen
                      ? "bg-slate-100/90 dark:bg-zinc-800/90 ring-2 ring-emerald-500/20 shadow-xs"
                      : "hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0" />
                    <div className="truncate">
                      <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500">
                        {t.hero.locationLabel}
                      </span>
                      <span className="block text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {selectedDivisionObj
                          ? isBn
                            ? selectedDivisionObj.nameBn
                            : selectedDivisionObj.name
                          : t.hero.allBangladesh}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${
                      locationOpen ? "rotate-180 text-emerald-600" : ""
                    }`}
                  />
                </button>

                {/* Location Selection Popover */}
                {locationOpen && (
                  <div className="absolute top-full left-0 right-0 md:w-72 mt-2 z-[100] rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-3 text-left animate-in fade-in-0 zoom-in-95 duration-150">
                    {/* Quick Search inside Location */}
                    <div className="relative mb-3">
                      <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        placeholder={isBn ? "বিভাগ খুঁজুন..." : "Filter divisions..."}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Popular Cities Quick Badges */}
                    <div className="mb-2.5">
                      <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5">
                        {t.hero.popularCities}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {["Dhaka", "Chattogram", "Sylhet"].map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => {
                              setDivision(city);
                              setLocationOpen(false);
                            }}
                            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                              division === city
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200"
                            }`}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-zinc-800 pt-2 max-h-48 overflow-y-auto space-y-0.5">
                      {/* All Bangladesh Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setDivision("");
                          setLocationOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          division === ""
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold"
                            : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{t.hero.allBangladesh}</span>
                        </div>
                        {division === "" && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                      </button>

                      {/* Division items */}
                      {filteredDivisions.map((div) => {
                        const isSelected = division === div.name;
                        return (
                          <button
                            key={div.id}
                            type="button"
                            onClick={() => {
                              setDivision(div.name);
                              setLocationOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold"
                                : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                            }`}
                          >
                            <span>{isBn ? div.nameBn : div.name}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ---------------------------------------------------- */}
              {/* SEGMENT 3: CATEGORY PICKER WITH CUSTOM POPOVER       */}
              {/* ---------------------------------------------------- */}
              <div ref={categoryRef} className={`relative md:w-56 ${categoryOpen ? "z-50" : "z-20"}`}>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryOpen(!categoryOpen);
                    setSearchFocused(false);
                    setLocationOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                    categoryOpen
                      ? "bg-slate-100/90 dark:bg-zinc-800/90 ring-2 ring-emerald-500/20 shadow-xs"
                      : "hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <SlidersHorizontal className="h-5 w-5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    <div className="truncate">
                      <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500">
                        {t.hero.categoryLabel}
                      </span>
                      <span className="block text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {selectedCategoryObj
                          ? isBn
                            ? selectedCategoryObj.nameBn
                            : selectedCategoryObj.name
                          : t.hero.allCategories}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${
                      categoryOpen ? "rotate-180 text-emerald-600" : ""
                    }`}
                  />
                </button>

                {/* Category Selection Popover Grid */}
                {categoryOpen && (
                  <div className="absolute top-full right-0 md:left-auto md:w-80 mt-2 z-[100] rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-3 text-left animate-in fade-in-0 zoom-in-95 duration-150">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500 mb-2 px-1">
                      {isBn ? "ক্যাটাগরি নির্বাচন করুন" : "Browse Categories"}
                    </div>

                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {/* All Categories Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setCategory("");
                          setCategoryOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          category === ""
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold"
                            : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800">
                            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-600 dark:text-zinc-300" />
                          </span>
                          <span>{t.hero.allCategories}</span>
                        </div>
                        {category === "" && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                      </button>

                      {/* Category Grid List */}
                      {categories.map((cat) => {
                        const isSelected = category === cat.slug;
                        return (
                          <button
                            key={cat.slug}
                            type="button"
                            onClick={() => {
                              setCategory(cat.slug);
                              setCategoryOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold"
                                : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 shrink-0">
                                {CATEGORY_ICON_MAP[cat.slug] || <SlidersHorizontal className="h-3.5 w-3.5 text-slate-600" />}
                              </span>
                              <span className="truncate">{isBn ? cat.nameBn : cat.name}</span>
                            </div>
                            {isSelected && <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ---------------------------------------------------- */}
              {/* SEGMENT 4: HIGH-CONVERSION SEARCH ACTION BUTTON     */}
              {/* ---------------------------------------------------- */}
              <Button
                type="button"
                onClick={() => handleSearch()}
                className="rounded-2xl px-7 py-3.5 font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-sm shrink-0"
              >
                <span>{t.common.search}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Filter Tags (Trending in BD) */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 relative z-10">
            <span className="font-semibold flex items-center gap-1 text-slate-600 dark:text-zinc-300">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              {isBn ? "জনপ্রিয়:" : "Popular:"}
            </span>
            {t.hero.popularTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="px-3.5 py-1 rounded-full bg-white/80 dark:bg-zinc-800/80 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all border border-slate-200/80 dark:border-zinc-700/80 shadow-xs cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* ============================================================== */}
          {/* MARKET LEADING TRUST / VALUE PROPOSITIONS (Micro-Highlights)  */}
          {/* ============================================================== */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 text-left relative z-0">
            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-slate-200/70 dark:border-zinc-800/80 shadow-xs flex items-center gap-3 backdrop-blur-md hover:border-emerald-500/40 transition-colors">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {t.hero.trust1}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                  {t.hero.trust1Sub}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-slate-200/70 dark:border-zinc-800/80 shadow-xs flex items-center gap-3 backdrop-blur-md hover:border-teal-500/40 transition-colors">
              <div className="h-9 w-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {t.hero.trust2}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                  {t.hero.trust2Sub}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-slate-200/70 dark:border-zinc-800/80 shadow-xs flex items-center gap-3 backdrop-blur-md hover:border-cyan-500/40 transition-colors">
              <div className="h-9 w-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                <BadgePercent className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {t.hero.trust3}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                  {t.hero.trust3Sub}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-slate-200/70 dark:border-zinc-800/80 shadow-xs flex items-center gap-3 backdrop-blur-md hover:border-amber-500/40 transition-colors">
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {t.hero.trust4}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                  {t.hero.trust4Sub}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
