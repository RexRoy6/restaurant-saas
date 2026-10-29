import {
  mysqlTable,
  bigint,
  varchar,
  timestamp,
  index,
  uniqueIndex,
  mysqlEnum,
  boolean,
  check
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

/* ---------- BASE COLUMNS (audit + soft delete) ---------- */

const baseColumns = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
};

/* ---------- USER ROLES (single source of truth) ---------- */

export const USER_ROLES = [
  "admin",
  "owner",
  "employee",
] as const;

export type UserRole = typeof USER_ROLES[number];

/* ---------- USER ROLES ENUM DB ---------- */

export const userRoleEnum = mysqlEnum("user_role", USER_ROLES);

// enums generales pa todo
export const CHECK_STATUSES = [
  "OPEN",
  "CLOSED",
  "CANCELLED",
] as const;

export const ORDER_STATUSES = [
  "PENDING",
  "PREPARING",
  "READY",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus =
  typeof ORDER_STATUSES[number];

export const orderStatusEnum = mysqlEnum(
  "order_status",
  ORDER_STATUSES,
);


export type CheckStatus =
  typeof CHECK_STATUSES[number];

export const checkStatusEnum = mysqlEnum(
  "check_status",
  CHECK_STATUSES,
);

export const PAYMENT_METHODS = [
  "CASH",
  "CARD",
  "TRANSFER",
] as const;

export type PaymentMethod =
  typeof PAYMENT_METHODS[number];

export const paymentMethodEnum = mysqlEnum(
  "payment_method",
  PAYMENT_METHODS,
);

/* ---------- catalogo de TIMEZONES ---------- */

export const timezones = mysqlTable(
  "timezones",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .autoincrement(),

    name: varchar("name", { length: 100 })
      .notNull(),

    label: varchar("label", { length: 150 })
      .notNull(),
  },
  (table) => ({
    nameUnique: uniqueIndex("timezones_name_unique")
      .on(table.name),
  }),
);

/* ---------- COMPANIES ---------- */

export const companies = mysqlTable(
  "companies",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .autoincrement(),

    name: varchar("name", { length: 255 })
      .notNull(),

    slug: varchar("slug", { length: 120 })
      .notNull(),

    currency: mysqlEnum("currency", ["MXN"])
      .notNull()
      .default("MXN"),

    timezoneId: bigint("timezone_id", { mode: "number" })
      .notNull()
      .references(() => timezones.id),

    ...baseColumns,
  },
  (table) => ({
    slugUnique: uniqueIndex("companies_slug_unique")
      .on(table.slug),

    timezoneIdx: index("companies_timezone_idx")
      .on(table.timezoneId),
  }),
);



/* ---------- COMPANY PUBLIC INFO ---------- */

export const companyPublicInfo = mysqlTable(
  "company_public_info",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .autoincrement(),

    companyId: bigint("company_id", { mode: "number" })
      .notNull()
      .references(() => companies.id),

    googleMapsUrl: varchar("google_maps_url", {
      length: 2048,
    }),

    isTemporarilyClosed: boolean("is_temporarily_closed")
      .notNull()
      .default(false),

    temporaryClosureReason: varchar(
      "temporary_closure_reason",
      { length: 500 },
    ),

    ...baseColumns,
  },
  (table) => ({
    companyUnique: uniqueIndex(
      "company_public_info_company_unique",
    ).on(table.companyId),
  }),
);


/* ---------- COMPANY BUSINESS HOURS ---------- */

export const companyBusinessHours = mysqlTable(
  "company_business_hours",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .autoincrement(),

    companyId: bigint("company_id", { mode: "number" })
      .notNull()
      .references(() => companies.id),

    dayOfWeek: bigint("day_of_week", {
      mode: "number",
    }).notNull(),

    isClosed: boolean("is_closed")
      .notNull()
      .default(true),

    opensAt: varchar("opens_at", {
      length: 5,
    }),

    closesAt: varchar("closes_at", {
      length: 5,
    }),

    ...baseColumns,
  },
  (table) => ({
    companyDayUnique: uniqueIndex(
      "company_business_hours_company_day_unique",
    ).on(table.companyId, table.dayOfWeek),

    dayRangeCheck: check(
      "company_business_hours_day_range",
      sql`${table.dayOfWeek} BETWEEN 0 AND 6`,
    ),

    hoursConsistencyCheck: check(
      "company_business_hours_consistency",
      sql`(
        (${table.isClosed} = true
          AND ${table.opensAt} IS NULL
          AND ${table.closesAt} IS NULL)
        OR
        (${table.isClosed} = false
          AND ${table.opensAt} IS NOT NULL
          AND ${table.closesAt} IS NOT NULL
          AND ${table.opensAt} <> ${table.closesAt})
      )`,
    ),
  }),
);


