import { parse } from 'node:buffer';
import formidable from 'formidable';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(204).end();

    try {
        // Parseer multipart/form-data met formidable
        const form = formidable({ multiples: false });
        const [fields, files] = await form.parse(req);

        const { api, type, tid, tuser } = fields;
        const image = files.image?.[0];

        console.log('Ontvangen parameters:', { api: api?.[0], type: type?.[0], tid: tid?.[0], tuser: tuser?.[0], image: image?.originalFilename });

        if (!image || !api?.[0] || !type?.[0] || !tid?.[0] || !tuser?.[0]) {
            console.log('Ontbrekende parameters:', { api, type, tid, tuser, image });
            return res.status(400).json({ error: 'Missing required parameters: image, api, type, tid, tuser' });
        }

        const upstreamUrl = 'https://api.getcid.vip/get_ocr';

        // Maak FormData voor de upstream API
        const formData = new FormData();
        formData.append('image', new Blob([await image.toBuffer()], { type: image.mimetype }), image.originalFilename || 'image.jpg');
        formData.append('api', api[0]);
        formData.append('type', type[0]);
        formData.append('tid', tid[0]);
        formData.append('tuser', tuser[0]);

        console.log('Verzenden naar nieuwe API als form-data:', { url: upstreamUrl, data: { image: image.originalFilename, api: api[0], type: type[0], tid: tid[0], tuser: tuser[0] } });

        const upstream = await fetch(upstreamUrl, {
            method: 'POST',
            body: formData
        });

        const text = await upstream.text();
        console.log('Antwoord van nieuwe API:', text);
        return res.status(upstream.ok ? 200 : upstream.status).send(text);
    } catch (err) {
        console.error('Fout in proxy:', err);
        return res.status(500).send(`Error: ${err?.message || err}`);
    }
}

export const config = {
    api: {
        bodyParser: false // Schakel standaard bodyParser uit voor formidable
    }
};
