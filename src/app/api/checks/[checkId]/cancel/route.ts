import { NextResponse } from "next/server";
import {
  and,
  eq,
  ne,
} from "drizzle-orm";

import {
  checks,
  orders,
  payments,
} from "@/db/schema";
import { requireAuth } from "@/lib/auth/requireAuth";
import { tenantDb } from "@/lib/db/tenantDb";

export async function POST(
  request: Request,
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
     * CHECK
     * ============================================
     */
    const check = await tenant.findFirst(
      checks,
      eq(checks.id, checkId),
    );

    if (!check) {
      return NextResponse.json(
        { error: "Check not found" },
        { status: 404 },
      );
    }

    /*
     * ============================================
     * CHECK STATUS
     * ============================================
     *
     * Phase 1:
     *
     * Solamente:
     *
     * OPEN → CANCELLED
     *
     * CLOSED y CANCELLED son estados terminales.
     */
    if (check.status === "CLOSED") {
      return NextResponse.json(
        {
          error:
            "Closed checks cannot be cancelled",
        },
        { status: 409 },
      );
    }

    if (check.status === "CANCELLED") {
      return NextResponse.json(
        {
          error:
            "Check is already cancelled",
        },
        { status: 409 },
      );
    }

    /*
     * Defensa adicional.
     *
     * Si agregamos otro estado al enum en el
     * futuro, no queremos volverlo cancelable
     * automáticamente.
     */
    if (check.status !== "OPEN") {
      return NextResponse.json(
        {
          error:
            "Check cannot be cancelled from its current status",
        },
        { status: 409 },
      );
    }

    /*
     * ============================================
     * PAYMENT PROTECTION
     * ============================================
     *
     * Un Check que ya recibió cualquier pago
     * no puede cancelarse en Phase 1.
     *
     * No tenemos refunds todavía.
     */
    const existingPayment =
      await tenant.findFirst(
        payments,
        eq(payments.checkId, check.id),
      );

    if (existingPayment) {
      return NextResponse.json(
        {
          error:
            "Checks cannot be cancelled after a payment has been registered",
        },
        { status: 409 },
      );
    }

    /*
     * ============================================
     * ACTIVE ORDER PROTECTION
     * ============================================
     *
     * Permitimos cancelar:
     *
     * - Check sin Orders
     * - Check cuyas Orders estén TODAS CANCELLED
     *
     * No cancelamos Orders automáticamente.
     */
    const activeOrder =
      await tenant.findFirst(
        orders,
        and(
          eq(orders.checkId, check.id),
          ne(orders.status, "CANCELLED"),
        ),
      );

    if (activeOrder) {
      return NextResponse.json(
        {
          error:
            "All orders must be cancelled before cancelling the check",
        },
        { status: 409 },
      );
    }

    /*
     * ============================================
     * CANCEL CHECK
     * ============================================
     *
     * Incluimos status = OPEN en el WHERE para
     * protegernos contra un cambio concurrente
     * entre el SELECT y el UPDATE.
     */
    const updateResult = await tenant.update(
      checks,
      {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelledBy: auth.userId,
        cancellationReason: reason,
      },
      and(
        eq(checks.id, check.id),
        eq(checks.status, "OPEN"),
      ),
    );

    const affectedRows =
      updateResult[0].affectedRows;

    if (affectedRows !== 1) {
      return NextResponse.json(
        {
          error:
            "Check status changed before cancellation",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      id: check.id,
      previousStatus: check.status,
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
      "POST /api/checks/[checkId]/cancel error:",
      error,
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}