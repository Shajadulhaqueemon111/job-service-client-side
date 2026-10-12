"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: "provider" | "user" | "review";
}

export function ReportModal({ isOpen, onClose, targetId, targetType }: ReportModalProps) {
  const { user } = useAuth();
  const { isBn } = useI18n();

  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError(isBn ? "অভিযোগ দাখিল করতে অনুগ্রহ করে লগইন করুন।" : "Please log in to report.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          reason,
          details,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit report");

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error submitting report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-rose-600">
          <AlertTriangle className="h-5 w-5" />
          <span>{isBn ? "প্রোভাইডারের বিরুদ্ধে অভিযোগ করুন" : "Report Provider"}</span>
        </div>
      }
      description={
        isBn
          ? "অসদাচরণ বা ফেক তথ্যের অভিযোগ গুরুত্বের সাথে তদন্ত করা হবে।"
          : "Reports are reviewed directly by the admin moderation team."
      }
      maxWidth="md"
    >
      {success ? (
        <div className="py-6 text-center space-y-2">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
          <p className="font-bold text-sm">
            {isBn ? "আপনার অভিযোগ জমা হয়েছে। ধন্যবাদ।" : "Report submitted. Thank you."}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

          <div>
            <label className="block text-xs font-bold mb-1">
              {isBn ? "অভিযোগের কারণ" : "Reason"} *
            </label>
            <select
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 focus:outline-none"
            >
              <option value="">{isBn ? "কারণ নির্বাচন করুন" : "Select a reason"}</option>
              <option value="Fake Information / Photos">{isBn ? "ভুয়া তথ্য বা ছবি" : "Fake Information / Photos"}</option>
              <option value="Unprofessional Behavior">{isBn ? "খারাপ ব্যবহার / অপেশাদার আচরণ" : "Unprofessional Behavior"}</option>
              <option value="Demanding Extra Payment">{isBn ? "অতিরিক্ত টাকা দাবি" : "Demanding Extra Payment"}</option>
              <option value="Did Not Show Up">{isBn ? "কাজের দিনে উপস্থিত না হওয়া" : "Did Not Show Up"}</option>
              <option value="Other">{isBn ? "অন্যান্য" : "Other"}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">
              {isBn ? "বিস্তারিত বিবরণ" : "Additional Details"}
            </label>
            <Textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={isBn ? "ঘটনাটির বিস্তারিত লিখুন..." : "Provide any helpful details..."}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" size="sm" disabled={loading}>
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
