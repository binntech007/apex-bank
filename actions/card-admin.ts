
'use server';

import { randomInt, randomUUID } from 'node:crypto';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import {
  cards,
  users,
  ledgerAccounts,
} from '@/lib/db/schema';

import { eq, sql, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// --------------------------------------------------
// TYPES
// --------------------------------------------------

type CardType = 'virtual' | 'metal';

type CardStatus =
  | 'pending'
  | 'active'
  | 'frozen'
  | 'rejected';

type CardActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

// --------------------------------------------------
// ADMIN AUTHORIZATION
// --------------------------------------------------

async function requireAdmin() {
  const session = await auth();

  const role = String(
    session?.user?.role ?? ''
  ).toUpperCase();

  return Boolean(
    session?.user?.id &&
    role === 'ADMIN'
  );
}

// --------------------------------------------------
// DEMO CARD DETAILS
// --------------------------------------------------

function isLuhnValid(number: string): boolean {
  let sum = 0;
  let doubleDigit = false;

  for (let i = number.length - 1; i >= 0; i--) {
    let digit = Number(number[i]);

    if (doubleDigit) {
      digit *= 2;

      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    doubleDigit = !doubleDigit;
  }

  return sum % 10 === 0;
}

function generateDemoCardNumber(): string {
  let number = '';

  // Generate a random 16-digit number that does not
  // pass the standard payment-card checksum.
  do {
    number = Array.from(
      { length: 16 },
      () => randomInt(0, 10)
    ).join('');
  } while (isLuhnValid(number));

  return number;
}

function generateSimulatedCardDetails() {
  const cardNumber = generateDemoCardNumber();

  // Random expiry between 2 and 5 years ahead.
  const currentDate = new Date();

  const yearsAhead = randomInt(2, 6);
  const month = randomInt(1, 13);

  const expiryYear =
    currentDate.getFullYear() + yearsAhead;

  const expiry =
    `${String(month).padStart(2, '0')}/` +
    `${String(expiryYear).slice(-2)}`;

  return {
    cardNumber,
    expiry,
    cvv: '182',
  };
}

// --------------------------------------------------
// REFRESH PATHS
// --------------------------------------------------

function refreshCardPaths() {
  revalidatePath('/admin/cards');
  revalidatePath('/dashboard/cards');
  revalidatePath('/dashboard/transactions');
}

// --------------------------------------------------
// GET ALL CUSTOMER CARDS
// --------------------------------------------------

export async function getAllCardsForAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('You must be logged in.');
  }

  if (
    String(session.user.role ?? '').toUpperCase() !==
    'ADMIN'
  ) {
    throw new Error(
      'You are not authorized to view cards.'
    );
  }

  try {
    const allCards = await db
      .select({
        id: cards.id,
        userId: cards.userId,

        userName: users.name,
        userEmail: users.email,

        ledgerAccountId: cards.ledgerAccountId,
        ledgerAccountName: ledgerAccounts.name,

        type: cards.type,
        cardNumber: cards.cardNumber,
        cardholderName: cards.cardholderName,
        expiry: cards.expiry,
        status: cards.status,

        spendLimit: cards.spendLimit,
        spentThisMonth: cards.spentThisMonth,

        createdAt: cards.createdAt,
      })
      .from(cards)
      .leftJoin(
        users,
        eq(cards.userId, users.id)
      )
      .leftJoin(
        ledgerAccounts,
        sql`${ledgerAccounts.id}::text = ${cards.ledgerAccountId}`
      );

    return allCards.map((card) => ({
      id: card.id,
      userId: card.userId,

      userName:
        card.userName ?? 'Unknown Customer',

      userEmail:
        card.userEmail ?? '',

      ledgerAccountId: card.ledgerAccountId,

      ledgerAccountName:
        card.ledgerAccountName ?? 'Unknown Vault',

      type: card.type as CardType,

      cardNumber: card.cardNumber,
      cardholderName: card.cardholderName,
      expiry: card.expiry,

      status: card.status as CardStatus,

      spendLimit: Number(card.spendLimit),
      spentThisMonth: Number(card.spentThisMonth),

      createdAt: card.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error(
      'FAILED TO FETCH ADMIN CARDS:',
      error
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to retrieve customer cards.'
    );
  }
}

// --------------------------------------------------
// APPROVE CARD REQUEST
// DEMO ONLY: NO CUSTOMER BALANCE DEDUCTION
// --------------------------------------------------

export async function approveCardRequest(
  cardId: string
): Promise<CardActionResult> {
  try {
    if (!(await requireAdmin())) {
      return {
        success: false,
        error: 'Unauthorized admin session.',
      };
    }

    if (!cardId || typeof cardId !== 'string') {
      return {
        success: false,
        error: 'Invalid card request.',
      };
    }

    await db.transaction(async (tx) => {
      // Lock the card request.
      const [card] = await tx
        .select()
        .from(cards)
        .where(eq(cards.id, cardId))
        .limit(1)
        .for('update');

      if (!card) {
        throw new Error('Card request not found.');
      }

      if (card.status !== 'pending') {
        throw new Error(
          'This card request has already been processed.'
        );
      }

      if (
        card.type !== 'virtual' &&
        card.type !== 'metal'
      ) {
        throw new Error('Invalid card type.');
      }

      // Verify that the customer's vault still exists
      // and belongs to the customer.
      const [account] = await tx
        .select({
          id: ledgerAccounts.id,
        })
        .from(ledgerAccounts)
        .where(
          and(
            sql`${ledgerAccounts.id}::text = ${card.ledgerAccountId}`,
            eq(ledgerAccounts.userId, card.userId)
          )
        )
        .limit(1);

      if (!account) {
        throw new Error(
          'Customer vault not found.'
        );
      }

      // Generate simulated card details.
      const details = generateSimulatedCardDetails();

      // Activate the demo card.
      const [updatedCard] = await tx
        .update(cards)
        .set({
          status: 'active',
          cardNumber: details.cardNumber,
          expiry: details.expiry,
          cvv: details.cvv,
        })
        .where(
          and(
            eq(cards.id, card.id),
            eq(cards.status, 'pending')
          )
        )
        .returning({
          id: cards.id,
        });

      if (!updatedCard) {
        throw new Error(
          'Card could not be activated.'
        );
      }
    });

    refreshCardPaths();

    return {
      success: true,
      message:
        'Demo card request approved successfully.',
    };
  } catch (error) {
    console.error(
      'CARD APPROVAL ERROR:',
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to approve card request.',
    };
  }
}

// --------------------------------------------------
// REJECT CARD REQUEST
// --------------------------------------------------

export async function rejectCardRequest(
  cardId: string
): Promise<CardActionResult> {
  try {
    if (!(await requireAdmin())) {
      return {
        success: false,
        error: 'Unauthorized admin session.',
      };
    }

    if (!cardId) {
      return {
        success: false,
        error: 'Invalid card request.',
      };
    }

    const [updated] = await db
      .update(cards)
      .set({
        status: 'rejected',
      })
      .where(
        and(
          eq(cards.id, cardId),
          eq(cards.status, 'pending')
        )
      )
      .returning({
        id: cards.id,
      });

    if (!updated) {
      return {
        success: false,
        error:
          'Request not found or already processed.',
      };
    }

    refreshCardPaths();

    return {
      success: true,
      message:
        'Card request rejected successfully.',
    };
  } catch (error) {
    console.error(
      'CARD REJECTION ERROR:',
      error
    );

    return {
      success: false,
      error:
        'Failed to reject card request.',
    };
  }
}

// --------------------------------------------------
// ADMIN FREEZE / UNFREEZE CARD
// --------------------------------------------------

export async function toggleCardFreezeAdmin(
  cardId: string
): Promise<CardActionResult> {
  try {
    if (!(await requireAdmin())) {
      return {
        success: false,
        error: 'Unauthorized admin session.',
      };
    }

    if (!cardId) {
      return {
        success: false,
        error: 'Invalid card ID.',
      };
    }

    const result = await db.transaction(
      async (tx) => {
        const [existingCard] = await tx
          .select()
          .from(cards)
          .where(eq(cards.id, cardId))
          .limit(1)
          .for('update');

        if (!existingCard) {
          throw new Error(
            'Card record not found.'
          );
        }

        if (
          existingCard.status !== 'active' &&
          existingCard.status !== 'frozen'
        ) {
          throw new Error(
            'Only approved cards can be frozen or unfrozen.'
          );
        }

        const newStatus =
          existingCard.status === 'active'
            ? 'frozen'
            : 'active';

        await tx
          .update(cards)
          .set({
            status: newStatus,
          })
          .where(
            eq(cards.id, cardId)
          );

        return newStatus;
      }
    );

    refreshCardPaths();

    return {
      success: true,
      message:
        `Card status updated to ${result}.`,
    };
  } catch (error) {
    console.error(
      'TOGGLE CARD STATUS ERROR:',
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update card status.',
    };
  }
}
