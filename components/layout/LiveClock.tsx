// components/layout/LiveClock.tsx
'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function LiveClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    // Set initial time on client mount
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  // Render a subtle placeholder until mounted on client to prevent hydration mismatch
  if (!time) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
        <Clock size={14} className="text-[#8B5CF6]" />
        <span>--:--:-- --</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 font-medium">
      <Clock size={14} className="text-[#8B5CF6]" />
      <span>{time}</span>
    </div>
  );
}