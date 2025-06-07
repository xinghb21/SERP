import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SessionInfo } from '../types/SessionContext';
import { TASK_POOL } from '../data/taskPool';

const TASKS = Object.keys(TASK_POOL);

const LoginPage: React.FC<{ onStart: (info: SessionInfo) => void }> = ({ onStart }) => {
  const [username, setUsername] = useState('');
  const [platform, setPlatform] = useState('');
  const [task, setTask] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !platform || !task) return alert('请填写所有字段');

    const taskCandidates = TASK_POOL[task];
    const concreteTask = taskCandidates[Math.floor(Math.random() * taskCandidates.length)];

    const info = {
      username,
      platform,
      task,
      concreteTask,
      startTime: Date.now()
    };
    onStart(info);
    navigate(platform === 'Bing Chat' ? '/chat' : '/search');
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8, backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>实验登录</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>用户名：</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>平台选择：</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} required style={{ width: '100%', padding: 8 }}>
            <option value="">请选择平台</option>
            <option value="Bing">Bing</option>
            <option value="Bing Chat">Bing Chat</option>
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>任务类型：</label>
          <select value={task} onChange={(e) => setTask(e.target.value)} required style={{ width: '100%', padding: 8 }}>
            <option value="">请选择任务类型</option>
            {TASKS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <button type="submit" style={{ width: '100%', padding: 10, backgroundColor: '#0078d4', color: 'white', border: 'none', borderRadius: 4, fontWeight: 'bold' }}>
          开始实验
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
