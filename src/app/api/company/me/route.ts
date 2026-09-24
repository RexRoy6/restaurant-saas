import { requireAuth } from "@/lib/auth/requireAuth"
import { db } from "@/db"

import {
  users,
  companies
} from "@/db/schema"

import { eq } from "drizzle-orm"

export async function GET() {

  try {

    const auth = await requireAuth({
      roles: ["admin","owner", "employee"]
    })

    const { userId, companyId } = auth

    const data = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        companyId: users.companyId,
        companyName: companies.name
      })
      .from(users)
      .leftJoin(
        companies,
        eq(users.companyId, companies.id)
      )
      .where(eq(users.id, userId))
      .limit(1)

    const user = data[0]

    if (!user) {
      return Response.json(
        { error: "user not found" },
        { status: 404 }
      )
    }

    return Response.json(user)

  } catch (error) {

    console.error(error)

    return Response.json(
      { error: "unauthorized" },
      { status: 401 }
    )

  }

}