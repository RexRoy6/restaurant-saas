"use client";

import { useEffect, useState } from "react";
import { getContract } from "@/lib/api/contracts";

export function useContract(contractId?: number | null) {
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchContract = async () => {
    if (!contractId) return;

    try {
      setLoading(true);
      const data = await getContract(contractId);
      setContract(data);
    } catch {
      setError("Error al cargar los datos del contrato");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContract();
  }, [contractId]);

  return {
    contract,
    setContract,
    loading,
    error,
    fetchContract,
  };
}