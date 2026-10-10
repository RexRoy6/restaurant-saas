
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import {
  companies,
  companyBusinessHours,
  companyPublicInfo,
} from "@/db/schema";

import type { BusinessHourInput } from "./validation";

export type CompanyPublicInfoSettings = {
  googleMapsUrl: string | null;
  isTemporarilyClosed: boolean;
  temporaryClosureReason: string | null;
  hasConfiguredHours: boolean;
  businessHours: BusinessHourInput[];
};

function getDefaultBusinessHours(): BusinessHourInput[] {
  return Array.from({ length: 7 }, (_, dayOfWeek) => ({
    dayOfWeek,
    isClosed: true,
    opensAt: null,
    closesAt: null,
  }));
}

/**
 * Operación interna de lectura.
 *
 * El companyId debe provenir de un contexto autorizado
 * o de una prueba de integración controlada.
 *
 * No exponer esta función directamente como endpoint.
 */
export async function readCompanyPublicInfo(
  companyId: number,
): Promise<CompanyPublicInfoSettings> {
  if (!Number.isSafeInteger(companyId) || companyId <= 0) {
    throw new Error("Invalid companyId");
  }

  const [company] = await db
    .select({ id: companies.id })
    .from(companies)
    .where(
      and(
        eq(companies.id, companyId),
        isNull(companies.deletedAt),
      ),
    )
    .limit(1);

  if (!company) {
    throw new Error("Forbidden");
  }

  const [publicInfo] = await db
    .select({
      googleMapsUrl: companyPublicInfo.googleMapsUrl,
      isTemporarilyClosed:
        companyPublicInfo.isTemporarilyClosed,
      temporaryClosureReason:
        companyPublicInfo.temporaryClosureReason,
    })
    .from(companyPublicInfo)
    .where(
      and(
        eq(companyPublicInfo.companyId, companyId),
        isNull(companyPublicInfo.deletedAt),
      ),
    )
    .limit(1);

  const savedHours = await db
    .select({
      dayOfWeek: companyBusinessHours.dayOfWeek,
      isClosed: companyBusinessHours.isClosed,
      opensAt: companyBusinessHours.opensAt,
      closesAt: companyBusinessHours.closesAt,
    })
    .from(companyBusinessHours)
    .where(
      and(
        eq(companyBusinessHours.companyId, companyId),
        isNull(companyBusinessHours.deletedAt),
      ),
    );

  const businessHours = getDefaultBusinessHours();

  for (const hour of savedHours) {
    if (
      !Number.isInteger(hour.dayOfWeek) ||
      hour.dayOfWeek < 0 ||
      hour.dayOfWeek > 6
    ) {
      continue;
    }

    businessHours[hour.dayOfWeek] = {
      dayOfWeek: hour.dayOfWeek,
      isClosed: hour.isClosed,
      opensAt: hour.opensAt,
      closesAt: hour.closesAt,
    };
  }

  return {
    googleMapsUrl: publicInfo?.googleMapsUrl ?? null,

    isTemporarilyClosed:
      publicInfo?.isTemporarilyClosed ?? false,

    temporaryClosureReason:
      publicInfo?.temporaryClosureReason ?? null,

    hasConfiguredHours: savedHours.length === 7,

    businessHours,
  };
}
