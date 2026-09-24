import { db } from "@/db"
import { users } from "@/db/schema"
import { hashPassword } from "@/lib/auth/password"
import { requireAuth } from "@/lib/auth/requireAuth"
import { eq } from "drizzle-orm"

export async function POST(req: Request) {
  const auth = await requireAuth()
  try {
    const { email, password } = await req.json()

    /* ---------- validate fields ---------- */

    if (!email || !password) {
      return Response.json(
        { error: "missing fields" },
        { status: 400 }
      )
    }

    if (!email.includes("@")) {
      return Response.json(
        { error: "invalid email" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return Response.json(
        { error: "password must be at least 6 characters" },
        { status: 400 }
      )
    }

    /* ---------- check if email already exists ---------- */

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    })

    if (existingUser) {
      return Response.json(
        { error: "user already exists" },
        { status: 409 }
      )
    }

    /* ---------- check if any admin exists ---------- */

    const existingAdmin = await db.query.users.findFirst({
      where: eq(users.role, "admin")
    })

    /*
      ⭐ BOOTSTRAP MODE
      If no admin exists → require bootstrap secret
    */
    if (!existingAdmin) {
      const bootstrapSecret = req.headers.get("x-bootstrap-secret")

      if (bootstrapSecret !== process.env.ADMIN_BOOTSTRAP_SECRET) {
        return Response.json(
          { error: "invalid bootstrap secret" },
          { status: 403 }
        )
      }
    }

    /*
      ⭐ NORMAL MODE
      If admin exists → must be authenticated admin
    */
    if (existingAdmin) {
      try {
        await requireAuth({ roles: ["admin"] })
      } catch {
        return Response.json(
          { error: "forbidden" },
          { status: 403 }
        )
      }
    }

    /* ---------- create admin ---------- */

    const passwordHash = await hashPassword(password)

    const [admin] = await db.insert(users)
      .values({
        email,
        passwordHash,
        role: "admin",
        companyId: null
      })
      .$returningId()

    return Response.json({
      message: existingAdmin
        ? "Admin created"
        : "First admin created",
      admin
    })

  } catch (error) {
    console.error("create-admin error:", error)

    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    )
  }
}