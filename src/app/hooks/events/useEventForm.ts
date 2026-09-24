"use client";

import { useState } from "react";
import { createEvent } from "@/lib/api/events";
import { createContract } from "@/lib/api/contracts";
import { EventFormState, initialEventForm } from "@/types/forms/eventForm";
import { combineDateTime } from "@/lib/utils/date";

interface UseEventFormOptions {
  onSuccess?: (data: { event: any; contract: any }) => void;
}

export function useEventForm(options?: UseEventFormOptions) {
  const [form, setForm] = useState<EventFormState>(initialEventForm);
  const [showForm, setShowForm] = useState(false);
  const [createdContractId, setCreatedContractId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<number | undefined>();

  const resetForm = () => {
    setForm(initialEventForm);
  };

  const handleCreateEvent = async () => {
    try {
      setLoading(true);
      setError("");
      setErrorCode(undefined);

      const eventStart = combineDateTime(form.eventDate, form.eventStart);
      let eventEnd = combineDateTime(form.eventDate, form.eventEnd);

      if (eventStart && eventEnd && new Date(eventEnd) < new Date(eventStart)) {
        const nextDay = new Date(eventEnd);
        nextDay.setDate(nextDay.getDate() + 1);
        eventEnd = nextDay.toISOString();
      }

      if (!eventStart || !eventEnd) {
        throw new Error("Fecha o hora del evento inválidas");
      }

      const event = await createEvent({
        clientId: Number(form.clientId),
        name: form.name,
        eventDate: eventStart,
        eventStart,
        eventEnd,
        location: form.location,
        notes: form.notes,
      });

      const contract = await createContract({
        eventId: event.id,
        status: "draft",
        totalAmount: 0,
      });

      options?.onSuccess?.({
        event,
        contract,
      });

      setCreatedContractId(contract.id);
      setShowForm(false);
      resetForm();
    } catch (err: any) {
      setError(err?.message || "Error al crear el evento");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    setForm,
    showForm,
    setShowForm,
    createdContractId,
    setCreatedContractId,
    loading,
    createEvent: handleCreateEvent,
    resetForm,
    error,
    errorCode,
  };
}