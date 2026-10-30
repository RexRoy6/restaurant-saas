
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import {
  products,
  productModifierGroups,
} from "@/db/schema";
import { requireAuth } from "@/lib/auth/requireAuth";
import { tenantDb } from "@/lib/db/tenantDb";

type RouteContext = {
  params: Promise<{
    id: string;
    groupId: string;
  }>;
};

export async function DELETE(
  _request: Request,
  context: RouteContext,
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

    const { id, groupId: rawGroupId } =
      await context.params;

    const productId = Number(id);
    const groupId = Number(rawGroupId);

    if (
      !Number.isSafeInteger(productId) ||
      productId <= 0 ||
      !Number.isSafeInteger(groupId) ||
      groupId <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid product or modifier group id" },
        { status: 400 },
      );
    }

    const tenant = await tenantDb();

    const product = await tenant.findFirst(
      products,
      eq(products.id, productId),
    );

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 },
      );
    }

    const assignment = await tenant.findFirst(
      productModifierGroups,
      and(
        eq(productModifierGroups.productId, productId),
        eq(productModifierGroups.groupId, groupId),
      ),
    );

    if (!assignment) {
      return NextResponse.json(
        { error: "Modifier group assignment not found" },
        { status: 404 },
      );
    }

    await tenant.delete(
      productModifierGroups,
      eq(productModifierGroups.id, assignment.id),
    );

    return NextResponse.json({
      message: "Modifier group unassigned successfully",
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
      "DELETE /api/products/[id]/modifier-groups/[groupId] error:",
      error,
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}