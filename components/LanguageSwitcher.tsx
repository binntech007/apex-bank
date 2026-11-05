'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/lib/i18n/routing';
import { ChangeEvent, useTransition } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor="locale-select" className="text-slate-300 font-medium">
        🌍 Language:
      </label>
      <select
        id="locale-select"
        value={locale}
        disabled={isPending}
        onChange={handleLocaleChange}
        className="bg-[#151C28] border border-[#263346] rounded-md px-2 py-1 text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
      >
        <option value="en">English 🇬🇧</option>
        <option value="es">Español 🇪🇸</option>
        <option value="fr">Français 🇫🇷</option>
        <option value="de">Deutsch 🇩🇪</option>
        <option value="fil">Filipino 🇵🇭</option>
        <option value="th">ไทย 🇹🇭</option>
        <option value="it">Italiano 🇮🇹</option>
      </select>
    </div>
  );
}