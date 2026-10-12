"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { BD_DIVISIONS } from "@/lib/bd-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  DollarSign,
  MapPin,
  KeyRound,
  Shield,
  History,
} from "lucide-react";
import { TwoFactorSecurityCard } from "@/components/auth/two-factor-card";
import { PasswordChangeCard } from "@/components/auth/password-change-card";
import { UserActivityLogsCard } from "@/components/auth/user-activity-logs-card";

export default function ProviderProfilePage() {
  const { user } = useAuth();
  const { isBn } = useI18n();

  const [activeTab, setActiveTab] = useState<"profile" | "password" | "2fa" | "audit">("profile");

  const [provider, setProvider] = useState<any>(null);
  const [categories, setCategories] = useState<{ _id: string; name: string; nameBn: string }[]>([]);

  // Form states
  const [businessTitle, setBusinessTitle] = useState("");
  const [bio, setBio] = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [division, setDivision] = useState("Dhaka");
  const [district, setDistrict] = useState("Dhaka");
  const [upazila, setUpazila] = useState("");
  const [address, setAddress] = useState("");
  const [experienceYears, setExperienceYears] = useState(1);
  const [hourlyRate, setHourlyRate] = useState(0);
  const [priceRangeMin, setPriceRangeMin] = useState(300);
  const [priceRangeMax, setPriceRangeMax] = useState(2000);
  const [isAvailable, setIsAvailable] = useState(true);

  // Skills tags
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [pRes, cRes] = await Promise.all([
          fetch("/api/providers/me"),
          fetch("/api/categories"),
        ]);

        const pData = await pRes.json();
        const cData = await cRes.json();

        if (cData.categories) setCategories(cData.categories);

        if (pData.success && pData.provider) {
          const p = pData.provider;
          setProvider(p);
          setBusinessTitle(p.businessTitle || "");
          setBio(p.bio || "");
          setCategory(p.category?._id || "");
          setPhone(p.phone || "");
          setDivision(p.division || "Dhaka");
          setDistrict(p.district || "Dhaka");
          setUpazila(p.upazila || "");
          setAddress(p.address || "");
          setExperienceYears(p.experienceYears || 1);
          setHourlyRate(p.hourlyRate || 0);
          setPriceRangeMin(p.priceRangeMin || 300);
          setPriceRangeMax(p.priceRangeMax || 2000);
          setIsAvailable(p.isAvailable !== false);
          setSkills(p.skills || []);
        }
      } catch (err) {
        console.error("Error loading profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/providers/${provider._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessTitle,
          bio,
          category,
          phone,
          division,
          district,
          upazila,
          address,
          experienceYears,
          hourlyRate,
          priceRangeMin,
          priceRangeMax,
          isAvailable,
          skills,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setMessage({
        type: "success",
        text: isBn ? "প্রোফাইল সফলভাবে আপডেট করা হয়েছে!" : "Profile updated successfully!",
      });
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error saving profile",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-500">Loading profile data...</div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {isBn ? "প্রোভাইডার প্রোফাইল এডিট" : "Business Profile & Settings"}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {isBn ? "আপনার সার্ভিস তথ্য, এলাকা ও প্রাইসিং আপডেট করুন" : "Manage your public profile, rates, and coverage areas"}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === "profile"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <Briefcase className="h-3.5 w-3.5" />
          <span>{isBn ? "সার্ভিস ও বিজনেস প্রোফাইল" : "Business Profile"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("password")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === "password"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <KeyRound className="h-3.5 w-3.5" />
          <span>{isBn ? "পাসওয়ার্ড পরিবর্তন" : "Change Password"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("2fa")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === "2fa"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          <span>{isBn ? "২-ধাপ যাচাইকরণ (2FA)" : "Two-Step Verification"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === "audit"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <History className="h-3.5 w-3.5" />
          <span>{isBn ? "সিকিউরিটি অ্যাক্টিভিটি" : "Security Logs"}</span>
        </button>
      </div>

      {activeTab === "profile" && (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-6 animate-in fade-in duration-150">
        {/* Availability Toggle */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between">
          <div>
            <span className="font-bold text-sm text-slate-900 dark:text-white block">
              {isBn ? "কাজের জন্য প্রস্তুত (অনলাইন)" : "Availability Status"}
            </span>
            <span className="text-xs text-slate-500">
              {isAvailable
                ? "You appear in search results and can receive new bookings."
                : "Paused. Customers will see you as busy."}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsAvailable(!isAvailable)}
            className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              isAvailable ? "bg-emerald-600 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start"
            }`}
          >
            <div className="bg-white w-6 h-6 rounded-full shadow-md transform transition" />
          </button>
        </div>

        {/* Business Title */}
        <div>
          <label className="block text-xs font-bold mb-1.5 flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" />
            <span>Business Title / Professional Name *</span>
          </label>
          <Input
            required
            value={businessTitle}
            onChange={(e) => setBusinessTitle(e.target.value)}
            placeholder="e.g. Master AC Cool & Engineering"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-bold mb-1.5">Primary Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {isBn ? c.nameBn : c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-bold mb-1.5">About You / Service Description</label>
          <Textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Describe your experience, certifications, and what you specialize in..."
          />
        </div>

        {/* Skills Tag Input */}
        <div>
          <label className="block text-xs font-bold mb-1.5">Specialties & Skills</label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="e.g. Inverter AC, Leak Detection"
              className="text-xs h-9"
            />
            <Button type="button" size="sm" onClick={handleAddSkill} className="shrink-0 text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" /> Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {skills.map((s) => (
              <Badge key={s} variant="secondary" className="gap-1 py-1 px-2.5 text-xs">
                <span>{s}</span>
                <X
                  className="h-3 w-3 cursor-pointer hover:text-rose-500"
                  onClick={() => handleRemoveSkill(s)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Pricing Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1.5">Min Price (৳ BDT)</label>
            <Input
              type="number"
              value={priceRangeMin}
              onChange={(e) => setPriceRangeMin(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5">Max Price (৳ BDT)</label>
            <Input
              type="number"
              value={priceRangeMax}
              onChange={(e) => setPriceRangeMax(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5">Hourly Rate (৳ BDT)</label>
            <Input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Experience & Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1.5">Years of Experience</label>
            <Input
              type="number"
              value={experienceYears}
              onChange={(e) => setExperienceYears(parseInt(e.target.value, 10) || 0)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5">Contact Phone (01XXXXXXXXX) *</label>
            <Input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Geographic location */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1.5">Division</label>
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 focus:outline-none"
            >
              {BD_DIVISIONS.map((d) => (
                <option key={d.id} value={d.name}>
                  {isBn ? d.nameBn : d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">District</label>
            <Input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Dhaka"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">Upazila / Neighborhood</label>
            <Input
              value={upazila}
              onChange={(e) => setUpazila(e.target.value)}
              placeholder="e.g. Mirpur or Dhanmondi"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold mb-1.5">Street Address</label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Plot/House, Road, Area"
          />
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <Button type="submit" variant="gradient" size="lg" disabled={saving} className="font-bold">
            {saving ? "Saving Changes..." : "Save Profile"}
          </Button>
        </div>
      </form>
      )}

      {/* Password Change Tab */}
      {activeTab === "password" && (
        <div className="animate-in fade-in duration-150">
          <PasswordChangeCard />
        </div>
      )}

      {/* Two-Step Verification Tab */}
      {activeTab === "2fa" && (
        <div className="animate-in fade-in duration-150">
          <TwoFactorSecurityCard />
        </div>
      )}

      {/* Security Activity & Audit Logs Tab */}
      {activeTab === "audit" && (
        <div className="animate-in fade-in duration-150">
          <UserActivityLogsCard />
        </div>
      )}
    </div>
  );
}
