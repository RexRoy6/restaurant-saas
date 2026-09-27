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