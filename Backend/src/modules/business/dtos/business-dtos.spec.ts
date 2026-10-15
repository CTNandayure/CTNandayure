import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateBusinessRequestDto } from './create-business-request.dto';
import { UpdateBusinessDto } from './update-business.dto';

// Same options the app's global ValidationPipe uses (see AppModule).
async function check<T extends object>(cls: new () => T, payload: object) {
  const instance = plainToInstance(cls, payload, {
    enableImplicitConversion: true,
  });
  const errors = await validate(instance, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  return { instance, failing: errors.map((e) => e.property) };
}

const photo = (n: number) =>
  `http://localhost:3000/uploads/businesses/business-170000000000${n}-1234.jpg`;
const doc =
  'http://localhost:3000/uploads/businesses/business-1700000000009-1234.pdf';

describe('UpdateBusinessDto', () => {
  it('accepts photos and documents the app stored', async () => {
    const { failing } = await check(UpdateBusinessDto, {
      coverImageUrl: photo(1),
      galleryUrls: [photo(2), photo(3), photo(4)],
      documentUrls: [doc],
    });
    expect(failing).toEqual([]);
  });

  it('rejects a photo field that points to a document, a script or another path', async () => {
    expect(
      (await check(UpdateBusinessDto, { coverImageUrl: doc })).failing,
    ).toEqual(['coverImageUrl']);
    expect(
      (await check(UpdateBusinessDto, { coverImageUrl: 'javascript:alert(1)' }))
        .failing,
    ).toEqual(['coverImageUrl']);
    expect(
      (
        await check(UpdateBusinessDto, {
          galleryUrls: [
            photo(2),
            photo(3),
            'http://localhost:3000/other/x.jpg',
          ],
        })
      ).failing,
    ).toEqual(['galleryUrls']);
    expect(
      (
        await check(UpdateBusinessDto, {
          galleryUrls: [photo(2), photo(3), doc],
        })
      ).failing,
    ).toEqual(['galleryUrls']);
  });

  it('rejects documents that are not stored files', async () => {
    expect(
      (
        await check(UpdateBusinessDto, {
          documentUrls: ['javascript:alert(1)'],
        })
      ).failing,
    ).toEqual(['documentUrls']);
    expect(
      (
        await check(UpdateBusinessDto, {
          documentUrls: [123 as unknown as string],
        })
      ).failing,
    ).toEqual(['documentUrls']);
  });

  it('keeps the gallery and document size limits', async () => {
    expect(
      (await check(UpdateBusinessDto, { galleryUrls: [photo(2), photo(3)] }))
        .failing,
    ).toEqual(['galleryUrls']);
    expect(
      (await check(UpdateBusinessDto, { documentUrls: [] })).failing,
    ).toEqual(['documentUrls']);
  });

  it('turns a cleared social link into null so it is removed', async () => {
    const { instance, failing } = await check(UpdateBusinessDto, {
      facebookUrl: '   ',
      instagramUrl: '',
    });
    expect(failing).toEqual([]);
    expect(instance.facebookUrl).toBeNull();
    expect(instance.instagramUrl).toBeNull();
  });

  it('accepts null and https links, trimmed', async () => {
    const cleared = await check(UpdateBusinessDto, { facebookUrl: null });
    expect(cleared.failing).toEqual([]);
    const link = await check(UpdateBusinessDto, {
      facebookUrl: '  https://facebook.com/surfcamp ',
    });
    expect(link.failing).toEqual([]);
    expect(link.instance.facebookUrl).toBe('https://facebook.com/surfcamp');
  });

  it('rejects social links that are not http(s) URLs with a protocol', async () => {
    for (const value of [
      'facebook.com/surfcamp',
      'ftp://facebook.com/x',
      'javascript:alert(1)',
      'not a url',
    ]) {
      expect(
        (await check(UpdateBusinessDto, { facebookUrl: value })).failing,
      ).toEqual(['facebookUrl']);
    }
  });

  it('refuses fields an owner must never set', async () => {
    for (const field of ['businessStatus', 'userId', 'requestId', 'id']) {
      expect(
        (await check(UpdateBusinessDto, { [field]: 'x' })).failing,
      ).toEqual([field]);
    }
  });
});

describe('CreateBusinessRequestDto', () => {
  const valid = {
    businessName: 'Surf Camp Coyote',
    categories: ['TOURS'],
    district: 'BEJUCO',
    description: 'Escuela de surf frente al mar con instructores certificados.',
    phone: '8888-1111',
    email: 'info@surfcamp.example',
    address: '300 metros al norte de la escuela de Bejuco',
    scheduleText: 'Lunes a domingo, 8:00 a.m. a 5:00 p.m.',
    coverImageUrl: photo(1),
    galleryUrls: [photo(2), photo(3), photo(4)],
    documentUrls: [doc],
    applicantName: 'Carla',
    applicantFirstLastname: 'Prueba',
    applicantSecondLastname: 'Dormida',
    applicantPhone: '8888-0000',
    applicantEmail: 'carla@example.com',
  };

  it('accepts a complete request', async () => {
    expect((await check(CreateBusinessRequestDto, valid)).failing).toEqual([]);
  });

  it('rejects stored-file fields that are not files the app stored', async () => {
    expect(
      (
        await check(CreateBusinessRequestDto, {
          ...valid,
          coverImageUrl: 'https://evil.example/x',
        })
      ).failing,
    ).toEqual(['coverImageUrl']);
    expect(
      (
        await check(CreateBusinessRequestDto, {
          ...valid,
          documentUrls: ['javascript:alert(1)'],
        })
      ).failing,
    ).toEqual(['documentUrls']);
    expect(
      (
        await check(CreateBusinessRequestDto, {
          ...valid,
          galleryUrls: [photo(2), photo(3), doc],
        })
      ).failing,
    ).toEqual(['galleryUrls']);
  });

  it('lets the applicant leave the social links empty', async () => {
    const { instance, failing } = await check(CreateBusinessRequestDto, {
      ...valid,
      facebookUrl: '',
      instagramUrl: '',
    });
    expect(failing).toEqual([]);
    expect(instance.facebookUrl).toBeNull();
  });
});
