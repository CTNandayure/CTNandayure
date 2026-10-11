import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  BusinessFilesService,
  businessFileNameFromUrl,
} from './business-files.service';

// The real PrismaService loads the generated client, whose ESM-style imports jest
// can't resolve. The service is built by hand below with a fake, so a stub class is
// all the decorator metadata needs.
jest.mock('@/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

const url = (name: string) =>
  `http://localhost:3000/uploads/businesses/${name}`;

interface Row {
  coverImageUrl: string;
  galleryUrls: string[];
  documentUrls: string[];
}
const row = (
  cover: string,
  gallery: string[] = [],
  documents: string[] = [],
): Row => ({
  coverImageUrl: cover,
  galleryUrls: gallery,
  documentUrls: documents,
});

describe('businessFileNameFromUrl', () => {
  it('returns the stored name of an upload from the business endpoint', () => {
    expect(
      businessFileNameFromUrl(url('business-1791753844830-786931852.png')),
    ).toBe('business-1791753844830-786931852.png');
  });

  it('ignores everything else so cleanup never reaches other files', () => {
    expect(
      businessFileNameFromUrl(
        'http://localhost:3000/uploads/e2090ee8-bc81-4b0c-a0ad-da37200247fa.jpg',
      ),
    ).toBeNull();
    expect(businessFileNameFromUrl(url('logo.png'))).toBeNull();
    expect(businessFileNameFromUrl(url('../business-1-1.png'))).toBeNull();
    expect(
      businessFileNameFromUrl(
        'http://localhost:3000/uploads/businesses/sub/business-1-1.png',
      ),
    ).toBeNull();
    expect(businessFileNameFromUrl('javascript:alert(1)')).toBeNull();
    expect(businessFileNameFromUrl(undefined)).toBeNull();
    expect(businessFileNameFromUrl(null)).toBeNull();
  });
});

describe('BusinessFilesService.removeUnreferenced', () => {
  let dir: string;
  let businesses: Row[];
  let requests: Row[];
  let service: BusinessFilesService;
  const findMany = (rows: () => Row[]) => jest.fn(async () => rows());

  const exists = async (name: string) =>
    fs.access(join(dir, name)).then(
      () => true,
      () => false,
    );

  beforeEach(async () => {
    dir = await fs.mkdtemp(join(tmpdir(), 'business-files-'));
    businesses = [];
    requests = [];
    const prisma = {
      business: { findMany: findMany(() => businesses) },
      businessRequest: { findMany: findMany(() => requests) },
    };
    service = new BusinessFilesService(prisma as never);
    (service as unknown as { directory: string }).directory = dir;
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  const make = (...names: string[]) =>
    Promise.all(names.map((n) => fs.writeFile(join(dir, n), 'x')));

  it('deletes a file nothing points to any more', async () => {
    await make('business-1-1.png');
    await service.removeUnreferenced([url('business-1-1.png')]);
    expect(await exists('business-1-1.png')).toBe(false);
  });

  it('keeps a file a business still uses, as cover, gallery or document', async () => {
    await make('business-1-1.png', 'business-1-2.png', 'business-1-3.pdf');
    businesses = [
      row(
        url('business-1-1.png'),
        [url('business-1-2.png')],
        [url('business-1-3.pdf')],
      ),
    ];
    await service.removeUnreferenced([
      url('business-1-1.png'),
      url('business-1-2.png'),
      url('business-1-3.pdf'),
    ]);
    expect(await exists('business-1-1.png')).toBe(true);
    expect(await exists('business-1-2.png')).toBe(true);
    expect(await exists('business-1-3.pdf')).toBe(true);
  });

  it('keeps the files an affiliation request still records, even after approval', async () => {
    await make('business-1-1.png', 'business-1-9.pdf');
    requests = [row(url('business-1-1.png'), [], [url('business-1-9.pdf')])];
    await service.removeUnreferenced([
      url('business-1-1.png'),
      url('business-1-9.pdf'),
    ]);
    expect(await exists('business-1-1.png')).toBe(true);
    expect(await exists('business-1-9.pdf')).toBe(true);
  });

  it('deletes only the unreferenced ones when the list is mixed', async () => {
    await make('business-1-1.png', 'business-1-2.png');
    businesses = [row(url('business-1-1.png'))];
    await service.removeUnreferenced([
      url('business-1-1.png'),
      url('business-1-2.png'),
    ]);
    expect(await exists('business-1-1.png')).toBe(true);
    expect(await exists('business-1-2.png')).toBe(false);
  });

  it('never touches files that are not business uploads', async () => {
    await make('logo.png', 'business-1-1.png');
    await service.removeUnreferenced([
      url('logo.png'),
      'http://localhost:3000/uploads/logo.png',
      url('../logo.png'),
    ]);
    expect(await exists('logo.png')).toBe(true);
    expect(await exists('business-1-1.png')).toBe(true);
  });

  it('does not fail when the file is already gone', async () => {
    await expect(
      service.removeUnreferenced([url('business-9-9.png')]),
    ).resolves.toBeUndefined();
  });

  it('does not query anything when there is nothing to clean up', async () => {
    const prisma = {
      business: { findMany: jest.fn() },
      businessRequest: { findMany: jest.fn() },
    };
    const idle = new BusinessFilesService(prisma as never);
    await idle.removeUnreferenced([
      undefined,
      null,
      'https://evil.example/a.png',
    ]);
    expect(prisma.business.findMany).not.toHaveBeenCalled();
  });

  it('swallows database errors: a leftover file must not fail the update', async () => {
    await make('business-1-1.png');
    const broken = {
      business: { findMany: jest.fn().mockRejectedValue(new Error('db down')) },
      businessRequest: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const failing = new BusinessFilesService(broken as never);
    (failing as unknown as { directory: string }).directory = dir;
    await expect(
      failing.removeUnreferenced([url('business-1-1.png')]),
    ).resolves.toBeUndefined();
    expect(await exists('business-1-1.png')).toBe(true);
  });
});
