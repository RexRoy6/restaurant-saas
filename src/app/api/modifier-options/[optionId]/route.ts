
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import {
  modifierGroups,
  modifierOptions,
} from "@/db/schema";
import { requireAuth } from "@/lib/auth/requireAuth";
import { tenantDb } from "@/lib/db/tenantDb";

type RouteContext = {
  params: Promise<{ optionId: string }>;
};

function parseOptionId(value: string): number | null {
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
        error:
          "An option with this name already exists in the group",
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

    const { optionId: rawOptionId } = await context.params;
    const optionId = parseOptionId(rawOptionId);

    if (optionId === null) {
      return NextResponse.json(
        { error: "Invalid modifier option id" },
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

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "At least one field is required" },
        { status: 400 },
      );
    }

    const updates: {
      name?: string;
      priceInCents?: number;
      isAvailable?: boolean;
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

    if ("priceInCents" in data) {
      if (
        typeof data.priceInCents !== "number" ||
        !Number.isSafeInteger(data.priceInCents) ||
        data.priceInCents < 0
      ) {
        return NextResponse.json(
          {
            error:
              "priceInCents must be a non-negative integer",
          },
          { status: 400 },
        );
      }

      updates.priceInCents = data.priceInCents;
    }

    if ("isAvailable" in data) {
      if (typeof data.isAvailable !== "boolean") {
        return NextResponse.json(
          { error: "isAvailable must be a boolean" },
          { status: 400 },
        );
      }

      updates.isAvailable = data.isAvailable;
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

    const tenant = await tenantDb();

    const existingOption = await tenant.findFirst(
      modifierOptions,
      eq(modifierOptions.id, optionId),
    );

    if (!existingOption) {
      return NextResponse.json(
        { error: "Modifier option not found" },
        { status: 404 },
      );
    }

    // No permitimos editar opciones de un grupo desactivado.
    const parentGroup = await tenant.findFirst(
      modifierGroups,
      eq(modifierGroups.id, existingOption.groupId),
    );

    if (!parentGroup) {
      return NextResponse.json(
        { error: "Parent modifier group is inactive" },
        { status: 409 },
      );
    }

    await tenant.update(
      modifierOptions,
      updates,
      eq(modifierOptions.id, optionId),
    );

    return NextResponse.json({
      message: "Modifier option updated successfully",
    });
  } catch (error) {
    return handleError(
      error,
      "PATCH /api/modifier-options/[optionId]",
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

    const { optionId: rawOptionId } = await context.params;
    const optionId = parseOptionId(rawOptionId);

    if (optionId === null) {
      return NextResponse.json(
        { error: "Invalid modifier option id" },
        { status: 400 },
      );
    }

    const tenant = await tenantDb();

    const existingOption = await tenant.findFirst(
      modifierOptions,
      eq(modifierOptions.id, optionId),
    );

    if (!existingOption) {
      return NextResponse.json(
        { error: "Modifier option not found" },
        { status: 404 },
      );
    }

    await tenant.delete(
      modifierOptions,
      eq(modifierOptions.id, optionId),
    );

    return NextResponse.json({
      message: "Modifier option deactivated successfully",
    });
  } catch (error) {
    return handleError(
      error,
      "DELETE /api/modifier-options/[optionId]",
    );
  }
}