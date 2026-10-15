import { registerDecorator, ValidationOptions } from 'class-validator';

// The only URLs the business forms may store for photos and documents: files this
// app saved itself (POST /businesses/upload, POST /uploads/image), i.e.
// <origin>/uploads/[<folder>/]<name>.<ext>. Anything else (another site, javascript:,
// data:, "..", user@host tricks) is rejected, so a crafted request can't plant it in
// pages that render these values as <img src> or <a href>.
const UPLOADED_FILE_URL =
  /^https?:\/\/[A-Za-z0-9.-]+(?::\d{1,5})?\/uploads\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.([A-Za-z0-9]{1,5})$/;
const MAX_URL_LENGTH = 500;

export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'jfif', 'png', 'webp', 'gif'];
// Documents are PDF/DOCX, but older submissions may carry a scanned permit as a photo.
export const DOCUMENT_EXTENSIONS = ['pdf', 'docx', ...IMAGE_EXTENSIONS];

export function isUploadedFileUrl(
  value: unknown,
  allowedExtensions: readonly string[],
): boolean {
  if (typeof value !== 'string' || value.length > MAX_URL_LENGTH) return false;
  const match = UPLOADED_FILE_URL.exec(value);
  return match !== null && allowedExtensions.includes(match[1].toLowerCase());
}

function uploadedFileUrlDecorator(
  name: string,
  allowedExtensions: readonly string[],
  defaultMessage: string,
) {
  return (validationOptions?: ValidationOptions) =>
    (object: object, propertyName: string) =>
      registerDecorator({
        name,
        target: object.constructor,
        propertyName,
        options: validationOptions,
        validator: {
          validate: (value: unknown) =>
            isUploadedFileUrl(value, allowedExtensions),
          defaultMessage: () => defaultMessage,
        },
      });
}

// Works on arrays too: pass { each: true }.
export const IsUploadedImageUrl = uploadedFileUrlDecorator(
  'isUploadedImageUrl',
  IMAGE_EXTENSIONS,
  'Debe ser una imagen subida desde el sitio',
);

export const IsUploadedDocumentUrl = uploadedFileUrlDecorator(
  'isUploadedDocumentUrl',
  DOCUMENT_EXTENSIONS,
  'Debe ser un archivo PDF, DOCX o imagen subido desde el sitio',
);
