
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitBusinessApplication } from '@/actions/business-account';

type Account = {
  id: string;
  accountNumber: string;
  name: string;
  currency: string;
  balance: string;
  applicationStatus:
    | 'pending'
    | 'under_review'
    | 'approved'
    | 'rejected'
    | null;
  rejectionReason: string | null;
};

export function BusinessUpgradePopup({
  accounts,
}: {
  accounts: Account[];
}) {
  const router = useRouter();

  const [selectedAccount, setSelectedAccount] = useState(
    accounts[0]?.id ?? ''
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  if (!accounts.length) return null;

  const selectedAccountData = accounts.find(
    (account) => account.id === selectedAccount
  );

  const applicationStatus = selectedAccountData?.applicationStatus;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage('');

    try {
      const result = await submitBusinessApplication({
        ledgerAccountId: selectedAccount,
        occupation: String(formData.get('occupation') || ''),
        employerName: String(formData.get('employerName') || ''),
        incomeSource: String(formData.get('incomeSource') || ''),
        monthlyIncomeRange: String(
          formData.get('monthlyIncomeRange') || ''
        ),
        accountPurpose: String(
          formData.get('accountPurpose') || ''
        ),
      });

      setMessage(result.message);

      if (result.success) {
        setSuccess(true);
        router.refresh();
      }
    } catch {
      setMessage('Unable to submit your application. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-[#080d19] p-6 text-white shadow-2xl">

        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold text-blue-400">
            ACCOUNT UPGRADE
          </p>

          <h2 className="text-2xl font-bold">
            Upgrade to a Business Account
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-400">
            Your Savings Account has reached the upgrade threshold.
            Your application must be reviewed and approved by an
            administrator before your account type changes.
          </p>
        </div>

        {/* Account selection */}
        {accounts.length > 1 && (
          <div className="mb-5">
            <label className="mb-2 block text-sm text-gray-300">
              Select account
            </label>

            <select
              value={selectedAccount}
              onChange={(event) => {
                setSelectedAccount(event.target.value);
                setSuccess(false);
                setMessage('');
              }}
              className="w-full rounded-lg border border-white/10 bg-[#111827] p-3 text-white outline-none focus:border-blue-500"
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} — {account.accountNumber} (
                  {account.currency}{' '}
                  {Number(account.balance).toLocaleString()})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Pending or submitted */}
        {success || applicationStatus === 'pending' ? (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-5">
            <h3 className="font-semibold text-yellow-400">
              Application Pending
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-300">
              Your business account application has been submitted
              successfully and is awaiting administrator approval.
            </p>

            <p className="mt-3 text-xs text-gray-400">
              Your account will remain a Savings Account until
              approval is completed.
            </p>
          </div>
        ) : applicationStatus === 'under_review' ? (
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-5">
            <h3 className="font-semibold text-blue-400">
              Application Under Review
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-300">
              Your application is currently being reviewed by an
              administrator. The popup will remain until a decision
              has been made.
            </p>
          </div>
        ) : (
          <>
            {/* Rejected application notice */}
            {applicationStatus === 'rejected' && (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-5">
                <h3 className="font-semibold text-red-400">
                  Application Not Approved
                </h3>

                <p className="mt-2 text-sm text-gray-300">
                  Your previous application was not approved.
                </p>

                {selectedAccountData?.rejectionReason && (
                  <p className="mt-3 text-sm text-gray-400">
                    Reason: {selectedAccountData.rejectionReason}
                  </p>
                )}

                <p className="mt-3 text-sm text-gray-300">
                  You may submit a new application for review.
                </p>
              </div>
            )}

            {/* Application form */}
            <form action={handleSubmit} className="space-y-4">

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Occupation
                </label>

                <select
                  name="occupation"
                  required
                  defaultValue=""
                  className="w-full rounded-lg border border-white/10 bg-[#111827] p-3 text-white outline-none focus:border-blue-500"
                >
                  <option value="" disabled>
                    Select your occupation
                  </option>
                  <option value="Business owner">Business owner</option>
                  <option value="Government employee">Government employee</option>
                  <option value="Teacher / Lecturer">Teacher / Lecturer</option>
                  <option value="Private-sector employee">Private-sector employee</option>
                  <option value="Contractor">Contractor</option>
                  <option value="Self-employed">Self-employed</option>
                  <option value="Freelancer">Freelancer</option>
                  <option value="Retired">Retired</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Employer or business name
                </label>

                <input
                  name="employerName"
                  type="text"
                  placeholder="Enter employer or business name"
                  className="w-full rounded-lg border border-white/10 bg-[#111827] p-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Source of income
                </label>

                <select
                  name="incomeSource"
                  required
                  defaultValue=""
                  className="w-full rounded-lg border border-white/10 bg-[#111827] p-3 text-white outline-none focus:border-blue-500"
                >
                  <option value="" disabled>
                    Select source of income
                  </option>
                  <option value="Salary">Salary</option>
                  <option value="Business income">Business income</option>
                  <option value="Contract payments">Contract payments</option>
                  <option value="Professional services">Professional services</option>
                  <option value="Investments">Investments</option>
                  <option value="Pension">Pension</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Monthly income range
                </label>

                <select
                  name="monthlyIncomeRange"
                  required
                  defaultValue=""
                  className="w-full rounded-lg border border-white/10 bg-[#111827] p-3 text-white outline-none focus:border-blue-500"
                >
                  <option value="" disabled>
                    Select monthly income range
                  </option>
                  <option value="Below 1,000">Below 1,000</option>
                  <option value="1,000 - 4,999">1,000 - 4,999</option>
                  <option value="5,000 - 9,999">5,000 - 9,999</option>
                  <option value="10,000 - 49,999">10,000 - 49,999</option>
                  <option value="50,000 - 99,999">50,000 - 99,999</option>
                  <option value="100,000 and above">100,000 and above</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Purpose of account
                </label>

                <textarea
                  name="accountPurpose"
                  required
                  rows={3}
                  placeholder="Briefly explain how you intend to use this account..."
                  className="w-full rounded-lg border border-white/10 bg-[#111827] p-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              {message && (
                <p className="text-sm text-red-400">{message}</p>
              )}

              <button
                type="submit"
                disabled={loading || !selectedAccount}
                className="w-full rounded-lg bg-blue-600 p-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? 'Submitting...'
                  : applicationStatus === 'rejected'
                    ? 'Resubmit Application'
                    : 'Submit Application'}
              </button>

              <p className="text-center text-xs text-gray-500">
                Your account type will only change after administrator
                approval.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
