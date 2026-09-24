import { db } from "@/db"
import { companies } from "@/db/schema"
import { requireAuth } from "@/lib/auth/requireAuth"
import { eq } from "drizzle-orm"

/* ---------- restore soft deleted company ---------- */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    /* ---------- AUTH ---------- */
    let auth
    try {
      auth = await requireAuth({ roles: ["admin"] })
    } catch {
      return Response.json(
        { error: "unauthorized" },
        { status: 401 }
      )
    }

    /* ---------- unwrap params ---------- */
    const { id } = await params
    const companyId = Number(id)

    /* ---------- validate id ---------- */
    if (Number.isNaN(companyId)) {
      return Response.json(
        { error: "invalid id" },
        { status: 400 }
      )
    }

    /* ---------- check if company exists ---------- */
    const company = await db.query.companies.findFirst({
      where: eq(companies.id, companyId)
    })

    if (!company) {
      return Response.json(
        { error: "company not found" },
        { status: 404 }
      )
    }

    /* ---------- check if already active ---------- */
    if (company.deletedAt === null) {
      return Response.json(
        { error: "company already active" },
        { status: 409 } // conflict
      )
    }

    /* ---------- restore company ---------- */
    await db
      .update(companies)
      .set({ deletedAt: null })
      .where(eq(companies.id, companyId))

    /* ---------- success ---------- */
    return Response.json(
      {
        success: true,
        message: "company re-activated"
      },
      { status: 200 }
    )

  } catch (error) {
    console.error(error)

    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }
}