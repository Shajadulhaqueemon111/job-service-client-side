"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Phone,
  Briefcase,
  Clock,
  Calendar,
  Share2,
  AlertTriangle,
  ChevronLeft,
  Check,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { RatingStars } from "@/components/shared/RatingStars";
import { RequestModal } from "@/components/providers/RequestModal";
import { ReportModal } from "@/components/providers/ReportModal";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBDT, formatBDPhone, formatDateBD } from "@/lib/utils";

interface ReviewItem {
  _id: string;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  providerResponse?: string;
  createdAt: string;
}

interface ProviderDetail {
  _id: string;
  businessTitle: string;
  bio: string;
  skills: string[];
  division: string;
  district: string;
  upazila?: string;
  address?: string;
  phone: string;
  experienceYears: number;
  hourlyRate: number;
  priceRangeMin: number;
  priceRangeMax: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  completedJobsCount: number;
  isAvailable: boolean;
  galleryImages: string[];
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  category: {
    _id: string;
    name: string;
    nameBn: string;
    slug: string;
  };
  areas: {
    _id: string;
    areaName: string;
    areaNameBn: string;
  }[];
}

export default function ProviderDetailPage() {
  const { id } = useParams() as { id: string };
  const { t, isBn } = useI18n();

  const [provider, setProvider] = useState<ProviderDetail | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);

  useEffect(() => {
    async function loadProvider() {
      setLoading(true);
      try {
        const res = await fetch(`/api/providers/${id}`);
        const data = await res.json();
        if (data.success) {
          setProvider(data.provider);
          setReviews(data.reviews || []);
        } else {
          setError(data.error || "Provider not found");
        }
      } catch (err) {
        setError("Failed to load provider profile");
      } finally {
        setLoading(false);
      }
    }
    if (id) loadProvider();
  }, [id]);

  const copyPhoneNumber = () => {
    if (provider?.phone) {
      navigator.clipboard.writeText(provider.phone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500">{t.common.loading}</p>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">{error || "Provider Not Found"}</h2>
        <Link href="/services">
          <Button variant="outline">Back to Services</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/services" className="hover:text-emerald-600 flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          <span>{isBn ? "সকল সার্ভিস" : "All Services"}</span>
        </Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-slate-100 font-semibold">{provider.businessTitle}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Info, Bio, Gallery, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Card */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <Avatar
                src={provider.user?.avatar}
                fallback={provider.user?.name || "Provider"}
                size="xl"
                className="ring-4 ring-emerald-500/20 shadow-md"
              />

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="font-semibold text-xs">
                    {isBn ? provider.category?.nameBn : provider.category?.name}
                  </Badge>
                  {provider.isVerified && (
                    <Badge variant="verified" className="flex items-center gap-1 text-xs">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>{t.providerDetail.verifiedBadge}</span>
                    </Badge>
                  )}
                  {provider.isAvailable ? (
                    <Badge variant="default" className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {t.providerDetail.available}
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="text-xs">
                      {t.providerDetail.busy}
                    </Badge>
                  )}
                </div>

                <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {provider.businessTitle}
                </h1>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                  by {provider.user?.name}
                </p>

                {/* Rating, Jobs, Location */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs sm:text-sm">
                  <RatingStars rating={provider.rating} size="md" showScore reviewCount={provider.reviewCount} />
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {provider.completedJobsCount} {isBn ? "কাজ সম্পন্ন" : "Completed Jobs"}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>
                      {provider.upazila ? `${provider.upazila}, ` : ""}
                      {provider.district}, {provider.division}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About / Bio */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span>{isBn ? "প্রোভাইডার সম্পর্কে" : "About This Specialist"}</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
              {provider.bio || "No description provided."}
            </p>
          </div>

          {/* Skills & Services Offered */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {t.providerDetail.skills}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {provider.skills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70 text-sm font-medium text-slate-800 dark:text-slate-200"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Service Areas Covered */}
          {provider.areas && provider.areas.length > 0 && (
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {t.providerDetail.serviceAreas}
              </h2>
              <div className="flex flex-wrap gap-2">
                {provider.areas.map((a) => (
                  <Badge key={a._id} variant="outline" className="px-3 py-1.5 text-xs font-semibold">
                    <MapPin className="h-3 w-3 mr-1 text-emerald-600" />
                    {isBn ? a.areaNameBn : a.areaName}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Work Gallery */}
          {provider.galleryImages && provider.galleryImages.length > 0 && (
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {t.providerDetail.gallery}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {provider.galleryImages.map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={img}
                    alt={`Work photo ${i + 1}`}
                    onClick={() => setSelectedGalleryImage(img)}
                    className="rounded-2xl h-36 w-full object-cover cursor-pointer hover:opacity-90 transition-opacity border border-slate-200 dark:border-slate-800"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Customer Reviews & Feedback */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
                <span>{t.providerDetail.reviewsTitle}</span>
              </h2>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                ★ {provider.rating.toFixed(1)} / 5.0 ({reviews.length} {t.common.reviews})
              </span>
            </div>

            {reviews.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">{t.providerDetail.noReviews}</p>
            ) : (
              <div className="space-y-6">
                {reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800/80 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar src={rev.user?.avatar} fallback={rev.user?.name || "Client"} size="sm" />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {rev.user?.name}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            {formatDateBD(rev.createdAt)}
                          </span>
                        </div>
                      </div>
                      <RatingStars rating={rev.rating} size="sm" />
                    </div>

                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {rev.comment}
                    </p>

                    {/* Provider Response */}
                    {rev.providerResponse && (
                      <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-900 border-l-4 border-emerald-500 text-xs space-y-1">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                          {isBn ? "প্রোভাইডারের উত্তর:" : "Provider Response:"}
                        </span>
                        <p className="text-slate-600 dark:text-slate-300">
                          {rev.providerResponse}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Booking & Contact Sidebar Card */}
        <div className="space-y-6">
          <div className="sticky top-24 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/40 space-y-6">
            {/* Price Details */}
            <div className="pb-5 border-b border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                {t.providerDetail.priceRange}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {formatBDT(provider.priceRangeMin)} - {formatBDT(provider.priceRangeMax)}
                </span>
              </div>
              {provider.hourlyRate > 0 && (
                <p className="text-xs text-slate-500">
                  {t.providerDetail.hourlyRate}: {formatBDT(provider.hourlyRate)} / hr
                </p>
              )}
            </div>

            {/* Highlights */}
            <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t.providerDetail.experience}</span>
                <span className="font-bold">{provider.experienceYears} Years</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t.providerDetail.completedJobs}</span>
                <span className="font-bold">{provider.completedJobsCount} Orders</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Response Time</span>
                <span className="font-bold text-emerald-600">~ 30 Minutes</span>
              </div>
            </div>

            {/* Direct Phone Reveal & Copy */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <Phone className="h-4 w-4" />
                <span className="font-bold text-sm tracking-wide">
                  {formatBDPhone(provider.phone)}
                </span>
              </div>
              <button
                onClick={copyPhoneNumber}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                {copiedPhone ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : "Copy"}
              </button>
            </div>

            {/* Primary Action Button */}
            <Button
              variant="gradient"
              size="lg"
              onClick={() => setBookingModalOpen(true)}
              className="w-full rounded-2xl font-bold py-6 text-base shadow-lg shadow-emerald-500/25"
            >
              {t.providerDetail.requestButton}
            </Button>

            {/* Report Button */}
            <div className="pt-2 text-center">
              <button
                onClick={() => setReportModalOpen(true)}
                className="text-xs text-rose-500 hover:text-rose-600 hover:underline inline-flex items-center gap-1"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>{t.providerDetail.reportButton}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {bookingModalOpen && (
        <RequestModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          provider={provider}
        />
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          targetId={provider._id}
          targetType="provider"
        />
      )}
    </div>
  );
}
