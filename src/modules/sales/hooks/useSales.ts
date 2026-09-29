"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getSalesSummary,
} from "../services/sales.service";

import type {
  SalesPeriod,
  SalesSummary,
} from "../types/sales";

export function useSales(
  initialPeriod: SalesPeriod = "today",
) {
  const [period, setPeriod] =
    useState<SalesPeriod>(initialPeriod);

  const [summary, setSummary] =
    useState<SalesSummary | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadSales =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const data =
          await getSalesSummary(period);

        setSummary(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las ventas",
        );
      } finally {
        setLoading(false);
      }
    }, [period]);

  useEffect(() => {
    void loadSales();
  }, [loadSales]);

  return {
    period,
    setPeriod,
    summary,
    loading,
    error,
    loadSales,
  };
}