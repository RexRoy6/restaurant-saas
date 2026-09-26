"use client";

import { useState } from "react";
import {
  Pencil,
  Plus,
  X,
} from "lucide-react";

import { useProducts } from "../hooks/useProducts";
import CategoriesManager from "./CategoriesManager";
import { useCategories } from "../hooks/useCategories";
import type {
  Product,
  ProductInput,
} from "../types/product";

type ProductFormState = {
  categoryId: string;
  name: string;
  sku: string;
  price: string;
};

const emptyForm: ProductFormState = {
  categoryId: "",
  name: "",
  sku: "",
  price: "",
};

function formatCurrency(
  priceInCents: number,
) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(priceInCents / 100);
}

export default function ProductsManager() {
  const {
    products,
    loading,
    saving,
    error,
    addProduct,
    editProduct,
    changeAvailability,
  } = useProducts();
  const {
    categories,
    loading: categoriesLoading,
    loadCategories,
  } = useCategories();


  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [form, setForm] =
    useState<ProductFormState>(emptyForm);

  const [formError, setFormError] = useState("");

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);

    setForm({
      categoryId: String(product.categoryId),
      name: product.name,
      sku: product.sku,
      price: (
        product.priceInCents / 100
      ).toFixed(2),
    });

    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingProduct(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setFormError("");
    const categoryId = Number(
      form.categoryId,
    );
    const name = form.name.trim();
    const sku = form.sku.trim();
    const price = Number(form.price);
    if (
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {
      setFormError(
        "Selecciona una categoría.",
      );
      return;
    }


    if (!name) {
      setFormError("El nombre es obligatorio.");
      return;
    }

    if (!sku) {
      setFormError("El SKU es obligatorio.");
      return;
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      setFormError(
        "Ingresa un precio válido.",
      );
      return;
    }

    const priceInCents = Math.round(
      price * 100,
    );

    const input: ProductInput = {
      categoryId,
      name,
      sku,
      priceInCents,
    };

    try {
      if (editingProduct) {
        await editProduct(
          editingProduct.id,
          input,
        );
      } else {
        await addProduct(input);
      }

      closeForm();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el producto.",
      );
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Productos
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Administra los productos disponibles de tu negocio.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          disabled={
            categoriesLoading ||
            categories.length === 0
          }
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={18} />
          Nuevo producto
        </button>
      </div>

      {!categoriesLoading &&
        categories.length === 0 && (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Crea al menos una categoría antes de agregar productos.
          </div>
        )}

      {error && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <CategoriesManager
        onCategoriesChanged={loadCategories}
      />

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">


        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Cargando productos...
          </div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-gray-900">
              Todavía no hay productos
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Crea tu primer producto para comenzar.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {/* <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Categoría
                  </th> */}

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Nombre
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    SKU
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Precio
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Estado
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50/70"
                  >
                    {/* <td className="px-5 py-4">
                      <span className="font-medium text-gray-900">
                        {product.categoryId}
                      </span>
                    </td> */}

                    <td className="px-5 py-4">
                      <span className="font-medium text-gray-900">
                        {product.name}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-500">
                      {product.sku}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(
                        product.priceInCents,
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          product.isAvailable
                            ? "inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
                            : "inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                        }
                      >
                        {product.isAvailable
                          ? "Disponible"
                          : "No disponible"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEdit(product)
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                        >
                          <Pencil size={15} />
                          Editar
                        </button>

                        <button
                          type="button"
                          disabled={saving}
                          onClick={() =>
                            void changeAvailability(
                              product.id,
                              !product.isAvailable,
                            )
                          }
                          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {product.isAvailable
                            ? "Desactivar"
                            : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingProduct
                  ? "Editar producto"
                  : "Nuevo producto"}
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
                    Categoría
                  </label>

                  <select
                    value={form.categoryId}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        categoryId: event.target.value,
                      })
                    }
                    disabled={categoriesLoading}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-400 disabled:cursor-not-allowed disabled:bg-gray-50"
                  >
                    <option value="">
                      {categoriesLoading
                        ? "Cargando categorías..."
                        : "Selecciona una categoría"}
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>


                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Nombre
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        name: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400"
                    placeholder="Ej. Café Americano"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    SKU
                  </label>

                  <input
                    type="text"
                    value={form.sku}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        sku: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400"
                    placeholder="Ej. CAFE-01250826"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Precio
                  </label>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      $
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          price: event.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-gray-200 py-2.5 pl-7 pr-3 text-sm outline-none transition focus:border-gray-400"
                      placeholder="0.00"
                    />
                  </div>
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
                    : editingProduct
                      ? "Guardar cambios"
                      : "Crear producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}