// components/landing/Navbar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function Navbar() {
  const t = useTranslations('Navbar');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full border-b border-[#263346]/40 bg-[#0B0F17]/90 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-linear-to-br from-[#8B5CF6]/30 to-[#8B5CF6]/10 p-2.5 rounded-2xl border border-[#8B5CF6]/30 text-[#A78BFA] shadow-lg shadow-[#8B5CF6]/10 group-hover:border-[#8B5CF6]/50 transition-all">
            <ShieldCheck size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-wider text-white uppercase">
              Apex Bank
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
              {t('subtitle')}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="#features" className="hover:text-white transition-colors duration-200">
            {t('features')}
          </Link>
          <Link href="#security" className="hover:text-white transition-colors duration-200">
            {t('security')}
          </Link>
          <Link href="#ledgers" className="hover:text-white transition-colors duration-200">
            {t('multiCurrency')}
          </Link>
          <Link href="#compliance" className="hover:text-white transition-colors duration-200">
            {t('compliance')}
          </Link>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-4 py-2.5"
          >
            {t('signIn')}
          </Link>
          <Link
            href="/register"
            className="group flex items-center gap-2 text-sm font-semibold bg-[#8B5CF6] hover:bg-[#7C3AED] transition-all text-white px-5 py-2.5 rounded-xl shadow-xl shadow-[#8B5CF6]/20 active:scale-95"
          >
            <span>{t('openAccount')}</span>
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-slate-300 hover:text-white p-2.5 rounded-xl border border-[#263346] bg-[#121824] transition-colors focus:outline-none"
          aria-label={t('ariaLabel')}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Dropdown Navigation Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#0B0F17]/95 border-b border-[#263346] p-6 flex flex-col gap-4 lg:hidden shadow-2xl backdrop-blur-2xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-3">
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-white py-2 px-3 rounded-lg hover:bg-[#121824] transition-colors"
            >
              {t('features')}
            </Link>
            <Link
              href="#security"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-white py-2 px-3 rounded-lg hover:bg-[#121824] transition-colors"
            >
              {t('security')}
            </Link>
            <Link
              href="#ledgers"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-white py-2 px-3 rounded-lg hover:bg-[#121824] transition-colors"
            >
              {t('multiCurrency')}
            </Link>
            <Link
              href="#compliance"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-white py-2 px-3 rounded-lg hover:bg-[#121824] transition-colors"
            >
              {t('compliance')}
            </Link>
          </nav>
          
          <div className="pt-4 border-t border-[#263346] flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center text-sm font-semibold text-slate-200 hover:text-white py-3 rounded-xl border border-[#263346] bg-[#121824] transition-colors"
            >
              {t('signIn')}
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white py-3 rounded-xl shadow-lg shadow-[#8B5CF6]/20 transition-all"
            >
              <span>{t('openAccount')}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}