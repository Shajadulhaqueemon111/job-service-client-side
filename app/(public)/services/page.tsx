"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Filter,
  MapPin,
  Star,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  SlidersHorizontal,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { BD_DIVISIONS, BD_DISTRICTS_BY_DIVISION } from "@/lib/bd-data";
import { RatingStars } from "@/components/shared/RatingStars";
import { RequestModal } from "@/components/providers/RequestModal";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { formatBDT } from "@/lib/utils";

interface ProviderItem {
  _id: string;
  businessTitle: string;
  bio?: string;
  skills: string[];
  division: string;
  district: string;
  upazila?: string;
  phone: string;
  experienceYears: number;
  hourlyRate: number;
  priceRangeMin: number;
  priceRangeMax: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  completedJobsCount: number;
  user: {
    name: string;
    avatar?: string;
  };
  category: {
    _id: string;
    name: string;
    nameBn: string;
    slug: string;
  };
}

function ServicesContent() {
  const { t, isBn } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filter states initialized from URL params
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [division, setDivision] = useState(searchParams.get("division") || "");
  const [district, setDistrict] = useState(searchParams.get("district") || "");
  const [minRating, setMinRating] = useState(searchParams.get("minRating") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get("verifiedOnly") === "true");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "rating");
  const [page, setPage] = useState(1);

  // Mobile sidebar filter visibility
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Request Service Modal state
  const [selectedProviderForBooking, setSelectedProviderForBooking] = useState<ProviderItem | null>(null);

  // Data states
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Categories list
  const [categoriesList, setCategoriesList] = useState<{ _id: string; name: string; nameBn: string; slug: string }[]>([]);

  // Fetch Categories
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategoriesList(data.categories);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // Fetch Providers whenever filters change
  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (category) params.set("category", category);
        if (division) params.set("division", division);
        if (district) params.set("district", district);
        if (minRating) params.set("minRating", minRating);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);
        if (verifiedOnly) params.set("verifiedOnly", "true");
        if (sortBy) params.set("sortBy", sortBy);
        params.set("page", String(page));
        params.set("limit", "12");

        const res = await fetch(`/api/providers?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setProviders(data.providers || []);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalResults(data.pagination?.total || 0);
        }
      } catch (err) {
        console.error("Error loading providers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [search, category, division, district, minRating, minPrice, maxPrice, verifiedOnly, sortBy, page]);

  const handleResetFilters = () => {
    setSearch("");
    setCategory("");
    setDivision("");
    setDistrict("");
    setMinRating("");
    setMinPrice("");
    setMaxPrice("");
    setVerifiedOnly(false);
    setSortBy("rating");
    setPage(1);
    router.push("/services");
  };

  const currentDistricts = division
    ? BD_DISTRICTS_BY_DIVISION[division.toLowerCase()] || []
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isBn ? "সার্ভিস প্রোভাইডার তালিকা" : "Find Local Service Specialists"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isBn
              ? `মোট ${totalResults} জন দক্ষ টেকনিশিয়ান পাওয়া গেছে`
              : `Found ${totalResults} verified professionals across Bangladesh`}
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-1.5"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>{t.common.filter}</span>
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              {t.filters.sortBy}:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="rating">{t.filters.sortHighestRated}</option>
              <option value="jobs">{t.filters.sortMostJobs}</option>
              <option value="priceAsc">{t.filters.sortLowestPrice}</option>
              <option value="priceDesc">{t.filters.sortHighestPrice}</option>
              <option value="newest">{isBn ? "নতুন যুক্ত" : "Newest"}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filter Sidebar (Desktop) */}
        <aside
          className={`md:block md:col-span-1 space-y-6 ${
            mobileFilterOpen
              ? "fixed inset-0 z-50 bg-white dark:bg-slate-900 p-6 overflow-y-auto block"
              : "hidden"
          }`}
        >
          {mobileFilterOpen && (
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 md:hidden">
              <h3 className="font-bold text-lg">{t.filters.title}</h3>
              <Button size="sm" variant="ghost" onClick={() => setMobileFilterOpen(false)}>
                Close
              </Button>
            </div>
          )}

          {/* Search bar inside sidebar */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.common.search}
            </label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={isBn ? "নাম বা দক্ষতা খুঁজুন..." : "Title, skills..."}
                className="pl-9 text-xs"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.filters.category}
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="">{t.common.allCategories}</option>
              {categoriesList.map((cat) => (
                <option key={cat._id} value={cat.slug}>
                  {isBn ? cat.nameBn : cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filters */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.filters.location}
            </label>

            {/* Division */}
            <select
              value={division}
              onChange={(e) => {
                setDivision(e.target.value);
                setDistrict("");
                setPage(1);
              }}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="">{t.common.allDivisions}</option>
              {BD_DIVISIONS.map((div) => (
                <option key={div.id} value={div.name}>
                  {isBn ? div.nameBn : div.name}
                </option>
              ))}
            </select>

            {/* District */}
            {division && (
              <select
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="">{t.common.allDistricts}</option>
                {currentDistricts.map((d) => (
                  <option key={d.name} value={d.name}>
                    {isBn ? d.nameBn : d.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Minimum Rating Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.filters.rating}
            </label>
            <div className="flex flex-col gap-1.5 text-xs">
              {["", "4.5", "4.0", "3.5"].map((r) => (
                <label key={r} className="flex items-center gap-2 cursor-pointer hover:text-emerald-600">
                  <input
                    type="radio"
                    name="minRating"
                    value={r}
                    checked={minRating === r}
                    onChange={(e) => {
                      setMinRating(e.target.value);
                      setPage(1);
                    }}
                    className="accent-emerald-600"
                  />
                  <span>
                    {r ? (
                      <span className="flex items-center gap-1 font-medium">
                        {r}+ <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 inline" /> & above
                      </span>
                    ) : (
                      "All Ratings"
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.filters.priceRange}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder={t.filters.minPrice}
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPage(1);
                }}
                className="text-xs h-9"
              />
              <Input
                type="number"
                placeholder={t.filters.maxPrice}
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
                className="text-xs h-9"
              />
            </div>
          </div>

          {/* Verified Only Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => {
                  setVerifiedOnly(e.target.checked);
                  setPage(1);
                }}
                className="rounded accent-emerald-600 h-4 w-4 cursor-pointer"
              />
              <span>{t.common.verifiedOnly}</span>
            </label>
          </div>

          {/* Reset Filters Button */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="w-full gap-2 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t.common.reset}</span>
            </Button>
          </div>
        </aside>

        {/* Results Grid (Desktop 3 Cols, Mobile 1 Col) */}
        <section className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-pulse bg-white/50 dark:bg-slate-900/50"
                >
                  <div className="flex gap-3 items-center">
                    <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                  <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                </div>
              ))}
            </div>
          ) : providers.length === 0 ? (
            <div className="py-16 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 p-8 space-y-4">
              <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                {t.common.noResults}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isBn
                  ? "ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন অথবা সকল ফিল্টার রিসেট করুন।"
                  : "Try clearing some filters or searching with a different location or keyword."}
              </p>
              <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-2">
                {t.common.reset}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((p) => (
                <div
                  key={p._id}
                  className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <Avatar src={p.user?.avatar} fallback={p.user?.name || "Provider"} size="lg" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                            {p.user?.name}
                          </h4>
                          {p.isVerified && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <Badge variant="secondary" className="text-[10px] mt-1 py-0 px-2 font-medium">
                          {isBn ? p.category?.nameBn : p.category?.name}
                        </Badge>
                      </div>
                    </div>

                    {/* Title */}
                    <Link href={`/providers/${p._id}`}>
                      <h3 className="mt-3.5 font-bold text-sm text-slate-900 dark:text-white line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors leading-snug">
                        {p.businessTitle}
                      </h3>
                    </Link>

                    {/* Rating & Jobs */}
                    <div className="mt-3 flex items-center justify-between">
                      <RatingStars rating={p.rating} size="sm" showScore reviewCount={p.reviewCount} />
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                        {p.completedJobsCount} {isBn ? "কাজ" : "jobs"}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {p.upazila ? `${p.upazila}, ` : ""}
                        {p.district}, {p.division}
                      </span>
                    </div>

                    {/* Skills pills */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {p.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing and Actions */}
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-slate-500">{isBn ? "প্রাইস রেঞ্জ" : "Price Range"}:</span>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {formatBDT(p.priceRangeMin)} - {formatBDT(p.priceRangeMax)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link href={`/providers/${p._id}`}>
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          {t.common.viewDetails}
                        </Button>
                      </Link>
                      <Button
                        variant="gradient"
                        size="sm"
                        onClick={() => setSelectedProviderForBooking(p)}
                        className="w-full text-xs font-bold"
                      >
                        {isBn ? "বুক করুন" : "Book Now"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) setPage(page - 1);
                      }}
                      className={page <= 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={page === p}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(p);
                        }}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) setPage(page + 1);
                      }}
                      className={page >= totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </section>
      </div>

      {/* Booking Modal */}
      {selectedProviderForBooking && (
        <RequestModal
          isOpen={!!selectedProviderForBooking}
          onClose={() => setSelectedProviderForBooking(null)}
          provider={selectedProviderForBooking}
        />
      )}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading services...</div>}>
      <ServicesContent />
    </Suspense>
  );
}
