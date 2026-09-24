import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth/jwt"
import { isValidRole } from "@/lib/auth/roleUtils"
import { UserRole, companies, users } from "@/db/schema"
import { db } from "@/db"
import { eq } from "drizzle-orm"

export type AuthContext = {
  userId: number
  companyId: number | null
  role: UserRole
}

export async function getAuthContext(): Promise<AuthContext| null> {
  /* ---------- leer token desde cookie ---------- */
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    //throw new Error("Unauthorized: no token")
    return null
  }

  try {
    /* ---------- verificar JWT ---------- */
    const payload = await verifyToken(token)

    const parsedUserId = Number(payload.userId)
    const parsedCompanyId = payload.companyId
      ? Number(payload.companyId)
      : null

    if (isNaN(parsedUserId)) {
      throw new Error("Invalid auth context")
    }

    /* ---------- validar role ---------- */
    if (!payload.role || !isValidRole(payload.role)) {
      throw new Error("Invalid role")
    }

    /* ---------- verificar usuario activo ---------- */

    const user = await db.query.users.findFirst({
      where: eq(users.id, parsedUserId),
      columns: { deletedAt: true }
    })

    if (!user) {
      throw new Error("Unauthorized: user not found")
    }

    if (user.deletedAt !== null) {
      throw new Error("Unauthorized: user disabled")
    }
    //
    /* ---------- verificar usuario activo ---------- */

    //
    /* ---------- verificar company activa ---------- */

    if (parsedCompanyId !== null) {
      const company = await db.query.companies.findFirst({
        where: eq(companies.id, parsedCompanyId),
        columns: {
          deletedAt: true
        }
      })

      if (!company) {
        throw new Error("Unauthorized: company not found")
      }

      if (company.deletedAt !== null) {
        throw new Error("Unauthorized: company disabled")
      }
    }

    //

    return {
      userId: parsedUserId,
      companyId: parsedCompanyId,
      role: payload.role
    }

  } catch {
    throw new Error("Unauthorized: invalid token")
  }
}