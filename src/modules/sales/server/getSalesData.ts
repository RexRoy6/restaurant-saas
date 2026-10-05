import {
  and,
  eq,
  gte,
  inArray,
  lt,
  ne,
} from "drizzle-orm";

import {
  checks,
  orders,
  orderItems,
  payments,
} from "@/db/schema";

import { tenantDb } from "@/lib/db/tenantDb";

import type {
  SalesPeriodRange,
} from "../types/sales";

export async function getSalesData(
  period: SalesPeriodRange,
) {
  const tenant = await tenantDb();

  const closedChecks = await tenant.findMany(
    checks,
    and(
      eq(checks.status, "CLOSED"),
      gte(checks.closedAt, period.from),
      lt(checks.closedAt, period.to),
    ),
  );

  if (closedChecks.length === 0) {
    return {
      closedChecks: [],
      checkPayments: [],
      activeOrders: [],
      items: [],
    };
  }

  const checkIds = closedChecks.map(
    (check) => check.id,
  );

  const checkPayments = await tenant.findMany(
    payments,
    inArray(
      payments.checkId,
      checkIds,
    ),
  );

  const activeOrders = await tenant.findMany(
    orders,
    and(
      inArray(
        orders.checkId,
        checkIds,
      ),
      ne(
        orders.status,
        "CANCELLED",
      ),
    ),
  );

  if (activeOrders.length === 0) {
    return {
      closedChecks,
      checkPayments,
      activeOrders: [],
      items: [],
    };
  }

  const orderIds = activeOrders.map(
    (order) => order.id,
  );

  const items = await tenant.findMany(
    orderItems,
    inArray(
      orderItems.orderId,
      orderIds,
    ),
  );

  return {
    closedChecks,
    checkPayments,
    activeOrders,
    items,
  };
}