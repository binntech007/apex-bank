
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { updateInternationalWireStatus } from '@/actions/admin';

import {
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';

interface Props {
  wireId: string;
}

export default function ApproveRejectTransactionButton({
  wireId,
}: Props) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleAction = (status: 'completed' | 'rejected') => {
    setError('');

    if (
      status === 'rejected' &&
      !window.confirm('Are you sure you want to reject this transfer?')
    ) {
      return;
    }

    startTransition(async () => {
      const result = await updateInternationalWireStatus(
        wireId,
        status
      );

      if (!result.success) {
        setError(result.error || 'Transaction could not be processed.');
        return;
      }

      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-end gap-2 min-w-[150px]">

      <div className="flex items-center justify-end gap-2">

        <button
          type="button"
          onClick={() => handleAction('completed')}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <CheckCircle2 size={13} />
          )}

          Approve
        </button>

        <button
          type="button"
          onClick={() => handleAction('rejected')}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-[10px] font-bold text-red-400 hover:bg-red-500 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <XCircle size={13} />

          Reject
        </button>

      </div>

      {error && (
        <p className="max-w-[200px] text-right text-[10px] text-red-400">
          {error}
        </p>
      )}

    </div>
  );
}
