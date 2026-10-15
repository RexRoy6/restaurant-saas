
import type { PublicCatalog } from "../server/getPublicCatalog";

type PublicBusinessInfoProps = {
    publicInfo: PublicCatalog["publicInfo"];
};

const DAY_NAMES = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
];

export function PublicBusinessInfo({
    publicInfo,
}: PublicBusinessInfoProps) {
    const {
        googleMapsUrl,
        isTemporarilyClosed,
        temporaryClosureReason,
        businessHours,
        openingStatus,
    } = publicInfo;

    const sortedHours = [...businessHours].sort(
        (a, b) =>
            ((a.dayOfWeek + 6) % 7) -
            ((b.dayOfWeek + 6) % 7)
    );

    const hasHours =
        openingStatus !== "UNKNOWN" &&
        sortedHours.length > 0;

    return (
        <section
            aria-label="Información del restaurante"
            className="mb-10"
        >
            {isTemporarilyClosed && temporaryClosureReason && (
                <div
                    role="status"
                    className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900"
                >
                    <strong className="mb-1 block">
                        Aviso del restaurante
                    </strong>
                    {temporaryClosureReason}
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
                {/* HORARIOS */}
                <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EDF3EF] text-xl">
                            <span aria-hidden="true">🕒</span>
                        </div>

                        <div>
                            <h2 className="font-bold text-[#172D29]">
                                Horarios de atención
                            </h2>
                            <p className="text-xs text-gray-500">
                                Consulta nuestros horarios
                            </p>
                        </div>
                    </div>

                    {!hasHours ? (
                        <p className="mt-4 text-sm leading-6 text-gray-500">
                            Los horarios todavía no están disponibles.
                        </p>
                    ) : (
                        <details className="group mt-4">
                            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg text-sm font-semibold text-[#172D29] marker:hidden [&::-webkit-details-marker]:hidden">
                                Ver horarios de la semana
                                <span
                                    aria-hidden="true"
                                    className="transition-transform group-open:rotate-180"
                                >
                                    ▾
                                </span>
                            </summary>

                            <div className="mt-3 space-y-3 border-t border-[#EEEAE2] pt-4">
                                {sortedHours.map((day) => {
                                    const crossesMidnight =
                                        !day.isClosed &&
                                        day.opensAt != null &&
                                        day.closesAt != null &&
                                        day.opensAt > day.closesAt;

                                    return (
                                        <div
                                            key={day.dayOfWeek}
                                            className="flex items-start justify-between gap-3 text-sm"
                                        >
                                            <span className="font-medium text-gray-700">
                                                {DAY_NAMES[day.dayOfWeek]}
                                            </span>

                                            <span className="text-right text-gray-600">
                                                {day.isClosed
                                                    ? "Cerrado"
                                                    : day.opensAt && day.closesAt
                                                        ? `${day.opensAt} – ${day.closesAt}`
                                                        : "No disponible"}

                                                {crossesMidnight && (
                                                    <span className="block text-xs text-gray-400">
                                                        Cierra al día siguiente
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </details>
                    )}
                </div>

                {/* UBICACIÓN */}
                <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EDF3EF] text-xl">
                            <span aria-hidden="true">📍</span>
                        </div>

                        <div>
                            <h2 className="font-bold text-[#172D29]">
                                Nuestra ubicación
                            </h2>
                            <p className="text-xs text-gray-500">
                                Encuéntranos fácilmente
                            </p>
                        </div>
                    </div>

                    {googleMapsUrl ? (
                        <>
                            <p className="mb-4 mt-4 text-sm leading-6 text-gray-600">
                                Consulta nuestra ubicación y encuentra
                                la mejor ruta para visitarnos.
                            </p>

                            <a
                                href={googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#172D29] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#24463F]"
                            >
                                Cómo llegar
                                <span aria-hidden="true">↗</span>
                            </a>
                        </>
                    ) : (
                        <p className="mt-4 text-sm leading-6 text-gray-500">
                            Ubicación no disponible por el momento.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
