import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { PrismaService } from '@/prisma/prisma.service';
import { UPLOADS_DIR } from '@/uploads/image-storage';

export const BUSINESS_UPLOADS_DIR = join(UPLOADS_DIR, 'businesses');

// Names written by POST /businesses/upload: business-<timestamp>-<random>.<ext>.
// Matching only this shape keeps cleanup away from every other file in /uploads
// (news and institutional images live there too).
const BUSINESS_FILE_NAME = /^business-\d+-\d+\.[A-Za-z0-9]{1,5}$/;
const BUSINESS_FILE_URL =
  /^https?:\/\/[^\s/?#]+\/uploads\/businesses\/([^/?#]+)$/;

export function businessFileNameFromUrl(url: unknown): string | null {
  if (typeof url !== 'string') return null;
  const name = BUSINESS_FILE_URL.exec(url)?.[1];
  return name && BUSINESS_FILE_NAME.test(name) ? name : null;
}

@Injectable()
export class BusinessFilesService {
  private readonly logger = new Logger(BusinessFilesService.name);
  protected directory = BUSINESS_UPLOADS_DIR;

  constructor(private readonly prisma: PrismaService) {}

  // Deletes the stored files behind these URLs unless a business or an affiliation
  // request still points at them. A file stays while any row references it: after a
  // request is approved both rows share the same files, and the request keeps them
  // as the record of what was submitted. Best effort: it never fails the caller, a
  // file that lingers is harmless.
  async removeUnreferenced(
    urls: ReadonlyArray<string | null | undefined>,
  ): Promise<void> {
    const candidates = new Set<string>();
    for (const url of urls) {
      const name = businessFileNameFromUrl(url);
      if (name) candidates.add(name);
    }
    if (candidates.size === 0) return;

    try {
      const referenced = await this.referencedFileNames();
      for (const name of candidates) {
        if (referenced.has(name)) continue;
        try {
          await fs.unlink(join(this.directory, name));
          this.logger.log(`Deleted unreferenced upload ${name}`);
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        }
      }
    } catch (error) {
      this.logger.warn(
        `Could not clean up business files: ${(error as Error).message}`,
      );
    }
  }

  private async referencedFileNames(): Promise<Set<string>> {
    const select = {
      coverImageUrl: true,
      galleryUrls: true,
      documentUrls: true,
    } as const;
    const [businesses, requests] = await Promise.all([
      this.prisma.business.findMany({ select }),
      this.prisma.businessRequest.findMany({ select }),
    ]);

    const names = new Set<string>();
    for (const row of [...businesses, ...requests]) {
      for (const url of [
        row.coverImageUrl,
        ...row.galleryUrls,
        ...row.documentUrls,
      ]) {
        const name = businessFileNameFromUrl(url);
        if (name) names.add(name);
      }
    }
    return names;
  }
}
