
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import {
    products,
    modifierGroups,
    modifierOptions,
    productModifierGroups,
} from "@/db/schema";
import { requireAuth } from "@/lib/auth/requireAuth";
import { tenantDb } from "@/lib/db/tenantDb";

type RouteContext = {
    params: Promise<{ id: string }>;
};

function parseId(value: string): number | null {
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function isDuplicateError(error: unknown): boolean {
    if (!error || typeof error !== "object") return false;

    const e = error as {
        code?: string;
        cause?: { code?: string };
    };

    return (
        e.code === "ER_DUP_ENTRY" ||
        e.cause?.code === "ER_DUP_ENTRY"
    );
}

function handleError(error: unknown, operation: string) {
    const message =
        error instanceof Error ? error.message : "";

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

    if (isDuplicateError(error)) {
        return NextResponse.json(
            { error: "Modifier group is already assigned" },
            { status: 409 },
        );
    }

    console.error(`${operation} error:`, error);

    return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
    );
}

export async function GET(
    _request: Request,
    context: RouteContext,
) {
    try {
        const auth = await requireAuth({
            roles: ["owner", "employee"],
        });

        if (auth.companyId === null) {
            return NextResponse.json(
                { error: "Tenant required" },
                { status: 403 },
            );
        }

        const { id } = await context.params;
        const productId = parseId(id);

        if (productId === null) {
            return NextResponse.json(
                { error: "Invalid product id" },
                { status: 400 },
            );
        }

        const tenant = await tenantDb();

        const product = await tenant.findFirst(
            products,
            eq(products.id, productId),
        );

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 },
            );
        }

        const assignments = await tenant.findMany(
            productModifierGroups,
            eq(productModifierGroups.productId, productId),
        );

        const groups = await tenant.findMany(modifierGroups);
        const options = await tenant.findMany(modifierOptions);

        const activeGroups = new Map(
            groups.map((group) => [group.id, group]),
        );

        const result = assignments
            .map((assignment) => {
                const group = activeGroups.get(assignment.groupId);

                // Los grupos desactivados no se ofrecen
                // para pedidos nuevos.
                if (!group) return null;

                return {
                    assignmentId: assignment.id,
                    sortOrder: assignment.sortOrder,
                    group: {
                        ...group,
                        options: options
                            .filter(
                                (option) => option.groupId === group.id,
                            )
                            .sort(
                                (a, b) =>
                                    a.sortOrder - b.sortOrder ||
                                    a.id - b.id,
                            ),
                    },
                };
            })
            .filter(
                (item): item is NonNullable<typeof item> =>
                    item !== null,
            )
            .sort(
                (a, b) =>
                    a.sortOrder - b.sortOrder ||
                    a.assignmentId - b.assignmentId,
            );

        return NextResponse.json(result);
    } catch (error) {
        return handleError(
            error,
            "GET /api/products/[id]/modifier-groups",
        );
    }
}

export async function POST(
    request: Request,
    context: RouteContext,
) {
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

        const { id } = await context.params;
        const productId = parseId(id);

        if (productId === null) {
            return NextResponse.json(
                { error: "Invalid product id" },
                { status: 400 },
            );
        }

        let body: unknown;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid JSON body" },
                { status: 400 },
            );
        }

        if (
            typeof body !== "object" ||
            body === null ||
            Array.isArray(body)
        ) {
            return NextResponse.json(
                { error: "Request body must be an object" },
                { status: 400 },
            );
        }

        const data = body as Record<string, unknown>;

        const allowedFields = ["groupId", "sortOrder"];

        if (
            Object.keys(data).some(
                (key) => !allowedFields.includes(key),
            )
        ) {
            return NextResponse.json(
                { error: "Unknown request fields" },
                { status: 400 },
            );
        }

        const groupId = data.groupId;
        const sortOrder =
            data.sortOrder === undefined ? 0 : data.sortOrder;

        if (
            typeof groupId !== "number" ||
            !Number.isSafeInteger(groupId) ||
            groupId <= 0
        ) {
            return NextResponse.json(
                { error: "Valid groupId is required" },
                { status: 400 },
            );
        }

        if (
            typeof sortOrder !== "number" ||
            !Number.isSafeInteger(sortOrder) ||
            sortOrder < 0
        ) {
            return NextResponse.json(
                {
                    error:
                        "sortOrder must be a non-negative integer",
                },
                { status: 400 },
            );
        }

        const tenant = await tenantDb();

        const product = await tenant.findFirst(
            products,
            eq(products.id, productId),
        );

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 },
            );
        }

        const group = await tenant.findFirst(
            modifierGroups,
            eq(modifierGroups.id, groupId),
        );

        if (!group) {
            return NextResponse.json(
                { error: "Modifier group not found or inactive" },
                { status: 404 },
            );
        }

        // Incluye asociaciones desactivadas, pero
        // conserva el aislamiento por empresa.
        const existing = await tenant.findFirstRaw(
            productModifierGroups,
            eq(productModifierGroups.productId, productId),
        );

        // Buscamos específicamente el grupo solicitado,
        // sin confundirlo con otras asociaciones.
        const assignment = existing?.groupId === groupId
            ? existing
            : await tenant.findFirstRaw(
                productModifierGroups,
                eq(
                    productModifierGroups.groupId,
                    groupId,
                ),
            );

        // La búsqueda anterior por groupId puede encontrar
        // otro producto: comprobamos ambos identificadores.
        const matchingAssignment = await tenant.findFirstRaw(
            productModifierGroups,
            and(
                eq(productModifierGroups.productId, productId),
                eq(productModifierGroups.groupId, groupId),
            ),
        );

        if (matchingAssignment && !matchingAssignment.deletedAt) {
            return NextResponse.json(
                { error: "Modifier group is already assigned" },
                { status: 409 },
            );
        }

        if (matchingAssignment?.deletedAt) {
            await tenant.restore(
                productModifierGroups,
                eq(productModifierGroups.id, matchingAssignment.id),
            );

            await tenant.update(
                productModifierGroups,
                { sortOrder },
                eq(productModifierGroups.id, matchingAssignment.id),
            );

            return NextResponse.json({
                message: "Modifier group assignment restored successfully",
            });
        }

        await tenant.insert(productModifierGroups, {
            productId,
            groupId,
            sortOrder,
        });

        return NextResponse.json(
            {
                message: "Modifier group assigned successfully",
            },
            { status: 201 },
        );
    } catch (error) {
        return handleError(
            error,
            "POST /api/products/[id]/modifier-groups",
        );
    }
}