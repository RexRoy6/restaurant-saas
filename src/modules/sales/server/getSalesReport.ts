import { getSalesData } from "./getSalesData";

import type {
    SalesPeriodRange,
    SalesReportPaymentRow,
    SalesReportRow,
    SalesReportSummary
} from "../types/sales";

type SalesData = Awaited<
    ReturnType<typeof getSalesData>
>;

export async function getSalesReportRows(
    period: SalesPeriodRange,
): Promise<SalesReportRow[]> {
    const data =
        await getSalesData(period);

    // const {
    //     closedChecks,
    //     activeOrders,
    //     items,
    // } = await getSalesData(period);

    // const checksById = new Map(
    //     closedChecks.map(
    //         (check) => [
    //             check.id,
    //             check,
    //         ],
    //     ),
    // );

    // const ordersById = new Map(
    //     activeOrders.map(
    //         (order) => [
    //             order.id,
    //             order,
    //         ],
    //     ),
    // );

    // const salesRows: SalesReportRow[] = [];

    // for (const item of items) {
    //     const order = ordersById.get(
    //         item.orderId,
    //     );

    //     if (!order) {
    //         throw new Error(
    //             "SALES_REPORT_ORDER_NOT_FOUND",
    //         );
    //     }

    //     const check = checksById.get(
    //         order.checkId,
    //     );

    //     if (!check) {
    //         throw new Error(
    //             "SALES_REPORT_CHECK_NOT_FOUND",
    //         );
    //     }

    //     if (!check.closedAt) {
    //         throw new Error(
    //             "SALES_REPORT_CLOSED_AT_REQUIRED",
    //         );
    //     }

    //     salesRows.push({
    //         checkId: check.id,
    //         checkName: check.name,
    //         closedAt: check.closedAt,

    //         orderId: order.id,

    //         productId: item.productId,
    //         productName: item.productName,
    //         sku: item.sku,
    //         categoryName: item.categoryName,

    //         quantity: item.quantity,
    //         unitPriceInCents:
    //             item.unitPriceInCents,
    //         subtotalInCents:
    //             item.subtotalInCents,
    //     });
    // }


    //return salesRows;
    return buildSalesRows(data);
}
export async function getSalesReportPaymentRows(
    period: SalesPeriodRange,
): Promise<SalesReportPaymentRow[]> {
    const data =
        await getSalesData(period);

    // const {
    //     closedChecks,
    //     checkPayments,
    // } = await getSalesData(period);

    // const checksById = new Map(
    //     closedChecks.map(
    //         (check) => [
    //             check.id,
    //             check,
    //         ],
    //     ),
    // );

    // const paymentRows: SalesReportPaymentRow[] =
    //     [];

    // for (const payment of checkPayments) {
    //     const check = checksById.get(
    //         payment.checkId,
    //     );

    //     if (!check) {
    //         throw new Error(
    //             "SALES_REPORT_PAYMENT_CHECK_NOT_FOUND",
    //         );
    //     }

    //     if (!check.closedAt) {
    //         throw new Error(
    //             "SALES_REPORT_CLOSED_AT_REQUIRED",
    //         );
    //     }

    //     paymentRows.push({
    //         checkId: check.id,
    //         checkName: check.name,
    //         closedAt: check.closedAt,

    //         paymentId: payment.id,
    //         paidAt: payment.paidAt,
    //         paymentMethod:
    //             payment.paymentMethod,
    //         amountInCents:
    //             payment.amountInCents,
    //     });
    // }

    //return paymentRows;
    return buildPaymentRows(data);
}

