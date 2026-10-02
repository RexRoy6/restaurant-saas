"use client";

import {
  useCallback,
  useEffect,
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

  const loadChecks =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const data =
          await getPaidPendingChecks();

        setChecks(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las órdenes pagadas pendientes",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadChecks();
  }, [loadChecks]);

  return {
    checks,
    loading,
    error,
    loadChecks,
  };
}