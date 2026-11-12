CREATE TYPE "public"."bank_account_type" AS ENUM('savings', 'business');--> statement-breakpoint
CREATE TYPE "public"."business_upgrade_status" AS ENUM('pending', 'under_review', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "business_account_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ledger_account_id" uuid NOT NULL,
	"business_name" text NOT NULL,
	"business_type" text NOT NULL,
	"business_description" text NOT NULL,
	"registration_number" text,
	"tax_identification_number" text,
	"business_email" text NOT NULL,
	"business_phone" text NOT NULL,
	"business_address" text NOT NULL,
	"business_country" text NOT NULL,
	"registration_document_url" text,
	"proof_of_address_url" text NOT NULL,
	"identity_document_url" text NOT NULL,
	"status" "business_upgrade_status" DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"rejection_reason" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_type" "bank_account_type" DEFAULT 'savings' NOT NULL;--> statement-breakpoint
ALTER TABLE "business_account_applications" ADD CONSTRAINT "business_account_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_account_applications" ADD CONSTRAINT "business_account_applications_ledger_account_id_ledger_accounts_id_fk" FOREIGN KEY ("ledger_account_id") REFERENCES "public"."ledger_accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_account_applications" ADD CONSTRAINT "business_account_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;