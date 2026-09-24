import { z } from "zod"
import { CONTRACT_STATUS } from "@/db/schema"

/* ---------- CREATE CONTRACT ---------- */

export const createContractSchema = z.object({

  // clientId: z
  //   .number()
  //   .int()
  //   .positive(),

  eventId: z
    .number()
    .int()
    .positive(),

  status: z
    .enum(CONTRACT_STATUS)
    .default("draft"),

  totalAmount: z
    .number()
    .nonnegative()

})

/* ---------- UPDATE CONTRACT ---------- */

export const updateContractSchema = createContractSchema
  .partial()


/* ---------- TYPES ---------- */

export type CreateContractInput =
  z.infer<typeof createContractSchema>

export type UpdateContractInput =
  z.infer<typeof updateContractSchema>