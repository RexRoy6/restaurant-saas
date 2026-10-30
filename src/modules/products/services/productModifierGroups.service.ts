
import type {
  AssignModifierGroupInput,
  ProductModifierGroupAssignment,
} from "../types/productModifierGroup";

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
    // La respuesta no contiene JSON válido.
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
    throw new Error(await getErrorMessage(response));
  }

  return response;
}

/**
 * Obtiene los grupos asignados a un producto.
 */
export async function getProductModifierGroups(
  productId: number,
): Promise<ProductModifierGroupAssignment[]> {
  const response = await request(
    `/api/products/${productId}/modifier-groups`,
  );

  return response.json();
}

/**
 * Asigna un grupo de modificadores a un producto.
 *
 * El backend también puede restaurar una asociación
 * que había sido eliminada lógicamente.
 */
export async function assignModifierGroupToProduct(
  productId: number,
  input: AssignModifierGroupInput,
): Promise<void> {
  await request(
    `/api/products/${productId}/modifier-groups`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );
}

/**
 * Desactiva la asociación entre un producto y un grupo.
 *
 * No elimina el grupo ni sus opciones.
 */
export async function removeModifierGroupFromProduct(
  productId: number,
  groupId: number,
): Promise<void> {
  await request(
    `/api/products/${productId}/modifier-groups/${groupId}`,
    {
      method: "DELETE",
    },
  );
}