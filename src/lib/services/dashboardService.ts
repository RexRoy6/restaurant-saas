import { tenantDb } from "@/lib/db/tenantDb"

import {
  clients,
  events,
  contracts,
  payments
} from "@/db/schema"

import {
  today,
  nextDays,
  thisMonth,
  lastMonth
} from "@/lib/db/filters/dateFilters"

import { eq } from "drizzle-orm"

export async function getCompanyDashboard() {

  const tdb = await tenantDb()

  // console.log("tenant db dasboaard", tdb)
  /* ---------- CLIENT COUNT ---------- */
  //forma vieja de contar
  // const [clientsResult] = await tdb.count(clients)

  // const clientsCount = clientsResult.count
  const clientsCount = await tdb.count(clients)

  /* ---------- EVENTS COUNT ---------- */
  const eventsCount = await tdb.count(events)


  /* ---------- EVENTS TODAY ---------- */

  const eventsToday = await tdb.count(
    events,
    today(events.eventDate)
  )
  /* ---------- EVENTS NEXT 7 DAYS ---------- */

  const eventsNext7Days = await tdb.count(
    events,
    nextDays(events.eventDate, 7)
  )
  /* ---------- EVENTS THIS MONTH ---------- */

  const eventsThisMonth = await tdb.count(
    events,
    thisMonth(events.eventDate)
  )
  /* ---------- NEW CLIENTS THIS MONTH ---------- */

  const newClientsThisMonth = await tdb.count(
    clients,
    thisMonth(clients.createdAt)
  )
  /* ---------- NEW CONTRACTS THIS MONTH ---------- */

  const newContractsThisMonth = await tdb.count(
    contracts,
    thisMonth(contracts.createdAt)
  )


  /* ---------- ACTIVE CONTRACTS ---------- */

  const activeContracts = await tdb.count(contracts,
    eq(contracts.status, "active"))
  /* ---------- REVENUE THIS MONTH ---------- */
  const revenueThisMonth = await tdb.sum(
    payments,
    payments.amount,
    thisMonth(payments.paidAt)
  )
  const revenueLastMonth = await tdb.sum(
    payments,
    payments.amount,
    lastMonth(payments.paidAt)
  )

  const revenueGrowth =
    revenueLastMonth === 0
      ? 100
      : (
        (revenueThisMonth - revenueLastMonth)
        / revenueLastMonth
      ) * 100

//bug aqui
  const totalPaid = await tdb.sum(
    payments,
    payments.amount
  )

  /* ---------- PENDING PAYMENTS ---------- */

  const totalSold = await tdb.sum(contracts, contracts.totalAmount)

  const pendingPayments = totalSold - totalPaid

  // return {
  //   clients: clientsCount,
  //   events: eventsCount,
  //   contractsActive: activeContracts,
  //   revenueThisMonth,
  //   pendingPayments
  // }
  return {

    overview: {

      clients: clientsCount,

      events: eventsCount,

      activeContracts,

      totalSold,

      totalPaid,

      pendingPayments

    },

    monthly: {

      revenueThisMonth,

      revenueLastMonth,

      newClients: newClientsThisMonth,

      newContracts: newContractsThisMonth,

      events: eventsThisMonth

    },

    upcoming: {

      today: eventsToday,

      next7Days: eventsNext7Days

    }

  }

}