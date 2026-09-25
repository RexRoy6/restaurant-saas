import { NextResponse } from "next/server";
import { products } from "@/db/schema";
import { requireAuth } from "@/lib/auth/requireAuth";
import { tenantDb } from "@/lib/db/tenantDb";

export async function GET() {
    try {
        const auth = await requireAuth({
            roles: ["owner"],
        });

        if (auth.companyId === null) {
            return NextResponse.json(
                { error: "Tenant required" },
                { status: 403 },
            );
        }

        const tenant = await tenantDb();

        const productList = await tenant.findMany(products);

        return NextResponse.json(productList);
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Internal server error";

        if (message.startsWith("Unauthorized")) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        if (message === "Forbidden") {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 },
            );
        }

        console.error("GET /api/products error:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

function isDuplicateEntryError(
    error: unknown,
): boolean {
    if (
        typeof error !== "object" ||
        error === null
    ) {
        return false;
    }

    const possibleError = error as {
        code?: string;
        cause?: {
            code?: string;
        };
    };

    return (
        possibleError.code === "ER_DUP_ENTRY" ||
        possibleError.cause?.code === "ER_DUP_ENTRY"
    );
}

export async function POST(request: Request) {
    try {
        const auth = await requireAuth({
            roles: ["owner"],
        });

        if (auth.companyId === null) {
            return NextResponse.json(
                { error: "Tenant required" },
                { status: 403 },
            );
        }

        const body = await request.json();

        const name =
            typeof body.name === "string"
                ? body.name.trim()
                : "";

        const sku =
            typeof body.sku === "string"
                ? body.sku.trim()
                : "";

        const priceInCents = body.priceInCents;

        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 },
            );
        }

        if (!sku) {
            return NextResponse.json(
                { error: "SKU is required" },
                { status: 400 },
            );
        }

        if (
            typeof priceInCents !== "number" ||
            !Number.isInteger(priceInCents) ||
            priceInCents < 0
        ) {
            return NextResponse.json(
                {
                    error:
                        "priceInCents must be a non-negative integer",
                },
                { status: 400 },
            );
        }

        const tenant = await tenantDb();

        await tenant.insert(products, {
            name,
            sku,
            priceInCents,
        });

        return NextResponse.json(
            {
                message: "Product created successfully",
            },
            { status: 201 },
        );
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Internal server error";

        if (message.startsWith("Unauthorized")) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        if (message === "Forbidden") {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 },
            );
        }

        console.error("POST /api/products error:", error);

        if (isDuplicateEntryError(error)) {
            return NextResponse.json(
                {
                    error:
                        "A product with this SKU already exists",
                },
                { status: 409 },
            );
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}