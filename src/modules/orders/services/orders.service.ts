import type {
  CancelCheckInput,
  CancelOrderInput,
  Check,
  CheckSummary,
  CreateCheckInput,
  CreateOrderInput,
  CreatePaymentInput,
  UpdateOrderStatusInput,
} from "../types/order";

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

export async function cancelCheck(
  checkId: number,
  input: CancelCheckInput,
): Promise<void> {
  const response = await fetch(
    `/api/checks/${checkId}/cancel`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
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

export async function getChecks(): Promise<
  CheckSummary[]
> {
  const response = await fetch(
    "/api/checks",
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

export async function getPaidPendingChecks(): Promise<
  CheckSummary[]
> {
  const response = await fetch(
    "/api/checks/paid-pending",
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response),
    );
  }

  return response.json();
}

export async function getCheck(
  checkId: number,
): Promise<Check> {
  const response = await fetch(
    `/api/checks/${checkId}`,
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
export async function createCheck(
  input: CreateCheckInput,
): Promise<{ id: number }> {
  const response = await fetch(
    "/api/checks",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
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

  return response.json();
}
export async function createOrder(
  checkId: number,
  input: CreateOrderInput,
): Promise<void> {
  const response = await fetch(
    `/api/checks/${checkId}/orders`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
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
export async function updateOrderStatus(
  orderId: number,
  input: UpdateOrderStatusInput,
): Promise<void> {
  const response = await fetch(
    `/api/orders/${orderId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
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
export async function cancelOrder(
  orderId: number,
  input: CancelOrderInput,
): Promise<void> {
  const response = await fetch(
    `/api/orders/${orderId}/cancel`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
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
export async function createPayment(
  checkId: number,
  input: CreatePaymentInput,
): Promise<void> {
  const response = await fetch(
    `/api/checks/${checkId}/payments`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
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