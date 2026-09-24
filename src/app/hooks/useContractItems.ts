"use client";

import { useState } from "react";

export function useContractItems(contractId: string) {
  const [contractItems, setContractItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchContractItems() {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/company/contracts/${contractId}/services`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      setContractItems(data);

      return data.map((item: any) => ({
        contractItemId: item.id,
        amount: 0,
      }));
    } catch {
      setContractItems([]);
      return [];
    } finally {
      setLoading(false);
    }
  }

  return {
    contractItems,
    loading,
    fetchContractItems,
  };
}