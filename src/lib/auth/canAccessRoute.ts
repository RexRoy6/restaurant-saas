import { UserRole } from "@/db/schema"
import { FRONTEND_PERMISSIONS } from "./frontendPermissions"

export function canAccessRoute(
  pathname: string,
  role: UserRole
) {

  const route = FRONTEND_PERMISSIONS.find(
    route => route.path === pathname
  )

  if (!route) {
    return true
  }

  return route.roles.includes(role)
}