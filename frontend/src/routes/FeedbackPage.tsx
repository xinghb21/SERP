import React, { useContext, useState } from 'react';
import axios from 'axios';
import { SessionContext } from '../types/SessionContext';

const TLX_ITEMS = [
  '心理需求（Mental Demand）',
  '身体需求（Physical Demand）',
  '时间压力（Temporal Demand）',
  '任务表现（Performance）',
  '努力程度（Effort）',
  '挫败感（Frustration）'
];

const SUQ_ITEMS = [
  '系统响应速度令人满意',
  '信息展示清晰明了',
  '我能轻松完成任务',
  '我信任系统返回的结果',
  '我愿意再次使用该平台'
];

const FeedbackPage: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const session = useContext(SessionContext);
  const [tlxScores, setTlxScores] = useState<number[]>(Array(TLX_ITEMS.length).fill(3));
  const [suqScores, setSuqScores] = useState<number[]>(Array(SUQ_ITEMS.length).fill(3));
  const [suggestion, setSuggestion] = useState('');

  const handleSubmit = async () => {
    const endTime = Date.now();
    try {
      await axios.post('/api/track', {
        user: session?.username,
        platform: session?.platform,
        task: session?.task,
        session: {
          start: session?.startTime,
          end: endTime,
          durationMs: session?.startTime ? endTime - session.startTime : 0
        },
        feedback: {
          tlx: tlxScores,
          suq: suqScores,
          suggestion,
          time: endTime
        }
      });
    } catch (err) {
      console.error('Submit feedback failed:', err);
    }
    onDone();
  };

  const renderLikert = (value: number, setValue: (v: number) => void) => (
    <select value={value} onChange={e => setValue(parseInt(e.target.value))}>
      {[1, 2, 3, 4, 5].map(i => <option key={i} value={i}>{i}</option>)}
    </select>
  );

  return (
    <div style={{ maxWidth: 800, margin: '80px auto', padding: 24 }}>
      <h2>实验反馈问卷</h2>
      <p>平台：<b>{session?.platform}</b> | 任务类型：<b>{session?.task}</b></p>

      <hr style={{ margin: '16px 0' }} />
      <h3>任务负荷评分（1=最低，5=最高）</h3>
      {TLX_ITEMS.map((item, idx) => (
        <div key={idx} style={{ marginBottom: 8 }}>
          <label>{item}：</label>{' '}
          {renderLikert(tlxScores[idx], (v) => {
            const newScores = [...tlxScores];
            newScores[idx] = v;
            setTlxScores(newScores);
          })}
        </div>
      ))}

      <hr style={{ margin: '24px 0' }} />
      <h3>系统可用性评价（SUQ）（1=强烈不同意，5=强烈同意）</h3>
      {SUQ_ITEMS.map((item, idx) => (
        <div key={idx} style={{ marginBottom: 8 }}>
          <label>{item}：</label>{' '}
          {renderLikert(suqScores[idx], (v) => {
            const newScores = [...suqScores];
            newScores[idx] = v;
            setSuqScores(newScores);
          })}
        </div>
      ))}

      <hr style={{ margin: '24px 0' }} />
      <h3>其他建议或意见</h3>
      <textarea
        value={suggestion}
        onChange={(e) => setSuggestion(e.target.value)}
        placeholder="请填写对系统的建议、问题或改进想法..."
        style={{ width: '100%', height: 100, marginTop: 8 }}
      />

      <div style={{ marginTop: 24 }}>
        <button onClick={handleSubmit} style={{
          padding: '10px 20px',
          backgroundColor: '#0078d4',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          fontWeight: 'bold',
          fontSize: 15
        }}>
          提交反馈并结束实验
        </button>
      </div>
    </div>
  );
};

export default FeedbackPage;
