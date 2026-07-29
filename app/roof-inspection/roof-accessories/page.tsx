"use client";

import { useInspection } from "@/components/roof-inspection/InspectionProvider";
import { PhotoList } from "@/components/roof-inspection/PhotoList";
import { StepShell } from "@/components/roof-inspection/StepShell";
import { getStep } from "@/lib/roof-inspection/steps";
import { makeId } from "@/lib/roof-inspection/storage";
import type { AccessoryItem, Photo } from "@/lib/roof-inspection/types";

const step = getStep("roof-accessories");

const COMMON_TYPES = [
  "Vent",
  "Pipe boot",
  "Skylight",
  "Chimney",
  "Satellite dish",
  "Solar panel",
  "HVAC unit",
  "Other",
];

export default function RoofAccessoriesPage() {
  const { inspection, updateInspection } = useInspection();
  const items = inspection.roofAccessories.items;

  function setItems(next: AccessoryItem[]) {
    updateInspection((d) => ({ ...d, roofAccessories: { items: next } }));
  }

  function addItem() {
    const newItem: AccessoryItem = { id: makeId(), type: "", notes: "", photos: [] };
    setItems([...items, newItem]);
  }

  function updateItem(id: string, patch: Partial<AccessoryItem>) {
    setItems(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    setItems(items.filter((item) => item.id !== id));
  }

  return (
    <StepShell slug="roof-accessories" title={step.title} description={step.description}>
      <div className="space-y-4">
        {items.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">
            No accessories added yet. Add one for every vent, pipe boot, skylight, or other roof
            feature you document.
          </p>
        )}

        {items.map((item, idx) => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400">ACCESSORY #{idx + 1}</span>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="text-xs font-semibold text-red-500"
              >
                Remove
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Type</label>
              <select
                value={COMMON_TYPES.includes(item.type) ? item.type : item.type ? "Other" : ""}
                onChange={(e) => updateItem(item.id, { type: e.target.value === "Other" ? "" : e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm mb-2"
              >
                <option value="" disabled>
                  Select a type…
                </option>
                {COMMON_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={item.type}
                onChange={(e) => updateItem(item.id, { type: e.target.value })}
                placeholder="Custom label"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Notes</label>
              <textarea
                value={item.notes}
                onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="Condition, damage, or observations…"
              />
            </div>

            <PhotoList
              photos={item.photos}
              labelPrefix={item.type || "Accessory"}
              onChange={(photos: Photo[]) => updateItem(item.id, { photos })}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="w-full rounded-xl border border-dashed border-gray-300 py-3 text-sm font-semibold text-gray-500"
        >
          + Add accessory
        </button>
      </div>
    </StepShell>
  );
}
