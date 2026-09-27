import { requireAuth } from "@/lib/auth/requireAuth";
import { tenantDb } from "@/lib/db/tenantDb";
import { categories } from "@/db/schema";

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

    /**
     * RAW incluye categorías soft-deleted,
     * pero sigue respetando companyId.
     */
    const rows =
      await tenant.findManyRaw(categories);

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

    console.error(
      "GET /api/categories/all failed:",
      error,
    );

    return Response.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}