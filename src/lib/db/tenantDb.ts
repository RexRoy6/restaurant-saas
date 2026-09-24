import {
  and,
  eq,
  isNull,
  count,
  sum,
  exists,
} from "drizzle-orm"

import { db } from "@/db"
import { requireAuth } from "@/lib/auth/requireAuth"

import {
  clients,
  services,
  events,
  contracts,
  contractItems,
  payments,
  refunds,
  contractHistory,
  paymentItems,
} from "@/db/schema"


/**
 * ============================================================
 * TENANT DB
 * ============================================================
 *
 * 1. Tablas con companyId:
 *
 *    clients
 *    services
 *    events
 *    contracts
 *
 *    Se filtran directamente:
 *
 *    table.companyId = currentCompanyId
 *
 *
 * 2. Tablas sin companyId:
 *
 *    contractItems
 *    payments
 *    refunds
 *    contractHistory
 *    paymentItems
 *
 *    Se filtran mediante sus relaciones:
 *
 *    payments
 *      -> contracts
 *      -> contracts.companyId
 *
 *    contractItems
 *      -> contracts
 *      -> contracts.companyId
 *
 *    refunds
 *      -> payments
 *      -> contracts
 *      -> contracts.companyId
 *
 *    contractHistory
 *      -> contracts
 *      -> contracts.companyId
 *
 *    paymentItems
 *      -> payments
 *      -> contracts
 *      -> contracts.companyId
 *
 *
 * IMPORTANTE:
 *
 * Si una tabla no está configurada aquí, la operación FALLA.
 *
 * Esto es intencional.
 *
 * Es mucho más seguro fallar que accidentalmente devolver
 * información de otro tenant.
 *
 * ============================================================
 */


/**
 * Tipo genérico de tabla Drizzle.
 *
 * Mantenemos `any` aquí porque este helper trabaja con diferentes
 * tablas dinámicamente.
 */
type AnyTable = any


/**
 * ============================================================
 * TENANT FILTER
 * ============================================================
 *
 * Devuelve la condición SQL necesaria para garantizar que una
 * tabla pertenece al tenant actual.
 *
 * Para tablas directas:
 *
 *     table.companyId = companyId
 *
 * Para tablas indirectas:
 *
 *     EXISTS (...)
 *
 * Si la tabla no está registrada:
 *
 *     throw Error
 *
 * Nunca dejamos una tabla "sin filtro" accidentalmente.
 */
