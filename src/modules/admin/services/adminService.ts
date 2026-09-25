import { Company, User,Timezone } from "../types/admin";

export async function fetchMe(): Promise<User | null> {
  const res = await fetch("/api/admin/me", {
    credentials: "include",
  });

  if (res.status === 401) {
    return null;
  }

  return res.json();
}

export async function fetchCompanies(): Promise<Company[]> {
  const res = await fetch("/api/admin/companies", {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error("Error al cargar empresas");
  }

  return data;
}

export async function createCompany(
  name: string,
  timezoneId: number,
) {
  const res = await fetch("/api/admin/companies", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      timezoneId,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data.error || "Error al crear empresa",
    );
  }

  return data;
}

export async function fetchTimezones(): Promise<Timezone[]> {
  const res = await fetch("/api/admin/timezones", {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json().catch(() => []);

  if (!res.ok) {
    throw new Error(
      "Error al cargar zonas horarias",
    );
  }

  return data;
}