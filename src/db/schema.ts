import {
  mysqlTable,
  bigint,
  varchar,
  timestamp,
  index,
  mysqlEnum,
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

/* ---------- COMPANIES ---------- */

export const companies = mysqlTable("companies", {
  id: bigint("id", { mode: "number" })
    .primaryKey()
    .autoincrement(),

  name: varchar("name", { length: 255 })
    .notNull(),

  ...baseColumns,
});

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