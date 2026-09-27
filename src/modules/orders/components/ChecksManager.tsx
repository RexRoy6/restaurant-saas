"use client";

import {
  ChevronRight,
  ReceiptText,
} from "lucide-react";

import { useChecks } from "../hooks/useChecks";

function formatDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "es-MX",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(value));
}

export default function ChecksManager() {
  const {
    checks,
    loading,
    error,
  } = useChecks();

  const openChecks = checks.filter(
    (check) => check.status === "OPEN",
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-gray-500">
          Cargando cuentas...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-gray-900">
              Cuentas abiertas
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Selecciona una cuenta para administrar sus órdenes.
            </p>
          </div>

          <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-gray-100 px-2.5 py-1 text-sm font-medium text-gray-700">
            {openChecks.length}
          </span>
        </div>
      </div>

      {openChecks.length === 0 ? (
        <div className="p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <ReceiptText size={22} />
          </div>

          <p className="mt-4 font-medium text-gray-900">
            No hay cuentas abiertas
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Las nuevas cuentas aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {openChecks.map((check) => (
            <button
              key={check.id}
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-gray-50"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {check.name?.trim() ||
                      `Cuenta #${check.id}`}
                  </span>

                  <span className="inline-flex rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    Abierta
                  </span>
                </div>

                {check.note && (
                  <p className="mt-1 truncate text-sm text-gray-500">
                    {check.note}
                  </p>
                )}

                <p className="mt-1 text-xs text-gray-400">
                  Creada{" "}
                  {formatDate(
                    check.createdAt,
                  )}
                </p>
              </div>

              <ChevronRight
                size={18}
                className="shrink-0 text-gray-400"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}