//categorias para productos
/* ---------- CATEGORIES ---------- */

export const categories = mysqlTable(
  "categories",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .autoincrement(),

    companyId: bigint("company_id", {
      mode: "number",
    })
      .notNull()
      .references(() => companies.id),

    name: varchar("name", {
      length: 120,
    }).notNull(),

    sortOrder: bigint("sort_order", {
      mode: "number",
    })
      .notNull()
      .default(0),

    ...baseColumns,
  },
  (table) => ({
    companyNameUnique: uniqueIndex(
      "categories_company_name_unique",
    ).on(
      table.companyId,
      table.name,
    ),

    companySortOrderIdx: index(
      "categories_company_sort_order_idx",
    ).on(
      table.companyId,
      table.sortOrder,
    ),
  }),
);

// productos nene
export const products = mysqlTable(
  "products",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .autoincrement(),

    companyId: bigint("company_id", { mode: "number" })
      .notNull()
      .references(() => companies.id),

    categoryId: bigint("category_id", {
      mode: "number",
    })
      .notNull()
      .references(() => categories.id),


    name: varchar("name", { length: 255 })
      .notNull(),

    sku: varchar("sku", { length: 100 })
      .notNull(),

    priceInCents: bigint("price_in_cents", {
      mode: "number",
    }).notNull(),

    isAvailable: boolean("is_available")
      .notNull()
      .default(true),

    ...baseColumns,
  },
  (table) => ({

    companySkuUnique: uniqueIndex(
      "products_company_sku_unique",
    ).on(
      table.companyId,
      table.sku,
    ),
    priceNonNegative: check(
      "products_price_non_negative",
      sql`${table.priceInCents} >= 0`,
    ),
    categoryIdx: index(
      "products_category_idx",
    ).on(table.categoryId),



  }),
);
/* ---------- MODIFIER GROUPS ---------- */

export const modifierGroups = mysqlTable(
  "modifier_groups",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    companyId: bigint("company_id", { mode: "number" }).notNull().references(() => companies.id),
    name: varchar("name", { length: 120 }).notNull(),
    minSelections: bigint("min_selections", { mode: "number" }).notNull().default(0),
    maxSelections: bigint("max_selections", { mode: "number" }).notNull().default(1),
    sortOrder: bigint("sort_order", { mode: "number" }).notNull().default(0),
    ...baseColumns,
  },
  (table) => ({
    companyNameUnique: uniqueIndex("modifier_groups_company_name_unique").on(table.companyId, table.name),
    companySortIdx: index("modifier_groups_company_sort_idx").on(table.companyId, table.sortOrder),
    selectionRangeCheck: check(
      "modifier_groups_selection_range_check",
      sql`${table.minSelections} >= 0 AND ${table.maxSelections} >= 1 AND ${table.minSelections} <= ${table.maxSelections}`,
    ),
  }),
);

/* ---------- MODIFIER OPTIONS ---------- */

export const modifierOptions = mysqlTable(
  "modifier_options",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    companyId: bigint("company_id", { mode: "number" }).notNull().references(() => companies.id),
    groupId: bigint("group_id", { mode: "number" }).notNull().references(() => modifierGroups.id),
    name: varchar("name", { length: 120 }).notNull(),
    priceInCents: bigint("price_in_cents", { mode: "number" }).notNull().default(0),
    isAvailable: boolean("is_available").notNull().default(true),
    sortOrder: bigint("sort_order", { mode: "number" }).notNull().default(0),
    ...baseColumns,
  },
  (table) => ({
    groupNameUnique: uniqueIndex("modifier_options_group_name_unique").on(table.groupId, table.name),
    companyGroupIdx: index("modifier_options_company_group_idx").on(table.companyId, table.groupId),
    priceNonNegative: check("modifier_options_price_non_negative", sql`${table.priceInCents} >= 0`),
  }),
);

