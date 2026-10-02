import { NextResponse } from "next/server";
import {
    and,
    inArray,
    eq
} from "drizzle-orm";

import {
    checks,
    orders,
} from "@/db/schema";
import { requireAuth } from "@/lib/auth/requireAuth";
import { tenantDb } from "@/lib/db/tenantDb";

export async function GET() {
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

        const tenant = await tenantDb();

        /*
         * ============================================
         * PENDING FULFILLMENT ORDERS
         * ============================================
         *
         * Una Order sigue pendiente operativamente
         * mientras todavía no ha llegado a:
         *
         * DELIVERED
         * CANCELLED
         */
        const pendingOrders = await tenant.findMany(
            orders,
            inArray(
                orders.status,
                [
                    "PENDING",
                    "PREPARING",
                    "READY",
                ],
            ),
        );

        /*
         * Si no existe trabajo operativo pendiente,
         * tampoco puede existir un Check pagado
         * pendiente de completar.
         */
        if (pendingOrders.length === 0) {
            return NextResponse.json([]);
        }

        /*
         * Una misma cuenta puede tener varias Orders.
         * Eliminamos IDs repetidos antes de consultar
         * Checks.
         */
        const checkIds = [
            ...new Set(
                pendingOrders.map(
                    (order) => order.checkId,
                ),
            ),
        ];

        /*
         * ============================================
         * CLOSED CHECKS
         * ============================================
         *
         * No basta con que una Order esté pendiente.
         *
         * Para aparecer en esta vista, su Check debe
         * estar económicamente cerrado/pagado.
         */
        // const paidPendingChecks =
        //   await tenant.findMany(
        //     checks,
        //     and(
        //       inArray(
        //         checks.id,
        //         checkIds,
        //       ),
        //       inArray(
        //         checks.status,
        //         ["CLOSED"],
        //       ),
        //     ),
        //   );
        const paidPendingChecks =
            await tenant.findMany(
                checks,
                and(
                    inArray(
                        checks.id,
                        checkIds,
                    ),
                    eq(
                        checks.status,
                        "CLOSED",
                    ),
                ),
            );

        return NextResponse.json(
            paidPendingChecks,
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

        console.error(
            "GET /api/checks/paid-pending error:",
            error,
        );

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}