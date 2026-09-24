"use client";

import { useEffect, useState } from "react";

import { getEvents } from "@/lib/api/events";

import type {
  EventListItem,
  EventPagination,
} from "@/types/event";

export function useEvents() {
  const [events, setEvents] =
    useState<EventListItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [errorCode, setErrorCode] =
    useState<number | undefined>();

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] =
    useState<EventPagination | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const result = await getEvents({
        search,
        page,
        limit: 8,
      });

      setEvents(result.data);

      setPagination(result.pagination);

    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchEvents();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, page]);

  return {
    events,

    loading,

    error,
    errorCode,

    search,
    setSearch,

    page,
    setPage,

    pagination,

    fetchEvents,
  };
}