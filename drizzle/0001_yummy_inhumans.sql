CREATE TYPE "public"."api_key_permissions" AS ENUM('read_only', 'full_access');--> statement-breakpoint
CREATE TYPE "public"."beneficiary_relationship" AS ENUM('spouse', 'child', 'parent', 'sibling', 'trust', 'other');--> statement-breakpoint
ALTER TYPE "public"."card_status" ADD VALUE 'pending' BEFORE 'active';--> statement-breakpoint
ALTER TYPE "public"."card_status" ADD VALUE 'rejected';--> statement-breakpoint
ALTER TYPE "public"."currency" ADD VALUE 'MXN';--> statement-breakpoint
ALTER TYPE "public"."currency" ADD VALUE 'PHP';--> statement-breakpoint
ALTER TYPE "public"."currency" ADD VALUE 'THB';--> statement-breakpoint
ALTER TYPE "public"."currency" ADD VALUE 'ZAR';--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"key_prefix" text NOT NULL,
	"hashed_key" text NOT NULL,
	"permissions" "api_key_permissions" DEFAULT 'read_only' NOT NULL,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beneficiaries" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"relationship" "beneficiary_relationship" DEFAULT 'spouse' NOT NULL,
	"allocation_percentage" numeric(5, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"due_date" timestamp NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"journal_entry_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_visitors" (
	"id" text PRIMARY KEY NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"path" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tax_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"tax_residency" text DEFAULT 'United States' NOT NULL,
	"tin" text DEFAULT '***-**-****' NOT NULL,
	"fatca_status" text DEFAULT 'Exempt' NOT NULL,
	"is_us_person" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tax_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_limits" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"daily_limit" numeric(12, 2) DEFAULT '10000.00' NOT NULL,
	"monthly_limit" numeric(12, 2) DEFAULT '100000.00' NOT NULL,
	"single_tx_limit" numeric(12, 2) DEFAULT '5000.00' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_limits_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "verification_codes" (
	"email" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"password" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "is_international_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "is_atm_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "is_online_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "international_transfers" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "international_transfers" ADD COLUMN "amount" numeric(18, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "international_transfers" ADD COLUMN "source_account_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "two_factor_secret" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "two_factor_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_suspended" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "pin" text;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beneficiaries" ADD CONSTRAINT "beneficiaries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_profiles" ADD CONSTRAINT "tax_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_limits" ADD CONSTRAINT "user_limits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "international_transfers" ADD CONSTRAINT "international_transfers_source_account_id_ledger_accounts_id_fk" FOREIGN KEY ("source_account_id") REFERENCES "public"."ledger_accounts"("id") ON DELETE no action ON UPDATE no action;