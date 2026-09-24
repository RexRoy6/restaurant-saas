import {
  getContract,
  updateContract,
  deleteContract,
  reactivateContract
} from "@/lib/services/contractService"

import {
  updateContractSchema
} from "@/lib/validations/contractValidation"
import { requireAuth } from "@/lib/auth/requireAuth"


/* ---------- GET (single contract) ---------- */

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
   const auth = await requireAuth()

  try {

    const { id } = await params
    const contractId = Number(id)

    if (Number.isNaN(contractId)) {
      return Response.json(
        { error: "invalid contract id" },
        { status: 400 }
      )
    }

    const contract = await getContract(contractId)

    if (!contract) {
      return Response.json(
        { error: "contract not found" },
        { status: 404 }
      )
    }

    return Response.json(contract)

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
    const contractId = Number(id)

    if (Number.isNaN(contractId)) {
      return Response.json(
        { error: "invalid contract id" },
        { status: 400 }
      )
    }

    /* check if reactivation */

    const { searchParams } = new URL(req.url)
    const reactivate = searchParams.get("reactivate")

    if (reactivate === "true") {

      const result = await reactivateContract(contractId)

      if (!result) {
        return Response.json(
          { error: "contract not found" },
          { status: 404 }
        )
      }

      return Response.json({
        message: "contract reactivated"
      })
    }

    /* ---------- normal update ---------- */

    const body = await req.json()

    const parsed = updateContractSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updated = await updateContract(
      contractId,
      parsed.data
    )

    if (!updated) {
      return Response.json(
        { error: "contract not found" },
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
    const contractId = Number(id)

    if (Number.isNaN(contractId)) {
      return Response.json(
        { error: "invalid contract id" },
        { status: 400 }
      )
    }

    const deleted = await deleteContract(contractId)

    if (!deleted) {
      return Response.json(
        { error: "contract not found" },
        { status: 404 }
      )
    }

    return Response.json({
      message: "contract deleted"
    })

  } catch (error) {

    console.error(error)

    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }

}