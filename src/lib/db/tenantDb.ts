import {
  and,
  isNull,
  count,
  sum,
  eq
} from "drizzle-orm";

import { db } from "@/db";
import {
  products,
  checks,
  orders,
  orderItems,
  payments,
} from "@/db/schema";
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

  const tenantTables = [
    products,
    checks,
    orders,
    orderItems,
    payments,
  ];

  if (tenantTables.includes(table)) {
    return table.companyId
      ? eq(table.companyId, companyId)
      : (() => {
        throw new Error(
          "Tenant table is missing companyId.",
        );
      })();
  }

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
  /**
   * Product y Check no tienen un parent tenant
   * adicional que validar.
   */
  if (
    table === products ||
    table === checks
  ) {
    return;
  }

  /**
   * Order pertenece a un Check.
   */
  if (table === orders) {
    const [parentCheck] = await db
      .select({
        id: checks.id,
      })
      .from(checks)
      .where(
        and(
          eq(checks.id, values.checkId),
          eq(checks.companyId, companyId),
          isNull(checks.deletedAt),
        ),
      )
      .limit(1);

    if (!parentCheck) {
      throw new Error(
        "Check does not belong to current tenant.",
      );
    }

    return;
  }

  /**
   * OrderItem debe pertenecer a una Order y Product
   * del mismo tenant.
   */
  if (table === orderItems) {
    const [parentOrder] = await db
      .select({
        id: orders.id,
      })
      .from(orders)
      .where(
        and(
          eq(orders.id, values.orderId),
          eq(orders.companyId, companyId),
          isNull(orders.deletedAt),
        ),
      )
      .limit(1);

    if (!parentOrder) {
      throw new Error(
        "Order does not belong to current tenant.",
      );
    }

    const [parentProduct] = await db
      .select({
        id: products.id,
      })
      .from(products)
      .where(
        and(
          eq(products.id, values.productId),
          eq(products.companyId, companyId),
          isNull(products.deletedAt),
        ),
      )
      .limit(1);

    if (!parentProduct) {
      throw new Error(
        "Product does not belong to current tenant.",
      );
    }

    return;
  }

  /**
   * Payment pertenece a un Check.
   */
  if (table === payments) {
    const [parentCheck] = await db
      .select({
        id: checks.id,
      })
      .from(checks)
      .where(
        and(
          eq(checks.id, values.checkId),
          eq(checks.companyId, companyId),
          isNull(checks.deletedAt),
        ),
      )
      .limit(1);

    if (!parentCheck) {
      throw new Error(
        "Check does not belong to current tenant.",
      );
    }

    return;
  }

  /**
   * FAIL CLOSED.
   */
  throw new Error(
    "Tenant insert isolation is not configured for this table.",
  );

}

function sanitizeTenantUpdate(
  table: AnyTable,
  values: any,
  isGlobalAdmin: boolean,
) {
  if (isGlobalAdmin) {
    return values;
  }

  const tenantTables = [
    products,
    checks,
    orders,
    orderItems,
    payments,
  ];

  if (!tenantTables.includes(table)) {
    throw new Error(
      "Tenant update isolation is not configured for this table.",
    );
  }

  if ("companyId" in values) {
    throw new Error(
      "companyId cannot be changed through tenantDb.",
    );
  }

  if (
    table === orders &&
    "checkId" in values
  ) {
    throw new Error(
      "Order checkId cannot be changed.",
    );
  }

  if (
    table === orderItems &&
    (
      "orderId" in values ||
      "productId" in values
    )
  ) {
    throw new Error(
      "OrderItem parent relationships cannot be changed.",
    );
  }

  if (
    table === payments &&
    "checkId" in values
  ) {
    throw new Error(
      "Payment checkId cannot be changed.",
    );
  }

  return values;
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
      const tenantTables = [
        products,
        checks,
        orders,
        orderItems,
        payments,
      ];

      if (tenantTables.includes(table)) {
        return db
          .insert(table)
          .values({
            ...values,
            companyId: currentCompanyId,
          });
      }

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

      const safeValues = sanitizeTenantUpdate(
        table,
        values,
        isGlobalAdmin,
      );

      return db
        .update(table)
        .set(safeValues)
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