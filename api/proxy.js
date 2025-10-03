// ESM + native fetch (Node 18+ op Vercel)
export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    // Body-parsing (alleen nodig bij @vercel/node; Next.js API zou dit voor je doen)
    let body = {};
    if (req.method === "POST") {
      // Als Vercel het al geparsed heeft, is req.body een object; anders string
      if (typeof req.body === "string") {
        try {
          body = JSON.parse(req.body || "{}");
        } catch {
          // niet-JSON body: laten we het leeg laten
          body = {};
        }
      } else if (req.body && typeof req.body === "object") {
        body = req.body;
      }
    }

    // Params uit query OF body
    const { id, tid, tuser, api } = {
      ...req.query,
      ...body
    };

    if (!id || !tid || !tuser || !api) {
      return res
        .status(400)
        .json({ error: "Missing required parameters: id, tid, tuser, api" });
    }

    // Upstream POST (vereist door haobo API)
    const upstream = await fetch("https://api.haobo.org/api_get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, tid, tuser, api })
    });

    const text = await upstream.text();

    // Handig voor debuggen: geef status door
    return res.status(upstream.ok ? 200 : upstream.status).send(text);
  } catch (err) {
    return res.status(500).send(`Error: ${err?.message || err}`);
  }
}
