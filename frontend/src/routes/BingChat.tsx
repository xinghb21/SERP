import React, { useContext, useState } from 'react';
import axios from 'axios';
import { SessionContext } from '../types/SessionContext';
import { useBehaviorTracker } from '../hooks/useBehaviorTracker';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const BingChat: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const session = useContext(SessionContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useBehaviorTracker({ ...session!, active: true });

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/chat', { messages: newMessages });
      const reply = res.data.reply || '对不起，我没有理解你的问题。';
      setMessages([...newMessages, { role: 'assistant' as const, content: reply }]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: 12, borderBottom: '1px solid #ccc'
      }}>
        <div data-component="TaskDisplay">
          当前任务：<b>{session?.concreteTask}</b>
        </div>
        <button
          onClick={onExit}
          style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4 }}
          data-component="EndExperimentButton"
        >
          结束实验
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {messages.map((m, i) => (
          <div key={i} data-component="ChatMessage" style={{ marginBottom: 12 }}>
            <strong>{m.role === 'user' ? '👤 用户' : '🤖 AI'}：</strong> {m.content}
          </div>
        ))}
      </div>

      <div
        style={{ borderTop: '1px solid #ccc', padding: 12, display: 'flex', gap: 8 }}
        data-component="ChatInputBox"
      >
        <input
          type="text"
          placeholder="请输入问题..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          style={{ padding: '8px 16px' }}
          data-component="ChatSendButton"
        >
          {loading ? '发送中...' : '发送'}
        </button>
      </div>
    </div>
  );
};

export default BingChat;
