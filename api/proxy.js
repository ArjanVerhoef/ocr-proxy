const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

app.get('/proxy', async (req, res) => {
  try {
    const { id, tid, tuser, api } = req.query;
    const apiUrl = `https://api.haobo.org/api_get?id=${id}&tid=${tid}&tuser=${encodeURIComponent(tuser)}&api=${api}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.text();
    res.set('Access-Control-Allow-Origin', '*'); // Voor CORS
    res.send(data);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

module.exports = app; // Voor Vercel serverless
