import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth/jwt"
import { verifyTokenEdge } from "@/lib/auth/verifyTokenEdge"
import { checkPermission } from "@/lib/auth/checkPermission"
import { RBAC_CONFIG } from "@/lib/auth/rbacConfig"

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  if (req.method === "OPTIONS" || req.method === "HEAD") {
    return NextResponse.next()
  }


  /* ---------- bootstrap bypass ---------- */
  if (pathname === "/api/admin/create-admin") {
    return NextResponse.next()
  }

  /* ---------- auth routes libres ---------- */
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  /* ---------- cookie OR Authorization header ---------- */
  const cookieToken = req.cookies.get("auth_token")?.value

  const authHeader = req.headers.get("authorization")
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null

  const token = cookieToken || headerToken

  if (!token) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401 }
    )
  }
//implementar esto despues
//   if (!token && pathname.startsWith("/admin")) {
//   return NextResponse.redirect(new URL("/", req.url))
// }


  try {

    let payload
    try {
     // payload = await verifyToken(token)
     //verifyTokenEdge
     payload = await verifyTokenEdge(token)

    } catch {
      return NextResponse.json({ error: "invalid token" }, { status: 401 })
    }

    //logs
    // if (process.env.NODE_ENV === "development") {
    //   console.log("ROLE TYPE:", typeof payload.role)
    //   console.log("ROLE VALUE:", payload.role)
    //   console.log("IS VALID ROLE:", ["admin", "owner", "user"].includes(payload.role))
    //   console.log("TEST RBAC_CONFIG:", JSON.stringify(RBAC_CONFIG, null, 2))
    // }
    //logs

    const allowed = checkPermission(pathname, req.method, payload.role)

    if (!allowed) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    /* ---------- inyectar headers ---------- */
    const requestHeaders = new Headers(req.headers)

    requestHeaders.set("x-user-id", String(payload.userId))
    requestHeaders.set("x-role", String(payload.role))

    // ✅ SOLO enviar companyId si existe (admin puede ser null)
    if (payload.companyId !== null) {
      requestHeaders.set("x-company-id", String(payload.companyId))
    }

    return NextResponse.next({
      request: { headers: requestHeaders }
    })

  } catch {
    return NextResponse.json(
      { error: "invalid token" },
      { status: 401 }
    )
  }
}

export const config = {
  matcher: ["/api/:path*"]
}