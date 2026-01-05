import { type SQL, relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  customType,
  index,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Custom types
export const tsvector = customType<{
  data: string;
}>({
  dataType() {
    return "tsvector";
  },
});

type NumericConfig = {
  precision?: number;
  scale?: number;
};

export const numericCasted = customType<{
  data: number;
  driverData: string;
  config: NumericConfig;
}>({
  dataType: (config) => {
    if (config?.precision && config?.scale) {
      return `numeric(${config.precision}, ${config.scale})`;
    }
    return "numeric";
  },
  fromDriver: (value: string) => Number.parseFloat(value),
  toDriver: (value: number) => value.toString(),
});

// Enums
export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "overdue", 
  "paid",
  "unpaid",
  "canceled",
  "scheduled",
]);

export const invoiceDeliveryTypeEnum = pgEnum("invoice_delivery_type", [
  "create",
  "create_and_send", 
  "scheduled",
]);

export const invoiceSizeEnum = pgEnum("invoice_size", ["a4", "letter"]);

export const plansEnum = pgEnum("plans", ["trial", "starter", "pro"]);

export const teamRolesEnum = pgEnum("teamRoles", ["owner", "member"]);

// Core tables
export const teams = pgTable("teams", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  name: text(),
  logoUrl: text("logo_url"),
  email: text(),
  baseCurrency: text("base_currency").default("USD"),
  countryCode: text("country_code"),
  fiscalYearStartMonth: smallint("fiscal_year_start_month").default(1),
  plan: plansEnum().default("trial").notNull(),
  // Branding settings
  primaryColor: text("primary_color").default("#1f2937"),
  secondaryColor: text("secondary_color").default("#6b7280"),
  accentColor: text("accent_color").default("#3b82f6"),
  fontFamily: text("font_family").default("Inter"),
  invoiceFooter: text("invoice_footer"),
});

export const users = pgTable("users", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  email: text().notNull(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  locale: text().default("en"),
  weekStartsOnMonday: boolean("week_starts_on_monday").default(false),
  timeZone: text("time_zone"),
  timeFormat: smallint("time_format").default(12),
  dateFormat: text("date_format").default("MM/DD/YYYY"),
});

export const usersOnTeam = pgTable(
  "users_on_team",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    teamId: uuid("team_id").notNull(),
    role: teamRolesEnum().default("member").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("users_on_team_user_id_idx").on(table.userId),
    index("users_on_team_team_id_idx").on(table.teamId),
  ],
);

