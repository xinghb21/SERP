import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SessionInfo, TaskSequence } from '../types/SessionContext';
import axios from 'axios';

const LoginPage: React.FC<{ onStart: (info: SessionInfo) => void }> = ({ onStart }) => {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !userId) return alert('请填写所有字段');

    try {
      let userIndex = parseInt(userId);
      if (isNaN(userIndex)) {
        return alert('Invalid user ID');
      }
      userIndex = userIndex % 16;

      const res = await axios.get(`/api/task-sequence/${userIndex}`);
      const taskSequence: TaskSequence[] = res.data;

      const info: SessionInfo = {
        username,
        userId: userIndex,
        taskSequence,
        currentTaskId: 0,
      };
      
      info.taskSequence[info.currentTaskId].startTime = Date.now();

      onStart(info);
      navigate(info.taskSequence[info.currentTaskId].platform === 'Bing Chat' ? '/chat' : '/search');

    } catch (err) {
      console.error('登录失败:', err);
      alert('登录失败，请重试');
    }
  };

  return (
    <div style={{
      maxWidth: 400,
      margin: '100px auto',
      padding: 20,
      border: '1px solid #ccc',
      borderRadius: 8,
      backgroundColor: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>实验登录</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>用户名：</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>用户编号：</label>
          <input
            type="number"
            min="0"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <button type="submit" style={{
          width: '100%',
          padding: 10,
          backgroundColor: '#0078d4',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          fontWeight: 'bold'
        }}>
          开始实验
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
