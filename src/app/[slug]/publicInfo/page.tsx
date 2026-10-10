
import { notFound } from "next/navigation";

import { getPublicCatalog } from "@/modules/publicCatalog/server/getPublicCatalog";

type PublicInfoPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// Consultar el catálogo en cada petición para reflejar
// los cambios de disponibilidad sin caché persistente.
export const dynamic = "force-dynamic";

export default async function PublicInfoPage({
  params,
}: PublicInfoPageProps) {
  const { slug } = await params;

  const catalog = await getPublicCatalog(slug);

  if (!catalog) {
    notFound();
  }

  const priceFormatter = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: catalog.company.currency,
  });

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900">
      <div className="mx-auto max-w-5xl">
        {/* Encabezado del negocio */}
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold">
            {catalog.company.name}
          </h1>

          <p className="mt-2 text-gray-600">
            Nuestro menú
          </p>
        </header>

        {/* Catálogo vacío */}
        {catalog.categories.length === 0 ? (
          <section className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <h2 className="text-xl font-semibold">
              Próximamente
            </h2>

            <p className="mt-2 text-gray-600">
              Este negocio todavía no tiene productos
              publicados en su catálogo.
            </p>
          </section>
        ) : (
          <div className="space-y-10">
            {catalog.categories.map((category) => (
              <section key={category.name}>
                <h2 className="mb-5 border-b border-gray-200 pb-3 text-2xl font-semibold">
                  {category.name}
                </h2>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {category.products.map((product) => (
                    <article
                      key={`${category.name}-${product.name}`}
                      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-semibold">
                          {product.name}
                        </h3>

                        <span className="whitespace-nowrap font-semibold">
                          {priceFormatter.format(
                            product.priceInCents / 100,
                          )}
                        </span>
                      </div>

                      <div className="mt-4">
                        {product.isAvailable ? (
                          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                            Disponible
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                            No disponible
                          </span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
