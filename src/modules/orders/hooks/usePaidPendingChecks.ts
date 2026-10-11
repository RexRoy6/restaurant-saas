
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getPaidPendingChecks,
} from "../services/orders.service";

import type {
  CheckSummary,
} from "../types/order";

export function usePaidPendingChecks() {
  const [checks, setChecks] =
    useState<CheckSummary[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [syncError, setSyncError] =
    useState<string | null>(null);

  const activeRequestRef =
    useRef<Promise<void> | null>(null);

  const abortControllerRef =
    useRef<AbortController | null>(null);

  const mountedRef = useRef(false);

  const loadChecks = useCallback(
    async (silent = false) => {
      if (!mountedRef.current) {
        return;
      }

      // El polling omite este ciclo si hay una consulta activa.
      if (silent && activeRequestRef.current) {
        return;
      }

      // Una actualización manual espera su turno.
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

          const data = await getPaidPendingChecks(
            controller.signal,
          );

          if (
            mountedRef.current &&
            !controller.signal.aborted
          ) {
            setChecks(data);
            setSyncError(null);
            setError(null);
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
              : "No se pudieron cargar las órdenes pagadas pendientes";

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

        if (
          abortControllerRef.current === controller
        ) {
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

  return {
    checks,
    loading,
    error,
    syncError,
    loadChecks,
  };
}
