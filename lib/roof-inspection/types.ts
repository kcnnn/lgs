export type Photo = {
  id: string;
  label: string;
  dataUrl: string | null;
  capturedAt: string | null;
};

export type DamageSeverity = "none" | "minor" | "moderate" | "severe";

export type AccessoryItem = {
  id: string;
  type: string;
  notes: string;
  photos: Photo[];
};

export type PropertyInfo = {
  insuredName: string;
  propertyAddress: string;
  claimNumber: string;
  inspectionDate: string;
  inspectorName: string;
};

export type ElevationPhotosData = {
  front: Photo;
  right: Photo;
  rear: Photo;
  left: Photo;
  aiAnalysis: string | null;
};

export type RoofEdgeData = {
  gutterMeasurementInches: string;
  underlaymentPhotos: Photo[];
  aiAnalysis: string | null;
};

export type RidgeInspectionData = {
  ridgeCloseup: Photo;
  underRidge: Photo;
  aiAnalysis: string | null;
};

export type RoofOverviewData = {
  photos: Photo[];
  aiAnalysis: string | null;
};

export type RoofAccessoriesData = {
  items: AccessoryItem[];
};

export type HailTestSquareData = {
  squarePhoto: Photo;
  hailHitCount: string;
  damageSeverity: DamageSeverity;
  notes: string;
  aiAnalysis: string | null;
};

export type InsuredInterviewData = {
  damageDiscussionNotes: string;
  satelliteVerified: boolean;
  satelliteNotes: string;
  zellePaymentReceived: boolean;
  zelleAmount: string;
  zelleReference: string;
};

export type InspectionData = {
  id: string;
  createdAt: string;
  updatedAt: string;
  property: PropertyInfo;
  elevationPhotos: ElevationPhotosData;
  roofEdge: RoofEdgeData;
  ridgeInspection: RidgeInspectionData;
  roofOverview: RoofOverviewData;
  roofAccessories: RoofAccessoriesData;
  hailTestSquare: HailTestSquareData;
  insuredInterview: InsuredInterviewData;
  finalReport: string | null;
};

export const STEP_SLUGS = [
  "elevation-photos",
  "roof-edge",
  "ridge-inspection",
  "roof-overview",
  "roof-accessories",
  "hail-test-square",
  "insured-interview",
] as const;

export type StepSlug = (typeof STEP_SLUGS)[number];
