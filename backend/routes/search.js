const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
  const { query, page } = req.body; // 添加分页参数
  if (!query) return res.status(400).json({ error: 'Missing query' });

  try {
    const params = {
      q: query,
      engine: 'bing',
      cc: 'CN',
      api_key: process.env.SERPAPI_KEY,
      count: 50
    };

    const resp = await axios.get('https://serpapi.com/search.json', { params });

    const data = resp.data;
    console.log('Full Bing response:', data); // 调试时使用

    // 1. 自然结果
    const results = data.organic_results?.map(r => ({
      title: r.title,
      url: r.link,
      displayLink: r.displayed_link || new URL(r.link).hostname.replace('www.', ''),
      thumbnail: r.thumbnail || null,
      snippet: r.snippet,
      date: r.date
    })) || [];

    // 2. 广告结果
    const ads = data.ads?.map(ad => ({
      title: ad.title,
      url: ad.link,
      displayLink: ad.displayed_link || new URL(ad.link).hostname.replace('www.', ''),
      snippet: ad.snippet,
      position: ad.position
    })) || [];

    // 3. 知识卡片/答案框
    let knowledgeCard = null;
    if (data.knowledge_graph) {
      knowledgeCard = {
        title: data.knowledge_graph.title,
        description: data.knowledge_graph.description,
        url: data.knowledge_graph.source?.link,
        image: data.knowledge_graph.image,
        attributes: data.knowledge_graph.attributes
      };
    } else if (data.answer_box) {
      knowledgeCard = {
        type: 'answer_box',
        answer: data.answer_box.answer || data.answer_box.snippet
      };
    }

    // 4. 相关问题
    const relatedQuestions = data.related_questions?.map(q => ({
      question: q.question,
      snippet: q.snippet,
      url: q.link
    })) || [];

    // 5. 相关搜索
    const relatedSearches = data.related_searches?.map(item => item.query) || [];

    // 6. 分页信息
    const pagination = {
      currentPage: page,
      totalResults: data.search_information?.total_results || 0,
      nextPage: data.serpapi_pagination?.next || null
    };

    res.json({
      results,
      ads,
      knowledgeCard,
      relatedQuestions,
      relatedSearches,
      pagination
    });

  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;