import {
  mysqlTable,
  bigint,
  varchar,
  timestamp,
  index,
  uniqueIndex,
  mysqlEnum,
  boolean,
} from "drizzle-orm/mysql-core";

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
      .references(() => companies.id, {
        onDelete: "cascade",
      }),

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

    emailIdx: index("users_email_idx")
      .on(table.email),
  }),
);