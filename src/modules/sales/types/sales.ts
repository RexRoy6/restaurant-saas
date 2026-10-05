export const SALES_PERIODS = [
  "today",
  "yesterday",
  "last5days",
  "last7days",
  "last30days",
] as const;

export type SalesPeriod =
  (typeof SALES_PERIODS)[number];

export type SalesPeriodRange = {
  preset: SalesPeriod;
  timezone: string;
  from: Date;
  to: Date;
};

export type SalesProductSummary = {
  productId: number;
  productName: string;
  quantity: number;
  totalInCents: number;
};

export type salesByPaymentMethod = {
  transferInCents: number;
  cardInCents: number;
  cashInCents: number;
};

export type SalesSummary = {
  period: {
    preset: SalesPeriod;
    timezone: string;
    from: string;
    to: string;
  };
  totalSalesInCents: number;
  paidChecks: number;
  productsSold: number;
  salesByPaymentMethod: salesByPaymentMethod;
  products: SalesProductSummary[];
};

//es para e reporte de xlsx
export type SalesReportMetadata = {
  companyName: string;
  preset: SalesPeriod;
  timezone: string;
  from: Date;
  to: Date;
  generatedAt: Date;
};

export type SalesReportSummary = {
  totalSalesInCents: number;
  paidChecks: number;
  productsSold: number;

  salesByPaymentMethod: {
    cashInCents: number;
    cardInCents: number;
    transferInCents: number;
  };

  totalPaymentsInCents: number;
};

export type SalesReportRow = {
  checkId: number;
  checkName: string | null;
  closedAt: Date;

  orderId: number;

  productId: number;
  productName: string;
  sku: string | null;
  categoryName: string | null;

  quantity: number;
  unitPriceInCents: number;
  subtotalInCents: number;
};

export type SalesReportPaymentRow = {
  checkId: number;
  checkName: string | null;
  closedAt: Date;

  paymentId: number;
  paidAt: Date;
  paymentMethod:
  | "CASH"
  | "CARD"
  | "TRANSFER";

  amountInCents: number;
};

export type SalesReport = {
  metadata: SalesReportMetadata;
  summary: SalesReportSummary;
  salesRows: SalesReportRow[];
  paymentRows: SalesReportPaymentRow[];
};