
import type { PublicCatalogProduct } from "@/modules/publicCatalog/server/getPublicCatalog";

type PublicProductCardProps = {
  product: PublicCatalogProduct;
  currency: "MXN";
};

export function PublicProductCard({
  product,
  currency,
}: PublicProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
  }).format(product.priceInCents / 100);

  const available = product.isAvailable;

  return (
    <article
      className={[
        "group flex h-full flex-col justify-between",
        "rounded-2xl border p-5 sm:p-6",
        "transition-all duration-200",
        available
          ? "border-[#E8E4DC] bg-white shadow-sm hover:-translate-y-0.5 hover:border-[#C9D8CE] hover:shadow-md"
          : "border-[#E8E4DC] bg-[#F0EFEB]",
      ].join(" ")}
    >
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3
            className={[
              "min-w-0 flex-1 break-words text-lg font-bold leading-snug",
              available
                ? "text-[#172D29]"
                : "text-gray-500",
            ].join(" ")}
          >
            {product.name}
          </h3>

          <span
            className={[
              "shrink-0 whitespace-nowrap text-lg font-extrabold tracking-tight",
              available
                ? "text-[#172D29]"
                : "text-gray-500",
            ].join(" ")}
          >
            {formattedPrice}
          </span>
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between gap-3 border-t border-[#EEEAE2] pt-4">
        {available ? (
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#28754A]">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-emerald-600"
            />
            Disponible
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#A44747]">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-red-600"
            />
            Agotado por ahora
          </span>
        )}

        <span
          aria-hidden="true"
          className="text-lg text-[#C9A66B]"
        >
          ✦
        </span>
      </div>
    </article>
  );
}
