'use client';

import { useState, useEffect } from 'react';
import { getAllUsersWithBalance } from '@/actions/admin-users';
import { toggleUserSuspension } from '@/actions/admin';
import { AddFundsModal } from '@/components/admin/AddFundsModal';
import { Users, DollarSign, Search, CheckCircle2, Clock, Loader2, Ban, UserCheck } from 'lucide-react';

export default function UserDirectoryPage() {
  const [userList, setUserList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; vaults: any[] } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    const res = await getAllUsersWithBalance();
    if (res.success) setUserList(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleSuspension = async (userId: string, currentStatus: boolean) => {
    setActionLoadingId(userId);
    
    const res = await toggleUserSuspension(userId, !currentStatus);
    
    if (res.success) {
      setUserList((prevList) =>
        prevList.map((u) => (u.id === userId ? { ...u, isSuspended: !currentStatus } : u))
      );
      await loadUsers();
    } else {
      alert(res.error || 'Failed to update user suspension status.');
    }
    
    setActionLoadingId(null);
  };

  const filteredUsers = userList.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.accountNumber?.includes(searchTerm)
  );

  return (
    <div className="p-6 lg:p-10 space-y-8 min-h-screen bg-[#0B0F17] text-[#E2E8F0]">
      {/* Header 👥 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#263346] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="text-[#A78BFA]" size={32} />
            User Directory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage users, view live account balances, control access, and adjust ledger funds
          </p>
        </div>

        {/* Search Bar 🔍 */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search by name, email, account..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-[#263346] bg-[#151C28] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#8B5CF6] focus:outline-none"
          />
        </div>
      </div>

      {/* Directory Table 📑 */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 gap-2 font-medium text-sm">
          <Loader2 className="animate-spin text-[#8B5CF6]" size={20} /> Fetching directory records...
        </div>
      ) : (
        <div className="rounded-2xl border border-[#263346] bg-[#151C28] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0B0F17] text-slate-400 uppercase tracking-wider font-semibold border-b border-[#263346]">
                <tr>
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Account No.</th>
                  <th className="px-5 py-4">Current Balance 💰</th>
                  <th className="px-5 py-4">KYC Status</th>
                  <th className="px-5 py-4">Account Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#263346]/50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#1C2536]/50 transition">
                    {/* User Profile */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{user.name}</div>
                      <div className="text-[11px] text-slate-400">{user.email}</div>
                    </td>

                    {/* Account Number */}
                    <td className="px-5 py-4 font-mono text-slate-300">{user.accountNumber}</td>

                    {/* Live Balance Display 💳 */}
                    <td className="px-5 py-4 font-bold text-emerald-400 font-mono text-sm">
                      ${parseFloat(user.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* KYC Badge */}
                    <td className="px-5 py-4">
                      {user.kycStatus === 'approved' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-[11px]">
                          <CheckCircle2 size={12} /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold text-[11px]">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                    </td>

                    {/* Account Suspension Badge */}
                    <td className="px-5 py-4">
                      {user.isSuspended ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold text-[11px]">
                          <Ban size={12} /> Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold text-[11px]">
                          <UserCheck size={12} /> Active
                        </span>
                      )}
                    </td>

                    {/* Action Buttons ⚡ */}
                    <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedUser({ id: user.id, name: user.name, vaults: user.vaults || [] })}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#8B5CF6]/10 text-[#A78BFA] border border-[#8B5CF6]/30 font-semibold hover:bg-[#8B5CF6] hover:text-white transition shadow-sm"
                      >
                        <DollarSign size={14} />
                        <span>Funds</span>
                      </button>

                      <button
                        onClick={() => handleToggleSuspension(user.id, user.isSuspended)}
                        disabled={actionLoadingId === user.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border font-semibold transition shadow-sm ${
                          user.isSuspended
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-white'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500 hover:text-white'
                        }`}
                      >
                        {actionLoadingId === user.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : user.isSuspended ? (
                          <>
                            <UserCheck size={14} />
                            <span>Activate</span>
                          </>
                        ) : (
                          <>
                            <Ban size={14} />
                            <span>Suspend</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Funds Modal 💳 */}
      <AddFundsModal
        isOpen={!!selectedUser}
        userId={selectedUser?.id || ''}
        userName={selectedUser?.name || ''}
        vaults={selectedUser?.vaults || []}
        onClose={() => {
          setSelectedUser(null);
          loadUsers();
        }}
      />
    </div>
  );
}