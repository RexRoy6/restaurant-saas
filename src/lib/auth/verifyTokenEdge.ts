import { jwtVerify, JWTPayload } from "jose"
import { UserRole } from "@/db/schema"

export interface AuthTokenPayload extends JWTPayload {
  userId: number
  companyId: number | null
  role: UserRole
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined")
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function verifyTokenEdge(
  token: string
): Promise<AuthTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, secret)

    return payload as AuthTokenPayload // 🔥 clave

  } catch {
    throw new Error("Invalid token")
  }
}