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

    const data = resp.data;

    const results = data.organic_results?.map(r => ({
      title: r.title,
      url: r.link,
      snippet: r.snippet
    })) || [];

    let summary = null;
    if (data.answer_box?.answer) summary = data.answer_box.answer;
    else if (data.answer_box?.snippet) summary = data.answer_box.snippet;
    else if (data.answer_box?.snippet_highlighted_words?.length) {
      summary = data.answer_box.snippet_highlighted_words.join(', ');
    }

    // 提取相关搜索词
    const related = data.related_searches?.map(item => item.query) || [];

    res.json({ results, summary, related });

  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
