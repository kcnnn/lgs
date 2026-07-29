import type { InspectionData, Photo } from "./types";

const API_KEY_STORAGE_KEY = "roof-inspection:api-key";
const INSPECTION_STORAGE_KEY = "roof-inspection:current";

export function makeId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function emptyPhoto(label: string): Photo {
  return { id: makeId(), label, dataUrl: null, capturedAt: null };
}

export function createEmptyInspection(): InspectionData {
  const now = new Date().toISOString();
  return {
    id: makeId(),
    createdAt: now,
    updatedAt: now,
    property: {
      insuredName: "",
      propertyAddress: "",
      claimNumber: "",
      inspectionDate: now.slice(0, 10),
      inspectorName: "",
    },
    elevationPhotos: {
      front: emptyPhoto("Front"),
      right: emptyPhoto("Right"),
      rear: emptyPhoto("Rear"),
      left: emptyPhoto("Left"),
      aiAnalysis: null,
    },
    roofEdge: {
      gutterMeasurementInches: "",
      underlaymentPhotos: [],
      aiAnalysis: null,
    },
    ridgeInspection: {
      ridgeCloseup: emptyPhoto("Ridge closeup"),
      underRidge: emptyPhoto("Under-ridge detail"),
      aiAnalysis: null,
    },
    roofOverview: {
      photos: Array.from({ length: 8 }, (_, i) => emptyPhoto(`Overview ${i + 1}`)),
      aiAnalysis: null,
    },
    roofAccessories: {
      items: [],
    },
    hailTestSquare: {
      squarePhoto: emptyPhoto("Test square"),
      hailHitCount: "",
      damageSeverity: "none",
      notes: "",
      aiAnalysis: null,
    },
    insuredInterview: {
      damageDiscussionNotes: "",
      satelliteVerified: false,
      satelliteNotes: "",
      zellePaymentReceived: false,
      zelleAmount: "",
      zelleReference: "",
    },
    finalReport: null,
  };
}

export function loadInspection(): InspectionData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(INSPECTION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as InspectionData;
  } catch {
    return null;
  }
}

export function saveInspection(data: InspectionData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(INSPECTION_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save inspection to localStorage", err);
  }
}

export function clearInspection(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(INSPECTION_STORAGE_KEY);
}

export function loadApiKey(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(API_KEY_STORAGE_KEY) ?? "";
}

export function saveApiKey(key: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

export function clearApiKey(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(API_KEY_STORAGE_KEY);
}
