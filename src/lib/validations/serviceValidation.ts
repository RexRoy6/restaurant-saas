import { z } from "zod"

export const createServiceSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),

  stockTotal: z.number().int().nonnegative(),

  // because DB decimal expects string
  priceBase: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price")
})

/* ---------- UPDATE schema ---------- */
export const updateServiceSchema = createServiceSchema.partial()

/* ---------- TYPES ---------- */
export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>