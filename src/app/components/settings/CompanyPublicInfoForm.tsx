
"use client";

import { useEffect, useState } from "react";
import CompanyBusinessHoursEditor, {
    DEFAULT_BUSINESS_HOURS,
    type BusinessHour,
} from "./CompanyBusinessHoursEditor";
import CompanyTemporaryClosure from "./CompanyTemporaryClosure";

export default function CompanyPublicInfoForm() {
    const [googleMapsUrl, setGoogleMapsUrl] = useState("");
    const [businessHours, setBusinessHours] =
        useState<BusinessHour[]>(() =>
            DEFAULT_BUSINESS_HOURS.map((day) => ({ ...day })),
        );
    const [isTemporarilyClosed, setIsTemporarilyClosed] =
        useState(false);

    const [temporaryClosureReason, setTemporaryClosureReason] =
        useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);




    useEffect(() => {
        const controller = new AbortController();

        async function loadPublicInfo() {
            try {
                setIsLoading(true);
                setLoadError(null);

                const response = await fetch(
                    "/api/company/public-info",
                    {
                        method: "GET",
                        credentials: "same-origin",
                        cache: "no-store",
                        signal: controller.signal,
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        response.status === 403
                            ? "No tienes permisos para consultar esta configuración."
                            : "No se pudo cargar la información pública del negocio.",
                    );
                }

                const data: {
                    googleMapsUrl: string | null;
                    isTemporarilyClosed: boolean;
                    temporaryClosureReason: string | null;
                    businessHours: BusinessHour[];
                } = await response.json();

                if (controller.signal.aborted) return;

                setGoogleMapsUrl(data.googleMapsUrl ?? "");
                setIsTemporarilyClosed(data.isTemporarilyClosed);
                setTemporaryClosureReason(
                    data.temporaryClosureReason ?? "",
                );
                setBusinessHours(data.businessHours);
            } catch (error) {
                if (controller.signal.aborted) return;

                setLoadError(
                    error instanceof Error
                        ? error.message
                        : "Ocurrió un error al cargar la configuración.",
                );
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        void loadPublicInfo();

        return () => controller.abort();
    }, []);


    async function handleSave() {
        if (isLoading || isSaving || loadError) return;

        setIsSaving(true);
        setSaveError(null);
        setSaveSuccess(false);

        try {
            const response = await fetch(
                "/api/company/public-info",
                {
                    method: "PUT",
                    credentials: "same-origin",
                    cache: "no-store",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        googleMapsUrl: googleMapsUrl.trim() || null,
                        isTemporarilyClosed,
                        temporaryClosureReason:
                            isTemporarilyClosed
                                ? temporaryClosureReason.trim() || null
                                : null,
                        businessHours,
                    }),
                },
            );

            if (!response.ok) {
                let message = "No se pudo guardar la configuración.";

                if (response.status === 401) {
                    message = "Tu sesión ha expirado. Inicia sesión nuevamente.";
                } else if (response.status === 403) {
                    message = "No tienes permisos para modificar esta configuración.";
                } else {
                    const errorData: { error?: string } =
                        await response.json().catch(() => ({}));

                    if (typeof errorData.error === "string") {
                        message = errorData.error;
                    }
                }

                throw new Error(message);
            }

            setSaveSuccess(true);
        } catch (error) {
            setSaveError(
                error instanceof Error
                    ? error.message
                    : "Ocurrió un error inesperado al guardar.",
            );
        } finally {
            setIsSaving(false);
        }
    }




    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
            }}
        >

            {isLoading && (
                <p role="status" style={{ fontSize: 13, color: "#6b7280" }}>
                    Cargando información del negocio...
                </p>
            )}

            {loadError && (
                <p
                    role="alert"
                    style={{
                        fontSize: 13,
                        color: "#b91c1c",
                        backgroundColor: "#fef2f2",
                        border: "1px solid #fecaca",
                        borderRadius: 8,
                        padding: 12,
                    }}
                >
                    {loadError}
                </p>
            )}

            <div>
                <h3
                    style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#111827",
                        marginBottom: 6,
                    }}
                >
                    Ubicación en Google Maps
                </h3>

                <p
                    style={{
                        fontSize: 13,
                        color: "#6b7280",
                        marginBottom: 12,
                    }}
                >
                    Agrega el enlace de Google Maps de tu negocio.
                    Los clientes podrán abrirlo desde tu catálogo público.
                </p>

                <label
                    htmlFor="company-google-maps-url"
                    style={{
                        display: "block",
                        fontSize: 13,
                        fontWeight: 500,
                        marginBottom: 6,
                    }}
                >
                    Enlace de Google Maps
                </label>

                <input
                    id="company-google-maps-url"
                    type="url"
                    value={googleMapsUrl}
                    onChange={(event) =>
                        setGoogleMapsUrl(event.target.value)
                    }
                    disabled={isLoading || isSaving || loadError !== null}
                    placeholder="https://maps.google.com/..."
                    maxLength={2048}
                    autoComplete="url"
                    style={{
                        width: "100%",
                        border: "1px solid #d1d5db",
                        borderRadius: 8,
                        padding: "10px 12px",
                        fontSize: 14,
                        outlineOffset: 2,
                    }}
                />

                <p
                    style={{
                        fontSize: 12,
                        color: "#6b7280",
                        marginTop: 8,
                    }}
                >
                    Puedes copiar el enlace desde Google Maps usando
                    la opción Compartir.
                </p>



            </div>
            <CompanyBusinessHoursEditor
                value={businessHours}
                onChange={setBusinessHours}
                disabled={isLoading || isSaving || loadError !== null}
            />
            <CompanyTemporaryClosure
                isTemporarilyClosed={isTemporarilyClosed}
                temporaryClosureReason={temporaryClosureReason}
                onClosedChange={setIsTemporarilyClosed}
                onReasonChange={setTemporaryClosureReason}
                disabled={isLoading || isSaving || loadError !== null}
            />


            <div
                style={{
                    borderTop: "1px solid #e5e7eb",
                    paddingTop: 20,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                }}
            >
                {saveError && (
                    <p
                        role="alert"
                        style={{
                            fontSize: 13,
                            color: "#b91c1c",
                            backgroundColor: "#fef2f2",
                            border: "1px solid #fecaca",
                            borderRadius: 8,
                            padding: 12,
                            margin: 0,
                        }}
                    >
                        {saveError}
                    </p>
                )}

                {saveSuccess && (
                    <p
                        role="status"
                        style={{
                            fontSize: 13,
                            color: "#166534",
                            backgroundColor: "#f0fdf4",
                            border: "1px solid #bbf7d0",
                            borderRadius: 8,
                            padding: 12,
                            margin: 0,
                        }}
                    >
                        Información pública guardada correctamente.
                    </p>
                )}

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isLoading || isSaving || loadError !== null}
                    style={{
                        alignSelf: "flex-start",
                        padding: "10px 18px",
                        backgroundColor:
                            isLoading || isSaving || loadError !== null
                                ? "#9ca3af"
                                : "#111827",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor:
                            isLoading || isSaving || loadError !== null
                                ? "not-allowed"
                                : "pointer",
                    }}
                >
                    {isSaving ? "Guardando..." : "Guardar cambios"}
                </button>
            </div>



        </div>
    );
}
