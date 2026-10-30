
"use client";

import { useCallback, useState } from "react";

import {
  getInactiveModifierGroups,
  getInactiveModifierOptions,
  restoreModifierGroup,
  restoreModifierOption,
} from "../services/modifierGroups.service";

import type {
  ModifierGroup,
  ModifierOption,
} from "../types/modifier";

export function useInactiveModifiers() {
  const [inactiveGroups, setInactiveGroups] =
    useState<ModifierGroup[]>([]);

  const [inactiveOptions, setInactiveOptions] =
    useState<ModifierOption[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadInactiveGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getInactiveModifierGroups();
      setInactiveGroups(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los grupos desactivados.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadInactiveOptions = useCallback(
    async (groupId: number) => {
      try {
        setLoading(true);
        setError("");

        const data = await getInactiveModifierOptions(
          groupId,
        );

        setInactiveOptions(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar las opciones eliminadas.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const reactivateGroup = async (groupId: number) => {
    try {
      setSaving(true);
      setError("");

      await restoreModifierGroup(groupId);
      await loadInactiveGroups();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo restaurar el grupo.",
      );
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const reactivateOption = async (
    groupId: number,
    optionId: number,
  ) => {
    try {
      setSaving(true);
      setError("");

      await restoreModifierOption(optionId);
      await loadInactiveOptions(groupId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo restaurar la opción.",
      );
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    inactiveGroups,
    inactiveOptions,
    loading,
    saving,
    error,
    loadInactiveGroups,
    loadInactiveOptions,
    reactivateGroup,
    reactivateOption,
  };
}