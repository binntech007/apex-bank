// components/landing/GlobalNetwork.tsx
import { Globe2, Server, ShieldCheck, Activity } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function GlobalNetwork() {
  const t = useTranslations('GlobalNetwork');

  const hubs = [
    {
      city: t('nyCity'),
      region: t('nyRegion'),
      status: t('status'),
      latency: `12ms ${t('latencyText')}`,
      nodeId: 'US-NYC-01'
    },
    {
      city: t('ldnCity'),
      region: t('ldnRegion'),
      status: t('status'),
      latency: `8ms ${t('latencyText')}`,
      nodeId: 'EU-LDN-02'
    },
    {
      city: t('zrhCity'),
      region: t('zrhRegion'),
      status: t('status'),
      latency: `14ms ${t('latencyText')}`,
      nodeId: 'EU-ZRH-01'
    },
    {
      city: t('sgpCity'),
      region: t('sgpRegion'),
      status: t('status'),
      latency: `22ms ${t('latencyText')}`,
      nodeId: 'AP-SGP-03'
    }
  ];

  return (
    <section id="network" className="py-24 lg:py-32 px-6 lg:px-12 relative bg-[#070A10] border-t border-b border-[#263346]/40">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#A78BFA] px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide">
            <Globe2 size={14} /> {t('badge')}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            {t('titlePrefix')}{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#8B5CF6] to-[#A78BFA]">
              {t('titleHighlight')}
            </span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            {t('description')}
          </p>
        </div>

        {/* Node Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hubs.map((hub, index) => (
            <div
              key={index}
              className="group bg-[#121824]/60 hover:bg-[#121824] border border-[#263346] hover:border-[#8B5CF6]/40 transition-all duration-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-xl relative overflow-hidden"
            >
              {/* Top Accent Glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#8B5CF6]/5 rounded-bl-full pointer-events-none group-hover:bg-[#8B5CF6]/15 transition-all" />

              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#A78BFA]">
                  <Server size={22} />
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  <Activity size={10} className="animate-pulse" />
                  <span>{hub.status}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#8B5CF6]">
                  {hub.region}
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  {hub.city}
                </h3>
              </div>

              <div className="pt-4 border-t border-[#263346]/60 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-slate-500">{hub.nodeId}</span>
                <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <ShieldCheck size={14} className="text-[#8B5CF6]" />
                  <span>{hub.latency}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}