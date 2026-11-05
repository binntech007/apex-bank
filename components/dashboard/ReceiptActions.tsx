'use client';

import { Printer } from 'lucide-react';

export function ReceiptActions() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 bg-[#263346] hover:bg-[#32435f] text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 print:hidden"
    >
      <Printer size={14} />
      <span>Download PDF / Print</span>
    </button>
  );
}