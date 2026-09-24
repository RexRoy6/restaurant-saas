import { getClient, updateClient, 
  deleteClient,reactivateClient } from "@/lib/services/clientService"
import { updateClientSchema } from "@/lib/validations/clientValidation"
import { requireAuth } from "@/lib/auth/requireAuth"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAuth()

    try {
        const { id } = await params
        const clientId = Number(id)


        if (Number.isNaN(clientId)) {
            return Response.json(
                { error: "invalid clientId" },
                { status: 400 }
            )
        }

        const data = await getClient(clientId)

        if (!data) {
            return Response.json(
                { error: "client not found" },
                { status: 404 }
            )
        }

        return Response.json(data)


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
    const clientId = Number(id)

    if (Number.isNaN(clientId)) {
      return Response.json(
        { error: "invalid client id" },
        { status: 400 }
      )
    }

    /* ---------- check reactivate ---------- */
    const { searchParams } = new URL(req.url)
    const reactivate = searchParams.get("reactivate")

    if (reactivate === "true") {

      const result = await reactivateClient(clientId)

      if (!result) {
        return Response.json(
          { error: "client not found" },
          { status: 404 }
        )
      }

      return Response.json({
        message: "client reactivated"
      })
    }

    /* ---------- normal update ---------- */
    const body = await req.json()

    const parsed = updateClientSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updated = await updateClient(
      clientId,
      parsed.data
    )

    if (!updated) {
      return Response.json(
        { error: "client not found" },
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAuth()
  try {

    const { id } = await params
    const clientId = Number(id)

    if (Number.isNaN(clientId)) {
      return Response.json(
        { error: "invalid client id" },
        { status: 400 }
      )
    }

    const deleted = await deleteClient(clientId)

    if (!deleted) {
      return Response.json(
        { error: "client not found" },
        { status: 404 }
      )
    }

    return Response.json(
      { message: "client deleted" }
    )

  } catch (error) {
    console.error(error)

    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }
}