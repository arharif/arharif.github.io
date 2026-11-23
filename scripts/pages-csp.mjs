// GitHub Pages supports document-level CSP through a meta tag. Hash the
// finished inline bootstrap and structured data separately for each HTML file.
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { loadEnv } from 'vite';
const env = loadEnv('production', process.cwd(), 'VITE_');
const service = env.VITE_SUPABASE_URL ? new URL(env.VITE_SUPABASE_URL).origin : '';
for (const path of await readdir('dist', {recursive:true})) {
  if (!path.endsWith('.html')) continue;
  const file = 'dist/' + path;
  const html = await readFile(file,'utf8');
  const hashes = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(([,attrs]) => !/\bsrc\s*=/.test(attrs))
    .map(([, ,code]) => "'sha256-" + createHash('sha256').update(code).digest('base64') + "'");
  const policy = [
    "default-src 'self'", "base-uri 'none'", "object-src 'none'", "form-action 'self' mailto:",
    "script-src 'self' " + hashes.join(' '), "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https: data: blob:", "font-src 'self'", "frame-src https:",
    "worker-src 'self' blob:", "connect-src 'self' " + service,
  ].join('; ');
  await writeFile(file, html.replace(/<head>/i, '<head>\n    <meta http-equiv="Content-Security-Policy" content="' + policy + '">'));
}
