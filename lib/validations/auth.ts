// lib/validations/auth.ts (or wherever your current schema file is located)
import { z } from 'zod';

export const CustomerRegisterSchema = z.object({
  fullName: z.string().min(2, 'Full legal name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  country: z.string().min(2, 'Please select your country'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  primaryCurrency: z.enum(['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'THB', 'ZAR']),
  streetAddress: z.string().min(5, 'Address required'),
  governmentId: z.string().min(5, 'Government ID required'),
});

export type CustomerRegisterInput = z.infer<typeof CustomerRegisterSchema>;

// 🆕 Export the CurrencyCode type derived directly from the schema enum
export type CurrencyCode = z.infer<typeof CustomerRegisterSchema.shape.primaryCurrency>;