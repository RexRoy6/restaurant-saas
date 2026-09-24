import { db } from "@/db"
import { requireAuth } from "@/lib/auth/requireAuth"
import { tenantDb } from "@/lib/db/tenantDb"
import {
  payments,
  contracts,
  clients,
  events,
  services,
  contractItems,
  paymentItems,
  contractItems as contractItemsTable
} from "@/db/schema"

import { eq, and, isNull, sum, sql, like, or, desc } from "drizzle-orm"
import { activePayments, notDeletedPayments } from "@/db/filters";

import type {
  CreatePaymentInput
} from "@/lib/validations/paymentValidation"


function getPaymentStatus(total: number, paid: number) {

  if (paid === 0) return "unpaid"

  if (paid < total) return "partial"

  return "paid"

}

/* ---------- GET CONTRACT PAYMENTS ---------- */
export async function getContractPayments(
  contractId: number
) {

  const tdb = await tenantDb()

  const contract = await tdb.findFirst(
    contracts,
    eq(contracts.id, contractId)
  )

  if (!contract) {
    throw new Error("contract not found")
  }

  const contractPayments = await db
    .select()
    .from(payments)
    .where(activePayments(contractId))

  const paymentItemsRows = await db
    .select({
      paymentId: paymentItems.paymentId,
      contractItemId: paymentItems.contractItemId,
      amount: paymentItems.amount,

      serviceId: services.id,
      serviceName: services.name,
      serviceDescription: services.description
    })
    .from(paymentItems)
    .innerJoin(
      payments,
      eq(paymentItems.paymentId, payments.id)
    )
    .innerJoin(
      contractItemsTable,
      eq(paymentItems.contractItemId, contractItemsTable.id)
    )
    .innerJoin(
      services,
      eq(contractItemsTable.serviceId, services.id)
    )
    //.where(eq(payments.contractId, contractId))
    .where(activePayments(contractId))

  const itemsByPayment = new Map<number, any[]>()

  for (const row of paymentItemsRows) {

    if (!itemsByPayment.has(row.paymentId)) {
      itemsByPayment.set(row.paymentId, [])
    }

    itemsByPayment.get(row.paymentId)!.push({
      contractItemId: row.contractItemId,
      amount: Number(row.amount),
      service: {
        id: row.serviceId,
        name: row.serviceName,
        description: row.serviceDescription
      }
    })
  }

  const enrichedPayments = contractPayments.map(p => ({
    ...p,
    amount: Number(p.amount),
    paidAt: p.paidAt,
    ticketNumber: p.ticketNumber,
    items: itemsByPayment.get(p.id) || []
  }))


  //

  const paidAmount = contractPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  )

  const contractTotal = Number(contract.totalAmount)

  const remainingAmount = contractTotal - paidAmount

  const paymentStatus = getPaymentStatus(
    contractTotal,
    paidAmount
  )

  return {
    contractId: contract.id,
    contractStatus: contract.status,
    paymentStatus,
    contractTotal,
    paidAmount,
    remainingAmount,
    payments: enrichedPayments//contractPayments
  }

}



