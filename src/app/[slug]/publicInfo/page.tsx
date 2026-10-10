
import { notFound } from "next/navigation";

import { getPublicCatalog } from "@/modules/publicCatalog/server/getPublicCatalog";

import { PublicCatalogHeader } from "@/modules/publicCatalog/components/PublicCatalogHeader";
import { PublicCategorySection } from "@/modules/publicCatalog/components/PublicCategorySection";

type PublicInfoPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

export const dynamic = "force-dynamic";

export default async function PublicInfoPage({
    params,
}: PublicInfoPageProps) {
    const { slug } = await params;

    const catalog = await getPublicCatalog(slug);

    if (!catalog) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-[#F8F7F4]">
            <PublicCatalogHeader
                companyName={catalog.company.name}
            />

            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">

                {catalog.categories.length === 0 ? (
                    <section className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
                        <div
                            aria-hidden="true"
                            className="mb-5 text-5xl"
                        >
                            ☕
                        </div>

                        <h2 className="text-2xl font-bold text-[#172D29]">
                            Estamos preparando nuestro menú
                        </h2>

                        <p className="mx-auto mt-4 max-w-md leading-7 text-gray-600">
                            Muy pronto encontrarás aquí nuestros productos.
                            ¡Gracias por visitarnos!
                        </p>
                    </section>
                ) : (
                    <>
                        {/* Navegación por categorías */}
                        <nav
                            aria-label="Categorías del menú"
                            className="mb-12"
                        >
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">
                                Explora nuestro menú
                            </h2>

                            <div className="flex flex-wrap gap-2">
                                {catalog.categories.map((category, index) => (
                                    <a
                                        key={`${category.name}-${index}`}
                                        href={`#category-${index}`}
                                        className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#172D29] hover:bg-[#172D29] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#172D29]"
                                    >
                                        {category.name}
                                    </a>
                                ))}
                            </div>
                        </nav>

                        {/* Secciones del catálogo */}
                        <div className="space-y-12">
                            {catalog.categories.map((category, index) => (
                                <PublicCategorySection
                                    key={`${category.name}-${index}`}
                                    category={category}
                                    currency={catalog.company.currency}
                                    sectionId={`category-${index}`}
                                />
                            ))}
                        </div>
                    </>
                )}

                <footer className="mt-16 border-t border-gray-200 pt-6 text-center text-xs text-gray-500">
                    Menú de {catalog.company.name}
                </footer>
            </div>
        </main>
    );
}
