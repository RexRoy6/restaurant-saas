import { NextResponse } from "next/server";
import { and, eq, isNotNull, asc } from "drizzle-orm";

import { db } from "@/db";
import { modifierGroups } from "@/db/schema";
import { requireAuth } from "@/lib/auth/requireAuth";

export async function GET() {
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

    const groups = await db
      .select()
      .from(modifierGroups)
      .where(
        and(
          eq(modifierGroups.companyId, auth.companyId),
          isNotNull(modifierGroups.deletedAt),
        ),
      )
      .orderBy(asc(modifierGroups.sortOrder));

    return NextResponse.json(groups);
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
      "GET /api/modifier-groups/inactive error:",
      error,
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}