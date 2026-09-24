import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { comparePassword, hashPassword } from "@/lib/auth/password"
import { requireAuth } from "@/lib/auth/requireAuth"

export async function PATCH(req: NextRequest) {
    try {
        //  1. Validar usuario autenticado
        const auth = await requireAuth()

        const { currentPassword, newPassword } = await req.json()

        //  2. Validaciones básicas
        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: "Missing fields" },
                { status: 400 }
            )
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            )
        }

        //  3. Obtener usuario
        const user = await db.query.users.findFirst({
            where: eq(users.id, auth.userId)
        })

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        //  4. Validar contraseña actual
        const isValid = await comparePassword(
            currentPassword,
            user.passwordHash
        )

        if (!isValid) {
            return NextResponse.json(
                { error: "Current password is incorrect" },
                { status: 401 }
            )
        }

        //  5. Hashear nueva contraseña
        const newHash = await hashPassword(newPassword)

        //  6. Guardar en DB
        await db
            .update(users)
            .set({
                passwordHash: newHash,
                passwordChangedAt: new Date(),
                updatedAt: new Date()
            })
            .where(eq(users.id, auth.userId))

        return NextResponse.json({
            success: true,
            message: "Password updated successfully"
        })

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Internal error" },
            { status: 500 }
        )
    }
}