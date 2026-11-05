'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { 
  ArrowLeft, 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  ShieldAlert, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { getApiKeys, generateApiKey, revokeApiKey } from '@/actions/api-keys';

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: 'read_only' | 'full_access';
  lastUsedAt: Date | string | null;
  createdAt: Date | string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Key Form State
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<'read_only' | 'full_access'>('read_only');

  // One-Time Modal State for newly created secret key
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const t = useTranslations('ApiKeysPage');

  const loadKeys = async () => {
    setLoading(true);
    const res = await getApiKeys();
    if (res.success && res.keys) {
      setKeys(res.keys as ApiKeyItem[]);
    } else {
      setMsg({ type: 'error', text: res.error || t('errors.loadFailed') });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setGenerating(true);

    const res = await generateApiKey({ name, permissions });

    if (res.success && res.rawKey) {
      setCreatedSecret(res.rawKey);
      setName('');
      loadKeys();
    } else {
      setMsg({ type: 'error', text: res.error || t('errors.generateFailed') });
    }
    setGenerating(false);
  };

  const handleRevoke = async (id: string) => {
    setMsg(null);
    setRevokingId(id);
    const res = await revokeApiKey(id);
    if (res.success) {
      setMsg({ type: 'success', text: t('success.revoked') });
      loadKeys();
    } else {
      setMsg({ type: 'error', text: res.error || t('errors.revokeFailed') });
    }
    setRevokingId(null);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-center min-h-100 text-slate-400 gap-2">
        <Loader2 size={20} className="animate-spin text-[#8B5CF6]" />
        <span className="text-sm">{t('loading')}</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Navigation 🔙 */}
      <Link 
        href="/dashboard/settings" 
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft size={16} />
        <span>{t('backToSettings')}</span>
      </Link>

      {/* Header 🔑 */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          {t('title')} 🔑
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* Feedback Alert 🔔 */}
      {msg && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
          msg.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* One-Time Secret Key Reveal Banner 🛡️ */}
      {createdSecret && (
        <div className="p-5 rounded-2xl bg-[#8B5CF6]/10 border-2 border-[#8B5CF6]/40 space-y-3 shadow-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert size={18} />
              <span>{t('secretBanner.title')}</span>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            {t.rich('secretBanner.warning', {
              strong: (chunks) => <strong>{chunks}</strong>
            })}
          </p>
          <div className="flex items-center gap-2 bg-[#0B0F17] border border-[#263346] rounded-xl p-2.5">
            <code className="text-xs font-mono text-emerald-400 flex-1 truncate">{createdSecret}</code>
            <button
              type="button"
              onClick={() => copyToClipboard(createdSecret)}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shrink-0"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? t('secretBanner.copied') : t('secretBanner.copyKey')}</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => setCreatedSecret(null)}
            className="text-[11px] text-slate-400 hover:text-white underline pt-1"
          >
            {t('secretBanner.dismiss')}
          </button>
        </div>
      )}

      {/* Create New Key Form ➕ */}
      <form onSubmit={handleGenerate} className="bg-[#151C28] border border-[#263346] rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Plus size={16} className="text-[#8B5CF6]" />
          {t('form.title')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">{t('form.nameLabel')}</label>
            <input
              type="text"
              required
              placeholder={t('form.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">{t('form.permissionsLabel')}</label>
            <select
              value={permissions}
              onChange={(e) => setPermissions(e.target.value as any)}
              className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]"
            >
              <option value="read_only">{t('form.readOnlyOption')}</option>
              <option value="full_access">{t('form.fullAccessOption')}</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={generating}
          className="bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-[#8B5CF6]/20"
        >
          {generating && <Loader2 size={14} className="animate-spin" />}
          <span>{generating ? t('form.generating') : t('form.generateButton')}</span>
        </button>
      </form>

      {/* Active API Keys List 📋 */}
      <div className="bg-[#151C28] border border-[#263346] rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {t('list.title', { count: keys.length })}
        </h3>

        {keys.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">{t('list.empty')}</p>
        ) : (
          <div className="space-y-3">
            {keys.map((item) => (
              <div 
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#0B0F17] border border-[#263346] rounded-xl text-xs gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white text-sm">{item.name}</p>
                    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold capitalize ${
                      item.permissions === 'full_access'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {item.permissions === 'full_access' ? t('list.fullAccessBadge') : t('list.readOnlyBadge')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                    <Key size={12} className="text-[#8B5CF6]" />
                    <span>{item.keyPrefix}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-[#263346] pt-2 sm:pt-0">
                  <div className="text-slate-500 text-[10px] flex items-center gap-1">
                    <Clock size={12} />
                    <span>
                      {item.lastUsedAt 
                        ? t('list.lastUsed', { date: new Date(item.lastUsedAt).toLocaleDateString() })
                        : t('list.neverUsed')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRevoke(item.id)}
                    disabled={revokingId === item.id}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition disabled:opacity-50 flex items-center gap-1"
                    title={t('list.revokeTitle')}
                  >
                    {revokingId === item.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}