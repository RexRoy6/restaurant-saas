
import type { PublicCatalogCategory } from "@/modules/publicCatalog/server/getPublicCatalog";

import { PublicProductCard } from "./PublicProductCard";

type PublicCategorySectionProps = {
  category: PublicCatalogCategory;
  currency: "MXN";
  sectionId: string;
};

export function PublicCategorySection({
  category,
  currency,
  sectionId,
}: PublicCategorySectionProps) {
  return (
    <section
      id={sectionId}
      aria-labelledby={`${sectionId}-title`}
      className="scroll-mt-28"
    >
      <div className="mb-6 flex items-end justify-between gap-4 border-b border-[#E4E0D7] pb-5">
        <div className="min-w-0">
          <div
            aria-hidden="true"
            className="mb-3 h-1 w-10 rounded-full bg-[#C9A66B]"
          />

          <h2
            id={`${sectionId}-title`}
            className="break-words text-2xl font-extrabold tracking-tight text-[#172D29] sm:text-3xl"
          >
            {category.name}
          </h2>

          <p className="mt-2 text-sm text-[#738078]">
            {category.products.length}{" "}
            {category.products.length === 1
              ? "producto"
              : "productos"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {category.products.map((product, index) => (
          <PublicProductCard
            key={`${product.name}-${index}`}
            product={product}
            currency={currency}
          />
        ))}
      </div>
    </section>
  );
}
