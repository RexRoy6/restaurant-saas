"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createCheck,
  getChecks,
} from "../services/orders.service";

import type {
  CheckSummary,
  CreateCheckInput,
} from "../types/order";

export function useChecks() {
  const [checks, setChecks] =
    useState<CheckSummary[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadChecks =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const data =
          await getChecks();

        setChecks(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las cuentas",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadChecks();
  }, [loadChecks]);

  const addCheck = async (
    input: CreateCheckInput,
  ) => {
    try {
      setSaving(true);
      setError(null);

      const created =
        await createCheck(input);

      await loadChecks();

      return created;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo crear la cuenta";

      setError(message);

      throw error;
    } finally {
      setSaving(false);
    }
  };

  return {
    checks,
    loading,
    saving,
    error,
    loadChecks,
    addCheck,
  };
}