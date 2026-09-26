import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/requireAuth";

type RequestedItem = {
    productId: number;
    quantity: number;
};

function parseItems(body: unknown): RequestedItem[] | null {
    if (
        typeof body !== "object" ||
        body === null ||
        !("items" in body) ||
        !Array.isArray(body.items) ||
        body.items.length === 0
    ) {
        return null;
    }

    const consolidated = new Map<number, number>();

    for (const item of body.items) {
        if (
            typeof item !== "object" ||
            item === null ||
            !("productId" in item) ||
            !("quantity" in item)
        ) {
            return null;
        }

        const productId = item.productId;
        const quantity = item.quantity;

        if (
            typeof productId !== "number" ||
            !Number.isInteger(productId) ||
            productId <= 0 ||
            typeof quantity !== "number" ||
            !Number.isInteger(quantity) ||
            quantity <= 0
        ) {
            return null;
        }

        // consolidated.set(
        //   productId,
        //   (consolidated.get(productId) ?? 0) + quantity,
        // );
        const currentQuantity =
            consolidated.get(productId) ?? 0;

        const consolidatedQuantity =
            currentQuantity + quantity;

        if (!Number.isSafeInteger(consolidatedQuantity)) {
            return null;
        }

        consolidated.set(
            productId,
            consolidatedQuantity,
        );

    }

    return Array.from(
        consolidated,
        ([productId, quantity]) => ({
            productId,
            quantity,
        }),
    );
}
export async function POST(
  request: Request,
  context: {
    params: Promise<{
      checkId: string;
    }>;
  },
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

    const { checkId: checkIdParam } =
      await context.params;

    const checkId = Number(checkIdParam);

    if (
      !Number.isInteger(checkId) ||
      checkId <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid checkId" },
        { status: 400 },
      );
    }

    const body = await request.json();

    const items = parseItems(body);

    if (!items) {
      return NextResponse.json(
        {
          error:
            "items must contain valid productId and quantity values",
        },
        { status: 400 },
      );
    }

    /*
     * TEMPORAL:
     * En el siguiente paso sustituiremos esto
     * por la transacción real.
     */
    return NextResponse.json({
      checkId,
      items,
    });
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

    console.error(
      "POST /api/checks/[checkId]/orders error:",
      error,
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}