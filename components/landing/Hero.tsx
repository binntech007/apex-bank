// components/landing/Hero.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, TrendingUp, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export function Hero() {
  const t = useTranslations('Hero');
  const [loadingAction, setLoadingAction] = useState<'login' | 'register' | null>(null);

  const handleNavigation = (action: 'login' | 'register') => {
    setLoadingAction(action);
  };

  const checklistItems = [
    t('check1'),
    t('check2'),
    t('check3'),
    t('check4')
  ];

  return (
    <section id="features" className="relative overflow-hidden py-20 lg:py-28 px-6 lg:px-12">
      {/* Background Ambient Glows with Subtle Pulse */}
      <motion.div 
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-10 w-96 h-96 bg-[#8B5CF6]/15 blur-[120px] rounded-full pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-10 right-10 w-125 h-125 bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" 
      />

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* Left Column: Value Proposition & CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="lg:col-span-7 space-y-8 text-left"
        >
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2.5 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#A78BFA] px-4 py-2 rounded-full text-xs font-semibold tracking-wide shadow-lg shadow-[#8B5CF6]/5"
          >
            <ShieldCheck size={16} className="text-[#8B5CF6]" />
            <span>{t('badge')}</span>
          </motion.div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            {t('titlePrefix')}{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#8B5CF6] via-[#A78BFA] to-purple-300">
              {t('titleHighlight')}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
            {t('description')}
          </p>

          {/* Feature Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-slate-300 font-medium">
            {checklistItems.map((text, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                className="flex items-center gap-2"
              >
                <CheckCircle2 size={18} className="text-[#8B5CF6]" />
                <span>{text}</span>
              </motion.div>
            ))}
          </div>

          {/* Action Buttons with Loading Animation States */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center gap-4 pt-4"
          >
            <Link
              href="/login"
              onClick={() => handleNavigation('login')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] transition-all text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-[#8B5CF6]/25 active:scale-95"
            >
              {loadingAction === 'login' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{t('enteringVault')}</span>
                </>
              ) : (
                <>
                  <span>{t('accessVault')}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </Link>

            <Link
              href="/register"
              onClick={() => handleNavigation('register')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-[#121824] hover:bg-[#1E293B] border border-[#263346] transition-all text-slate-200 px-8 py-4 rounded-xl font-bold active:scale-95 shadow-lg"
            >
              {loadingAction === 'register' ? (
                <>
                  <Loader2 size={18} className="animate-spin text-[#8B5CF6]" />
                  <span>{t('preparingPortal')}</span>
                </>
              ) : (
                <span>{t('createAccount')}</span>
              )}
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Column: Visual Vault Card / Image Preview with Float Animation */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="lg:col-span-5 relative"
        >
          <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl border border-[#263346] bg-[#121824]/80 p-3 shadow-2xl backdrop-blur-2xl">
            
            {/* Image Container */}
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-[#0B0F17] border border-[#263346]/50">
              <Image
                src="/cash1.avif"
                alt={t('altImage')}
                fill
                priority
                className="object-cover object-center transition-transform hover:scale-105 duration-700"
              />
            </div>

            {/* Floating Asset Badge Overlay with Gentle Floating Motion */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-6 -left-6 bg-[#121824] border border-[#263346] p-4 rounded-2xl shadow-2xl hidden sm:flex items-center gap-3 backdrop-blur-md"
            >
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <TrendingUp size={22} />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{t('portfolioLabel')}</div>
                <div className="text-base font-extrabold text-white">$63,140.50 USD</div>
              </div>
            </motion.div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}