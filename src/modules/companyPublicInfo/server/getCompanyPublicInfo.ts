
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import {
  companies,
  companyBusinessHours,
  companyPublicInfo,
} from "@/db/schema";

import { requireAuth } from "@/lib/auth/requireAuth";

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

export async function getCompanyPublicInfo():
  Promise<CompanyPublicInfoSettings> {
  // 1. Solo el Owner puede consultar esta configuración.
  const auth = await requireAuth({
    roles: ["owner"],
  });

  if (auth.companyId === null) {
    throw new Error("Forbidden");
  }

  const companyId = auth.companyId;

  // 2. Confirmar que la Company siga activa.
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

  // 3. Consultar la configuración pública activa.
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

  // 4. Consultar los horarios activos de esta Company.
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

  // 5. Preparar los siete días para el formulario.
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

    // Solo consideramos configurados los horarios
    // cuando existen los siete registros activos.
    hasConfiguredHours: savedHours.length === 7,

    businessHours,
  };
}
