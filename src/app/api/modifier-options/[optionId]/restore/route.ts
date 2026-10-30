
import { NextResponse } from "next/server";
import { and, eq, isNotNull } from "drizzle-orm";

import { db } from "@/db";
import {
  modifierGroups,
  modifierOptions,
} from "@/db/schema";
import { requireAuth } from "@/lib/auth/requireAuth";
import { tenantDb } from "@/lib/db/tenantDb";

type RouteContext = {
  params: Promise<{ optionId: string }>;
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

    const { optionId: rawOptionId } = await context.params;
    const optionId = Number(rawOptionId);

    if (
      !Number.isSafeInteger(optionId) ||
      optionId <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid modifier option id" },
        { status: 400 },
      );
    }

    const [existingOption] = await db
      .select({
        id: modifierOptions.id,
        groupId: modifierOptions.groupId,
      })
      .from(modifierOptions)
      .where(
        and(
          eq(modifierOptions.id, optionId),
          eq(modifierOptions.companyId, auth.companyId),
          isNotNull(modifierOptions.deletedAt),
        ),
      )
      .limit(1);

    if (!existingOption) {
      return NextResponse.json(
        { error: "Inactive modifier option not found" },
        { status: 404 },
      );
    }

    const tenant = await tenantDb();

    // Solo restauramos opciones si su grupo está activo.
    const parentGroup = await tenant.findFirst(
      modifierGroups,
      eq(modifierGroups.id, existingOption.groupId),
    );

    if (!parentGroup) {
      return NextResponse.json(
        {
          error:
            "Restore the parent modifier group before restoring this option",
        },
        { status: 409 },
      );
    }

    await tenant.restore(
      modifierOptions,
      eq(modifierOptions.id, optionId),
    );

    return NextResponse.json({
      message: "Modifier option restored successfully",
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
      "PATCH /api/modifier-options/[optionId]/restore error:",
      error,
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
