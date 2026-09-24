"use client";

import { useEffect, useState } from "react";
import ErrorBox from "@/app/components/ErrorBox";

export default function EventInfoCard({ eventId }: { eventId: number }) {

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvent = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/company/events/${eventId}`, {
        credentials: "include",
      });

      if (!res.ok) {
        setError("Failed to load event info");
        return;
      }

      const data = await res.json();
      setEvent(data);

    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) fetchEvent();
  }, [eventId]);

  if (loading) return <p>Loading event info...</p>;

  if (error) return <ErrorBox message={error} />;

  if (!event) return null;

  const date = new Date(event.eventDate);

  return (
    <div
      style={{
        marginBottom: 20,
        padding: 16,
        borderRadius: 10,
        border: "1px solid var(--border-color)",
        background: "var(--bg-secondary)",
      }}
    >
      <h3 style={{ marginBottom: 10 }}>{event.name}</h3>

      <p><strong>Client:</strong> {event.client?.name}</p>

      <p>
        <strong>Date:</strong>{" "}
        {date.toLocaleDateString()}{" "}
        {date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>

      <p><strong>Location:</strong> {event.location}</p>

      {event.notes && (
        <p><strong>Notes:</strong> {event.notes}</p>
      )}
    </div>
  );
}