import type { StepSlug } from "./types";

export type StepConfig = {
  slug: StepSlug;
  index: number;
  title: string;
  shortTitle: string;
  description: string;
};

export const STEPS: StepConfig[] = [
  {
    slug: "elevation-photos",
    index: 1,
    title: "Elevation Photos",
    shortTitle: "Elevation",
    description: "Capture all four elevations of the property.",
  },
  {
    slug: "roof-edge",
    index: 2,
    title: "Roof Edge Inspection",
    shortTitle: "Roof Edge",
    description: "Measure the gutter and photograph the underlayment.",
  },
  {
    slug: "ridge-inspection",
    index: 3,
    title: "Ridge Inspection",
    shortTitle: "Ridge",
    description: "Photograph the ridge closeup and under-ridge detail.",
  },
  {
    slug: "roof-overview",
    index: 4,
    title: "Roof Overview",
    shortTitle: "Overview",
    description: "Capture 8 clockwise overview photos of the roof.",
  },
  {
    slug: "roof-accessories",
    index: 5,
    title: "Roof Accessories",
    shortTitle: "Accessories",
    description: "Document vents, pipes, skylights, and other accessories.",
  },
  {
    slug: "hail-test-square",
    index: 6,
    title: "Hail Test Square",
    shortTitle: "Test Square",
    description: "Run the 10'x10' test square and assess hail damage.",
  },
  {
    slug: "insured-interview",
    index: 7,
    title: "Insured Interview",
    shortTitle: "Interview",
    description: "Discuss damage, verify via satellite, and confirm payment.",
  },
];

export const TOTAL_STEPS = STEPS.length;

export function getStep(slug: StepSlug): StepConfig {
  const step = STEPS.find((s) => s.slug === slug);
  if (!step) throw new Error(`Unknown inspection step: ${slug}`);
  return step;
}

export function getStepPath(slug: StepSlug): string {
  return `/roof-inspection/${slug}`;
}

export function getPrevStep(slug: StepSlug): StepConfig | null {
  const current = getStep(slug);
  return STEPS.find((s) => s.index === current.index - 1) ?? null;
}

export function getNextStep(slug: StepSlug): StepConfig | null {
  const current = getStep(slug);
  return STEPS.find((s) => s.index === current.index + 1) ?? null;
}
