CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"policy" text NOT NULL,
	"process" text DEFAULT '' NOT NULL,
	"source_url" text,
	"source_note" text,
	"city" text,
	"industry" text,
	"updated_at" integer DEFAULT extract(epoch from now())::int NOT NULL,
	CONSTRAINT "companies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "revisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"kind" text NOT NULL,
	"before" text,
	"after" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"editor_hash" text,
	"created_at" integer DEFAULT extract(epoch from now())::int NOT NULL
);
--> statement-breakpoint
ALTER TABLE "revisions" ADD CONSTRAINT "revisions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "companies_policy_idx" ON "companies" USING btree ("policy");--> statement-breakpoint
CREATE INDEX "revisions_created_idx" ON "revisions" USING btree ("created_at");