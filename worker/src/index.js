const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
const MAX_SOURCE_BYTES = 1024 * 1024;
const ID_RE = /^[a-f0-9-]{36}$/i;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
function cors(response, origin) {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", origin || "*");
  headers.set("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type,X-Admin-Token");
  headers.set("Vary", "Origin");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
function authorized(request, env) {
  const expected = env.ADMIN_TOKEN;
  const supplied = request.headers.get("X-Admin-Token") || "";
  return typeof expected === "string" && expected.length >= 24 && supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
function timingSafeEqual(a, b) {
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function safeText(source) {
  return new Response(source, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Cache-Control": "public, max-age=60"
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "*";
    if (request.method === "OPTIONS") {
      return cors(new Response(null, { status: 204 }), origin);
    }

    if (url.pathname.startsWith("/api/") && !authorized(request, env) && request.method !== "GET") {
      return cors(json({ error: "Unauthorized" }, 401), origin);
    }

    if (url.pathname === "/api/scripts" && request.method === "POST") {
      let body;
      try { body = await request.json(); } catch { return cors(json({ error: "Invalid JSON" }, 400), origin); }
      const name = String(body.name || "Untitled Script").trim().slice(0, 64);
      const source = typeof body.source === "string" ? body.source : "";
      if (!source.trim()) return cors(json({ error: "Source is required" }, 400), origin);
      if (new TextEncoder().encode(source).byteLength > MAX_SOURCE_BYTES) return cors(json({ error: "Source exceeds 1 MB" }, 413), origin);
      const id = crypto.randomUUID();
      await env.DB.prepare("INSERT INTO scripts (id, name, source, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)").bind(id, name || "Untitled Script", source).run();
      return cors(json({ id, url: url.origin + "/s/" + id }), origin);
    }

    if (url.pathname === "/api/scripts" && request.method === "GET") {
      if (!authorized(request, env)) return cors(json({ error: "Unauthorized" }, 401), origin);
      const { results } = await env.DB.prepare("SELECT id, name, created_at, updated_at FROM scripts ORDER BY updated_at DESC LIMIT 100").all();
      return cors(json({ scripts: results || [] }), origin);
    }

    const apiMatch = url.pathname.match(/^\/api\/scripts\/([^/]+)$/);
    if (apiMatch && request.method === "DELETE") {
      if (!ID_RE.test(apiMatch[1])) return cors(json({ error: "Not found" }, 404), origin);
      const result = await env.DB.prepare("DELETE FROM scripts WHERE id = ?").bind(apiMatch[1]).run();
      return cors(json({ deleted: (result.meta?.changes || 0) > 0 }), origin);
    }

    const publicMatch = url.pathname.match(/^\/s\/([^/]+)$/);
    if (publicMatch && request.method === "GET") {
      if (!ID_RE.test(publicMatch[1])) return new Response("Not found", { status: 404 });
      const row = await env.DB.prepare("SELECT source FROM scripts WHERE id = ?").bind(publicMatch[1]).first();
      return row ? safeText(row.source) : new Response("Not found", { status: 404 });
    }

    return cors(json({ error: "Not found" }, 404), origin);
  }
};