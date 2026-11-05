'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowLeft, 
  Search, 
  Loader2, 
  AlertCircle,
  User
} from 'lucide-react';
import { getAllLoansForAdmin, updateLoanStatus } from '@/actions/loan-admin';

interface AdminLoan {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  ledgerAccountId: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  createdAt: string;
}

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<AdminLoan[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLoans() {
      const data = await getAllLoansForAdmin();
      setLoans(data);
    }
    loadLoans();
  }, []);

  const handleDecision = async (loanId: string, action: 'approve' | 'reject') => {
    setProcessingId(loanId);
    setActionError(null);

    const result = await updateLoanStatus({ loanId, action });

    if (result.success) {
      const updatedData = await getAllLoansForAdmin();
      setLoans(updatedData);
    } else {
      setActionError(result.error || 'Action failed.');
    }

    setProcessingId(null);
  };

  const filteredLoans = loans.filter((loan) => {
    const matchesStatus = filterStatus === 'all' || loan.status === filterStatus;
    const matchesSearch = 
      loan.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <main className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition mb-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Loan Approvals & Management 👑
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review pending loan requests and disburse funds to customer accounts.
          </p>
        </div>
      </div>

      {actionError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs text-red-400 flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Search & Filters 🔍 */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by borrower or purpose..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#151C28] border border-[#263346] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#8B5CF6]"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                filterStatus === status
                  ? 'bg-[#8B5CF6] text-white'
                  : 'bg-[#151C28] border border-[#263346] text-slate-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Loans Table 📊 */}
      <div className="bg-[#151C28] border border-[#263346] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B0F17] text-slate-400 uppercase border-b border-[#263346]">
              <tr>
                <th className="p-4">Borrower</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Purpose</th>
                <th className="p-4">Term</th>
                <th className="p-4">Est. Monthly</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263346] text-slate-200">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No loan applications matching criteria found.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-[#1C2638]/50 transition">
                    <td className="p-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        <User size={14} className="text-[#8B5CF6]" />
                        {loan.userName}
                      </div>
                      <div className="text-[10px] text-slate-400">{loan.userEmail}</div>
                    </td>

                    <td className="p-4 font-mono font-bold text-white">
                      ${loan.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    <td className="p-4 text-slate-300 capitalize">{loan.purpose}</td>

                    <td className="p-4">{loan.termMonths} Months</td>

                    <td className="p-4 font-mono">${loan.monthlyPayment.toFixed(2)}</td>

                    <td className="p-4">
                      {loan.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                      {loan.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 size={12} /> Approved
                        </span>
                      )}
                      {loan.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                          <XCircle size={12} /> Rejected
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      {loan.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDecision(loan.id, 'approve')}
                            disabled={processingId === loan.id}
                            className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold text-[11px] transition flex items-center gap-1"
                          >
                            {processingId === loan.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={12} />
                            )}
                            Approve
                          </button>

                          <button
                            onClick={() => handleDecision(loan.id, 'reject')}
                            disabled={processingId === loan.id}
                            className="px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold text-[11px] transition flex items-center gap-1"
                          >
                            <XCircle size={12} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">No actions</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}