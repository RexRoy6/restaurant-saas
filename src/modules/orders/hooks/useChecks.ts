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
  const activeRequestRef = useRef<Promise<void> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(false);

  const loadChecks = useCallback(
    async (silent = false) => {
      if (!mountedRef.current) {
        return;
      }

      // El polling omite su ciclo si hay otra consulta.
      if (silent && activeRequestRef.current) {
        return;
      }

      // Las actualizaciones manuales esperan su turno.
      while (activeRequestRef.current) {
        await activeRequestRef.current;

        if (!mountedRef.current) {
          return;
        }
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const request = (async () => {
        try {
          if (!silent) {
            setLoading(true);
            setError(null);
          }

          const data = await getChecks(controller.signal);

          if (mountedRef.current && !controller.signal.aborted) {
            setChecks(data);
            setSyncError(null);
          }
        } catch (error) {
          if (
            controller.signal.aborted ||
            !mountedRef.current
          ) {
            return;
          }

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
          if (mountedRef.current && !silent) {
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

        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [],
  );

  useEffect(() => {
    mountedRef.current = true;

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
      mountedRef.current = false;

      window.clearInterval(intervalId);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );

      abortControllerRef.current?.abort();
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