import { redirect } from "next/navigation"

import { getAuthContext } from "@/lib/auth/getAuthContext"
import { UserRole } from "@/db/schema"

export async function requireRole(
  allowedRoles: UserRole[]
) {
  const auth = await getAuthContext()

  if (!auth) {
    redirect("/")
  }

  if (!allowedRoles.includes(auth.role)) {
    redirect("/unauthorized")
  }

  return auth
}