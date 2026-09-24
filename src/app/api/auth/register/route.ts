import { NextResponse } from "next/server"
import { db } from "@/db"
import { companies, users } from "@/db/schema"
import { hashPassword } from "@/lib/auth/password"
import { signToken } from "@/lib/auth/jwt"

export async function POST(req:Request){

  const { email,password,companyName } = await req.json()

  if(!email || !password || !companyName){
    return NextResponse.json(
      {error:"missing fields"},
      {status:400}
    )
  }

  const passwordHash = await hashPassword(password)

  /* crear company */
  const [company] = await db.insert(companies)
    .values({ name:companyName })
    .$returningId()

  /* crear owner user */
  const [user] = await db.insert(users)
    .values({
      email,
      passwordHash,
      role:"owner",
      companyId:company.id
    })
    .$returningId()

  /* crear token */
const token = await signToken({
  userId: user.id,
  companyId: company.id,
  role: "owner"
})

  return NextResponse.json({token})
}