import type {
  ContractStatus,
} from "@/db/schema";

/* ---------- CLIENT ---------- */

export interface ContractClient {
  id: number;
  name: string;
}

/* ---------- EVENT ---------- */

export interface ContractEvent {
  id: number;

  name: string;

  eventDate: string;

  location: string | null;

  notes: string | null;
}

/* ---------- CONTRACT ---------- */

export interface Contract {

  id: number;

  status: ContractStatus;

  totalAmount: number;

  paidAmount?: number;

  remainingAmount?: number;

  client?: ContractClient;

  event?: ContractEvent;
}