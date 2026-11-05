// components/landing/Features.tsx
import { Lock, Globe, ShieldCheck, ArrowUpRight, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function Features() {
  const t = useTranslations('Features');

  const featuresList = [
    {
      icon: <Lock size={22} />,
      title: t('f1Title'),
      description: t('f1Desc'),
      colorClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      badge: t('f1Badge')
    },
    {
      icon: <Globe size={22} />,
      title: t('f2Title'),
      description: t('f2Desc'),
      colorClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      badge: t('f2Badge')
    },
    {
      icon: <ShieldCheck size={22} />,
      title: t('f3Title'),
      description: t('f3Desc'),
      colorClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      badge: t('f3Badge')
    }
  ];

  return (
    <section id="security" className="py-24 lg:py-32 px-6 lg:px-12 relative">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#A78BFA] px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide">
            <Zap size={14} /> {t('badge')}
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

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuresList.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-[#121824]/60 hover:bg-[#121824] border border-[#263346] hover:border-[#8B5CF6]/40 transition-all duration-300 rounded-3xl p-8 flex flex-col justify-between shadow-xl backdrop-blur-xl"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${feature.colorClass}`}>
                    {feature.icon}
                  </div>
                  <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-[#0B0F17] border border-[#263346] text-slate-400">
                    {feature.badge}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-[#A78BFA] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>

              <div className="pt-8 flex items-center gap-2 text-xs font-semibold text-slate-500 group-hover:text-[#8B5CF6] transition-colors">
                <span>{t('explore')}</span>
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}