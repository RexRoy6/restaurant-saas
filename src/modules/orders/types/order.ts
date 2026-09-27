export type CheckStatus =
  | "OPEN"
  | "CLOSED"
  | "CANCELLED";

export type OrderStatus =
  | "PENDING"
  | "PREPARING"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod =
  | "CASH"
  | "CARD"
  | "TRANSFER";

export type OrderItem = {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  categoryName: string;
  unitPriceInCents: number;
  quantity: number;
  subtotalInCents: number;
};

export type Order = {
  id: number;
  status: OrderStatus;

  cancelledAt: string | null;
  cancelledBy: number | null;
  cancellationReason: string | null;

  createdAt: string;

  items: OrderItem[];
  totalInCents: number;
};

export type Payment = {
  id: number;
  amountInCents: number;
  paymentMethod: PaymentMethod;
  paidAt: string;
};

export type Check = {
  id: number;
  name: string | null;
  note: string | null;

  status: CheckStatus;

  closedAt: string | null;
  createdAt: string;

  orders: Order[];
  payments: Payment[];

  totalInCents: number;
  paidInCents: number;
  remainingInCents: number;
};
export type CheckSummary = {
  id: number;
  name: string | null;
  note: string | null;
  status: CheckStatus;
  closedAt: string | null;
  createdAt: string;
};
export type CreateCheckInput = {
  name?: string;
  note?: string;
};

export type CreateOrderItemInput = {
  productId: number;
  quantity: number;
};

export type CreateOrderInput = {
  items: CreateOrderItemInput[];
};

export type CreatePaymentInput = {
  amountInCents: number;
  paymentMethod: PaymentMethod;
};

export type CancelOrderInput = {
  reason: string;
};
export type UpdateOrderStatusInput = {
  status:
    | "PREPARING"
    | "READY"
    | "DELIVERED";
};