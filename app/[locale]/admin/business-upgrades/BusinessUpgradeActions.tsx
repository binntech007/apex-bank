
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import {
  updateBusinessApplicationStatus,
} from '@/actions/business-account-admin';

import {
  CheckCircle2,
  XCircle,
  Clock3,
  Loader2,
} from 'lucide-react';

type Props = {
  applicationId: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  rejectionReason?: string | null;
};

export default function BusinessUpgradeActions({
  applicationId,
  status,
  rejectionReason,
}: Props) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');

  const isFinal =
    status === 'approved' || status === 'rejected';

  function handleUpdate(
    newStatus: 'under_review' | 'approved' | 'rejected'
  ) {
    setMessage('');

    if (newStatus === 'rejected' && !reason.trim()) {
      setMessage('Please enter a rejection reason.');
      return;
    }

    if (
      newStatus === 'approved' &&
      !window.confirm(
        'Approve this application and upgrade the associated savings account to a business account?'
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await updateBusinessApplicationStatus(
        applicationId,
        newStatus,
        newStatus === 'rejected' ? reason : undefined
      );

      if (!result.success) {
        setMessage(result.error || 'Something went wrong.');
        return;
      }

      setMessage(result.message || 'Application updated.');
      setShowRejectForm(false);
      setReason('');

      router.refresh();
    });
  }

  if (isFinal) {
    return (
      <div className="space-y-2">
        {status === 'approved' ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold uppercase text-emerald-400">
            <CheckCircle2 size={13} />
            Approved
          </span>
        ) : (
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[10px] font-bold uppercase text-red-400">
              <XCircle size={13} />
              Rejected
            </span>

            {rejectionReason && (
              <p className="max-w-xs text-[11px] text-slate-400">
                Reason: {rejectionReason}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-w-[190px] space-y-2">
      {status === 'pending' && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleUpdate('under_review')}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] font-semibold text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Clock3 size={13} />
          )}
          Mark Under Review
        </button>
      )}

      <button
        type="button"
        disabled={isPending}
        onClick={() => handleUpdate('approved')}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <CheckCircle2 size={13} />
        )}
        Approve Application
      </button>

      {!showRejectForm ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => setShowRejectForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
        >
          <XCircle size={13} />
          Reject Application
        </button>
      ) : (
        <div className="space-y-2 rounded-lg border border-red-500/20 bg-[#0B0F17] p-3">
          <label className="block text-[11px] font-semibold text-slate-300">
            Rejection reason
          </label>

          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Explain why this application is being rejected..."
            rows={3}
            maxLength={1000}
            className="w-full resize-y rounded-lg border border-[#263346] bg-[#151C28] p-2 text-xs text-white outline-none placeholder:text-slate-500 focus:border-red-500/50"
          />

          <div className="flex gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleUpdate('rejected')}
              className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-red-500 disabled:opacity-50"
            >
              {isPending ? 'Processing...' : 'Confirm Rejection'}
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setShowRejectForm(false);
                setReason('');
                setMessage('');
              }}
              className="rounded-lg border border-[#263346] px-3 py-2 text-[11px] font-semibold text-slate-300 hover:bg-[#263346]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {message && (
        <p className="text-[11px] text-amber-300">
          {message}
        </p>
      )}
    </div>
  );
}
