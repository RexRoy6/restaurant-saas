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

  const [syncError, setSyncError] =
    useState<string | null>(null);

  //refresh
  // const isFetchingRef = useRef(false);
  const activeRequestRef = useRef<Promise<void> | null>(null);

  const loadChecks = useCallback(
    async (silent = false) => {
      // Si hay una consulta en curso:
      // - el polling no necesita iniciar otra;
      // - una actualización manual espera y vuelve a consultar.
      if (activeRequestRef.current) {
        if (silent) {
          return;
        }

        await activeRequestRef.current;
      }

      const request = (async () => {
        try {
          if (!silent) {
            setLoading(true);
          }

          if (!silent) {
            setError(null);
          }

          const data = await getChecks();

          setChecks(data);
          setSyncError(null);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "No se pudieron cargar las cuentas";

          if (silent) {
            setSyncError(message);
          } else {
            setError(message);
          }
        } finally {
          if (!silent) {
            setLoading(false);
          }
        }
      })();

      activeRequestRef.current = request;

      try {
        await request;
      } finally {
        if (activeRequestRef.current === request) {
          activeRequestRef.current = null;
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
    syncError,
    loadChecks,
    addCheck,
  };
}