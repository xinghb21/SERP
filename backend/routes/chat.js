const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/', async (req, res) => {
  const { messages } = req.body;
  const lastUserMessage = messages?.filter(m => m.role === 'user').pop()?.content || '';
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const response = await axios.post('http://localhost:5001/bing_chat', {
      message: lastUserMessage,
      thread_id: "demo"
    }, {
      responseType: 'stream'
    });

    // res.json({
    //   reply: response.data.reply,
    //   related: response.data.related
    // });
    let reply = '';
    let related = [];

    // 监听流式数据
    response.data.on('data', (chunk) => {
      // 将流的数据转成字符串
      const chunkString = chunk.toString();
      
      // 过滤掉 'data: ' 部分，提取 JSON 数据
      const jsonString = chunkString.replace(/^data: /, '');

      const data = JSON.parse(jsonString.toString());
      if (data.reply) {
        reply += data.reply;  // 拼接流式数据
        res.write(`data: ${JSON.stringify({reply: data.reply, related: []})}\n\n`);
      }
      if (data.related) {
        related = data.related;  // 获取 related 数据
      }
    });

    response.data.on('end', () => {
      res.write(`data: ${JSON.stringify({reply: '', related})}\n\n`);
      res.end();
    });

    response.data.on('error', (error) => {
      console.error('Error in response stream:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
  } catch (error) {
    console.error('Error in chat route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
