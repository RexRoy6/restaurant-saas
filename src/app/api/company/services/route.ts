import { createService, getCompanyServices } from "@/lib/services/serviceService"
import { createServiceSchema } from "@/lib/validations/serviceValidation"
import { requireAuth } from "@/lib/auth/requireAuth"


export async function GET() {
  const auth = await requireAuth()
  try {
    const data = await getCompanyServices()
    return Response.json(data)
  } catch (error) {
    console.error(error)
    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  const auth = await requireAuth()
  try {
    const body = await req.json()

    const parsed = createServiceSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const result = await createService(parsed.data)

    return Response.json(result, { status: 201 })

  } catch (error: any) {
    console.error(error)

    /* ---------- DUPLICATE SERVICE ---------- */
    if (
      error?.cause?.code === "ER_DUP_ENTRY" ||
      error?.code === "ER_DUP_ENTRY"
    ) {
      return Response.json(
        { error: "Service with this name already exists" },
        { status: 409 }
      )
    }

    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }
}