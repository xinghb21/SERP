const express = require('express');
const router = express.Router();
const TASK_POOL = require('../data/taskPool');

const TASK_TYPES = Object.keys(TASK_POOL);

function generateLatinSquare(n) {
  const square = [];
  for (let i = 0; i < n; i++) {
    const row = [];
    for (let j = 0; j < n; j++) {
      row.push((i + j) % n);
    }
    square.push(row);
  }
  return square;
}

const latinSquare = generateLatinSquare(16);

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

router.get('/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }
  
  const sequence = latinSquare[userId].map((typeIndex, i) => {
    const taskType = TASK_TYPES[typeIndex];
    const taskContent = getRandomItem(TASK_POOL[taskType]);
    return {
      index: i + 1,
      type: taskType,
      task: taskContent,
      platform: (i + 1) % 2 === 1 ? 'Bing' : 'Bing Chat',
      startTime: 0,
    };
  });

  res.json(sequence);
});

module.exports = router;
