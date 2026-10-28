import sanitizeHtml from 'sanitize-html';

// Matches exactly what the admin's rich text editor can produce: bold, links,
// and bullet/ordered lists. Enforced again here (not just client-side) so a
// request that bypasses the editor can't store arbitrary HTML — relevant right
// now since AdminAuthGuard is still a placeholder that lets any request through.
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'br', 'strong', 'a', 'ul', 'ol', 'li'],
  allowedAttributes: { a: ['href', 'target', 'rel'] },
  allowedSchemes: ['http', 'https', 'mailto'],
};

export function sanitizeNewsContent(html: string): string {
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}
