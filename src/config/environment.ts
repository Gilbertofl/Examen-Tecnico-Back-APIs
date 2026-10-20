import path from "node:path";

const DEFAULT_PORT = 3000;
const DEFAULT_MAX_VIDEO_SIZE_MB = 50;
const BYTES_PER_MEGABYTE = 1024 * 1024;

function readPositiveInteger(variableName: string, defaultValue: number): number {
  const value = Number(process.env[variableName] ?? defaultValue);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${variableName} debe ser un entero positivo`);
  }

  return value;
}

export const environment = {
  port: readPositiveInteger("PORT", DEFAULT_PORT),
  videoStorageDirectory: path.resolve(process.env.VIDEO_STORAGE_DIR ?? "storage/videos"),
  maxVideoSizeBytes:
    readPositiveInteger("MAX_VIDEO_SIZE_MB", DEFAULT_MAX_VIDEO_SIZE_MB) * BYTES_PER_MEGABYTE,
};
