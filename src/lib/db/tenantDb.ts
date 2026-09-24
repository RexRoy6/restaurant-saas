import {
  and,
  isNull,
  count,
  sum,
} from "drizzle-orm";

import { db } from "@/db";
import { requireAuth } from "@/lib/auth/requireAuth";

/**
 * ============================================================
 * TENANT DB
 * ============================================================
 *
 * Helper central para operaciones aisladas por tenant.
 *
 * IMPORTANTE:
 *
 * Actualmente no hay tablas de dominio registradas porque el
 * dominio CRM anterior fue eliminado.
 *
 * Las nuevas tablas del restaurante (products, checks, orders,
 * orderItems, payments, etc.) se registrarán aquí cuando sean
 * creadas en el nuevo schema.
 *
 * La estrategia es FAIL CLOSED:
 *
 * Si una tabla no está configurada explícitamente para aislamiento
 * multi-tenant, la operación falla.
 *
 * Nunca permitimos acceso accidental a una tabla sin conocer
 * cómo debe aislarse por Company.
 * ============================================================
 */

type AnyTable = any;

/**
 * ============================================================
 * TENANT FILTER
 * ============================================================
 *
 * Construye la condición que garantiza que una operación
 * pertenece al tenant actual.
 *
 * Por ahora no existen tablas de dominio registradas.
 *
 * Cuando agreguemos las nuevas entidades del restaurante,
 * cada una deberá configurarse explícitamente aquí.
 */
function buildTenantWhere(
  table: AnyTable,
  companyId: number,
  isGlobalAdmin: boolean,
) {
  /**
   * El admin global puede acceder sin filtro de tenant.
   */
  if (isGlobalAdmin) {
    return undefined;
  }

  /**
   * Evita warnings por parámetros que todavía no tienen
   * consumidores hasta registrar el nuevo dominio.
   */
  void table;
  void companyId;

  /**
   * FAIL CLOSED.
   *
   * Ninguna tabla nueva obtiene acceso automáticamente.
   */
  throw new Error(
    "Tenant isolation is not configured for this table.",
  );
}

/**
 * ============================================================
 * PARENT OWNERSHIP VALIDATION
 * ============================================================
 *
 * Valida relaciones parent -> child antes de INSERT.
 *
 * Actualmente no existen tablas de dominio registradas.
 *
 * Cuando agreguemos relaciones como:
 *
 * order -> check
 * orderItem -> order
 * payment -> check
 *
 * sus validaciones deberán configurarse explícitamente aquí.
 */
async function assertParentBelongsToTenant(
  table: AnyTable,
  values: any,
  companyId: number,
  isGlobalAdmin: boolean,
) {
  /**
   * El admin global puede trabajar con cualquier tenant.
   */
  if (isGlobalAdmin) {
    return;
  }

  void table;
  void values;
  void companyId;

  /**
   * FAIL CLOSED.
   */
  throw new Error(
    "Tenant insert isolation is not configured for this table.",
  );
}

/**
 * ============================================================
 * TENANT DB
 * ============================================================
 */
