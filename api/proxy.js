const fetch = require('node-fetch');

module.exports = async (req, res) => {
  try {
    const { id, tid, tuser, api } = req.query;
    if (!id || !tid || !tuser || !api) {
      return res.status(400).send('Missing required parameters: id, tid, tuser, api');
    }

    const apiUrl = `https://api.haobo.org/api_get?id=${id}&tid=${tid}&tuser=${encodeURIComponent(tuser)}&api=${api}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.text();
    res.setHeader('Access-Control-Allow-Origin', '*'); // Enable CORS
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
};
