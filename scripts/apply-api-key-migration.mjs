/**
 * Applies the @better-auth/api-key apikey table to a database that was
 * provisioned before migrations existed in this repo (the baseline migration
 * cannot be replayed there). Mirrors migrations/0002_serious_guardsmen.sql.
 * Also upgrades tables created by the pre-1.7 version of this script
 * (user_id -> reference_id, new config_id). Every statement is guarded, so
 * running it more than once is a no-op.
 *
 * Usage:  node --env-file=.env.local scripts/apply-api-key-migration.mjs
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

const statements = [
  [
    "create apikey",
    `CREATE TABLE IF NOT EXISTS "apikey" (
      "id" text PRIMARY KEY NOT NULL,
      "config_id" text DEFAULT 'default' NOT NULL,
      "name" text,
      "start" text,
      "prefix" text,
      "key" text NOT NULL,
      "reference_id" text NOT NULL,
      "refill_interval" integer,
      "refill_amount" integer,
      "last_refill_at" timestamp,
      "enabled" boolean DEFAULT true,
      "rate_limit_enabled" boolean DEFAULT true,
      "rate_limit_time_window" integer,
      "rate_limit_max" integer,
      "request_count" integer DEFAULT 0,
      "remaining" integer,
      "last_request" timestamp,
      "expires_at" timestamp,
      "created_at" timestamp NOT NULL,
      "updated_at" timestamp NOT NULL,
      "permissions" text,
      "metadata" text
    )`,
  ],
  [
    "rename user_id -> reference_id (pre-1.7 tables)",
    `DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'apikey' AND column_name = 'user_id'
      ) THEN
        ALTER TABLE "apikey" RENAME COLUMN "user_id" TO "reference_id";
      END IF;
    END $$`,
  ],
  [
    "add config_id (pre-1.7 tables)",
    `ALTER TABLE "apikey"
      ADD COLUMN IF NOT EXISTS "config_id" text DEFAULT 'default' NOT NULL`,
  ],
  [
    "drop old fk name (pre-1.7 tables)",
    `ALTER TABLE "apikey" DROP CONSTRAINT IF EXISTS "apikey_user_id_user_id_fk"`,
  ],
  [
    "fk apikey.reference_id -> user.id",
    `DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'apikey_reference_id_user_id_fk'
      ) THEN
        ALTER TABLE "apikey"
          ADD CONSTRAINT "apikey_reference_id_user_id_fk"
          FOREIGN KEY ("reference_id") REFERENCES "public"."user"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$`,
  ],
];

for (const [label, statement] of statements) {
  await sql.query(statement);
  console.log("✓", label);
}

console.log("\nAll apikey objects applied.");
