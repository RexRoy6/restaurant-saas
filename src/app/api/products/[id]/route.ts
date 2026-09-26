import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { products } from "@/db/schema";
import { requireAuth } from "@/lib/auth/requireAuth";
import { tenantDb } from "@/lib/db/tenantDb";

function isDuplicateEntryError(
  error: unknown,
): boolean {
  if (
    typeof error !== "object" ||
    error === null
  ) {
    return false;
  }

  const possibleError = error as {
    code?: string;
    cause?: {
      code?: string;
    };
  };

  return (
    possibleError.code === "ER_DUP_ENTRY" ||
    possibleError.cause?.code === "ER_DUP_ENTRY"
  );
}

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

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const sku =
      typeof body.sku === "string"
        ? body.sku.trim()
        : "";

    const priceInCents = body.priceInCents;

    const categoryId = body.categoryId;


    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 },
      );
    }

    if (!sku) {
      return NextResponse.json(
        { error: "SKU is required" },
        { status: 400 },
      );
    }

    if (
      typeof priceInCents !== "number" ||
      !Number.isInteger(priceInCents) ||
      priceInCents < 0
    ) {
      return NextResponse.json(
        {
          error:
            "priceInCents must be a non-negative integer",
        },
        { status: 400 },
      );
    }
    if (
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {
      return Response.json(
        { error: "Valid categoryId is required" },
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
        categoryId,
        name,
        sku,
        priceInCents,
      },
      eq(products.id, productId),
    );

    return NextResponse.json({
      message: "Product updated successfully",
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

    if (isDuplicateEntryError(error)) {
      return NextResponse.json(
        {
          error:
            "A product with this SKU already exists",
        },
        { status: 409 },
      );
    }

    console.error(
      "PATCH /api/products/[id] error:",
      error,
    );
    if (
      message ===
      "Category does not belong to current tenant."
    ) {
      return Response.json(
        {
          error: "Category not found or unavailable",
        },
        { status: 400 },
      );
    }


    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}