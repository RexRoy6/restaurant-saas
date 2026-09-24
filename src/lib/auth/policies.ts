import { AuthContext } from "./getAuthContext"

export function canAccessCompanyResource(
  auth: AuthContext,
  resourceCompanyId: number
) {
  if (auth.role === "admin") return true

  return auth.companyId === resourceCompanyId
}