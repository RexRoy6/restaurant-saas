import { getSalesData } from "./getSalesData";

import type {
    SalesPeriodRange,
    SalesSummary,
} from "../types/sales";

type ProductSales = {
    productId: number;
    productName: string;
    quantity: number;
    totalInCents: number;
    latestCreatedAt: Date;
};

export async function getSalesSummary(
    period: SalesPeriodRange,
): Promise<SalesSummary> {
    const {
        closedChecks,
        checkPayments,
        items,
    } = await getSalesData(period);

    const paidChecks = closedChecks.length;

    let totalSalesInCents = 0;
    let productsSold = 0;

    const productsMap =
        new Map<number, ProductSales>();

    let cashInCents = 0;
    let cardInCents = 0;
    let transferInCents = 0;

    for (const payment of checkPayments) {
        switch (payment.paymentMethod) {
            case "CASH":
                cashInCents += payment.amountInCents;
                break;

            case "CARD":
                cardInCents += payment.amountInCents;
                break;

            case "TRANSFER":
                transferInCents +=
                    payment.amountInCents;
                break;
        }
    }

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
            productsMap.get(
                item.productId,
            );

        if (!existingProduct) {
            productsMap.set(
                item.productId,
                {
                    productId:
                        item.productId,
                    productName:
                        item.productName,
                    quantity:
                        item.quantity,
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
            !Number.isSafeInteger(
                nextQuantity,
            ) ||
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

    const products = Array.from(
        productsMap.values(),
    )
        .map((product) => ({
            productId: product.productId,
            productName: product.productName,
            quantity: product.quantity,
            totalInCents:
                product.totalInCents,
        }))
        .sort(
            (a, b) =>
                b.quantity - a.quantity,
        );

    return {
        period: {
            preset: period.preset,
            timezone: period.timezone,
            from: period.from.toISOString(),
            to: period.to.toISOString(),
        },

        totalSalesInCents,
        paidChecks,
        productsSold,

        salesByPaymentMethod: {
            cashInCents,
            cardInCents,
            transferInCents,
        },

        products,
    };
}