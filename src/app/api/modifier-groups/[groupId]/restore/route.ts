import { NextResponse } from "next/server";
import { and, eq, isNotNull } from "drizzle-orm";

import { db } from "@/db";
import { modifierGroups } from "@/db/schema";
import { requireAuth } from "@/lib/auth/requireAuth";
import { tenantDb } from "@/lib/db/tenantDb";

type RouteContext = {
  params: Promise<{ groupId: string }>;
};

export async function PATCH(
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

    const { groupId: rawGroupId } = await context.params;
    const groupId = Number(rawGroupId);

    if (
      !Number.isSafeInteger(groupId) ||
      groupId <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid modifier group id" },
        { status: 400 },
      );
    }

    // La búsqueda incluye registros desactivados,
    // pero siempre se limita a la empresa autenticada.
    const [existingGroup] = await db
      .select({ id: modifierGroups.id })
      .from(modifierGroups)
      .where(
        and(
          eq(modifierGroups.id, groupId),
          eq(modifierGroups.companyId, auth.companyId),
          isNotNull(modifierGroups.deletedAt),
        ),
      )
      .limit(1);

    if (!existingGroup) {
      return NextResponse.json(
        { error: "Inactive modifier group not found" },
        { status: 404 },
      );
    }

    const tenant = await tenantDb();

    await tenant.restore(
      modifierGroups,
      eq(modifierGroups.id, groupId),
    );

    return NextResponse.json({
      message: "Modifier group restored successfully",
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
      "PATCH /api/modifier-groups/[groupId]/restore error:",
      error,
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}