/* ---------- PRODUCT / MODIFIER GROUP ASSOCIATIONS ---------- */

export const productModifierGroups = mysqlTable(
  "product_modifier_groups",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    companyId: bigint("company_id", { mode: "number" }).notNull().references(() => companies.id),
    productId: bigint("product_id", { mode: "number" }).notNull().references(() => products.id),
    groupId: bigint("group_id", { mode: "number" }).notNull().references(() => modifierGroups.id),
    sortOrder: bigint("sort_order", { mode: "number" }).notNull().default(0),
    ...baseColumns,
  },
  (table) => ({
    productGroupUnique: uniqueIndex("product_modifier_groups_product_group_unique").on(table.productId, table.groupId),
    companyProductIdx: index("product_modifier_groups_company_product_idx").on(table.companyId, table.productId),
    companyGroupIdx: index("product_modifier_groups_company_group_idx").on(table.companyId, table.groupId),
  }),
);

/* ---------- CHECKS / ORDERS BELOW ---------- */

//tabla de checks cuentas xd
export const checks = mysqlTable(
  "checks",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .autoincrement(),

    companyId: bigint("company_id", { mode: "number" })
      .notNull()
      .references(() => companies.id),

    name: varchar("name", { length: 255 }),

    note: varchar("note", { length: 500 }),

    status: mysqlEnum(
      "status",
      CHECK_STATUSES,
    )
      .notNull()
      .default("OPEN"),

    closedAt: timestamp("closed_at"),
    cancelledAt: timestamp("cancelled_at"),
    //cosas para auditoria de cancelacion
    cancelledBy: bigint("cancelled_by", {
      mode: "number",
    }).references(() => users.id),

    cancellationReason: varchar(
      "cancellation_reason",
      { length: 500 },
    ),

    ...baseColumns,
  },
  (table) => ({
    companyStatusIdx: index(
      "checks_company_status_idx",
    ).on(
      table.companyId,
      table.status,
    ),
    cancelledByIdx: index(
      "checks_cancelled_by_idx",
    ).on(table.cancelledBy),
  }),
);
//ordenes/tickets
export const orders = mysqlTable(
  "orders",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .autoincrement(),

    companyId: bigint("company_id", { mode: "number" })
      .notNull()
      .references(() => companies.id),

    checkId: bigint("check_id", { mode: "number" })
      .notNull()
      .references(() => checks.id),

    status: mysqlEnum(
      "status",
      ORDER_STATUSES,
    )
      .notNull()
      .default("PENDING"),

    cancelledAt: timestamp("cancelled_at"),

    cancelledBy: bigint("cancelled_by", {
      mode: "number",
    }).references(() => users.id),

    cancellationReason: varchar(
      "cancellation_reason",
      { length: 500 },
    ),

    ...baseColumns,
  },
  (table) => ({

    checkIdx: index("orders_check_idx")
      .on(table.checkId),

    companyStatusIdx: index(
      "orders_company_status_idx",
    ).on(
      table.companyId,
      table.status,
    ),
    cancelledByIdx: index(
      "orders_cancelled_by_idx",
    ).on(table.cancelledBy),
  }),
);

export const orderItems = mysqlTable(
  "order_items",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .autoincrement(),

    companyId: bigint("company_id", { mode: "number" })
      .notNull()
      .references(() => companies.id),

    orderId: bigint("order_id", { mode: "number" })
      .notNull()
      .references(() => orders.id),

    productId: bigint("product_id", { mode: "number" })
      .notNull()
      .references(() => products.id),

    /*
     * Historical snapshot.
     * These values must not change when the Product changes.
     */
    productName: varchar("product_name", {
      length: 255,
    }).notNull(),

    sku: varchar("sku", {
      length: 100,
    }).notNull(),

    categoryName: varchar("category_name", {
      length: 120,
    }).notNull(),

    // Historical base product price, excluding selected modifiers.
    baseUnitPriceInCents: bigint(
      "base_unit_price_in_cents",
      { mode: "number" },
    ).notNull(),

    // Historical final unit price, including selected modifiers.
    unitPriceInCents: bigint(
      "unit_price_in_cents",
      { mode: "number" },
    ).notNull(),

    quantity: bigint("quantity", {
      mode: "number",
    }).notNull(),

    subtotalInCents: bigint(
      "subtotal_in_cents",
      { mode: "number" },
    ).notNull(),

    ...baseColumns,
  },
  (table) => ({
    companyIdx: index("order_items_company_idx")
      .on(table.companyId),

    orderIdx: index("order_items_order_idx")
      .on(table.orderId),

    productIdx: index("order_items_product_idx")
      .on(table.productId),

    baseUnitPriceNonNegative: check(
      "order_items_base_unit_price_non_negative",
      sql`${table.baseUnitPriceInCents} >= 0`,
    ),

    unitPriceNonNegative: check(
      "order_items_unit_price_non_negative",
      sql`${table.unitPriceInCents} >= 0`,
    ),

    quantityPositive: check(
      "order_items_quantity_positive",
      sql`${table.quantity} > 0`,
    ),

    subtotalNonNegative: check(
      "order_items_subtotal_non_negative",
      sql`${table.subtotalInCents} >= 0`,
    ),
  }),
);

