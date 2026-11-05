'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Check } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1. Start the camera feed 🎥
  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // Front camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please check browser permissions.');
    }
  };

  // 2. Stop camera tracks on unmount or reset 🛑
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // 3. Take a snapshot onto canvas 📸
  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw the current video frame onto canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert frame to Base64 string
      const imageData = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(imageData);
      onCapture(imageData);
      stopCamera();
    }
  };

  // 4. Retake photo 🔄
  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl w-full text-center">
          {error}
        </p>
      )}

      {/* Hidden canvas element for frame rendering 🎨 */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Video Preview or Captured Photo 🖼️ */}
      <div className="relative w-full max-w-sm h-72 bg-[#0B0F17] rounded-2xl overflow-hidden border border-[#263346] flex items-center justify-center">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100" // Mirror effect
            />

            {/* Oval Face Alignment Overlay 🎯 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-60 rounded-[50%] border-2 border-dashed border-[#8B5CF6] bg-black/20" />
            </div>

            <span className="absolute bottom-3 text-[11px] text-slate-300 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
              Position face inside the oval
            </span>
          </>
        ) : (
          <img
            src={capturedImage}
            alt="Captured Selfie"
            className="w-full h-full object-cover -scale-x-100"
          />
        )}
      </div>

      {/* Action Buttons 🔘 */}
      {!capturedImage ? (
        <button
          type="button"
          onClick={takeSnapshot}
          className="flex items-center gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-[#8B5CF6]/20"
        >
          <Camera size={16} />
          <span>Capture Selfie</span>
        </button>
      ) : (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={retake}
            className="flex items-center gap-1.5 bg-[#151C28] hover:bg-[#1E293B] text-slate-300 text-xs px-4 py-2 rounded-xl border border-[#263346] transition"
          >
            <RefreshCw size={14} />
            <span>Retake</span>
          </button>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-3 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <Check size={14} />
            <span>Selfie Saved</span>
          </div>
        </div>
      )}
    </div>
  );
}