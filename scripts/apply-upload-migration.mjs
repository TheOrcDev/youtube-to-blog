/**
 * Applies the video-upload columns to a database that was provisioned before
 * migrations existed in this repo (the baseline migration cannot be replayed
 * there). Mirrors migrations/0001_clammy_carnage.sql. Every statement is
 * guarded, so running it more than once is a no-op.
 *
 * Usage:  node --env-file=.env.local scripts/apply-upload-migration.mjs
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
    "blogs.source_type",
    `ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "source_type" text DEFAULT 'youtube' NOT NULL`,
  ],
  [
    "blogs.original_filename",
    `ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "original_filename" text`,
  ],
];

for (const [label, statement] of statements) {
  await sql.query(statement);
  console.log("✓", label);
}

console.log("\nAll upload columns applied.");
