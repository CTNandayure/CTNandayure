import { promises as fs } from 'fs';

export type FileKind = 'jpg' | 'png' | 'gif' | 'webp' | 'pdf' | 'docx';

// What POST /businesses/upload accepts, keyed by the MIME type the browser declares.
export const MIME_TO_KIND: Record<string, FileKind> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
};

export const SIGNATURE_BYTES = 12;
const GIF_HEADER = /^GIF8[79]a$/;

function startsWith(head: Buffer, bytes: number[], offset = 0): boolean {
  return bytes.every((byte, i) => head[offset + i] === byte);
}

// The MIME type and file name come from the client, so they say nothing about what
// was actually sent. The first bytes of a real file do: this returns the kind they
// belong to, or null when they match none of the types we accept.
export function detectFileKind(head: Buffer): FileKind | null {
  if (startsWith(head, [0xff, 0xd8, 0xff])) return 'jpg';
  if (startsWith(head, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'png';
  }
  if (GIF_HEADER.test(head.subarray(0, 6).toString('latin1'))) return 'gif';
  if (
    head.subarray(0, 4).toString('latin1') === 'RIFF' &&
    head.subarray(8, 12).toString('latin1') === 'WEBP'
  ) {
    return 'webp';
  }
  if (head.subarray(0, 5).toString('latin1') === '%PDF-') return 'pdf';
  // A .docx is a ZIP archive.
  if (startsWith(head, [0x50, 0x4b, 0x03, 0x04])) return 'docx';
  return null;
}

export async function readFileHead(path: string): Promise<Buffer> {
  const handle = await fs.open(path, 'r');
  try {
    const buffer = Buffer.alloc(SIGNATURE_BYTES);
    const { bytesRead } = await handle.read(buffer, 0, SIGNATURE_BYTES, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
}
