// Small AI proxy for the GCC Atlas prototype. It keeps your API key on the server.
// It accepts only two task types and short prompts, and only from the origins you allow.
const MAX = 6000;

export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean);
    const ok = allowed.length === 0 || allowed.includes(origin);
    const cors = {
      "Access-Control-Allow-Origin": ok && origin ? origin : (allowed[0] || "*"),
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    };
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (req.method !== "POST") return json({ error: "POST only" }, 405, cors);
    if (!ok) return json({ error: "Origin not allowed" }, 403, cors);
    if (!env.ANTHROPIC_API_KEY) return json({ error: "Server is missing its API key" }, 500, cors);

    let body;
    try { body = await req.json(); } catch { return json({ error: "Bad JSON" }, 400, cors); }
    if (typeof body.prompt !== "string" || !body.prompt.trim() || body.prompt.length > MAX)
      return json({ error: "Prompt missing or too long" }, 400, cors);

    const task = body.task === "json" ? "json" : "text";
    const system = task === "json"
      ? "You return only valid JSON with no commentary and no code fences."
      : "You write concise, factual briefs. Use only the facts provided and say where confidence is low.";

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: env.MODEL || "claude-sonnet-5-5",
        max_tokens: 800,
        system,
        messages: [{ role: "user", content: body.prompt }],
      }),
    });
    if (!r.ok) return json({ error: "AI provider error " + r.status }, 502, cors);
    const data = await r.json();
    const text = (data.content || []).map(c => c.text || "").join("");
    return json({ text }, 200, cors);
  },
};

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), { status, headers: { ...headers, "content-type": "application/json" } });
}
