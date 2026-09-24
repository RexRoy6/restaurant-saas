import { z } from "zod"

/* ---------- CREATE EVENT ---------- */
export const createEventSchema = z.object({

  clientId: z
    .number()
    .int()
    .positive(),

  name: z
    .string()
    .min(2, "name must be at least 2 characters")
    .max(255),


  //eventDate: z.string().datetime().or(z.string()),
  eventDate: z.string(),
  eventStart: z.string(),

eventEnd: z.string(),

  location: z
    .string()
    .max(255)
    .optional(),

  notes: z
    .string()
    .max(500)
    .optional()

})

/* ---------- UPDATE EVENT ---------- */

export const updateEventSchema = createEventSchema.partial()

/* ---------- TYPES ---------- */

export type CreateEventInput = z.infer<typeof createEventSchema>

export type UpdateEventInput = z.infer<typeof updateEventSchema>