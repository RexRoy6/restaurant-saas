
import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/requireAuth";
import { readCompanyPublicInfo } from "@/modules/companyPublicInfo/server/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  // Protección adicional: jamás habilitar esta ruta
  // en producción.
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Not Found" },
      { status: 404 },
    );
  }

  try {
    // Solo Owner, igual que el servicio definitivo.
    const auth = await requireAuth({
      roles: ["owner"],
    });

    if (auth.companyId === null) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      );
    }

    const result = await readCompanyPublicInfo(
      auth.companyId,
    );

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Unauthorized"
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    if (
      error instanceof Error &&
      error.message === "Forbidden"
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      );
    }

    console.error("Public info read test failed", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
