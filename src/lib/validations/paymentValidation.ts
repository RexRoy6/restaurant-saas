import { z } from "zod"

export const createPaymentSchema = z.object({
  currency: z.enum(["MXN", "USD"]),
  paymentMethod: z.string().optional(),

  paidAt: z.iso.datetime().optional(),
  ticketNumber: z.string().max(100).optional(),

  items: z.array(
    z.object({
      contractItemId: z.number(),
      amount: z.number().positive()
    })
  ).min(1)
})

export type CreatePaymentInput =
  z.infer<typeof createPaymentSchema>