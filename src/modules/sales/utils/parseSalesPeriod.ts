import {
  SALES_PERIODS,
  type SalesPeriod,
} from "../types/sales";

export function parseSalesPeriod(
  value: string | null,
): SalesPeriod {
  if (value === null || value === "") {
    return "today";
  }

  if (
    SALES_PERIODS.includes(
      value as SalesPeriod,
    )
  ) {
    return value as SalesPeriod;
  }

  throw new Error(
    `Invalid sales period: ${value}`,
  );
}