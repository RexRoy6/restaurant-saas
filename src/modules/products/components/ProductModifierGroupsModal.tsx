
"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { useModifierGroups } from "../hooks/useModifierGroups";
import { useProductModifierGroups } from "../hooks/useProductModifierGroups";

import type { Product } from "../types/product";
import type { ModifierGroup } from "../types/modifier";

type Props = {
  product: Product;
  onClose: () => void;
};

function formatCurrency(priceInCents: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(priceInCents / 100);
}

function getSelectionLabel(group: ModifierGroup) {
  if (group.minSelections === group.maxSelections) {
    return group.minSelections === 1
      ? "Seleccionar 1 opción"
      : `Seleccionar ${group.minSelections} opciones`;
  }

  return `Seleccionar entre ${group.minSelections} y ${group.maxSelections} opciones`;
}

export default function ProductModifierGroupsModal({
  product,
  onClose,
}: Props) {
  const {
    assignments,
    loading,
    saving,
    error,
    assignGroup,
    removeGroup,
  } = useProductModifierGroups(product.id);

  const {
    groups,
    loading: loadingGroups,
    error: groupsError,
  } = useModifierGroups();

  const [selectedGroupId, setSelectedGroupId] =
    useState("");

  const [sortOrder, setSortOrder] = useState("0");

  const [actionError, setActionError] =
    useState("");

  const [removingGroupId, setRemovingGroupId] =
    useState<number | null>(null);

  const assignedGroupIds = useMemo(
    () =>
      new Set(
        assignments.map(
          (assignment) => assignment.group.id,
        ),
      ),
    [assignments],
  );

  const availableGroups = useMemo(
    () =>
      groups.filter(
        (group) => !assignedGroupIds.has(group.id),
      ),
    [groups, assignedGroupIds],
  );

  const selectedGroup = availableGroups.find(
    (group) => group.id === Number(selectedGroupId),
  );

  const handleAssign = async () => {
    setActionError("");

    const groupId = Number(selectedGroupId);
    const order = Number(sortOrder);

    if (
      !Number.isSafeInteger(groupId) ||
      groupId <= 0 ||
      !availableGroups.some(
        (group) => group.id === groupId,
      )
    ) {
      setActionError(
        "Selecciona un grupo válido.",
      );
      return;
    }

    if (
      !Number.isSafeInteger(order) ||
      order < 0
    ) {
      setActionError(
        "El orden debe ser un número entero mayor o igual a cero.",
      );
      return;
    }

    try {
      await assignGroup({
        groupId,
        sortOrder: order,
      });

      setSelectedGroupId("");
      setSortOrder("0");
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "No se pudo asignar el grupo.",
      );
    }
  };

  const handleRemove = async (
    groupId: number,
  ) => {
    const confirmed = window.confirm(
      "¿Quitar este grupo del producto? El grupo y sus opciones seguirán disponibles para otros productos.",
    );

    if (!confirmed) return;

    setActionError("");
    setRemovingGroupId(groupId);

    try {
      await removeGroup(groupId);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "No se pudo quitar el grupo.",
      );
    } finally {
      setRemovingGroupId(null);
    }
  };

  const busy =
    saving || loading || loadingGroups;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modifiers-title"
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div>
            <h3
              id="product-modifiers-title"
              className="text-lg font-semibold text-gray-900"
            >
              Modificadores del producto
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {product.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Cerrar modal"
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div className="space-y-6 overflow-y-auto p-6">
          {(error || groupsError || actionError) && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {actionError || error || groupsError}
            </div>
          )}

          {/* Grupos asignados */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">
                Grupos asignados
              </h4>

              <span className="text-xs text-gray-500">
                {assignments.length} grupo(s)
              </span>
            </div>

            {loading ? (
              <p className="py-6 text-center text-sm text-gray-500">
                Cargando modificadores...
              </p>
            ) : assignments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center">
                <p className="text-sm font-medium text-gray-800">
                  Este producto no tiene modificadores
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Asigna un grupo existente desde la sección inferior.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.assignmentId}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {assignment.group.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {getSelectionLabel(assignment.group)}
                          {" · "}
                          Orden: {assignment.sortOrder}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void handleRemove(
                            assignment.group.id,
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                        {removingGroupId ===
                        assignment.group.id
                          ? "Quitando..."
                          : "Quitar"}
                      </button>
                    </div>

                    <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                      {assignment.group.options.length === 0 ? (
                        <p className="text-xs text-gray-500">
                          Este grupo no tiene opciones activas.
                        </p>
                      ) : (
                        assignment.group.options.map(
                          (option) => (
                            <div
                              key={option.id}
                              className="flex items-center justify-between gap-3 text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-gray-700">
                                  {option.name}
                                </span>

                                {!option.isAvailable && (
                                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                                    No disponible
                                  </span>
                                )}
                              </div>

                              <span className="shrink-0 font-medium text-gray-700">
                                {option.priceInCents === 0
                                  ? "Sin recargo"
                                  : `+${formatCurrency(
                                      option.priceInCents,
                                    )}`}
                              </span>
                            </div>
                          ),
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Asignar un grupo */}
          <section className="border-t border-gray-100 pt-5">
            <h4 className="mb-2 font-semibold text-gray-900">
              Agregar grupo de modificadores
            </h4>

            <p className="mb-4 text-sm text-gray-500">
              Los grupos son reutilizables y pueden asignarse
              a varios productos.
            </p>

            {loadingGroups ? (
              <p className="text-sm text-gray-500">
                Cargando grupos disponibles...
              </p>
            ) : availableGroups.length === 0 ? (
              <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">
                No hay más grupos disponibles para asignar.
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="product-modifier-group"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Grupo
                  </label>

                  <select
                    id="product-modifier-group"
                    value={selectedGroupId}
                    onChange={(event) =>
                      setSelectedGroupId(
                        event.target.value,
                      )
                    }
                    disabled={busy}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-400 disabled:opacity-50"
                  >
                    <option value="">
                      Selecciona un grupo
                    </option>

                    {availableGroups.map((group) => (
                      <option
                        key={group.id}
                        value={group.id}
                      >
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedGroup && (
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-700">
                      {getSelectionLabel(selectedGroup)}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {selectedGroup.options.length} opción(es)
                      activa(s) en el catálogo
                    </p>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="product-modifier-sort-order"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Orden de aparición
                  </label>

                  <input
                    id="product-modifier-sort-order"
                    type="number"
                    min="0"
                    step="1"
                    value={sortOrder}
                    onChange={(event) =>
                      setSortOrder(event.target.value)
                    }
                    disabled={busy}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400 disabled:opacity-50"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void handleAssign()}
                  disabled={busy || !selectedGroupId}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
                >
                  <Plus size={16} />
                  {saving
                    ? "Guardando..."
                    : "Asignar grupo"}
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Pie */}
        <div className="flex justify-end border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}