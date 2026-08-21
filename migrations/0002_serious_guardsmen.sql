CREATE TABLE "apikey" (
	"config_id" text DEFAULT 'default' NOT NULL,
	"created_at" timestamp NOT NULL,
	"enabled" boolean DEFAULT true,
	"expires_at" timestamp,
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"last_refill_at" timestamp,
	"last_request" timestamp,
	"metadata" text,
	"name" text,
	"permissions" text,
	"prefix" text,
	"rate_limit_enabled" boolean DEFAULT true,
	"rate_limit_max" integer,
	"rate_limit_time_window" integer,
	"reference_id" text NOT NULL,
	"refill_amount" integer,
	"refill_interval" integer,
	"remaining" integer,
	"request_count" integer DEFAULT 0,
	"start" text,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "apikey" ADD CONSTRAINT "apikey_reference_id_user_id_fk" FOREIGN KEY ("reference_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;