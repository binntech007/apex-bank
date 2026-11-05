// components/landing/LandingLoader.tsx
'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function LandingLoader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-[#070A10] text-slate-100"
        >
          {/* Ambient Glow */}
          <div className="absolute w-72 h-72 bg-[#8B5CF6]/20 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center space-y-6">
            {/* Animated Vault Shield Icon */}
            <motion.div
              animate={{ scale: [1, 1.08, 1], rotate: [0, 0, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#A78BFA] shadow-2xl backdrop-blur-xl"
            >
              <ShieldCheck size={32} className="text-[#8B5CF6]" />
            </motion.div>

            <div className="space-y-2 text-center">
              <h2 className="text-xl font-extrabold tracking-tight text-white uppercase">
                Apex Bank
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono tracking-wider">
                <Lock size={12} className="text-[#8B5CF6]" />
                <span>INITIALIZING SECURE VAULT...</span>
              </div>
            </div>

            {/* Loading Progress Bar */}
            <div className="w-48 h-1 bg-[#121824] rounded-full overflow-hidden border border-[#263346]">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className="h-full bg-linear-to-r from-[#8B5CF6] to-purple-300"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}