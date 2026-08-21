/**
 * Applies the user_preferences table to a database that was provisioned
 * before migrations existed in this repo (the baseline migration cannot be
 * replayed there). Mirrors migrations/0003_plain_post.sql. Every statement is
 * guarded, so running it more than once is a no-op.
 *
 * Usage:  node --env-file=.env.local scripts/apply-writing-style-migration.mjs
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
    "create user_preferences",
    `CREATE TABLE IF NOT EXISTS "user_preferences" (
      "style_instructions" text,
      "updated_at" timestamp DEFAULT now() NOT NULL,
      "user_id" text PRIMARY KEY NOT NULL,
      "writing_style" text DEFAULT 'personal' NOT NULL
    )`,
  ],
  [
    "fk user_preferences.user_id -> user.id",
    `DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'user_preferences_user_id_user_id_fk'
      ) THEN
        ALTER TABLE "user_preferences"
          ADD CONSTRAINT "user_preferences_user_id_user_id_fk"
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

console.log("\nAll user_preferences objects applied.");
