
"use client";

import { useState } from "react";
import { X } from "lucide-react";

import type {
  ModifierOption,
  ModifierOptionInput,
} from "../types/modifier";

type Props = {
  option: ModifierOption | null;
  saving: boolean;
  onClose: () => void;
  onSave: (input: ModifierOptionInput) => Promise<void>;
};

export default function ModifierOptionForm({
  option,
  saving,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState(option?.name ?? "");
  const [price, setPrice] = useState(
    option
      ? (option.priceInCents / 100).toFixed(2)
      : "0.00",
  );
  const [sortOrder, setSortOrder] = useState(
    String(option?.sortOrder ?? 0),
  );
  const [isAvailable, setIsAvailable] = useState(
    option?.isAvailable ?? true,
  );
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const priceNumber = Number(price);
    const orderNumber = Number(sortOrder);

    if (!trimmedName) {
      setError("El nombre de la opción es obligatorio.");
      return;
    }

    if (
      !price.trim() ||
      !/^\d+(\.\d{1,2})?$/.test(price.trim()) ||
      !Number.isFinite(priceNumber) ||
      priceNumber < 0
    ) {
      setError(
        "Ingresa un recargo válido, con máximo dos decimales.",
      );
      return;
    }

    const priceInCents = Math.round(priceNumber * 100);

    if (!Number.isSafeInteger(priceInCents)) {
      setError("El recargo es demasiado grande.");
      return;
    }

    if (
      !sortOrder.trim() ||
      !Number.isSafeInteger(orderNumber) ||
      orderNumber < 0
    ) {
      setError(
        "El orden debe ser un número entero no negativo.",
      );
      return;
    }

    try {
      await onSave({
        name: trimmedName,
        priceInCents,
        isAvailable,
        sortOrder: orderNumber,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar la opción.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modifier-option-form-title"
        className="w-full max-w-lg rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3
            id="modifier-option-form-title"
            className="text-lg font-semibold text-gray-900"
          >
            {option ? "Editar opción" : "Nueva opción"}
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
                htmlFor="modifier-option-name"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Nombre
              </label>
              <input
                id="modifier-option-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej. Leche de almendra"
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400"
              />
            </div>

            <div>
              <label
                htmlFor="modifier-option-price"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Recargo (MXN)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  $
                </span>
                <input
                  id="modifier-option-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-7 pr-3 text-sm outline-none transition focus:border-gray-400"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Usa 0.00 para opciones sin costo adicional.
              </p>
            </div>

            <div>
              <label
                htmlFor="modifier-option-order"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Orden de visualización
              </label>
              <input
                id="modifier-option-order"
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

            <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(event) =>
                  setIsAvailable(event.target.checked)
                }
                className="h-4 w-4 accent-gray-900"
              />
              <span className="text-sm text-gray-700">
                Opción disponible para pedidos
              </span>
            </label>
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
                : option
                  ? "Guardar cambios"
                  : "Crear opción"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
