ALTER TABLE "blogs" ADD COLUMN "source_type" text DEFAULT 'youtube' NOT NULL;--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "original_filename" text;