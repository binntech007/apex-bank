// app/[locale]/admin/logs/page.tsx
import { getAuditLogs } from '@/actions/admin';
import { ShieldCheck, Activity, Monitor, Globe, Clock, UserCheck } from 'lucide-react';

export default async function AdminAuditLogsPage() {
  const { logs, success } = await getAuditLogs();

  return (
    <div className="space-y-8 p-6 lg:p-10 max-w-7xl mx-auto text-white">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#263346] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#A78BFA] px-3 py-1 rounded-full text-xs font-semibold tracking-wide mb-2">
            <ShieldCheck size={14} /> Security Telemetry
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Device & IP Audit Logs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time telemetry tracking user sessions, IP addresses, and security activity checkpoints.
          </p>
        </div>
      </div>

      {/* Logs Data Table Card */}
      <div className="bg-[#121824]/60 border border-[#263346] rounded-3xl shadow-xl backdrop-blur-xl overflow-hidden">
        <div className="p-6 border-b border-[#263346] flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
            <Activity size={16} className="text-[#8B5CF6]" /> Recent Sign-In & Security Activity
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {logs.length} Records Loaded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B0F17]/80 uppercase font-bold text-slate-400 tracking-wider border-b border-[#263346]">
              <tr>
                <th className="px-6 py-4">User Identity</th>
                <th className="px-6 py-4">Action / Event</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Device / User Agent</th>
                <th className="px-6 py-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263346]/60">
              {!success || logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No security audit logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-[#151C28]/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#A78BFA] shrink-0">
                        <UserCheck size={14} />
                      </div>
                      <div>
                        <div className="font-bold text-white">{log.userName || 'Unknown Name'}</div>
                        <div className="font-mono text-[11px] text-slate-400">{log.userEmail || 'Unknown User'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-purple-500/10 border border-purple-500/20 text-[#A78BFA]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Globe size={13} className="text-slate-500" />
                        {log.ipAddress || '127.0.0.1'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 max-w-xs truncate" title={log.userAgent || ''}>
                      <span className="flex items-center gap-1.5">
                        <Monitor size={13} className="text-slate-500 shrink-0" />
                        <span className="truncate">{log.userAgent || 'Standard Browser Client'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400 whitespace-nowrap text-right">
                      <span className="inline-flex items-center gap-1.5 justify-end">
                        <Clock size={13} className="text-slate-500" />
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}