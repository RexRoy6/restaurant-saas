"use client";

import { useState } from "react";
import {
  Minus,
  Plus,
  ShoppingCart,
  X,
} from "lucide-react";

import { useCategories } from "@/modules/products/hooks/useCategories";
import { useProducts } from "@/modules/products/hooks/useProducts";

import type {
  CreateOrderInput,
} from "../types/order";

type CreateOrderModalProps = {
  saving: boolean;
  onClose: () => void;
  onCreate: (
    input: CreateOrderInput,
  ) => Promise<boolean>;
};

function formatCurrency(
  amountInCents: number,
) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amountInCents / 100);
}

export default function CreateOrderModal({
  saving,
  onClose,
  onCreate,
}: CreateOrderModalProps) {
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useProducts();

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const [
    selectedCategoryId,
    setSelectedCategoryId,
  ] = useState<number | null>(null);

  const [
    quantities,
    setQuantities,
  ] = useState<Record<number, number>>({});

  const [formError, setFormError] =
    useState("");

  const availableProducts =
    products.filter(
      (product) => product.isAvailable,
    );

  const visibleProducts =
    selectedCategoryId === null
      ? availableProducts
      : availableProducts.filter(
          (product) =>
            product.categoryId ===
            selectedCategoryId,
        );

  const selectedItems =
    availableProducts
      .map((product) => ({
        product,
        quantity:
          quantities[product.id] ?? 0,
      }))
      .filter(
        (item) => item.quantity > 0,
      );

  const totalInCents =
    selectedItems.reduce(
      (total, item) =>
        total +
        item.product.priceInCents *
          item.quantity,
      0,
    );

  const totalQuantity =
    selectedItems.reduce(
      (total, item) =>
        total + item.quantity,
      0,
    );

  const changeQuantity = (
    productId: number,
    delta: number,
  ) => {
    setQuantities((current) => {
      const currentQuantity =
        current[productId] ?? 0;

      const nextQuantity =
        Math.max(
          0,
          currentQuantity + delta,
        );

      return {
        ...current,
        [productId]: nextQuantity,
      };
    });
  };

  const handleClose = () => {
    if (saving) {
      return;
    }

    onClose();
  };

  const handleSubmit = async () => {
    setFormError("");

    if (selectedItems.length === 0) {
      setFormError(
        "Agrega al menos un producto a la orden.",
      );
      return;
    }

    const input: CreateOrderInput = {
      items: selectedItems.map(
        ({ product, quantity }) => ({
          productId: product.id,
          quantity,
        }),
      ),
    };

    const success =
      await onCreate(input);

    if (success) {
      onClose();
    }
  };

  const loading =
    productsLoading ||
    categoriesLoading;

  const loadError =
    productsError ||
    categoriesError;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Agregar productos
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Selecciona los productos de esta orden.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-500">
              Cargando productos...
            </div>
          ) : loadError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          ) : (
            <>
              {categories.length > 0 && (
                <div className="mb-6 overflow-x-auto">
                  <div className="flex min-w-max gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedCategoryId(
                          null,
                        )
                      }
                      className={
                        selectedCategoryId ===
                        null
                          ? "rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white"
                          : "rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                      }
                    >
                      Todos
                    </button>

                    {categories.map(
                      (category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() =>
                            setSelectedCategoryId(
                              category.id,
                            )
                          }
                          className={
                            selectedCategoryId ===
                            category.id
                              ? "rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white"
                              : "rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                          }
                        >
                          {category.name}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}

              {availableProducts.length ===
              0 ? (
                <div className="py-10 text-center">
                  <ShoppingCart
                    size={28}
                    className="mx-auto text-gray-300"
                  />

                  <p className="mt-3 font-medium text-gray-900">
                    No hay productos disponibles
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Activa productos desde la sección Productos.
                  </p>
                </div>
              ) : visibleProducts.length ===
                0 ? (
                <div className="py-10 text-center text-sm text-gray-500">
                  No hay productos disponibles en esta categoría.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {visibleProducts.map(
                    (product) => {
                      const quantity =
                        quantities[
                          product.id
                        ] ?? 0;

                      const category =
                        categories.find(
                          (item) =>
                            item.id ===
                            product.categoryId,
                        );

                      return (
                        <div
                          key={product.id}
                          className="rounded-xl border border-gray-200 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900">
                                {product.name}
                              </p>

                              <p className="mt-1 text-xs text-gray-400">
                                {category?.name ??
                                  "Categoría"}
                              </p>
                            </div>

                            <p className="shrink-0 text-sm font-semibold text-gray-900">
                              {formatCurrency(
                                product.priceInCents,
                              )}
                            </p>
                          </div>

                          <div className="mt-4 flex items-center justify-end gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                changeQuantity(
                                  product.id,
                                  -1,
                                )
                              }
                              disabled={
                                quantity === 0 ||
                                saving
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Minus
                                size={15}
                              />
                            </button>

                            <span className="min-w-6 text-center text-sm font-semibold text-gray-900">
                              {quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                changeQuantity(
                                  product.id,
                                  1,
                                )
                              }
                              disabled={saving}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white transition hover:bg-gray-800 disabled:opacity-50"
                            >
                              <Plus
                                size={15}
                              />
                            </button>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </>
          )}

          {formError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {formError}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {totalQuantity}{" "}
                {totalQuantity === 1
                  ? "producto"
                  : "productos"}
              </p>

              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(
                  totalInCents,
                )}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleSubmit()
                }
                disabled={
                  saving ||
                  loading ||
                  selectedItems.length ===
                    0
                }
                className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Creando..."
                  : "Crear orden"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}