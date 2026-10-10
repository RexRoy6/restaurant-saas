
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import {
  companies,
  companyBusinessHours,
  companyPublicInfo,
} from "@/db/schema";

import type { BusinessHourInput } from "./validation";
import type { CompanyPublicInfoInput } from "./validation";

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


/**
 * Escritura interna para una Company concreta.
 *
 * IMPORTANTE:
 * - El companyId debe provenir de una sesión autorizada
 *   o de una prueba controlada.
 * - Los datos deben estar previamente validados.
 * - No exponer directamente en una ruta HTTP.
 */
export async function writeCompanyPublicInfo(
  companyId: number,
  input: CompanyPublicInfoInput,
): Promise<CompanyPublicInfoInput> {
  if (!Number.isSafeInteger(companyId) || companyId <= 0) {
    throw new Error("Invalid companyId");
  }

  return db.transaction(async (tx) => {
    // Serializa escrituras concurrentes de esta Company.
    const [company] = await tx
      .select({ id: companies.id })
      .from(companies)
      .where(
        and(
          eq(companies.id, companyId),
          isNull(companies.deletedAt),
        ),
      )
      .limit(1)
      .for("update");

    if (!company) {
      throw new Error("Forbidden");
    }

    // Incluye registros con soft-delete para restaurarlos.
    const [existingPublicInfo] = await tx
      .select({ id: companyPublicInfo.id })
      .from(companyPublicInfo)
      .where(eq(companyPublicInfo.companyId, companyId))
      .limit(1);

    const publicInfoValues = {
      googleMapsUrl: input.googleMapsUrl,
      isTemporarilyClosed: input.isTemporarilyClosed,
      temporaryClosureReason: input.temporaryClosureReason,
      deletedAt: null,
    };

    if (existingPublicInfo) {
      await tx
        .update(companyPublicInfo)
        .set(publicInfoValues)
        .where(
          and(
            eq(companyPublicInfo.id, existingPublicInfo.id),
            eq(companyPublicInfo.companyId, companyId),
          ),
        );
    } else {
      await tx.insert(companyPublicInfo).values({
        companyId,
        ...publicInfoValues,
      });
    }

    // Busca los siete días, incluidos los soft-deleted.
    const existingHours = await tx
      .select({
        id: companyBusinessHours.id,
        dayOfWeek: companyBusinessHours.dayOfWeek,
      })
      .from(companyBusinessHours)
      .where(eq(companyBusinessHours.companyId, companyId));

    const hoursByDay = new Map(
      existingHours.map((hour) => [hour.dayOfWeek, hour.id]),
    );

    for (const hour of input.businessHours) {
      const hourValues = {
        isClosed: hour.isClosed,
        opensAt: hour.opensAt,
        closesAt: hour.closesAt,
        deletedAt: null,
      };

      const existingId = hoursByDay.get(hour.dayOfWeek);

      if (existingId !== undefined) {
        await tx
          .update(companyBusinessHours)
          .set(hourValues)
          .where(
            and(
              eq(companyBusinessHours.id, existingId),
              eq(companyBusinessHours.companyId, companyId),
            ),
          );
      } else {
        await tx.insert(companyBusinessHours).values({
          companyId,
          dayOfWeek: hour.dayOfWeek,
          ...hourValues,
        });
      }
    }

    return input;
  });
}
