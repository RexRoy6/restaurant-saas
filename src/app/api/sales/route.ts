import {
    NextRequest,
    NextResponse,
} from "next/server";

import { requireAuth } from "@/lib/auth/requireAuth";

import { getCompanyTimezone } from "@/modules/sales/server/getCompanyTimezone";
import { getSalesSummary } from "@/modules/sales/server/getSalesSummary";

import { getSalesPeriod } from "@/modules/sales/utils/getSalesPeriod";
import { parseSalesPeriod } from "@/modules/sales/utils/parseSalesPeriod";

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

        const timezone =
            await getCompanyTimezone(
                auth.companyId,
            );

        const period = getSalesPeriod(
            preset,
            timezone,
        );

        const summary =
            await getSalesSummary(period);

        return NextResponse.json(summary);
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
            "GET /api/sales failed:",
            error,
        );

        return NextResponse.json(
            {
                error: "Internal server error",
            },
            {
                status: 500,
            },
        );
    }
}