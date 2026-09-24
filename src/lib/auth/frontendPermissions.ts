import { UserRole } from "@/db/schema"

export type RoutePermission = {
  path: string
  roles: UserRole[]
}

export const FRONTEND_PERMISSIONS = [
  {
    path: "/company",
    roles: ["owner"]
  },
  {
    path: "/company/settings",
    roles: ["owner"]
  }
]