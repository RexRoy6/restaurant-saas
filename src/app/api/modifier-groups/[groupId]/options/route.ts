
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

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

function isDuplicateEntryError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const possibleError = error as {
    code?: string;
    cause?: { code?: string };
  };

  return (
    possibleError.code === "ER_DUP_ENTRY" ||
    possibleError.cause?.code === "ER_DUP_ENTRY"
  );
}

function handleError(error: unknown, operation: string) {
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
        error: "An option with this name already exists in the group",
      },
      { status: 409 },
    );
  }

  console.error(`${operation} error:`, error);

  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 },
  );
}

export async function GET(
  _request: Request,
  context: RouteContext,
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

    const { groupId: rawGroupId } = await context.params;
    const groupId = parseGroupId(rawGroupId);

    if (groupId === null) {
      return NextResponse.json(
        { error: "Invalid modifier group id" },
        { status: 400 },
      );
    }

    const tenant = await tenantDb();

    const group = await tenant.findFirst(
      modifierGroups,
      eq(modifierGroups.id, groupId),
    );

    if (!group) {
      return NextResponse.json(
        { error: "Modifier group not found" },
        { status: 404 },
      );
    }

    const options = await tenant.findMany(
      modifierOptions,
      eq(modifierOptions.groupId, groupId),
    );

    options.sort(
      (a, b) =>
        a.sortOrder - b.sortOrder || a.id - b.id,
    );

    return NextResponse.json(options);
  } catch (error) {
    return handleError(
      error,
      "GET /api/modifier-groups/[groupId]/options",
    );
  }
}

export async function POST(
  request: Request,
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

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "Request body must be an object" },
        { status: 400 },
      );
    }

    const data = body as Record<string, unknown>;

    const allowedFields = [
      "name",
      "priceInCents",
      "isAvailable",
      "sortOrder",
    ];

    const unknownFields = Object.keys(data).filter(
      (key) => !allowedFields.includes(key),
    );

    if (unknownFields.length > 0) {
      return NextResponse.json(
        {
          error: `Unknown fields: ${unknownFields.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const name =
      typeof data.name === "string"
        ? data.name.trim()
        : "";

    const priceInCents = data.priceInCents;

    const isAvailable =
      data.isAvailable === undefined
        ? true
        : data.isAvailable;

    const sortOrder =
      data.sortOrder === undefined
        ? 0
        : data.sortOrder;

    if (!name || name.length > 120) {
      return NextResponse.json(
        {
          error:
            "Name must contain between 1 and 120 characters",
        },
        { status: 400 },
      );
    }

    if (
      typeof priceInCents !== "number" ||
      !Number.isSafeInteger(priceInCents) ||
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

    if (typeof isAvailable !== "boolean") {
      return NextResponse.json(
        { error: "isAvailable must be a boolean" },
        { status: 400 },
      );
    }

    if (
      typeof sortOrder !== "number" ||
      !Number.isSafeInteger(sortOrder) ||
      sortOrder < 0
    ) {
      return NextResponse.json(
        {
          error:
            "sortOrder must be a non-negative integer",
        },
        { status: 400 },
      );
    }

    const tenant = await tenantDb();

    // Comprueba que el grupo está activo
    // y pertenece a la empresa autenticada.
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

    await tenant.insert(modifierOptions, {
      groupId,
      name,
      priceInCents,
      isAvailable,
      sortOrder,
    });

    return NextResponse.json(
      {
        message: "Modifier option created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    return handleError(
      error,
      "POST /api/modifier-groups/[groupId]/options",
    );
  }
}