import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const blogs = pgTable(
  "blogs",
  {
    author: text("author").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    id: serial("id").primaryKey(),
    originalFilename: text("original_filename"),
    slug: text("slug").notNull(),
    // "youtube" blogs use the video ID as slug; "upload" blogs get a generated
    // slug and keep the original filename for display.
    sourceType: text("source_type").notNull().default("youtube"),
    title: text("title").notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("blogs_user_id_created_at_idx").on(table.userId, table.createdAt),
  ]
);

export type SelectBlog = typeof blogs.$inferSelect;
export type InsertBlog = typeof blogs.$inferInsert;

export const blogsRelations = relations(blogs, ({ one }) => ({
  user: one(user, {
    fields: [blogs.userId],
    references: [user.id],
  }),
}));

export const user = pgTable("user", {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  id: text("id").primaryKey(),
  image: text("image"),
  name: text("name").notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  id: text("id").primaryKey(),
  ipAddress: text("ip_address"),
  token: text("token").notNull().unique(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  accessToken: text("access_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  accountId: text("account_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  id: text("id").primaryKey(),
  idToken: text("id_token"),
  password: text("password"),
  providerId: text("provider_id").notNull(),
  refreshToken: text("refresh_token"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const verification = pgTable("verification", {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  value: text("value").notNull(),
});

// Managed by the @better-auth/api-key plugin; the adapter maps by property
// name. referenceId holds the owning user's id (references defaults to "user").
export const apikey = pgTable("apikey", {
  configId: text("config_id").notNull().default("default"),
  createdAt: timestamp("created_at").notNull(),
  enabled: boolean("enabled").default(true),
  expiresAt: timestamp("expires_at"),
  id: text("id").primaryKey(),
  key: text("key").notNull(),
  lastRefillAt: timestamp("last_refill_at"),
  lastRequest: timestamp("last_request"),
  metadata: text("metadata"),
  name: text("name"),
  permissions: text("permissions"),
  prefix: text("prefix"),
  rateLimitEnabled: boolean("rate_limit_enabled").default(true),
  rateLimitMax: integer("rate_limit_max"),
  rateLimitTimeWindow: integer("rate_limit_time_window"),
  referenceId: text("reference_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  refillAmount: integer("refill_amount"),
  refillInterval: integer("refill_interval"),
  remaining: integer("remaining"),
  requestCount: integer("request_count").default(0),
  start: text("start"),
  updatedAt: timestamp("updated_at").notNull(),
});

// One row per user; created lazily the first time preferences are saved.
export const userPreferences = pgTable("user_preferences", {
  styleInstructions: text("style_instructions"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  writingStyle: text("writing_style").notNull().default("personal"),
});

export const userEntitlements = pgTable("user_entitlements", {
  billingInterval: text("billing_interval").notNull().default("month"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  creditsBalance: integer("credits_balance").notNull().default(0),
  creemCustomerId: text("creem_customer_id"),
  creemProductId: text("creem_product_id"),
  creemSubscriptionId: text("creem_subscription_id"),
  currentPeriodEnd: timestamp("current_period_end"),
  source: text("source").notNull().default("local-default"),
  subscriptionStatus: text("subscription_status").notNull().default("none"),
  tier: text("tier").notNull().default("free"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
});

export type SelectUserEntitlement = typeof userEntitlements.$inferSelect;
export type InsertUserEntitlement = typeof userEntitlements.$inferInsert;

export const entitlementEvents = pgTable(
  "entitlement_events",
  {
    afterJson: jsonb("after_json"),
    beforeJson: jsonb("before_json"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    eventType: text("event_type").notNull(),
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    source: text("source").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("entitlement_events_user_id_idx").on(table.userId)]
);

export const creemWebhookEvents = pgTable(
  "creem_webhook_events",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    creemEventId: text("creem_event_id"),
    eventType: text("event_type").notNull(),
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    payloadJson: jsonb("payload_json").notNull(),
    processedAt: timestamp("processed_at"),
    result: text("result").notNull(),
  },
  (table) => [
    uniqueIndex("creem_webhook_events_creem_event_id_idx").on(
      table.creemEventId
    ),
  ]
);

export const schema = {
  account,
  apikey,
  blogs,
  blogsRelations,
  creemWebhookEvents,
  entitlementEvents,
  session,
  user,
  userEntitlements,
  userPreferences,
  verification,
};
