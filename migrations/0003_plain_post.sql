CREATE TABLE "user_preferences" (
	"style_instructions" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" text PRIMARY KEY NOT NULL,
	"writing_style" text DEFAULT 'personal' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;