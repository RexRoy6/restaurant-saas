import { requireAuth } from "@/lib/auth/requireAuth";
import { tenantDb } from "@/lib/db/tenantDb";
import { categories } from "@/db/schema";

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

/**
 * GET /api/categories
 *
 * Devuelve únicamente las categorías activas
 * de la empresa del OWNER autenticado.
 */
export async function GET() {
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

    const tenant = await tenantDb();

    const rows = await tenant.findMany(categories);

    rows.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }

      return a.name.localeCompare(b.name);
    });

    return Response.json(rows);
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

    console.error("GET /api/categories failed:", error);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/categories
 *
 * Crea una categoría para la empresa
 * del OWNER autenticado.
 */
export async function POST(request: Request) {
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

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const sortOrder =
      body.sortOrder === undefined
        ? 0
        : body.sortOrder;

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

    await tenant.insert(categories, {
      name,
      sortOrder,
    });

    return Response.json(
      {
        message: "Category created successfully",
      },
      { status: 201 },
    );
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

    console.error("POST /api/categories failed:", error);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}