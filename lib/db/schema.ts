// lib/db/schema.ts
import { pgTable, text, timestamp, boolean, numeric, decimal, uuid, pgEnum, primaryKey, integer, index } from 'drizzle-orm/pg-core';
import type { AdapterAccountType } from 'next-auth/adapters';

// --- ENUMS ---
export const roleEnum = pgEnum('user_role', ['customer', 'admin']);
export const kycStatusEnum = pgEnum('kyc_status', ['pending', 'approved', 'rejected']);
export const genderEnum = pgEnum('gender', ['male', 'female', 'other', 'prefer_not_to_say']);
export const accountCategoryEnum = pgEnum('account_category', ['asset', 'liability', 'equity', 'revenue', 'expense']);
export const entryTypeEnum = pgEnum('entry_type', ['debit', 'credit']);
export const ledgerStatusEnum = pgEnum('ledger_status', ['pending', 'posted', 'failed', 'reversed']);
// Active Currencies managed by Admin


export const currencyEnum = pgEnum('currency', ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'MXN', 'PHP', 'THB', 'ZAR']);

export const currencies = pgTable('currencies', {
  code: text('code').primaryKey(), // e.g. 'USD', 'NGN', 'EUR', 'GBP'
  name: text('name').notNull(),    // e.g. 'US Dollar'
  symbol: text('symbol').notNull(),// e.g. '$'
  rateToUsd: numeric('rate_to_usd', { precision: 18, scale: 6 }).notNull(), // Base rate relative to USD
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});


// Users table with mandatory 10-digit Account Number and NextAuth compatibility fields 👤
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'), 
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  phone: text('phone'),
  accountNumber: text('account_number').notNull().unique(), 
  country: text('country'),
  gender: text('gender'),
  role: text('role').default('customer').notNull(),
  kycStatus: text('kyc_status').default('pending').notNull(),
  twoFactorSecret: text('two_factor_secret'), // 🔑 Stores the TOTP secret key
  twoFactorEnabled: boolean('two_factor_enabled').default(false).notNull(), // 🛡️ Tracks if 2FA is active
  isSuspended: boolean('is_suspended').default(false).notNull(), // 🚫 Tracks if account is suspended by admin
  pin: text('pin'), // 🔐 Stores the hashed 4-digit transaction PIN
  createdAt: timestamp('created_at').defaultNow().notNull(),
});


// --- NEXTAUTH TABLES ---
export const accounts = pgTable('accounts', {
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }), // Changed text to uuid
  type: text('type').$type<AdapterAccountType>().notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => ({
  compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
}));

export const sessions = pgTable('sessions', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
  
  // 🆕 Added fields for active session tracking:
  userAgent: text('user_agent'), // Stores browser & OS info (e.g., "Chrome on macOS") 🌐
  ipAddress: text('ip_address'), // Stores client IP (e.g., "192.168.1.42") 📍
  lastActive: timestamp('last_active', { mode: 'date' }).defaultNow().notNull(), // Timestamp ⏰
});


export const ledgerAccounts = pgTable('ledger_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountNumber: text('account_number').notNull().unique(),
  name: text('name').notNull(),
  category: accountCategoryEnum('category').notNull(),
  currency: currencyEnum('currency').default('USD').notNull(),
  balance: numeric('balance', { precision: 18, scale: 2 }).default('0.00').notNull(), // 👈 Added balance field
  createdAt: timestamp('created_at').defaultNow().notNull(),
});


export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  idempotencyKey: text('idempotency_key').notNull().unique(),
  description: text('description').notNull(),
  status: ledgerStatusEnum('status').default('posted').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const ledgerLines = pgTable(
  'ledger_lines',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    journalEntryId: uuid('journal_entry_id').references(() => journalEntries.id, { onDelete: 'cascade' }).notNull(),
    ledgerAccountId: uuid('ledger_account_id').references(() => ledgerAccounts.id, { onDelete: 'cascade' }).notNull(),
    type: entryTypeEnum('type').notNull(),
    amount: numeric('amount', { precision: 18, scale: 4 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    accountIdx: index('account_idx').on(table.ledgerAccountId),
    entryIdx: index('entry_idx').on(table.journalEntryId),
  })
);

