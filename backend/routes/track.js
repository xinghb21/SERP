const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const logFile = path.join(__dirname, 'trackLogs.json');

router.post('/', (req, res) => {
  const { user, task, events } = req.body;
  if (!events) return res.status(400).json({ error: 'Missing events' });

  const entry = {
    timestamp: new Date().toISOString(),
    user, task, events
  };

  let logs = [];
  if (fs.existsSync(logFile)) {
    logs = JSON.parse(fs.readFileSync(logFile));
  }
  logs.push(entry);
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));

  res.json({ status: 'ok' });
});

module.exports = router;
