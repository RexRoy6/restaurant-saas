
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { modifierGroups } from "@/db/schema";
import { requireAuth } from "@/lib/auth/requireAuth";
import { tenantDb } from "@/lib/db/tenantDb";

type RouteContext = {
  params: Promise<{ groupId: string }>;
};

function parseGroupId(value: string): number | null {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return null;
  }

  return id;
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
        error:
          "A modifier group with this name already exists",
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

export async function PATCH(
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
      "minSelections",
      "maxSelections",
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

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "At least one field is required" },
        { status: 400 },
      );
    }

    const tenant = await tenantDb();

    const existingGroup = await tenant.findFirst(
      modifierGroups,
      eq(modifierGroups.id, groupId),
    );

    if (!existingGroup) {
      return NextResponse.json(
        { error: "Modifier group not found" },
        { status: 404 },
      );
    }

    const updates: {
      name?: string;
      minSelections?: number;
      maxSelections?: number;
      sortOrder?: number;
    } = {};

    if ("name" in data) {
      if (typeof data.name !== "string") {
        return NextResponse.json(
          { error: "Name must be a string" },
          { status: 400 },
        );
      }

      const name = data.name.trim();

      if (!name || name.length > 120) {
        return NextResponse.json(
          {
            error:
              "Name must contain between 1 and 120 characters",
          },
          { status: 400 },
        );
      }

      updates.name = name;
    }

    if ("minSelections" in data) {
      if (
        typeof data.minSelections !== "number" ||
        !Number.isSafeInteger(data.minSelections) ||
        data.minSelections < 0
      ) {
        return NextResponse.json(
          {
            error:
              "minSelections must be a non-negative integer",
          },
          { status: 400 },
        );
      }

      updates.minSelections = data.minSelections;
    }

    if ("maxSelections" in data) {
      if (
        typeof data.maxSelections !== "number" ||
        !Number.isSafeInteger(data.maxSelections) ||
        data.maxSelections < 1
      ) {
        return NextResponse.json(
          {
            error:
              "maxSelections must be a positive integer",
          },
          { status: 400 },
        );
      }

      updates.maxSelections = data.maxSelections;
    }

    if ("sortOrder" in data) {
      if (
        typeof data.sortOrder !== "number" ||
        !Number.isSafeInteger(data.sortOrder) ||
        data.sortOrder < 0
      ) {
        return NextResponse.json(
          {
            error:
              "sortOrder must be a non-negative integer",
          },
          { status: 400 },
        );
      }

      updates.sortOrder = data.sortOrder;
    }

    const nextMin =
      updates.minSelections ?? existingGroup.minSelections;

    const nextMax =
      updates.maxSelections ?? existingGroup.maxSelections;

    if (nextMin > nextMax) {
      return NextResponse.json(
        {
          error:
            "minSelections cannot exceed maxSelections",
        },
        { status: 400 },
      );
    }

    await tenant.update(
      modifierGroups,
      updates,
      eq(modifierGroups.id, groupId),
    );

    return NextResponse.json({
      message: "Modifier group updated successfully",
    });
  } catch (error) {
    return handleError(
      error,
      "PATCH /api/modifier-groups/[groupId]",
    );
  }
}

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

    const { groupId: rawGroupId } = await context.params;
    const groupId = parseGroupId(rawGroupId);

    if (groupId === null) {
      return NextResponse.json(
        { error: "Invalid modifier group id" },
        { status: 400 },
      );
    }

    const tenant = await tenantDb();

    const existingGroup = await tenant.findFirst(
      modifierGroups,
      eq(modifierGroups.id, groupId),
    );

    if (!existingGroup) {
      return NextResponse.json(
        { error: "Modifier group not found" },
        { status: 404 },
      );
    }

    await tenant.delete(
      modifierGroups,
      eq(modifierGroups.id, groupId),
    );

    return NextResponse.json({
      message: "Modifier group deactivated successfully",
    });
  } catch (error) {
    return handleError(
      error,
      "DELETE /api/modifier-groups/[groupId]",
    );
  }
}