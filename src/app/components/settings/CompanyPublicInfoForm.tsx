
"use client";

import { useState } from "react";
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

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
            }}
        >
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
            />
            <CompanyTemporaryClosure
                isTemporarilyClosed={isTemporarilyClosed}
                temporaryClosureReason={temporaryClosureReason}
                onClosedChange={setIsTemporarilyClosed}
                onReasonChange={setTemporaryClosureReason}
            />


        </div>
    );
}
