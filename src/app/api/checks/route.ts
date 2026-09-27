import { NextResponse } from "next/server";
import { checks } from "@/db/schema";
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

    const checkList = await tenant.findMany(checks);

    return NextResponse.json(checkList);
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

    console.error("GET /api/checks error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/checks
 *
 * Abre una nueva cuenta para la empresa
 * del OWNER autenticado.
 *
 * El cliente únicamente puede proporcionar:
 * - name (opcional)
 * - note (opcional)
 *
 * companyId, status y closedAt son
 * controlados por el servidor.
 */
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

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const note =
      typeof body.note === "string"
        ? body.note.trim()
        : "";

    if (name.length > 255) {
      return NextResponse.json(
        {
          error:
            "Name must be 255 characters or fewer",
        },
        { status: 400 },
      );
    }

    if (note.length > 500) {
      return NextResponse.json(
        {
          error:
            "Note must be 500 characters or fewer",
        },
        { status: 400 },
      );
    }

    const tenant = await tenantDb();

    const result = await tenant.insert(checks, {
      name: name || null,
      note: note || null,
    });

    return NextResponse.json(
      {
        message: "Check created successfully",
        id: result[0].insertId,
      },
      { status: 201 },
    );
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

    console.error("POST /api/checks error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}