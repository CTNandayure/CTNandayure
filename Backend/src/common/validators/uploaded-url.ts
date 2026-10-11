// The only file URLs we accept from clients are the ones this API hands out from
// its upload endpoints: `<origin>/uploads/<optional folders>/<file>.<ext>`.
// Rejecting arbitrary URLs keeps remote (tracking / hot-linked) content out of the
// public pages, and the strict segments reject `..` path tricks.
export const UPLOADED_FILE_URL_PATTERN =
  /^https?:\/\/[^\s/]+\/uploads\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.[A-Za-z0-9]{1,5}$/;

export const UPLOADED_FILE_URL_MESSAGE = 'La imagen debe haberse subido desde el sistema';
