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

export type CompanySalesContext = {
  companyName: string;
  timezone: string;
};

export async function getCompanySalesContext(
  companyId: number,
): Promise<CompanySalesContext> {
  if (
    !Number.isSafeInteger(companyId) ||
    companyId <= 0
  ) {
    throw new Error(
      "Invalid companyId",
    );
  }

  const [row] = await db
    .select({
      companyName: companies.name,
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
        eq(
          companies.id,
          companyId,
        ),
        isNull(
          companies.deletedAt,
        ),
      ),
    )
    .limit(1);

  if (!row) {
    throw new Error(
      "Company sales context not found",
    );
  }

  return row;
}