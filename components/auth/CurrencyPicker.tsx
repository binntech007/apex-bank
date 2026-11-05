import React from 'react';

// 1. Updated Currency Type 🎯
export type Currency = 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'THB' | 'ZAR';

interface CurrencyPickerProps {
  selected: Currency;
  onSelect: (currency: Currency) => void;
}

// 2. Updated Currency Options Array 📜
const currencies: Currency[] = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'THB', 'ZAR'];

export function CurrencyPicker({ selected, onSelect }: CurrencyPickerProps) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
        Primary Vault Currency
      </label>
      {/* 3. Updated Grid Columns to accommodate 7 currencies 📐 */}
      <div className="grid grid-cols-7 gap-2">
        {currencies.map((curr) => (
          <button
            key={curr}
            type="button"
            onClick={() => onSelect(curr)}
            className={`py-2.5 rounded-xl border font-bold text-xs transition ${
              selected === curr
                ? 'border-[#8B5CF6] bg-[#8B5CF6]/15 text-[#A78BFA]'
                : 'border-[#263346] bg-[#0B0F17] text-slate-400 hover:border-slate-700'
            }`}
          >
            {curr}
          </button>
        ))}
      </div>
    </div>
  );
}