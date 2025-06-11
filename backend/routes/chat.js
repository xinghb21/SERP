const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { messages } = req.body;
  const lastUserMessage = messages?.filter(m => m.role === 'user').pop()?.content || '';

  const reply = `AI 回复：这是对 “${lastUserMessage}” 的回答（模拟）。`;
  const related = ['你可以问它定义', '深入了解原理', '实际应用场景'];

  res.json({
    reply,
    related
  });
});

module.exports = router;
