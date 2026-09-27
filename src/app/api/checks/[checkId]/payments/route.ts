import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/requireAuth";
import {
    eq,
    inArray,
} from "drizzle-orm";

import { db } from "@/db";
import {
    PAYMENT_METHODS,
    checks,
    orders,
    orderItems,
} from "@/db/schema";

import { tenantDb } from "@/lib/db/tenantDb";

type PaymentMethod =
    (typeof PAYMENT_METHODS)[number];

function isPaymentMethod(
    value: unknown,
): value is PaymentMethod {
    return (
        typeof value === "string" &&
        PAYMENT_METHODS.some(
            (method) => method === value,
        )
    );
}

export async function POST(
    request: Request,
    context: {
        params: Promise<{
            checkId: string;
        }>;
    },
) {
    try {
        /*
         * ============================================
         * AUTH
         * ============================================
         */
        const auth = await requireAuth({
            roles: ["owner"],
        });

        if (auth.companyId === null) {
            return NextResponse.json(
                { error: "Tenant required" },
                { status: 403 },
            );
        }

        /*
         * ============================================
         * CHECK ID
         * ============================================
         */
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

        /*
         * ============================================
         * REQUEST BODY
         * ============================================
         */
        const body = await request.json();

        if (
            typeof body !== "object" ||
            body === null
        ) {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 },
            );
        }

        if (
            !("amountInCents" in body) ||
            typeof body.amountInCents !== "number" ||
            !Number.isSafeInteger(
                body.amountInCents,
            ) ||
            body.amountInCents <= 0
        ) {
            return NextResponse.json(
                {
                    error:
                        "amountInCents must be a positive integer",
                },
                { status: 400 },
            );
        }

        if (
            !("paymentMethod" in body) ||
            !isPaymentMethod(
                body.paymentMethod,
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid payment method",
                },
                { status: 400 },
            );
        }

        const result = await db.transaction(
            async (tx) => {
                const tenant = await tenantDb(tx);

                /*
                 * ==========================================
                 * CHECK
                 * ==========================================
                 */
                const check = await tenant.findFirst(
                    checks,
                    eq(checks.id, checkId),
                );

                if (!check) {
                    throw new Error("CHECK_NOT_FOUND");
                }

                if (check.status !== "OPEN") {
                    throw new Error("CHECK_NOT_OPEN");
                }

                /*
                 * ==========================================
                 * ORDERS
                 * ==========================================
                 */
                const orderList = await tenant.findMany(
                    orders,
                    eq(orders.checkId, check.id),
                );

                /*
                 * Solamente Orders económicas activas.
                 *
                 * CANCELLED permanece en el historial,
                 * pero no forma parte del total.
                 */
                const activeOrders = orderList.filter(
                    (order) =>
                        order.status !== "CANCELLED",
                );

                /*
                 * Un Check sin Orders económicas tiene
                 * total $0.
                 */
                if (activeOrders.length === 0) {
                    throw new Error("NOTHING_TO_PAY");
                }

                /*
                 * ==========================================
                 * ORDER ITEMS
                 * ==========================================
                 */
                const orderIds = activeOrders.map(
                    (order) => order.id,
                );

                const itemList = await tenant.findMany(
                    orderItems,
                    inArray(
                        orderItems.orderId,
                        orderIds,
                    ),
                );

                /*
                 * ==========================================
                 * CHECK TOTAL
                 * ==========================================
                 */
                let checkTotalInCents = 0;

                for (const item of itemList) {
                    const nextTotal =
                        checkTotalInCents +
                        item.subtotalInCents;

                    if (
                        !Number.isSafeInteger(nextTotal) ||
                        nextTotal < 0
                    ) {
                        throw new Error(
                            "INVALID_CHECK_TOTAL",
                        );
                    }

                    checkTotalInCents = nextTotal;
                }

                if (checkTotalInCents <= 0) {
                    throw new Error("NOTHING_TO_PAY");
                }

                /*
                 * TEMPORAL:
                 *
                 * 11.4 solamente demuestra que podemos
                 * obtener el total económico real.
                 *
                 * Todavía NO insertamos Payment.
                 */
                return {
                    checkId: check.id,
                    status: check.status,

                    requestedPayment: {
                        amountInCents:
                            body.amountInCents,
                        paymentMethod:
                            body.paymentMethod,
                    },

                    totalInCents:
                        checkTotalInCents,

                    activeOrderCount:
                        activeOrders.length,

                    calculationPassed: true,
                };
            },
        );

        return NextResponse.json(result);


    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Internal server error";

        if (
            message.startsWith(
                "Unauthorized",
            )
        ) {
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
        if (message === "CHECK_NOT_FOUND") {
            return NextResponse.json(
                { error: "Check not found" },
                { status: 404 },
            );
        }

        if (message === "CHECK_NOT_OPEN") {
            return NextResponse.json(
                { error: "Check is not open" },
                { status: 409 },
            );
        }

        if (message === "NOTHING_TO_PAY") {
            return NextResponse.json(
                { error: "Nothing to pay" },
                { status: 409 },
            );
        }

        if (message === "INVALID_CHECK_TOTAL") {
            return NextResponse.json(
                { error: "Invalid check total" },
                { status: 500 },
            );
        }


        console.error(
            "POST /api/checks/[checkId]/payments error:",
            error,
        );

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}