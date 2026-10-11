import { validateProgress, type ProgressState } from '../progression/progression';

export const APP_ID = 'script-ramp';
export const EXPORT_VERSION = 1;

export interface LearnerData {
  progress: ProgressState;
}

export interface ExportFile {
  fileName: string;
  json: string;
}

// @spec PERS-002
export function buildExport(data: LearnerData, now: Date): ExportFile {
  const date = now.toISOString().slice(0, 10);
  return {
    fileName: `${APP_ID}-${date}.json`,
    json: JSON.stringify({ app: APP_ID, version: EXPORT_VERSION, exportedAt: now.toISOString(), ...data }, null, 2),
  };
}

export type ImportResult = { ok: true; data: LearnerData } | { ok: false };

// @spec PERS-003, PERS-007
export function parseImport(text: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false };
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return { ok: false };
  const { app, version, progress } = parsed as Record<string, unknown>;
  if (app !== APP_ID || version !== EXPORT_VERSION || !validateProgress(progress)) return { ok: false };
  return { ok: true, data: { progress } };
}

export interface DeliveryEnv {
  canShare?: (data: ShareData) => boolean;
  share?: (data: ShareData) => Promise<void>;
  download: (fileName: string, blob: Blob) => void;
}

function browserDownload(fileName: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function browserDeliveryEnv(): DeliveryEnv {
  return {
    canShare: navigator.canShare?.bind(navigator),
    share: navigator.share?.bind(navigator),
    download: browserDownload,
  };
}

/** Hands the file to the share sheet where file sharing works (iOS), otherwise downloads it. */
// @spec PERS-002
export async function deliverExport(file: ExportFile, env: DeliveryEnv = browserDeliveryEnv()): Promise<void> {
  const blob = new Blob([file.json], { type: 'application/json' });
  const shareData = { files: [new File([blob], file.fileName, { type: 'application/json' })] };

  if (env.share && env.canShare?.(shareData)) {
    try {
      await env.share(shareData);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) env.download(file.fileName, blob);
    }
    return;
  }
  env.download(file.fileName, blob);
}
