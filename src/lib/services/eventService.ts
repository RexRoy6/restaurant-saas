import { db } from "@/db"
import { tenantDb } from "@/lib/db/tenantDb"
import { events, clients, contracts } from "@/db/schema"
import { activeContracts } from "@/db/filters"
import { requireAuth } from "@/lib/auth/requireAuth"
import { and, eq, isNotNull, isNull, or, like, desc } from "drizzle-orm"
import { CreateEventInput, UpdateEventInput } from "@/lib/validations/eventValidation"
/* ---------- CREATE ---------- */
export async function createEvent(data: CreateEventInput) {
  const tdb = await tenantDb()

  const client = await tdb.findFirst(
    clients,
    eq(clients.id, data.clientId)
  )

  if (!client) {
    throw new Error("client not found")
  }

  const insertData = {
    ...data,

    eventDate: new Date(data.eventDate),
    eventStart: new Date(data.eventStart),
    eventEnd: new Date(data.eventEnd),
  }

  const [result] = await tdb.insert(events, insertData)

  const insertId = result.insertId

  return tdb.findFirst(events, eq(events.id, insertId))
}

//get all
export async function getEvents({
  clientId,
  search,
  page = 1,
  limit = 10
}: {
  clientId?: number
  search?: string
  page?: number
  limit?: number
}) {

  const { companyId } = await requireAuth()

  const offset = (page - 1) * limit
  const safeCompanyId = companyId ?? undefined

  const filters = [
    eq(events.companyId, companyId!),
    isNull(events.deletedAt)
  ]

  /* filter by client */
  if (clientId) {
    filters.push(eq(events.clientId, clientId))
  }

  /* 🔥 SEARCH */
  if (search) {
    const term = `%${search}%`

    filters.push(
      or(
        like(events.name, term),       // event name
        like(events.location, term),   // location
        like(clients.name, term)       // client name
        // 👉 eventDate lo vemos abajo 👇
      )!
    )
  }

  /* ---------- DATA ---------- */

  const data = await db
    .select({
      id: events.id,
      name: events.name,
      eventDate: events.eventDate,
      eventStart: events.eventStart,
      eventEnd: events.eventEnd,
      location: events.location,
      notes: events.notes,

      client: {
        id: clients.id,
        name: clients.name
      },

      contract: {
        id: contracts.id,
        status: contracts.status
      }
    })
    .from(events)

    .leftJoin(
      clients,
      eq(events.clientId, clients.id)
    )

    .leftJoin(
      contracts,
      and(
        eq(contracts.eventId, events.id),
        activeContracts(safeCompanyId)
      )
    )
    .where(and(...filters))
    .orderBy(desc(events.eventDate))
    .limit(limit)
    .offset(offset)

  /* ---------- TOTAL ---------- */

  const totalResult = await db
    .select({ id: events.id })
    .from(events)
    .leftJoin(clients, eq(events.clientId, clients.id))
    .where(and(...filters))

  const total = totalResult.length

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

//get all

export async function getEventById(id: number) {

  const { companyId } = await requireAuth()

  const safeCompanyId = companyId ?? undefined

  const result = await db
    .select({
      id: events.id,
      name: events.name,
      eventDate: events.eventDate,
      eventStart: events.eventStart,
      eventEnd: events.eventEnd,
      location: events.location,
      notes: events.notes,

      client: {
        id: clients.id,
        name: clients.name
      },

      contract: {
        id: contracts.id,
        status: contracts.status
      }
    })
    .from(events)
    .leftJoin(
      clients,
      eq(events.clientId, clients.id)
    )

    .leftJoin(
      contracts,
      and(
        eq(contracts.eventId, events.id),
        activeContracts(safeCompanyId)
      )
    )
    .where(
      and(
        eq(events.id, id),
        eq(events.companyId, companyId!)
        //isNull(events.deletedAt)
      )
    )
    .limit(1)

  return result[0] ?? null
}


export async function getEventsByClient(clientId: number) {

  const { companyId } = await requireAuth()

  return db
    .select({
      id: events.id,
      name: events.name,
      eventDate: events.eventDate,
      eventStart: events.eventStart,
      eventEnd: events.eventEnd,
      location: events.location
    })
    .from(events)
    .where(
      and(
        eq(events.clientId, clientId),
        eq(events.companyId, companyId!),
        isNull(events.deletedAt)
      )
    )

}

/* ---------- UPDATE ---------- */
export async function updateEvent(
  id: number,
  data: UpdateEventInput
) {
  const tdb = await tenantDb()

  const existing = await tdb.findFirst(
    events,
    eq(events.id, id)
  )

  if (!existing) return null

  const formattedData = {
    ...data,
    ...(data.eventDate && {
      eventDate: new Date(data.eventDate),
    }),


    ...(data.eventStart && {
      eventStart: new Date(data.eventStart),
    }),

    ...(data.eventEnd && {
      eventEnd: new Date(data.eventEnd),
    }),
  }

  await tdb.update(
    events,
    formattedData,
    eq(events.id, id)
  )

  return tdb.findFirst(
    events,
    eq(events.id, id)
  )
}

/* ---------- UPDATE EVENT ---------- */

/* ---------- SOFT DELETE ---------- */

export async function deleteEvent(id: number) {
  const tdb = await tenantDb()

  const existing = await tdb.findFirstRaw(
    events,
    eq(events.id, id)
  )

  if (!existing) return null

  await tdb.update(
    events,
    { deletedAt: new Date() },
    eq(events.id, id)
  )

  return true
}

/* ---------- REACTIVATE ---------- */

export async function reactivateEvent(id: number) {
  const tdb = await tenantDb()

  const existing = await tdb.findFirstRaw(
    events,
    and(
      eq(events.id, id),
      isNotNull(events.deletedAt)
    )
  )

  if (!existing) return null

  await tdb.update(
    events,
    { deletedAt: null },
    eq(events.id, id)
  )

  return true
}