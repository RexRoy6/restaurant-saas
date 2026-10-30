
"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, X } from "lucide-react";

import {
  getProductModifierGroups,
} from "@/modules/products/services/productModifierGroups.service";

import type {
  ProductModifierGroupAssignment,
} from "@/modules/products/types/productModifierGroup";

import type { Product } from "@/modules/products/types/product";

export type ConfiguredOrderItem = {
  productId: number;
  productName: string;
  basePriceInCents: number;
  quantity: number;
  modifierOptionIds: number[];
  modifierSummary: string[];
  estimatedUnitPriceInCents: number;
};

type Props = {
  product: Product;
  onClose: () => void;
  onAdd: (item: ConfiguredOrderItem) => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value / 100);
}

export default function OrderProductModifiersModal({
  product,
  onClose,
  onAdd,
}: Props) {
  const [assignments, setAssignments] = useState<
    ProductModifierGroupAssignment[]
  >([]);

  const [selectedOptionIds, setSelectedOptionIds] =
    useState<number[]>([]);

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getProductModifierGroups(product.id);

        if (active) {
          setAssignments(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los modificadores.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [product.id]);

  const availableAssignments = useMemo(
    () =>
      assignments.map((assignment) => ({
        ...assignment,
        group: {
          ...assignment.group,
          options: assignment.group.options.filter(
            (option) => option.isAvailable,
          ),
        },
      })),
    [assignments],
  );

  const toggleOption = (
    groupId: number,
    optionId: number,
    maxSelections: number,
  ) => {
    const group = availableAssignments.find(
      (assignment) => assignment.group.id === groupId,
    )?.group;

    if (!group) return;

    const groupOptionIds = new Set(
      group.options.map((option) => option.id),
    );

    setSelectedOptionIds((current) => {
      if (current.includes(optionId)) {
        return current.filter((id) => id !== optionId);
      }

      const selectedInGroup = current.filter(
        (id) => groupOptionIds.has(id),
      );

      if (maxSelections === 1) {
        return [
          ...current.filter(
            (id) => !groupOptionIds.has(id),
          ),
          optionId,
        ];
      }

      if (selectedInGroup.length >= maxSelections) {
        return current;
      }

      return [...current, optionId];
    });
  };

  const validationError = useMemo(() => {
    for (const assignment of availableAssignments) {
      const group = assignment.group;

      const selectedCount = group.options.filter(
        (option) =>
          selectedOptionIds.includes(option.id),
      ).length;

      if (
        selectedCount < group.minSelections ||
        selectedCount > group.maxSelections
      ) {
        return `Selecciona entre ${group.minSelections} y ${group.maxSelections} opciones de "${group.name}".`;
      }
    }

    return "";
  }, [availableAssignments, selectedOptionIds]);

  const selectedOptions = useMemo(
    () =>
      availableAssignments.flatMap(
        (assignment) =>
          assignment.group.options
            .filter((option) =>
              selectedOptionIds.includes(option.id),
            )
            .map((option) => ({
              option,
              groupName: assignment.group.name,
            })),
      ),
    [availableAssignments, selectedOptionIds],
  );

  const estimatedUnitPriceInCents =
    product.priceInCents +
    selectedOptions.reduce(
      (sum, entry) =>
        sum + entry.option.priceInCents,
      0,
    );

  const handleAdd = () => {
    if (loading || error || validationError) {
      return;
    }

    onAdd({
      productId: product.id,
      productName: product.name,
      basePriceInCents: product.priceInCents,
      quantity,
      modifierOptionIds: selectedOptions.map(
        (entry) => entry.option.id,
      ),
      modifierSummary: selectedOptions.map(
        (entry) =>
          `${entry.groupName}: ${entry.option.name}`,
      ),
      estimatedUnitPriceInCents,
    });
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modifiers-title"
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-6 py-4">
          <div>
            <h3
              id="order-modifiers-title"
              className="text-lg font-semibold text-gray-900"
            >
              Personalizar producto
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {product.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto p-6">
          {loading ? (
            <p className="py-6 text-center text-sm text-gray-500">
              Cargando modificadores...
            </p>
          ) : error ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          ) : availableAssignments.length === 0 ? (
            <p className="text-sm text-gray-500">
              Este producto no requiere modificadores.
            </p>
          ) : (
            availableAssignments.map(({ group }) => (
              <section
                key={group.id}
                className="space-y-3 rounded-xl border border-gray-200 p-4"
              >
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {group.name}
                  </h4>

                  <p className="mt-1 text-xs text-gray-500">
                    Selecciona entre {group.minSelections} y{" "}
                    {group.maxSelections} opciones
                  </p>
                </div>

                {group.options.length === 0 ? (
                  <p className="text-sm text-amber-700">
                    No hay opciones disponibles.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {group.options.map((option) => {
                      const checked =
                        selectedOptionIds.includes(option.id);

                      return (
                        <label
                          key={option.id}
                          className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2 hover:bg-gray-50"
                        >
                          <span className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type={
                                group.maxSelections === 1
                                  ? "radio"
                                  : "checkbox"
                              }
                              name={`modifier-group-${group.id}`}
                              checked={checked}
                              onChange={() =>
                                toggleOption(
                                  group.id,
                                  option.id,
                                  group.maxSelections,
                                )
                              }
                            />
                            {option.name}
                          </span>

                          <span className="shrink-0 text-xs font-medium text-gray-700">
                            {option.priceInCents === 0
                              ? "Sin recargo"
                              : `+${formatCurrency(
                                  option.priceInCents,
                                )}`}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </section>
            ))
          )}

          {validationError && !loading && !error && (
            <p className="text-sm text-amber-700">
              {validationError}
            </p>
          )}
        </div>

        <div className="space-y-4 border-t border-gray-100 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Cantidad
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setQuantity((value) =>
                    Math.max(1, value - 1),
                  )
                }
                disabled={quantity <= 1}
                className="rounded-lg border border-gray-200 bg-white p-2 disabled:opacity-40"
              >
                <Minus size={15} />
              </button>

              <span className="min-w-6 text-center text-sm font-semibold">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() =>
                  setQuantity((value) => value + 1)
                }
                className="rounded-lg bg-gray-900 p-2 text-white"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Subtotal estimado
            </span>

            <span className="text-lg font-semibold text-gray-900">
              {formatCurrency(
                estimatedUnitPriceInCents * quantity,
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={
              loading ||
              Boolean(error) ||
              Boolean(validationError)
            }
            className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Agregar al pedido
          </button>
        </div>
      </div>
    </div>
  );
}