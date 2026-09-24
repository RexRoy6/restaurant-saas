import { USER_ROLES, UserRole } from "@/db/schema"

export function isValidRole(role: string): role is UserRole {
  return USER_ROLES.includes(role as UserRole)
}