"use client";

import { useEffect, useState } from "react";

export interface EventService {
  id: number;

  quantity: number;

  unitPrice: number;

  serviceNotes: string | null;

  service: {
    id: number;
    name: string;
  };
}

export function useEventServices(
  contractId?: number | null
) {
  const [services, setServices] =
    useState<EventService[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [errorCode, setErrorCode] =
    useState<number | undefined>();

  const fetchServices = async () => {
    if (!contractId) {
      setServices([]);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `/api/company/contracts/${contractId}/services`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        setError("Failed to fetch services");
        setErrorCode(res.status);
        return;
      }

      const data: EventService[] =
        await res.json();

      setServices(data);

    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [contractId]);

  return {
    services,

    loading,

    error,
    errorCode,

    fetchServices,
  };
}