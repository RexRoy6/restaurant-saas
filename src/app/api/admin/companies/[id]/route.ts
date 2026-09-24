import { db } from "@/db"
import { companies } from "@/db/schema"
import { requireAuth } from "@/lib/auth/requireAuth"
import { eq } from "drizzle-orm"

/* ---------- GET ONE (aunque esté desactivada) ---------- */


export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // params is a Promise
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


    // unwrap params
    const { id } = await params

    const companyId = Number(id)

    /* ---------- validate id ---------- */
    if (Number.isNaN(companyId)) {
      return Response.json(
        { error: "invalid id" },
        { status: 400 }
      )
    }

    /* ---------- query ---------- */
    const company = await db.query.companies.findFirst({
      where: eq(companies.id, companyId),
    })

    if (!company) {
      return Response.json(
        { error: "not found" },
        { status: 404 }
      )
    }

    return Response.json(company)

  } catch (error) {
    console.error(error)

    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }
}

/* ---------- DELETE = soft delete ---------- */

export async function DELETE(
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

    if (Number.isNaN(companyId)) {
      return Response.json(
        { error: "invalid id" },
        { status: 400 }
      )
    }

    /* ---------- check company exists ---------- */
    const company = await db.query.companies.findFirst({
      where: eq(companies.id, companyId),
    })

    if (!company) {
      return Response.json(
        { error: "company not found" },
        { status: 404 }
      )
    }

    /* ---------- already deleted ---------- */
    if (company.deletedAt) {
      return Response.json(
        { error: "company already deleted" },
        { status: 409 } // conflict
      )
    }

    /* ---------- soft delete ---------- */
    await db
      .update(companies)
      .set({ deletedAt: new Date() })
      .where(eq(companies.id, companyId))

    return Response.json({
      success: true,
      message: "company deactivated",
    })

  } catch (error) {
    console.error(error)

    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }
}

//reactivar
/* ---------- PATCH = reactivate company ---------- */

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    /* ---------- AUTH ---------- */
    try {
      await requireAuth({ roles: ["admin"] })
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

    /* ---------- check company exists ---------- */
    const company = await db.query.companies.findFirst({
      where: eq(companies.id, companyId),
    })

    if (!company) {
      return Response.json(
        { error: "company not found" },
        { status: 404 }
      )
    }

    /* ---------- already active ---------- */
    if (!company.deletedAt) {
      return Response.json(
        { error: "company already active" },
        { status: 409 }
      )
    }

    /* ---------- reactivate ---------- */
    await db
      .update(companies)
      .set({ deletedAt: null })
      .where(eq(companies.id, companyId))

    const updatedCompany = await db.query.companies.findFirst({
      where: eq(companies.id, companyId),
    })

    return Response.json(updatedCompany)
  } catch (error) {
    console.error(error)

    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }
}