"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createProduct,
  getProducts,
  updateProduct,
  updateProductAvailability,
} from "../services/products.service";

import type {
  Product,
  ProductInput,
} from "../types/product";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getProducts();

      setProducts(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los productos",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const addProduct = async (
    input: ProductInput,
  ) => {
    try {
      setSaving(true);
      setError("");

      await createProduct(input);
      await loadProducts();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo crear el producto";

      setError(message);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const editProduct = async (
    productId: number,
    input: ProductInput,
  ) => {
    try {
      setSaving(true);
      setError("");

      await updateProduct(productId, input);
      await loadProducts();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el producto";

      setError(message);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const changeAvailability = async (
    productId: number,
    isAvailable: boolean,
  ) => {
    try {
      setSaving(true);
      setError("");

      await updateProductAvailability(
        productId,
        isAvailable,
      );

      await loadProducts();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo cambiar la disponibilidad";

      setError(message);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return {
    products,
    loading,
    saving,
    error,
    loadProducts,
    addProduct,
    editProduct,
    changeAvailability,
  };
}