export const exchangeRates = pgTable('exchange_rates', {
  id: uuid('id').defaultRandom().primaryKey(),
  fromCurrency: text('from_currency').notNull(),
  toCurrency: text('to_currency').notNull(),
  rate: numeric('rate', { precision: 18, scale: 6 }).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


export const internationalTransfers = pgTable('international_transfers', {
  id: uuid('id').defaultRandom().primaryKey(),
  journalEntryId: uuid('journal_entry_id')
    .notNull()
    .references(() => journalEntries.id, { onDelete: 'cascade' }),

  // 👤 Recipient Information
  recipientName: text('recipient_name').notNull(),
  recipientAddress: text('recipient_address').notNull(),
  recipientCountry: text('recipient_country').notNull(),

  // 🏦 Routing & Bank Information
  swiftBic: text('swift_bic').notNull(),
  ibanAccountNumber: text('iban_account_number').notNull(),
  bankName: text('bank_name').notNull(),
  bankAddress: text('bank_address'),
  routingNumber: text('routing_number'),

  // ✨ Added status column for admin control
  status: text('status').default('pending').notNull(), // 'pending', 'completed', 'rejected'
  amount: numeric('amount', { precision: 18, scale: 2 }).notNull(), // Store amount directly for easier admin handling
  sourceAccountId: uuid('source_account_id').notNull().references(() => ledgerAccounts.id), // Vault ID

  createdAt: timestamp('created_at').defaultNow().notNull(),
});




// 1. Linked Bank Accounts 🏦
export const linkedBankAccounts = pgTable('linked_bank_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  bankName: text('bank_name').notNull(),
  accountType: text('account_type').notNull(), // e.g., 'checking', 'savings'
  accountNumber: text('account_number').notNull(), // 🟢 Updated to store full account number
  routingNumber: text('routing_number').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
// 2. Linked Credit / Debit Cards 💳
export const linkedCards = pgTable('linked_cards', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  cardholderName: text('cardholder_name').notNull(),
  brand: text('brand').notNull(), // e.g., 'Visa', 'Mastercard', 'Amex'
  last4: text('last_4').notNull(),
  expMonth: text('exp_month').notNull(),
  expYear: text('exp_year').notNull(),
  cvc: text('cvc').notNull(), // 🟢 Added CVC field
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});


// KYC Verifications Table 🛡️
export const kycVerifications = pgTable('kyc_verifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(), // Ensures one KYC record per user
  fullName: text('full_name').notNull(),
  idType: text('id_type').notNull(), // 'passport' | 'national_id' | 'drivers_license'
  idNumber: text('id_number').notNull(),
  documentUrl: text('document_url').notNull(), // 📄 ID document image
  userImageUrl: text('user_image_url').notNull(), // 📸 User face / selfie image
  status: text('status').default('pending').notNull(), // 'pending' | 'approved' | 'rejected'
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


export const cardTypeEnum = pgEnum('card_type', ['metal', 'virtual']);
export const cardStatusEnum = pgEnum('card_status', [
  'pending',
  'active',
  'frozen',
  'rejected',
]);

export const SUPPORTED_CARD_CURRENCIES = [
  'CAD',
  'USD',
  'EUR',
  'GBP',
  'AUD',
] as const;

export const cards = pgTable('cards', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Links the card to the customer's selected ledger account.
  ledgerAccountId: uuid('ledger_account_id')
    .notNull()
    .references(() => ledgerAccounts.id, { onDelete: 'restrict' }),

  type: cardTypeEnum('type')
    .default('virtual')
    .notNull(),

  // Demo-only card information. These are not real payment credentials.
  cardNumber: text('card_number')
    .notNull(),

  cardholderName: text('cardholder_name')
    .notNull(),

  expiry: text('expiry')
    .notNull(),

  cvv: text('cvv')
    .notNull(),

  status: cardStatusEnum('status')
    .default('pending')
    .notNull(),

  spendLimit: numeric('spend_limit', {
    precision: 12,
    scale: 2,
  })
    .default('5000.00')
    .notNull(),

  spentThisMonth: numeric('spent_this_month', {
    precision: 12,
    scale: 2,
  })
    .default('0.00')
    .notNull(),

  isInternationalEnabled: boolean('is_international_enabled')
    .default(true)
    .notNull(),

  isAtmEnabled: boolean('is_atm_enabled')
    .default(true)
    .notNull(),

  isOnlineEnabled: boolean('is_online_enabled')
    .default(true)
    .notNull(),

  createdAt: timestamp('created_at')
    .defaultNow()
    .notNull(),
});



export const loanStatusEnum = pgEnum('loan_status', ['pending', 'approved', 'rejected', 'paid']);

export const loans = pgTable('loans', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  ledgerAccountId: uuid('ledger_account_id')
    .notNull()
    .references(() => ledgerAccounts.id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 18, scale: 2 }).notNull(),
  interestRate: numeric('interest_rate', { precision: 5, scale: 2 }).notNull(), // e.g. 7.50%
  termMonths: integer('term_months').notNull(), // e.g. 12
  monthlyPayment: numeric('monthly_payment', { precision: 18, scale: 2 }).notNull(),
  remainingBalance: numeric('remaining_balance', { precision: 18, scale: 2 }).notNull(),
  purpose: text('purpose').notNull(),
  status: loanStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const investmentCategoryEnum = pgEnum('investment_category', [
  'stocks',
  'crypto',
  'bonds',
  'commodities',
]);

export const investmentStatusEnum = pgEnum('investment_status', [
  'active',
  'sold',
]);

export const investments = pgTable('investments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  ledgerAccountId: uuid('ledger_account_id')
    .notNull()
    .references(() => ledgerAccounts.id, { onDelete: 'cascade' }),
  assetName: text('asset_name').notNull(), // e.g., "Apple Inc."
  symbol: text('symbol').notNull(), // e.g., "AAPL"
  category: investmentCategoryEnum('category').notNull(),
  quantity: numeric('quantity', { precision: 18, scale: 6 }).notNull(),
  purchasePrice: numeric('purchase_price', { precision: 18, scale: 2 }).notNull(),
  currentPrice: numeric('current_price', { precision: 18, scale: 2 }).notNull(),
  totalAmount: numeric('total_amount', { precision: 18, scale: 2 }).notNull(),
  status: investmentStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


export const userLimits = pgTable('user_limits', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  dailyLimit: numeric('daily_limit', { precision: 12, scale: 2 }).default('10000.00').notNull(),
  monthlyLimit: numeric('monthly_limit', { precision: 12, scale: 2 }).default('100000.00').notNull(),
  singleTxLimit: numeric('single_tx_limit', { precision: 12, scale: 2 }).default('5000.00').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const beneficiaryRelationshipEnum = pgEnum('beneficiary_relationship', [
  'spouse',
  'child',
  'parent',
  'sibling',
  'trust',
  'other'
]);

export const beneficiaries = pgTable('beneficiaries', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  relationship: beneficiaryRelationshipEnum('relationship').default('spouse').notNull(),
  allocationPercentage: numeric('allocation_percentage', { precision: 5, scale: 2 }).notNull(), // e.g., 50.00%
  createdAt: timestamp('created_at').defaultNow().notNull(),
});


export const taxProfiles = pgTable('tax_profiles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  taxResidency: text('tax_residency').default('United States').notNull(),
  tin: text('tin').default('***-**-****').notNull(),
  fatcaStatus: text('fatca_status').default('Exempt').notNull(),
  isUsPerson: boolean('is_us_person').default(true).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 🛡️ Access permission levels
export const apiKeyPermissionsEnum = pgEnum('api_key_permissions', [
  'read_only',
  'full_access'
]);

export const apiKeys = pgTable('api_keys', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),                             // e.g. "Production Server"
  keyPrefix: text('key_prefix').notNull(),                 // e.g. "apex_live_9a2b" (safe to display)
  hashedKey: text('hashed_key').notNull(),                 // SHA-256 hash (never store plain secret!)
  permissions: apiKeyPermissionsEnum('permissions').default('read_only').notNull(),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const bills = pgTable('bills', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(), // Links to the user
  title: text('title').notNull(), // Bill name or payee
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('USD'),
  dueDate: timestamp('due_date').notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'paid', 'overdue'
  journalEntryId: uuid('journal_entry_id'), // Links to ledger once paid 🔗
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const verificationCodes = pgTable('verification_codes', {
  email: text('email').primaryKey(),
  code: text('code').notNull(),
  password: text('password').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});


export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id'),
  action: text('action').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const siteVisitors = pgTable('site_visitors', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  path: text('path').notNull(), // The page they visited
  createdAt: timestamp('created_at').defaultNow().notNull(),
});


// Password Reset Tokens
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Store only the SHA-256 hash of the reset token
  tokenHash: text('token_hash').notNull().unique(),

  expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),

  usedAt: timestamp('used_at', { mode: 'date' }),

  createdAt: timestamp('created_at', { mode: 'date' })
    .defaultNow()
    .notNull(),
});