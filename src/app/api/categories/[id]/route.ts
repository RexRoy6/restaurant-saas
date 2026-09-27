import { eq } from "drizzle-orm";

import { categories } from "@/db/schema";
import { requireAuth } from "@/lib/auth/requireAuth";
import { tenantDb } from "@/lib/db/tenantDb";

function getErrorCode(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null
  ) {
    if (
      "code" in error &&
      typeof error.code === "string"
    ) {
      return error.code;
    }

    if (
      "cause" in error &&
      typeof error.cause === "object" &&
      error.cause !== null &&
      "code" in error.cause &&
      typeof error.cause.code === "string"
    ) {
      return error.cause.code;
    }
  }

  return undefined;
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  try {
    const auth = await requireAuth({
      roles: ["owner"],
    });

    if (!auth.companyId) {
      return Response.json(
        { error: "Company is required" },
        { status: 403 },
      );
    }

    const { id } = await context.params;
    const categoryId = Number(id);

    if (
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {
      return Response.json(
        { error: "Invalid category id" },
        { status: 400 },
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const sortOrder = body.sortOrder;

    if (!name) {
      return Response.json(
        { error: "Name is required" },
        { status: 400 },
      );
    }

    if (
      !Number.isInteger(sortOrder) ||
      sortOrder < 0
    ) {
      return Response.json(
        {
          error:
            "sortOrder must be a non-negative integer",
        },
        { status: 400 },
      );
    }

    const tenant = await tenantDb();

    const category =
      await tenant.findFirst(
        categories,
        eq(categories.id, categoryId),
      );

    if (!category) {
      return Response.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    await tenant.update(
      categories,
      {
        name,
        sortOrder,
      },
      eq(categories.id, categoryId),
    );

    return Response.json({
      message: "Category updated successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected error";

    if (message === "Unauthorized") {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    if (message === "Forbidden") {
      return Response.json(
        { error: "Forbidden" },
        { status: 403 },
      );
    }

    if (getErrorCode(error) === "ER_DUP_ENTRY") {
      return Response.json(
        {
          error:
            "A category with this name already exists",
        },
        { status: 409 },
      );
    }

    console.error(
      "PATCH /api/categories/[id] failed:",
      error,
    );

    return Response.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}