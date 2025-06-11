const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.post('/', (req, res) => {
  const { user, platform, task, events } = req.body;

  if (!user || !platform || !task || !events) {
    return res.status(400).json({ error: 'Missing fields in request body' });
  }

  // 构建路径：exp/platform/task/username/data.json
  const logDir = path.join(__dirname, '..', '..', 'exp', platform, task, user);
  const logFile = path.join(logDir, 'data.json');

  fs.mkdirSync(logDir, { recursive: true });

  let existingEvents = [];

  if (fs.existsSync(logFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(logFile, 'utf-8'));
      if (Array.isArray(data.events)) {
        existingEvents = data.events;
      }
    } catch (err) {
      console.error('Error reading existing log:', err);
    }
  }

  const mergedEvents = [...existingEvents, ...events];

  const output = {
    timestamp: new Date().toISOString(),
    events: mergedEvents
  };

  fs.writeFileSync(logFile, JSON.stringify(output, null, 2), 'utf-8');

  res.json({ status: 'ok' });
});

module.exports = router;
