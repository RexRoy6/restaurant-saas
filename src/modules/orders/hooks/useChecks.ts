"use client";

import {
  useCallback,
  useEffect,
  useRef,
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

  //refresh
  const isFetchingRef = useRef(false);

  const loadChecks = useCallback(
    async (silent = false) => {
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;

      try {
        if (!silent) {
          setLoading(true);
        }

        setError(null);

        const data = await getChecks();

        setChecks(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las cuentas",
        );
      } finally {
        isFetchingRef.current = false;

        if (!silent) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    void loadChecks();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadChecks(true);
      }
    }, 5000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadChecks(true);
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      window.clearInterval(intervalId);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
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