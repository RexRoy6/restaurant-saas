
import { NextResponse } from "next/server";
import {
  and,
  asc,
  eq,
  isNotNull,
} from "drizzle-orm";

import { db } from "@/db";
import {
  modifierGroups,
  modifierOptions,
} from "@/db/schema";
import { requireAuth } from "@/lib/auth/requireAuth";
import { tenantDb } from "@/lib/db/tenantDb";

type RouteContext = {
  params: Promise<{ groupId: string }>;
};

function parseGroupId(value: string): number | null {
  const id = Number(value);

  return Number.isSafeInteger(id) && id > 0
    ? id
    : null;
}

export async function GET(
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
    const groupId = parseGroupId(rawGroupId);

    if (groupId === null) {
      return NextResponse.json(
        { error: "Invalid modifier group id" },
        { status: 400 },
      );
    }

    const tenant = await tenantDb();

    // Verifica que el grupo esté activo
    // y pertenezca a la empresa autenticada.
    const group = await tenant.findFirst(
      modifierGroups,
      eq(modifierGroups.id, groupId),
    );

    if (!group) {
      return NextResponse.json(
        {
          error: "Modifier group not found or inactive",
        },
        { status: 404 },
      );
    }

    // Consulta directa porque tenant.findMany()
    // excluye automáticamente registros eliminados.
    // El filtro de empresa se aplica explícitamente.
    const options = await db
      .select()
      .from(modifierOptions)
      .where(
        and(
          eq(modifierOptions.companyId, auth.companyId),
          eq(modifierOptions.groupId, groupId),
          isNotNull(modifierOptions.deletedAt),
        ),
      )
      .orderBy(
        asc(modifierOptions.sortOrder),
        asc(modifierOptions.id),
      );

    return NextResponse.json(options);
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
      "GET /api/modifier-groups/[groupId]/options/inactive error:",
      error,
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}