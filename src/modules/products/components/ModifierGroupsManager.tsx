
"use client";

import {
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

import { useModifierGroups } from "../hooks/useModifierGroups";

function formatCurrency(
  priceInCents: number,
) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(priceInCents / 100);
}

export default function ModifierGroupsManager() {
  const {
    groups,
    loading,
    error,
    loadGroups,
  } = useModifierGroups();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Grupos de modificadores
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Administra opciones reutilizables
            entre diferentes productos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadGroups()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500">
          Cargando modificadores...
        </div>
      ) : groups.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-10 text-center">
          <SlidersHorizontal
            size={30}
            className="mx-auto text-gray-400"
          />

          <h3 className="mt-3 font-medium text-gray-900">
            Todavía no hay grupos de modificadores
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Aquí aparecerán los grupos que
            configures para tus productos.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {groups.map((group) => (
            <div
              key={group.id}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {group.name}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Mínimo: {group.minSelections} ·
                    Máximo: {group.maxSelections}
                  </p>
                </div>

                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                  {group.options.length} opciones
                </span>
              </div>

              <div className="mt-4 divide-y divide-gray-100 border-t border-gray-100">
                {group.options.length === 0 ? (
                  <p className="py-4 text-sm text-gray-400">
                    Sin opciones configuradas.
                  </p>
                ) : (
                  group.options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {option.name}
                        </p>

                        {!option.isAvailable && (
                          <p className="text-xs text-amber-600">
                            No disponible
                          </p>
                        )}
                      </div>

                      <span className="text-sm text-gray-600">
                        {formatCurrency(
                          option.priceInCents,
                        )}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
