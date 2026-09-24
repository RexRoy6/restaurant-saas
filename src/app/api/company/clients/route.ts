import { getClients, createClient } from "@/lib/services/clientService"
import { createClientSchema } from "@/lib/validations/clientValidation"
import { requireAuth } from "@/lib/auth/requireAuth"


export async function GET(req: Request) {
  const auth = await requireAuth()

  const { searchParams } = new URL(req.url)

  const search = searchParams.get("search") || ""
  const page = Number(searchParams.get("page") || 1)
  const limit = Number(searchParams.get("limit") || 10)

  const data = await getClients({
    search,
    page,
    limit
  })

  return Response.json(data)
}

export async function POST(req: Request) {
   const auth = await requireAuth()

  const body = await req.json()

  const parsed = createClientSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const result = await createClient(parsed.data)

  return Response.json(result, { status: 201 })
}