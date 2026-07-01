export type ComparisonRow = {
  label: string;
  us: string;
  eagleview: string;
  hover: string;
};

export const COMPARISON_ROWS: ComparisonRow[] = [
  { label: "Turnaround", us: "~2 hours", eagleview: "1–3 days", hover: "1–2 days" },
  { label: "Uses your own drone", us: "Yes", eagleview: "No", hover: "No" },
  { label: "Price per report", us: "$25–$35", eagleview: "$50+", hover: "$40+" },
  { label: "3D model included", us: "Yes", eagleview: "No", hover: "Yes" },
  { label: "CSV line items included", us: "Yes", eagleview: "No", hover: "No" },
];
