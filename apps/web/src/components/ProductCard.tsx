import type { Product } from "@ksgpl/shared";

export function ProductCard({ product }: { product: Product }) {
  const specEntries = Object.entries(product.specs ?? {});

  return (
    <div className="border rounded-lg bg-white overflow-hidden flex flex-col">
      <div className="aspect-square bg-neutral-100 flex items-center justify-center">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-neutral-400 text-sm">No image</span>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col gap-2">
        <div>
          <h3 className="font-semibold leading-tight">{product.name}</h3>
          {product.category && (
            <p className="text-xs text-neutral-500">{product.category}</p>
          )}
        </div>
        {product.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] bg-brand/10 text-brand-dark px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {product.description && (
          <p className="text-sm text-neutral-600">{product.description}</p>
        )}
        {specEntries.length > 0 && (
          <dl className="text-xs text-neutral-600 grid grid-cols-1 gap-0.5 mt-auto pt-2 border-t">
            {specEntries.map(([key, value]) => (
              <div key={key} className="flex gap-1">
                <dt className="font-medium text-neutral-500 shrink-0">{key}:</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
        {!product.is_active && (
          <span className="text-[11px] text-red-600 font-medium">Inactive (hidden from end users)</span>
        )}
      </div>
    </div>
  );
}
