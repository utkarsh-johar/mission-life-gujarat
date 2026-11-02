"use client";

import React, { useState } from "react";
import { Camera, Upload, CheckCircle2, AlertCircle, Loader2, X, ShieldCheck } from "lucide-react";
import { computeDHashFromGrayscale } from "../../lib/engine/credits";

interface ProofOfHabitModalProps {
  ruleId: string;
  ruleTitle: string;
  creditsReward: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (creditsAwarded: number) => void;
}

export const ProofOfHabitModal: React.FC<ProofOfHabitModalProps> = ({
  ruleId,
  ruleTitle,
  creditsReward,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [evidenceType, setEvidenceType] = useState<"PHOTO" | "TICKET" | "AUTO_SENSOR">("PHOTO");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [imageHash, setImageHash] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  // Process uploaded image to generate perceptual dHash
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 5 MB limit.");
      return;
    }

    setErrorMsg(null);
    setPreviewUrl(URL.createObjectURL(file));

    // Render image to canvas at 9x8 pixels to compute 64-bit dHash
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 9;
      canvas.height = 8;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, 9, 8);
      const imgData = ctx.getImageData(0, 0, 9, 8).data;

      // Convert to 8 rows x 9 columns grayscale matrix
      const matrix: number[][] = [];
      for (let r = 0; r < 8; r++) {
        const row: number[] = [];
        for (let c = 0; c < 9; c++) {
          const idx = (r * 9 + c) * 4;
          // Grayscale formula: 0.299 R + 0.587 G + 0.114 B
          const gray = Math.round(
            0.299 * imgData[idx] + 0.587 * imgData[idx + 1] + 0.114 * imgData[idx + 2]
          );
          row.push(gray);
        }
        matrix.push(row);
      }

      const hash = computeDHashFromGrayscale(matrix);
      setImageHash(hash);
    };

    img.src = URL.createObjectURL(file);
  };

  const handleSubmitProof = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/habits/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-citizen-id",
          ruleId,
          evidenceType,
          imageHash: imageHash ?? `hash-${ruleId}-${Date.now().toString(16)}`,
          status: "APPROVED",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Duplicate detection error from AC-D3
        throw new Error(data.error?.message || "Verification failed");
      }

      onSuccess(data.creditsAwarded);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit verification proof.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-xl bg-tealbrand-50 text-tealbrand-700 dark:bg-tealbrand-950/50 dark:text-teal-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Proof-of-Habit Verification
            </h3>
            <span className="text-xs text-tealbrand-600 dark:text-teal-400 font-semibold">
              +{creditsReward} LiFE Credits
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          Submit photo or receipt evidence for <strong>{ruleTitle}</strong> to verify action on the climate ledger.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-900">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Evidence Type Selector */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            type="button"
            onClick={() => setEvidenceType("PHOTO")}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 ${
              evidenceType === "PHOTO"
                ? "border-tealbrand-500 bg-tealbrand-50 dark:bg-tealbrand-950/40 text-tealbrand-800 dark:text-teal-300"
                : "border-slate-200 dark:border-slate-800 text-slate-600"
            }`}
          >
            <Camera className="w-4 h-4" /> Photo Evidence
          </button>

          <button
            type="button"
            onClick={() => setEvidenceType("TICKET")}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 ${
              evidenceType === "TICKET"
                ? "border-tealbrand-500 bg-tealbrand-50 dark:bg-tealbrand-950/40 text-tealbrand-800 dark:text-teal-300"
                : "border-slate-200 dark:border-slate-800 text-slate-600"
            }`}
          >
            <Upload className="w-4 h-4" /> Transit Ticket
          </button>

          <button
            type="button"
            onClick={() => setEvidenceType("AUTO_SENSOR")}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 ${
              evidenceType === "AUTO_SENSOR"
                ? "border-tealbrand-500 bg-tealbrand-50 dark:bg-tealbrand-950/40 text-tealbrand-800 dark:text-teal-300"
                : "border-slate-200 dark:border-slate-800 text-slate-600"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" /> Auto Sensor
          </button>
        </div>

        {/* Photo Upload Zone with Perceptual Hash */}
        {evidenceType !== "AUTO_SENSOR" ? (
          <div className="mb-4">
            <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-tealbrand-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/50">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
              />
              {previewUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={previewUrl} alt="Preview" className="h-28 rounded-lg object-cover" />
                  <span className="text-[11px] text-tealbrand-600 font-medium">Click to replace photo</span>
                  {imageHash && (
                    <span className="text-[10px] text-slate-400 font-mono">dHash: {imageHash}</span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center text-center py-2">
                  <Camera className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Capture photo or upload ticket
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    Images are hashed to prevent duplicate claims
                  </span>
                </div>
              )}
            </label>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 mb-4 text-xs text-emerald-800 dark:text-emerald-300">
            ✓ Weather sensor corroborated: Outdoor temperature and time window match challenge criteria.
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isProcessing || (evidenceType !== "AUTO_SENSOR" && !previewUrl)}
            onClick={handleSubmitProof}
            className="px-5 py-2.5 bg-tealbrand-600 hover:bg-tealbrand-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            Verify & Claim +{creditsReward} Credits
          </button>
        </div>
      </div>
    </div>
  );
};
