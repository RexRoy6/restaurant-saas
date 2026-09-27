import { NextResponse } from "next/server";

import {
    ORDER_STATUSES,
    type OrderStatus,
} from "@/db/schema";

import { requireAuth } from "@/lib/auth/requireAuth";

const NORMAL_TRANSITIONS: Partial<
    Record<OrderStatus, OrderStatus>
> = {
    PENDING: "PREPARING",
    PREPARING: "READY",
    READY: "DELIVERED",
};

function isOrderStatus(
    value: unknown,
): value is OrderStatus {
    return (
        typeof value === "string" &&
        ORDER_STATUSES.some(
            (status) => status === value,
        )
    );
}

export async function PATCH(
    request: Request,
    context: {
        params: Promise<{
            orderId: string;
        }>;
    },
) {
    try {
        const auth = await requireAuth({
            roles: ["owner"],
        });

        if (auth.companyId === null) {
            return NextResponse.json(
                { error: "Tenant required" },
                { status: 403 },
            );
        }

        const { orderId: orderIdParam } =
            await context.params;

        const orderId = Number(orderIdParam);

        if (
            !Number.isInteger(orderId) ||
            orderId <= 0
        ) {
            return NextResponse.json(
                { error: "Invalid orderId" },
                { status: 400 },
            );
        }

        const body = await request.json();

        if (
            typeof body !== "object" ||
            body === null ||
            !("status" in body) ||
            !isOrderStatus(body.status)
        ) {
            return NextResponse.json(
                { error: "Invalid order status" },
                { status: 400 },
            );
        }

        /*
         * CANCELLED no se maneja aquí.
         *
         * Tendrá su propio endpoint porque necesita:
         * cancelledAt
         * cancelledBy
         * cancellationReason
         */
        if (body.status === "CANCELLED") {
            return NextResponse.json(
                {
                    error:
                        "Use the cancellation endpoint to cancel an order",
                },
                { status: 400 },
            );
        }

        /*
         * TEMPORAL.
         *
         * En 10.5-A2 cargaremos la Order actual
         * y comprobaremos la transición contra
         * NORMAL_TRANSITIONS.
         */
        return NextResponse.json({
            orderId,
            requestedStatus: body.status,
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

        console.error(
            "PATCH /api/orders/[orderId]/status error:",
            error,
        );

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}