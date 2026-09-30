import { UserRole } from "@/db/schema";
import { FRONTEND_PERMISSIONS } from "./frontendPermissions";

export function canAccessRoute(
  pathname: string,
  role: UserRole,
) {
  const matchingRoutes =
    FRONTEND_PERMISSIONS.filter(
      (route) =>
        pathname === route.path ||
        pathname.startsWith(
          `${route.path}/`,
        ),
    );

  if (matchingRoutes.length === 0) {
    return true;
  }

  const route = matchingRoutes.reduce(
    (mostSpecific, current) =>
      current.path.length >
        mostSpecific.path.length
        ? current
        : mostSpecific,
  );

  return route.roles.includes(role);
}