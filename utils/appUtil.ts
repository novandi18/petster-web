/**
 * Sanitize a dynamic segment so it cannot be used
 * for redirection to external sites.
 */
export function sanitizeId(id: string): string {
  // strip any protocol or slashes, allow only alphanumerics, dash, underscore
  const stripped = id.replace(/^[a-zA-Z]+:\/\//, "");
  return encodeURIComponent(stripped.replace(/[^0-9A-Za-z_-]/g, ""));
}
