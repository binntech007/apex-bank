'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, FileText, Camera, AlertCircle } from 'lucide-react';
import { approveKyc, rejectKyc } from '@/actions/admin-kyc';

interface KycSubmission {
  id: string;
  userId: string;
  fullName: string;
  idType: string;
  idNumber: string;
  documentUrl: string;
  userImageUrl: string;
  status: string;
  createdAt: Date;
}

export default function AdminKycClient({ initialSubmissions }: { initialSubmissions: KycSubmission[] }) {
  const [submissions, setSubmissions] = useState<KycSubmission[]>(initialSubmissions);
  const [selectedKycId, setSelectedKycId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    const res = await approveKyc(id);
    if (res.success) {
      setSubmissions((prev) => prev.filter((item) => item.id !== id));
    }
    setLoadingId(null);
  };

  const handleReject = async () => {
    if (!selectedKycId || !rejectionReason.trim()) return;
    setLoadingId(selectedKycId);
    const res = await rejectKyc({ kycId: selectedKycId, reason: rejectionReason });
    if (res.success) {
      setSubmissions((prev) => prev.filter((item) => item.id !== selectedKycId));
      setSelectedKycId(null);
      setRejectionReason('');
    }
    setLoadingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Pending KYC Applications 🛡️</h1>

      {submissions.length === 0 ? (
        <div className="p-8 text-center bg-[#151C28] rounded-2xl border border-[#263346] text-slate-400">
          No pending applications to review. 🎉
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-[#151C28] border border-[#263346] rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white">{sub.fullName}</h3>
                  <p className="text-xs text-slate-400">
                    ID Type: <span className="uppercase text-slate-200">{sub.idType}</span> | Number: {sub.idNumber}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(sub.id)}
                    disabled={loadingId === sub.id}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-xl transition"
                  >
                    <CheckCircle size={16} />
                    Approve
                  </button>
                  <button
                    onClick={() => setSelectedKycId(sub.id)}
                    disabled={loadingId === sub.id}
                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs px-4 py-2 rounded-xl transition"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              </div>

              {/* Images Grid 📄 📸 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#0B0F17] p-3 rounded-xl border border-[#263346]">
                  <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                    <FileText size={14} /> ID Document Photo
                  </p>
                  <img src={sub.documentUrl} alt="ID Document" className="w-full h-48 object-cover rounded-lg" />
                </div>
                <div className="bg-[#0B0F17] p-3 rounded-xl border border-[#263346]">
                  <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                    <Camera size={14} /> User Selfie
                  </p>
                  <img src={sub.userImageUrl} alt="User Selfie" className="w-full h-48 object-cover rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal 💬 */}
      {selectedKycId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#151C28] border border-[#263346] rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="text-red-400" size={20} /> Reason for Rejection
            </h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Image is blurry, name mismatch..."
              className="w-full h-24 bg-[#0B0F17] border border-[#263346] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedKycId(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}