import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { MIME_TO_KIND, detectFileKind, readFileHead } from './file-signature';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

describe('detectFileKind', () => {
  it('recognizes each accepted type from its first bytes', () => {
    expect(detectFileKind(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10]))).toBe(
      'jpg',
    );
    expect(detectFileKind(PNG)).toBe('png');
    expect(
      detectFileKind(Buffer.from('GIF89a\x01\x00\x01\x00', 'latin1')),
    ).toBe('gif');
    expect(
      detectFileKind(Buffer.from('GIF87a\x01\x00\x01\x00', 'latin1')),
    ).toBe('gif');
    expect(
      detectFileKind(Buffer.from('RIFF\x0e\x00\x00\x00WEBPVP8 ', 'latin1')),
    ).toBe('webp');
    expect(detectFileKind(Buffer.from('%PDF-1.7\n'))).toBe('pdf');
    expect(
      detectFileKind(Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00])),
    ).toBe('docx');
  });

  it('rejects content that is not one of the accepted types', () => {
    expect(
      detectFileKind(Buffer.from('<html><script>alert(1)</script>')),
    ).toBeNull();
    expect(
      detectFileKind(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>')),
    ).toBeNull();
    expect(detectFileKind(Buffer.from('MZ\x90\x00\x03'))).toBeNull();
    expect(detectFileKind(Buffer.from('#!/bin/sh\n'))).toBeNull();
  });

  it('rejects empty and truncated files', () => {
    expect(detectFileKind(Buffer.alloc(0))).toBeNull();
    expect(detectFileKind(Buffer.from([0xff, 0xd8]))).toBeNull();
    expect(detectFileKind(Buffer.from('RIFF....WEB'))).toBeNull();
  });

  it('does not take a RIFF container that is not WebP for an image', () => {
    expect(
      detectFileKind(Buffer.from('RIFF\x0e\x00\x00\x00WAVEfmt ', 'latin1')),
    ).toBeNull();
  });
});

describe('MIME_TO_KIND', () => {
  it('maps every accepted MIME type and nothing dangerous', () => {
    expect(MIME_TO_KIND['image/jpeg']).toBe('jpg');
    expect(MIME_TO_KIND['image/jpg']).toBe('jpg');
    expect(MIME_TO_KIND['application/pdf']).toBe('pdf');
    expect(
      MIME_TO_KIND[
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
    ).toBe('docx');
    expect(MIME_TO_KIND['text/html']).toBeUndefined();
    expect(MIME_TO_KIND['image/svg+xml']).toBeUndefined();
    expect(MIME_TO_KIND['application/octet-stream']).toBeUndefined();
  });
});

describe('readFileHead', () => {
  const file = join(tmpdir(), `file-signature-${process.pid}.bin`);
  afterEach(async () => {
    await fs.rm(file, { force: true });
  });

  it('reads only the first bytes of a file', async () => {
    await fs.writeFile(file, Buffer.concat([PNG, Buffer.alloc(5000)]));
    const head = await readFileHead(file);
    expect(head.length).toBe(12);
    expect(detectFileKind(head)).toBe('png');
  });

  it('returns what there is for a file shorter than the signature window', async () => {
    await fs.writeFile(file, Buffer.from('%PDF'));
    expect((await readFileHead(file)).length).toBe(4);
  });

  it('returns nothing for an empty file', async () => {
    await fs.writeFile(file, Buffer.alloc(0));
    expect((await readFileHead(file)).length).toBe(0);
  });
});
