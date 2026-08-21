/**
 * Applies the better-auth 1.7 account identity change to an existing database:
 * adds the required "issuer" column, backfills it per the 1.7 upgrade guide
 * (Google OIDC rows get Google's issuer, credential rows get
 * "local:credential"), then enforces NOT NULL and the unique compound index.
 * Mirrors migrations/0004_cultured_annihilus.sql. Every statement is guarded,
 * so running it more than once is a no-op.
 *
 * Usage:  node --env-file=.env.local scripts/apply-account-issuer-migration.mjs
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
    "add issuer (nullable for backfill)",
    `ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "issuer" text`,
  ],
  [
    "backfill google rows",
    `UPDATE "account"
      SET "issuer" = 'https://accounts.google.com'
      WHERE "issuer" IS NULL AND "provider_id" = 'google'`,
  ],
  [
    "backfill credential rows",
    `UPDATE "account"
      SET "issuer" = 'local:credential'
      WHERE "issuer" IS NULL AND "provider_id" = 'credential'`,
  ],
  [
    "backfill any other providers (synthetic issuer)",
    `UPDATE "account"
      SET "issuer" = 'local:oauth:' || "provider_id"
      WHERE "issuer" IS NULL`,
  ],
  [
    "enforce not null",
    `ALTER TABLE "account" ALTER COLUMN "issuer" SET NOT NULL`,
  ],
  [
    "unique compound index on (issuer, account_id)",
    `CREATE UNIQUE INDEX IF NOT EXISTS "account_issuer_accountId_uidx"
      ON "account" USING btree ("issuer", "account_id")`,
  ],
];

for (const [label, statement] of statements) {
  await sql.query(statement);
  console.log("✓", label);
}

console.log("\nAccount issuer migration applied.");
