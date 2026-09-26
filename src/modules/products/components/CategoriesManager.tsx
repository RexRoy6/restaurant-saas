"use client";

import { useState } from "react";
import {
  Pencil,
  Plus,
  X,
} from "lucide-react";

import { useCategoriesAdmin } from "../hooks/useCategoriesAdmin";

import type { Category } from "../types/category";

type CategoryFormState = {
  name: string;
  sortOrder: string;
};

const emptyForm: CategoryFormState = {
  name: "",
  sortOrder: "0",
};

export default function CategoriesManager() {
  const {
    categories,
    loading,
    saving,
    error,
    addCategory,
    editCategory,
    changeAvailability,
  } = useCategoriesAdmin();

  const [showForm, setShowForm] =
    useState(false);

  const [
    editingCategory,
    setEditingCategory,
  ] = useState<Category | null>(null);

  const [form, setForm] =
    useState<CategoryFormState>(emptyForm);

  const [formError, setFormError] =
    useState("");

  const openCreate = () => {
    setEditingCategory(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (
    category: Category,
  ) => {
    setEditingCategory(category);

    setForm({
      name: category.name,
      sortOrder: String(
        category.sortOrder,
      ),
    });

    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingCategory(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setFormError("");

    const name = form.name.trim();
    const sortOrder = Number(
      form.sortOrder,
    );

    if (!name) {
      setFormError(
        "El nombre es obligatorio.",
      );
      return;
    }

    if (
      !Number.isInteger(sortOrder) ||
      sortOrder < 0
    ) {
      setFormError(
        "El orden debe ser un número entero mayor o igual a 0.",
      );
      return;
    }

    const input = {
      name,
      sortOrder,
    };

    const success = editingCategory
      ? await editCategory(
          editingCategory.id,
          input,
        )
      : await addCategory(input);

    if (success) {
      closeForm();
    }
  };

  return (
    <>
      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              Categorías
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Organiza tus productos para facilitar la toma de órdenes.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Plus size={17} />
            Nueva categoría
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center text-sm text-gray-500">
            Cargando categorías...
          </div>
        ) : categories.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-gray-200 p-6 text-center">
            <p className="font-medium text-gray-900">
              Todavía no hay categorías
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Crea una categoría antes de agregar productos.
            </p>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Categoría
                  </th>

                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Orden
                  </th>

                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Estado
                  </th>

                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {categories.map(
                  (category) => {
                    const isActive =
                      category.deletedAt ===
                      null;

                    return (
                      <tr
                        key={category.id}
                      >
                        <td className="py-4 pr-4">
                          <span className="font-medium text-gray-900">
                            {category.name}
                          </span>
                        </td>

                        <td className="py-4 pr-4 text-sm text-gray-500">
                          {
                            category.sortOrder
                          }
                        </td>

                        <td className="py-4 pr-4">
                          <span
                            className={
                              isActive
                                ? "inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
                                : "inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                            }
                          >
                            {isActive
                              ? "Activa"
                              : "Deshabilitada"}
                          </span>
                        </td>

                        <td className="py-4">
                          <div className="flex items-center justify-end gap-2">
                            {isActive && (
                              <button
                                type="button"
                                onClick={() =>
                                  openEdit(
                                    category,
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                              >
                                <Pencil
                                  size={15}
                                />
                                Editar
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={
                                saving
                              }
                              onClick={() =>
                                void changeAvailability(
                                  category.id,
                                  !isActive,
                                )
                              }
                              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isActive
                                ? "Deshabilitar"
                                : "Reactivar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCategory
                  ? "Editar categoría"
                  : "Nueva categoría"}
              </h3>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Nombre
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(
                      event,
                    ) =>
                      setForm({
                        ...form,
                        name: event
                          .target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400"
                    placeholder="Ej. Bebidas"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Orden
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      form.sortOrder
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm({
                        ...form,
                        sortOrder:
                          event.target
                            .value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400"
                    placeholder="0"
                  />

                  <p className="mt-1.5 text-xs text-gray-400">
                    Los números menores aparecen primero.
                  </p>
                </div>
              </div>

              {formError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Guardando..."
                    : editingCategory
                      ? "Guardar cambios"
                      : "Crear categoría"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}