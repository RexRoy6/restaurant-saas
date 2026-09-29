import {
    NextRequest,
    NextResponse,
} from "next/server";

import { requireAuth } from "@/lib/auth/requireAuth";
import { getCompanyTimezone } from "@/modules/sales/server/getCompanyTimezone";
import { getSalesPeriod } from "@/modules/sales/utils/getSalesPeriod";
import { parseSalesPeriod } from "@/modules/sales/utils/parseSalesPeriod";
import {
    and,
    eq,
    gte,
    inArray,
    lt,
    ne,
} from "drizzle-orm";

import {
    checks,
    orders,
    orderItems,
} from "@/db/schema";
import { tenantDb } from "@/lib/db/tenantDb";

type ProductSales = {
    productId: number;
    productName: string;
    quantity: number;
    totalInCents: number;
    latestCreatedAt: Date;
};


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
        const tenant = await tenantDb();

        const closedChecks =
            await tenant.findMany(
                checks,
                and(
                    eq(checks.status, "CLOSED"),
                    gte(checks.closedAt, period.from),
                    lt(checks.closedAt, period.to),
                ),
            );

        const paidChecks = closedChecks.length;

        let totalSalesInCents = 0;
        let productsSold = 0;
        const productsMap =
            new Map<number, ProductSales>();

        if (closedChecks.length > 0) {
            const checkIds = closedChecks.map(
                (check) => check.id,
            );

            const activeOrders =
                await tenant.findMany(
                    orders,
                    and(
                        inArray(
                            orders.checkId,
                            checkIds,
                        ),
                        ne(
                            orders.status,
                            "CANCELLED",
                        ),
                    ),
                );

            if (activeOrders.length > 0) {
                const orderIds = activeOrders.map(
                    (order) => order.id,
                );

                const items = await tenant.findMany(
                    orderItems,
                    inArray(
                        orderItems.orderId,
                        orderIds,
                    ),
                );

                for (const item of items) {
                    const nextTotal =
                        totalSalesInCents +
                        item.subtotalInCents;

                    const nextProductsSold =
                        productsSold +
                        item.quantity;

                    if (
                        !Number.isSafeInteger(nextTotal) ||
                        nextTotal < 0
                    ) {
                        throw new Error(
                            "INVALID_SALES_TOTAL",
                        );
                    }

                    if (
                        !Number.isSafeInteger(
                            nextProductsSold,
                        ) ||
                        nextProductsSold < 0
                    ) {
                        throw new Error(
                            "INVALID_PRODUCTS_SOLD",
                        );
                    }

                    totalSalesInCents = nextTotal;
                    productsSold = nextProductsSold;

                    const existingProduct =
                        productsMap.get(item.productId);

                    if (!existingProduct) {
                        productsMap.set(
                            item.productId,
                            {
                                productId: item.productId,
                                productName: item.productName,
                                quantity: item.quantity,
                                totalInCents:
                                    item.subtotalInCents,
                                latestCreatedAt:
                                    item.createdAt,
                            },
                        );

                        continue;
                    }

                    const nextQuantity =
                        existingProduct.quantity +
                        item.quantity;

                    const nextProductTotal =
                        existingProduct.totalInCents +
                        item.subtotalInCents;

                    if (
                        !Number.isSafeInteger(nextQuantity) ||
                        nextQuantity < 0 ||
                        !Number.isSafeInteger(
                            nextProductTotal,
                        ) ||
                        nextProductTotal < 0
                    ) {
                        throw new Error(
                            "INVALID_PRODUCT_SALES",
                        );
                    }

                    existingProduct.quantity =
                        nextQuantity;

                    existingProduct.totalInCents =
                        nextProductTotal;

                    if (
                        item.createdAt >
                        existingProduct.latestCreatedAt
                    ) {
                        existingProduct.productName =
                            item.productName;

                        existingProduct.latestCreatedAt =
                            item.createdAt;
                    }

                }
            }
        }

        const products = Array.from(
            productsMap.values(),
        ).map((product) => ({
            productId: product.productId,
            productName: product.productName,
            quantity: product.quantity,
            totalInCents:
                product.totalInCents,
        }));


        return NextResponse.json({
            period: {
                preset: period.preset,
                timezone: period.timezone,
                from: period.from.toISOString(),
                to: period.to.toISOString(),
            },
            totalSalesInCents,
            paidChecks,
            productsSold,
            products,
        });
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