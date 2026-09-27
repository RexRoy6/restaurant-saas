import type {
  Category,
  CategoryInput,
} from "../types/category";

async function getErrorMessage(
  response: Response,
): Promise<string> {
  try {
    const data = await response.json();

    if (
      typeof data?.error === "string"
    ) {
      return data.error;
    }
  } catch {
    // La respuesta no contenía JSON válido.
  }

  return "Something went wrong";
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(
    "/api/categories",
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response),
    );
  }

  return response.json();
}
//esta te trae las cats que hayan sido desactivadas
export async function getAllCategories(): Promise<Category[]> {
  const response = await fetch(
    "/api/categories/all",
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response),
    );
  }

  return response.json();
}

export async function createCategory(
  input: CategoryInput,
): Promise<void> {
  const response = await fetch(
    "/api/categories",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response),
    );
  }
}

export async function updateCategory(
  id: number,
  input: CategoryInput,
): Promise<void> {
  const response = await fetch(
    `/api/categories/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response),
    );
  }
}

export async function changeCategoryAvailability(
  id: number,
  isActive: boolean,
): Promise<void> {
  const response = await fetch(
    `/api/categories/${id}/availability`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isActive,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response),
    );
  }
}