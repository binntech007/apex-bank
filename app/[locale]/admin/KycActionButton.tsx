// app/admin/KycActionButton.tsx
'use client';

import { useState } from 'react';
import { updateKycStatus } from '@/actions/admin';
import { Check, X } from 'lucide-react';

export default function KycActionButton({
  userId,
  currentStatus,
}: {
  userId: string;
  currentStatus: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (status: 'approved' | 'rejected') => {
    setLoading(true);
    await updateKycStatus(userId, status);
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {currentStatus !== 'approved' && (
        <button
          onClick={() => handleUpdate('approved')}
          disabled={loading}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-semibold transition disabled:opacity-50"
        >
          <Check size={14} /> Approve
        </button>
      )}

      {currentStatus !== 'rejected' && (
        <button
          onClick={() => handleUpdate('rejected')}
          disabled={loading}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-xs font-semibold transition disabled:opacity-50"
        >
          <X size={14} /> Reject
        </button>
      )}
    </div>
  );
}