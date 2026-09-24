import {
  getPayment,
  updatePayment,
  deletePayment,
  reactivatePayment
} from "@/lib/services/paymentService"
import { requireAuth } from "@/lib/auth/requireAuth"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
   const auth = await requireAuth()

  const { id } = await params
  const paymentId = Number(id)

  if (Number.isNaN(paymentId)) {
    return Response.json(
      { error: "invalid id" },
      { status: 400 }
    )
  }

  const payment = await getPayment(paymentId)

  if (!payment) {
    return Response.json(
      { error: "payment not found" },
      { status: 404 }
    )
  }

  return Response.json(payment)

}
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
   const auth = await requireAuth()

  const { id } = await params
  const paymentId = Number(id)

  const url = new URL(req.url)

  if (url.searchParams.get("reactivate")) {

    const ok = await reactivatePayment(paymentId)

    if (!ok) {
      return Response.json(
        { error: "payment not found" },
        { status: 404 }
      )
    }

    return Response.json({ success: true })

  }

  const body = await req.json()

  const payment = await updatePayment(paymentId, body)

  if (!payment) {
    return Response.json(
      { error: "payment not found" },
      { status: 404 }
    )
  }

  return Response.json(payment)

}
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
   const auth = await requireAuth()

  const { id } = await params
  const paymentId = Number(id)

  const ok = await deletePayment(paymentId)

  if (!ok) {
    return Response.json(
      { error: "payment not found" },
      { status: 404 }
    )
  }

  return Response.json({ success: true })

}