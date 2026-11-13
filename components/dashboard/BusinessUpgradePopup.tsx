
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

type BusinessUpgradePopupProps = {
  accounts: Account[];
};

export function BusinessUpgradePopup({
  accounts,
}: BusinessUpgradePopupProps) {
  const router = useRouter();

  const [selectedAccount, setSelectedAccount] = useState(
    accounts[0]?.id ?? ''
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  if (!accounts.length) {
    return null;
  }

  const selectedAccountData = accounts.find(
    (account) => account.id === selectedAccount
  );

  const applicationStatus =
    selectedAccountData?.applicationStatus ?? null;

  async function handleSubmit(formData: FormData) {
    if (!selectedAccountData) {
      setMessage('Please select a valid account.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await submitBusinessApplication({
        ledgerAccountId: selectedAccountData.id,
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

      if (!result.success) {
        setMessage(
          result.message || 'Unable to submit your application.'
        );
        return;
      }

      setSuccess(true);

      setMessage(
        result.message || 'Application submitted successfully.'
      );

      router.refresh();
    } catch (error) {
      console.error(
        'BUSINESS APPLICATION SUBMISSION ERROR:',
        error
      );

      setMessage(
        'Unable to submit your application. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-[#080d19] p-6 text-white shadow-2xl">

        {/* Header */}
        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold text-blue-400">
            ACCOUNT UPGRADE
          </p>

          <h2 className="text-2xl font-bold">
            Upgrade to a Business Account
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-400">
            Your Savings Account has reached the upgrade threshold.
            Complete the application below for administrator review.
            Your account type will only change after approval.
          </p>
        </div>

        {/* Account selection */}
        {accounts.length > 1 && (
          <div className="mb-5">
            <label
              htmlFor="upgrade-account"
              className="mb-2 block text-sm text-gray-300"
            >
              Select account
            </label>

            <select
              id="upgrade-account"
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

        {/* Selected account information */}
        {selectedAccountData && (
          <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs text-gray-400">
              SELECTED SAVINGS ACCOUNT
            </p>

            <p className="mt-2 font-semibold">
              {selectedAccountData.name}
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Account Number: {selectedAccountData.accountNumber}
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Balance: {selectedAccountData.currency}{' '}
              {Number(selectedAccountData.balance).toLocaleString()}
            </p>
          </div>
        )}

        {/* Pending application */}
        {success || applicationStatus === 'pending' ? (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-5">
            <h3 className="font-semibold text-yellow-400">
              Application Pending
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-300">
              Your business account application has been submitted
              successfully and is awaiting administrator review.
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
              administrator. You can check the updated status once
              a decision has been made.
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
            {selectedAccountData && (
              <form action={handleSubmit} className="space-y-4">

                {/* Occupation */}
                <div>
                  <label
                    htmlFor="occupation"
                    className="mb-2 block text-sm text-gray-300"
                  >
                    Occupation
                  </label>

                  <select
                    id="occupation"
                    name="occupation"
                    required
                    defaultValue=""
                    className="w-full rounded-lg border border-white/10 bg-[#111827] p-3 text-white outline-none focus:border-blue-500"
                  >
                    <option value="" disabled>
                      Select your occupation
                    </option>
                    <option value="Business owner">
                      Business owner
                    </option>
                    <option value="Government employee">
                      Government employee
                    </option>
                    <option value="Teacher / Lecturer">
                      Teacher / Lecturer
                    </option>
                    <option value="Private-sector employee">
                      Private-sector employee
                    </option>
                    <option value="Contractor">Contractor</option>
                    <option value="Self-employed">Self-employed</option>
                    <option value="Freelancer">Freelancer</option>
                    <option value="Retired">Retired</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Employer or business name */}
                <div>
                  <label
                    htmlFor="employerName"
                    className="mb-2 block text-sm text-gray-300"
                  >
                    Employer or business name
                  </label>

                  <input
                    id="employerName"
                    name="employerName"
                    type="text"
                    maxLength={150}
                    placeholder="Enter employer or business name"
                    className="w-full rounded-lg border border-white/10 bg-[#111827] p-3 text-white outline-none focus:border-blue-500"
                  />
                </div>

                {/* Source of income */}
                <div>
                  <label
                    htmlFor="incomeSource"
                    className="mb-2 block text-sm text-gray-300"
                  >
                    Source of income
                  </label>

                  <select
                    id="incomeSource"
                    name="incomeSource"
                    required
                    defaultValue=""
                    className="w-full rounded-lg border border-white/10 bg-[#111827] p-3 text-white outline-none focus:border-blue-500"
                  >
                    <option value="" disabled>
                      Select source of income
                    </option>
                    <option value="Salary">Salary</option>
                    <option value="Business income">
                      Business income
                    </option>
                    <option value="Contract payments">
                      Contract payments
                    </option>
                    <option value="Professional services">
                      Professional services
                    </option>
                    <option value="Investments">Investments</option>
                    <option value="Pension">Pension</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Monthly income range */}
                <div>
                  <label
                    htmlFor="monthlyIncomeRange"
                    className="mb-2 block text-sm text-gray-300"
                  >
                    Monthly income range
                  </label>

                  <select
                    id="monthlyIncomeRange"
                    name="monthlyIncomeRange"
                    required
                    defaultValue=""
                    className="w-full rounded-lg border border-white/10 bg-[#111827] p-3 text-white outline-none focus:border-blue-500"
                  >
                    <option value="" disabled>
                      Select monthly income range
                    </option>
                    <option value="Below 1,000">Below 1,000</option>
                    <option value="1,000 - 4,999">
                      1,000 - 4,999
                    </option>
                    <option value="5,000 - 9,999">
                      5,000 - 9,999
                    </option>
                    <option value="10,000 - 49,999">
                      10,000 - 49,999
                    </option>
                    <option value="50,000 - 99,999">
                      50,000 - 99,999
                    </option>
                    <option value="100,000 and above">
                      100,000 and above
                    </option>
                    <option value="Prefer not to say">
                      Prefer not to say
                    </option>
                  </select>
                </div>

                {/* Account purpose */}
                <div>
                  <label
                    htmlFor="accountPurpose"
                    className="mb-2 block text-sm text-gray-300"
                  >
                    Purpose of account
                  </label>

                  <textarea
                    id="accountPurpose"
                    name="accountPurpose"
                    required
                    rows={3}
                    maxLength={2000}
                    placeholder="Briefly explain how you intend to use this account..."
                    className="w-full rounded-lg border border-white/10 bg-[#111827] p-3 text-white outline-none focus:border-blue-500"
                  />
                </div>

                {/* Feedback */}
                {message && (
                  <p
                    role="status"
                    className={`text-sm ${
                      success ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {message}
                  </p>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || !selectedAccountData}
                  className="w-full rounded-lg bg-blue-600 p-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? 'Submitting...'
                    : applicationStatus === 'rejected'
                      ? 'Resubmit Application'
                      : 'Submit Application'}
                </button>

                <p className="text-center text-xs text-gray-500">
                  Your account type will only change after
                  administrator approval.
                </p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
