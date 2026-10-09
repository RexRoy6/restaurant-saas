import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAuth } from "@/lib/auth/requireAuth";

import {
  getCompanySalesContext,
} from "@/modules/sales/server/getCompanySalesContext";

import {
  getSalesReport,
} from "@/modules/sales/server/getSalesReport";

import {
  generateSalesWorkbook,
} from "@/modules/sales/server/generateSalesWorkbook";

import {
  getSalesPeriod,
} from "@/modules/sales/utils/getSalesPeriod";

import {
  parseSalesPeriod,
} from "@/modules/sales/utils/parseSalesPeriod";

export async function GET(
  request: NextRequest,
) {
  try {
    const auth = await requireAuth({
      roles: ["owner"],
    });

    if (!auth.companyId) {
      return NextResponse.json(
        {
          error: "Tenant required",
        },
        {
          status: 403,
        },
      );
    }

    const preset = parseSalesPeriod(
      request.nextUrl.searchParams.get(
        "period",
      ),
    );

    const companyContext =
      await getCompanySalesContext(
        auth.companyId,
      );

    const period = getSalesPeriod(
      preset,
      companyContext.timezone,
    );

    const report =
      await getSalesReport(
        auth.companyId,
        period,
      );

    const workbook =
      await generateSalesWorkbook(
        report,
      );

    const filename =
      `ventas-${preset}.xlsx`;

    return new NextResponse(
      new Uint8Array(workbook),
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

          "Content-Disposition":
            `attachment; filename="${filename}"`,

          "Cache-Control":
            "private, no-store",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error";

    if (message === "Unauthorized") {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    if (message === "Forbidden") {
      return NextResponse.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        },
      );
    }

    if (
      message.startsWith(
        "Invalid sales period:",
      )
    ) {
      return NextResponse.json(
        {
          error: message,
        },
        {
          status: 400,
        },
      );
    }

    console.error(
      "GET /api/sales/export failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}