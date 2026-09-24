import { RBAC_CONFIG } from "./rbacConfig"
import { UserRole } from "@/db/schema"

export function checkPermission(
  pathname: string,
  method: string,
  role: UserRole
) {

  if (process.env.NODE_ENV === "development") {
    console.log("---- CHECK PERMISSION ----")
    console.log("pathname:", pathname)
    console.log("method:", method)
    console.log("role:", role)
  }

  for (const route of RBAC_CONFIG) {
    //console.log("checking route:", route.pattern)

    // ✅ SAFE regex match
    const regex = new RegExp(`^${route.pattern}$`)
    const isMatch = regex.test(pathname)

    if (!isMatch) continue

    //console.log("route matched!")

    const allowedRoles = route.methods[method.toUpperCase()]

    if (!allowedRoles) {
      console.log("method not allowed")
      return false
    }

    console.log("allowed roles:", allowedRoles)

    return allowedRoles.includes(role)
  }

  console.log("no RBAC rule found")
  return false
}