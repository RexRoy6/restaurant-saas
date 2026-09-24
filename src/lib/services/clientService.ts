import { tenantDb } from "@/lib/db/tenantDb"
import { clients } from "@/db/schema"
import { eq, and, or, like, desc, isNull } from "drizzle-orm"
import type { UpdateClientInput } from "@/lib/validations/clientValidation"
import { requireAuth } from "@/lib/auth/requireAuth"
import { db } from "@/db"


//createClient
export async function createClient(data: {
  name: string
  phone: string
  email?: string
}) {
  const tdb = await tenantDb()

  const [result] = await tdb.insert(clients, data)

  const id = result.insertId

  return tdb.findFirst(
    clients,
    eq(clients.id, id)
  )
}
//getClients
// export async function getClients() {
//   const tdb = await tenantDb()
//   return tdb.findManyRaw(clients)
// }

export async function getClients({
  search = "",
  page = 1,
  limit = 10
}: {
  search?: string
  page?: number
  limit?: number
}) {

  const { companyId } = await requireAuth()

  const offset = (page - 1) * limit

  const filters = [
    eq(clients.companyId, companyId!),
    isNull(clients.deletedAt)
  ]

  const whereClause = and(
    eq(clients.companyId, companyId!),
    isNull(clients.deletedAt),
    search
      ? or(
        like(clients.name, `%${search}%`),
        like(clients.phone, `%${search}%`),
        like(clients.email, `%${search}%`)
      )
      : undefined
  )

  /* ---------- DATA ---------- */

  const data = await db
    .select()
    .from(clients)
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(clients.createdAt))

  /* ---------- TOTAL ---------- */

  const totalRows = await db
    .select()
    .from(clients)
    .where(whereClause)

  const total = totalRows.length

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
//
//getClient
export async function getClient(id: number) {
  const tdb = await tenantDb()

  return tdb.findFirstRaw(
    clients,
    eq(clients.id, id)
  )
}
//updateClient
export async function updateClient(
  id: number,
  data: UpdateClientInput
) {
  const tdb = await tenantDb()

  const existing = await tdb.findFirst(
    clients,
    eq(clients.id, id)
  )

  if (!existing) return null

  await tdb.update(
    clients,
    data,
    eq(clients.id, id)
  )

  return tdb.findFirst(
    clients,
    eq(clients.id, id)
  )
}
//deleteClient (soft delete)
export async function deleteClient(id: number) {
  const tdb = await tenantDb()

  const existing = await tdb.findFirst(
    clients,
    eq(clients.id, id)
  )

  if (!existing) return null

  await tdb.update(
    clients,
    { deletedAt: new Date() },
    eq(clients.id, id)
  )

  return true
}

//reactivar usuario
//reactivateClient
export async function reactivateClient(id: number) {
  const tdb = await tenantDb()

  /* buscar incluso si esta soft deleted */
  const existing = await tdb.findFirstRaw(
    clients,
    eq(clients.id, id)
  )

  if (!existing) return null

  await tdb.update(
    clients,
    { deletedAt: null },
    eq(clients.id, id)
  )

  return true
}