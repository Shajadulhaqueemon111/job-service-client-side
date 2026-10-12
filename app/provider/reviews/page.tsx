"use client";

import React, { useState, useEffect } from "react";
import { Star, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { RatingStars } from "@/components/shared/RatingStars";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateBD } from "@/lib/utils";

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

export default function ProviderReviewsPage() {
  const { isBn } = useI18n();

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Replying state
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const pRes = await fetch("/api/providers/me");
      const pData = await pRes.json();
      if (pData.success && pData.provider) {
        const dRes = await fetch(`/api/providers/${pData.provider._id}`);
        const dData = await dRes.json();
        if (dData.success) {
          setReviews(dData.reviews || []);
        }
      }
    } catch (err) {
      console.error("Error loading reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSendReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: replyText }),
      });

      if (res.ok) {
        setReplyingReviewId(null);
        setReplyText("");
        fetchReviews();
      }
    } catch (err) {
      console.error("Error replying to review", err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "5.0";

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {isBn ? "গ্রাহক রিভিউ ও মতামত" : "Client Reviews & Ratings"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isBn
              ? "আপনার কাজের মান সম্পর্কে গ্রাহকদের প্রতিক্রিয়া ও উত্তর দিন"
              : "Read feedback from verified clients and respond to their reviews"}
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 font-semibold block">Average Score</span>
          <span className="text-2xl font-black text-amber-500">★ {avgRating}</span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-slate-500">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 p-8 space-y-3">
          <Star className="h-10 w-10 text-amber-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {isBn ? "এখনো কোনো রিভিউ নেই" : "No Reviews Yet"}
          </h3>
          <p className="text-xs text-slate-500">
            {isBn
              ? "কাজ সম্পন্ন করার পর গ্রাহকগণ তাদের মূল্যবান মতামত এখানে প্রদান করবেন।"
              : "When customers complete requests and review your service, they will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev._id}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar src={rev.user?.avatar} fallback={rev.user?.name || "Client"} size="md" />
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

              {/* Existing Response */}
              {rev.providerResponse ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/50 text-xs space-y-1">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                    Your Response:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">{rev.providerResponse}</p>
                </div>
              ) : replyingReviewId === rev._id ? (
                <div className="space-y-2 pt-2">
                  <Textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a polite response to this client..."
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReplyingReviewId(null);
                        setReplyText("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="gradient"
                      size="sm"
                      disabled={submittingReply || !replyText.trim()}
                      onClick={() => handleSendReply(rev._id)}
                      className="gap-1 font-bold"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{submittingReply ? "Posting..." : "Post Reply"}</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplyingReviewId(rev._id);
                      setReplyText("");
                    }}
                    className="text-xs gap-1.5"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Reply to Review</span>
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
