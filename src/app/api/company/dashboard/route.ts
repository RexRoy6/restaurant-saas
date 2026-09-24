import { getCompanyDashboard }
from "@/lib/services/dashboardService"

import { requireAuth }
from "@/lib/auth/requireAuth"



export async function GET() {

  try {

    await requireAuth({
      roles: ["owner", "employee"]
    })

    const data = await getCompanyDashboard()

    return Response.json(data)

  } catch (error) {

    console.error(error)

    return Response.json(
      { error: "unauthorized" },
      { status: 401 }
    )

  }

}