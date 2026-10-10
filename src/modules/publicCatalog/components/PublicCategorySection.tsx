
import type {
  PublicCatalogCategory,
} from "@/modules/publicCatalog/server/getPublicCatalog";

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
      className="scroll-mt-8"
    >
      <div className="mb-5 border-b border-gray-200 pb-4">
        <h2
          id={`${sectionId}-title`}
          className="text-2xl font-bold tracking-tight text-gray-900"
        >
          {category.name}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {category.products.length}{" "}
          {category.products.length === 1
            ? "producto"
            : "productos"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
