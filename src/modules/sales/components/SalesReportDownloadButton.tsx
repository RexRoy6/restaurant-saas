"use client";

import {
    useState,
} from "react";

import {
    Download,
    LoaderCircle,
} from "lucide-react";

import type {
    SalesPeriod,
} from "../types/sales";

type SalesReportDownloadButtonProps = {
    period: SalesPeriod;
    disabled?: boolean;
};

export default function SalesReportDownloadButton({
    period,
    disabled = false,
}: SalesReportDownloadButtonProps) {
    const [downloading, setDownloading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const downloadReport = async () => {
        if (downloading) {
            return;
        }

        setDownloading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/sales/export?period=${encodeURIComponent(period)}`,
                {
                    method: "GET",
                    cache: "no-store",
                },
            );

            if (!response.ok) {
                throw new Error(
                    "No se pudo descargar el reporte.",
                );
            }

            const blob = await response.blob();

            const url =
                window.URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;

            const contentDisposition =
                response.headers.get(
                    "Content-Disposition",
                );

            const filenameMatch =
                contentDisposition?.match(
                    /filename="([^"]+)"/,
                );

            link.download =
                filenameMatch?.[1] ??
                `ventas-${period}.xlsx`;

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(
                "Sales report download failed:",
                error,
            );

            setError(
                "No se pudo descargar el reporte. Intenta nuevamente.",
            );
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="flex flex-col items-stretch gap-1 sm:items-end">
            <button
                type="button"
                onClick={() =>
                    void downloadReport()
                }
                disabled={
                    disabled ||
                    downloading
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {downloading ? (
                    <LoaderCircle
                        size={16}
                        aria-hidden="true"
                        className="animate-spin"
                    />
                ) : (
                    <Download
                        size={16}
                        aria-hidden="true"
                    />
                )}

                {downloading
                    ? "Descargando..."
                    : "Descargar reporte"}
            </button>

            {error && (
                <p
                    role="alert"
                    className="text-xs text-red-600"
                >
                    {error}
                </p>
            )}
        </div>
    );
}