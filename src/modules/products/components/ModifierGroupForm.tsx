
"use client";

import { useState } from "react";
import { X } from "lucide-react";

import type {
  ModifierGroup,
  ModifierGroupInput,
} from "../types/modifier";

type Props = {
  group: ModifierGroup | null;
  saving: boolean;
  onClose: () => void;
  onSave: (input: ModifierGroupInput) => Promise<void>;
};

export default function ModifierGroupForm({
  group,
  saving,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState(group?.name ?? "");
  const [minSelections, setMinSelections] = useState(
    String(group?.minSelections ?? 0),
  );
  const [maxSelections, setMaxSelections] = useState(
    String(group?.maxSelections ?? 1),
  );
  const [sortOrder, setSortOrder] = useState(
    String(group?.sortOrder ?? 0),
  );
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const min = Number(minSelections);
    const max = Number(maxSelections);
    const order = Number(sortOrder);

    if (!trimmedName) {
      setError("El nombre del grupo es obligatorio.");
      return;
    }

    if (
      !Number.isSafeInteger(min) ||
      !Number.isSafeInteger(max) ||
      min < 0 ||
      max < 1 ||
      min > max
    ) {
      setError(
        "El mínimo debe ser 0 o mayor, y el máximo debe ser al menos 1 y no menor que el mínimo.",
      );
      return;
    }

    if (!Number.isSafeInteger(order) || order < 0) {
      setError("El orden debe ser un entero no negativo.");
      return;
    }

    try {
      await onSave({
        name: trimmedName,
        minSelections: min,
        maxSelections: max,
        sortOrder: order,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar el grupo.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modifier-group-form-title"
        className="w-full max-w-lg rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3
            id="modifier-group-form-title"
            className="text-lg font-semibold text-gray-900"
          >
            {group ? "Editar grupo" : "Nuevo grupo"}
          </h3>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Cerrar"
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="modifier-group-name"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Nombre del grupo
              </label>
              <input
                id="modifier-group-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej. Tipo de leche"
                maxLength={150}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="modifier-group-min"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Mínimo
                </label>
                <input
                  id="modifier-group-min"
                  type="number"
                  min="0"
                  step="1"
                  value={minSelections}
                  onChange={(event) =>
                    setMinSelections(event.target.value)
                  }
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400"
                />
              </div>

              <div>
                <label
                  htmlFor="modifier-group-max"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Máximo
                </label>
                <input
                  id="modifier-group-max"
                  type="number"
                  min="1"
                  step="1"
                  value={maxSelections}
                  onChange={(event) =>
                    setMaxSelections(event.target.value)
                  }
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Mínimo 0 significa que el grupo es opcional.
              Mínimo 1 o mayor significa que el cliente debe
              elegir al menos esa cantidad de opciones.
            </p>

            <div>
              <label
                htmlFor="modifier-group-order"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Orden de visualización
              </label>
              <input
                id="modifier-group-order"
                type="number"
                min="0"
                step="1"
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(event.target.value)
                }
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400"
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
            >
              {saving
                ? "Guardando..."
                : group
                  ? "Guardar cambios"
                  : "Crear grupo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
