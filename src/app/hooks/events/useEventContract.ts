"use client";

import type {
  EventContract,
  EventListItem,
} from "@/types/event";

export function useEventContract(
  event?: EventListItem | null
) {
  const contract: EventContract | null =
    event?.contract ?? null;

  return {
    contract,

    hasContract: !!contract,

    contractId: contract?.id ?? null,

    contractStatus:
      contract?.status ?? null,
  };
}