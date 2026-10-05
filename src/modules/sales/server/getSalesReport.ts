import { getSalesData } from "./getSalesData";

import type {
  SalesPeriodRange,
  SalesReportRow,
} from "../types/sales";

export async function getSalesReportRows(
  period: SalesPeriodRange,
): Promise<SalesReportRow[]> {
  const {
    closedChecks,
    activeOrders,
    items,
  } = await getSalesData(period);

  const checksById = new Map(
    closedChecks.map(
      (check) => [
        check.id,
        check,
      ],
    ),
  );

  const ordersById = new Map(
    activeOrders.map(
      (order) => [
        order.id,
        order,
      ],
    ),
  );

  const salesRows: SalesReportRow[] = [];

  for (const item of items) {
    const order = ordersById.get(
      item.orderId,
    );

    if (!order) {
      throw new Error(
        "SALES_REPORT_ORDER_NOT_FOUND",
      );
    }

    const check = checksById.get(
      order.checkId,
    );

    if (!check) {
      throw new Error(
        "SALES_REPORT_CHECK_NOT_FOUND",
      );
    }

    if (!check.closedAt) {
      throw new Error(
        "SALES_REPORT_CLOSED_AT_REQUIRED",
      );
    }

    salesRows.push({
      checkId: check.id,
      checkName: check.name,
      closedAt: check.closedAt,

      orderId: order.id,

      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      categoryName: item.categoryName,

      quantity: item.quantity,
      unitPriceInCents:
        item.unitPriceInCents,
      subtotalInCents:
        item.subtotalInCents,
    });
  }

  return salesRows;
}