const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/', async (req, res) => {
  const { messages } = req.body;
  const lastUserMessage = messages?.filter(m => m.role === 'user').pop()?.content || '';
  try {
    const response = await axios.post('http://localhost:5001/bing_chat', {
      message: lastUserMessage,
      thread_id: "demo"
    });

    res.json({
      reply: response.data.reply,
      related: response.data.related
    });
  } catch (error) {
    console.error('Error in chat route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
