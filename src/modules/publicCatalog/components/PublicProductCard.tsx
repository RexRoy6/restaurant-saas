
import type {
  PublicCatalogProduct,
} from "@/modules/publicCatalog/server/getPublicCatalog";

type PublicProductCardProps = {
  product: PublicCatalogProduct;
  currency: "MXN";
};

export function PublicProductCard({
  product,
  currency,
}: PublicProductCardProps) {
  const formattedPrice = new Intl.NumberFormat(
    "es-MX",
    {
      style: "currency",
      currency,
    },
  ).format(product.priceInCents / 100);

  return (
    <article
      className={[
        "rounded-2xl border bg-white p-5 shadow-sm",
        "transition-shadow hover:shadow-md",
        product.isAvailable
          ? "border-gray-200"
          : "border-gray-200 bg-gray-50",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="min-w-0 text-lg font-semibold text-gray-900">
          {product.name}
        </h3>

        <span className="shrink-0 whitespace-nowrap text-lg font-bold text-[#172D29]">
          {formattedPrice}
        </span>
      </div>

      <div className="mt-5">
        {product.isAvailable ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-emerald-600"
            />
            Disponible
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-800">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-red-600"
            />
            No disponible
          </span>
        )}
      </div>
    </article>
  );
}
