'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { apiKeys } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

// 📥 Fetch all API keys for the current user
export async function getApiKeys() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized.' };
    }

    const list = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        keyPrefix: apiKeys.keyPrefix,
        permissions: apiKeys.permissions,
        lastUsedAt: apiKeys.lastUsedAt,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.userId, session.user.id));

    return { success: true, keys: list };
  } catch (err) {
    console.error('Error fetching API keys:', err);
    return { success: false, error: 'Failed to load API keys.' };
  }
}

// ➕ Generate a new API Key pair
export async function generateApiKey(data: {
  name: string;
  permissions: 'read_only' | 'full_access';
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized.' };
    }

    // 1. Generate raw secret string (e.g., apex_live_3f9a...)
    const randomSecret = crypto.randomBytes(24).toString('hex');
    const rawKey = `apex_live_${randomSecret}`;

    // 2. Extract public prefix for identification (first 13 chars)
    const keyPrefix = rawKey.slice(0, 13) + '...';

    // 3. Hash secret key with SHA-256 before saving to DB 🛡️
    const hashedKey = crypto
      .createHash('sha256')
      .update(rawKey)
      .digest('hex');

    // 4. Save metadata and hash to DB
    const [inserted] = await db
      .insert(apiKeys)
      .values({
        userId: session.user.id,
        name: data.name,
        keyPrefix,
        hashedKey,
        permissions: data.permissions,
      })
      .returning();

    revalidatePath('/dashboard/settings/api-keys');

    // ⚠️ Return raw key ONLY ONCE so the user can copy it!
    return {
      success: true,
      rawKey,
      key: inserted,
    };
  } catch (err) {
    console.error('Error generating API key:', err);
    return { success: false, error: 'Failed to generate API key.' };
  }
}

// 🗑️ Revoke an API Key
export async function revokeApiKey(keyId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized.' };
    }

    await db
      .delete(apiKeys)
      .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, session.user.id)));

    revalidatePath('/dashboard/settings/api-keys');
    return { success: true, message: 'API key revoked successfully.' };
  } catch (err) {
    console.error('Error revoking API key:', err);
    return { success: false, error: 'Failed to revoke API key.' };
  }
}