import {
  DOCUMENT_EXTENSIONS,
  IMAGE_EXTENSIONS,
  isUploadedFileUrl,
} from './uploaded-file-url';

const images = (value: unknown) => isUploadedFileUrl(value, IMAGE_EXTENSIONS);
const documents = (value: unknown) =>
  isUploadedFileUrl(value, DOCUMENT_EXTENSIONS);

describe('isUploadedFileUrl', () => {
  it('accepts the URLs the upload endpoints produce', () => {
    expect(
      images(
        'http://localhost:3000/uploads/businesses/business-1791753844830-786931852.png',
      ),
    ).toBe(true);
    expect(
      images(
        'https://api.camara.example/uploads/e2090ee8-bc81-4b0c-a0ad-da37200247fa.jpg',
      ),
    ).toBe(true);
    expect(
      images(
        'http://localhost:3000/uploads/ec3a6412-5d63-4592-a433-fcfcb51852e2.jfif',
      ),
    ).toBe(true);
    expect(
      images('http://localhost:3000/uploads/businesses/business-1-2.WEBP'),
    ).toBe(true);
    expect(
      documents('http://localhost:3000/uploads/businesses/business-1-2.pdf'),
    ).toBe(true);
    expect(
      documents('http://localhost:3000/uploads/businesses/business-1-2.docx'),
    ).toBe(true);
  });

  it('keeps documents out of the photo fields', () => {
    expect(
      images('http://localhost:3000/uploads/businesses/business-1-2.pdf'),
    ).toBe(false);
    expect(
      images('http://localhost:3000/uploads/businesses/business-1-2.docx'),
    ).toBe(false);
  });

  it('lets documents be scanned images, as older submissions have them', () => {
    expect(
      documents('http://localhost:3000/uploads/businesses/business-1-2.jpg'),
    ).toBe(true);
  });

  it('rejects types that can carry scripts or are not files we store', () => {
    for (const ext of ['html', 'htm', 'svg', 'js', 'exe', 'php', 'xml']) {
      expect(
        documents(
          `http://localhost:3000/uploads/businesses/business-1-2.${ext}`,
        ),
      ).toBe(false);
    }
  });

  it('rejects schemes other than http(s)', () => {
    expect(images('javascript:alert(1)')).toBe(false);
    expect(images('data:image/png;base64,iVBORw0KGgo=')).toBe(false);
    expect(images('ftp://localhost/uploads/a.png')).toBe(false);
    expect(images('file:///etc/passwd.png')).toBe(false);
  });

  it('rejects anything outside /uploads or with path tricks', () => {
    expect(images('http://localhost:3000/secrets/a.png')).toBe(false);
    expect(images('http://localhost:3000/uploads/../.env.png')).toBe(false);
    expect(images('http://localhost:3000/uploads/%2e%2e/a.png')).toBe(false);
    expect(images('http://localhost:3000/uploads/a.png?x=1')).toBe(false);
    expect(images('http://localhost:3000/uploads/a.png#frag')).toBe(false);
    expect(images('http://localhost:3000/uploads/')).toBe(false);
    expect(images('http://localhost:3000/uploads/.png')).toBe(false);
  });

  it('rejects a host that hides behind user info', () => {
    expect(images('http://localhost:3000@evil.example/uploads/a.png')).toBe(
      false,
    );
    expect(images('http://user:pass@evil.example/uploads/a.png')).toBe(false);
  });

  it('rejects values that are not strings or are too long', () => {
    for (const value of [undefined, null, 42, {}, [], true]) {
      expect(images(value)).toBe(false);
    }
    expect(images(`http://localhost:3000/uploads/${'a'.repeat(600)}.png`)).toBe(
      false,
    );
    expect(images('')).toBe(false);
    expect(images(' http://localhost:3000/uploads/a.png')).toBe(false);
  });
});