export const customers = pgTable(
  "customers",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    name: text().notNull(),
    email: text().notNull(),
    billingEmail: text(),
    country: text(),
    addressLine1: text("address_line_1"),
    addressLine2: text("address_line_2"),
    city: text(),
    state: text(),
    zip: text(),
    note: text(),
    teamId: uuid("team_id").notNull(),
    website: text(),
    phone: text(),
    vatNumber: text("vat_number"),
    countryCode: text("country_code"),
    token: text().default("").notNull(),
    contact: text(),
    fts: tsvector("fts")
      .notNull()
      .generatedAlwaysAs(
        (): SQL => sql`
          to_tsvector(
            'english'::regconfig,
            COALESCE(name, ''::text) || ' ' ||
            COALESCE(contact, ''::text) || ' ' ||
            COALESCE(phone, ''::text) || ' ' ||
            COALESCE(email, ''::text) || ' ' ||
            COALESCE(address_line_1, ''::text) || ' ' ||
            COALESCE(address_line_2, ''::text) || ' ' ||
            COALESCE(city, ''::text) || ' ' ||
            COALESCE(state, ''::text) || ' ' ||
            COALESCE(zip, ''::text) || ' ' ||
            COALESCE(country, ''::text)
          )
        `,
      ),
  },
  (table) => [
    index("customers_team_id_idx").on(table.teamId),
    index("customers_fts_idx").using("gin", table.fts),
    index("customers_name_idx").on(table.name),
  ],
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    dueDate: timestamp("due_date", { withTimezone: true, mode: "string" }),
    invoiceNumber: text("invoice_number"),
    customerId: uuid("customer_id"),
    amount: numericCasted({ precision: 10, scale: 2 }),
    currency: text(),
    lineItems: jsonb("line_items"),
    paymentDetails: jsonb("payment_details"),
    customerDetails: jsonb("customer_details"),
    note: text(),
    internalNote: text("internal_note"),
    teamId: uuid("team_id").notNull(),
    userId: uuid("user_id"),
    paidAt: timestamp("paid_at", { withTimezone: true, mode: "string" }),
    fts: tsvector("fts")
      .notNull()
      .generatedAlwaysAs(
        (): SQL => sql`
          to_tsvector(
            'english',
            (
              (COALESCE((amount)::text, ''::text) || ' '::text) || 
              COALESCE(invoice_number, ''::text) || ' '::text ||
              COALESCE(customer_name, ''::text)
            )
          )
        `,
      ),
    vat: numericCasted({ precision: 10, scale: 2 }),
    tax: numericCasted({ precision: 10, scale: 2 }),
    filePath: text("file_path").array(),
    status: invoiceStatusEnum().default("draft").notNull(),
    viewedAt: timestamp("viewed_at", { withTimezone: true, mode: "string" }),
    fromDetails: jsonb("from_details"),
    issueDate: timestamp("issue_date", { withTimezone: true, mode: "string" }),
    template: jsonb(),
    noteDetails: jsonb("note_details"),
    customerName: text("customer_name"),
    token: text().default("").notNull(),
    sentTo: text("sent_to"),
    reminderSentAt: timestamp("reminder_sent_at", {
      withTimezone: true,
      mode: "string",
    }),
    discount: numericCasted({ precision: 10, scale: 2 }),
    fileSize: bigint("file_size", { mode: "number" }),
    subtotal: numericCasted({ precision: 10, scale: 2 }),
    topBlock: jsonb("top_block"),
    bottomBlock: jsonb("bottom_block"),
    sentAt: timestamp("sent_at", { withTimezone: true, mode: "string" }),
    scheduledAt: timestamp("scheduled_at", {
      withTimezone: true,
      mode: "string",
    }),
    scheduledJobId: text("scheduled_job_id"),
  },
  (table) => [
    index("invoices_created_at_idx").using(
      "btree",
      table.createdAt.asc().nullsLast(),
    ),
    index("invoices_team_id_idx").on(table.teamId),
    index("invoices_customer_id_idx").on(table.customerId),
    index("invoices_status_idx").on(table.status),
    index("invoices_fts_idx").using("gin", table.fts),
    index("invoices_due_date_idx").on(table.dueDate),
  ],
);

export const invoiceTemplates = pgTable(
  "invoice_templates",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    teamId: uuid("team_id").notNull(),
    title: text().default("Invoice"),
    customerLabel: text("customer_label").default("To"),
    fromLabel: text("from_label").default("From"),
    invoiceNoLabel: text("invoice_no_label").default("Invoice No"),
    issueDateLabel: text("issue_date_label").default("Issue Date"),
    dueDateLabel: text("due_date_label").default("Due Date"),
    descriptionLabel: text("description_label").default("Description"),
    priceLabel: text("price_label").default("Price"),
    quantityLabel: text("quantity_label").default("Quantity"),
    totalLabel: text("total_label").default("Total"),
    totalSummaryLabel: text("total_summary_label").default("Total"),
    subtotalLabel: text("subtotal_label").default("Subtotal"),
    vatLabel: text("vat_label").default("VAT"),
    taxLabel: text("tax_label").default("Tax"),
    discountLabel: text("discount_label").default("Discount"),
    paymentLabel: text("payment_label").default("Payment Details"),
    noteLabel: text("note_label").default("Note"),
    logoUrl: text("logo_url"),
    currency: text().default("USD"),
    paymentDetails: jsonb("payment_details"),
    fromDetails: jsonb("from_details"),
    dateFormat: text("date_format").default("dd/MM/yyyy"),
    includeVat: boolean("include_vat").default(true),
    includeTax: boolean("include_tax").default(true),
    includeDiscount: boolean("include_discount").default(false),
    includeDecimals: boolean("include_decimals").default(false),
    includeUnits: boolean("include_units").default(false),
    includeQr: boolean("include_qr").default(true),
    taxRate: numericCasted({ precision: 5, scale: 2 }).default(0),
    vatRate: numericCasted({ precision: 5, scale: 2 }).default(0),
    size: invoiceSizeEnum().default("a4"),
    deliveryType: invoiceDeliveryTypeEnum().default("create"),
    locale: text().default("en"),
  },
  (table) => [
    index("invoice_templates_team_id_idx").on(table.teamId),
  ],
);

