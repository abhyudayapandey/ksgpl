"use client";

import { useEffect, useState } from "react";
import {
  createProduct,
  deleteProduct,
  listCatalogTypes,
  listProducts,
  updateProduct,
  type CatalogType,
  type Product,
  type ProductSpecs,
} from "@ksgpl/shared";
import { getSupabase } from "@/lib/supabase";
import { SpecsEditor } from "@/components/SpecsEditor";
import { ImageUploader } from "@/components/ImageUploader";
import { SearchBar } from "@/components/SearchBar";

interface FormState {
  id: string | null;
  catalog_type_id: string;
  name: string;
  category: string;
  description: string;
  image_url: string | null;
  specs: ProductSpecs;
  tags: string;
  is_active: boolean;
}

function emptyForm(catalogTypeId: string): FormState {
  return {
    id: null,
    catalog_type_id: catalogTypeId,
    name: "",
    category: "",
    description: "",
    image_url: null,
    specs: {},
    tags: "",
    is_active: true,
  };
}

export default function AdminProductsPage() {
  const [catalogTypes, setCatalogTypes] = useState<CatalogType[]>([]);
  const [activeCatalogTypeId, setActiveCatalogTypeId] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const db = getSupabase();
    listCatalogTypes(db)
      .then((types) => {
        setCatalogTypes(types);
        if (types.length > 0) setActiveCatalogTypeId(types[0].id);
      })
      .catch((e) => setError(e.message));
  }, []);

  async function refreshProducts() {
    if (!activeCatalogTypeId) {
      setProducts([]);
      return;
    }
    const db = getSupabase();
    setLoading(true);
    try {
      setProducts(
        await listProducts(db, { catalogTypeId: activeCatalogTypeId, search })
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const handle = setTimeout(refreshProducts, 250);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCatalogTypeId, search]);

  function startCreate() {
    setForm(emptyForm(activeCatalogTypeId));
  }

  function startEdit(p: Product) {
    setForm({
      id: p.id,
      catalog_type_id: p.catalog_type_id,
      name: p.name,
      category: p.category ?? "",
      description: p.description ?? "",
      image_url: p.image_url,
      specs: p.specs,
      tags: p.tags.join(", "),
      is_active: p.is_active,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    const db = getSupabase();
    const payload = {
      catalog_type_id: form.catalog_type_id,
      name: form.name.trim(),
      category: form.category.trim() || null,
      description: form.description.trim() || null,
      image_url: form.image_url,
      specs: form.specs,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      is_active: form.is_active,
    };
    try {
      if (form.id) {
        await updateProduct(db, form.id, payload);
      } else {
        await createProduct(db, payload);
      }
      setForm(null);
      await refreshProducts();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    const db = getSupabase();
    try {
      await deleteProduct(db, id);
      await refreshProducts();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function toggleActive(p: Product) {
    const db = getSupabase();
    try {
      await updateProduct(db, p.id, { is_active: !p.is_active });
      await refreshProducts();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={activeCatalogTypeId}
          onChange={(e) => setActiveCatalogTypeId(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          {catalogTypes.map((ct) => (
            <option key={ct.id} value={ct.id}>
              {ct.name}
            </option>
          ))}
        </select>
        <SearchBar value={search} onChange={setSearch} placeholder="Search this catalog…" />
        <button
          onClick={startCreate}
          disabled={!activeCatalogTypeId}
          className="ml-auto bg-brand text-white rounded-md px-3 py-2 text-sm font-medium disabled:opacity-50"
        >
          + Add product
        </button>
      </div>

      {catalogTypes.length === 0 && (
        <p className="text-sm text-neutral-500">
          Create a catalog type first (under the &quot;Catalog Types&quot; tab).
        </p>
      )}

      {form && (
        <form
          onSubmit={handleSubmit}
          className="border rounded-lg p-4 bg-white flex flex-col gap-3 max-w-xl"
        >
          <h2 className="font-semibold">{form.id ? "Edit product" : "New product"}</h2>
          <select
            value={form.catalog_type_id}
            onChange={(e) => setForm({ ...form, catalog_type_id: e.target.value })}
            className="border rounded-md px-3 py-2 text-sm"
          >
            {catalogTypes.map((ct) => (
              <option key={ct.id} value={ct.id}>
                {ct.name}
              </option>
            ))}
          </select>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            required
            className="border rounded-md px-3 py-2 text-sm"
          />
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Category (e.g. COB Lights)"
            className="border rounded-md px-3 py-2 text-sm"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description (optional)"
            rows={2}
            className="border rounded-md px-3 py-2 text-sm"
          />
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="Tags, comma separated (e.g. Smart control, Detachable)"
            className="border rounded-md px-3 py-2 text-sm"
          />
          <ImageUploader
            bucket="product-images"
            pathPrefix={form.catalog_type_id}
            value={form.image_url}
            onChange={(url) => setForm({ ...form, image_url: url })}
          />
          <SpecsEditor specs={form.specs} onChange={(specs) => setForm({ ...form, specs })} />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Visible to end users
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-brand text-white rounded-md px-3 py-2 text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setForm(null)}
              className="bg-neutral-100 rounded-md px-3 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-neutral-500 text-sm">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map((p) => (
            <div key={p.id} className="border rounded-lg bg-white p-3 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  {p.category && <p className="text-xs text-neutral-500">{p.category}</p>}
                </div>
                {!p.is_active && (
                  <span className="text-[11px] text-red-600 font-medium shrink-0">Hidden</span>
                )}
              </div>
              <div className="flex gap-2 mt-auto pt-2 border-t text-sm">
                <button
                  onClick={() => startEdit(p)}
                  className="px-2 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(p)}
                  className="px-2 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200"
                >
                  {p.is_active ? "Hide" : "Show"}
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="px-2 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <p className="text-sm text-neutral-500">No products in this catalog yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
