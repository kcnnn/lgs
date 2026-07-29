import type { InspectionData, Photo } from "./types";

const CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const VISION_MODEL = "gpt-4o-mini";
const REPORT_MODEL = "gpt-4o-mini";

export class OpenAIRequestError extends Error {}

async function chatCompletion(
  apiKey: string,
  messages: Array<Record<string, unknown>>,
  model: string
): Promise<string> {
  if (!apiKey) {
    throw new OpenAIRequestError("No API key configured. Add one on the API setup page.");
  }

  let response: Response;
  try {
    response = await fetch(CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
      }),
    });
  } catch {
    throw new OpenAIRequestError(
      "Could not reach the OpenAI API. Check your internet connection and try again."
    );
  }

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body?.error?.message) detail = body.error.message;
    } catch {
      // ignore body parse failure, fall back to status text
    }
    throw new OpenAIRequestError(detail);
  }

  const json = await response.json();
  const content = json?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new OpenAIRequestError("Received an unexpected response from OpenAI.");
  }
  return content;
}

/** Sends one or more photos to ChatGPT vision for a focused inspection analysis. */
export async function analyzePhotos(
  apiKey: string,
  photos: Photo[],
  instructions: string
): Promise<string> {
  const usable = photos.filter((p) => p.dataUrl);
  if (usable.length === 0) {
    throw new OpenAIRequestError("Capture at least one photo before running AI analysis.");
  }

  const content: Array<Record<string, unknown>> = [
    {
      type: "text",
      text: `${instructions}\n\nRespond with a concise, professional field-note style assessment (3-6 sentences). Call out anything an adjuster or homeowner should know.`,
    },
    ...usable.map((p) => ({
      type: "image_url",
      image_url: { url: p.dataUrl, detail: "high" },
    })),
  ];

  return chatCompletion(
    apiKey,
    [
      {
        role: "system",
        content:
          "You are an experienced residential roof inspector assisting with a field inspection. You analyze photos for damage, wear, and installation issues.",
      },
      { role: "user", content },
    ],
    VISION_MODEL
  );
}

/** Compiles the full inspection into a professional written report. */
export async function generateReport(apiKey: string, inspection: InspectionData): Promise<string> {
  const summary = buildInspectionSummary(inspection);

  return chatCompletion(
    apiKey,
    [
      {
        role: "system",
        content:
          "You are a professional roof inspection report writer. You turn structured field notes into a clear, well-organized inspection report suitable for an insurance claim. Use markdown headings for each section.",
      },
      {
        role: "user",
        content: `Write a complete roof inspection report from the following field data. Include sections for Property Information, Elevation Photos, Roof Edge Inspection, Ridge Inspection, Roof Overview, Roof Accessories, Hail Test Square Assessment, Insured Interview, and a final Summary & Recommendation.\n\n${summary}`,
      },
    ],
    REPORT_MODEL
  );
}

function buildInspectionSummary(inspection: InspectionData): string {
  const lines: string[] = [];
  const p = inspection.property;
  lines.push(`Property Information:`);
  lines.push(`- Insured: ${p.insuredName || "N/A"}`);
  lines.push(`- Address: ${p.propertyAddress || "N/A"}`);
  lines.push(`- Claim #: ${p.claimNumber || "N/A"}`);
  lines.push(`- Inspection date: ${p.inspectionDate || "N/A"}`);
  lines.push(`- Inspector: ${p.inspectorName || "N/A"}`);

  lines.push(`\nElevation Photos:`);
  lines.push(
    `- Captured: ${[
      inspection.elevationPhotos.front,
      inspection.elevationPhotos.right,
      inspection.elevationPhotos.rear,
      inspection.elevationPhotos.left,
    ]
      .filter((ph) => ph.dataUrl)
      .map((ph) => ph.label)
      .join(", ") || "none"}`
  );
  if (inspection.elevationPhotos.aiAnalysis) {
    lines.push(`- AI analysis: ${inspection.elevationPhotos.aiAnalysis}`);
  }

  lines.push(`\nRoof Edge Inspection:`);
  lines.push(`- Gutter measurement: ${inspection.roofEdge.gutterMeasurementInches || "N/A"} inches`);
  lines.push(`- Underlayment photos captured: ${inspection.roofEdge.underlaymentPhotos.length}`);
  if (inspection.roofEdge.aiAnalysis) {
    lines.push(`- AI analysis: ${inspection.roofEdge.aiAnalysis}`);
  }

  lines.push(`\nRidge Inspection:`);
  lines.push(
    `- Ridge closeup captured: ${Boolean(inspection.ridgeInspection.ridgeCloseup.dataUrl)}, under-ridge captured: ${Boolean(
      inspection.ridgeInspection.underRidge.dataUrl
    )}`
  );
  if (inspection.ridgeInspection.aiAnalysis) {
    lines.push(`- AI analysis: ${inspection.ridgeInspection.aiAnalysis}`);
  }

  lines.push(`\nRoof Overview:`);
  lines.push(
    `- Overview photos captured: ${inspection.roofOverview.photos.filter((ph) => ph.dataUrl).length} of ${
      inspection.roofOverview.photos.length
    }`
  );
  if (inspection.roofOverview.aiAnalysis) {
    lines.push(`- AI analysis: ${inspection.roofOverview.aiAnalysis}`);
  }

  lines.push(`\nRoof Accessories:`);
  if (inspection.roofAccessories.items.length === 0) {
    lines.push(`- None documented`);
  } else {
    for (const item of inspection.roofAccessories.items) {
      lines.push(
        `- ${item.type || "Unlabeled accessory"}: ${item.notes || "no notes"} (${
          item.photos.filter((ph) => ph.dataUrl).length
        } photo(s))`
      );
    }
  }

  lines.push(`\nHail Test Square:`);
  lines.push(`- Hail hits counted: ${inspection.hailTestSquare.hailHitCount || "N/A"}`);
  lines.push(`- Damage severity assessed: ${inspection.hailTestSquare.damageSeverity}`);
  lines.push(`- Notes: ${inspection.hailTestSquare.notes || "none"}`);
  if (inspection.hailTestSquare.aiAnalysis) {
    lines.push(`- AI analysis: ${inspection.hailTestSquare.aiAnalysis}`);
  }

  lines.push(`\nInsured Interview:`);
  lines.push(`- Damage discussion: ${inspection.insuredInterview.damageDiscussionNotes || "none"}`);
  lines.push(
    `- Satellite verified: ${inspection.insuredInterview.satelliteVerified}, notes: ${
      inspection.insuredInterview.satelliteNotes || "none"
    }`
  );
  lines.push(
    `- Zelle payment received: ${inspection.insuredInterview.zellePaymentReceived}, amount: ${
      inspection.insuredInterview.zelleAmount || "N/A"
    }, reference: ${inspection.insuredInterview.zelleReference || "N/A"}`
  );

  return lines.join("\n");
}
