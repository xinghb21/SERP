import React, { useContext, useState } from 'react';
import axios from 'axios';
import { SessionContext, type SessionInfo } from '../types/SessionContext';
import { useBehaviorTracker } from '../hooks/useBehaviorTracker';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const BingChat: React.FC<{ onExit: (info: SessionInfo) => void }> = ({ onExit }) => {
  const session = useContext(SessionContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [related, setRelated] = useState<string[]>([]);

  const curTask = session!.taskSequence[session!.currentTaskId];
  
  useBehaviorTracker({username: session!.username, platform: curTask.platform, task: curTask.type, active: true});

  const handleSend = async (optionalInput?: string) => {
    const inputValue = optionalInput ?? input;
    if (!inputValue.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, content: inputValue }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/chat', { messages: newMessages });
      const reply = res.data.reply || '对不起，我没有理解你的问题。';
      const newRelated = res.data.related || [];
      setMessages([...newMessages, { role: 'assistant' as const, content: reply }]);
      setRelated(newRelated);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    onExit(session!);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* 顶部任务与结束按钮 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: 12, borderBottom: '1px solid #ccc'
      }}>
        <div data-component="TaskDisplay">
          当前任务ID：<b>{curTask.index}</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;当前任务：<b>{curTask.task}</b>
        </div>
        <button
          onClick={handleClick}
          style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4 }}
          data-component="EndExperimentButton"
        >
          结束实验
        </button>
      </div>

      {/* 聊天信息承载区域 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }} data-component="ChatContent">
        {messages.map((m, i) => (
          <div key={i} data-component="ChatMessage" style={{ marginBottom: 12 }}>
            <strong>{m.role === 'user' ? '👤 用户' : '🤖 AI'}：</strong> {m.content}
          </div>
        ))}
      </div>

      {/* 相关推荐扩展组件 */}
      {related.length > 0 && (
        <div
          data-component="ChatRelated"
          style={{
            padding: '12px 16px',
            backgroundColor: '#f4f4f4',
            borderTop: '1px solid #ccc',
            fontSize: 14
          }}
        >
          <b>相关推荐：</b>
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {related.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(item);
                  handleSend(item);
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 底部输入组件 */}
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
          onClick={() => handleSend()}
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
