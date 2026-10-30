
"use client";

import { useState } from "react";
import {
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";

import { useCategories } from "@/modules/products/hooks/useCategories";
import { useProducts } from "@/modules/products/hooks/useProducts";

import type { Product } from "@/modules/products/types/product";
import type { CreateOrderInput } from "../types/order";

import OrderProductModifiersModal, {
  type ConfiguredOrderItem,
} from "./OrderProductModifiersModal";

type CreateOrderModalProps = {
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onCreate: (
    input: CreateOrderInput,
  ) => Promise<boolean>;
};

type CartItem = ConfiguredOrderItem & {
  cartId: string;
};

function formatCurrency(amountInCents: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amountInCents / 100);
}

/**
 * Identifica una configuración concreta.
 *
 * Dos productos iguales con diferentes
 * modificadores deben ser renglones distintos.
 */
function createCartId(
  productId: number,
  modifierOptionIds: number[],
) {
  const sortedIds = [...modifierOptionIds].sort(
    (a, b) => a - b,
  );

  return `${productId}:${sortedIds.join(",")}`;
}

export default function CreateOrderModal({
  saving,
  error,
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

  const [cart, setCart] = useState<CartItem[]>([]);

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState<Product | null>(null);

  const [formError, setFormError] = useState("");

  const availableProducts = products.filter(
    (product) => product.isAvailable,
  );

  const visibleProducts =
    selectedCategoryId === null
      ? availableProducts
      : availableProducts.filter(
          (product) =>
            product.categoryId === selectedCategoryId,
        );

  const totalQuantity = cart.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const totalInCents = cart.reduce(
    (total, item) =>
      total +
      item.estimatedUnitPriceInCents *
        item.quantity,
    0,
  );

  const loading =
    productsLoading || categoriesLoading;

  const loadError =
    productsError || categoriesError;

  const handleAddConfiguredItem = (
    item: ConfiguredOrderItem,
  ) => {
    const cartId = createCartId(
      item.productId,
      item.modifierOptionIds,
    );

    setCart((current) => {
      const existing = current.find(
        (entry) => entry.cartId === cartId,
      );

      if (existing) {
        return current.map((entry) =>
          entry.cartId === cartId
            ? {
                ...entry,
                quantity:
                  entry.quantity + item.quantity,
              }
            : entry,
        );
      }

      return [
        ...current,
        {
          ...item,
          cartId,
        },
      ];
    });

    setFormError("");
    setSelectedProduct(null);
  };

  const changeCartQuantity = (
    cartId: string,
    delta: number,
  ) => {
    setCart((current) =>
      current
        .map((item) =>
          item.cartId === cartId
            ? {
                ...item,
                quantity: Math.max(
                  0,
                  item.quantity + delta,
                ),
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeCartItem = (cartId: string) => {
    setCart((current) =>
      current.filter(
        (item) => item.cartId !== cartId,
      ),
    );
  };

  const handleClose = () => {
    if (saving) return;

    onClose();
  };

  const handleSubmit = async () => {
    setFormError("");

    if (cart.length === 0) {
      setFormError(
        "Agrega al menos un producto a la orden.",
      );
      return;
    }

    const input: CreateOrderInput = {
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        modifierOptionIds:
          item.modifierOptionIds,
      })),
    };

    const success = await onCreate(input);

    if (success) {
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4">
        <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Agregar productos
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Selecciona y personaliza los productos.
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

          {/* CONTENT */}
          <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,1fr)_340px]">
            {/* PRODUCT CATALOG */}
            <div className="min-h-0 overflow-y-auto p-6">
              {loading ? (
                <p className="py-10 text-center text-sm text-gray-500">
                  Cargando productos...
                </p>
              ) : loadError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
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
                            setSelectedCategoryId(null)
                          }
                          className={
                            selectedCategoryId === null
                              ? "rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white"
                              : "rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                          }
                        >
                          Todos
                        </button>

                        {categories.map((category) => (
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
                                : "rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                            }
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {availableProducts.length === 0 ? (
                    <div className="py-10 text-center">
                      <ShoppingCart
                        size={28}
                        className="mx-auto text-gray-300"
                      />
                      <p className="mt-3 font-medium text-gray-900">
                        No hay productos disponibles
                      </p>
                    </div>
                  ) : visibleProducts.length === 0 ? (
                    <p className="py-10 text-center text-sm text-gray-500">
                      No hay productos en esta categoría.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {visibleProducts.map((product) => {
                        const category = categories.find(
                          (item) =>
                            item.id === product.categoryId,
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

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedProduct(product)
                              }
                              disabled={saving}
                              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                            >
                              <Plus size={16} />
                              Agregar
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* CART */}
            <div className="flex min-h-0 flex-col border-t border-gray-200 bg-gray-50 md:border-l md:border-t-0">
              <div className="border-b border-gray-200 px-5 py-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={18} />
                  <h4 className="font-semibold text-gray-900">
                    Pedido actual
                  </h4>
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  {totalQuantity}{" "}
                  {totalQuantity === 1
                    ? "producto"
                    : "productos"}
                </p>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-400">
                    Todavía no agregas productos.
                  </p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.cartId}
                      className="rounded-xl border border-gray-200 bg-white p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {item.productName}
                          </p>

                          {item.modifierSummary.length >
                            0 && (
                            <div className="mt-1 space-y-0.5">
                              {item.modifierSummary.map(
                                (summary, index) => (
                                  <p
                                    key={`${summary}-${index}`}
                                    className="text-xs text-gray-500"
                                  >
                                    {summary}
                                  </p>
                                ),
                              )}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeCartItem(item.cartId)
                          }
                          disabled={saving}
                          className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                          aria-label={`Eliminar ${item.productName}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              changeCartQuantity(
                                item.cartId,
                                -1,
                              )
                            }
                            disabled={saving}
                            className="rounded border border-gray-200 p-1 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Minus size={14} />
                          </button>

                          <span className="min-w-5 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              changeCartQuantity(
                                item.cartId,
                                1,
                              )
                            }
                            disabled={saving}
                            className="rounded border border-gray-200 p-1 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(
                            item.estimatedUnitPriceInCents *
                              item.quantity,
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-gray-200 bg-white p-4">
                {formError && (
                  <p className="mb-3 text-sm text-red-600">
                    {formError}
                  </p>
                )}

                {!formError && error && (
                  <p className="mb-3 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Total estimado
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(totalInCents)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={
                    saving ||
                    loading ||
                    cart.length === 0
                  }
                  className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving
                    ? "Creando orden..."
                    : "Crear orden"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedProduct && (
        <OrderProductModifiersModal
          key={selectedProduct.id}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={handleAddConfiguredItem}
        />
      )}
    </>
  );
}