export const invoiceProducts = pgTable(
  "invoice_products",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    teamId: uuid("team_id").notNull(),
    name: text().notNull(),
    description: text(),
    price: numericCasted({ precision: 10, scale: 2 }),
    currency: text(),
    unit: text(),
    usageCount: smallint("usage_count").default(0),
    lastUsedAt: timestamp("last_used_at", {
      withTimezone: true,
      mode: "string",
    }),
    isActive: boolean("is_active").default(true),
    fts: tsvector("fts")
      .notNull()
      .generatedAlwaysAs(
        (): SQL => sql`
          to_tsvector(
            'english',
            COALESCE(name, ''::text) || ' ' ||
            COALESCE(description, ''::text)
          )
        `,
      ),
  },
  (table) => [
    index("invoice_products_team_id_idx").on(table.teamId),
    index("invoice_products_fts_idx").using("gin", table.fts),
    index("invoice_products_usage_count_idx").on(table.usageCount),
  ],
);

export const tags = pgTable(
  "tags",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    name: text().notNull(),
    color: text(),
    teamId: uuid("team_id").notNull(),
    description: text(),
  },
  (table) => [
    index("tags_team_id_idx").on(table.teamId),
    index("tags_name_idx").on(table.name),
  ],
);

export const customerTags = pgTable(
  "customer_tags",
  {
    customerId: uuid("customer_id").notNull(),
    tagId: uuid("tag_id").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.customerId, table.tagId] }),
    index("customer_tags_customer_id_idx").on(table.customerId),
    index("customer_tags_tag_id_idx").on(table.tagId),
  ],
);

export const exchangeRates = pgTable(
  "exchange_rates",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    base: text().notNull(),
    target: text().notNull(),
    rate: numericCasted({ precision: 10, scale: 6 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("exchange_rates_base_target_idx").on(table.base, table.target),
  ],
);

// Relations
export const teamsRelations = relations(teams, ({ many }) => ({
  users: many(usersOnTeam),
  customers: many(customers),
  invoices: many(invoices),
  invoiceTemplates: many(invoiceTemplates),
  invoiceProducts: many(invoiceProducts),
  tags: many(tags),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teams: many(usersOnTeam),
  invoices: many(invoices),
}));

export const usersOnTeamRelations = relations(usersOnTeam, ({ one }) => ({
  user: one(users, {
    fields: [usersOnTeam.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [usersOnTeam.teamId],
    references: [teams.id],
  }),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  team: one(teams, {
    fields: [customers.teamId],
    references: [teams.id],
  }),
  invoices: many(invoices),
  tags: many(customerTags),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  team: one(teams, {
    fields: [invoices.teamId],
    references: [teams.id],
  }),
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  user: one(users, {
    fields: [invoices.userId],
    references: [users.id],
  }),
}));

export const invoiceTemplatesRelations = relations(invoiceTemplates, ({ one }) => ({
  team: one(teams, {
    fields: [invoiceTemplates.teamId],
    references: [teams.id],
  }),
}));

export const invoiceProductsRelations = relations(invoiceProducts, ({ one }) => ({
  team: one(teams, {
    fields: [invoiceProducts.teamId],
    references: [teams.id],
  }),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  team: one(teams, {
    fields: [tags.teamId],
    references: [teams.id],
  }),
  customers: many(customerTags),
}));

export const customerTagsRelations = relations(customerTags, ({ one }) => ({
  customer: one(customers, {
    fields: [customerTags.customerId],
    references: [customers.id],
  }),
  tag: one(tags, {
    fields: [customerTags.tagId],
    references: [tags.id],
  }),
}));