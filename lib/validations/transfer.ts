// lib/validations/transfer.ts
import { z } from 'zod';

export const InternationalWireSchema = z.object({
  // 1. Recipient Information 👤
  recipientName: z.string().min(2, 'Recipient name is required'),
  recipientAddress: z.string().min(5, 'Full physical address is required'),
  recipientCountry: z.string().min(2, 'Country is required'),

  // 2. Bank & Routing Identifiers 🏦
  bankName: z.string().min(2, 'Bank name is required'),
  bankAddress: z.string().optional(),
  
  // SWIFT/BIC codes are 8 or 11 alphanumeric characters 🔤
  swiftBic: z
    .string()
    .regex(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/i, 'Invalid SWIFT/BIC code format'),

  // Account / IBAN Number 💳
  ibanAccountNumber: z
    .string()
    .min(5, 'Valid IBAN or account number is required'),

  routingNumber: z.string().optional(),

  // 3. Financial Amount 💰
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
});

export type InternationalWireInput = z.infer<typeof InternationalWireSchema>;