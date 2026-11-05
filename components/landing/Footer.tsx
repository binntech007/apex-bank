// components/landing/Footer.tsx
import Link from 'next/link';
import { ShieldCheck, Lock, Globe, ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="w-full bg-[#070A10] border-t border-[#263346]/40 text-slate-400 text-xs sm:text-sm pt-16 pb-12 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Top Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="bg-[#8B5CF6]/20 p-2 rounded-xl border border-[#8B5CF6]/30 text-[#A78BFA]">
                <ShieldCheck size={20} />
              </div>
              <span className="text-base font-extrabold tracking-tight text-white uppercase">
                Apex Bank
              </span>
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed">
              {t('brandDescription')}
            </p>
            <div className="flex items-center gap-4 pt-2 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Lock size={14} className="text-[#8B5CF6]" />
                <span>{t('encrypted')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe size={14} className="text-blue-400" />
                <span>{t('globalNodes')}</span>
              </div>
            </div>
          </div>

          {/* Navigation Column: Platform */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">{t('platformTitle')}</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="#security" className="hover:text-white transition-colors">
                  {t('features')}
                </Link>
              </li>
              <li>
                <Link href="#security" className="hover:text-white transition-colors">
                  {t('security')}
                </Link>
              </li>
              <li>
                <Link href="#onboarding" className="hover:text-white transition-colors">
                  {t('onboarding')}
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  {t('login')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column: Compliance */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">{t('complianceTitle')}</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  {t('register')}
                </Link>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">{t('deviceAudit')}</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">{t('totp')}</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">{t('privacyPolicy')}</span>
              </li>
            </ul>
          </div>

          {/* Navigation Column: Resources */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">{t('resourcesTitle')}</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  <span>{t('github')}</span>
                  <ArrowUpRight size={12} />
                </a>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">{t('apiDocs')}</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">{t('systemStatus')}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar Section */}
        <div className="pt-8 border-t border-[#263346]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} {t('rights')}</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">{t('securityTerms')}</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">{t('privacyNotice')}</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">{t('auditLogs')}</span>
          </div>
        </div>

      </div>
    </footer>
  );
}