/* ---------- CREATE PAYMENT ---------- */
export async function createPayment(
  contractId: number,
  data: CreatePaymentInput
) {

  const tdb = await tenantDb()

  /* ---------- 1. contract exists ---------- */

  const contract = await tdb.findFirst(
    contracts,
    eq(contracts.id, contractId)
  )

  if (!contract) {
    throw new Error("contract not found")
  }

  /* ---------- 2. calcular total ---------- */

  const total = data.items.reduce(
    (sum, item) => sum + item.amount,
    0
  )

  const contractTotal = Number(contract.totalAmount)

  /* ---------- 3. validar contract items (O(n)) ---------- */

  // const contractItems =
  //   await tdb.findMany(
  //     contractItemsTable,
  //     eq(contractItemsTable.contractId, contractId)
  //   )

  const contractItems =
    await tdb.findMany(
      contractItemsTable,
      and(
        eq(contractItemsTable.contractId, contractId),
        isNull(contractItemsTable.deletedAt)
      )
    )

  const contractItemsMap = new Map(
    contractItems.map(ci => [ci.id, ci])
  )
  /* ---------- 4. TRANSACTION 🔥 ---------- */

  let paymentId: number

  const resultSummary = await db.transaction(async (tx) => {

    //revisar cuanto falta por pagar o se ha pagado

    const paidByItemRows = await tx
      .select({
        contractItemId: paymentItems.contractItemId,
        paid: sql<number>`COALESCE(SUM(${paymentItems.amount}),0)`
      })
      .from(paymentItems)

      .innerJoin(
        payments,
        eq(paymentItems.paymentId, payments.id)
      )

      .where(activePayments(contractId))

      .groupBy(paymentItems.contractItemId)


    const paidByItemMap = new Map<number, number>()

    for (const row of paidByItemRows) {
      paidByItemMap.set(
        Number(row.contractItemId),
        Number(row.paid)
      )
    }



    /* 4.1 obtener total pagado (DB SUM) */

    const [row] = await tx
      .select({
        totalPaid: sql<number>`COALESCE(SUM(${payments.amount}),0)`
      })
      .from(payments)
      //.where(eq(payments.contractId, contractId))
      // .where(
      //   and(
      //     eq(payments.contractId, contractId),
      //     isNull(payments.deletedAt)
      //   )
      // )
      .where(activePayments(contractId))

    const paid = Number(row.totalPaid)

    if (paid + total > contractTotal) {
      throw new Error("payment exceeds contract total")
    }


    //
    for (const item of data.items) {

      const contractItem = contractItemsMap.get(item.contractItemId)

      if (!contractItem) {
        throw new Error("invalid contract item")
      }

      const alreadyPaid =
        paidByItemMap.get(item.contractItemId) || 0

      const itemTotal = Number(
        (Number(contractItem.unitPrice) * contractItem.quantity).toFixed(2)
      )

      const remaining = itemTotal - alreadyPaid

      if (item.amount > remaining) {
        throw new Error(
          `payment exceeds item balance (item ${item.contractItemId})`
        )
      }
    }
    //

    if (total <= 0) {
      throw new Error("invalid payment amount")
    }


    /* 4.2 insertar payment */


    const result = await tx.insert(payments).values({
      contractId,
      amount: total.toString(),
      currency: data.currency,
      paymentMethod: data.paymentMethod,

      paidAt: data.paidAt ? new Date(data.paidAt) : null,
      ticketNumber: data.ticketNumber ?? null,
    })

    paymentId = result[0].insertId

    /* 4.3 insertar payment_items */

    await tx.insert(paymentItems).values(
      data.items.map(item => ({
        paymentId,
        contractItemId: item.contractItemId,
        amount: item.amount.toString()
      }))
    )

    /* 4.4 calcular nuevo estado */

    const newPaidAmount = paid + total

    let newStatus: "draft" | "active" | "completed" = "draft"

    if (newPaidAmount === 0) {
      newStatus = "draft"
    } else if (newPaidAmount < contractTotal) {
      newStatus = "active"
    } else {
      newStatus = "completed"
    }

    /* 4.5 actualizar contrato */

    await tx.update(contracts)
      .set({ status: newStatus })
      .where(
        and(
          eq(contracts.id, contractId),
          eq(contracts.companyId, contract.companyId)
        )
      )

    return {
      paidAmount: newPaidAmount,
      remainingAmount: contractTotal - newPaidAmount,
      contractStatus: newStatus
    }

  })

  /* ---------- 5. construir response ---------- */

  const payment = {
    id: paymentId!,
    contractId,
    // amount: total.toString(),
    amount: total.toFixed(2),
    currency: data.currency,
    paymentMethod: data.paymentMethod,
    items: data.items,
    createdAt: new Date(),
    paidAt: data.paidAt ?? null,
    ticketNumber: data.ticketNumber ?? null
  }

  const paymentStatus = getPaymentStatus(
    contractTotal,
    resultSummary.paidAmount
  )

  return {
    payment,
    summary: {
      contractId,
      contractStatus: resultSummary.contractStatus,
      paymentStatus,
      contractTotal,
      paidAmount: resultSummary.paidAmount,
      remainingAmount: resultSummary.remainingAmount
    }
  }
}


