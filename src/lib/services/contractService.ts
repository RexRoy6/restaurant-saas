import { db } from "@/db"
import { tenantDb } from "@/lib/db/tenantDb"
import { requireAuth } from "@/lib/auth/requireAuth"
import { contracts, events, clients, payments, ContractStatus } from "@/db/schema"
import { sql } from "drizzle-orm"

import { eq, and, isNull, like, or, desc } from "drizzle-orm"
import type {
  CreateContractInput,
  UpdateContractInput
} from "@/lib/validations/contractValidation"

class ConflictError extends Error { }



/* ---------- CREATE CONTRACT ---------- */

export async function createContract(data: CreateContractInput) {
  const tdb = await tenantDb()

  const event = await tdb.findFirst(
    events,
    eq(events.id, data.eventId)
  )

  if (!event) {
    throw new Error("Event not found")
  }

  // 🔥 check si ya existe contrato
  const existing = await tdb.findFirst(
    contracts,
    and(
      eq(contracts.eventId, data.eventId),
      eq(contracts.companyId, event.companyId),
      isNull(contracts.deletedAt)
    )
  )

  // if (existing) {
  //   return existing // o throw error si prefieres
  // }
  //   if (existing) {
  //   throw new Error("Contract already exists for this event")
  // }
  if (existing) {
    throw new ConflictError("Contract already exists for this event")
  }
  const [result] = await tdb.insert(
    contracts,
    {
      eventId: data.eventId,
      clientId: event.clientId,
      status: data.status,
      totalAmount: data.totalAmount
    }
  )

  return tdb.findFirst(
    contracts,
    eq(contracts.id, result.insertId)
  )
}


/* ---------- GET COMPANY CONTRACTS ---------- */

