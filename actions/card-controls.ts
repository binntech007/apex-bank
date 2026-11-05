'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { cards } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache'; // 👈 Fixed: imported from 'next/cache'
// 📥 Fetch card details for a specific card, or automatically load the user's first card


export async function getCardControls(cardId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized.' };
    }

    // Query for a specific card ID or default to the user's first card 🔍
    const whereClause = cardId
      ? and(eq(cards.id, cardId), eq(cards.userId, session.user.id))
      : eq(cards.userId, session.user.id);

    const [card] = await db
      .select()
      .from(cards)
      .where(whereClause)
      .limit(1);

    if (!card) {
      return { success: false, error: 'No card found for this account.' };
    }

    return { success: true, card };
  } catch (err) {
    console.error('Error fetching card controls:', err);
    return { success: false, error: 'Failed to load card settings.' };
  }
}
// 🎛️ Update a single toggle setting (International, ATM, Online, or Status)
export async function updateCardSetting(
  cardId: string,
  field: 'status' | 'isInternationalEnabled' | 'isAtmEnabled' | 'isOnlineEnabled',
  value: boolean | 'active' | 'frozen'
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized.' };
    }

    await db
      .update(cards)
      .set({ [field]: value })
      .where(and(eq(cards.id, cardId), eq(cards.userId, session.user.id)));

    revalidatePath('/dashboard/settings/card-controls');
    return { success: true, message: 'Card setting updated.' };
  } catch (err) {
    console.error('Error updating card setting:', err);
    return { success: false, error: 'Failed to update setting.' };
  }
}

// 💰 Update spending limit
export async function updateCardLimit(cardId: string, newLimit: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized.' };
    }

    await db
      .update(cards)
      .set({ spendLimit: newLimit })
      .where(and(eq(cards.id, cardId), eq(cards.userId, session.user.id)));

    revalidatePath('/dashboard/settings/card-controls');
    return { success: true, message: 'Spending limit updated.' };
  } catch (err) {
    console.error('Error updating spend limit:', err);
    return { success: false, error: 'Failed to update limit.' };
  }
}