/* ---------- ORDER ITEM MODIFIER SNAPSHOTS ---------- */

export const orderItemModifiers = mysqlTable(
  "order_item_modifiers",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    companyId: bigint("company_id", { mode: "number" }).notNull().references(() => companies.id),
    orderItemId: bigint("order_item_id", { mode: "number" }).notNull().references(() => orderItems.id),
    modifierGroupId: bigint("modifier_group_id", { mode: "number" }).notNull().references(() => modifierGroups.id),
    modifierOptionId: bigint("modifier_option_id", { mode: "number" }).notNull().references(() => modifierOptions.id),
    groupName: varchar("group_name", { length: 120 }).notNull(),
    optionName: varchar("option_name", { length: 120 }).notNull(),
    priceInCents: bigint("price_in_cents", { mode: "number" }).notNull(),
    ...baseColumns,
  },
  (table) => ({
    itemOptionUnique: uniqueIndex("order_item_modifiers_item_option_unique").on(table.orderItemId, table.modifierOptionId),
    companyItemIdx: index("order_item_modifiers_company_item_idx").on(table.companyId, table.orderItemId),
    groupIdx: index("order_item_modifiers_group_idx").on(table.modifierGroupId),
    optionIdx: index("order_item_modifiers_option_idx").on(table.modifierOptionId),
    priceNonNegative: check("order_item_modifiers_price_non_negative", sql`${table.priceInCents} >= 0`),
  }),
);

//payments
export const payments = mysqlTable(
  "payments",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .autoincrement(),

    companyId: bigint("company_id", { mode: "number" })
      .notNull()
      .references(() => companies.id),

    checkId: bigint("check_id", { mode: "number" })
      .notNull()
      .references(() => checks.id),

    amountInCents: bigint(
      "amount_in_cents",
      { mode: "number" },
    ).notNull(),

    paymentMethod: mysqlEnum(
      "payment_method",
      PAYMENT_METHODS,
    ).notNull(),

    idempotencyKey: varchar("idempotency_key", {
      length: 64,
    }),


    paidAt: timestamp("paid_at")
      .defaultNow()
      .notNull(),

    ...baseColumns,
  },
  (table) => ({

    checkIdx: index(
      "payments_check_idx",
    ).on(table.checkId),

    companyPaidAtIdx: index(
      "payments_company_paid_at_idx",
    ).on(
      table.companyId,
      table.paidAt,
    ),
    idempotencyKeyUnique: uniqueIndex(
      "payments_idempotency_key_unique",
    ).on(table.idempotencyKey),

    amountPositive: check(
      "payments_amount_positive",
      sql`${table.amountInCents} > 0`,
    ),

  }),
);
/* ---------- USERS ---------- */

export const users = mysqlTable(
  "users",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .autoincrement(),

    companyId: bigint("company_id", { mode: "number" })
      .references(() => companies.id),

    role: mysqlEnum("role", USER_ROLES)
      .notNull(),

    email: varchar("email", { length: 255 })
      .notNull()
      .unique(),

    passwordHash: varchar("password_hash", {
      length: 255,
    }).notNull(),

    passwordChangedAt: timestamp(
      "password_changed_at",
    ),

    ...baseColumns,
  },
  (table) => ({
    companyIdx: index("users_company_idx")
      .on(table.companyId),
  }),
);