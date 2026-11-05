// components/auth/InputGroup.tsx
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff } from 'lucide-react';

interface InputGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function InputGroup({ label, error, type, className = '', ...props }: InputGroupProps) {
  const [showPassword, setShowPassword] = useState(false);
  const t = useTranslations('InputGroup');

  // 1. Determine if this field is a password input 🔐
  const isPasswordType = type === 'password';

  // 2. Toggle type dynamically between 'text' and 'password' 🔄
  const inputType = isPasswordType && showPassword ? 'text' : type;

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          type={inputType}
          className={`w-full rounded-xl border bg-[#0B0F17] px-4 py-3 text-white placeholder-slate-600 focus:outline-none transition ${
            isPasswordType ? 'pr-11' : ''
          } ${
            error ? 'border-red-500' : 'border-[#263346] focus:border-[#8B5CF6]'
          } ${className}`}
        />

        {/* 3. Render visibility toggle button for password fields 👁️ */}
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
            aria-label={showPassword ? t('hidePassword') : t('showPassword')}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
}