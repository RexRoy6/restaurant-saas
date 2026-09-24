import {
  getEventById,
  updateEvent,
  deleteEvent,
  reactivateEvent
} from "@/lib/services/eventService"

import {
  updateEventSchema
} from "@/lib/validations/eventValidation"

import { requireAuth } from "@/lib/auth/requireAuth"


/* ---------- GET (single event) ---------- */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  try {

    const { id } = await params
    const eventId = Number(id)

    if (Number.isNaN(eventId)) {
      return Response.json(
        { error: "invalid event id" },
        { status: 400 }
      )
    }

    const event = await getEventById(eventId)

    if (!event) {
      return Response.json(
        { error: "event not found" },
        { status: 404 }
      )
    }

    return Response.json(event)

  } catch (error) {

    console.error(error)

    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }
}



/* ---------- PATCH (update or reactivate) ---------- */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  try {

    const { id } = await params
    const eventId = Number(id)

    if (Number.isNaN(eventId)) {
      return Response.json(
        { error: "invalid event id" },
        { status: 400 }
      )
    }

    /* check if reactivation */
    const { searchParams } = new URL(req.url)
    const reactivate = searchParams.get("reactivate")

    if (reactivate === "true") {

      const result = await reactivateEvent(eventId)

      if (!result) {
        return Response.json(
          { error: "event not found" },
          { status: 404 }
        )
      }

      return Response.json({
        message: "event reactivated"
      })
    }

    /* ---------- normal update ---------- */

    const body = await req.json()

    const parsed = updateEventSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updated = await updateEvent(
      eventId,
      parsed.data
    )

    if (!updated) {
      return Response.json(
        { error: "event not found" },
        { status: 404 }
      )
    }

    return Response.json(updated)

  } catch (error) {

    console.error(error)

    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }
}



/* ---------- DELETE (soft delete) ---------- */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  try {

    const { id } = await params
    const eventId = Number(id)

    if (Number.isNaN(eventId)) {
      return Response.json(
        { error: "invalid event id" },
        { status: 400 }
      )
    }

    const deleted = await deleteEvent(eventId)

    if (!deleted) {
      return Response.json(
        { error: "event not found" },
        { status: 404 }
      )
    }

    return Response.json({
      message: "event deleted"
    })

  } catch (error) {

    console.error(error)

    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }
}