"use client";

import React, { useState, useEffect } from "react";
import { FolderTree, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog } from "@/components/ui/dialog";

interface CategoryAdminItem {
  _id: string;
  name: string;
  nameBn: string;
  slug: string;
  icon: string;
  description: string;
  descriptionBn: string;
  isPopular: boolean;
  isActive: boolean;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // New category form
  const [name, setName] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [icon, setIcon] = useState("Wrench");
  const [desc, setDesc] = useState("");
  const [descBn, setDescBn] = useState("");
  const [isPopular, setIsPopular] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          nameBn,
          icon,
          description: desc,
          descriptionBn: descBn,
          isPopular,
          isActive: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create category");

      setModalOpen(false);
      setName("");
      setNameBn("");
      setDesc("");
      setDescBn("");
      fetchCategories();
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Error creating category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Categories Management</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Manage service categories with English and Bengali translations
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          size="sm"
          className="bg-rose-600 hover:bg-rose-700 text-white font-bold gap-1.5 rounded-xl shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </Button>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading categories...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Category (EN)</th>
                  <th className="py-3 px-4">Category (বাংলা)</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Popular</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {categories.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{c.name}</td>
                    <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">{c.nameBn}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-zinc-400">{c.slug}</td>
                    <td className="py-3.5 px-4">
                      {c.isPopular ? (
                        <Badge variant="warning" className="text-[10px]">
                          Popular
                        </Badge>
                      ) : (
                        <span className="text-slate-400 dark:text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="default" className="text-[10px]">
                        Active
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {modalOpen && (
        <Dialog
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Add New Category"
          description="Create a category with dual language support"
          maxWidth="md"
        >
          {message && <p className="text-xs text-rose-500 font-semibold mb-2">{message}</p>}
          <form onSubmit={handleCreateCategory} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">English Name *</label>
                <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. CCTV Technician" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Bangla Name (বাংলা) *</label>
                <Input required value={nameBn} onChange={(e) => setNameBn(e.target.value)} placeholder="সিসিটিভি ক্যামেরা টেকনিশিয়ান" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">English Description</label>
              <Textarea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Bangla Description</label>
              <Textarea rows={2} value={descBn} onChange={(e) => setDescBn(e.target.value)} />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pop"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="accent-rose-600"
              />
              <label htmlFor="pop" className="text-xs font-semibold">
                Mark as Popular on Homepage
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submitting} className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
                {submitting ? "Saving..." : "Create Category"}
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
