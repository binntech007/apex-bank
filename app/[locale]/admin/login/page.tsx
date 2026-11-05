// app/admin/login/page.tsx
import { AdminLoginForm } from '@/components/auth/AdminLoginForm';
import { Lock } from 'lucide-react';

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen bg-obsidian text-[#E2E8F0] items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-[#263346] bg-[#151C28] p-8 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#8B5CF6]/10 text-[#A78BFA] border border-[#8B5CF6]/30">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white">Compliance Admin Portal</h1>
          <p className="text-xs text-slate-400">System oversight, ledger audits, and identity reviews</p>
        </div>

        <AdminLoginForm />
      </div>
    </div>
  );
}