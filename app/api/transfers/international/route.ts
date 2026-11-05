import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import {
  ledgerAccounts,
  journalEntries,
  internationalTransfers,
} from '@/lib/db/schema';
import { InternationalWireSchema } from '@/lib/validations/transfer';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. Read request body
    const body = await req.json();

    const {
      sourceAccountId,
      pin,
      ...wireData
    } = body;

    // 3. Validate source account
    if (!sourceAccountId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Source vault is required.',
        },
        { status: 400 }
      );
    }

    // 4. Validate transaction PIN
    if (!pin || typeof pin !== 'string' || pin.length !== 4) {
      return NextResponse.json(
        {
          success: false,
          message: 'A valid 4-digit transaction PIN is required.',
        },
        { status: 400 }
      );
    }

    // 5. Validate international wire data
    const validatedData = InternationalWireSchema.parse(wireData);

    const transferAmount = parseFloat(validatedData.amount);

    if (!Number.isFinite(transferAmount) || transferAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid transfer amount.',
        },
        { status: 400 }
      );
    }

    // 6. Database transaction
    const result = await db.transaction(async (tx) => {
      // Find the source account
      const [sourceAccount] = await tx
        .select()
        .from(ledgerAccounts)
        .where(eq(ledgerAccounts.id, sourceAccountId));

      // Make sure the account exists
      if (!sourceAccount) {
        throw new Error('Source vault not found.');
      }

      // Make sure this account belongs to the logged-in user
      if (sourceAccount.userId !== userId) {
        throw new Error(
          'You are not authorized to use this source vault.'
        );
      }

      // Check current balance
      const currentBalance = parseFloat(
        sourceAccount.balance || '0'
      );

      if (!Number.isFinite(currentBalance)) {
        throw new Error(
          'Unable to determine source account balance.'
        );
      }

      // Check sufficient funds
      if (currentBalance < transferAmount) {
        throw new Error(
          'Insufficient funds in the selected vault.'
        );
      }

      /*
       * IMPORTANT:
       *
       * We DO NOT deduct the balance here.
       *
       * We DO NOT create a ledgerLines debit here.
       *
       * The transfer remains pending until an administrator
       * approves it.
       */

      // 7. Create pending journal entry
      const [journal] = await tx
        .insert(journalEntries)
        .values({
          description: `Outbound Wire: ${validatedData.recipientName} (${validatedData.swiftBic})`,
          idempotencyKey: crypto.randomUUID(),
          status: 'pending',
        })
        .returning({
          id: journalEntries.id,
        });

      if (!journal) {
        throw new Error(
          'Failed to create transfer journal.'
        );
      }

      // 8. Create pending international transfer
      const [transfer] = await tx
        .insert(internationalTransfers)
        .values({
          journalEntryId: journal.id,

          recipientName: validatedData.recipientName,
          recipientAddress: validatedData.recipientAddress,
          recipientCountry: validatedData.recipientCountry,

          swiftBic: validatedData.swiftBic,
          ibanAccountNumber: validatedData.ibanAccountNumber,

          bankName: validatedData.bankName,
          bankAddress: validatedData.bankAddress || null,
          routingNumber: validatedData.routingNumber || null,

          status: 'pending',

          amount: transferAmount.toFixed(2),

          sourceAccountId: sourceAccountId,
        })
        .returning({
          id: internationalTransfers.id,
        });

      if (!transfer) {
        throw new Error(
          'Failed to create international transfer.'
        );
      }

      return {
        transferId: transfer.id,
        journalId: journal.id,
        status: 'pending',
        amount: transferAmount.toFixed(2),
      };
    });

    // 9. Return pending response
    return NextResponse.json(
      {
        success: true,
        status: 'pending',
        message:
          'International wire transfer submitted successfully and is pending admin review.',
        data: result,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error(
      'International wire transfer error:',
      error
    );

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          'Failed to process international wire transfer.',
      },
      { status: 500 }
    );
  }
}