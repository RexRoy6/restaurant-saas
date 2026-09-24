import type {
  EventListItem,
  EventsResponse,
} from "@/types/event";

export interface CreateEventPayload {
  clientId: number;

  name: string;

  eventDate: string;

  eventStart: string;

  eventEnd: string;

  location: string;

  notes: string;
}

/* ---------- GET EVENTS ---------- */

export async function getEvents(params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<EventsResponse> {

  const searchParams = new URLSearchParams();

  if (params?.search) {
    searchParams.set("search", params.search);
  }

  if (params?.page) {
    searchParams.set("page", String(params.page));
  }

  if (params?.limit) {
    searchParams.set("limit", String(params.limit));
  }

  const res = await fetch(
    `/api/company/events?${searchParams.toString()}`,
    {
      credentials: "include",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch events");
  }

  return res.json();
}

/* ---------- GET EVENT ---------- */

export async function getEvent(
  eventId: number
): Promise<EventListItem> {

  const res = await fetch(
    `/api/company/events/${eventId}`,
    {
      credentials: "include",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch event");
  }

  return res.json();
}

/* ---------- CREATE EVENT ---------- */

export async function createEvent(
  payload: CreateEventPayload
): Promise<EventListItem> {

  const res = await fetch(
    "/api/company/events",
    {
      method: "POST",

      credentials: "include",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to create event");
  }

  return res.json();
}