function buildTenantWhere(
  table: AnyTable,
  companyId: number,
  isGlobalAdmin: boolean,
) {

  /**
   * ----------------------------------------------------------
   * GLOBAL ADMIN
   * ----------------------------------------------------------
   *
   * El admin global puede acceder a todos los tenants.
   */
  if (isGlobalAdmin) {
    return undefined
  }


  /**
   * ----------------------------------------------------------
   * DIRECT TENANT TABLES
   * ----------------------------------------------------------
   *
   * Estas tablas tienen companyId directamente.
   */
  if (table === clients) {
    return eq(clients.companyId, companyId)
  }

  if (table === services) {
    return eq(services.companyId, companyId)
  }

  if (table === events) {
    return eq(events.companyId, companyId)
  }

  if (table === contracts) {
    return eq(contracts.companyId, companyId)
  }


  /**
   * ----------------------------------------------------------
   * CONTRACT ITEMS
   * ----------------------------------------------------------
   *
   * contractItems
   *      ↓
   * contracts
   *      ↓
   * companyId
   *
   * Verificamos que el contractId pertenezca al tenant actual.
   */
  if (table === contractItems) {
    return exists(
      db
        .select({
          id: contracts.id,
        })
        .from(contracts)
        .where(
          and(
            eq(contracts.id, contractItems.contractId),
            eq(contracts.companyId, companyId),
            isNull(contracts.deletedAt),
          ),
        ),
    )
  }


  /**
   * ----------------------------------------------------------
   * PAYMENTS
   * ----------------------------------------------------------
   *
   * payments
   *      ↓
   * contracts
   *      ↓
   * companyId
   *
   * Esto corrige el bug principal que encontramos.
   */
  if (table === payments) {
    return exists(
      db
        .select({
          id: contracts.id,
        })
        .from(contracts)
        .where(
          and(
            eq(contracts.id, payments.contractId),
            eq(contracts.companyId, companyId),
            isNull(contracts.deletedAt),
          ),
        ),
    )
  }


  /**
   * ----------------------------------------------------------
   * REFUNDS
   * ----------------------------------------------------------
   *
   * refunds
   *      ↓
   * payments
   *      ↓
   * contracts
   *      ↓
   * companyId
   */
  if (table === refunds) {
    return exists(
      db
        .select({
          id: contracts.id,
        })
        .from(payments)
        .innerJoin(
          contracts,
          eq(payments.contractId, contracts.id),
        )
        .where(
          and(
            eq(payments.id, refunds.paymentId),
            eq(contracts.companyId, companyId),
            isNull(payments.deletedAt),
            isNull(contracts.deletedAt),
          ),
        ),
    )
  }


  /**
   * ----------------------------------------------------------
   * CONTRACT HISTORY
   * ----------------------------------------------------------
   *
   * contractHistory
   *      ↓
   * contracts
   *      ↓
   * companyId
   */
  if (table === contractHistory) {
    return exists(
      db
        .select({
          id: contracts.id,
        })
        .from(contracts)
        .where(
          and(
            eq(contracts.id, contractHistory.contractId),
            eq(contracts.companyId, companyId),
            isNull(contracts.deletedAt),
          ),
        ),
    )
  }


  /**
   * ----------------------------------------------------------
   * PAYMENT ITEMS
   * ----------------------------------------------------------
   *
   * paymentItems
   *      ↓
   * payments
   *      ↓
   * contracts
   *      ↓
   * companyId
   *
   * Validamos el payment.
   */
  if (table === paymentItems) {
    return exists(
      db
        .select({
          id: contracts.id,
        })
        .from(payments)
        .innerJoin(
          contracts,
          eq(payments.contractId, contracts.id),
        )
        .where(
          and(
            eq(payments.id, paymentItems.paymentId),
            eq(contracts.companyId, companyId),
            isNull(payments.deletedAt),
            isNull(contracts.deletedAt),
          ),
        ),
    )
  }


  /**
   * ----------------------------------------------------------
   * UNKNOWN TABLE
   * ----------------------------------------------------------
   *
   * MUY IMPORTANTE:
   *
   * Nunca devolver undefined aquí.
   *
   * Si hacemos eso, accidentalmente podríamos ejecutar:
   *
   * SELECT * FROM some_table
   *
   * y exponer información de otro tenant.
   */
  throw new Error(
    "Tenant isolation is not configured for this table.",
  )
}


/**
 * ============================================================
 * PARENT OWNERSHIP VALIDATION
 * ============================================================
 *
 * Se utiliza principalmente para INSERT.
 *
 * Ejemplo:
 *
 * Un usuario de Company A intenta crear:
 *
 * payment {
 *   contractId: contratoDeCompanyB
 * }
 *
 * Esta función debe impedirlo.
 */
