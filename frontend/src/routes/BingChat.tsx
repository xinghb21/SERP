import React, { useContext, useState } from 'react';
import { SessionContext, type SessionInfo } from '../types/SessionContext';
import { useBehaviorTracker } from '../hooks/useBehaviorTracker';
import bingLogo from '../assets/bing.png';
import bingChatLogo from '../assets/bing chat.png';
import '../styles/BingChat.css';

interface Related {
  title: string;
  link: string;
  favicon: string;
  source: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  hasRelated: boolean;
  related: Related[];
}

const BingChat: React.FC<{ onExit: (info: SessionInfo) => void }> = ({ onExit }) => {
  const session = useContext(SessionContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  // const [related, setRelated] = useState<string[]>([]);
  // const [related, setRelated] = useState<Related[]>([]);

  const curTask = session!.taskSequence[session!.currentTaskId];
  
  useBehaviorTracker({username: session!.username, platform: curTask.platform, task: curTask.type, active: true});

  const handleSend = async (optionalInput?: string) => {
    const inputValue = optionalInput ?? input;
    if (!inputValue.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, content: inputValue, hasRelated: false, related: [] }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      const reader = response.body?.getReader();
      let accumulatedReply = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                let hasRelated = false;
                let related: Related[] = [];
                if (data.related && data.related.length > 0) {
                  hasRelated = true;
                  related = data.related.map((item: any) => ({
                    title: item.title,
                    link: item.link,
                    favicon: item.favicon,
                    source: item.source,
                  }));
                }

                // if (data.reply) {
                  accumulatedReply += data.reply;
                  console.log(hasRelated);
                  // 实时更新消息
                  setMessages([...newMessages, { role: 'assistant' as const, content: accumulatedReply, hasRelated, related }]);
                // }    
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }
        }
      }
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
    <div className='bing-chat-container'>
      <div className='header'>
        <div className='logo-container'>
          <img src={bingLogo} alt="Bing Logo" className='logo'></img>
          <div 
            data-component="TaskDisplay"
            className='task-display'
          >
            当前任务ID：<b>{curTask.index}</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;当前任务：<b>{curTask.task}</b>
          </div>
          <button
            onClick={handleClick}
            className='end-experiment-button'
            data-component="EndExperimentButton"
          >
            结束实验
          </button>
        </div>
      </div>
      <div className='chat-body'>
        <div className='chat-content-container' data-component="ChatContent">
          {messages.map((m, i) => (
            <>
              <div key={i} className='chat-message-container' data-component="ChatMessage">
                { m.role === 'user' &&
                  <>
                    <div className="user-message">
                      {m.content}
                    </div>
                    { loading && messages.length === i + 1 &&
                      <div className='loading-container'>
                        <span className='loader'></span>
                        <p>正在搜索"{m.content}"</p>
                      </div>
                    }
                  </>
                }
                { m.role !== 'user' &&
                  <div className="ai-message">
                    {m.content}
                  </div>
                }
              </div>
              { m.hasRelated && m.related.length > 0 &&
                <div className='chat-related-container' data-component="ChatRelated">
                  {m.related.map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        window.open(item.link, '_blank');
                      }}
                      className='chat-related-box'
                    >
                      <div className='chat-related-box-header'>
                        <img src={item.favicon} width={15} className='chat-related-box-favicon'></img>
                        <p className='chat-related-box-source'>{item.source}</p>
                      </div>
                      <p className='chat-related-box-title'>{item.title}</p>
                    </div>
                  ))}
                </div>
              }
            </>
          ))}
        </div>
        <div className='padding-bottom'></div>
      </div>
      <div className='chat-input-box-container' data-component="ChatInputBox">
        <img src={bingChatLogo} alt="Bing Chat Logo" className='bing-chat-logo'></img>
        <input
          type="text"
          placeholder='请输入问题...'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className='chat-input-box'
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className='chat-send-button'
          data-component="ChatSendButton"
        >
          {loading ? '发送中...' : '发送'}
        </button>
      </div>
    </div>
  );
};

export default BingChat;
