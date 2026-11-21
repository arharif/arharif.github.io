/** Preserve the optional published-library/auth service without allowing arbitrary connections. */
export function academicPolicy(configuredBackend) {
  let backend = "";
  try {
    const url = new URL(configuredBackend);
    if (url.protocol === "https:" && !url.username && !url.password && !url.hostname.includes("*"))
      backend = ` ${url.origin}`;
  } catch {
    // An absent or invalid optional integration keeps the local-only policy.
  }
  return `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'${backend}; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'`;
}
