
import "server-only";

import { requireAuth } from "@/lib/auth/requireAuth";

import {
  validateCompanyPublicInfo,
  type CompanyPublicInfoInput,
} from "./validation";

import { writeCompanyPublicInfo } from "./repository";

export async function updateCompanyPublicInfo(
  input: unknown,
): Promise<CompanyPublicInfoInput> {
  const auth = await requireAuth({
    roles: ["owner"],
  });

  if (auth.companyId === null) {
    throw new Error("Forbidden");
  }

  const validatedInput = validateCompanyPublicInfo(input);

  return writeCompanyPublicInfo(
    auth.companyId,
    validatedInput,
  );
}