export async function getCompanyPayments({
  search,
  page = 1,
  limit = 10
}: {
  search?: string
  page?: number
  limit?: number
}) {

  const { companyId } = await requireAuth()

  const offset = (page - 1) * limit

  /* ---------- WHERE dinámico ---------- */
  // const conditions = [
  //   eq(contracts.companyId, companyId!),
  //   isNull(payments.deletedAt)
  // ]

  const conditions = [
    eq(contracts.companyId, companyId!),
    notDeletedPayments()
  ]

  if (search) {
    const term = `%${search}%`

    conditions.push(
      or(
        like(clients.name, term),
        like(events.name, term)
      )!
    )
  }

  /* ---------- QUERY PRINCIPAL ---------- */
  const rows = await db
    .select({
      paymentId: payments.id,
      amount: payments.amount,
      currency: payments.currency,
      paymentMethod: payments.paymentMethod,
      createdAt: payments.createdAt,

      contractId: contracts.id,
      contractStatus: contracts.status,
      contractTotal: contracts.totalAmount,

      clientName: clients.name,
      eventName: events.name,

      paidAmount: sum(payments.amount),
      paidAt: payments.paidAt,
      ticketNumber: payments.ticketNumber,
    })
    .from(payments)
    .leftJoin(contracts, eq(payments.contractId, contracts.id))
    .leftJoin(events, eq(contracts.eventId, events.id))
    .leftJoin(clients, eq(contracts.clientId, clients.id))
    .where(and(...conditions))
    .groupBy(
      payments.id,
      contracts.id,
      clients.name,
      events.name
    )
    .orderBy(desc(payments.createdAt))
    .limit(limit)
    .offset(offset)

  /* ---------- TOTAL ---------- */
  const totalResult = await db
    .select({ id: payments.id })
    .from(payments)
    .leftJoin(contracts, eq(payments.contractId, contracts.id))
    .leftJoin(events, eq(contracts.eventId, events.id))
    .leftJoin(clients, eq(contracts.clientId, clients.id))
    .where(and(...conditions))

  const total = totalResult.length

  /* ---------- ITEMS ---------- */
  const paymentItemsRows = await db
    .select({
      paymentId: paymentItems.paymentId,
      contractItemId: paymentItems.contractItemId,
      amount: paymentItems.amount,

      serviceId: services.id,
      serviceName: services.name,
      serviceDescription: services.description
    })
    .from(paymentItems)
    .innerJoin(payments, eq(paymentItems.paymentId, payments.id))
    .innerJoin(contracts, eq(payments.contractId, contracts.id))
    .innerJoin(contractItems, eq(paymentItems.contractItemId, contractItems.id))
    .innerJoin(services, eq(contractItems.serviceId, services.id))
    .where(
      and(
        eq(contracts.companyId, companyId!),
        isNull(payments.deletedAt)
      )
    )

  const itemsByPayment = new Map<number, any[]>()

  for (const row of paymentItemsRows) {
    if (!itemsByPayment.has(row.paymentId)) {
      itemsByPayment.set(row.paymentId, [])
    }

    itemsByPayment.get(row.paymentId)!.push({
      contractItemId: row.contractItemId,
      amount: Number(row.amount),
      service: {
        id: row.serviceId,
        name: row.serviceName,
        description: row.serviceDescription
      }
    })
  }

  /* ---------- MAP FINAL ---------- */
  const data = rows.map((row) => {

    const contractTotal = Number(row.contractTotal)
    const paidAmount = Number(row.paidAmount ?? 0)
    const remainingAmount = contractTotal - paidAmount

    const paymentStatus =
      getPaymentStatus(contractTotal, paidAmount)

    return {
      id: row.paymentId,
      amount: Number(row.amount),
      currency: row.currency,
      paymentMethod: row.paymentMethod,
      createdAt: row.createdAt,
      paidAt: row.paidAt,
      ticketNumber: row.ticketNumber,

      contract: {
        id: row.contractId,
        status: row.contractStatus,
        total: contractTotal
      },

      clientName: row.clientName,
      eventName: row.eventName,

      summary: {
        paidAmount,
        remainingAmount,
        paymentStatus
      },

      items: itemsByPayment.get(row.paymentId) || []
    }
  })

  /* ---------- RETURN ---------- */
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
}
/* ---------- GET SINGLE PAYMENT ---------- */

export async function getPayment(id: number) {

  const tdb = await tenantDb()

  const payment = await tdb.findFirstRaw(
    payments,
    eq(payments.id, id)
  )

  if (!payment) return null

  const contract = await tdb.findFirst(
    contracts,
    eq(contracts.id, payment.contractId)
  )

  if (!contract) return null

  const contractPayments = await db
    .select()
    .from(payments)
    // .where(
    //   and(
    //     eq(payments.contractId, payment.contractId),
    //     isNull(payments.deletedAt)
    //   )
    // )

    // .where(
    //   and(
    //     eq(payments.contractId, contractId),
    //     isNull(payments.deletedAt)
    //   )
    // )
    .where(activePayments(payment.contractId))

  const paidAmount = contractPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  )

  const contractTotal = Number(contract.totalAmount)

  const remainingAmount = contractTotal - paidAmount

  const paymentStatus =
    getPaymentStatus(contractTotal, paidAmount)

  return {
    contractId: contract.id,
    contractStatus: contract.status,
    paymentStatus,
    contractTotal,
    paidAmount,
    remainingAmount,
    payments: contractPayments
  }

}
export async function updatePayment(
  id: number,
  data: Partial<CreatePaymentInput>
) {

  const tdb = await tenantDb()

  const existing = await tdb.findFirstRaw(
    payments,
    eq(payments.id, id)
  )

  if (!existing) return null

  await tdb.update(
    payments,
    data,
    eq(payments.id, id)
  )

  //await recalcContractStatus(existing.contractId)

  return tdb.findFirstRaw(
    payments,
    eq(payments.id, id)
  )
}
export async function deletePayment(id: number) {

  const tdb = await tenantDb()

  const existing = await tdb.findFirstRaw(
    payments,
    eq(payments.id, id)
  )

  if (!existing) return null

  await tdb.update(
    payments,
    { deletedAt: new Date() },
    eq(payments.id, id)
  )

  //await recalcContractStatus(existing.contractId)

  return true
}
export async function reactivatePayment(id: number) {

  const tdb = await tenantDb()

  const existing = await tdb.findFirstRaw(
    payments,
    eq(payments.id, id)
  )

  if (!existing) return null

  await tdb.update(
    payments,
    { deletedAt: null },
    eq(payments.id, id)
  )

  //await recalcContractStatus(existing.contractId)

  return true
}