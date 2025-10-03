export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    let bodyFromClient = {};
    if (req.method === "POST") {
      if (typeof req.body === "string") {
        try { bodyFromClient = JSON.parse(req.body || "{}"); } catch { bodyFromClient = {}; }
      } else if (req.body && typeof req.body === "object") {
        bodyFromClient = req.body;
      }
    }
    const { id, tid, tuser, api } = { ...req.query, ...bodyFromClient };

    if (!id || !tid || !tuser || !api) {
      return res.status(400).json({ error: "Missing required parameters: id, tid, tuser, api" });
    }

    // Log de parameters om te debuggen
    console.log("Verzonden naar externe API:", { id, tid, tuser, api });

    const upstream = await fetch("https://api.haobo.org/api_get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: String(id),
        tid: String(tid),
        tuser: String(tuser),
        api: String(api)
      })
    });

    const text = await upstream.text();
    console.log("Antwoord van externe API:", text); // Log het antwoord
    return res.status(upstream.ok ? 200 : upstream.status).send(text);
  } catch (err) {
    console.error("Fout in proxy:", err);
    return res.status(500).send(`Error: ${err?.message || err}`);
  }
}
