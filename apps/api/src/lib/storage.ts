import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure the local uploads directory exists at startup (dev only).
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic']);

export function isAllowedMime(mime: string): boolean {
  return ALLOWED_MIME.has(mime);
}

export async function saveFile(buffer: Buffer, mimeType: string): Promise<string> {
  if (isS3Configured()) {
    return saveToS3(buffer, mimeType);
  }
  return saveLocal(buffer, mimeType);
}

function extFromMime(mime: string): string {
  if (mime === 'image/png')  return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}

function saveLocal(buffer: Buffer, mimeType: string): string {
  const filename = `${crypto.randomUUID()}.${extFromMime(mimeType)}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
  const baseUrl = process.env['APP_URL'] ?? 'http://localhost:3001';
  return `${baseUrl}/uploads/${filename}`;
}

function isS3Configured(): boolean {
  return !!(
    process.env['S3_BUCKET'] &&
    process.env['S3_ENDPOINT'] &&
    process.env['S3_ACCESS_KEY_ID'] &&
    process.env['S3_SECRET_ACCESS_KEY']
  );
}

// Placeholder — replace with @aws-sdk/client-s3 when S3_* vars are provided.
async function saveToS3(_buffer: Buffer, _mimeType: string): Promise<string> {
  throw new Error('S3 upload not yet implemented — unset S3_* env vars to use local storage');
}
