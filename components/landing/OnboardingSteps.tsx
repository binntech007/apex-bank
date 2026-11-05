// components/landing/OnboardingSteps.tsx
import Image from 'next/image';
import { UserPlus, ShieldCheck, Wallet, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function OnboardingSteps() {
  const t = useTranslations('OnboardingSteps');

  const steps = [
    {
      number: '01',
      icon: <UserPlus size={20} />,
      title: t('s1Title'),
      description: t('s1Desc')
    },
    {
      number: '02',
      icon: <ShieldCheck size={20} />,
      title: t('s2Title'),
      description: t('s2Desc')
    },
    {
      number: '03',
      icon: <Wallet size={20} />,
      title: t('s3Title'),
      description: t('s3Desc')
    }
  ];

  return (
    <section id="onboarding" className="py-24 lg:py-32 px-6 lg:px-12 relative bg-[#070A10]">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#A78BFA] px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide">
            <ArrowRight size={14} /> {t('badge')}
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

        {/* Content Grid: Steps + Image Space */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Step Cards */}
          <div className="lg:col-span-6 space-y-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="group relative bg-[#121824]/60 hover:bg-[#121824] border border-[#263346] hover:border-[#8B5CF6]/40 transition-all duration-300 rounded-3xl p-6 lg:p-8 flex items-start gap-5 shadow-xl backdrop-blur-xl"
              >
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#A78BFA] font-extrabold shadow-inner">
                  {step.icon}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#8B5CF6] tracking-widest uppercase">
                      {t('phaseText')} {step.number}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#A78BFA] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Image Space Box */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl border border-[#263346] bg-[#121824] shadow-2xl backdrop-blur-xl">
              <Image
                src="/people4.jpg"
                alt={t('altImage')}
                fill
                className="object-cover object-center transition-transform hover:scale-105 duration-700"
              />
            </div>
            {/* Ambient Accent Overlay */}
            <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 pointer-events-none" />
          </div>

        </div>

      </div>
    </section>
  );
}