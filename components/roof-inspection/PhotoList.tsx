"use client";

import { makeId } from "@/lib/roof-inspection/storage";
import type { Photo } from "@/lib/roof-inspection/types";
import { PhotoSlot } from "./PhotoSlot";

type PhotoListProps = {
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
  labelPrefix?: string;
  addLabel?: string;
};

export function PhotoList({ photos, onChange, labelPrefix = "Photo", addLabel = "+ Add photo" }: PhotoListProps) {
  function addPhoto() {
    onChange([
      ...photos,
      { id: makeId(), label: `${labelPrefix} ${photos.length + 1}`, dataUrl: null, capturedAt: null },
    ]);
  }

  function updatePhoto(index: number, photo: Photo) {
    onChange(photos.map((p, i) => (i === index ? photo : p)));
  }

  function removePhoto(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {photos.map((photo, i) => (
          <PhotoSlot
            key={photo.id}
            photo={photo}
            onChange={(p) => updatePhoto(i, p)}
            onRemove={() => removePhoto(i)}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={addPhoto}
        className="w-full rounded-xl border border-dashed border-gray-300 py-3 text-sm font-semibold text-gray-500"
      >
        {addLabel}
      </button>
    </div>
  );
}
