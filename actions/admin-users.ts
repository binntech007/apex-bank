// actions/admin-users.ts
'use server';

import { db } from '@/lib/db';
import { users, ledgerAccounts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getAllUsersWithBalance() {
  try {
    // 1. Fetch all users and all ledger accounts (vaults) from the database
    const allUsers = await db.select().from(users);
    const allLedgers = await db.select().from(ledgerAccounts);

    // 2. Map users and attach their corresponding vaults and total balance
    const records = allUsers.map((user) => {
      // Find all ledger accounts belonging to this user
      const userVaults = allLedgers.filter((ledger) => ledger.userId === user.id);

      // Sum up the balances across all their vaults
      const totalBalance = userVaults.reduce(
        (sum, vault) => sum + parseFloat(String(vault.balance || 0)),
        0
      );

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        accountNumber: user.accountNumber,
        kycStatus: user.kycStatus,
        isSuspended: user.isSuspended,
        balance: totalBalance.toFixed(2), // Formatted total balance for the table
        // ✨ Pass the structured vaults array so the modal dropdown populates correctly
        vaults: userVaults.map((vault) => ({
          id: vault.id,
          name: vault.name,
          currency: vault.currency,
          accountNumber: vault.accountNumber,
          balance: vault.balance,
        })),
      };
    });

    return { success: true, data: records };
  } catch (error: any) {
    console.error('Error fetching users with balances:', error);
    return { success: false, data: [] };
  }
}