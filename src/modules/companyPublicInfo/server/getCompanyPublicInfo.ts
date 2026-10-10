
import "server-only";

import { requireAuth } from "@/lib/auth/requireAuth";

import {
  readCompanyPublicInfo,
  type CompanyPublicInfoSettings,
} from "./repository";

export type { CompanyPublicInfoSettings };

export async function getCompanyPublicInfo():
  Promise<CompanyPublicInfoSettings> {
  const auth = await requireAuth({
    roles: ["owner"],
  });

  if (auth.companyId === null) {
    throw new Error("Forbidden");
  }

  return readCompanyPublicInfo(auth.companyId);
}
