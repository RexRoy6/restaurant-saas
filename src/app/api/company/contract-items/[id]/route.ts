import {
  updateContractItem,
  deleteContractItem
} from "@/lib/services/contractItemService"

import {
  updateContractItemSchema
} from "@/lib/validations/contractItemValidation"

import { requireAuth } from "@/lib/auth/requireAuth"


/* ---------- PATCH ---------- */

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()

  try {

    const { id } = await params
    const itemId = Number(id)

    if (Number.isNaN(itemId)) {
      return Response.json(
        { error: "invalid item id" },
        { status: 400 }
      )
    }

    const body = await req.json()

    const parsed =
      updateContractItemSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updated =
      await updateContractItem(itemId, parsed.data)

    if (!updated) {
      return Response.json(
        { error: "item not found" },
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



/* ---------- DELETE ---------- */

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()

  try {

    const { id } = await params
    const itemId = Number(id)

    if (Number.isNaN(itemId)) {
      return Response.json(
        { error: "invalid item id" },
        { status: 400 }
      )
    }

    const deleted =
      await deleteContractItem(itemId)

    if (!deleted) {
      return Response.json(
        { error: "item not found" },
        { status: 404 }
      )
    }

    return Response.json({
      message: "item deleted"
    })

  } catch (error) {

    console.error(error)

    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }

}

//{{URL}}api/company/contract-items/2 <- es el service id