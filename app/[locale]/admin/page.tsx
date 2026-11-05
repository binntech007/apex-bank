// app/admin/page.tsx
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Globe,
} from 'lucide-react';
import KycActionButton from './KycActionButton';

export default async function AdminDashboardPage() {
  const session = await auth();

  // Guard: Ensure user is logged in and is an Admin
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  // 1. Fetch System Metrics
  const [totalUsersCount] = await db.select({ value: count() }).from(users);

  const pendingKycUsers = await db
    .select()
    .from(users)
    .where(eq(users.kycStatus, 'pending'))
    .orderBy(desc(users.createdAt));

  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      country: users.country,
      gender: users.gender,
      kycStatus: users.kycStatus,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  const pendingCount = pendingKycUsers.length;
  const approvedCount = allUsers.filter((u) => u.kycStatus === 'approved').length;

  return (
    <div className="min-h-screen bg-obsidian text-[#E2E8F0] p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#263346] pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 flex items-center justify-center font-bold">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Compliance & KYC Oversight
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Internal Operations • System Audits & Identity Approvals
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Link to Site Visitors / Settings Analytics */}
            <Link
              href="/admin/visitors"
              className="flex items-center gap-2 rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-4 py-2 text-xs font-semibold text-[#A78BFA] hover:bg-[#8B5CF6]/20 transition"
            >
              <Globe size={14} /> View Site Visitors
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl border border-[#263346] bg-[#151C28] px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-[#263346] transition"
            >
              <ArrowLeft size={14} /> Back to Customer Portal
            </Link>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-[#263346] bg-[#151C28] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Registered Accounts
              </span>
              <Users size={18} className="text-[#F59E0B]" />
            </div>
            <p className="text-3xl font-extrabold text-white">
              {totalUsersCount?.value || 0}
            </p>
          </div>

          <div className="rounded-2xl border border-[#263346] bg-[#151C28] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Pending KYC Reviews
              </span>
              <Clock size={18} className="text-[#F59E0B]" />
            </div>
            <p className="text-3xl font-extrabold text-[#F59E0B]">{pendingCount}</p>
          </div>

          <div className="rounded-2xl border border-[#263346] bg-[#151C28] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Approved Clients
              </span>
              <CheckCircle2 size={18} className="text-emerald-400" />
            </div>
            <p className="text-3xl font-extrabold text-emerald-400">{approvedCount}</p>
          </div>
        </div>

        {/* User Directory & KYC Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert size={18} className="text-[#F59E0B]" /> Customer Directory & Identity Queue
            </h2>
            <span className="text-xs text-slate-400">{allUsers.length} Users Listed</span>
          </div>

          <div className="rounded-2xl border border-[#263346] bg-[#151C28] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0B0F17] text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#263346]">
                  <tr>
                    <th className="px-6 py-4">Customer Name</th>
                    <th className="px-6 py-4">Email Address</th>
                    <th className="px-6 py-4">Country</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">KYC Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#263346]">
                  {allUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-[#263346]/40 transition">
                      <td className="px-6 py-4 font-semibold text-white">
                        {user.name || 'Unnamed User'}
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-mono text-xs">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {user.country || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                            user.role === 'admin'
                              ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                            user.kycStatus === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : user.kycStatus === 'rejected'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30'
                          }`}
                        >
                          {user.kycStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.role !== 'admin' && (
                          <KycActionButton userId={user.id} currentStatus={user.kycStatus} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}