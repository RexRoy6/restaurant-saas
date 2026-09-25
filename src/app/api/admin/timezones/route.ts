import { db } from "@/db";
import { timezones } from "@/db/schema";
import { asc,sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/requireAuth";

export async function GET() {
  try {
    await requireAuth({ roles: ["admin"] });

    const data = await db
      .select({
        id: timezones.id,
        name: timezones.name,
        label: timezones.label,
      })
      .from(timezones)
      .orderBy(asc(timezones.label));

    return Response.json(data);
  } catch {
    return Response.json(
      { error: "unauthorized" },
      { status: 401 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireAuth({ roles: ["admin"] });

    const body = await req.json();

    /* ---------- validate body ---------- */

    if (!Array.isArray(body) || body.length === 0) {
      return Response.json(
        { error: "body must be a non-empty array" },
        { status: 400 },
      );
    }

    for (const timezone of body) {
      if (
        typeof timezone.name !== "string" ||
        typeof timezone.label !== "string" ||
        !timezone.name.trim() ||
        !timezone.label.trim()
      ) {
        return Response.json(
          {
            error: "each timezone must have a valid name and label",
          },
          { status: 400 },
        );
      }
    }

    /* ---------- insert timezones ---------- */

    const data = body.map((timezone) => ({
      name: timezone.name.trim(),
      label: timezone.label.trim(),
    }));

    await db
  .insert(timezones)
  .values(data)
  .onDuplicateKeyUpdate({
    set: {
      label: sql`VALUES(${timezones.label})`,
    },
  });

    return Response.json(
      {
        message: "Timezones created",
        count: data.length,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("create-timezones error:", error);

    return Response.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}