ALTER TABLE "business_account_applications" ALTER COLUMN "business_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "business_account_applications" ALTER COLUMN "business_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "business_account_applications" ALTER COLUMN "business_description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "business_account_applications" ALTER COLUMN "business_email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "business_account_applications" ALTER COLUMN "business_phone" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "business_account_applications" ALTER COLUMN "business_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "business_account_applications" ALTER COLUMN "business_country" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "business_account_applications" ALTER COLUMN "proof_of_address_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "business_account_applications" ALTER COLUMN "identity_document_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "business_account_applications" ADD COLUMN "occupation" text NOT NULL;--> statement-breakpoint
ALTER TABLE "business_account_applications" ADD COLUMN "employer_name" text;--> statement-breakpoint
ALTER TABLE "business_account_applications" ADD COLUMN "income_source" text NOT NULL;--> statement-breakpoint
ALTER TABLE "business_account_applications" ADD COLUMN "monthly_income_range" text NOT NULL;--> statement-breakpoint
ALTER TABLE "business_account_applications" ADD COLUMN "account_purpose" text NOT NULL;