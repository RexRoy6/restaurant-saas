import { requireAuth } from "@/lib/auth/requireAuth"
//import { db } from "@/lib/db" // <-- tu conexión principal
import { db } from "@/db"
import {
  clients,
  contracts,
  events,
  payments,
  users
} from "@/db/schema"

import { thisMonth } from "@/lib/db/filters/dateFilters"

import { and, eq, inArray } from "drizzle-orm"

export async function getCompanyOverview(companyId: number) {

 // await requireAuth(["admin"])

      const auth = await requireAuth()
  /* ---------- CLIENTS ---------- */

  const clientsTotal = await db.$count(
    clients,
    eq(clients.companyId, companyId)
  )

  const newClientsThisMonth = await db.$count(
    clients,
    and(
      eq(clients.companyId, companyId),
      thisMonth(clients.createdAt)
    )
  )

  /* ---------- CONTRACTS ---------- */

  const contractsTotal = await db.$count(
    contracts,
    eq(contracts.companyId, companyId)
  )

  const contractsThisMonth = await db.$count(
    contracts,
    and(
      eq(contracts.companyId, companyId),
      thisMonth(contracts.createdAt)
    )
  )

  /* ---------- EVENTS ---------- */

  const eventsTotal = await db.$count(
    events,
    eq(events.companyId, companyId)
  )

  const eventsThisMonth = await db.$count(
    events,
    and(
      eq(events.companyId, companyId),
      thisMonth(events.createdAt)
    )
  )

  /* ---------- PAYMENTS ---------- */

  const paymentsTotal = await db.$count(
    payments,
    inArray(
      payments.contractId,
      db
        .select({ id: contracts.id })
        .from(contracts)
        .where(eq(contracts.companyId, companyId))
    )
  )

  /* ---------- USERS ---------- */

  const employees = await db.$count(
    users,
    eq(users.companyId, companyId)
  )

  return {
    activity: {
      clients: clientsTotal,
      newClientsThisMonth,

      contractsTotal,
      contractsThisMonth,

      eventsTotal,
      eventsThisMonth,

      paymentsTotal,

      employees
    }
  }
}