import { db } from "@/db";
import { companies } from "@/db/schema";
import { isNull } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/requireAuth";

/* ---------- GET: solo activas ---------- */
export async function GET() {
  const auth = await requireAuth()
  try {
    /* ---------- AUTH ---------- */
    let auth;
    try {
      auth = await requireAuth({ roles: ["admin"] });
    } catch {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }

    const data = await db.select().from(companies);
    // .where(isNull(companies.deletedAt));

    return Response.json(data);
  } catch {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
}

/* ---------- POST: crear ---------- */
export async function POST(req: Request) {
  let body;
const auth = await requireAuth()
  // Check if valid JSON body exists
  try {
    /* ---------- AUTH ---------- */
    let auth;
    try {
      auth = await requireAuth({ roles: ["admin"] });
    } catch {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
      return Response.json(
        { error: "Content-Type must be application/json" },
        { status: 400 },
      );
    }

    body = await req.json();
  } catch {
    return Response.json(
      { error: "invalid or missing JSON body" },
      { status: 400 },
    );
  }

  const { name } = body ?? {};

  if (!name?.trim()) {
    return Response.json({ error: "name required" }, { status: 400 });
  }

  try {
    const result = await db
      .insert(companies)
      .values({
        name: name.trim(),
      })
      .$returningId();

    return Response.json(result);
  } catch (error) {
    console.error(error);

    return Response.json({ error: "database error" }, { status: 500 });
  }
}