async function assertParentBelongsToTenant(
  table: AnyTable,
  values: any,
  companyId: number,
  isGlobalAdmin: boolean,
) {

  /**
   * Global admin puede trabajar con cualquier tenant.
   */
  if (isGlobalAdmin) {
    return
  }


  /**
   * ----------------------------------------------------------
   * DIRECT TENANT TABLES
   * ----------------------------------------------------------
   *
   * El insert() agregará automáticamente companyId.
   *
   * No necesitamos validar un parent.
   */
  if (
    table === clients ||
    table === services ||
    table === events ||
    table === contracts
  ) {
    return
  }


  /**
   * ----------------------------------------------------------
   * CONTRACT ITEMS
   * ----------------------------------------------------------
   */
  if (table === contractItems) {

    if (!values.contractId) {
      throw new Error(
        "contractId is required for contractItems",
      )
    }

    const contract = await db
      .select({
        id: contracts.id,
      })
      .from(contracts)
      .where(
        and(
          eq(contracts.id, values.contractId),
          eq(contracts.companyId, companyId),
          isNull(contracts.deletedAt),
        ),
      )
      .limit(1)

    if (!contract.length) {
      throw new Error(
        "Tenant violation: contract does not belong to current company.",
      )
    }

    return
  }


  /**
   * ----------------------------------------------------------
   * PAYMENTS
   * ----------------------------------------------------------
   */
  if (table === payments) {

    if (!values.contractId) {
      throw new Error(
        "contractId is required for payments",
      )
    }

    const contract = await db
      .select({
        id: contracts.id,
      })
      .from(contracts)
      .where(
        and(
          eq(contracts.id, values.contractId),
          eq(contracts.companyId, companyId),
          isNull(contracts.deletedAt),
        ),
      )
      .limit(1)

    if (!contract.length) {
      throw new Error(
        "Tenant violation: contract does not belong to current company.",
      )
    }

    return
  }


  /**
   * ----------------------------------------------------------
   * REFUNDS
   * ----------------------------------------------------------
   */
  if (table === refunds) {

    if (!values.paymentId) {
      throw new Error(
        "paymentId is required for refunds",
      )
    }

    const payment = await db
      .select({
        id: payments.id,
      })
      .from(payments)
      .innerJoin(
        contracts,
        eq(payments.contractId, contracts.id),
      )
      .where(
        and(
          eq(payments.id, values.paymentId),
          eq(contracts.companyId, companyId),
          isNull(payments.deletedAt),
          isNull(contracts.deletedAt),
        ),
      )
      .limit(1)

    if (!payment.length) {
      throw new Error(
        "Tenant violation: payment does not belong to current company.",
      )
    }

    return
  }


  /**
   * ----------------------------------------------------------
   * CONTRACT HISTORY
   * ----------------------------------------------------------
   */
  if (table === contractHistory) {

    if (!values.contractId) {
      throw new Error(
        "contractId is required for contractHistory",
      )
    }

    const contract = await db
      .select({
        id: contracts.id,
      })
      .from(contracts)
      .where(
        and(
          eq(contracts.id, values.contractId),
          eq(contracts.companyId, companyId),
          isNull(contracts.deletedAt),
        ),
      )
      .limit(1)

    if (!contract.length) {
      throw new Error(
        "Tenant violation: contract does not belong to current company.",
      )
    }

    return
  }


  /**
   * ----------------------------------------------------------
   * PAYMENT ITEMS
   * ----------------------------------------------------------
   *
   * Aquí validamos:
   *
   * payment → contract → company
   *
   * y también:
   *
   * contractItem → contract → company
   *
   * para evitar mezclar registros entre tenants.
   */
  if (table === paymentItems) {

    if (!values.paymentId) {
      throw new Error(
        "paymentId is required for paymentItems",
      )
    }

    if (!values.contractItemId) {
      throw new Error(
        "contractItemId is required for paymentItems",
      )
    }


    /**
     * Validar payment.
     */
    const payment = await db
      .select({
        id: payments.id,
      })
      .from(payments)
      .innerJoin(
        contracts,
        eq(payments.contractId, contracts.id),
      )
      .where(
        and(
          eq(payments.id, values.paymentId),
          eq(contracts.companyId, companyId),
          isNull(payments.deletedAt),
          isNull(contracts.deletedAt),
        ),
      )
      .limit(1)

    if (!payment.length) {
      throw new Error(
        "Tenant violation: payment does not belong to current company.",
      )
    }


    /**
     * Validar contractItem.
     */
    const contractItem = await db
      .select({
        id: contractItems.id,
      })
      .from(contractItems)
      .innerJoin(
        contracts,
        eq(contractItems.contractId, contracts.id),
      )
      .where(
        and(
          eq(
            contractItems.id,
            values.contractItemId,
          ),
          eq(contracts.companyId, companyId),
          isNull(contractItems.deletedAt),
          isNull(contracts.deletedAt),
        ),
      )
      .limit(1)

    if (!contractItem.length) {
      throw new Error(
        "Tenant violation: contractItem does not belong to current company.",
      )
    }

    return
  }


  /**
   * Tabla no configurada.
   */
  throw new Error(
    "Tenant insert isolation is not configured for this table.",
  )
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
  } = await requireAuth()


  /**
   * Admin global:
   *
   * role = admin
   * companyId = null
   */
  const isGlobalAdmin =
    role === "admin" &&
    companyId === null


  /**
   * Todos los usuarios normales necesitan tenant.
   */
  if (!isGlobalAdmin && !companyId) {
    throw new Error("Tenant required")
  }


  /**
   * Para TypeScript.
   */
  const currentCompanyId = Number(companyId)


  /**
   * ----------------------------------------------------------
   * BUILD WHERE
   * ----------------------------------------------------------
   */
  function buildWhere(
    table: AnyTable,
    extraWhere?: any,
  ) {

    /**
     * Global admin:
     *
     * solamente usa extraWhere.
     */
    if (isGlobalAdmin) {
      return extraWhere ?? undefined
    }


    /**
     * Tenant normal.
     */
    const tenantWhere = buildTenantWhere(
      table,
      currentCompanyId,
      isGlobalAdmin,
    )


    if (!tenantWhere) {
      throw new Error(
        "Tenant isolation could not be established.",
      )
    }


    return extraWhere
      ? and(tenantWhere, extraWhere)
      : tenantWhere
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

      const baseWhere = isNull(table.deletedAt)

      const where = buildWhere(
        table,
        extraWhere
          ? and(baseWhere, extraWhere)
          : baseWhere,
      )

      const [result] = await db
        .select({
          count: count(),
        })
        .from(table)
        .where(where)

      return Number(result?.count ?? 0)
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

      const baseWhere = isNull(table.deletedAt)

      const where = buildWhere(
        table,
        extraWhere
          ? and(baseWhere, extraWhere)
          : baseWhere,
      )

      const [result] = await db
        .select({
          total: sum(column),
        })
        .from(table)
        .where(where)

      return Number(result?.total ?? 0)
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

      const baseWhere = isNull(table.deletedAt)

      const where = buildWhere(
        table,
        extraWhere
          ? and(baseWhere, extraWhere)
          : baseWhere,
      )

      const [result] = await db
        .select({
          exists: count(),
        })
        .from(table)
        .where(where)
        .limit(1)

      return Number(result?.exists ?? 0) > 0
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

      const baseWhere = isNull(table.deletedAt)

      const where = buildWhere(
        table,
        extraWhere
          ? and(baseWhere, extraWhere)
          : baseWhere,
      )

      return db
        .select()
        .from(table)
        .where(where)
    },


    /**
     * ========================================================
     * FIND MANY RAW
     * ========================================================
     *
     * Incluye soft deleted.
     *
     * PERO sigue respetando tenant isolation.
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
        )
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

      const baseWhere = isNull(table.deletedAt)

      const where = buildWhere(
        table,
        extraWhere
          ? and(baseWhere, extraWhere)
          : baseWhere,
      )

      return db
        .select()
        .from(table)
        .where(where)
        .limit(1)
        .then(
          (rows) => rows[0] ?? null,
        )
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
        )
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

      /**
       * Primero validamos ownership para tablas indirectas.
       */
      await assertParentBelongsToTenant(
        table,
        values,
        currentCompanyId,
        isGlobalAdmin,
      )


      /**
       * Global admin:
       *
       * no agregamos companyId.
       */
      if (isGlobalAdmin) {
        return db
          .insert(table)
          .values(values)
      }


      /**
       * Tablas directas:
       *
       * agregar companyId automáticamente.
       */
      if (
        table === clients ||
        table === services ||
        table === events ||
        table === contracts
      ) {

        return db
          .insert(table)
          .values({
            ...values,
            companyId: currentCompanyId,
          })
      }


      /**
       * Tablas indirectas:
       *
       * NO agregamos companyId porque no existe.
       */
      if (
        table === contractItems ||
        table === payments ||
        table === refunds ||
        table === contractHistory ||
        table === paymentItems
      ) {

        return db
          .insert(table)
          .values(values)
      }


      throw new Error(
        "Tenant insert isolation is not configured for this table.",
      )
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

      const baseWhere = isNull(table.deletedAt)

      const where = buildWhere(
        table,
        extraWhere
          ? and(baseWhere, extraWhere)
          : baseWhere,
      )

      return db
        .update(table)
        .set(values)
        .where(where)
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
        )
      }

      const baseWhere = isNull(table.deletedAt)

      const where = buildWhere(
        table,
        extraWhere
          ? and(baseWhere, extraWhere)
          : baseWhere,
      )

      return db
        .update(table)
        .set({
          deletedAt: new Date(),
        })
        .where(where)
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
        )
      }

      return db
        .delete(table)
        .where(extraWhere)
    },
  }
}
