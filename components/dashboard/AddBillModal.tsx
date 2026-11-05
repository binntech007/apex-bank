'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PlusCircle, X, Tv, Zap, Droplets, Wifi, Receipt } from 'lucide-react';

interface AddBillModalProps {
  onAddBill?: (bill: { title: string; amount: string; category: string }) => void;
}

export function AddBillModal({}: AddBillModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState('Electricity');
  const [amount, setAmount] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  const t = useTranslations('AddBillModal');

  const categories = [
    { name: 'Electricity', icon: Zap, defaultTitle: t('categories.electricity') },
    { name: 'Water', icon: Droplets, defaultTitle: t('categories.water') },
    { name: 'Internet / Data', icon: Wifi, defaultTitle: t('categories.internet') },
    { name: 'Streaming', icon: Tv, defaultTitle: t('categories.streaming') },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    setAmount('');
  };

  return (
    <>
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-violet-500/20"
      >
        <PlusCircle size={16} />
        <span>{t('addButton')}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#151C28] border border-[#263346] rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#263346]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <Receipt size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{t('modalTitle')}</h3>
                  <p className="text-[11px] text-slate-400">{t('modalSubtitle')}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-400 mb-2">{t('selectUtility')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.name;
                    return (
                      <button
                        type="button"
                        key={cat.name}
                        onClick={() => {
                          setCategory(cat.name);
                          setCustomTitle(cat.defaultTitle);
                        }}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition ${
                          isSelected 
                            ? 'bg-violet-500/10 border-violet-500/50 text-white' 
                            : 'bg-[#0B0F17] border-[#263346] text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <Icon size={16} className={isSelected ? 'text-violet-400' : 'text-slate-500'} />
                        <span className="font-semibold">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">{t('billReference')}</label>
                <input 
                  type="text"
                  value={customTitle || t('categories.electricity')}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">{t('amountLabel')}</label>
                <input 
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#263346]">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#263346] text-slate-300 hover:bg-slate-800 transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7c3aed] text-white font-semibold shadow-lg shadow-violet-500/20 transition"
                >
                  {t('proceed')}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}