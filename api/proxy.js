export default async function handler(req, res) {
         res.setHeader('Access-Control-Allow-Origin', '*');
         res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
         res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
         if (req.method === 'OPTIONS') return res.status(204).end();

         try {
             let bodyFromClient = {};
             if (req.method === 'POST') {
                 if (typeof req.body === 'string') {
                     try { bodyFromClient = JSON.parse(req.body || '{}'); } catch { bodyFromClient = {}; }
                 } else if (req.body && typeof req.body === 'object') {
                     bodyFromClient = req.body;
                 }
             }
             const { id, tid, tuser, api } = { ...req.query, ...bodyFromClient };

             console.log('Ontvangen parameters:', { id, tid, tuser, api });

             // Bepaal de upstream URL op basis van de route
             let upstreamUrl = 'https://api.haobo.org/api_get';
             if (req.url.includes('/api/proxy/start')) {
                 upstreamUrl = 'https://api.haobo.org/start';
             }

             if (!tid || !tuser || !api) {
                 console.log('Ontbrekende parameters:', { id, tid, tuser, api });
                 return res.status(400).json({ error: 'Missing required parameters: tid, tuser, api' });
             }
             if (upstreamUrl.includes('api_get') && !id) {
                 console.log('Ontbrekende Installatie-ID voor api_get');
                 return res.status(400).json({ error: 'Missing required parameter: id' });
             }

             console.log('Verzenden naar externe API:', { url: upstreamUrl, id, tid, tuser, api });

             const upstream = await fetch(upstreamUrl, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                     id: id ? String(id) : undefined,
                     tid: String(tid),
                     tuser: String(tuser),
                     api: String(api)
                 })
             });

             const text = await upstream.text();
             console.log('Antwoord van externe API:', text);
             return res.status(upstream.ok ? 200 : upstream.status).send(text);
         } catch (err) {
             console.error('Fout in proxy:', err);
             return res.status(500).send(`Error: ${err?.message || err}`);
         }
     }
