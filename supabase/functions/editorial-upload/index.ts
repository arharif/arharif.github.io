// Supabase Edge Function. The service credential is only used after PostgREST
// verifies the incoming bearer and the immutable owner/AAL2 predicate.
import { extensions, imageType, maxImageBytes } from "./imageType.ts";
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};
Deno.serve(async (request) => {
  const reply = (status: number, body?: unknown) =>
    new Response(body ? JSON.stringify(body) : null, {
      status,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  if (request.method === "OPTIONS") return reply(204);
  if (request.method !== "POST") return reply(405);
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return reply(401);
  const url = Deno.env.get("SUPABASE_URL")!;
  try {
    const auth = await fetch(url + "/rest/v1/rpc/can_publish_x1", {
      method: "POST",
      headers: {
        authorization,
        apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
        "Content-Type": "application/json",
      },
      body: "{}",
    });
    if (!auth.ok || (await auth.json()) !== true) return reply(403);
    if (Number(request.headers.get("Content-Length")) > maxImageBytes)
      return reply(413);
    const reader = request.body?.getReader();
    if (!reader) return reply(400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > maxImageBytes) {
        await reader.cancel();
        return reply(413);
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    const mime = imageType(bytes);
    if (!mime || mime !== request.headers.get("Content-Type"))
      return reply(415);
    const key = crypto.randomUUID() + "." + extensions[mime];
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stored = await fetch(url + "/storage/v1/object/x1-editorial/" + key, {
      method: "POST",
      headers: {
        authorization: "Bearer " + service,
        apikey: service,
        "Content-Type": mime,
      },
      body: bytes,
    });
    return stored.ok ? reply(201, { key }) : reply(502);
  } catch {
    return reply(503);
  }
});
