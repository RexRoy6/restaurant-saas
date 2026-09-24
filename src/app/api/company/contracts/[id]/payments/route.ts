import {
  getContractPayments,
  createPayment
} from "@/lib/services/paymentService"

import {
  createPaymentSchema
} from "@/lib/validations/paymentValidation"
import { requireAuth } from "@/lib/auth/requireAuth"


/* ---------- GET ---------- */

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

    const payments =
      await getContractPayments(contractId)

    return Response.json(payments)

  } catch (error) {

    console.error(error)

    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }

}
/* ---------- POST ---------- */

export async function POST(
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

    const body = await req.json()

    const parsed =
      createPaymentSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const payment =
      await createPayment(contractId, parsed.data)

    return Response.json(payment)

  } catch (error: any) {

    if (error.message === "contract not found") {
      return Response.json(
        { error: "contract not found" },
        { status: 404 }
      )
    }

    if (error.message === "payment exceeds contract total") {
      return Response.json(
        { error: "payment exceeds contract total" },
        { status: 400 }
      )
    }

    console.error(error)

    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }

}