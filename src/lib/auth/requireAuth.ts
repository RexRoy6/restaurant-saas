import { getAuthContext } from "@/lib/auth/getAuthContext"
import { UserRole } from "@/db/schema"

export type RequireAuthOptions = {
  roles?: UserRole[]
}

export type AuthContext = {
  userId: number
  companyId: number | null
  role: UserRole
}

export async function requireAuth(
  options?: RequireAuthOptions
): Promise<AuthContext> {
  const auth = await getAuthContext()

  if (!auth) {
    throw new Error("Unauthorized")

  }

  if (options?.roles?.length && !options.roles.includes(auth.role)) {
    throw new Error("Forbidden")
  }

  return auth as Readonly<typeof auth>
}