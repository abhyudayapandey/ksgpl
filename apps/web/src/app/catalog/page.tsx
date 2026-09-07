"use client";

import { useEffect, useState } from "react";
import { listCatalogTypes, listProducts, type CatalogType, type Product } from "@ksgpl/shared";
import { getSupabase } from "@/lib/supabase";
import { CatalogTabs } from "@/components/CatalogTabs";
import { SearchBar } from "@/components/SearchBar";
import { ProductCard } from "@/components/ProductCard";

export default function CatalogPage() {
  const [catalogTypes, setCatalogTypes] = useState<CatalogType[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getSupabase();
    listCatalogTypes(db)
      .then((types) => {
        setCatalogTypes(types);
        if (types.length > 0) setActiveId(types[0].id);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!activeId) {
      setProducts([]);
      setLoading(false);
      return;
    }
    const db = getSupabase();
    setLoading(true);
    const handle = setTimeout(() => {
      listProducts(db, { catalogTypeId: activeId, search, activeOnly: true })
        .then(setProducts)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [activeId, search]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Product Catalog</h1>
        <p className="text-neutral-500 text-sm">
          Browse products by category. Use search to find a specific product or spec.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </p>
      )}

      <CatalogTabs catalogTypes={catalogTypes} activeId={activeId} onChange={setActiveId} />

      <SearchBar value={search} onChange={setSearch} />

      {loading && <p className="text-neutral-500 text-sm">Loading…</p>}

      {!loading && catalogTypes.length === 0 && !error && (
        <p className="text-neutral-500 text-sm">
          No catalogs yet. An admin can add one from the Admin dashboard.
        </p>
      )}

      {!loading && activeId && products.length === 0 && (
        <p className="text-neutral-500 text-sm">No products match your search.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
