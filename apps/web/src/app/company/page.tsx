"use client";

import { useEffect, useState } from "react";
import { getCompanyInfo, type CompanyInfo } from "@ksgpl/shared";
import { getSupabase } from "@/lib/supabase";

export default function CompanyPage() {
  const [info, setInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getSupabase();
    getCompanyInfo(db)
      .then(setInfo)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-neutral-500 text-sm">Loading…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!info)
    return (
      <p className="text-neutral-500 text-sm">
        No company info yet. An admin can add it from the Admin dashboard.
      </p>
    );

  return (
    <div className="max-w-2xl flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {info.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={info.logo_url} alt={info.name} className="h-16 w-16 object-contain" />
        )}
        <div>
          <h1 className="text-2xl font-bold">{info.name}</h1>
          {info.brand_name && (
            <p className="text-brand-dark font-medium">{info.brand_name}</p>
          )}
        </div>
      </div>

      {info.tagline && <p className="text-lg italic text-neutral-700">{info.tagline}</p>}
      {info.description && <p className="text-neutral-700 leading-relaxed">{info.description}</p>}

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm border-t pt-4">
        {info.established_year && (
          <div>
            <dt className="text-neutral-500">Established</dt>
            <dd className="font-medium">{info.established_year}</dd>
          </div>
        )}
        {info.address && (
          <div>
            <dt className="text-neutral-500">Address</dt>
            <dd className="font-medium">{info.address}</dd>
          </div>
        )}
        {info.phone && (
          <div>
            <dt className="text-neutral-500">Phone</dt>
            <dd className="font-medium">{info.phone}</dd>
          </div>
        )}
        {info.email && (
          <div>
            <dt className="text-neutral-500">Email</dt>
            <dd className="font-medium">{info.email}</dd>
          </div>
        )}
        {info.website && (
          <div>
            <dt className="text-neutral-500">Website</dt>
            <dd className="font-medium">{info.website}</dd>
          </div>
        )}
      </dl>

      {info.gallery_urls?.length > 0 && (
        <div>
          <h2 className="font-semibold mb-2">Manufacturing Unit</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {info.gallery_urls.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" className="rounded-md object-cover aspect-video" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
