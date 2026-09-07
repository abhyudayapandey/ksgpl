"use client";

import type { ProductSpecs } from "@ksgpl/shared";

export function SpecsEditor({
  specs,
  onChange,
}: {
  specs: ProductSpecs;
  onChange: (specs: ProductSpecs) => void;
}) {
  const entries = Object.entries(specs);

  function updateEntry(index: number, key: string, value: string) {
    const next = [...entries];
    next[index] = [key, value];
    onChange(Object.fromEntries(next));
  }

  function removeEntry(index: number) {
    const next = entries.filter((_, i) => i !== index);
    onChange(Object.fromEntries(next));
  }

  function addEntry() {
    onChange({ ...specs, "": "" });
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Specs</label>
      {entries.map(([key, value], i) => (
        <div key={i} className="flex gap-2">
          <input
            value={key}
            onChange={(e) => updateEntry(i, e.target.value, value)}
            placeholder="Wattages"
            className="border rounded-md px-2 py-1.5 text-sm flex-1"
          />
          <input
            value={value}
            onChange={(e) => updateEntry(i, key, e.target.value)}
            placeholder="7W / 12W / 18W"
            className="border rounded-md px-2 py-1.5 text-sm flex-[2]"
          />
          <button
            type="button"
            onClick={() => removeEntry(i)}
            className="text-red-600 text-sm px-2"
            aria-label="Remove spec"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addEntry}
        className="self-start text-sm text-brand-dark hover:underline"
      >
        + Add spec
      </button>
    </div>
  );
}
