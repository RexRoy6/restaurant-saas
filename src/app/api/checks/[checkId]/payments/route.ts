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
    payments,
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
            roles: ["owner", "employee"],
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
 * ==========================================
 * EXISTING PAYMENTS
 * ==========================================
 */
                const paymentList = await tenant.findMany(
                    payments,
                    eq(payments.checkId, check.id),
                );

                let paidInCents = 0;

                for (const payment of paymentList) {
                    const nextPaid =
                        paidInCents +
                        payment.amountInCents;

                    if (
                        !Number.isSafeInteger(nextPaid) ||
                        nextPaid < 0
                    ) {
                        throw new Error(
                            "INVALID_PAID_TOTAL",
                        );
                    }

                    paidInCents = nextPaid;
                }

                /*
                 * Esta situación no debería existir porque
                 * nuestro API no permitirá sobrepagos.
                 *
                 * Aun así, fallamos de forma segura si los
                 * datos existentes son inconsistentes.
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

                /*
                 * Un Check OPEN con saldo 0 sería un estado
                 * inconsistente: debería haberse cerrado al
                 * registrar el último pago.
                 */
                if (remainingInCents === 0) {
                    throw new Error(
                        "INVALID_PAYMENT_STATE",
                    );
                }

                /*
                 * El nuevo pago no puede superar el saldo
                 * pendiente.
                 */
                if (
                    body.amountInCents >
                    remainingInCents
                ) {
                    throw new Error(
                        "PAYMENT_EXCEEDS_REMAINING",
                    );
                }
                /*
 * ==========================================
 * CREATE PAYMENT
 * ==========================================
 *
 * companyId viene de tenantDb.
 * paidAt viene de la DB.
 *
 * El cliente únicamente controla:
 * - amountInCents
 * - paymentMethod
 */
                const paymentResult = await tenant.insert(
                    payments,
                    {
                        checkId: check.id,
                        amountInCents:
                            body.amountInCents,
                        paymentMethod:
                            body.paymentMethod,
                    },
                );

                const paymentId = Number(
                    paymentResult[0].insertId,
                );

                if (
                    !Number.isInteger(paymentId) ||
                    paymentId <= 0
                ) {
                    throw new Error(
                        "PAYMENT_CREATION_FAILED",
                    );
                }

                /*
                 * ==========================================
                 * NEW ECONOMIC STATE
                 * ==========================================
                 */
                const newPaidInCents =
                    paidInCents +
                    body.amountInCents;

                const newRemainingInCents =
                    checkTotalInCents -
                    newPaidInCents;

                if (
                    !Number.isSafeInteger(
                        newPaidInCents,
                    ) ||
                    !Number.isSafeInteger(
                        newRemainingInCents,
                    ) ||
                    newRemainingInCents < 0
                ) {
                    throw new Error(
                        "INVALID_PAYMENT_STATE",
                    );
                }

                /*
                 * ==========================================
                 * CLOSE CHECK IF FULLY PAID
                 * ==========================================
                 */
                let finalCheckStatus:
                    | "OPEN"
                    | "CLOSED" = "OPEN";

                if (newRemainingInCents === 0) {
                    await tenant.update(
                        checks,
                        {
                            status: "CLOSED",
                            closedAt: new Date(),
                        },
                        eq(checks.id, check.id),
                    );

                    finalCheckStatus = "CLOSED";
                }

                /*
                 * Si cualquier cosa anterior lanzó un error,
                 * la transaction hará rollback también del
                 * Payment.
                 */
                return {
                    payment: {
                        id: paymentId,
                        amountInCents:
                            body.amountInCents,
                        paymentMethod:
                            body.paymentMethod,
                    },

                    check: {
                        id: check.id,
                        status: finalCheckStatus,
                        totalInCents:
                            checkTotalInCents,
                        paidInCents:
                            newPaidInCents,
                        remainingInCents:
                            newRemainingInCents,
                    },
                };
            },
        );

        return NextResponse.json(
            result,
            { status: 201 },
        );


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
        if (
            message === "INVALID_PAID_TOTAL" ||
            message === "INVALID_PAYMENT_STATE"
        ) {
            return NextResponse.json(
                {
                    error: "Invalid payment state",
                },
                { status: 500 },
            );
        }

        if (
            message ===
            "PAYMENT_EXCEEDS_REMAINING"
        ) {
            return NextResponse.json(
                {
                    error:
                        "Payment exceeds remaining balance",
                },
                { status: 400 },
            );
        }
        if (
            message ===
            "PAYMENT_CREATION_FAILED"
        ) {
            return NextResponse.json(
                {
                    error:
                        "Could not create payment",
                },
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