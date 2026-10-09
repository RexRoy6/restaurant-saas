import ExcelJS from "exceljs";

import type {
  SalesReport,
} from "../types/sales";

function centsToCurrency(
  cents: number,
): number {
  if (
    !Number.isSafeInteger(cents) ||
    cents < 0
  ) {
    throw new Error(
      "INVALID_REPORT_MONEY_VALUE",
    );
  }

  return cents / 100;
}

function formatDateInTimezone(
  date: Date,
  timezone: string,
): string {
  return new Intl.DateTimeFormat(
    "es-MX",
    {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    },
  ).format(date);
}

function formatPaymentMethod(
  method:
    | "CASH"
    | "CARD"
    | "TRANSFER",
): string {
  switch (method) {
    case "CASH":
      return "Efectivo";

    case "CARD":
      return "Tarjeta";

    case "TRANSFER":
      return "Transferencia";
  }
}

export async function generateSalesWorkbook(
  report: SalesReport,
): Promise<Buffer> {
  const workbook =
    new ExcelJS.Workbook();

  workbook.creator =
    "Restaurant POS";

  workbook.created =
    report.metadata.generatedAt;

  /*
   * -------------------------
   * RESUMEN
   * -------------------------
   */

  const summarySheet =
    workbook.addWorksheet(
      "Resumen",
    );

  summarySheet.columns = [
    {
      header: "Concepto",
      key: "concept",
      width: 28,
    },
    {
      header: "Valor",
      key: "value",
      width: 32,
    },
  ];

  summarySheet.addRows([
    {
      concept: "Empresa",
      value:
        report.metadata.companyName,
    },
    {
      concept: "Período",
      value:
        report.metadata.preset,
    },
    {
      concept: "Zona horaria",
      value:
        report.metadata.timezone,
    },
    {
      concept: "Desde",
      value: formatDateInTimezone(
        report.metadata.from,
        report.metadata.timezone,
      ),
    },
    {
      concept: "Hasta (exclusivo)",
      value: formatDateInTimezone(
        report.metadata.to,
        report.metadata.timezone,
      ),
    },
    {
      concept: "Generado en",
      value: formatDateInTimezone(
        report.metadata.generatedAt,
        report.metadata.timezone,
      ),
    },
    {
      concept: "Total vendido",
      value: centsToCurrency(
        report.summary
          .totalSalesInCents,
      ),
    },
    {
      concept: "Cuentas pagadas",
      value:
        report.summary.paidChecks,
    },
    {
      concept: "Productos vendidos",
      value:
        report.summary.productsSold,
    },
    {
      concept: "Efectivo",
      value: centsToCurrency(
        report.summary
          .salesByPaymentMethod
          .cashInCents,
      ),
    },
    {
      concept: "Tarjeta",
      value: centsToCurrency(
        report.summary
          .salesByPaymentMethod
          .cardInCents,
      ),
    },
    {
      concept: "Transferencia",
      value: centsToCurrency(
        report.summary
          .salesByPaymentMethod
          .transferInCents,
      ),
    },
    {
      concept: "Total pagos",
      value: centsToCurrency(
        report.summary
          .totalPaymentsInCents,
      ),
    },
  ]);

  /*
   * Filas monetarias:
   *
   * 8  Total vendido
   * 11 Efectivo
   * 12 Tarjeta
   * 13 Transferencia
   * 14 Total pagos
   *
   * La fila 1 es el header.
   */

  for (const rowNumber of [
    8,
    11,
    12,
    13,
    14,
  ]) {
    summarySheet.getCell(
      rowNumber,
      2,
    ).numFmt =
      '"$"#,##0.00';
  }

  summarySheet.getRow(1).font = {
    bold: true,
  };

  summarySheet.views = [
    {
      state: "frozen",
      ySplit: 1,
    },
  ];

  /*
   * -------------------------
   * VENTAS
   * -------------------------
   */

  const salesSheet =
    workbook.addWorksheet(
      "Ventas",
    );

  salesSheet.columns = [
    {
      header: "Cuenta ID",
      key: "checkId",
      width: 12,
    },
    {
      header: "Cuenta",
      key: "checkName",
      width: 24,
    },
    {
      header: "Fecha cierre",
      key: "closedAt",
      width: 22,
    },
    {
      header: "Orden ID",
      key: "orderId",
      width: 12,
    },
    {
      header: "Producto ID",
      key: "productId",
      width: 14,
    },
    {
      header: "Producto",
      key: "productName",
      width: 30,
    },
    {
      header: "SKU",
      key: "sku",
      width: 18,
    },
    {
      header: "Categoría",
      key: "categoryName",
      width: 24,
    },
    {
      header: "Cantidad",
      key: "quantity",
      width: 12,
    },
    {
      header: "Precio unitario",
      key: "unitPrice",
      width: 18,
    },
    {
      header: "Subtotal",
      key: "subtotal",
      width: 18,
    },
  ];

  for (
    const row of
      report.salesRows
  ) {
    salesSheet.addRow({
      checkId: row.checkId,

      checkName:
        row.checkName ?? "",

      closedAt:
        formatDateInTimezone(
          row.closedAt,
          report.metadata.timezone,
        ),

      orderId: row.orderId,

      productId: row.productId,

      productName:
        row.productName,

      sku:
        row.sku ?? "",

      categoryName:
        row.categoryName ?? "",

      quantity:
        row.quantity,

      unitPrice:
        centsToCurrency(
          row.unitPriceInCents,
        ),

      subtotal:
        centsToCurrency(
          row.subtotalInCents,
        ),
    });
  }

  salesSheet.getRow(1).font = {
    bold: true,
  };

  salesSheet.views = [
    {
      state: "frozen",
      ySplit: 1,
    },
  ];

  salesSheet.getColumn(
    "unitPrice",
  ).numFmt =
    '"$"#,##0.00';

  salesSheet.getColumn(
    "subtotal",
  ).numFmt =
    '"$"#,##0.00';

  salesSheet.autoFilter = {
    from: "A1",
    to: "K1",
  };

  /*
   * -------------------------
   * PAGOS
   * -------------------------
   */

  const paymentsSheet =
    workbook.addWorksheet(
      "Pagos",
    );

  paymentsSheet.columns = [
    {
      header: "Cuenta ID",
      key: "checkId",
      width: 12,
    },
    {
      header: "Cuenta",
      key: "checkName",
      width: 24,
    },
    {
      header: "Fecha cierre",
      key: "closedAt",
      width: 22,
    },
    {
      header: "Pago ID",
      key: "paymentId",
      width: 12,
    },
    {
      header: "Fecha pago",
      key: "paidAt",
      width: 22,
    },
    {
      header: "Método",
      key: "paymentMethod",
      width: 18,
    },
    {
      header: "Monto",
      key: "amount",
      width: 18,
    },
  ];

  for (
    const row of
      report.paymentRows
  ) {
    paymentsSheet.addRow({
      checkId: row.checkId,

      checkName:
        row.checkName ?? "",

      closedAt:
        formatDateInTimezone(
          row.closedAt,
          report.metadata.timezone,
        ),

      paymentId:
        row.paymentId,

      paidAt:
        formatDateInTimezone(
          row.paidAt,
          report.metadata.timezone,
        ),

      paymentMethod:
        formatPaymentMethod(
          row.paymentMethod,
        ),

      amount:
        centsToCurrency(
          row.amountInCents,
        ),
    });
  }

  paymentsSheet.getRow(1).font = {
    bold: true,
  };

  paymentsSheet.views = [
    {
      state: "frozen",
      ySplit: 1,
    },
  ];

  paymentsSheet.getColumn(
    "amount",
  ).numFmt =
    '"$"#,##0.00';

  paymentsSheet.autoFilter = {
    from: "A1",
    to: "G1",
  };

  /*
   * -------------------------
   * SERIALIZACIÓN
   * -------------------------
   */

  const arrayBuffer =
    await workbook.xlsx.writeBuffer();

  return Buffer.from(
    arrayBuffer,
  );
}