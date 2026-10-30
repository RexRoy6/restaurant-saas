
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import {
  modifierGroups,
  modifierOptions,
} from "@/db/schema";
import { requireAuth } from "@/lib/auth/requireAuth";
import { tenantDb } from "@/lib/db/tenantDb";

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

function errorResponse(error: unknown, operation: string) {
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
      { error: "A modifier group with this name already exists" },
      { status: 409 },
    );
  }

  console.error(`${operation} error:`, error);

  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 },
  );
}

export async function GET() {
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

    const tenant = await tenantDb();

    const groups = await tenant.findMany(modifierGroups);
    const options = await tenant.findMany(modifierOptions);

    groups.sort(
      (a, b) => a.sortOrder - b.sortOrder || a.id - b.id,
    );

    options.sort(
      (a, b) => a.sortOrder - b.sortOrder || a.id - b.id,
    );

    const optionsByGroup = new Map<
      number,
      typeof options
    >();

    for (const option of options) {
      const existing = optionsByGroup.get(option.groupId) ?? [];
      existing.push(option);
      optionsByGroup.set(option.groupId, existing);
    }

    return NextResponse.json(
      groups.map((group) => ({
        ...group,
        options: optionsByGroup.get(group.id) ?? [],
      })),
    );
  } catch (error) {
    return errorResponse(error, "GET /api/modifier-groups");
  }
}

export async function POST(request: Request) {
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

    const name =
      typeof data.name === "string"
        ? data.name.trim()
        : "";

    const minSelections =
      data.minSelections === undefined
        ? 0
        : data.minSelections;

    const maxSelections =
      data.maxSelections === undefined
        ? 1
        : data.maxSelections;

    const sortOrder =
      data.sortOrder === undefined
        ? 0
        : data.sortOrder;

    if (!name || name.length > 120) {
      return NextResponse.json(
        { error: "Name must contain between 1 and 120 characters" },
        { status: 400 },
      );
    }

    if (
      typeof minSelections !== "number" ||
      !Number.isSafeInteger(minSelections) ||
      minSelections < 0
    ) {
      return NextResponse.json(
        { error: "minSelections must be a non-negative integer" },
        { status: 400 },
      );
    }

    if (
      typeof maxSelections !== "number" ||
      !Number.isSafeInteger(maxSelections) ||
      maxSelections < 1 ||
      maxSelections < minSelections
    ) {
      return NextResponse.json(
        {
          error:
            "maxSelections must be a positive integer greater than or equal to minSelections",
        },
        { status: 400 },
      );
    }

    if (
      typeof sortOrder !== "number" ||
      !Number.isSafeInteger(sortOrder) ||
      sortOrder < 0
    ) {
      return NextResponse.json(
        { error: "sortOrder must be a non-negative integer" },
        { status: 400 },
      );
    }

    const tenant = await tenantDb();

    await tenant.insert(modifierGroups, {
      name,
      minSelections,
      maxSelections,
      sortOrder,
    });

    return NextResponse.json(
      { message: "Modifier group created successfully" },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error, "POST /api/modifier-groups");
  }
}