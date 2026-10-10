
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { categories, products } from "@/db/schema";

import { getPublicCompanyBySlug } from "./getPublicCompanyBySlug";

export type PublicCatalogProduct = {
  name: string;
  priceInCents: number;
  isAvailable: boolean;
};

export type PublicCatalogCategory = {
  name: string;
  products: PublicCatalogProduct[];
};

export type PublicCatalog = {
  company: {
    name: string;
    slug: string;
    currency: "MXN";
  };
  categories: PublicCatalogCategory[];
};

export async function getPublicCatalog(
  slug: string,
): Promise<PublicCatalog | null> {
  // 1. Resolver la Company activa por slug.
  const company = await getPublicCompanyBySlug(slug);

  if (!company) {
    return null;
  }

  // 2. Obtener únicamente categorías activas
  // pertenecientes a esta Company.
  const categoryRows = await db
    .select({
      id: categories.id,
      name: categories.name,
      sortOrder: categories.sortOrder,
    })
    .from(categories)
    .where(
      and(
        eq(categories.companyId, company.id),
        isNull(categories.deletedAt),
      ),
    )
    .orderBy(
      categories.sortOrder,
      categories.name,
    );

  // 3. Obtener únicamente productos activos
  // pertenecientes a esta Company.
  const productRows = await db
    .select({
      categoryId: products.categoryId,
      name: products.name,
      priceInCents: products.priceInCents,
      isAvailable: products.isAvailable,
    })
    .from(products)
    .where(
      and(
        eq(products.companyId, company.id),
        isNull(products.deletedAt),
      ),
    )
    .orderBy(products.name);

  // 4. Agrupar productos por categoría.
  const productsByCategory = new Map<
    number,
    PublicCatalogProduct[]
  >();

  for (const product of productRows) {
    const categoryProducts =
      productsByCategory.get(product.categoryId) ?? [];

    categoryProducts.push({
      name: product.name,
      priceInCents: product.priceInCents,
      isAvailable: product.isAvailable,
    });

    productsByCategory.set(
      product.categoryId,
      categoryProducts,
    );
  }

  // 5. Construir categorías públicas.
  // Las categorías sin productos no aparecen.
  const publicCategories: PublicCatalogCategory[] =
    categoryRows.flatMap((category) => {
      const categoryProducts =
        productsByCategory.get(category.id) ?? [];

      if (categoryProducts.length === 0) {
        return [];
      }

      return [
        {
          name: category.name,
          products: categoryProducts,
        },
      ];
    });

  // 6. Devolver exclusivamente campos públicos.
  return {
    company: {
      name: company.name,
      slug: company.slug,
      currency: company.currency,
    },
    categories: publicCategories,
  };
}
