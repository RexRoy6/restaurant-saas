import type {
  SalesPeriod,
  SalesSummary,
} from "../types/sales";

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

export async function getSalesSummary(
  period: SalesPeriod,
): Promise<SalesSummary> {
  const params = new URLSearchParams({
    period,
  });

  const response = await fetch(
    `/api/sales?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
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