// Read-only production preflight using the same public settings as Pages.
const { VITE_SUPABASE_URL: url, VITE_SUPABASE_ANON_KEY: key } = process.env;
if (!url || !key) throw new Error('Pages public Supabase configuration is incomplete.');
const origin = new URL(url);
if (origin.protocol !== 'https:') throw new Error('An HTTPS Supabase project is required.');
const headers = { apikey:key, 'Content-Type':'application/json' };
if (!key.startsWith('sb_publishable_')) headers.Authorization = 'Bearer '+key;
const failed = [];
for (const rpc of ['is_x1_owner','can_publish_x1']) {
  const response = await fetch(new URL('/rest/v1/rpc/'+rpc,origin), {method:'POST',headers,body:'{}',signal:AbortSignal.timeout(12000)});
  const ok = response.ok && await response.json() === false;
  console.log(rpc+' anonymous authorization check returned HTTP '+response.status+' and '+(ok?'passed':'failed'));
  if (!ok) failed.push(rpc);
}
const fields = await fetch(new URL('/rest/v1/content?select=id,reading_minutes,tags&status=eq.published&limit=0',origin),{headers,signal:AbortSignal.timeout(12000)});
console.log('Published article projection returned HTTP '+fields.status);
if (!fields.ok) failed.push('article schema');
const fn = await fetch(new URL('/functions/v1/editorial-upload',origin),{method:'OPTIONS',headers:{Origin:'https://arharif.github.io','Access-Control-Request-Method':'POST'},signal:AbortSignal.timeout(12000)});
console.log('Editorial upload preflight returned HTTP '+fn.status);
if (!fn.ok) failed.push('editorial-upload');
if (failed.length) throw new Error('Production prerequisites still pending: '+failed.join(', '));
