ALTER TABLE "ledger_accounts" ADD COLUMN "account_type" "bank_account_type" DEFAULT 'savings' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "account_type";