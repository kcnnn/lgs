import FormData from "form-data";

const TASK_OPTIONS = [
  { name: "dsm", value: true },
  { name: "orthophoto-resolution", value: 2 },
  { name: "pc-quality", value: "medium" },
  { name: "auto-boundary", value: true },
];

export type WebODMTaskStatus = {
  id: string;
  status: { code: number } | null;
  running_progress: number;
  last_error?: string;
};

// WebODM task status codes
export const TASK_STATUS = {
  QUEUED: 10,
  RUNNING: 20,
  FAILED: 30,
  COMPLETED: 40,
  CANCELED: 50,
} as const;

function baseUrl() {
  return (process.env.WEBODM_BASE_URL ?? "").replace(/\/$/, "");
}

export async function webodmAuthenticate(): Promise<string> {
  const res = await fetch(`${baseUrl()}/api/token-auth/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: process.env.WEBODM_USERNAME,
      password: process.env.WEBODM_PASSWORD,
    }),
  });
  if (!res.ok) {
    throw new Error(`WebODM auth failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { token: string };
  return data.token;
}

export async function webodmCreateProject(token: string, name: string): Promise<{ id: number }> {
  const res = await fetch(`${baseUrl()}/api/projects/`, {
    method: "POST",
    headers: {
      Authorization: `JWT ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    throw new Error(`WebODM create project failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function webodmCreateTask(
  token: string,
  projectId: number,
  name: string,
  images: { filename: string; stream: NodeJS.ReadableStream }[],
): Promise<{ id: string }> {
  const form = new FormData();
  form.append("name", name);
  form.append("options", JSON.stringify(TASK_OPTIONS));
  for (const image of images) {
    form.append("images", image.stream, { filename: image.filename });
  }

  const res = await fetch(`${baseUrl()}/api/projects/${projectId}/tasks/`, {
    method: "POST",
    headers: {
      Authorization: `JWT ${token}`,
      ...form.getHeaders(),
    },
    // @ts-expect-error -- Node fetch requires duplex for streaming request bodies
    duplex: "half",
    body: form as unknown as BodyInit,
  });
  if (!res.ok) {
    throw new Error(`WebODM create task failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function webodmGetTask(
  token: string,
  projectId: number,
  taskId: string,
): Promise<WebODMTaskStatus> {
  const res = await fetch(`${baseUrl()}/api/projects/${projectId}/tasks/${taskId}/`, {
    headers: { Authorization: `JWT ${token}` },
  });
  if (!res.ok) {
    throw new Error(`WebODM get task failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function webodmDownloadAsset(
  token: string,
  projectId: number,
  taskId: string,
  asset: string,
): Promise<NodeJS.ReadableStream> {
  const res = await fetch(
    `${baseUrl()}/api/projects/${projectId}/tasks/${taskId}/download/${asset}`,
    { headers: { Authorization: `JWT ${token}` } },
  );
  if (!res.ok || !res.body) {
    throw new Error(`WebODM download ${asset} failed: ${res.status} ${await res.text()}`);
  }
  const { Readable } = await import("node:stream");
  return Readable.fromWeb(res.body as never);
}
