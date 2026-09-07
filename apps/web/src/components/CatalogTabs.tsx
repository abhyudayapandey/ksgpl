import type { CatalogType } from "@ksgpl/shared";

export function CatalogTabs({
  catalogTypes,
  activeId,
  onChange,
}: {
  catalogTypes: CatalogType[];
  activeId: string | null;
  onChange: (id: string) => void;
}) {
  if (catalogTypes.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto border-b pb-px">
      {catalogTypes.map((ct) => (
        <button
          key={ct.id}
          onClick={() => onChange(ct.id)}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px ${
            activeId === ct.id
              ? "border-brand text-brand-dark"
              : "border-transparent text-neutral-500 hover:text-neutral-800"
          }`}
        >
          {ct.name}
        </button>
      ))}
    </div>
  );
}
