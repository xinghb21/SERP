const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const router = express.Router();
let gazeProcess = null;

router.post('/start', (req, res) => {
  const username = req.body.username || 'anonymous';
  const platform = req.body.platform || 'unknown';
  const task = req.body.task || 'task1';

  if (gazeProcess) {
    return res.status(400).send('Gaze process already running');
  }

  // 构建路径：exp/platform/task/username/data.json
  const exePath = path.resolve(__dirname, '../eye_tracking.exe');
  const outputDir = path.resolve(__dirname, `../../exp/${platform}/${task}/${username}`);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  gazeProcess = spawn(exePath, [], {
    cwd: outputDir,
    detached: false,
    stdio: 'ignore'
  });

  gazeProcess.on('error', (err) => {
    console.error('eye_tracking.exe 启动失败:', err.message);
  });

  console.log(`Gaze tracking started for user "${username}"`);
  res.send('Gaze tracking started');
});

router.post('/stop', (req, res) => {
  if (gazeProcess && gazeProcess.exitCode === null) {
    console.log("正在终止 gaze 程序...");
    gazeProcess.on('exit', () => {
      console.log("gaze 程序已退出");
    });
    gazeProcess.kill();
    gazeProcess = null;
    res.send('Gaze tracking stopped');
  } else {
    res.send('Gaze process not running');
  }
});

module.exports = router;
