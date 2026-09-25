import { db } from "@/db";
import { companies, timezones } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/requireAuth";

/**
 * Convierte el nombre de una empresa en un slug.
 *
 * Ejemplo:
 *
 * "Café Central" -> "cafe-central"
 * "Coffee & Friends" -> "coffee-friends"
 */
function createBaseSlug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Genera un slug único.
 *
 * cafe-central
 * cafe-central-2
 * cafe-central-3
 * ...
 */
async function generateUniqueSlug(name: string) {
  const baseSlug = createBaseSlug(name);

  if (!baseSlug) {
    throw new Error("INVALID_SLUG");
  }

  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await db
      .select({
        id: companies.id,
      })
      .from(companies)
      .where(eq(companies.slug, slug))
      .limit(1);

    if (!existing.length) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }
}

/* ---------- GET ---------- */

export async function GET() {
  try {
    try {
      await requireAuth({ roles: ["admin"] });
    } catch {
      return Response.json(
        { error: "unauthorized" },
        { status: 401 },
      );
    }

    const data = await db
      .select()
      .from(companies);

    return Response.json(data);
  } catch {
    return Response.json(
      { error: "forbidden" },
      { status: 403 },
    );
  }
}

/* ---------- POST: crear ---------- */

export async function POST(req: Request) {
  /**
   * AUTH
   */
  try {
    await requireAuth({ roles: ["admin"] });
  } catch {
    return Response.json(
      { error: "unauthorized" },
      { status: 401 },
    );
  }

  /**
   * CONTENT TYPE
   */
  const contentType = req.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return Response.json(
      {
        error: "Content-Type must be application/json",
      },
      { status: 400 },
    );
  }

  /**
   * BODY
   */
  let body;

  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: "invalid or missing JSON body" },
      { status: 400 },
    );
  }

  const {
    name,
    timezoneId,
  } = body ?? {};

  /**
   * VALIDATE NAME
   */
  if (
    typeof name !== "string" ||
    !name.trim()
  ) {
    return Response.json(
      { error: "name required" },
      { status: 400 },
    );
  }

  /**
   * VALIDATE TIMEZONE ID
   */
  const parsedTimezoneId = Number(timezoneId);

  if (
    !Number.isInteger(parsedTimezoneId) ||
    parsedTimezoneId <= 0
  ) {
    return Response.json(
      { error: "valid timezoneId required" },
      { status: 400 },
    );
  }

  try {
    /**
     * Verify timezone exists.
     */
    const timezone = await db
      .select({
        id: timezones.id,
      })
      .from(timezones)
      .where(
        eq(timezones.id, parsedTimezoneId),
      )
      .limit(1);

    if (!timezone.length) {
      return Response.json(
        { error: "timezone not found" },
        { status: 400 },
      );
    }

    /**
     * Generate public slug.
     */
    const cleanName = name.trim();

    const slug = await generateUniqueSlug(
      cleanName,
    );

    /**
     * Create company.
     *
     * currency is omitted because the DB default is MXN.
     */
    const result = await db
      .insert(companies)
      .values({
        name: cleanName,
        slug,
        timezoneId: parsedTimezoneId,
      })
      .$returningId();

    return Response.json(result);
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "INVALID_SLUG"
    ) {
      return Response.json(
        {
          error:
            "company name cannot generate a valid slug",
        },
        { status: 400 },
      );
    }

    return Response.json(
      { error: "database error" },
      { status: 500 },
    );
  }
}