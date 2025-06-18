import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './routes/LoginPage';
import BingSearch from './routes/BingSearch';
import BingChat from './routes/BingChat';
import FeedbackPage from './routes/FeedbackPage';
import { SessionContext, type SessionInfo } from './types/SessionContext';
import axios from 'axios';

const App: React.FC = () => {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSession(parsed);
      } catch (e) {
        console.error('Failed to parse session:', e);
      }
    }
    setLoaded(true);
  }, []);

  // 登录成功时调用
  const handleStart = (info: SessionInfo) => {
    localStorage.setItem('session', JSON.stringify(info));
    setSession(info);
    axios.post('/api/gaze/start', info).catch(console.error);

  };

  // 完成实验时调用
  const handleDone = (info: SessionInfo) => {
    window.location.href = '/feedback';
    axios.post('/api/gaze/stop', info).catch(console.error);
  }

  // 提交反馈后调用
  const handleEnd = () => {
    const taskIndex = session?.currentTaskId || 0;
    if (taskIndex < (session?.taskSequence.length || 0)) {
      session!.currentTaskId += 1;
      session!.taskSequence[session!.currentTaskId].startTime = Date.now();
      localStorage.setItem('session', JSON.stringify(session));
      setSession({ ...session! });
      window.location.href = session!.taskSequence[session!.currentTaskId].platform === 'Bing Chat' ? '/chat' : '/search';
    } else {
      localStorage.removeItem('session');
      setSession(null);
      window.location.href = '/';
    }
  };

  if (!loaded) return <div>加载中...</div>;

  return (
    <Router>
      <SessionContext.Provider value={session}>
        <Routes>
          <Route path="/" element={<LoginPage onStart={handleStart} />} />
          <Route path="/search" element={
            session?.taskSequence[session?.currentTaskId].platform === 'Bing'
              ? <BingSearch onExit={handleDone} />
              : <Navigate to="/" />
          } />
          <Route path="/chat" element={
            session?.taskSequence[session?.currentTaskId].platform === 'Bing Chat'
              ? <BingChat onExit={handleDone} />
              : <Navigate to="/" />
          } />
          <Route path="/feedback" element={
            session ? <FeedbackPage onDone={handleEnd} /> : <Navigate to="/" />
          } />
        </Routes>
      </SessionContext.Provider>
    </Router>
  );
};

export default App;
