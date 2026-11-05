// components/landing/CTASection.tsx
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function CTASection() {
  const t = useTranslations('CTA');

  return (
    <section className="py-20 px-6 lg:px-12 relative overflow-hidden">
      {/* Background Glow Accent */}
      <div className="absolute inset-0 bg-linear-to-r from-[#8B5CF6]/10 via-transparent to-purple-600/10 pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10 bg-linear-to-br from-[#121824] to-[#0B0F17] border border-[#263346] rounded-3xl p-8 lg:p-14 shadow-2xl backdrop-blur-xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Column: Image Space Placeholder */}
        <div className="lg:col-span-5 relative order-2 lg:order-1">
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-[#263346] bg-[#0B0F17] shadow-2xl">
            <Image
              src="/people1.jpeg"
              alt={t('altImage')}
              fill
              className="object-cover object-center transition-transform hover:scale-105 duration-700"
            />
          </div>
          {/* Subtle Accent Glow */}
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />
        </div>

        {/* Right Column: Content & Actions */}
        <div className="lg:col-span-7 space-y-6 text-left order-1 lg:order-2">
          <div className="w-14 h-14 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#A78BFA] shadow-lg shadow-[#8B5CF6]/10">
            <Lock size={26} />
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {t('titlePrefix')}{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#8B5CF6] to-[#A78BFA]">
                {t('titleHighlight')}
              </span>
            </h2>
            <p className="text-sm lg:text-base text-slate-400 leading-relaxed">
              {t('description')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] transition-all text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-[#8B5CF6]/25 active:scale-95"
            >
              <span>{t('openAccount')}</span>
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-[#0B0F17] hover:bg-[#121824] border border-[#263346] transition-all text-slate-200 px-8 py-4 rounded-xl font-bold active:scale-95 shadow-lg"
            >
              <ShieldCheck size={18} className="text-[#8B5CF6]" />
              <span>{t('signIn')}</span>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}