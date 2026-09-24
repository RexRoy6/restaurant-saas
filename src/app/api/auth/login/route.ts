import { NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { comparePassword } from "@/lib/auth/password"
import { signToken,verifyToken } from "@/lib/auth/jwt"

export async function POST(req:Request){

  const { email,password } = await req.json()

  const user = await db.query.users.findFirst({
    where:eq(users.email,email)
  })

  if(!user){
    return NextResponse.json({error:"invalid credentials"},{status:401})
  }

  const valid = await comparePassword(
    password,
    user.passwordHash
  )

  if(!valid){
    return NextResponse.json({error:"invalid credentials"},{status:401})
  }

if (!user.companyId && user.role !== "admin") {
  return NextResponse.json(
    { error: "User not assigned to company" },
    { status: 403 }
  )
}

const token = await signToken({
  userId: user.id,
  companyId: user.companyId,//aqui el admin deberia de poder ingresar sin compnay id
  role: user.role
})

const test = await verifyToken(token)

const res = NextResponse.json({ success: true, token})


res.cookies.set("auth_token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24
})

return res
}