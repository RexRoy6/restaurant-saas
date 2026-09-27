import { NextResponse } from "next/server";

import {
  PAYMENT_METHODS,
} from "@/db/schema";

import { requireAuth } from "@/lib/auth/requireAuth";

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

    /*
     * ============================================
     * TEMPORAL
     * ============================================
     *
     * En 11.3 únicamente comprobamos la frontera
     * HTTP.
     *
     * Todavía NO:
     *
     * - buscamos el Check
     * - calculamos el total
     * - buscamos Payments
     * - insertamos Payment
     * - cerramos el Check
     */
    return NextResponse.json({
      checkId,
      amountInCents:
        body.amountInCents,
      paymentMethod:
        body.paymentMethod,
      validationPassed: true,
    });
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
      "POST /api/checks/[checkId]/payments error:",
      error,
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}