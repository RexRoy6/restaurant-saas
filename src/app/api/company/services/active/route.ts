import {  getActiveCompanyServices } from "@/lib/services/serviceService"
import { requireAuth } from "@/lib/auth/requireAuth"


export async function GET() {
  const auth = await requireAuth()
  try {
    const data = await getActiveCompanyServices()
    return Response.json(data)
  } catch (error) {
    console.error(error)
    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }
}