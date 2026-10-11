import { BadRequestException } from '@nestjs/common';
import { assertUploadedFromThisSite } from './uploaded-urls';

const req = (host = 'localhost:3000', protocol = 'http') => ({
  protocol,
  get: (name: string) => (name.toLowerCase() === 'host' ? host : undefined),
});
const own = (file: string) =>
  `http://localhost:3000/uploads/businesses/${file}`;

describe('assertUploadedFromThisSite', () => {
  it('accepts files stored on this server', () => {
    expect(() =>
      assertUploadedFromThisSite(
        {
          coverImageUrl: own('business-1-1.png'),
          galleryUrls: [own('business-1-2.png'), own('business-1-3.png')],
          documentUrls: [own('business-1-4.pdf')],
        },
        req() as never,
      ),
    ).not.toThrow();
  });

  it('accepts a partial update that sends none of the file fields', () => {
    expect(() => assertUploadedFromThisSite({}, req() as never)).not.toThrow();
  });

  it('rejects a file hosted somewhere else, in any field', () => {
    const elsewhere =
      'https://evil.example/uploads/businesses/business-1-1.png';
    expect(() =>
      assertUploadedFromThisSite({ coverImageUrl: elsewhere }, req() as never),
    ).toThrow(BadRequestException);
    expect(() =>
      assertUploadedFromThisSite(
        { galleryUrls: [own('business-1-2.png'), elsewhere] },
        req() as never,
      ),
    ).toThrow(BadRequestException);
    expect(() =>
      assertUploadedFromThisSite({ documentUrls: [elsewhere] }, req() as never),
    ).toThrow(BadRequestException);
  });

  it('does not take another port, host or scheme for this server', () => {
    expect(() =>
      assertUploadedFromThisSite(
        { coverImageUrl: own('business-1-1.png') },
        req('localhost:4000') as never,
      ),
    ).toThrow(BadRequestException);
    expect(() =>
      assertUploadedFromThisSite(
        { coverImageUrl: own('business-1-1.png') },
        req('localhost:3000', 'https') as never,
      ),
    ).toThrow(BadRequestException);
    expect(() =>
      assertUploadedFromThisSite(
        { coverImageUrl: 'http://localhost:3000.evil.example/uploads/a.png' },
        req() as never,
      ),
    ).toThrow(BadRequestException);
  });
});
