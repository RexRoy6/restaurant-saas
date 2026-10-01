import { NextResponse } from "next/server";
import {
  eq,
  inArray,
} from "drizzle-orm";

import {
  checks,
  orders,
  orderItems,
  payments
} from "@/db/schema";

import { requireAuth } from "@/lib/auth/requireAuth";
import { tenantDb } from "@/lib/db/tenantDb";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      checkId: string;
    }>;
  },
) {
  try {
    const auth = await requireAuth({
      roles: ["owner", "employee"],
    });

    if (auth.companyId === null) {
      return NextResponse.json(
        { error: "Tenant required" },
        { status: 403 },
      );
    }

    const { checkId: checkIdParam } =
      await context.params;

    const checkId = Number(checkIdParam);

    if (
      !Number.isInteger(checkId) ||
      checkId <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid checkId" },
        { status: 400 },
      );
    }

    const tenant = await tenantDb();

    /*
     * ============================================
     * CHECK
     * ============================================
     */
    const check = await tenant.findFirst(
      checks,
      eq(checks.id, checkId),
    );

    /*
     * Un Check inexistente y uno perteneciente
     * a otro tenant producen la misma respuesta.
     */
    if (!check) {
      return NextResponse.json(
        { error: "Check not found" },
        { status: 404 },
      );
    }

    /*
     * ============================================
     * ORDERS
     * ============================================
     */
    const orderList = await tenant.findMany(
      orders,
      eq(orders.checkId, check.id),
    );



    /*
     * ============================================
     * ORDER ITEMS
     * ============================================
     */
    const orderIds = orderList.map(
      (order) => order.id,
    );

    const itemList =
      orderIds.length > 0
        ? await tenant.findMany(
          orderItems,
          inArray(
            orderItems.orderId,
            orderIds,
          ),
        )
        : [];
    /*
     * ============================================
     * GROUP ITEMS BY ORDER
     * ============================================
     */
    const itemsByOrderId = new Map<
      number,
      typeof itemList
    >();

    for (const item of itemList) {
      const currentItems =
        itemsByOrderId.get(item.orderId) ?? [];

      currentItems.push(item);

      itemsByOrderId.set(
        item.orderId,
        currentItems,
      );
    }

    /*
     * ============================================
     * BUILD ORDERS
     * ============================================
     */
    const responseOrders = orderList.map(
      (order) => {
        const items =
          itemsByOrderId.get(order.id) ?? [];

        let totalInCents = 0;

        const responseItems = items.map(
          (item) => {
            const nextTotal =
              totalInCents +
              item.subtotalInCents;

            if (
              !Number.isSafeInteger(nextTotal)
            ) {
              throw new Error(
                "INVALID_CHECK_TOTAL",
              );
            }

            totalInCents = nextTotal;

            return {
              id: item.id,
              productId: item.productId,
              productName: item.productName,
              sku: item.sku,
              categoryName:
                item.categoryName,
              unitPriceInCents:
                item.unitPriceInCents,
              quantity: item.quantity,
              subtotalInCents:
                item.subtotalInCents,
            };
          },
        );

        return {
          id: order.id,
          status: order.status,
          cancelledAt:
            order.cancelledAt,
          cancelledBy:
            order.cancelledBy,
          cancellationReason:
            order.cancellationReason,
          createdAt: order.createdAt,

          items: responseItems,
          totalInCents,
        };
      },
    );

    /*
     * ============================================
     * CHECK TOTAL
     * ============================================
     */
    let checkTotalInCents = 0;

    for (const order of responseOrders) {
      /*
       * IMPORTANTE:
       *
       * CANCELLED no forma parte del total
       * económico del Check.
       */
      if (order.status === "CANCELLED") {
        continue;
      }

      const nextTotal =
        checkTotalInCents +
        order.totalInCents;

      if (!Number.isSafeInteger(nextTotal)) {
        throw new Error(
          "INVALID_CHECK_TOTAL",
        );
      }

      checkTotalInCents = nextTotal;
    }

    /*
 * ============================================
 * PAYMENTS
 * ============================================
 */
    const paymentList = await tenant.findMany(
      payments,
      eq(payments.checkId, check.id),
    );

    let paidInCents = 0;

    const responsePayments = paymentList.map(
      (payment) => {
        const nextPaid =
          paidInCents +
          payment.amountInCents;

        if (
          !Number.isSafeInteger(nextPaid) ||
          nextPaid < 0
        ) {
          throw new Error(
            "INVALID_PAYMENT_TOTAL",
          );
        }

        paidInCents = nextPaid;

        return {
          id: payment.id,
          amountInCents:
            payment.amountInCents,
          paymentMethod:
            payment.paymentMethod,
          paidAt: payment.paidAt,
        };
      },
    );

    /*
     * ============================================
     * REMAINING
     * ============================================
     */
    if (paidInCents > checkTotalInCents) {
      throw new Error(
        "INVALID_PAYMENT_STATE",
      );
    }

    const remainingInCents =
      checkTotalInCents -
      paidInCents;

    if (
      !Number.isSafeInteger(
        remainingInCents,
      ) ||
      remainingInCents < 0
    ) {
      throw new Error(
        "INVALID_PAYMENT_STATE",
      );
    }

    // return NextResponse.json({
    //   id: check.id,
    //   name: check.name,
    //   note: check.note,
    //   status: check.status,
    //   closedAt: check.closedAt,
    //   createdAt: check.createdAt,

    //   orders: responseOrders,

    //   totalInCents:
    //     checkTotalInCents,
    // });
    return NextResponse.json({
      id: check.id,
      name: check.name,
      note: check.note,
      status: check.status,
      //agregar las cosas del cancel aqui
      cancelledAt: check.cancelledAt,
      cancelledBy: check.cancelledBy,
      cancellationReason: check.cancellationReason,

      closedAt: check.closedAt,
      createdAt: check.createdAt,

      orders: responseOrders,

      payments: responsePayments,

      totalInCents:
        checkTotalInCents,

      paidInCents,

      remainingInCents,
    });


  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Internal server error";

    if (message.startsWith("Unauthorized")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    if (message === "Forbidden") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      );
    }

    if (message === "INVALID_CHECK_TOTAL") {
      return NextResponse.json(
        { error: "Invalid check total" },
        { status: 500 },
      );
    }
    if (
      message ===
      "INVALID_PAYMENT_TOTAL" ||
      message ===
      "INVALID_PAYMENT_STATE"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid payment state",
        },
        { status: 500 },
      );
    }

    console.error(
      "GET /api/checks/[checkId] error:",
      error,
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}