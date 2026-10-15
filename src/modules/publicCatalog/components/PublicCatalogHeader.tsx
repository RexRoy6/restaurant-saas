
import type { OpeningStatus } from "@/modules/companyPublicInfo/server/calculateOpeningStatus";

type PublicCatalogHeaderProps = {
  companyName: string;
  openingStatus: OpeningStatus;
};

const STATUS = {
  OPEN: {
    label: "Abierto ahora",
    dot: "bg-emerald-400",
  },
  CLOSED: {
    label: "Cerrado ahora",
    dot: "bg-rose-400",
  },
  TEMPORARILY_CLOSED: {
    label: "Cerrado temporalmente",
    dot: "bg-amber-400",
  },
  UNKNOWN: {
    label: "Horario no disponible",
    dot: "bg-gray-400",
  },
} as const;

export function PublicCatalogHeader({
  companyName,
  openingStatus,
}: PublicCatalogHeaderProps) {
  const status = STATUS[openingStatus];

  return (
    <header className="relative overflow-hidden bg-[#172D29] text-white">
      {/* Decoración de fondo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#31584D] opacity-40 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-0 h-64 w-64 rounded-full bg-[#E8C99B] opacity-10 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-14">
        <div className="mb-9 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-xl">
              <span aria-hidden="true">☕</span>
            </div>

            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#E8C99B]">
              Menú digital
            </span>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white">
            <span
              aria-hidden="true"
              className={`h-2 w-2 rounded-full ${status.dot}`}
            />
            {status.label}
          </span>
        </div>

        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-medium text-[#E8C99B]">
            Bienvenido a
          </p>

          <h1 className="break-words text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            {companyName}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-8 text-[#D8E1DB] sm:text-lg">
            Explora nuestro menú, descubre tus favoritos
            y disfruta de lo que tenemos para ti.
          </p>

          <a
            href="#menu"
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#E8C99B] px-6 py-3 text-sm font-bold text-[#172D29] transition-colors hover:bg-[#F4DDB8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Explorar menú
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
    </header>
  );
}
