
"use client";

type PublicCatalogErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function PublicCatalogError({
  reset,
}: PublicCatalogErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F7F4] px-4 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
        <div
          aria-hidden="true"
          className="mb-5 text-5xl"
        >
          ☕
        </div>

        <h1 className="text-3xl font-bold text-[#172D29]">
          No pudimos cargar el menú
        </h1>

        <p className="mt-4 leading-7 text-gray-600">
          Ocurrió un problema temporal al consultar
          los productos. Puedes intentarlo nuevamente.
        </p>

        <button
          type="button"
          onClick={() => reset()}
          className="mt-8 rounded-full bg-[#172D29] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#25463F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#172D29]"
        >
          Reintentar
        </button>
      </section>
    </main>
  );
}
