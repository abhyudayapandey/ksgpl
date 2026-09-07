"use client";

import { useEffect, useState } from "react";
import {
  createCatalogType,
  deleteCatalogType,
  listCatalogTypes,
  updateCatalogType,
  type CatalogType,
} from "@ksgpl/shared";
import { getSupabase } from "@/lib/supabase";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminCatalogTypesPage() {
  const [types, setTypes] = useState<CatalogType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  async function refresh() {
    const db = getSupabase();
    setLoading(true);
    try {
      setTypes(await listCatalogTypes(db));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    const db = getSupabase();
    try {
      await createCatalogType(db, {
        name: name.trim(),
        slug: slugify(name),
        description: description.trim() || null,
        display_order: types.length,
      });
      setName("");
      setDescription("");
      await refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }

  function startEdit(ct: CatalogType) {
    setEditingId(ct.id);
    setEditName(ct.name);
    setEditDescription(ct.description ?? "");
  }

  async function handleSaveEdit(id: string) {
    setError(null);
    const db = getSupabase();
    try {
      await updateCatalogType(db, id, {
        name: editName.trim(),
        description: editDescription.trim() || null,
      });
      setEditingId(null);
      await refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this catalog type and all its products? This can't be undone.")) return;
    setError(null);
    const db = getSupabase();
    try {
      await deleteCatalogType(db, id);
      await refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <p className="text-sm text-neutral-500">
        Catalog types show up as tabs for end users. Add as many as you need — e.g. one per
        product line.
      </p>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{error}</p>}

      <form onSubmit={handleCreate} className="border rounded-lg p-4 bg-white flex flex-col gap-3">
        <h2 className="font-semibold">Add catalog type</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Raw Materials"
          required
          className="border rounded-md px-3 py-2 text-sm"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="border rounded-md px-3 py-2 text-sm"
          rows={2}
        />
        <button className="self-start bg-brand text-white rounded-md px-3 py-2 text-sm font-medium">
          Add
        </button>
      </form>

      {loading ? (
        <p className="text-neutral-500 text-sm">Loading…</p>
      ) : (
        <div className="flex flex-col gap-2">
          {types.map((ct) => (
            <div key={ct.id} className="border rounded-lg p-4 bg-white">
              {editingId === ct.id ? (
                <div className="flex flex-col gap-2">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(ct.id)}
                      className="bg-brand text-white rounded-md px-3 py-1.5 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-neutral-100 rounded-md px-3 py-1.5 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{ct.name}</h3>
                    <p className="text-xs text-neutral-400">/{ct.slug}</p>
                    {ct.description && (
                      <p className="text-sm text-neutral-600 mt-1">{ct.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(ct)}
                      className="text-sm px-2 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ct.id)}
                      className="text-sm px-2 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {types.length === 0 && (
            <p className="text-neutral-500 text-sm">No catalog types yet — add one above.</p>
          )}
        </div>
      )}
    </div>
  );
}
