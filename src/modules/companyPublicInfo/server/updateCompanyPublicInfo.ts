
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import {
  companies,
  companyBusinessHours,
  companyPublicInfo,
} from "@/db/schema";

import { requireAuth } from "@/lib/auth/requireAuth";

import {
  validateCompanyPublicInfo,
  type CompanyPublicInfoInput,
} from "./validation";

export async function updateCompanyPublicInfo(
  input: unknown,
): Promise<CompanyPublicInfoInput> {
  // 1. Validar autenticación y rol.
  const auth = await requireAuth({
    roles: ["owner"],
  });

  if (auth.companyId === null) {
    throw new Error("Forbidden");
  }

  const companyId = auth.companyId;

  // 2. Validar el JSON recibido.
  const validated = validateCompanyPublicInfo(input);

  // 3. Guardar todo de manera atómica.
  await db.transaction(async (tx) => {
    // Bloqueamos la fila de la Company para serializar
    // guardados simultáneos de esta misma Company.
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

    // 4. Buscar la fila existente, incluso si tiene
    // deletedAt, para respetar UNIQUE(companyId).
    const [existingInfo] = await tx
      .select({ id: companyPublicInfo.id })
      .from(companyPublicInfo)
      .where(eq(companyPublicInfo.companyId, companyId))
      .limit(1);

    const infoValues = {
      googleMapsUrl: validated.googleMapsUrl,
      isTemporarilyClosed:
        validated.isTemporarilyClosed,
      temporaryClosureReason:
        validated.temporaryClosureReason,
      deletedAt: null,
    };

    if (existingInfo) {
      // Actualizar o restaurar la fila existente.
      await tx
        .update(companyPublicInfo)
        .set(infoValues)
        .where(
          and(
            eq(companyPublicInfo.id, existingInfo.id),
            eq(companyPublicInfo.companyId, companyId),
          ),
        );
    } else {
      // Crear la primera configuración de esta Company.
      await tx.insert(companyPublicInfo).values({
        companyId,
        ...infoValues,
      });
    }

    // 5. Consultar los horarios existentes, incluidos
    // los eliminados lógicamente.
    const existingHours = await tx
      .select({
        id: companyBusinessHours.id,
        dayOfWeek: companyBusinessHours.dayOfWeek,
      })
      .from(companyBusinessHours)
      .where(
        eq(companyBusinessHours.companyId, companyId),
      );

    const hoursByDay = new Map(
      existingHours.map((hour) => [
        hour.dayOfWeek,
        hour.id,
      ]),
    );

    // 6. Guardar los siete días.
    for (const hour of validated.businessHours) {
      const existingId = hoursByDay.get(hour.dayOfWeek);

      const hourValues = {
        isClosed: hour.isClosed,
        opensAt: hour.opensAt,
        closesAt: hour.closesAt,
        deletedAt: null,
      };

      if (existingId !== undefined) {
        // Actualizar o restaurar un día existente.
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
        // Crear el día si aún no existe.
        await tx
          .insert(companyBusinessHours)
          .values({
            companyId,
            dayOfWeek: hour.dayOfWeek,
            ...hourValues,
          });
      }
    }
  });

  // 7. Devolver exclusivamente los datos validados.
  return validated;
}
