import { NextResponse } from "next/server";
import {
  eq,
  inArray,
} from "drizzle-orm";

import { db } from "@/db";
import {
  categories,
  checks,
  orderItems,
  orders,
  products,
} from "@/db/schema";

import { requireAuth } from "@/lib/auth/requireAuth";
import { tenantDb } from "@/lib/db/tenantDb";
import {
  ModifierValidationError,
  validateOrderModifiers,
} from "@/modules/orders/server/validateOrderModifiers";

// type RequestedItem = {
//   productId: number;
//   quantity: number;
// };
type RequestedItem = {
  productId: number;
  quantity: number;
  modifierOptionIds: number[];
};

// /*
//  * ============================================
//  * REQUEST PARSER
//  * ============================================
//  *
//  * El frontend únicamente controla:
//  *
//  * - productId
//  * - quantity
//  *
//  * Precio, nombre, SKU, categoría y subtotales
//  * siempre son determinados por el backend.
//  */
// function parseItems(
//   body: unknown,
// ): RequestedItem[] | null {
//   if (
//     typeof body !== "object" ||
//     body === null ||
//     !("items" in body) ||
//     !Array.isArray(body.items) ||
//     body.items.length === 0
//   ) {
//     return null;
//   }

//   const consolidated =
//     new Map<number, number>();

//   for (const item of body.items) {
//     if (
//       typeof item !== "object" ||
//       item === null ||
//       !("productId" in item) ||
//       !("quantity" in item)
//     ) {
//       return null;
//     }

//     const productId = item.productId;
//     const quantity = item.quantity;

//     if (
//       typeof productId !== "number" ||
//       !Number.isInteger(productId) ||
//       productId <= 0 ||
//       typeof quantity !== "number" ||
//       !Number.isInteger(quantity) ||
//       quantity <= 0
//     ) {
//       return null;
//     }

//     /*
//      * Si el mismo producto aparece varias veces,
//      * consolidamos sus cantidades.
//      */
//     const currentQuantity =
//       consolidated.get(productId) ?? 0;

//     const consolidatedQuantity =
//       currentQuantity + quantity;

//     if (
//       !Number.isSafeInteger(
//         consolidatedQuantity,
//       )
//     ) {
//       return null;
//     }

//     consolidated.set(
//       productId,
//       consolidatedQuantity,
//     );
//   }

//   return Array.from(
//     consolidated,
//     ([productId, quantity]) => ({
//       productId,
//       quantity,
//     }),
//   );
// }

/**
 * Valida la estructura de los artículos solicitados.
 *
 * IMPORTANTE:
 * Aquí solamente validamos los tipos y formatos.
 *
 * La existencia, disponibilidad, pertenencia
 * y reglas de los modificadores se validarán
 * posteriormente dentro de la transacción.
 */
