
import Link from "next/link";

export default function PublicCatalogNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F7F4] px-4 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
        <div
          aria-hidden="true"
          className="mb-5 text-5xl"
        >
          ☕
        </div>

        <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
          Error 404
        </p>

        <h1 className="mt-3 text-3xl font-bold text-[#172D29]">
          No encontramos este menú
        </h1>

        <p className="mt-4 leading-7 text-gray-600">
          El negocio que buscas no existe o su menú
          ya no está disponible.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-[#172D29] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#25463F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#172D29]"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
