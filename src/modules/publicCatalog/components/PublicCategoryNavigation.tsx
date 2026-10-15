
import type { PublicCatalogCategory } from "@/modules/publicCatalog/server/getPublicCatalog";

type PublicCategoryNavigationProps = {
  categories: PublicCatalogCategory[];
};

export function PublicCategoryNavigation({
  categories,
}: PublicCategoryNavigationProps) {
  return (
    <nav
      aria-label="Categorías del menú"
      className="sticky top-0 z-30 -mx-4 mb-10 border-b border-[#E8E4DC] bg-[#F8F7F4]/95 px-4 py-4 shadow-sm backdrop-blur-md sm:-mx-6 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <a
            href="#menu"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-[#172D29] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#24463F]"
          >
            Menú
          </a>

          {categories.map((category, index) => (
            <a
              key={`${category.name}-${index}`}
              href={`#category-${index}`}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-[#E4E0D7] bg-white px-5 py-2 text-sm font-medium text-[#35463F] transition-colors hover:border-[#172D29] hover:bg-[#EAF0EB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#172D29]"
            >
              {category.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
