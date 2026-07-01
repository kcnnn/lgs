"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);
const MAX_FILE_BYTES = 30 * 1024 * 1024;
const MIN_FILES = 20;
const MAX_FILES = 300;
const BATCH_SIZE = 20;

type FileState = {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  key?: string;
};

export function UploadDropzone({ jobId }: { jobId: string }) {
  const [files, setFiles] = useState<FileState[]>([]);
  const [uploading, setUploading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      setFormError(null);
      const next: FileState[] = [];
      for (const file of Array.from(incoming)) {
        if (!ALLOWED_TYPES.has(file.type)) {
          setFormError(`${file.name}: only .jpg/.jpeg/.png files are accepted`);
          continue;
        }
        if (file.size > MAX_FILE_BYTES) {
          setFormError(`${file.name}: exceeds 30MB limit`);
          continue;
        }
        next.push({ file, progress: 0, status: "pending" });
      }
      setFiles((prev) => {
        const combined = [...prev, ...next];
        if (combined.length > MAX_FILES) {
          setFormError(`Maximum ${MAX_FILES} photos per job`);
          return combined.slice(0, MAX_FILES);
        }
        return combined;
      });
    },
    [],
  );

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadFile(fileState: FileState, index: number) {
    const res = await fetch(`/api/jobs/${jobId}/presign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        files: [{ name: fileState.file.name, type: fileState.file.type, size: fileState.file.size }],
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to get upload URL");
    }
    const { uploads } = await res.json();
    const { url, key } = uploads[0];

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", fileState.file.type);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setFiles((prev) => {
            const copy = [...prev];
            copy[index] = { ...copy[index], progress, status: "uploading" };
            return copy;
          });
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload failed (${xhr.status})`));
      };
      xhr.onerror = () => reject(new Error("Upload failed"));
      xhr.send(fileState.file);
    });

    setFiles((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], progress: 100, status: "done", key };
      return copy;
    });
  }

  async function startUpload() {
    setFormError(null);
    if (files.length < MIN_FILES) {
      setFormError(`Please add at least ${MIN_FILES} photos`);
      return;
    }
    setUploading(true);
    try {
      const pendingIndices = files
        .map((f, i) => [f, i] as const)
        .filter(([f]) => f.status !== "done")
        .map(([, i]) => i);

      for (let batchStart = 0; batchStart < pendingIndices.length; batchStart += BATCH_SIZE) {
        const indices = pendingIndices.slice(batchStart, batchStart + BATCH_SIZE);
        await Promise.all(
          indices.map(async (index) => {
            try {
              await uploadFile(files[index], index);
            } catch (err) {
              setFiles((prev) => {
                const copy = [...prev];
                copy[index] = {
                  ...copy[index],
                  status: "error",
                  error: err instanceof Error ? err.message : "Upload failed",
                };
                return copy;
              });
            }
          }),
        );
      }
    } finally {
      setUploading(false);
    }
  }

  const allDone = files.length >= MIN_FILES && files.every((f) => f.status === "done");
  const hasErrors = files.some((f) => f.status === "error");

  async function finishUpload() {
    setFormError(null);
    const res = await fetch(`/api/jobs/${jobId}/finish-upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoCount: files.length }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setFormError(data.error ?? "Failed to finish upload");
      return;
    }
    setFinished(true);
    router.refresh();
  }

  if (finished) {
    return (
      <div className="rounded-lg border border-accent/30 bg-accent/5 p-8 text-center">
        <h2 className="text-xl font-semibold">We&apos;re processing your roof.</h2>
        <p className="mt-2 text-black/70">
          You&apos;ll get an email when your report is ready — usually within 2 hours.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer rounded-lg border-2 border-dashed border-black/20 p-12 text-center hover:border-accent"
      >
        <p className="font-medium">Drag and drop photos here, or click to browse</p>
        <p className="mt-1 text-sm text-black/60">
          .jpg or .png · {MIN_FILES}-{MAX_FILES} photos · 30MB max per file
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}

      {files.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium">
            {files.length} photo{files.length === 1 ? "" : "s"} selected
          </p>
          <ul className="max-h-80 space-y-1 overflow-y-auto text-sm">
            {files.map((f, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="w-48 truncate">{f.file.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded bg-black/10">
                  <div
                    className={`h-full ${f.status === "error" ? "bg-red-500" : "bg-accent"}`}
                    style={{ width: `${f.progress}%` }}
                  />
                </div>
                <span className="w-16 text-right text-black/60">
                  {f.status === "error" ? "Error" : `${f.progress}%`}
                </span>
                {f.status === "pending" && !uploading && (
                  <button onClick={() => removeFile(i)} className="text-black/40 hover:text-black">
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex gap-3">
            {!allDone && (
              <button
                onClick={startUpload}
                disabled={uploading || files.length < MIN_FILES}
                className="rounded bg-accent px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {uploading ? "Uploading…" : `Upload ${files.length} photos`}
              </button>
            )}
            {allDone && (
              <button
                onClick={finishUpload}
                className="rounded bg-accent px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                Finish upload
              </button>
            )}
            {hasErrors && (
              <button
                onClick={startUpload}
                className="rounded border border-black/20 px-4 py-3 text-sm font-semibold hover:border-accent"
              >
                Retry failed
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
