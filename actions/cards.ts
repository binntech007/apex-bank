
'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { cards, ledgerAccounts } from '@/lib/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const CARD_PRICES = {
  virtual: 5.00,
  metal: 50.00,
} as const;

// IMPORTANT: Keep this private. Do not export it from a
// file containing 'use server'.
const SUPPORTED_CARD_CURRENCIES = [
  'CAD',
  'USD',
  'EUR',
  'GBP',
  'AUD',
] as const;

type CardType = keyof typeof CARD_PRICES;
type CustomerCardStatus = 'active' | 'frozen';

function isSupportedCurrency(currency: string) {
  return SUPPORTED_CARD_CURRENCIES.includes(
    currency.toUpperCase() as (typeof SUPPORTED_CARD_CURRENCIES)[number]
  );
}

function refreshCardPaths() {
  revalidatePath('/dashboard/cards');
  revalidatePath('/admin/cards');
}

// GET CUSTOMER CARDS
export async function getUserCards() {
  try {
    const session = await auth();

    if (!session?.user?.id) return [];

    const userCards = await db
      .select()
      .from(cards)
      .where(eq(cards.userId, session.user.id));

    return userCards.map((card) => ({
      id: card.id,
      type: card.type as CardType,
      cardNumber: card.cardNumber,
      cardholderName: card.cardholderName,
      expiry: card.expiry,
      cvv: 'N/A',
      status: card.status as
        | 'pending'
        | 'active'
        | 'frozen'
        | 'rejected',
      spendLimit: Number(card.spendLimit),
      spentThisMonth: Number(card.spentThisMonth),
      createdAt: card.createdAt?.toISOString(),
    }));
  } catch (error) {
    console.error('GET USER CARDS ERROR:', error);
    return [];
  }
}

// GET CUSTOMER VAULTS
export async function getUserVaults() {
  try {
    const session = await auth();

    if (!session?.user?.id) return [];

    const accounts = await db
      .select({
        id: ledgerAccounts.id,
        name: ledgerAccounts.name,
        currency: ledgerAccounts.currency,
        balance: ledgerAccounts.balance,
      })
      .from(ledgerAccounts)
      .where(eq(ledgerAccounts.userId, session.user.id));

    return accounts.map((account) => ({
      id: account.id,
      name: account.name,
      currency: account.currency,
      balance: Number(account.balance),
    }));
  } catch (error) {
    console.error('GET USER VAULTS ERROR:', error);
    return [];
  }
}

// SUBMIT CARD REQUEST
// No fee is deducted until administrator approval.
export async function purchaseCard(formData: {
  ledgerAccountId: string;
  type: CardType;
  cardholderName: string;
}) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Please log in to continue.',
      };
    }

    const { ledgerAccountId, type, cardholderName } = formData;

    if (!ledgerAccountId || !type || !cardholderName) {
      return {
        success: false,
        error: 'Please complete all required fields.',
      };
    }

    if (!(type in CARD_PRICES)) {
      return {
        success: false,
        error: 'Invalid card type selected.',
      };
    }

    const cleanName = cardholderName.trim().slice(0, 100);

    if (!cleanName) {
      return {
        success: false,
        error: 'Please enter a valid cardholder name.',
      };
    }

    // Verify vault ownership.
    const [account] = await db
      .select({
        id: ledgerAccounts.id,
        currency: ledgerAccounts.currency,
      })
      .from(ledgerAccounts)
      .where(
        and(
          eq(ledgerAccounts.id, ledgerAccountId),
          eq(ledgerAccounts.userId, session.user.id)
        )
      )
      .limit(1);

    if (!account) {
      return {
        success: false,
        error: 'Selected vault was not found or does not belong to you.',
      };
    }

    const currency = account.currency?.toUpperCase();

    if (!currency || !isSupportedCurrency(currency)) {
      return {
        success: false,
        error:
          'Unsupported vault currency. Supported currencies are CAD, USD, EUR, GBP, and AUD.',
      };
    }

    // Prevent duplicate pending requests.
    const existingRequest = await db
      .select({
        id: cards.id,
      })
      .from(cards)
      .where(
        and(
          eq(cards.userId, session.user.id),
          eq(cards.ledgerAccountId, account.id),
          eq(cards.type, type),
          eq(cards.status, 'pending')
        )
      )
      .limit(1);

    if (existingRequest.length > 0) {
      return {
        success: false,
        error:
          'You already have a pending request for this card type and vault.',
      };
    }

    const cardCost = CARD_PRICES[type];

    await db.insert(cards).values({
      userId: session.user.id,
      ledgerAccountId: account.id,
      type,
      cardNumber: 'PENDING',
      cardholderName: cleanName.toUpperCase(),
      expiry: '--/--',
      cvv: 'N/A',
      status: 'pending',
      spendLimit: type === 'metal' ? '50000.00' : '5000.00',
      spentThisMonth: '0.00',
    });

    refreshCardPaths();

    return {
      success: true,
      message:
        `Your ${type} card request has been submitted successfully. ` +
        `Estimated fee: ${cardCost.toFixed(2)} ${currency}. ` +
        'No money has been deducted. Your request is awaiting administrator approval.',
    };
  } catch (error) {
    console.error('PURCHASE CARD DATABASE ERROR:', error);

    return {
      success: false,
      error: 'Unable to submit your card request. Please try again.',
    };
  }
}

// CUSTOMER FREEZE / UNFREEZE CARD
export async function updateCustomerCardStatus(
  cardId: string,
  nextStatus: CustomerCardStatus
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Please log in to continue.',
      };
    }

    if (!cardId || !['active', 'frozen'].includes(nextStatus)) {
      return {
        success: false,
        error: 'Invalid card status request.',
      };
    }

    const [card] = await db
      .select({
        id: cards.id,
        status: cards.status,
      })
      .from(cards)
      .where(
        and(
          eq(cards.id, cardId),
          eq(cards.userId, session.user.id),
          or(
            eq(cards.status, 'active'),
            eq(cards.status, 'frozen')
          )
        )
      )
      .limit(1);

    if (!card) {
      return {
        success: false,
        error: 'Card not found, not owned by you, or not yet approved.',
      };
    }

    if (card.status === nextStatus) {
      return {
        success: true,
        message:
          nextStatus === 'active'
            ? 'Your card is already active.'
            : 'Your card is already frozen.',
      };
    }

    const [updatedCard] = await db
      .update(cards)
      .set({
        status: nextStatus,
      })
      .where(
        and(
          eq(cards.id, cardId),
          eq(cards.userId, session.user.id),
          eq(cards.status, card.status)
        )
      )
      .returning({
        id: cards.id,
        status: cards.status,
      });

    if (!updatedCard) {
      return {
        success: false,
        error: 'Your card status could not be updated. Please try again.',
      };
    }

    refreshCardPaths();

    return {
      success: true,
      status: updatedCard.status,
      message:
        nextStatus === 'frozen'
          ? 'Your card has been frozen successfully.'
          : 'Your card has been activated successfully.',
    };
  } catch (error) {
    console.error('UPDATE CUSTOMER CARD STATUS ERROR:', error);

    return {
      success: false,
      error: 'Unable to update your card status. Please try again.',
    };
  }
}
