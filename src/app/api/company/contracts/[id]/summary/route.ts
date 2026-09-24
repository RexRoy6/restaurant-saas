import { getContractSummary }
from "@/lib/services/contractSummaryService"
import { requireAuth } from "@/lib/auth/requireAuth"


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

    const summary =
      await getContractSummary(contractId)

    return Response.json(summary)

  } catch (error: any) {

    if (error.message === "contract not found") {
      return Response.json(
        { error: "contract not found" },
        { status: 404 }
      )
    }

    console.error(error)

    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )

  }

}