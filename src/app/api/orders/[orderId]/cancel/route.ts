import { NextResponse } from "next/server";
import {
    and,
    eq,
} from "drizzle-orm";

import { orders } from "@/db/schema";
import { requireAuth } from "@/lib/auth/requireAuth";
import { tenantDb } from "@/lib/db/tenantDb";

export async function POST(
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
            body === null
        ) {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 },
            );
        }

        const reason =
            "reason" in body &&
                typeof body.reason === "string"
                ? body.reason.trim()
                : "";

        if (!reason) {
            return NextResponse.json(
                {
                    error:
                        "Cancellation reason is required",
                },
                { status: 400 },
            );
        }

        if (reason.length > 500) {
            return NextResponse.json(
                {
                    error:
                        "Cancellation reason must be 500 characters or fewer",
                },
                { status: 400 },
            );
        }



        const tenant = await tenantDb();

        /*
         * ============================================
         * ORDER
         * ============================================
         */
        const order = await tenant.findFirst(
            orders,
            eq(orders.id, orderId),
        );

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 },
            );
        }

        /*
         * ============================================
         * CANCELLATION RULES
         * ============================================
         *
         * Permitimos:
         *
         * PENDING   → CANCELLED
         * PREPARING → CANCELLED
         * READY     → CANCELLED
         *
         * No permitimos:
         *
         * DELIVERED → CANCELLED
         * CANCELLED → CANCELLED
         */
        if (order.status === "DELIVERED") {
            return NextResponse.json(
                {
                    error:
                        "Delivered orders cannot be cancelled",
                },
                { status: 409 },
            );
        }

        if (order.status === "CANCELLED") {
            return NextResponse.json(
                {
                    error: "Order is already cancelled",
                },
                { status: 409 },
            );
        }

        /*
         * Defensa adicional.
         *
         * Si en el futuro agregamos otro estado al enum,
         * no queremos que automáticamente se vuelva
         * cancelable.
         */
        if (
            order.status !== "PENDING" &&
            order.status !== "PREPARING" &&
            order.status !== "READY"
        ) {
            return NextResponse.json(
                {
                    error:
                        "Order cannot be cancelled from its current status",
                },
                { status: 409 },
            );
        }

        /*
         * ============================================
         * CANCEL ORDER
         * ============================================
         *
         * Importante:
         *
         * El WHERE también contiene el status que
         * acabamos de leer.
         *
         * Así evitamos cambiar a CANCELLED una Order
         * cuyo estado haya cambiado entre el SELECT
         * anterior y este UPDATE.
         */
        const updateResult = await tenant.update(
            orders,
            {
                status: "CANCELLED",
                cancelledAt: new Date(),
                cancelledBy: auth.userId,
                cancellationReason: reason,
            },
            and(
                eq(orders.id, order.id),
                eq(orders.status, order.status),
            ),
        );

        const affectedRows =
            updateResult[0].affectedRows;

        if (affectedRows !== 1) {
            return NextResponse.json(
                {
                    error:
                        "Order status changed before cancellation",
                },
                { status: 409 },
            );
        }

        return NextResponse.json({
            id: order.id,
            previousStatus: order.status,
            status: "CANCELLED",
            cancelledBy: auth.userId,
            cancellationReason: reason,
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
            "POST /api/orders/[orderId]/cancel error:",
            error,
        );

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}