import type {
  Contract,
} from "@/types/contract";

/* ---------- GET CONTRACT ---------- */

export async function getContract(
  contractId: number
): Promise<Contract> {

  const res = await fetch(
    `/api/company/contracts/${contractId}`,
    {
      credentials: "include",
    }
  );

  if (!res.ok) {
    throw new Error(
      "Failed to fetch contract"
    );
  }

  return res.json();
}

/* ---------- GET CONTRACT SERVICES ---------- */

export async function getContractServices(
  contractId: number
) {

  const res = await fetch(
    `/api/company/contracts/${contractId}/services`,
    {
      credentials: "include",
    }
  );

  if (!res.ok) {
    throw new Error(
      "Failed to fetch services"
    );
  }

  return res.json();
}

/* ---------- GET CONTRACT PAYMENTS ---------- */

export async function getContractPayments(
  contractId: number
) {

  const res = await fetch(
    `/api/company/contracts/${contractId}/payments`,
    {
      credentials: "include",
    }
  );

  if (!res.ok) {
    throw new Error(
      "Failed to fetch payments"
    );
  }

  return res.json();
}

/* ---------- CREATE CONTRACT ---------- */

interface CreateContractPayload {
  eventId: number;
  status: "draft" | "active" | "cancelled" | "completed";
  totalAmount: number;
}

export async function createContract(
  payload: CreateContractPayload
) {

  const res = await fetch(
    "/api/company/contracts",
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

    const data = await res.json();

    throw new Error(
      data?.error ||
      "Failed to create contract"
    );
  }

  return res.json();
}