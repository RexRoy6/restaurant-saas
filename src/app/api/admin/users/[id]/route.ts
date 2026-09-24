import { db } from "@/db"
import { users } from "@/db/schema"
import { requireAuth } from "@/lib/auth/requireAuth"
import { eq, and, isNull } from "drizzle-orm"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        /* ---------- AUTH ---------- */
        await requireAuth({ roles: ["admin"] })

        /* ---------- unwrap params ---------- */
        const { id } = await params
        const userId = Number(id)

        if (Number.isNaN(userId)) {
            return Response.json(
                { error: "invalid user id" },
                { status: 400 }
            )
        }

        /* ---------- query one user ---------- */
        const user = await db.query.users.findFirst({
            where: and(
                eq(users.id, userId),
                isNull(users.deletedAt)
            ),
            columns: {
                id: true,
                companyId: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            }
        })

        if (!user) {
            return Response.json(
                { error: "user not found" },
                { status: 404 }
            )
        }

        return Response.json(user)

    } catch (error) {
        console.error(error)

        return Response.json(
            { error: "internal server error" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        let auth

        auth = await requireAuth({ roles: ["admin"] })

        /* ---------- unwrap params ---------- */
        const { id } = await params
        const userId = Number(id)
        if (Number.isNaN(userId)) {
            return Response.json(
                { error: "invalid user id" },
                { status: 400 }
            )
        }
        /* ---------- check user exists ---------- */
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        })

        if (!user) {
            return Response.json(
                { error: "user not found" },
                { status: 404 }
            )
        }

        /* ---------- already deleted ---------- */
        if (user.deletedAt) {
            return Response.json(
                { error: "user already deleted" },
                { status: 409 } // conflict
            )
        }

        /* ---------- soft delete ---------- */
        await db
            .update(users)
            .set({ deletedAt: new Date() })
            .where(eq(users.id, userId))

        return Response.json({
            success: true,
            message: "user deactivated",
        })

    } catch (error) {
        console.error(error)

        return Response.json(
            { error: "internal server error" },
            { status: 500 }
        )
    }

}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    /* ---------- AUTH ---------- */
    await requireAuth({ roles: ["admin"] });

    /* ---------- params ---------- */
    const { id } = await params;
    const userId = Number(id);

    if (Number.isNaN(userId)) {
      return Response.json(
        { error: "invalid user id" },
        { status: 400 }
      );
    }

    /* ---------- find user ---------- */
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return Response.json(
        { error: "user not found" },
        { status: 404 }
      );
    }

    /* ---------- query params ---------- */
    const { searchParams } = new URL(req.url);
    const reactivate = searchParams.get("reactivate");

    /* ===================================================== */
    /* 🔁 REACTIVATE USER */
    /* ===================================================== */
    if (reactivate === "true") {
      if (user.deletedAt === null) {
        return Response.json(
          { error: "user already active" },
          { status: 409 }
        );
      }

      await db
        .update(users)
        .set({ deletedAt: null })
        .where(eq(users.id, userId));

      return Response.json({
        message: "user reactivated",
      });
    }

    /* ===================================================== */
    /* ✏️ FUTURE: UPDATE USER */
    /* ===================================================== */

    return Response.json(
      { error: "nothing to update" },
      { status: 400 }
    );

  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}