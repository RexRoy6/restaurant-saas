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
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
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
    companyIdx: index("products_company_idx")
      .on(table.companyId),

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

  }),
);
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

    ...baseColumns,
  },
  (table) => ({
    companyStatusIdx: index(
      "checks_company_status_idx",
    ).on(
      table.companyId,
      table.status,
    ),
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