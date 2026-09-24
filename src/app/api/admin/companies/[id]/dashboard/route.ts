import { getCompanyOverview }
    from "@/lib/services/adminServices"

import { requireAuth }
    from "@/lib/auth/requireAuth"



export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {


    /* ---------- unwrap params ---------- */
    const { id } = await params
    const companyId = Number(id)

    try {

        await requireAuth({
            roles: ["admin"]
        })

        const data = await getCompanyOverview(companyId)

        return Response.json(data)

    } catch (error) {

        console.error(error)

        return Response.json(
            {
                error: error instanceof Error
                    ? error.message
                    : "Unknown error"
            },
            {
                status: 500
            }
        )

    }

}