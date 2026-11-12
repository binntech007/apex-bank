
// app/admin/business-upgrades/page.tsx

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import { getBusinessUpgradeApplications } from '@/actions/business-account-admin';

import BusinessUpgradeActions from './BusinessUpgradeActions';

import {
  ArrowLeft,
  BriefcaseBusiness,
  Users,
  Clock3,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Wallet,
  ShieldAlert,
} from 'lucide-react';

function formatAmount(amount: string | number, currency: string) {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return `${amount} ${currency}`;
  }

  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-400">
        <Clock3 size={12} />
        Pending
      </span>
    );
  }

  if (status === 'under_review') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-blue-400">
        <ShieldAlert size={12} />
        Under Review
      </span>
    );
  }

  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-400">
        <CheckCircle2 size={12} />
        Approved
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-red-400">
      <XCircle size={12} />
      Rejected
    </span>
  );
}

export default async function AdminBusinessUpgradesPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  const { applications, success, error } =
    await getBusinessUpgradeApplications();

  const pendingCount = applications.filter(
    (application) => application.status === 'pending'
  ).length;

  const reviewCount = applications.filter(
    (application) => application.status === 'under_review'
  ).length;

  const approvedCount = applications.filter(
    (application) => application.status === 'approved'
  ).length;

  const rejectedCount = applications.filter(
    (application) => application.status === 'rejected'
  ).length;

  return (
    <div className="min-h-screen bg-obsidian p-6 font-sans text-[#E2E8F0] lg:p-10">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-4 border-b border-[#263346] pb-6 md:flex-row md:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-violet-400">
              <BriefcaseBusiness size={14} />
              Business Account Management
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Business Upgrade Applications
            </h1>

            <p className="mt-1 text-xs text-slate-400">
              Review customer applications and manage savings account upgrades.
            </p>
          </div>

          <Link
            href="/admin"
            className="flex w-fit items-center gap-2 rounded-xl border border-[#263346] bg-[#151C28] px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-[#263346]"
          >
            <ArrowLeft size={14} />
            Back to Admin Dashboard
          </Link>
        </div>

        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-[#263346] bg-[#151C28] p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Applications
              </p>
              <Users size={18} className="text-violet-400" />
            </div>

            <h2 className="mt-3 text-2xl font-bold text-white">
              {applications.length}
            </h2>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-[#151C28] p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Pending
              </p>
              <Clock3 size={18} className="text-amber-400" />
            </div>

            <h2 className="mt-3 text-2xl font-bold text-amber-400">
              {pendingCount}
            </h2>
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-[#151C28] p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Under Review
              </p>
              <ShieldAlert size={18} className="text-blue-400" />
            </div>

            <h2 className="mt-3 text-2xl font-bold text-blue-400">
              {reviewCount}
            </h2>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-[#151C28] p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Approved
              </p>
              <CheckCircle2 size={18} className="text-emerald-400" />
            </div>

            <h2 className="mt-3 text-2xl font-bold text-emerald-400">
              {approvedCount}
            </h2>
          </div>
        </div>

        {/* REJECTED COUNT */}

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <XCircle size={14} className="text-red-400" />
          Rejected applications: {rejectedCount}
        </div>

        {/* APPLICATION TABLE */}

        <div className="overflow-hidden rounded-2xl border border-[#263346] bg-[#151C28] shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-[#263346] p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-300">
                Customer Applications
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Review application details and record your decision.
              </p>
            </div>

            <span className="text-xs font-mono text-slate-400">
              {applications.length} Records Loaded
            </span>
          </div>

          {!success ? (
            <div className="p-10 text-center">
              <XCircle className="mx-auto mb-3 text-red-400" size={28} />

              <p className="text-sm font-semibold text-red-400">
                Could not load applications
              </p>

              <p className="mt-2 text-xs text-slate-400">
                {error || 'Please refresh the page and try again.'}
              </p>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center">
              <BriefcaseBusiness
                className="mx-auto mb-3 text-slate-500"
                size={34}
              />

              <h3 className="text-sm font-bold text-white">
                No Business Upgrade Applications
              </h3>

              <p className="mt-2 text-xs text-slate-400">
                Customer applications will appear here when submitted.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px] text-left text-xs text-slate-300">
                <thead className="border-b border-[#263346] bg-[#0B0F17] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Savings Account</th>
                    <th className="px-5 py-4">Balance</th>
                    <th className="px-5 py-4">Occupation</th>
                    <th className="px-5 py-4">Income Source</th>
                    <th className="px-5 py-4">Application Date</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Review Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#263346]/60">
                  {applications.map((application) => (
                    <tr
                      key={application.id}
                      className="align-top transition hover:bg-[#263346]/30"
                    >
                      {/* CUSTOMER */}

                      <td className="px-5 py-5">
                        <p className="font-bold text-white">
                          {application.customerName || 'Unknown Customer'}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                          {application.customerEmail || 'No email'}
                        </p>
                      </td>

                      {/* ACCOUNT */}

                      <td className="px-5 py-5">
                        <p className="font-mono text-slate-200">
                          {application.accountNumber || 'N/A'}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-500">
                          {application.accountName || 'Savings Account'}
                        </p>
                      </td>

                      {/* BALANCE */}

                      <td className="whitespace-nowrap px-5 py-5">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-400">
                          <Wallet size={13} />
                          {formatAmount(
                            application.balance,
                            application.currency
                          )}
                        </div>
                      </td>

                      {/* OCCUPATION */}

                      <td className="px-5 py-5">
                        <p className="text-slate-200">
                          {application.occupation}
                        </p>

                        {application.employerName && (
                          <p className="mt-1 text-[10px] text-slate-500">
                            {application.employerName}
                          </p>
                        )}
                      </td>

                      {/* INCOME SOURCE */}

                      <td className="px-5 py-5">
                        <p className="text-slate-300">
                          {application.incomeSource}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-500">
                          {application.monthlyIncomeRange}
                        </p>
                      </td>

                      {/* DATE */}

                      <td className="whitespace-nowrap px-5 py-5">
                        <span className="inline-flex items-center gap-1.5 text-slate-400">
                          <CalendarDays size={12} />

                          {new Date(
                            application.createdAt
                          ).toLocaleString()}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-5">
                        <StatusBadge status={application.status} />
                      </td>

                      {/* ACTIONS */}

                      <td className="min-w-[210px] px-5 py-5">
                        <BusinessUpgradeActions
                          applicationId={application.id}
                          status={application.status}
                          rejectionReason={application.rejectionReason}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* APPLICATION DETAILS */}

        {success && applications.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-300">
              Application Details
            </h2>

            {applications.map((application) => (
              <details
                key={`${application.id}-details`}
                className="group rounded-xl border border-[#263346] bg-[#151C28]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5">
                  <div>
                    <p className="text-sm font-bold text-white">
                      {application.customerName || 'Unknown Customer'}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      Account: {application.accountNumber || 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={application.status} />
                    <span className="text-xs text-violet-400">
                      View Details
                    </span>
                  </div>
                </summary>

                <div className="grid grid-cols-1 gap-4 border-t border-[#263346] p-5 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500">
                      Account Purpose
                    </p>
                    <p className="mt-1 text-xs text-slate-200">
                      {application.accountPurpose}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500">
                      Monthly Income Range
                    </p>
                    <p className="mt-1 text-xs text-slate-200">
                      {application.monthlyIncomeRange}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500">
                      Employer
                    </p>
                    <p className="mt-1 text-xs text-slate-200">
                      {application.employerName || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500">
                      Business Name
                    </p>
                    <p className="mt-1 text-xs text-slate-200">
                      {application.businessName || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500">
                      Business Type
                    </p>
                    <p className="mt-1 text-xs text-slate-200">
                      {application.businessType || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500">
                      Business Description
                    </p>
                    <p className="mt-1 text-xs text-slate-200">
                      {application.businessDescription || 'Not provided'}
                    </p>
                  </div>

                  {application.rejectionReason && (
                    <div className="sm:col-span-2 lg:col-span-3">
                      <p className="text-[10px] font-bold uppercase text-red-400">
                        Rejection Reason
                      </p>
                      <p className="mt-1 text-xs text-slate-300">
                        {application.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