function buildSalesRows(
    data: SalesData,
): SalesReportRow[] {
    const {
        closedChecks,
        activeOrders,
        items,
    } = data;

    const checksById = new Map(
        closedChecks.map(
            (check) => [
                check.id,
                check,
            ],
        ),
    );

    const ordersById = new Map(
        activeOrders.map(
            (order) => [
                order.id,
                order,
            ],
        ),
    );

    const salesRows: SalesReportRow[] = [];

    for (const item of items) {
        const order = ordersById.get(
            item.orderId,
        );

        if (!order) {
            throw new Error(
                "SALES_REPORT_ORDER_NOT_FOUND",
            );
        }

        const check = checksById.get(
            order.checkId,
        );

        if (!check) {
            throw new Error(
                "SALES_REPORT_CHECK_NOT_FOUND",
            );
        }

        if (!check.closedAt) {
            throw new Error(
                "SALES_REPORT_CLOSED_AT_REQUIRED",
            );
        }

        salesRows.push({
            checkId: check.id,
            checkName: check.name,
            closedAt: check.closedAt,

            orderId: order.id,

            productId: item.productId,
            productName: item.productName,
            sku: item.sku,
            categoryName: item.categoryName,

            quantity: item.quantity,
            unitPriceInCents:
                item.unitPriceInCents,
            subtotalInCents:
                item.subtotalInCents,
        });
    }

    return salesRows;
}
function buildPaymentRows(
    data: SalesData,
): SalesReportPaymentRow[] {
    const {
        closedChecks,
        checkPayments,
    } = data;

    const checksById = new Map(
        closedChecks.map(
            (check) => [
                check.id,
                check,
            ],
        ),
    );

    const paymentRows: SalesReportPaymentRow[] =
        [];

    for (const payment of checkPayments) {
        const check = checksById.get(
            payment.checkId,
        );

        if (!check) {
            throw new Error(
                "SALES_REPORT_PAYMENT_CHECK_NOT_FOUND",
            );
        }

        if (!check.closedAt) {
            throw new Error(
                "SALES_REPORT_CLOSED_AT_REQUIRED",
            );
        }

        paymentRows.push({
            checkId: check.id,
            checkName: check.name,
            closedAt: check.closedAt,

            paymentId: payment.id,
            paidAt: payment.paidAt,
            paymentMethod:
                payment.paymentMethod,
            amountInCents:
                payment.amountInCents,
        });
    }

    return paymentRows;
}
function buildReportSummary(
    data: SalesData,
    salesRows: SalesReportRow[],
    paymentRows: SalesReportPaymentRow[],
): SalesReportSummary {
    let totalSalesInCents = 0;
    let productsSold = 0;

    for (const row of salesRows) {
        totalSalesInCents +=
            row.subtotalInCents;

        productsSold += row.quantity;

        if (
            !Number.isSafeInteger(
                totalSalesInCents,
            ) ||
            totalSalesInCents < 0
        ) {
            throw new Error(
                "INVALID_SALES_REPORT_TOTAL",
            );
        }

        if (
            !Number.isSafeInteger(
                productsSold,
            ) ||
            productsSold < 0
        ) {
            throw new Error(
                "INVALID_SALES_REPORT_PRODUCTS_SOLD",
            );
        }
    }

    let cashInCents = 0;
    let cardInCents = 0;
    let transferInCents = 0;

    for (const payment of paymentRows) {
        switch (payment.paymentMethod) {
            case "CASH":
                cashInCents +=
                    payment.amountInCents;
                break;

            case "CARD":
                cardInCents +=
                    payment.amountInCents;
                break;

            case "TRANSFER":
                transferInCents +=
                    payment.amountInCents;
                break;
        }
    }

    const totalPaymentsInCents =
        cashInCents +
        cardInCents +
        transferInCents;

    if (
        !Number.isSafeInteger(
            totalPaymentsInCents,
        ) ||
        totalPaymentsInCents < 0
    ) {
        throw new Error(
            "INVALID_SALES_REPORT_PAYMENTS_TOTAL",
        );
    }

    return {
        totalSalesInCents,
        paidChecks:
            data.closedChecks.length,
        productsSold,

        salesByPaymentMethod: {
            cashInCents,
            cardInCents,
            transferInCents,
        },

        totalPaymentsInCents,
    };
}
function validateSalesReport(
    data: SalesData,
    salesRows: SalesReportRow[],
    paymentRows: SalesReportPaymentRow[],
    summary: SalesReportSummary,
) {
    const itemsTotalInCents =
        salesRows.reduce(
            (total, row) =>
                total + row.subtotalInCents,
            0,
        );

    const itemsQuantity =
        salesRows.reduce(
            (total, row) =>
                total + row.quantity,
            0,
        );

    const paymentsTotalInCents =
        paymentRows.reduce(
            (total, row) =>
                total + row.amountInCents,
            0,
        );

    if (
        itemsTotalInCents !==
        summary.totalSalesInCents
    ) {
        throw new Error(
            "SALES_REPORT_TOTAL_MISMATCH",
        );
    }

    if (
        itemsQuantity !==
        summary.productsSold
    ) {
        throw new Error(
            "SALES_REPORT_PRODUCTS_MISMATCH",
        );
    }

    if (
        data.closedChecks.length !==
        summary.paidChecks
    ) {
        throw new Error(
            "SALES_REPORT_CHECKS_MISMATCH",
        );
    }

    if (
        paymentsTotalInCents !==
        summary.totalPaymentsInCents
    ) {
        throw new Error(
            "SALES_REPORT_PAYMENTS_MISMATCH",
        );
    }
}

//temporal:
export async function getSalesReportData(
    period: SalesPeriodRange,
) {
    const data =
        await getSalesData(period);

    const salesRows =
        buildSalesRows(data);

    const paymentRows =
        buildPaymentRows(data);

    const summary =
        buildReportSummary(
            data,
            salesRows,
            paymentRows,
        );

    validateSalesReport(
        data,
        salesRows,
        paymentRows,
        summary,
    );

    return {
        summary,
        salesRows,
        paymentRows,
    };
}