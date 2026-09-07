"use client";

import { useEffect, useState } from "react";
import { getCompanyInfo, updateCompanyInfo, type CompanyInfo } from "@ksgpl/shared";
import { getSupabase } from "@/lib/supabase";
import { ImageUploader } from "@/components/ImageUploader";

type FormState = Omit<CompanyInfo, "id" | "updated_at" | "gallery_urls"> & {
  gallery_urls: string;
};

function toForm(info: CompanyInfo): FormState {
  return {
    name: info.name,
    brand_name: info.brand_name ?? "",
    tagline: info.tagline ?? "",
    description: info.description ?? "",
    established_year: info.established_year,
    address: info.address ?? "",
    phone: info.phone ?? "",
    email: info.email ?? "",
    website: info.website ?? "",
    logo_url: info.logo_url,
    gallery_urls: info.gallery_urls.join(", "),
  };
}

export default function AdminCompanyPage() {
  const [info, setInfo] = useState<CompanyInfo | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const db = getSupabase();
    getCompanyInfo(db)
      .then((i) => {
        setInfo(i);
        if (i) setForm(toForm(i));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !info) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    const db = getSupabase();
    try {
      const updated = await updateCompanyInfo(db, info.id, {
        name: form.name.trim(),
        brand_name: form.brand_name?.trim() || null,
        tagline: form.tagline?.trim() || null,
        description: form.description?.trim() || null,
        established_year: form.established_year,
        address: form.address?.trim() || null,
        phone: form.phone?.trim() || null,
        email: form.email?.trim() || null,
        website: form.website?.trim() || null,
        logo_url: form.logo_url,
        gallery_urls: form.gallery_urls
          .split(",")
          .map((u) => u.trim())
          .filter(Boolean),
      });
      setInfo(updated);
      setForm(toForm(updated));
      setSaved(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-neutral-500">Loading…</p>;
  if (error && !form) return <p className="text-sm text-red-600">{error}</p>;
  if (!info || !form)
    return (
      <p className="text-sm text-neutral-500">
        No company info row exists yet. Run the seed SQL (see README) to create the initial row,
        then edit it here.
      </p>
    );

  return (
    <form onSubmit={handleSubmit} className="max-w-xl flex flex-col gap-3">
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{error}</p>}
      {saved && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">Saved.</p>}

      <label className="flex flex-col gap-1 text-sm">
        Company name
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="border rounded-md px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Brand name
        <input
          value={form.brand_name ?? ""}
          onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
          className="border rounded-md px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Tagline
        <input
          value={form.tagline ?? ""}
          onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          className="border rounded-md px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Description
        <textarea
          value={form.description ?? ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          className="border rounded-md px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Established year
        <input
          type="number"
          value={form.established_year ?? ""}
          onChange={(e) =>
            setForm({ ...form, established_year: e.target.value ? Number(e.target.value) : null })
          }
          className="border rounded-md px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Address
        <input
          value={form.address ?? ""}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="border rounded-md px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Phone
        <input
          value={form.phone ?? ""}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="border rounded-md px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          value={form.email ?? ""}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border rounded-md px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Website
        <input
          value={form.website ?? ""}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
          className="border rounded-md px-3 py-2"
        />
      </label>
      <ImageUploader
        bucket="company-images"
        pathPrefix="logo"
        value={form.logo_url}
        onChange={(url) => setForm({ ...form, logo_url: url })}
      />
      <label className="flex flex-col gap-1 text-sm">
        Gallery image URLs (comma separated — upload each via the field above, or paste URLs)
        <textarea
          value={form.gallery_urls}
          onChange={(e) => setForm({ ...form, gallery_urls: e.target.value })}
          rows={2}
          className="border rounded-md px-3 py-2"
        />
      </label>

      <button
        type="submit"
        disabled={saving}
        className="self-start bg-brand text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
