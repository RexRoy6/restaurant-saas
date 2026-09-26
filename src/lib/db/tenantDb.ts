import {
  and,
  isNotNull,
  isNull,
  count,
  sum,
  eq,
  SQL,
  AnyColumn
} from "drizzle-orm";

import { db } from "@/db";
import {
  categories,
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

type TenantTable =
  | typeof categories
  | typeof products
  | typeof checks
  | typeof orders
  | typeof orderItems
  | typeof payments;

type TenantValues = Record<string, unknown>;

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
  table: TenantTable,
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
    categories,
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


function requireNumericId(
  values: TenantValues,
  key: string,
): number {
  const value = values[key];

  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value <= 0
  ) {
    throw new Error(
      `${key} must be a positive integer.`,
    );
  }

  return value;
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
  table: TenantTable,
  values: TenantValues,
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
  /**
 * Check no tiene un parent tenant adicional.
 */
  if (table === checks) {
    return;
  }

  /**
   * Product pertenece a una Category
   * del mismo tenant.
   */
  if (table === products) {
    const categoryId = requireNumericId(
      values,
      "categoryId",
    );

    const [parentCategory] = await db
      .select({
        id: categories.id,
      })
      .from(categories)
      .where(
        and(
          eq(categories.id, categoryId),
          eq(categories.companyId, companyId),
          isNull(categories.deletedAt),
        ),
      )
      .limit(1);

    if (!parentCategory) {
      throw new Error(
        "Category does not belong to current tenant.",
      );
    }

    return;
  }

  /**
   * Order pertenece a un Check.
   */
  if (table === orders) {

    const checkId = requireNumericId(
      values,
      "checkId",
    );

    const [parentCheck] = await db
      .select({
        id: checks.id,
      })
      .from(checks)
      .where(
        and(
          eq(checks.id, checkId),
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



  if (table === orderItems) {

    /**
 * OrderItem debe pertenecer a una Order y Product
 * del mismo tenant.
 */
    const orderId = requireNumericId(
      values,
      "orderId",
    );

    const productId = requireNumericId(
      values,
      "productId",
    );

    const [parentOrder] = await db
      .select({
        id: orders.id,
      })
      .from(orders)
      .where(
        and(
          eq(orders.id, orderId),
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
          eq(products.id, productId),
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

    const checkId = requireNumericId(
      values,
      "checkId",
    );

    const [parentCheck] = await db
      .select({
        id: checks.id,
      })
      .from(checks)
      .where(
        and(
          eq(checks.id, checkId),
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
  table: TenantTable,
  values: TenantValues,
  isGlobalAdmin: boolean,
) {
  if (isGlobalAdmin) {
    return values;
  }

  const tenantTables = [
    categories, ,
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
    table === products &&
    "categoryId" in values
  ) {
    throw new Error(
      "Product categoryId cannot be changed through tenantDb update.",
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
    table: TenantTable,
    extraWhere?: SQL,
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
      table: TenantTable,
      extraWhere?: SQL,
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
      table: TenantTable,
      column: AnyColumn,
      extraWhere?: SQL,
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
      table: TenantTable,
      extraWhere?: SQL,
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
      table: TenantTable,
      extraWhere?: SQL,
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
      table: TenantTable,
      extraWhere?: SQL,
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
      table: TenantTable,
      extraWhere?: SQL,
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
      table: TenantTable,
      extraWhere?: SQL,
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


    // const checkId = requireNumericId(
    //     values,
    //     "checkId",
    //   );

    //   const [parentCheck] = await db
    //     .select({
    //       id: checks.id,
    //     })
    //     .from(checks)
    //     .where(
    //       and(
    //         eq(checks.id, checkId),



    async insert(
      table: TenantTable,
      values: TenantValues,
    ) {
      await assertParentBelongsToTenant(
        table,
        values,
        currentCompanyId,
        isGlobalAdmin,
      );

      const insertValues = isGlobalAdmin
        ? values
        : {
          ...values,
          companyId: currentCompanyId,
        };

      if (table === categories) {
        return db
          .insert(categories)
          .values(
            insertValues as typeof categories.$inferInsert,
          );
      }


      if (table === products) {
        return db
          .insert(products)
          .values(
            insertValues as typeof products.$inferInsert,
          );
      }

      if (table === checks) {
        return db
          .insert(checks)
          .values(
            insertValues as typeof checks.$inferInsert,
          );
      }

      if (table === orders) {
        return db
          .insert(orders)
          .values(
            insertValues as typeof orders.$inferInsert,
          );
      }

      if (table === orderItems) {
        return db
          .insert(orderItems)
          .values(
            insertValues as typeof orderItems.$inferInsert,
          );
      }

      if (table === payments) {
        return db
          .insert(payments)
          .values(
            insertValues as typeof payments.$inferInsert,
          );
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
      table: TenantTable,
      values: TenantValues,
      extraWhere?: SQL,
    ) {
      if (!extraWhere) {
        throw new Error(
          "Update requires an explicit where condition.",
        );
      }
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
      table: TenantTable,
      extraWhere?: SQL,
    ) {
      if (!extraWhere) {
        throw new Error(
          "Delete requires an explicit where condition.",
        );
      }

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
 * RESTORE / REACTIVATE
 * ========================================================
 *
 * Reactiva un registro previamente soft-deleted.
 *
 * Mantiene tenant isolation y requiere siempre
 * una condición explícita.
 */
    restore(
      table: TenantTable,
      extraWhere?: SQL,
    ) {
      if (!extraWhere) {
        throw new Error(
          "Restore requires an explicit where condition.",
        );
      }

      if (!table.deletedAt) {
        throw new Error(
          "Restore not supported on this table",
        );
      }

      const baseWhere = isNotNull(table.deletedAt);

      const where = buildWhere(
        table,
        and(
          baseWhere,
          extraWhere,
        ),
      );

      return db
        .update(table)
        .set({
          deletedAt: null,
        })
        .where(where);
    },


    /**
     * ========================================================
     * FORCE DELETE
     * ========================================================
     */
    forceDelete(
      table: TenantTable,
      extraWhere?: SQL,
    ) {
      if (!isGlobalAdmin) {
        throw new Error(
          "Force delete requires global admin",
        );
      }

      if (!extraWhere) {
        throw new Error(
          "Force delete requires an explicit where condition.",
        );
      }
      return db
        .delete(table)
        .where(extraWhere);
    },
  };
}