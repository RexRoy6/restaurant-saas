import { NextResponse } from "next/server";
import { products } from "@/db/schema";
import { requireAuth } from "@/lib/auth/requireAuth";
import { tenantDb } from "@/lib/db/tenantDb";

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

    const tenant = await tenantDb();

    const productList = await tenant.findMany(products);

    return NextResponse.json(productList);
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

    console.error("GET /api/products error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}