export async function tenantDb() {
  const {
    companyId,
    role,
  } = await requireAuth();

  /**
   * Admin global:
   *
   * role = admin
   * companyId = null
   */
  const isGlobalAdmin =
    role === "admin" &&
    companyId === null;

  /**
   * Todos los usuarios normales necesitan tenant.
   */
  if (!isGlobalAdmin && !companyId) {
    throw new Error("Tenant required");
  }

  const currentCompanyId = Number(companyId);

  /**
   * ==========================================================
   * BUILD WHERE
   * ==========================================================
   */
  function buildWhere(
    table: AnyTable,
    extraWhere?: any,
  ) {
    /**
     * El admin global no necesita tenant filter.
     */
    if (isGlobalAdmin) {
      return extraWhere ?? undefined;
    }

    const tenantWhere = buildTenantWhere(
      table,
      currentCompanyId,
      isGlobalAdmin,
    );

    if (!tenantWhere) {
      throw new Error(
        "Tenant isolation could not be established.",
      );
    }

    return extraWhere
      ? and(tenantWhere, extraWhere)
      : tenantWhere;
  }

  return {
    /**
     * ========================================================
     * COUNT
     * ========================================================
     */
    async count(
      table: AnyTable,
      extraWhere?: any,
    ) {
      const baseWhere = isNull(table.deletedAt);

      const where = buildWhere(
        table,
        extraWhere
          ? and(baseWhere, extraWhere)
          : baseWhere,
      );

      const [result] = await db
        .select({
          count: count(),
        })
        .from(table)
        .where(where);

      return Number(result?.count ?? 0);
    },

    /**
     * ========================================================
     * SUM
     * ========================================================
     */
    async sum(
      table: AnyTable,
      column: AnyTable,
      extraWhere?: any,
    ) {
      const baseWhere = isNull(table.deletedAt);

      const where = buildWhere(
        table,
        extraWhere
          ? and(baseWhere, extraWhere)
          : baseWhere,
      );

      const [result] = await db
        .select({
          total: sum(column),
        })
        .from(table)
        .where(where);

      return Number(result?.total ?? 0);
    },

    /**
     * ========================================================
     * EXISTS
     * ========================================================
     */
    async exists(
      table: AnyTable,
      extraWhere?: any,
    ) {
      const baseWhere = isNull(table.deletedAt);

      const where = buildWhere(
        table,
        extraWhere
          ? and(baseWhere, extraWhere)
          : baseWhere,
      );

      const [result] = await db
        .select({
          exists: count(),
        })
        .from(table)
        .where(where)
        .limit(1);

      return Number(result?.exists ?? 0) > 0;
    },

    /**
     * ========================================================
     * FIND MANY
     * ========================================================
     */
    findMany(
      table: AnyTable,
      extraWhere?: any,
    ) {
      const baseWhere = isNull(table.deletedAt);

      const where = buildWhere(
        table,
        extraWhere
          ? and(baseWhere, extraWhere)
          : baseWhere,
      );

      return db
        .select()
        .from(table)
        .where(where);
    },

    /**
     * ========================================================
     * FIND MANY RAW
     * ========================================================
     *
     * Incluye soft deleted, pero continúa respetando
     * tenant isolation.
     */
    findManyRaw(
      table: AnyTable,
      extraWhere?: any,
    ) {
      return db
        .select()
        .from(table)
        .where(
          buildWhere(
            table,
            extraWhere,
          ),
        );
    },

    /**
     * ========================================================
     * FIND FIRST
     * ========================================================
     */
    findFirst(
      table: AnyTable,
      extraWhere?: any,
    ) {
      const baseWhere = isNull(table.deletedAt);

      const where = buildWhere(
        table,
        extraWhere
          ? and(baseWhere, extraWhere)
          : baseWhere,
      );

      return db
        .select()
        .from(table)
        .where(where)
        .limit(1)
        .then(
          (rows) => rows[0] ?? null,
        );
    },

    /**
     * ========================================================
     * FIND FIRST RAW
     * ========================================================
     */
    findFirstRaw(
      table: AnyTable,
      extraWhere?: any,
    ) {
      return db
        .select()
        .from(table)
        .where(
          buildWhere(
            table,
            extraWhere,
          ),
        )
        .limit(1)
        .then(
          (rows) => rows[0] ?? null,
        );
    },

    /**
     * ========================================================
     * INSERT
     * ========================================================
     */
    async insert(
      table: AnyTable,
      values: any,
    ) {
      await assertParentBelongsToTenant(
        table,
        values,
        currentCompanyId,
        isGlobalAdmin,
      );

      /**
       * Global admin.
       *
       * No asumimos automáticamente que una tabla tenga companyId.
       */
      if (isGlobalAdmin) {
        return db
          .insert(table)
          .values(values);
      }

      /**
       * FAIL CLOSED.
       *
       * Cuando registremos las nuevas tablas decidiremos aquí
       * cuáles reciben companyId automáticamente y cuáles
       * requieren validación mediante su parent.
       */
      throw new Error(
        "Tenant insert isolation is not configured for this table.",
      );
    },

    /**
     * ========================================================
     * UPDATE
     * ========================================================
     */
    update(
      table: AnyTable,
      values: any,
      extraWhere?: any,
    ) {
      const baseWhere = isNull(table.deletedAt);

      const where = buildWhere(
        table,
        extraWhere
          ? and(baseWhere, extraWhere)
          : baseWhere,
      );

      return db
        .update(table)
        .set(values)
        .where(where);
    },

    /**
     * ========================================================
     * DELETE / SOFT DELETE
     * ========================================================
     */
    delete(
      table: AnyTable,
      extraWhere?: any,
    ) {
      if (!table.deletedAt) {
        throw new Error(
          "Soft delete not supported on this table",
        );
      }

      const baseWhere = isNull(table.deletedAt);

      const where = buildWhere(
        table,
        extraWhere
          ? and(baseWhere, extraWhere)
          : baseWhere,
      );

      return db
        .update(table)
        .set({
          deletedAt: new Date(),
        })
        .where(where);
    },

    /**
     * ========================================================
     * FORCE DELETE
     * ========================================================
     */
    forceDelete(
      table: AnyTable,
      extraWhere?: any,
    ) {
      if (!isGlobalAdmin) {
        throw new Error(
          "Force delete requires global admin",
        );
      }

      return db
        .delete(table)
        .where(extraWhere);
    },
  };
}