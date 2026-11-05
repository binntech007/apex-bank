// app/admin/transactions/ReverseButton.tsx
'use client';

import { useState } from 'react';
import { reverseTransaction } from '@/actions/admin';
import { RotateCcw } from 'lucide-react';

export default function ReverseButton({ transactionId }: { transactionId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleReverse = async () => {
    if (!confirm('Are you sure you want to reverse this transaction? This will adjust the user account balance.')) {
      return;
    }

    setIsLoading(true);
    const res = await reverseTransaction(transactionId);
    if (res.success) {
      alert('Transaction reversed successfully.');
    } else {
      alert(res.error || 'Failed to reverse transaction.');
    }
    setIsLoading(false);
  };

  const handleCustomClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleReverse();
  };

  return (
    <button
      onClick={handleCustomClick}
      disabled={isLoading}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-[11px] font-semibold transition disabled:opacity-50"
      title="Reverse Transaction"
    >
      <RotateCcw size={12} className={isLoading ? 'animate-spin' : ''} />
      <span>{isLoading ? 'Reversing...' : 'Reverse'}</span>
    </button>
  );
}