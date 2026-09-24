"use client";

import { useEffect, useState } from "react";

import { getEvent } from "@/lib/api/events";

import type { EventListItem } from "@/types/event";

export function useEvent(eventId?: number) {
  const [event, setEvent] =
    useState<EventListItem | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [errorCode, setErrorCode] =
    useState<number | undefined>();

  const fetchEvent = async () => {
    if (!eventId) return;

    try {
      setLoading(true);

      const data = await getEvent(eventId);

      setEvent(data);

    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  return {
    event,

    loading,

    error,
    errorCode,

    fetchEvent,
  };
}