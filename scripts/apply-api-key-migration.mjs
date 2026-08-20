/**
 * Applies the better-auth apikey table to a database that was provisioned
 * before migrations existed in this repo (the baseline migration cannot be
 * replayed there). Mirrors migrations/0002_open_luckman.sql. Every statement
 * is guarded, so running it more than once is a no-op.
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
      "name" text,
      "start" text,
      "prefix" text,
      "key" text NOT NULL,
      "user_id" text NOT NULL,
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
    "fk apikey.user_id -> user.id",
    `DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'apikey_user_id_user_id_fk'
      ) THEN
        ALTER TABLE "apikey"
          ADD CONSTRAINT "apikey_user_id_user_id_fk"
          FOREIGN KEY ("user_id") REFERENCES "public"."user"("id")
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
