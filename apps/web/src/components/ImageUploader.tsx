"use client";

import { useState } from "react";
import { uploadImage } from "@ksgpl/shared";
import { getSupabase } from "@/lib/supabase";

export function ImageUploader({
  bucket,
  pathPrefix,
  value,
  onChange,
}: {
  bucket: "product-images" | "company-images";
  pathPrefix: string;
  value: string | null;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const db = getSupabase();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${pathPrefix}/${Date.now()}.${ext}`;
      const url = await uploadImage(db, bucket, path, file, file.type);
      onChange(url);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Image</label>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-24 w-24 object-cover rounded-md border" />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="text-sm"
      />
      {uploading && <p className="text-xs text-neutral-500">Uploading…</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
