
type PublicCatalogHeaderProps = {
  companyName: string;
};

export function PublicCatalogHeader({
  companyName,
}: PublicCatalogHeaderProps) {
  return (
    <header className="bg-[#172D29] px-5 py-12 text-white sm:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-2">
          <span
            aria-hidden="true"
            className="text-xl"
          >
            ☕
          </span>

          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8C99B]">
            Menú digital
          </span>
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {companyName}
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-6 text-[#D8E1DB] sm:text-base">
          Descubre nuestros productos y encuentra
          tu favorito.
        </p>
      </div>
    </header>
  );
}
