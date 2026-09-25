import { db } from "@/db";
import { timezones } from "@/db/schema";
import { asc } from "drizzle-orm";
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