function parseItems(
  body: unknown,
): RequestedItem[] | null {
  if (
    typeof body !== "object" ||
    body === null ||
    !("items" in body) ||
    !Array.isArray(body.items) ||
    body.items.length === 0
  ) {
    return null;
  }

  const result: RequestedItem[] = [];

  for (const rawItem of body.items) {
    if (
      typeof rawItem !== "object" ||
      rawItem === null ||
      Array.isArray(rawItem)
    ) {
      return null;
    }

    const item = rawItem as Record<string, unknown>;

    const productId = item.productId;
    const quantity = item.quantity;

    if (
      typeof productId !== "number" ||
      !Number.isSafeInteger(productId) ||
      productId <= 0 ||
      typeof quantity !== "number" ||
      !Number.isSafeInteger(quantity) ||
      quantity <= 0
    ) {
      return null;
    }

    const rawModifierOptionIds =
      item.modifierOptionIds ?? [];

    if (!Array.isArray(rawModifierOptionIds)) {
      return null;
    }

    const modifierOptionIds: number[] = [];

    for (const optionId of rawModifierOptionIds) {
      if (
        typeof optionId !== "number" ||
        !Number.isSafeInteger(optionId) ||
        optionId <= 0
      ) {
        return null;
      }

      modifierOptionIds.push(optionId);
    }

    // No permitimos seleccionar dos veces
    // la misma opción dentro de un artículo.
    if (
      new Set(modifierOptionIds).size !==
      modifierOptionIds.length
    ) {
      return null;
    }

    result.push({
      productId,
      quantity,
      modifierOptionIds,
    });
  }

  return result;
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
    /*
     * ============================================
     * AUTH
     * ============================================
     */
    const auth = await requireAuth({
      roles: ["owner", "employee"],
    });

    if (auth.companyId === null) {
      return NextResponse.json(
        { error: "Tenant required" },
        { status: 403 },
      );
    }

    /*
     * ============================================
     * CHECK ID
     * ============================================
     */
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

    /*
     * ============================================
     * REQUEST BODY
     * ============================================
     */
    const body = await request.json();

    const items = parseItems(body);

    if (!items) {
      return NextResponse.json(
        { error: "Invalid order items" },
        { status: 400 },
      );
    }

    /*
     * ============================================
     * TRANSACTION
     * ============================================
     *
     * Order + OrderItems deben crearse juntos.
     * Si cualquier operación falla, todo hace
     * rollback.
     */
    const result = await db.transaction(
      async (tx) => {
        const tenant = await tenantDb(tx);

        /*
         * ========================================
         * CHECK
         * ========================================
         */
        const check =
          await tenant.findFirst(
            checks,
            eq(checks.id, checkId),
          );

        if (!check) {
          throw new Error(
            "CHECK_NOT_FOUND",
          );
        }

        if (check.status !== "OPEN") {
          throw new Error(
            "CHECK_NOT_OPEN",
          );
        }

        /*
         * ========================================
         * PRODUCTS
         * ========================================
         *
         * Una sola consulta para todos los
         * productos solicitados.
         */
        // const productIds = items.map(
        //   (item) => item.productId,
        // );

        const productIds = [
          ...new Set(
            items.map((item) => item.productId),
          ),
        ];


        const productList =
          await tenant.findMany(
            products,
            inArray(
              products.id,
              productIds,
            ),
          );

        /*
         * Si falta cualquiera de los IDs,
         * puede significar:
         *
         * - no existe
         * - está eliminado
         * - pertenece a otro tenant
         *
         * No revelamos cuál.
         */
        if (
          productList.length !==
          productIds.length
        ) {
          throw new Error(
            "PRODUCT_NOT_AVAILABLE",
          );
        }

        if (
          productList.some(
            (product) =>
              !product.isAvailable,
          )
        ) {
          throw new Error(
            "PRODUCT_NOT_AVAILABLE",
          );
        }

        /*
         * ========================================
         * CATEGORIES
         * ========================================
         *
         * También consultamos categorías en batch.
         */
        const categoryIds = [
          ...new Set(
            productList.map(
              (product) =>
                product.categoryId,
            ),
          ),
        ];

        const categoryList =
          await tenant.findMany(
            categories,
            inArray(
              categories.id,
              categoryIds,
            ),
          );

        /*
         * Una categoría inexistente, eliminada
         * o perteneciente a otro tenant hace que
         * el producto no pueda ordenarse.
         */
        if (
          categoryList.length !==
          categoryIds.length
        ) {
          throw new Error(
            "CATEGORY_NOT_AVAILABLE",
          );
        }

        //modifiers

        /*
         * ========================================
         * MODIFIER VALIDATION
         * ========================================
         *
         * Validamos las opciones solicitadas
         * antes de crear la orden.
         *
         * No guardamos todavía los modificadores.
         * La persistencia llegará en la 4.6.3.
         */
        await validateOrderModifiers(
          tenant,
          items.map((item) => ({
            productId: item.productId,
            modifierOptionIds: item.modifierOptionIds,
          })),
        );


        /*
         * ========================================
         * LOOKUP MAPS
         * ========================================
         */
        const productById = new Map(
          productList.map(
            (product) => [
              product.id,
              product,
            ],
          ),
        );

        const categoryById = new Map(
          categoryList.map(
            (category) => [
              category.id,
              category,
            ],
          ),
        );

        /*
         * ========================================
         * HISTORICAL SNAPSHOTS
         * ========================================
         *
         * Copiamos los datos históricos que deben
         * sobrevivir aunque posteriormente cambie
         * el Product o Category.
         */
        const snapshots = items.map(
          (item) => {
            const product =
              productById.get(
                item.productId,
              );

            if (!product) {
              throw new Error(
                "PRODUCT_NOT_AVAILABLE",
              );
            }

            const category =
              categoryById.get(
                product.categoryId,
              );

            if (!category) {
              throw new Error(
                "CATEGORY_NOT_AVAILABLE",
              );
            }

            const subtotalInCents =
              product.priceInCents *
              item.quantity;

            if (
              !Number.isSafeInteger(
                subtotalInCents,
              ) ||
              subtotalInCents < 0
            ) {
              throw new Error(
                "INVALID_ORDER_TOTAL",
              );
            }

            return {
              productId:
                product.id,

              productName:
                product.name,

              sku:
                product.sku,

              categoryName:
                category.name,

              baseUnitPriceInCents:
                product.priceInCents,

              unitPriceInCents:
                product.priceInCents,

              quantity:
                item.quantity,

              subtotalInCents,
            };
          },
        );

        /*
         * ========================================
         * ORDER TOTAL
         * ========================================
         */
        const orderTotalInCents =
          snapshots.reduce(
            (total, item) => {
              const nextTotal =
                total +
                item.subtotalInCents;

              if (
                !Number.isSafeInteger(
                  nextTotal,
                )
              ) {
                throw new Error(
                  "INVALID_ORDER_TOTAL",
                );
              }

              return nextTotal;
            },
            0,
          );

        /*
         * ========================================
         * CREATE ORDER
         * ========================================
         *
         * companyId y status no vienen del cliente.
         *
         * tenantDb agrega companyId.
         * La DB usa PENDING como default.
         */
        const orderResult =
          await tenant.insert(
            orders,
            {
              checkId: check.id,
            },
          );

        const orderId = Number(
          orderResult[0].insertId,
        );

        if (
          !Number.isInteger(orderId) ||
          orderId <= 0
        ) {
          throw new Error(
            "ORDER_CREATION_FAILED",
          );
        }

        /*
         * ========================================
         * CREATE ORDER ITEMS
         * ========================================
         */
        for (
          const snapshot of snapshots
        ) {
          await tenant.insert(
            orderItems,
            {
              orderId,

              productId:
                snapshot.productId,

              productName:
                snapshot.productName,

              sku:
                snapshot.sku,

              categoryName:
                snapshot.categoryName,

              baseUnitPriceInCents:
                snapshot.baseUnitPriceInCents,

              unitPriceInCents:
                snapshot.unitPriceInCents,

              quantity:
                snapshot.quantity,

              subtotalInCents:
                snapshot.subtotalInCents,
            },
          );
        }

        /*
         * Si llegamos aquí, la transaction hace
         * COMMIT.
         */
        return {
          orderId,
          checkId: check.id,
          status: "PENDING" as const,
          items: snapshots,
          totalInCents:
            orderTotalInCents,
        };
      },
    );

    return NextResponse.json(
      result,
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Internal server error";


    if (error instanceof ModifierValidationError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 400,
        },
      );
    }


    /*
     * ============================================
     * AUTH ERRORS
     * ============================================
     */
    if (
      message.startsWith(
        "Unauthorized",
      )
    ) {
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

    /*
     * ============================================
     * DOMAIN ERRORS
     * ============================================
     */
    if (
      message ===
      "CHECK_NOT_FOUND"
    ) {
      return NextResponse.json(
        { error: "Check not found" },
        { status: 404 },
      );
    }

    if (
      message ===
      "CHECK_NOT_OPEN"
    ) {
      return NextResponse.json(
        { error: "Check is not open" },
        { status: 409 },
      );
    }

    if (
      message ===
      "PRODUCT_NOT_AVAILABLE" ||
      message ===
      "CATEGORY_NOT_AVAILABLE"
    ) {
      return NextResponse.json(
        {
          error:
            "One or more products are not available",
        },
        { status: 400 },
      );
    }

    if (
      message ===
      "INVALID_ORDER_TOTAL"
    ) {
      return NextResponse.json(
        { error: "Invalid order total" },
        { status: 400 },
      );
    }

    if (
      message ===
      "ORDER_CREATION_FAILED"
    ) {
      return NextResponse.json(
        {
          error:
            "Could not create order",
        },
        { status: 500 },
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