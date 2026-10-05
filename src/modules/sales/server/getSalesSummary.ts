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
  SalesSummary,
} from "../types/sales";

type ProductSales = {
  productId: number;
  productName: string;
  quantity: number;
  totalInCents: number;
  latestCreatedAt: Date;
};

export async function getSalesSummary(
  period: SalesPeriodRange,
): Promise<SalesSummary> {
  const tenant = await tenantDb();

  const closedChecks = await tenant.findMany(
    checks,
    and(
      eq(checks.status, "CLOSED"),
      gte(checks.closedAt, period.from),
      lt(checks.closedAt, period.to),
    ),
  );

  const paidChecks = closedChecks.length;

  let totalSalesInCents = 0;
  let productsSold = 0;

  const productsMap =
    new Map<number, ProductSales>();

  let cashInCents = 0;
  let cardInCents = 0;
  let transferInCents = 0;

  if (closedChecks.length > 0) {
    const checkIds = closedChecks.map(
      (check) => check.id,
    );

    const checkPayments =
      await tenant.findMany(
        payments,
        inArray(
          payments.checkId,
          checkIds,
        ),
      );

    for (const payment of checkPayments) {
      switch (payment.paymentMethod) {
        case "CASH":
          cashInCents += payment.amountInCents;
          break;

        case "CARD":
          cardInCents += payment.amountInCents;
          break;

        case "TRANSFER":
          transferInCents +=
            payment.amountInCents;
          break;
      }
    }

    const activeOrders =
      await tenant.findMany(
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

    if (activeOrders.length > 0) {
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

      for (const item of items) {
        const nextTotal =
          totalSalesInCents +
          item.subtotalInCents;

        const nextProductsSold =
          productsSold +
          item.quantity;

        if (
          !Number.isSafeInteger(nextTotal) ||
          nextTotal < 0
        ) {
          throw new Error(
            "INVALID_SALES_TOTAL",
          );
        }

        if (
          !Number.isSafeInteger(
            nextProductsSold,
          ) ||
          nextProductsSold < 0
        ) {
          throw new Error(
            "INVALID_PRODUCTS_SOLD",
          );
        }

        totalSalesInCents = nextTotal;
        productsSold = nextProductsSold;

        const existingProduct =
          productsMap.get(
            item.productId,
          );

        if (!existingProduct) {
          productsMap.set(
            item.productId,
            {
              productId:
                item.productId,
              productName:
                item.productName,
              quantity:
                item.quantity,
              totalInCents:
                item.subtotalInCents,
              latestCreatedAt:
                item.createdAt,
            },
          );

          continue;
        }

        const nextQuantity =
          existingProduct.quantity +
          item.quantity;

        const nextProductTotal =
          existingProduct.totalInCents +
          item.subtotalInCents;

        if (
          !Number.isSafeInteger(
            nextQuantity,
          ) ||
          nextQuantity < 0 ||
          !Number.isSafeInteger(
            nextProductTotal,
          ) ||
          nextProductTotal < 0
        ) {
          throw new Error(
            "INVALID_PRODUCT_SALES",
          );
        }

        existingProduct.quantity =
          nextQuantity;

        existingProduct.totalInCents =
          nextProductTotal;

        if (
          item.createdAt >
          existingProduct.latestCreatedAt
        ) {
          existingProduct.productName =
            item.productName;

          existingProduct.latestCreatedAt =
            item.createdAt;
        }
      }
    }
  }

  const products = Array.from(
    productsMap.values(),
  )
    .map((product) => ({
      productId: product.productId,
      productName: product.productName,
      quantity: product.quantity,
      totalInCents:
        product.totalInCents,
    }))
    .sort(
      (a, b) =>
        b.quantity - a.quantity,
    );

  return {
    period: {
      preset: period.preset,
      timezone: period.timezone,
      from: period.from.toISOString(),
      to: period.to.toISOString(),
    },

    totalSalesInCents,
    paidChecks,
    productsSold,

    salesByPaymentMethod: {
      cashInCents,
      cardInCents,
      transferInCents,
    },

    products,
  };
}