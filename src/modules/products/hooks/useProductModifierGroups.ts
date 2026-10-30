
"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getProductModifierGroups,
  assignModifierGroupToProduct,
  removeModifierGroupFromProduct,
} from "../services/productModifierGroups.service";

import type {
  AssignModifierGroupInput,
  ProductModifierGroupAssignment,
} from "../types/productModifierGroup";

export function useProductModifierGroups(
  productId: number,
) {
  const [assignments, setAssignments] = useState<
    ProductModifierGroupAssignment[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getProductModifierGroups(
        productId,
      );

      setAssignments(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los modificadores del producto.",
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void loadAssignments();
  }, [loadAssignments]);

  const runMutation = async (
    operation: () => Promise<void>,
  ) => {
    try {
      setSaving(true);
      setError("");

      await operation();
      await loadAssignments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el producto.",
      );

      throw err;
    } finally {
      setSaving(false);
    }
  };

  const assignGroup = async (
    input: AssignModifierGroupInput,
  ) => {
    await runMutation(() =>
      assignModifierGroupToProduct(
        productId,
        input,
      ),
    );
  };

  const removeGroup = async (
    groupId: number,
  ) => {
    await runMutation(() =>
      removeModifierGroupFromProduct(
        productId,
        groupId,
      ),
    );
  };

  return {
    assignments,
    loading,
    saving,
    error,
    loadAssignments,
    assignGroup,
    removeGroup,
  };
}