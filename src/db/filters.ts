import { and, eq, isNull } from "drizzle-orm";

import {
  payments,
  contracts,
  contractItems,
} from "@/db/schema";

/* ---------- PAYMENTS ---------- */

export function activePayments(contractId: number) {
  return and(
    eq(payments.contractId, contractId),
    isNull(payments.deletedAt)
  );
}

/* ---------- CONTRACTS ---------- */

export function activeContracts(companyId?: number) {
  return companyId
    ? and(
        eq(contracts.companyId, companyId),
        isNull(contracts.deletedAt)
      )
    : isNull(contracts.deletedAt);
}

/* ---------- CONTRACT ITEMS ---------- */

export function activeContractItems(contractId: number) {
  return and(
    eq(contractItems.contractId, contractId),
    isNull(contractItems.deletedAt)
  );
}

export function notDeletedPayments() {
  return isNull(payments.deletedAt)
}