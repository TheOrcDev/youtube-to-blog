/**
 * Applies the billing schema to a database that was provisioned before
 * migrations existed in this repo.
 *
 * The baseline migration (migrations/0000_*.sql) creates every table, including
 * the auth and blogs tables that an existing deployment already has, so it
 * cannot be replayed there. This script applies only the objects billing adds.
 * Every statement is guarded, so running it more than once is a no-op.
 *
 * Usage:  node --env-file=.env.local scripts/apply-billing-migration.mjs
 *
 * Fresh databases should use `pnpm db:migrate` instead.
 */
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;

if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(url);

// Only the objects missing from the already-provisioned database. Every
// statement is additive and guarded, so re-running this is a no-op.
const statements = [
  [
    "create user_entitlements",
    `CREATE TABLE IF NOT EXISTS "user_entitlements" (
      "user_id" text PRIMARY KEY NOT NULL,
      "tier" text DEFAULT 'free' NOT NULL,
      "source" text DEFAULT 'local-default' NOT NULL,
      "subscription_status" text DEFAULT 'none' NOT NULL,
      "creem_customer_id" text,
      "creem_subscription_id" text,
      "creem_product_id" text,
      "billing_interval" text DEFAULT 'month' NOT NULL,
      "current_period_end" timestamp,
      "cancel_at_period_end" boolean DEFAULT false NOT NULL,
      "credits_balance" integer DEFAULT 0 NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    )`,
  ],
  [
    "create entitlement_events",
    `CREATE TABLE IF NOT EXISTS "entitlement_events" (
      "id" text PRIMARY KEY NOT NULL,
      "user_id" text NOT NULL,
      "source" text NOT NULL,
      "event_type" text NOT NULL,
      "before_json" jsonb,
      "after_json" jsonb,
      "created_at" timestamp DEFAULT now() NOT NULL
    )`,
  ],
  [
    "create creem_webhook_events",
    `CREATE TABLE IF NOT EXISTS "creem_webhook_events" (
      "id" text PRIMARY KEY NOT NULL,
      "creem_event_id" text,
      "event_type" text NOT NULL,
      "payload_json" jsonb NOT NULL,
      "processed_at" timestamp,
      "result" text NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    )`,
  ],
  [
    "fk user_entitlements.user_id -> user.id",
    `DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_entitlements_user_id_user_id_fk'
      ) THEN
        ALTER TABLE "user_entitlements"
          ADD CONSTRAINT "user_entitlements_user_id_user_id_fk"
          FOREIGN KEY ("user_id") REFERENCES "public"."user"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$`,
  ],
  [
    "fk entitlement_events.user_id -> user.id",
    `DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'entitlement_events_user_id_user_id_fk'
      ) THEN
        ALTER TABLE "entitlement_events"
          ADD CONSTRAINT "entitlement_events_user_id_user_id_fk"
          FOREIGN KEY ("user_id") REFERENCES "public"."user"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$`,
  ],
  [
    "index blogs(user_id, created_at)",
    `CREATE INDEX IF NOT EXISTS "blogs_user_id_created_at_idx"
      ON "blogs" USING btree ("user_id","created_at")`,
  ],
  [
    "unique index creem_webhook_events(creem_event_id)",
    `CREATE UNIQUE INDEX IF NOT EXISTS "creem_webhook_events_creem_event_id_idx"
      ON "creem_webhook_events" USING btree ("creem_event_id")`,
  ],
  [
    "index entitlement_events(user_id)",
    `CREATE INDEX IF NOT EXISTS "entitlement_events_user_id_idx"
      ON "entitlement_events" USING btree ("user_id")`,
  ],
];

for (const [label, statement] of statements) {
  await sql.query(statement);
  console.log("✓", label);
}

console.log("\nAll billing objects applied.");
