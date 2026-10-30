
"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getModifierGroups,
  createModifierGroup,
  updateModifierGroup,
  deleteModifierGroup,
  restoreModifierGroup,
  createModifierOption,
  updateModifierOption,
  deleteModifierOption,
  restoreModifierOption,
} from "../services/modifierGroups.service";

import type {
  ModifierGroup,
  ModifierGroupInput,
  ModifierGroupUpdateInput,
  ModifierOptionInput,
  ModifierOptionUpdateInput,
} from "../types/modifier";

export function useModifierGroups() {
  const [groups, setGroups] = useState<
    ModifierGroup[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getModifierGroups();

      setGroups(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los modificadores",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  const runMutation = async (
    operation: () => Promise<void>,
  ) => {
    try {
      setSaving(true);
      setError("");

      await operation();
      await loadGroups();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo guardar el modificador";

      setError(message);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const addGroup = async (
    input: ModifierGroupInput,
  ) => {
    await runMutation(() =>
      createModifierGroup(input),
    );
  };

  const editGroup = async (
    groupId: number,
    input: ModifierGroupUpdateInput,
  ) => {
    await runMutation(() =>
      updateModifierGroup(groupId, input),
    );
  };

  const removeGroup = async (
    groupId: number,
  ) => {
    await runMutation(() =>
      deleteModifierGroup(groupId),
    );
  };

  const reactivateGroup = async (
    groupId: number,
  ) => {
    await runMutation(() =>
      restoreModifierGroup(groupId),
    );
  };

  const addOption = async (
    groupId: number,
    input: ModifierOptionInput,
  ) => {
    await runMutation(() =>
      createModifierOption(groupId, input),
    );
  };

  const editOption = async (
    optionId: number,
    input: ModifierOptionUpdateInput,
  ) => {
    await runMutation(() =>
      updateModifierOption(optionId, input),
    );
  };

  const removeOption = async (
    optionId: number,
  ) => {
    await runMutation(() =>
      deleteModifierOption(optionId),
    );
  };

  const reactivateOption = async (
    optionId: number,
  ) => {
    await runMutation(() =>
      restoreModifierOption(optionId),
    );
  };

  return {
    groups,
    loading,
    saving,
    error,
    loadGroups,
    addGroup,
    editGroup,
    removeGroup,
    reactivateGroup,
    addOption,
    editOption,
    removeOption,
    reactivateOption,
  };
}
