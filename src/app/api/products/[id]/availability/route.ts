import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { products } from "@/db/schema";
import { requireAuth } from "@/lib/auth/requireAuth";
import { tenantDb } from "@/lib/db/tenantDb";

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
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

    const { id } = await context.params;
    const productId = Number(id);

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid product id" },
        { status: 400 },
      );
    }

    const body = await request.json();

    if (typeof body.isAvailable !== "boolean") {
      return NextResponse.json(
        {
          error: "isAvailable must be a boolean",
        },
        { status: 400 },
      );
    }

    const tenant = await tenantDb();

    const existingProduct =
      await tenant.findFirst(
        products,
        eq(products.id, productId),
      );

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 },
      );
    }

    await tenant.update(
      products,
      {
        isAvailable: body.isAvailable,
      },
      eq(products.id, productId),
    );

    return NextResponse.json({
      message: body.isAvailable
        ? "Product marked as available"
        : "Product marked as unavailable",
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
      "PATCH /api/products/[id]/availability error:",
      error,
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}