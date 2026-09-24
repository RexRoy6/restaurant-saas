import { tenantDb } from "@/lib/db/tenantDb"

import {
  contracts,
  clients,
  events,
  contractItems,
  services,
  payments
} from "@/db/schema"

import { eq, and, isNull } from "drizzle-orm"



export async function getContractSummary(contractId: number) {

  const tdb = await tenantDb()

  /* contract */

  const contract = await tdb.findFirst(
    contracts,
    eq(contracts.id, contractId)
  )

  if (!contract) {
    throw new Error("contract not found")
  }

  /* client */

  const client = await tdb.findFirst(
    clients,
    eq(clients.id, contract.clientId)
  )

  /* event */

  const event = await tdb.findFirst(
    events,
    eq(events.id, contract.eventId)
  )

  /* services */

  const items = await tdb.findManyRaw(
    contractItems,
    eq(contractItems.contractId, contractId)
  )

  const serviceIds = items.map(i => i.serviceId)

  let serviceList: any[] = []

  if (serviceIds.length > 0) {

    serviceList = await Promise.all(
      serviceIds.map(id =>
        tdb.findFirst(
          services,
          eq(services.id, id)
        )
      )
    )

  }

  const servicesSold = items.map(item => {

    const service = serviceList.find(
      s => s?.id === item.serviceId
    )

    const subtotal =
      item.quantity * Number(item.unitPrice)

    return {
      ...item,
      service,
      subtotal
    }

  })

  /* payments */

  const contractPayments = await tdb.findManyRaw(
    payments,
    eq(payments.contractId, contractId)
  )

  const paid = contractPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  )

  const total = Number(contract.totalAmount ?? 0)

  const balance = total - paid

  return {
    contract,
    client,
    event,
    services: servicesSold,
    payments: contractPayments,
    total,
    paid,
    balance
  }

}