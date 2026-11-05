'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { 
  ShieldCheck, 
  FileText, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Upload 
} from 'lucide-react';
import { submitKyc } from '@/actions/kyc';
import CameraCapture from './CameraCapture';

interface KycRecord {
  id: string;
  fullName: string;
  idType: string;
  idNumber: string;
  documentUrl: string;
  userImageUrl: string;
  status: string;
  rejectionReason?: string | null;
}

interface KycClientProps {
  userId: string;
  initialKyc: KycRecord | null;
}

export default function KycClient({ userId, initialKyc }: KycClientProps) {
  const [kyc, setKyc] = useState<KycRecord | null>(initialKyc);
  const [fullName, setFullName] = useState(initialKyc?.fullName || '');
  const [idType, setIdType] = useState(initialKyc?.idType || 'passport');
  const [idNumber, setIdNumber] = useState(initialKyc?.idNumber || '');
  
  const [documentUrl, setDocumentUrl] = useState(initialKyc?.documentUrl || '');
  const [userImageUrl, setUserImageUrl] = useState(initialKyc?.userImageUrl || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const t = useTranslations('KycClient');

  // 📉 Optimized Helper to compress and resize image files before converting to Base64
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Compress image quality to 0.7 (70%) to shrink file size and prevent hanging
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setter(compressedBase64);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    if (!documentUrl) {
      setMessage({ type: 'error', text: t('errors.noDocument') });
      setIsSubmitting(false);
      return;
    }

    if (!userImageUrl) {
      setMessage({ type: 'error', text: t('errors.noSelfie') });
      setIsSubmitting(false);
      return;
    }

    const res = await submitKyc({
      userId,
      fullName,
      idType,
      idNumber,
      documentUrl,
      userImageUrl,
    });

    if (res.success) {
      setMessage({ type: 'success', text: res.message || t('success.submitted') });
      setKyc({
        id: Date.now().toString(),
        fullName,
        idType,
        idNumber,
        documentUrl,
        userImageUrl,
        status: 'pending',
      });
    } else {
      setMessage({ type: 'error', text: res.error || t('errors.failed') });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Back Button 🔙 */}
      <Link 
        href="/dashboard/settings" 
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft size={16} />
        <span>{t('backToSettings')}</span>
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          {t('title')} 🛡️
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* Status Banner 🏷️ */}
      {kyc && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
          kyc.status === 'approved' 
            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' 
            : kyc.status === 'rejected'
            ? 'border-red-500/20 bg-red-500/10 text-red-400'
            : 'border-amber-500/20 bg-amber-500/10 text-amber-400'
        }`}>
          {kyc.status === 'approved' && <CheckCircle2 size={24} />}
          {kyc.status === 'pending' && <Clock size={24} />}
          {kyc.status === 'rejected' && <XCircle size={24} />}
          <div>
            <p className="font-bold text-sm capitalize">
              {t('statusLabel')}: {t(`statuses.${kyc.status}`)}
            </p>
            {kyc.status === 'pending' && (
              <p className="text-xs opacity-80">{t('statusDesc.pending')}</p>
            )}
            {kyc.status === 'approved' && (
              <p className="text-xs opacity-80">{t('statusDesc.approved')}</p>
            )}
            {kyc.status === 'rejected' && (
              <p className="text-xs opacity-80">{kyc.rejectionReason || t('statusDesc.rejected')}</p>
            )}
          </div>
        </div>
      )}

      {/* Notification Banner 🔔 */}
      {message && (
        <div className={`p-4 rounded-xl border text-sm font-semibold ${
          message.type === 'success' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-red-500/20 bg-red-500/10 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Form (Hidden if Approved) 📝 */}
      {kyc?.status !== 'approved' && (
        <form onSubmit={handleSubmit} className="bg-[#151C28] border border-[#263346] rounded-2xl p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">{t('form.fullName')}</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('form.fullNamePlaceholder')}
                required
                className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">{t('form.idType')}</label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
              >
                <option value="passport">{t('form.idTypes.passport')}</option>
                <option value="national_id">{t('form.idTypes.nationalId')}</option>
                <option value="drivers_license">{t('form.idTypes.driversLicense')}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">{t('form.idNumber')}</label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder={t('form.idNumberPlaceholder')}
                required
                className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
          </div>

          {/* Document & Camera Verification Grid 📄 📸 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* 1. ID Document Photo Upload */}
            <div className="border border-dashed border-[#263346] rounded-xl p-4 text-center bg-[#0B0F17] flex flex-col justify-between">
              <div>
                <FileText size={28} className="mx-auto text-[#8B5CF6] mb-2" />
                <p className="text-xs font-semibold text-white mb-1">{t('upload.title')}</p>
                <p className="text-[10px] text-slate-400 mb-4">{t('upload.subtitle')}</p>
              </div>
              
              <div>
                <label className="cursor-pointer inline-flex items-center gap-1.5 bg-[#151C28] hover:bg-[#1E293B] text-white text-xs px-3 py-2 rounded-lg border border-[#263346] transition">
                  <Upload size={14} />
                  <span>{t('upload.chooseFile')}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e, setDocumentUrl)} 
                    className="hidden" 
                  />
                </label>

                {documentUrl && (
                  <p className="text-[10px] text-emerald-400 mt-2 font-mono">{t('upload.attached')}</p>
                )}
              </div>
            </div>

            {/* 2. Live Selfie Camera Capture 📸 */}
            <div className="border border-dashed border-[#263346] rounded-xl p-4 text-center bg-[#0B0F17]">
              <p className="text-xs font-semibold text-white mb-1">{t('selfie.title')}</p>
              <p className="text-[10px] text-slate-400 mb-3">{t('selfie.subtitle')}</p>

              {/* Live Camera Component */}
              <CameraCapture onCapture={(base64Image) => setUserImageUrl(base64Image)} />

              {userImageUrl && (
                <p className="text-[10px] text-emerald-400 mt-2 font-mono">{t('selfie.attached')}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-[#8B5CF6]/20"
          >
            {isSubmitting ? t('submitButton.processing') : t('submitButton.default')}
          </button>
        </form>
      )}
    </div>
  );
}