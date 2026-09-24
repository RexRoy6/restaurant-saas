import {
  mysqlTable,
  bigint,
  varchar,
  int,
  decimal,
  date,
  timestamp,
  index,
  mysqlEnum,
  uniqueIndex,
  datetime
} from "drizzle-orm/mysql-core"

/* ---------- BASE COLUMNS (audit + soft delete) ---------- */

const baseColumns = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  deletedAt: timestamp("deleted_at")
}


// contracts.status
export const CONTRACT_STATUS = [
  "draft",
  "active",
  "cancelled",
  "completed"
] as const

export type ContractStatus = typeof CONTRACT_STATUS[number]
export const contractStatusEnum = mysqlEnum("status", CONTRACT_STATUS)

/* ---------- USER ROLES (single source of truth) ---------- */

export const USER_ROLES = [
  "admin",
  "owner",
  "employee"
] as const

export type UserRole = typeof USER_ROLES[number]

/* ---------- USER ROLES ENUM DB ---------- */

export const userRoleEnum = mysqlEnum("user_role", USER_ROLES)


/* ---------- COMPANIES ---------- */

export const companies = mysqlTable("companies", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  ...baseColumns
})


/* ---------- USERS ---------- */

// export const users = mysqlTable("users", {
//   id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

//   companyId: bigint("company_id", { mode: "number" })
//     .references(() => companies.id, { onDelete: "cascade" }),

//   // ✅ usar USER_ROLES directamente
//   role: mysqlEnum("role", USER_ROLES).notNull(),

//   email: varchar("email", { length: 255 }).notNull().unique(),

//   passwordHash: varchar("password_hash", { length: 255 }).notNull(),

//   ...baseColumns
// }, (table) => ({
//   companyIdx: index("users_company_idx").on(table.companyId),
//   emailIdx: index("users_email_idx").on(table.email)
// }))
export const users = mysqlTable("users", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

  companyId: bigint("company_id", { mode: "number" })
    .references(() => companies.id, { onDelete: "cascade" }),

  role: mysqlEnum("role", USER_ROLES).notNull(),

  email: varchar("email", { length: 255 }).notNull().unique(),

  passwordHash: varchar("password_hash", { length: 255 }).notNull(),

  // NUEVO
  passwordChangedAt: timestamp("password_changed_at"),

  ...baseColumns
}, (table) => ({
  companyIdx: index("users_company_idx").on(table.companyId),
  emailIdx: index("users_email_idx").on(table.email)
}))

/* ---------- CLIENTS ---------- */

export const clients = mysqlTable("clients", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

  companyId: bigint("company_id", { mode: "number" })
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),

  userId: bigint("user_id", { mode: "number" })
    .references(() => users.id),

  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),

  ...baseColumns
}, (table) => ({
  companyIdx: index("clients_company_idx").on(table.companyId),
  userIdx: index("clients_user_idx").on(table.userId)
}))

/* ---------- SERVICES ---------- */

export const services = mysqlTable("services", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

  companyId: bigint("company_id", { mode: "number" })
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 500 }),

  stockTotal: int("stock_total").notNull(),
  priceBase: decimal("price_base", { precision: 10, scale: 2 }).notNull(),

  ...baseColumns
}, (table) => ({
  companyIdx: index("services_company_idx").on(table.companyId),
  nameIdx: index("services_name_idx").on(table.name),
  uniqueServicePerCompany: uniqueIndex("services_company_name_unique")
    .on(table.companyId, table.name)
}))


// events
export const events = mysqlTable("events", {

  id: bigint("id", { mode: "number" })
    .primaryKey()
    .autoincrement(),

  companyId: bigint("company_id", { mode: "number" })
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),

  clientId: bigint("client_id", { mode: "number" })
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 255 }).notNull(),

  eventDate: datetime("event_date").notNull(),

  eventStart: datetime("event_start"),

  eventEnd: datetime("event_end"),

  location: varchar("location", { length: 255 }),

  notes: varchar("notes", { length: 500 }),

  ...baseColumns

}, (table) => ({

  companyIdx: index("events_company_client_idx")
    .on(table.companyId, table.clientId),

  clientIdx: index("events_client_idx")
    .on(table.clientId),

  companyEventDateIdx:
    index("events_company_event_date_idx")
      .on(table.companyId, table.eventStart)


}))

/* ---------- CONTRACTS ---------- */

export const contracts = mysqlTable("contracts", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

  companyId: bigint("company_id", { mode: "number" })
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),

  clientId: bigint("client_id", { mode: "number" })
    .notNull()
    .references(() => clients.id),

  eventId: bigint("event_id", { mode: "number" })
    .notNull()
    .references(() => events.id),

  status: contractStatusEnum.notNull(),

  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),

  ...baseColumns
}, (table) => ({

  companyIdx: index("contracts_company_idx")
    .on(table.companyId),

  clientIdx: index("contracts_client_idx")
    .on(table.clientId),

  eventIdx: index("contracts_event_idx")
    .on(table.eventId),

  eventUnique: uniqueIndex("contracts_event_unique")
    .on(table.eventId),

  statusIdx: index("contracts_status_idx")
    .on(table.status),

  uniqueEventPerCompany: uniqueIndex("contracts_company_event_unique")
    .on(table.companyId, table.eventId)

}))

/* ---------- CONTRACT ITEMS ---------- */

export const contractItems = mysqlTable("contract_items", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

  contractId: bigint("contract_id", { mode: "number" })
    .notNull()
    .references(() => contracts.id, { onDelete: "cascade" }),

  serviceId: bigint("service_id", { mode: "number" })
    .notNull()
    .references(() => services.id),

  quantity: int("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  serviceNotes: varchar("service_notes", { length: 1000 }),
  operationStart: datetime("operation_start"),
  operationEnd: datetime("operation_end"),

  ...baseColumns
})

/* ---------- PAYMENTS ---------- */

export const payments = mysqlTable("payments", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

  contractId: bigint("contract_id", { mode: "number" })
    .notNull()
    .references(() => contracts.id, { onDelete: "cascade" }),

  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: mysqlEnum("currency", ["MXN", "USD"]).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }),

  // 🆕 NUEVOS CAMPOS
  paidAt: datetime("paid_at"), // fecha real del pago (opcional)
  ticketNumber: varchar("ticket_number", { length: 100 }),

  ...baseColumns
}, (table) => ({
  contractIdx: index("payments_contract_idx").on(table.contractId),

  // opcional pero útil si buscas por ticket
  ticketIdx: index("payments_ticket_idx").on(table.ticketNumber),
}))

/* ---------- REFUNDS ---------- */

export const refunds = mysqlTable("refunds", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

  paymentId: bigint("payment_id", { mode: "number" })
    .notNull()
    .references(() => payments.id, { onDelete: "cascade" }),

  ...baseColumns
})

/* ---------- CONTRACT HISTORY ---------- */

export const contractHistory = mysqlTable("contract_history", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

  contractId: bigint("contract_id", { mode: "number" })
    .notNull()
    .references(() => contracts.id, { onDelete: "cascade" }),

  changedBy: bigint("changed_by", { mode: "number" })
    .references(() => users.id),

  oldValue: varchar("old_value", { length: 255 }),
  newValue: varchar("new_value", { length: 255 }),

  ...baseColumns
})


// payments items
export const paymentItems = mysqlTable("payment_items", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

  paymentId: bigint("payment_id", { mode: "number" })
    .notNull()
    .references(() => payments.id, { onDelete: "cascade" }),

  contractItemId: bigint("contract_item_id", { mode: "number" })
    .notNull()
    .references(() => contractItems.id, { onDelete: "cascade" }),

  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
})