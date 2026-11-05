// app/[locale]/(dashboard)/dashboard/settings/security/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft, 
  KeyRound, 
  ShieldCheck, 
  Smartphone, 
  ChevronDown, 
  ChevronUp, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { updatePassword, getActiveSessions, revokeSession } from '@/actions/security';
import { generate2FASecret, verifyAndEnable2FA, disable2FA } from '@/actions/2fa';

interface SessionData {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  lastActive: Date | string;
  isCurrent?: boolean;
}

export default function SecuritySettingsPage() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email as string;

  const [openSection, setOpenSection] = useState<string | null>('password');

  // Password Form State 🔑
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 2FA State 🔐
  const [is2FAEnabled, setIs2FAEnabled] = useState(false); 
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [twoFactorMsg, setTwoFactorMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading2FA, setLoading2FA] = useState(false);

  // Active Sessions State 📱
  const [sessionsList, setSessionsList] = useState<SessionData[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    const res = await getActiveSessions();
    if (res.success && res.sessions) {
      setSessionsList(res.sessions);
    }
    setLoadingSessions(false);
  };

  useEffect(() => {
    if (openSection === 'sessions') {
      fetchSessions();
    }
  }, [openSection]);

  const toggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsSubmitting(true);
    const result = await updatePassword({ currentPassword, newPassword });

    if (result.success) {
      setPasswordMsg({ type: 'success', text: result.message || 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordMsg({ type: 'error', text: result.error || 'An error occurred.' });
    }

    setIsSubmitting(false);
  };

  // Start 2FA Setup Flow 📱
  const handleStart2FASetup = async () => {
    if (!userEmail) return;
    setLoading2FA(true);
    setTwoFactorMsg(null);
    const res = await generate2FASecret(userEmail);
    if (res.success && res.qrCodeUrl) {
      setQrCodeUrl(res.qrCodeUrl);
      setIsSettingUp2FA(true);
    } else {
      setTwoFactorMsg({ type: 'error', text: res.error || 'Failed to initialize 2FA.' });
    }
    setLoading2FA(false);
  };

  // Verify and Enable 2FA 🛡️
  const handleVerifyAndEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) return;
    setLoading2FA(true);
    setTwoFactorMsg(null);

    const res = await verifyAndEnable2FA(userEmail, twoFactorToken);
    if (res.success) {
      setIs2FAEnabled(true);
      setIsSettingUp2FA(false);
      setQrCodeUrl(null);
      setTwoFactorToken('');
      setTwoFactorMsg({ type: 'success', text: res.message || '2FA enabled successfully!' });
    } else {
      setTwoFactorMsg({ type: 'error', text: res.error || 'Invalid code.' });
    }
    setLoading2FA(false);
  };

  // Disable 2FA 🔓
  const handleDisable2FA = async () => {
    if (!userEmail) return;
    setLoading2FA(true);
    setTwoFactorMsg(null);
    const res = await disable2FA(userEmail);
    if (res.success) {
      setIs2FAEnabled(false);
      setTwoFactorMsg({ type: 'success', text: res.message || '2FA disabled successfully!' });
    } else {
     setTwoFactorMsg({ type: 'error', text: res.error || 'Failed to disable 2FA.' });
    }
    setLoading2FA(false);
  };

  const handleRevokeSession = async (sessionToken: string) => {
    setRevokingId(sessionToken);
    const res = await revokeSession(sessionToken);
    if (res.success) {
      setSessionsList((prev) => prev.filter((s) => s.id !== sessionToken));
    }
    setRevokingId(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Link 
        href="/dashboard/settings" 
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft size={16} />
        <span>Back to Settings</span>
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          Security Settings 🔒
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your password, multi-factor authentication, and active device logins.
        </p>
      </div>

      <div className="space-y-4">
        {/* SECTION 1: Change Password 🔑 */}
        <div className="bg-[#151C28] border border-[#263346] rounded-2xl overflow-hidden transition">
          <button
            onClick={() => toggleSection('password')}
            className="w-full p-5 flex items-center justify-between text-left hover:bg-[#1C2638] transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20">
                <KeyRound size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Change Password</h3>
                <p className="text-xs text-slate-400">Update your account login password</p>
              </div>
            </div>
            {openSection === 'password' ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
          </button>

          {openSection === 'password' && (
            <div className="p-5 border-t border-[#263346] bg-[#0B0F17]/50 space-y-4">
              {passwordMsg && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  passwordMsg.type === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {passwordMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-[#8B5CF6]/20"
                >
                  {isSubmitting ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* SECTION 2: Two-Factor Authentication (2FA) 🛡️ */}
        <div className="bg-[#151C28] border border-[#263346] rounded-2xl overflow-hidden transition">
          <button
            onClick={() => toggleSection('2fa')}
            className="w-full p-5 flex items-center justify-between text-left hover:bg-[#1C2638] transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Two-Factor Authentication (2FA)</h3>
                <p className="text-xs text-slate-400">Add an extra layer of security to your account</p>
              </div>
            </div>
            {openSection === '2fa' ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
          </button>

          {openSection === '2fa' && (
            <div className="p-5 border-t border-[#263346] bg-[#0B0F17]/50 space-y-4">
              {twoFactorMsg && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  twoFactorMsg.type === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {twoFactorMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{twoFactorMsg.text}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-300 font-semibold">
                    Status: {is2FAEnabled ? <span className="text-emerald-400">Enabled</span> : <span className="text-amber-400">Disabled</span>}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {is2FAEnabled 
                      ? 'Your account is secured with TOTP authenticator app verification.' 
                      : 'Enable 2FA to require an authenticator code when signing in.'}
                  </p>
                </div>
                {!is2FAEnabled && !isSettingUp2FA && (
                  <button
                    onClick={handleStart2FASetup}
                    disabled={loading2FA}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition border shrink-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {loading2FA && <Loader2 size={14} className="animate-spin" />}
                    <span>Enable 2FA</span>
                  </button>
                )}
                {is2FAEnabled && (
                  <button
                    onClick={handleDisable2FA}
                    disabled={loading2FA}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition border shrink-0 bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {loading2FA && <Loader2 size={14} className="animate-spin" />}
                    <span>Disable 2FA</span>
                  </button>
                )}
              </div>

              {/* QR Code Setup Modal / Section */}
              {isSettingUp2FA && qrCodeUrl && (
                <div className="mt-4 p-4 bg-[#151C28] border border-[#263346] rounded-xl space-y-4 max-w-sm">
                  <p className="text-xs text-slate-300">
                    Scan this QR code with your authenticator app (like Google Authenticator or Authy), then enter the 6-digit code below.
                  </p>
                  <div className="flex justify-center bg-white p-2 rounded-lg w-fit mx-auto">
                    <img src={qrCodeUrl} alt="2FA QR Code" width={150} height={150} />
                  </div>
                  <form onSubmit={handleVerifyAndEnable} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={twoFactorToken}
                      onChange={(e) => setTwoFactorToken(e.target.value)}
                      maxLength={6}
                      required
                      className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-sm text-center tracking-widest text-white focus:outline-none focus:border-[#8B5CF6]"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={loading2FA}
                        className="flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl transition"
                      >
                        {loading2FA ? 'Verifying...' : 'Verify & Enable'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsSettingUp2FA(false)}
                        className="px-3 py-2.5 bg-[#263346] text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 3: Active Sessions 📱 */}
        <div className="bg-[#151C28] border border-[#263346] rounded-2xl overflow-hidden transition">
          <button
            onClick={() => toggleSection('sessions')}
            className="w-full p-5 flex items-center justify-between text-left hover:bg-[#1C2638] transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Smartphone size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Active Sessions</h3>
                <p className="text-xs text-slate-400">Devices currently logged into your account</p>
              </div>
            </div>
            {openSection === 'sessions' ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
          </button>

          {openSection === 'sessions' && (
            <div className="p-5 border-t border-[#263346] bg-[#0B0F17]/50 space-y-3">
              {loadingSessions ? (
                <div className="flex items-center justify-center py-6 text-slate-400 text-xs gap-2">
                  <Loader2 size={16} className="animate-spin text-[#8B5CF6]" />
                  <span>Loading active sessions...</span>
                </div>
              ) : sessionsList.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No active sessions found.</p>
              ) : (
                sessionsList.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3.5 bg-[#151C28] border border-[#263346] rounded-xl text-xs">
                    <div>
                      <p className="font-semibold text-white flex items-center gap-2">
                        {s.userAgent || 'Unknown Device'}
                      </p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        IP: {s.ipAddress || 'Unknown'} • Active: {new Date(s.lastActive).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRevokeSession(s.id)}
                      disabled={revokingId === s.id}
                      className="flex items-center gap-1 text-red-400 hover:text-red-300 font-semibold transition px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 disabled:opacity-50"
                    >
                      {revokingId === s.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <LogOut size={14} />
                      )}
                      <span>Revoke</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}