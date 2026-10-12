"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RatingStars } from "@/components/shared/RatingStars";
import { useI18n } from "@/lib/i18n/context";
import { Star, CheckCircle2 } from "lucide-react";

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceRequestId: string;
  providerTitle: string;
  onSuccess: () => void;
}

export function LeaveReviewModal({
  isOpen,
  onClose,
  serviceRequestId,
  providerTitle,
  onSuccess,
}: LeaveReviewModalProps) {
  const { isBn } = useI18n();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceRequestId,
          rating,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error submitting review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
          <span>{isBn ? "সার্ভিস রিভিউ দিন" : "Leave a Review"}</span>
        </div>
      }
      description={
        <span>
          {isBn ? "প্রোভাইডার:" : "Provider:"} <strong>{providerTitle}</strong>
        </span>
      }
      maxWidth="md"
    >
      {success ? (
        <div className="py-6 text-center space-y-2">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-base">
            {isBn ? "রিভিউ সফলভাবে পোস্ট হয়েছে!" : "Review Posted Successfully!"}
          </h3>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

          <div>
            <label className="block text-xs font-bold mb-2">
              {isBn ? "আপনার রেটিং" : "Select Rating"}
            </label>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-center">
              <RatingStars
                rating={rating}
                size="lg"
                interactive
                onRatingChange={(r) => setRating(r)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">
              {isBn ? "আপনার মতামত / অভিজ্ঞতা" : "Review Comment"} *
            </label>
            <Textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                isBn
                  ? "কাজের মান, সময়নিষ্ঠতা এবং ব্যবহার সম্পর্কে লিখুন..."
                  : "How was the service? Write about quality, timeliness, and behavior..."
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" size="sm" disabled={loading}>
              {loading ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