export async function getCompanyContracts({
  search,
  page = 1,
  limit = 10,
  eventId,
  status
}: {
  search?: string
  page?: number
  limit?: number
  eventId?: number
  status?: ContractStatus
}) {

  const { companyId } = await requireAuth()

  const offset = (page - 1) * limit

  /* ---------- WHERE dinámico ---------- */

  const conditions: any[] = [
    isNull(contracts.deletedAt)
  ]

  if (companyId) {
    conditions.push(eq(contracts.companyId, companyId))
  }
  if (eventId) {
    conditions.push(eq(contracts.eventId, eventId))
  }
  if (status) {
    conditions.push(eq(contracts.status, status))
  }

  if (search) {
    const term = `%${search}%`

    conditions.push(
      or(
        like(contracts.status, term),
        like(clients.name, term),
        like(events.name, term),
        like(events.location, term)
      )!
    )
  }

  const whereClause = and(...conditions)

  /* ---------- QUERY PRINCIPAL ---------- */

  const rows = await db
    .select({
      id: contracts.id,
      status: contracts.status,
      totalAmount: contracts.totalAmount,

      paidAmount: sql<number>`COALESCE(SUM(${payments.amount}),0)`,

      clientId: clients.id,
      clientName: clients.name,

      eventId: events.id,
      eventName: events.name,

      eventDate: events.eventDate,
      eventStart: events.eventStart,
      eventEnd: events.eventEnd,

      eventLocation: events.location,
      eventNote: events.notes
    })
    .from(contracts)
    .leftJoin(clients, eq(contracts.clientId, clients.id))
    .leftJoin(events, eq(contracts.eventId, events.id))
    //.leftJoin(payments, eq(payments.contractId, contracts.id))
    .leftJoin(
      payments,
      and(
        eq(payments.contractId, contracts.id),
        isNull(payments.deletedAt)
      )
    )
    .where(whereClause)
    .groupBy(
      contracts.id,
      clients.id,
      events.id,
      events.eventDate,
      events.location
    )
    .orderBy(desc(contracts.id))
    .limit(limit)
    .offset(offset)

  /* ---------- TOTAL ---------- */

  const totalResult = await db
    .select({ id: contracts.id })
    .from(contracts)
    .leftJoin(clients, eq(contracts.clientId, clients.id))
    .leftJoin(events, eq(contracts.eventId, events.id))
    .where(whereClause)

  const total = totalResult.length

  /* ---------- MAP ---------- */

  const data = rows.map((row) => {

    const totalAmount = Number(row.totalAmount)
    const paid = Number(row.paidAmount)

    return {
      id: row.id,
      status: row.status,
      totalAmount,
      paidAmount: paid,
      remainingAmount: totalAmount - paid,

      client: row.clientId
        ? { id: row.clientId, name: row.clientName }
        : null,


      event: row.eventId
        ? {
          id: row.eventId,
          name: row.eventName,

          eventDate: row.eventDate,
          eventStart: row.eventStart,
          eventEnd: row.eventEnd,

          location: row.eventLocation,
          notes: row.eventNote
        }
        : null

    }
  })

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



/* ---------- GET SINGLE CONTRACT ---------- */

export async function getContract(id: number) {

  const { companyId } = await requireAuth()

  const rows = await db
    .select({
      id: contracts.id,
      status: contracts.status,
      totalAmount: contracts.totalAmount,

      paidAmount: sql<number>`COALESCE(SUM(${payments.amount}),0)`,

      clientId: clients.id,
      clientName: clients.name,

      eventId: events.id,
      eventName: events.name,

      eventDate: events.eventDate,
      eventStart: events.eventStart,
      eventEnd: events.eventEnd,

      eventLocation: events.location,
      eventNote: events.notes
    })
    .from(contracts)

    .leftJoin(
      clients,
      eq(contracts.clientId, clients.id)
    )

    .leftJoin(
      events,
      eq(contracts.eventId, events.id)
    )

    // .leftJoin(
    //   payments,
    //   eq(payments.contractId, contracts.id)
    // )
    .leftJoin(
      payments,
      and(
        eq(payments.contractId, contracts.id),
        isNull(payments.deletedAt)
      )
    )

    .where(
      companyId
        ? and(
          eq(contracts.id, id),
          eq(contracts.companyId, companyId)
        )
        : eq(contracts.id, id)
    )

    .groupBy(
      contracts.id,
      clients.id,
      events.id,
      events.eventDate,
      events.location
    )

  const row = rows[0]

  if (!row) return null

  const total = Number(row.totalAmount)
  const paid = Number(row.paidAmount)

  return {
    id: row.id,
    status: row.status,
    totalAmount: total,
    paidAmount: paid,
    remainingAmount: total - paid,

    client: row.clientId
      ? {
        id: row.clientId,
        name: row.clientName
      }
      : null,


    event: row.eventId
      ? {
        id: row.eventId,
        name: row.eventName,

        eventDate: row.eventDate,
        eventStart: row.eventStart,
        eventEnd: row.eventEnd,

        location: row.eventLocation,
        notes: row.eventNote
      }
      : null


  }
}



/* ---------- UPDATE CONTRACT ---------- */

export async function updateContract(
  id: number,
  data: UpdateContractInput
) {

  const tdb = await tenantDb()

  const existing = await tdb.findFirst(
    contracts,
    eq(contracts.id, id)
  )

  if (!existing) return null

  await tdb.update(
    contracts,
    data,
    eq(contracts.id, id)
  )

  return tdb.findFirst(
    contracts,
    eq(contracts.id, id)
  )

}



/* ---------- SOFT DELETE ---------- */

export async function deleteContract(id: number) {

  const tdb = await tenantDb()

  const existing = await tdb.findFirst(
    contracts,
    eq(contracts.id, id)
  )

  if (!existing) return null

  await tdb.update(
    contracts,
    { deletedAt: new Date() },
    eq(contracts.id, id)
  )

  return true

}



/* ---------- REACTIVATE ---------- */

export async function reactivateContract(id: number) {

  const tdb = await tenantDb()

  const existing = await tdb.findFirstRaw(
    contracts,
    eq(contracts.id, id)
  )

  if (!existing) return null

  await tdb.update(
    contracts,
    { deletedAt: null },
    eq(contracts.id, id)
  )

  return true

}