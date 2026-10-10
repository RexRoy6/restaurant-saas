
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

const STATUS_LABELS = {
    OPEN: "Abierto ahora",
    CLOSED: "Cerrado ahora",
    TEMPORARILY_CLOSED: "Cerrado temporalmente",
    UNKNOWN: "Horario no disponible",
} as const;

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

    const isOpen = openingStatus === "OPEN";

    const statusStyles = isOpen
        ? "bg-green-50 text-green-800 border-green-200"
        : openingStatus === "TEMPORARILY_CLOSED"
            ? "bg-amber-50 text-amber-800 border-amber-200"
            : "bg-gray-100 text-gray-700 border-gray-200";

    return (
        <section
            aria-labelledby="business-info-title"
            className="mb-12 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
            <div className="border-b border-gray-100 px-5 py-6 sm:px-7">
                <h2
                    id="business-info-title"
                    className="text-xl font-bold text-[#172D29]"
                >
                    Información del negocio
                </h2>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span
                        className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold ${statusStyles}`}
                    >
                        <span
                            aria-hidden="true"
                            className={`mr-2 h-2 w-2 rounded-full ${isOpen
                                ? "bg-green-600"
                                : openingStatus === "TEMPORARILY_CLOSED"
                                    ? "bg-amber-600"
                                    : "bg-gray-500"
                                }`}
                        />

                        {STATUS_LABELS[openingStatus]}
                    </span>
                </div>

                {isTemporarilyClosed && temporaryClosureReason && (
                    <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                        {temporaryClosureReason}
                    </p>
                )}
            </div>

            <div className="grid gap-8 px-5 py-6 sm:px-7 md:grid-cols-2">
                {/* Horarios semanales */}
                <div>
                    <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#172D29]">
                        <span aria-hidden="true">🕒</span>
                        Horarios de atención
                    </h3>



                    {openingStatus === "UNKNOWN" ? (
                        <p className="text-sm leading-6 text-gray-500">
                            El negocio todavía no ha publicado sus horarios.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {businessHours
                                .slice()
                                .sort((a, b) => {
                                    // Presentación de lunes a domingo.
                                    const dayA = (a.dayOfWeek + 6) % 7;
                                    const dayB = (b.dayOfWeek + 6) % 7;

                                    return dayA - dayB;
                                })
                                .map((day) => (
                                    <div
                                        key={day.dayOfWeek}
                                        className="flex items-start justify-between gap-4 text-sm"
                                    >
                                        <span className="font-medium text-gray-700">
                                            {DAY_NAMES[day.dayOfWeek]}
                                        </span>

                                        <span className="text-right text-gray-600">
                                            {day.isClosed
                                                ? "Cerrado"
                                                : `${day.opensAt} – ${day.closesAt}${day.opensAt! > day.closesAt!
                                                    ? " (+1 día)"
                                                    : ""
                                                }`}
                                        </span>
                                    </div>
                                ))}
                        </div>

                    )}

                </div>

                {/* Google Maps */}
                <div>
                    <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#172D29]">
                        <span aria-hidden="true">📍</span>
                        Ubicación
                    </h3>

                    {googleMapsUrl ? (
                        <>
                            <p className="mb-4 text-sm leading-6 text-gray-600">
                                Encuéntranos fácilmente y consulta cómo llegar
                                desde Google Maps.
                            </p>

                            <a
                                href={googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-lg bg-[#172D29] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#24463F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#172D29]"
                            >
                                Ver ubicación en Google Maps
                                <span aria-hidden="true" className="ml-2">
                                    ↗
                                </span>
                            </a>
                        </>
                    ) : (
                        <p className="text-sm leading-6 text-gray-500">
                            Ubicación no disponible por el momento.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
