
import { notFound } from "next/navigation";

import { getPublicCatalog } from "@/modules/publicCatalog/server/getPublicCatalog";

import { PublicCatalogHeader } from "@/modules/publicCatalog/components/PublicCatalogHeader";
import { PublicBusinessInfo } from "@/modules/publicCatalog/components/PublicBusinessInfo";
import { PublicCategoryNavigation } from "@/modules/publicCatalog/components/PublicCategoryNavigation";
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
        <main className="min-h-screen bg-[#F8F7F4] text-[#172D29]">
            {/* ENCABEZADO DEL RESTAURANTE */}
            <PublicCatalogHeader
                companyName={catalog.company.name}
                openingStatus={catalog.publicInfo.openingStatus}
            />

            <div className="mx-auto max-w-6xl px-4 pt-8 pb-14 sm:px-6 sm:pt-10">
                {/* INFORMACIÓN DEL NEGOCIO */}
                <PublicBusinessInfo
                    publicInfo={catalog.publicInfo}
                />

                {catalog.categories.length === 0 ? (
                    <section className="rounded-2xl border border-[#E8E4DC] bg-white px-6 py-16 text-center shadow-sm">
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
                    <section
                        id="menu"
                        aria-labelledby="menu-title"
                        className="scroll-mt-6"
                    >
                        <div className="mb-6">
                            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#987642]">
                                DESCUBRE NUESTROS SABORES
                            </span>

                            <h2
                                id="menu-title"
                                className="mt-2 text-3xl font-extrabold tracking-tight text-[#172D29] sm:text-4xl"
                            >
                                Nuestro menú
                            </h2>

                            <p className="mt-3 text-sm leading-7 text-[#738078] sm:text-base">
                                Explora nuestras categorías y encuentra
                                algo que se te antoje.
                            </p>
                        </div>

                        {/* NAVEGACIÓN STICKY */}
                        <PublicCategoryNavigation
                            categories={catalog.categories}
                        />

                        {/* PRODUCTOS POR CATEGORÍA */}
                        <div className="space-y-14">
                            {catalog.categories.map((category, index) => (
                                <PublicCategorySection
                                    key={`${category.name}-${index}`}
                                    category={category}
                                    currency={catalog.company.currency}
                                    sectionId={`category-${index}`}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* FOOTER */}
                <footer className="mt-20 border-t border-[#E4E0D7] pt-8 text-center">
                    <p className="text-sm font-semibold text-[#172D29]">
                        {catalog.company.name}
                    </p>

                    <p className="mt-2 text-xs text-[#738078]">
                        Gracias por visitarnos.
                    </p>

                    <p className="mt-5 text-xs text-gray-400">
                        Menú digital
                    </p>
                </footer>
            </div>
        </main>
    );
}
