import type { ClientsResponse } from "@/types/client";

const BASE_URL = "/api/company/clients";

export async function fetchClients({
  search = "",
  page = 1,
  limit = 10,
}: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ClientsResponse> {
  const res = await fetch(
    `${BASE_URL}?search=${search}&page=${page}&limit=${limit}`,
    {
      credentials: "include",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch clients");
  }

  return res.json();
}

export async function createClient(data: {
  name: string;
  phone: string;
  email?: string;
}) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create client");
  }

  return res.json();
}

export async function deleteClient(id: number) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to delete client");
  }

  return res.json();
}

export async function updateClient(
  id: number,
  data: {
    name?: string;
    phone?: string;
    email?: string;
  }
) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update client");
  }

  return res.json();
}