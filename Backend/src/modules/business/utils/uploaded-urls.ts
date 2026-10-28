import { BadRequestException } from '@nestjs/common';
import type { Request } from 'express';

interface FileUrlFields {
  coverImageUrl?: string;
  galleryUrls?: string[];
  documentUrls?: string[];
}

// The DTO validators (validators/uploaded-file-url.ts) check that photos and documents
// look like files the app stored. This checks the other half: that they live on THIS
// server, the same origin POST /businesses/upload builds its URLs from. Without it a
// request could point them at another site, and the admin reviewing it would load
// (or click through to) whatever that site serves.
export function assertUploadedFromThisSite(
  fields: FileUrlFields,
  req: Pick<Request, 'protocol' | 'get'>,
): void {
  const uploadsPrefix = `${req.protocol}://${req.get('host')}/uploads/`;
  const urls = [
    fields.coverImageUrl,
    ...(fields.galleryUrls ?? []),
    ...(fields.documentUrls ?? []),
  ];
  for (const url of urls) {
    if (url !== undefined && !url.startsWith(uploadsPrefix)) {
      throw new BadRequestException(
        'Las fotos y documentos deben subirse desde este sitio.',
      );
    }
  }
}
