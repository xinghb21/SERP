const express = require('express');
const axios = require('axios');
const router = express.Router();

// router.post('/', async (req, res) => {
//   const { query } = req.body;
//   if (!query) return res.status(400).json({ error: 'Missing query' });

//   try {
//     const resp = await axios.get('https://serpapi.com/search.json', {
//       params: {
//         q: query,
//         engine: 'bing',
//         api_key: process.env.SERPAPI_KEY
//       }
//     });

//     const data = resp.data;

//     const results = data.organic_results?.map(r => ({
//       title: r.title,
//       url: r.link,
//       snippet: r.snippet
//     })) || [];

//     let summary = null;
//     if (data.answer_box?.answer) summary = data.answer_box.answer;
//     else if (data.answer_box?.snippet) summary = data.answer_box.snippet;
//     else if (data.answer_box?.snippet_highlighted_words?.length) {
//       summary = data.answer_box.snippet_highlighted_words.join(', ');
//     }

//     const related = data.related_searches?.map(item => item.query) || [];

//     res.json({ results, summary, related });

//   } catch (err) {
//     console.error('Search error:', err.message);
//     res.status(500).json({ error: 'Search failed' });
//   }
// });

router.post('/', (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  // 模拟结果数据
  const results = [
    {
      title: `关于 "${query}" 的第一个结果`,
      url: 'https://example.com/1',
      snippet: `这是关于 "${query}" 的简要介绍内容，帮助你了解背景信息。`
    },
    {
      title: `深入探讨 "${query}" 的第二个资源`,
      url: 'https://example.com/2',
      snippet: `该页面提供了与 "${query}" 相关的详细说明和示例。`
    },
    {
      title: `"${query}" 的常见应用`,
      url: 'https://example.com/3',
      snippet: `探索 "${query}" 在现实生活中的常见用途与影响。`
    }
  ];

  // 模拟 AI 摘要
  const summary = `"${query}" 是一个被广泛研究和应用的概念，其影响遍及多个领域。`;

  // 模拟相关搜索词
  const related = [
    `什么是 ${query}`,
    `${query} 的应用场景`,
    `${query} 和 AI 的关系`,
    `${query} 的未来发展趋势`
  ];

  res.json({ results, summary, related });
});

module.exports = router;
