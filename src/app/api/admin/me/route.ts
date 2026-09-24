import { requireAuth } from "@/lib/auth/requireAuth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    /* ---------- AUTH ---------- */
    let auth
    try {
      //auth = await requireAuth()
      auth = await requireAuth({ roles: ["admin"] })
    } catch {
      return Response.json(
        { error: "unauthorized" },
        { status: 401 }
      )
    }

    const userId = auth.userId

    /* ---------- QUERY ---------- */
    const data = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    const user = data[0]

    /* ---------- NOT FOUND ---------- */
    if (!user) {
      return Response.json(
        { error: "user not found" },
        { status: 404 }
      )
    }

    /* ---------- SUCCESS ---------- */
    return Response.json(user)

  } catch (error) {
    console.error("GET /user error:", error)

    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }
}