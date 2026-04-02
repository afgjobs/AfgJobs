export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed." }, 405);
    }

    const key = sanitizeKey(request.headers.get("X-File-Key"));
    const contentType = request.headers.get("X-File-Type") || "application/octet-stream";

    if (!key) {
      return json({ error: "Missing upload key." }, 400);
    }

    const body = await request.arrayBuffer();
    if (!body || body.byteLength === 0) {
      return json({ error: "Missing file body." }, 400);
    }

    await env.R2_BUCKET.put(key, body, {
      httpMetadata: {
        contentType
      }
    });

    const publicBaseUrl = String(env.PUBLIC_BUCKET_URL || "").replace(/\/+$/g, "");

    return json({
      ok: true,
      key,
      url: publicBaseUrl ? `${publicBaseUrl}/${key}` : ""
    });
  }
};

function sanitizeKey(value) {
  return String(value || "")
    .replace(/\\/g, "/")
    .replace(/^\/*/, "")
    .replace(/\.\.+/g, "")
    .trim();
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders()
    }
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-File-Key, X-File-Name, X-File-Type, X-Upload-Tags"
  };
}
