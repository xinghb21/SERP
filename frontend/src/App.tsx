import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './routes/LoginPage';
import BingSearch from './routes/BingSearch';
import BingChat from './routes/BingChat';
import FeedbackPage from './routes/FeedbackPage';
import { SessionContext, type SessionInfo } from './types/SessionContext';

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
  };

  // 提交反馈后调用
  const handleEnd = () => {
    localStorage.removeItem('session');
    setSession(null);
  };

  if (!loaded) return <div>加载中...</div>;

  return (
    <Router>
      <SessionContext.Provider value={session}>
        <Routes>
          <Route path="/" element={<LoginPage onStart={handleStart} />} />
          <Route path="/search" element={
            session?.platform === 'Bing'
              ? <BingSearch onExit={() => window.location.href = '/feedback'} />
              : <Navigate to="/" />
          } />
          <Route path="/chat" element={
            session?.platform === 'Bing Chat'
              ? <BingChat onExit={() => window.location.href = '/feedback'} />
              : <Navigate to="/" />
          } />
          <Route path="/feedback" element={
            session
              ? <FeedbackPage onDone={handleEnd} />
              : <Navigate to="/" />
          } />
        </Routes>
      </SessionContext.Provider>
    </Router>
  );
};

export default App;
