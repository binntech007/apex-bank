ALTER TABLE "cards" ALTER COLUMN "ledger_account_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "cards" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_ledger_account_id_ledger_accounts_id_fk" FOREIGN KEY ("ledger_account_id") REFERENCES "public"."ledger_accounts"("id") ON DELETE restrict ON UPDATE no action;