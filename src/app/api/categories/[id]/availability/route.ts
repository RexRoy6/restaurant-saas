import { eq } from "drizzle-orm";

import { categories } from "@/db/schema";
import { requireAuth } from "@/lib/auth/requireAuth";
import { tenantDb } from "@/lib/db/tenantDb";

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

    if (typeof body.isActive !== "boolean") {
      return Response.json(
        { error: "isActive must be a boolean" },
        { status: 400 },
      );
    }

    const tenant = await tenantDb();

    /**
     * Usamos findFirstRaw porque necesitamos encontrar
     * tanto categorías activas como deshabilitadas.
     *
     * Sigue respetando companyId / tenant isolation.
     */
    const category = await tenant.findFirstRaw(
      categories,
      eq(categories.id, categoryId),
    );

    if (!category) {
      return Response.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    const currentlyActive =
      category.deletedAt === null;

    /**
     * Operación idempotente:
     * si ya tiene el estado solicitado, respondemos OK.
     */
    if (currentlyActive === body.isActive) {
      return Response.json({
        message: body.isActive
          ? "Category is already active"
          : "Category is already disabled",
      });
    }

    if (body.isActive) {
      await tenant.restore(
        categories,
        eq(categories.id, categoryId),
      );

      return Response.json({
        message: "Category reactivated successfully",
      });
    }

    await tenant.delete(
      categories,
      eq(categories.id, categoryId),
    );

    return Response.json({
      message: "Category disabled successfully",
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

    console.error(
      "PATCH /api/categories/[id]/availability failed:",
      error,
    );

    return Response.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}