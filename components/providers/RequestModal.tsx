"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth-context";
import { formatBDT } from "@/lib/utils";
import { Calendar, Clock, Phone, MapPin, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: {
    _id: string;
    businessTitle: string;
    division: string;
    district: string;
    hourlyRate?: number;
    priceRangeMin?: number;
    priceRangeMax?: number;
  };
}

export function RequestModal({ isOpen, onClose, provider }: RequestModalProps) {
  const { t, isBn } = useI18n();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [division, setDivision] = useState(provider.division || "Dhaka");
  const [district, setDistrict] = useState(provider.district || "Dhaka");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState(user?.address || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("10:00 AM");
  const [budget, setBudget] = useState(provider.priceRangeMin ? String(provider.priceRangeMin) : "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError(isBn ? "সার্ভিস বুক করতে অনুগ্রহ করে লগইন করুন।" : "Please log in to request this service.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: provider._id,
          title,
          description,
          division,
          district,
          area,
          address,
          phone,
          preferredDate,
          preferredTime,
          estimatedBudget: budget ? parseFloat(budget) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit service request");
      }

      setSuccess(true);
      toast.success(isBn ? "আপনার সেবার রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!" : "Service request submitted successfully!");
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isBn ? "সার্ভিস রিকোয়েস্ট পাঠান" : "Request Service"}
      description={
        <span>
          {isBn ? "প্রোভাইডার:" : "Provider:"}{" "}
          <strong className="text-emerald-600 dark:text-emerald-400">
            {provider.businessTitle}
          </strong>{" "}
          ({formatBDT(provider.priceRangeMin)} - {formatBDT(provider.priceRangeMax)})
        </span>
      }
      maxWidth="lg"
    >
      {success ? (
        <div className="py-8 text-center space-y-3">
          <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950/80 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {isBn ? "রিকোয়েস্ট সফলভাবে গৃহীত হয়েছে!" : "Request Sent Successfully!"}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {t.requestModal.successMsg}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.requestModal.jobTitle} *
            </label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.requestModal.jobTitlePlaceholder}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.requestModal.description} *
            </label>
            <Textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.requestModal.descriptionPlaceholder}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {t.requestModal.preferredDate} *
              </label>
              <DatePicker
                required
                value={preferredDate}
                onChange={setPreferredDate}
                placeholder={t.requestModal.preferredDate || "Select date"}
                minDate={new Date()}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {t.requestModal.preferredTime} *
              </label>
              <TimePicker
                required
                value={preferredTime}
                onChange={setPreferredTime}
                placeholder={t.requestModal.selectTime || "Select time"}
                nowText={t.requestModal.now || "Now"}
                okText={t.requestModal.ok || "OK"}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {t.requestModal.contactPhone} *
              </label>
              <Input
                required
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.requestModal.budget}
              </label>
              <Input
                type="number"
                placeholder="৳ BDT"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {t.requestModal.address} *
            </label>
            <Input
              required
              placeholder="e.g. House 14, Road 5, Block B, Mirpur-10, Dhaka"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              {t.common.cancel}
            </Button>
            <Button
              type="submit"
              variant="gradient"
              size="sm"
              disabled={loading}
              className="gap-2 font-bold px-5"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? t.common.loading : t.requestModal.submit}</span>
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
