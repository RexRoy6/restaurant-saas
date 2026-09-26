"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  Category,
  CategoryInput,
} from "../types/category";

import {
  changeCategoryAvailability,
  createCategory,
  getCategories,
  updateCategory,
} from "../services/categories.service";

export function useCategories() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadCategories =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const data =
          await getCategories();

        setCategories(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Could not load categories",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  async function addCategory(
    input: CategoryInput,
  ) {
    try {
      setSaving(true);
      setError(null);

      await createCategory(input);
      await loadCategories();

      return true;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not create category",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function editCategory(
    id: number,
    input: CategoryInput,
  ) {
    try {
      setSaving(true);
      setError(null);

      await updateCategory(id, input);
      await loadCategories();

      return true;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not update category",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function changeAvailability(
    id: number,
    isActive: boolean,
  ) {
    try {
      setSaving(true);
      setError(null);

      await changeCategoryAvailability(
        id,
        isActive,
      );

      await loadCategories();

      return true;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not update category",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  return {
    categories,
    loading,
    saving,
    error,
    loadCategories,
    addCategory,
    editCategory,
    changeAvailability,
  };
}