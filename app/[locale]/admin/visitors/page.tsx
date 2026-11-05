// app/[locale]/admin/visitors/page.tsx
import { getSiteVisitors } from '@/actions/admin';
import { Globe, Monitor, Clock, Users } from 'lucide-react';

export default async function AdminVisitorsPage() {
  const { visitors, success } = await getSiteVisitors();

  return (
    <div className="space-y-8 p-6 lg:p-10 max-w-7xl mx-auto text-white">
      <div className="border-b border-[#263346] pb-6">
        <div className="inline-flex items-center gap-2 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#A78BFA] px-3 py-1 rounded-full text-xs font-semibold tracking-wide mb-2">
          <Users size={14} /> Traffic Analytics
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Live Site Visitors
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time tracking of traffic, visited paths, and browser client metadata.
        </p>
      </div>

      <div className="bg-[#121824]/60 border border-[#263346] rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-[#263346] flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-300">Recent Page Hits</h2>
          <span className="text-xs text-slate-400 font-mono">{visitors.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B0F17]/80 uppercase font-bold text-slate-400 tracking-wider border-b border-[#263346]">
              <tr>
                <th className="px-6 py-4">Page Path</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">User Agent / Browser</th>
                <th className="px-6 py-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263346]/60">
              {!success || visitors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No visitor records found yet.
                  </td>
                </tr>
              ) : (
                visitors.map((visitor: any) => (
                  <tr key={visitor.id} className="hover:bg-[#151C28]/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-[#A78BFA]">
                      {visitor.path}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Globe size={13} className="text-slate-500" />
                        {visitor.ipAddress || '127.0.0.1'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 max-w-xs truncate" title={visitor.userAgent}>
                      <span className="flex items-center gap-1.5">
                        <Monitor size={13} className="text-slate-500 shrink-0" />
                        <span className="truncate">{visitor.userAgent || 'Unknown Client'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 justify-end">
                        <Clock size={13} className="text-slate-500" />
                        {new Date(visitor.createdAt).toLocaleString()}
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