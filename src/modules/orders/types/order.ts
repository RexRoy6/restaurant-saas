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


/**
 * Snapshot histórico de una opción
 * seleccionada en un artículo del pedido.
 */
export type OrderItemModifier = {
  id: number;

  modifierGroupId: number;
  modifierOptionId: number;

  groupName: string;
  optionName: string;

  priceInCents: number;
};

export type OrderItem = {
  id: number;

  productId: number;
  productName: string;
  sku: string;
  categoryName: string;

  /**
   * Precio histórico del producto
   * sin modificadores.
   */
  baseUnitPriceInCents: number;

  /**
   * Precio histórico final por unidad,
   * incluyendo modificadores.
   */
  unitPriceInCents: number;

  quantity: number;
  subtotalInCents: number;

  /**
   * Opciones seleccionadas cuando
   * se creó este artículo.
   *
   * Un artículo sin modificadores
   * tendrá un arreglo vacío.
   */
  modifiers: OrderItemModifier[];
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
  idempotencyKey: string | null;
  amountInCents: number;
  paymentMethod: PaymentMethod;
  paidAt: string;
};
export type Check = {
  companyId: number;
  id: number;
  name: string | null;
  note: string | null;

  status: CheckStatus;

  cancelledAt: string | null;
  cancelledBy: number | null;
  cancellationReason: string | null;

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

// export type CreateOrderItemInput = {
//   productId: number;
//   quantity: number;
// };
export type CreateOrderItemInput = {
  productId: number;
  quantity: number;

  /**
   * IDs de opciones seleccionadas.
   *
   * No incluye precios ni nombres.
   * El backend obtiene esos valores
   * desde la base de datos.
   */
  modifierOptionIds?: number[];
};

export type CreateOrderInput = {
  items: CreateOrderItemInput[];
};

export type CreatePaymentInput = {
  amountInCents: number;
  paymentMethod: PaymentMethod;
  idempotencyKey: string;
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
export type CancelCheckInput = {
  reason: string;
};