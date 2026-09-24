"use client";

import { useEffect, useState } from "react";

export function useCompanyPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<number>();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState<any>(null);

  async function fetchPayments() {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/company/payments?search=${search}&page=${page}&limit=10`,
        { credentials: "include" }
      );

      if (!res.ok) {
        setError("Failed to fetch payments");
        setErrorCode(res.status);
        return;
      }

      const result = await res.json();

      setPayments(result.data);
      setPagination(result.pagination);
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  /* 🔄 auto fetch */
  useEffect(() => {
    const timeout = setTimeout(fetchPayments, 300);
    return () => clearTimeout(timeout);
  }, [search, page]);

  /* 🔁 reset page when search */
  useEffect(() => {
    setPage(1);
  }, [search]);

  return {
    payments,
    loading,
    error,
    errorCode,
    pagination,
    search,
    setSearch,
    page,
    setPage,
    fetchPayments,
  };
}