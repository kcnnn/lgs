"use client";

import { useRef, useState } from "react";
import { fileToCompressedDataUrl } from "@/lib/roof-inspection/image";
import type { Photo } from "@/lib/roof-inspection/types";

type PhotoSlotProps = {
  photo: Photo;
  onChange: (photo: Photo) => void;
  onRemove?: () => void;
};

export function PhotoSlot({ photo, onChange, onRemove }: PhotoSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      onChange({ ...photo, dataUrl, capturedAt: new Date().toISOString() });
    } catch {
      setError("Could not process that photo. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center relative">
        {photo.dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.dataUrl} alt={photo.label} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-300 text-sm">{busy ? "Processing…" : "No photo"}</span>
        )}
      </div>
      <div className="p-3 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-gray-700 truncate">{photo.label}</span>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="text-xs font-semibold text-orange-600 border border-orange-200 bg-orange-50 rounded-lg px-3 py-1.5 disabled:opacity-50"
          >
            {photo.dataUrl ? "Retake" : "Capture"}
          </button>
          {photo.dataUrl && onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5"
            >
              Remove
            </button>
          )}
        </div>
      </div>
      {error && <p className="px-3 pb-2 text-xs text-red-600">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
