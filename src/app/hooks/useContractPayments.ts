"use client";

import { useEffect, useState } from "react";

export function useContractPayments(contractId: string) {
  const [payments, setPayments] = useState<any[]>([]);

  const [contractTotal, setContractTotal] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<number>();

  async function fetchPayments() {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/company/contracts/${contractId}/payments`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        setError("Failed to fetch payments");
        setErrorCode(res.status);
        return;
      }

      const data = await res.json();

      setPayments(data.payments);
      setContractTotal(data.contractTotal);
      setPaidAmount(data.paidAmount);
      setRemainingAmount(data.remainingAmount);
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (contractId) fetchPayments();
  }, [contractId]);

  return {
    payments,
    contractTotal,
    paidAmount,
    remainingAmount,
    loading,
    error,
    errorCode,
    fetchPayments,
  };
}