import { UserRole } from "@/db/schema";

export type RoutePermission = {
  path: string;
  roles: UserRole[];
};

export const FRONTEND_PERMISSIONS: RoutePermission[] = [
  {
    path: "/company",
    roles: ["owner"],
  },
  {
    path: "/company/orders",
    roles: ["owner","employee"],//aqui se agregaria employee
  },
  {
    path: "/company/products",
    roles: ["owner"],
  },
  {
    path: "/company/settings",
    roles: ["owner"],
  },
];