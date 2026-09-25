import type {
  Product,
  ProductInput,
} from "../types/product";

async function getErrorMessage(
  response: Response,
): Promise<string> {
  try {
    const data = await response.json();

    if (
      typeof data?.error === "string" &&
      data.error
    ) {
      return data.error;
    }
  } catch {
    // La respuesta no contenía JSON válido.
  }

  return "Ocurrió un error inesperado";
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch("/api/products", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response),
    );
  }

  return response.json();
}

export async function createProduct(
  input: ProductInput,
): Promise<void> {
  const response = await fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response),
    );
  }
}

export async function updateProduct(
  productId: number,
  input: ProductInput,
): Promise<void> {
  const response = await fetch(
    `/api/products/${productId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response),
    );
  }
}

export async function updateProductAvailability(
  productId: number,
  isAvailable: boolean,
): Promise<void> {
  const response = await fetch(
    `/api/products/${productId}/availability`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        isAvailable,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response),
    );
  }
}