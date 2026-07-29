import type { Metadata } from "next";
import { InspectionProvider } from "@/components/roof-inspection/InspectionProvider";

export const metadata: Metadata = {
  title: "Roof Inspection Wizard",
  description:
    "A mobile-first, AI-assisted roof inspection workflow: elevation photos, roof edge, ridge, overview, accessories, hail test square, and the insured interview.",
};

export default function RoofInspectionLayout({ children }: { children: React.ReactNode }) {
  return <InspectionProvider>{children}</InspectionProvider>;
}
