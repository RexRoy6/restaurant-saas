
import type {
  ModifierGroup,
  ModifierOption,
  ModifierGroupInput,
  ModifierGroupUpdateInput,
  ModifierOptionInput,
  ModifierOptionUpdateInput,
} from "../types/modifier";

async function getErrorMessage(
  response: Response,
): Promise<string> {
  try {
    const data: unknown = await response.json();

    if (
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof data.error === "string"
    ) {
      return data.error;
    }
  } catch {
    // La respuesta no contenía JSON válido.
  }

  return "Ocurrió un error inesperado";
}

async function request(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response),
    );
  }

  return response;
}

// ============================================================
// GRUPOS
// ============================================================

export async function getModifierGroups():
  Promise<ModifierGroup[]> {
  const response = await request(
    "/api/modifier-groups",
  );

  return response.json();
}

export async function createModifierGroup(
  input: ModifierGroupInput,
): Promise<void> {
  await request("/api/modifier-groups", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export async function updateModifierGroup(
  groupId: number,
  input: ModifierGroupUpdateInput,
): Promise<void> {
  await request(
    `/api/modifier-groups/${groupId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );
}

export async function deleteModifierGroup(
  groupId: number,
): Promise<void> {
  await request(
    `/api/modifier-groups/${groupId}`,
    {
      method: "DELETE",
    },
  );
}

export async function restoreModifierGroup(
  groupId: number,
): Promise<void> {
  await request(
    `/api/modifier-groups/${groupId}/restore`,
    {
      method: "PATCH",
    },
  );
}

// ============================================================
// OPCIONES
// ============================================================

export async function createModifierOption(
  groupId: number,
  input: ModifierOptionInput,
): Promise<void> {
  await request(
    `/api/modifier-groups/${groupId}/options`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );
}

export async function updateModifierOption(
  optionId: number,
  input: ModifierOptionUpdateInput,
): Promise<void> {
  await request(
    `/api/modifier-options/${optionId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );
}

export async function deleteModifierOption(
  optionId: number,
): Promise<void> {
  await request(
    `/api/modifier-options/${optionId}`,
    {
      method: "DELETE",
    },
  );
}

export async function restoreModifierOption(
  optionId: number,
): Promise<void> {
  await request(
    `/api/modifier-options/${optionId}/restore`,
    {
      method: "PATCH",
    },
  );
}
// Si ModifierGroup ya está importado arriba,
// agrégalo al import existente en lugar de duplicarlo.

export async function getInactiveModifierGroups():
  Promise<ModifierGroup[]> {
  const response = await request(
    "/api/modifier-groups/inactive",
  );

  return response.json();
}

export async function getInactiveModifierOptions(
  groupId: number,
): Promise<ModifierOption[]> {
  // Esta ruta aún no existe en nuestro backend.
  // No la llamaremos hasta implementarla.
  throw new Error(
    `La consulta de opciones inactivas del grupo ${groupId} todavía requiere un endpoint.`,
  );
}