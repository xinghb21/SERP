const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  try {
    const resp = await axios.get('https://serpapi.com/search.json', {
      params: {
        q: query,
        engine: 'bing',
        api_key: process.env.SERPAPI_KEY
      }
    });

    const results = resp.data.organic_results?.map(r => ({
      title: r.title,
      url: r.link,
      snippet: r.snippet
    })) || [];

    res.json({ results });
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
