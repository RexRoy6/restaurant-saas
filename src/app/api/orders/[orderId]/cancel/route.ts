import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/requireAuth";
import { eq } from "drizzle-orm";

import { orders } from "@/db/schema";
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
         * DELIVERED es un estado final.
         * Una orden ya entregada no puede cancelarse.
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

        /*
         * CANCELLED también es final.
         * No permitimos cancelar dos veces.
         */
        if (order.status === "CANCELLED") {
            return NextResponse.json(
                {
                    error: "Order is already cancelled",
                },
                { status: 409 },
            );
        }

        /*
         * En este punto únicamente pueden llegar:
         *
         * PENDING
         * PREPARING
         * READY
         *
         * Todavía NO hacemos UPDATE.
         */
        return NextResponse.json({
            orderId: order.id,
            currentStatus: order.status,
            requestedStatus: "CANCELLED",
            reason,
            cancelledBy: auth.userId,
            cancellationAllowed: true,
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