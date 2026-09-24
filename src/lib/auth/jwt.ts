import { SignJWT, jwtVerify, JWTPayload } from "jose"
import { UserRole,users } from "@/db/schema"
import { db } from "@/db"
import { eq } from "drizzle-orm"

/* ---------- ENV VALIDATION ---------- */

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined")
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

/* ---------- TOKEN TYPE ---------- */

export interface AuthTokenPayload extends JWTPayload {
  userId: number
  companyId: number | null
  role: UserRole
}

/* ---------- SIGN ---------- */

export async function signToken(payload: AuthTokenPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")//era 7
    .sign(secret)
}

/* ---------- VERIFY ---------- */

// export async function verifyToken(token: string): Promise<AuthTokenPayload> {
//   try {
//     const { payload } = await jwtVerify(token, secret)
//     return payload as AuthTokenPayload
//   } catch {
//     throw new Error("Invalid token")
//   }
// }
export async function verifyToken(token: string): Promise<AuthTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, secret)

    const auth = payload as AuthTokenPayload

    // 🔥 traer usuario real
    const user = await db.query.users.findFirst({
      where: eq(users.id, auth.userId)
    })

    if (!user) {
      throw new Error("User not found")
    }

    // 🔐 invalidar token si cambió password
    if (
      user.passwordChangedAt &&
      payload.iat &&
      payload.iat * 1000 < user.passwordChangedAt.getTime()
    ) {
      throw new Error("Token expired due to password change")
    }

    return auth

  } catch {
    throw new Error("Invalid token")
  }
}