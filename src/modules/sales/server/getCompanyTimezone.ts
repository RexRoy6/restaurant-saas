import {
  and,
  eq,
  isNull,
} from "drizzle-orm";

import { db } from "@/db";
import {
  companies,
  timezones,
} from "@/db/schema";

export async function getCompanyTimezone(
  companyId: number,
): Promise<string> {
  if (
    !Number.isSafeInteger(companyId) ||
    companyId <= 0
  ) {
    throw new Error("Invalid companyId");
  }

  const [row] = await db
    .select({
      timezone: timezones.name,
    })
    .from(companies)
    .innerJoin(
      timezones,
      eq(
        companies.timezoneId,
        timezones.id,
      ),
    )
    .where(
      and(
        eq(companies.id, companyId),
        isNull(companies.deletedAt),
      ),
    )
    .limit(1);

  if (!row) {
    throw new Error(
      "Company timezone not found",
    );
  }

  return row.timezone;
}