
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { companies, timezones } from "@/db/schema";

export type PublicCompanyContext = {
  id: number;
  name: string;
  slug: string;
  currency: "MXN";
  timezone: string;
};

export async function getPublicCompanyBySlug(
  slug: string,
): Promise<PublicCompanyContext | null> {
  if (
    typeof slug !== "string" ||
    slug.length === 0 ||
    slug.length > 120
  ) {
    return null;
  }

  const [company] = await db
    .select({
      id: companies.id,
      name: companies.name,
      slug: companies.slug,
      currency: companies.currency,
      timezone: timezones.name,
    })
    .from(companies)
    .innerJoin(
      timezones,
      eq(companies.timezoneId, timezones.id),
    )
    .where(
      and(
        eq(companies.slug, slug),
        isNull(companies.deletedAt),
      ),
    )
    .limit(1);

  return company ?? null;
}
