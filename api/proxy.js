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

        const upstreamUrl = 'https://api.getcid.vip/api_get';

        if (!id || !tid || !tuser || !api) {
            console.log('Ontbrekende parameters:', { id, tid, tuser, api });
            return res.status(400).json({ error: 'Missing required parameters: id, tid, tuser, api' });
        }

        // Formateer data als form-data (application/x-www-form-urlencoded)
        const formData = new URLSearchParams();
        formData.append('id', String(id));
        formData.append('tid', String(tid));
        formData.append('tuser', String(tuser));
        formData.append('api', String(api)); // Gebruik de nieuwe werkende API-sleutel

        console.log('Verzenden naar nieuwe API als form-data:', { url: upstreamUrl, data: formData.toString() });

        const upstream = await fetch(upstreamUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
        });

        const text = await upstream.text();
        console.log('Antwoord van nieuwe API:', text);
        return res.status(upstream.ok ? 200 : upstream.status).send(text);
    } catch (err) {
        console.error('Fout in proxy:', err);
        return res.status(500).send(`Error: ${err?.message || err}`);
    }
}
