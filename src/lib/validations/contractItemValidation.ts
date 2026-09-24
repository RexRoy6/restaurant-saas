import { z } from "zod"

/* ---------- HELPERS ---------- */

function isValidOperationRange(
  start?: string,
  end?: string
) {

  if (!start || !end) {
    return true
  }

  const startDate = new Date(start)
  const endDate = new Date(end)

  // mismo día
  if (endDate > startDate) {
    return true
  }

  // overnight support
  // ejemplo:
  // 9 PM -> 1 AM
  endDate.setDate(
    endDate.getDate() + 1
  )

  return endDate > startDate
}

/* ---------- CREATE CONTRACT ITEM ---------- */

export const createContractItemSchema = z.object({
  serviceId: z.number().int(),

  quantity: z.number()
    .int()
    .positive(),

  unitPrice: z.number(),

  serviceNotes: z.string().optional(),

  operationStart: z.string()
    .datetime()
    .optional(),

  operationEnd: z.string()
    .datetime()
    .optional(),

}).refine(
  (data) =>
    isValidOperationRange(
      data.operationStart,
      data.operationEnd
    ),
  {
    message:
      "operationEnd must be after operationStart",
    path: ["operationEnd"]
  }
)

/* ---------- UPDATE CONTRACT ITEM ---------- */

export const updateContractItemSchema = z.object({

  serviceId: z.number().optional(),

  quantity: z.number()
    .int()
    .positive()
    .optional(),

  serviceNotes: z.string().optional(),

  operationStart: z.string()
    .datetime()
    .optional(),

  operationEnd: z.string()
    .datetime()
    .optional(),

}).refine(
  (data) =>
    isValidOperationRange(
      data.operationStart,
      data.operationEnd
    ),
  {
    message:
      "operationEnd must be after operationStart",
    path: ["operationEnd"]
  }
)

/* ---------- TYPES ---------- */

export type CreateContractItemInput =
  z.infer<typeof createContractItemSchema>

export type UpdateContractItemInput =
  z.infer<typeof updateContractItemSchema>