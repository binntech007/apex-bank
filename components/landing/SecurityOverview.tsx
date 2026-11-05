// components/landing/SecurityOverview.tsx
import { ShieldCheck, Lock, KeyRound, Smartphone, Activity, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function SecurityOverview() {
  const t = useTranslations('SecurityOverview');

  const securityPillars = [
    {
      icon: <KeyRound size={22} />,
      title: t('p1Title'),
      description: t('p1Desc'),
      badge: t('p1Badge')
    },
    {
      icon: <Smartphone size={22} />,
      title: t('p2Title'),
      description: t('p2Desc'),
      badge: t('p2Badge')
    },
    {
      icon: <Activity size={22} />,
      title: t('p3Title'),
      description: t('p3Desc'),
      badge: t('p3Badge')
    },
    {
      icon: <Lock size={22} />,
      title: t('p4Title'),
      description: t('p4Desc'),
      badge: t('p4Badge')
    }
  ];

  return (
    <section id="security-overview" className="py-24 lg:py-32 px-6 lg:px-12 relative bg-[#070A10]">
      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#A78BFA] px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide">
            <ShieldCheck size={14} /> {t('badge')}
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

        {/* Security Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {securityPillars.map((pillar, index) => (
            <div
              key={index}
              className="bg-[#121824]/60 border border-[#263346] rounded-3xl p-8 space-y-6 hover:border-[#8B5CF6]/40 transition-all duration-300 backdrop-blur-xl shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[#8B5CF6]">
                    {pillar.icon}
                  </div>
                  <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-[#0B0F17] border border-[#263346] text-slate-400">
                    {pillar.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  {pillar.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#263346]/60 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <CheckCircle size={15} />
                <span>{t('activeProtection')}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}