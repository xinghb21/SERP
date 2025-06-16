import React, { useContext, useState } from 'react';
import axios from 'axios';
import { SessionContext, type SessionInfo } from '../types/SessionContext';
import { useBehaviorTracker } from '../hooks/useBehaviorTracker';

const BingSearch: React.FC<{ onExit: (info: SessionInfo) => void }> = ({ onExit }) => {
  const session = useContext(SessionContext);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [related, setRelated] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useBehaviorTracker({ ...session!, active: true });

  const handleSearch = async (q?: string) => {
    const searchTerm = q ?? query;
    setLoading(true);
    try {
      const response = await axios.post('/api/search', { query: searchTerm });
      setResults(response.data.results || []);
      setSummary(response.data.summary || null);
      setRelated(response.data.related || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleClick = () => {
    onExit(session!)
  }

  return (
    <div className="container" style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20, borderBottom: '1px solid #ccc', paddingBottom: 10
      }}>
        <div data-component="TaskDisplay">
          当前任务：<b>{session?.concreteTask}</b>
        </div>
        <button
          onClick={handleClick}
          style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4 }}
          data-component="EndExperimentButton"
        >
          结束实验
        </button>
      </div>

      <div style={{ display: 'flex', marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search the web"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, padding: 8 }}
          data-component="SearchInput"
        />
        <button
          onClick={() => handleSearch()}
          disabled={loading}
          style={{ padding: '8px 16px', marginLeft: 8 }}
          data-component="SearchButton"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {summary && (
        <div data-component="AISummary" style={{ background: '#eef', padding: 12, borderRadius: 6, marginBottom: 16 }}>
          <strong>AI 总结：</strong> {summary}
        </div>
      )}

      {results.map((item, idx) => (
        <div key={idx} data-component="SearchResultItem" style={{ marginBottom: 16 }}>
          <a href={item.url} target="_blank" rel="noreferrer" style={{ fontWeight: 'bold', color: '#0078d4', fontSize: 16 }}>
            {item.title}
          </a>
          <p>{item.snippet}</p>
          <p style={{ color: '#888', fontSize: 12 }}>{item.url}</p>
        </div>
      ))}

      {related.length > 0 && (
      <div data-component="RelatedSuggestions" style={{ marginTop: 20 }}>
        <strong style={{ display: 'block', marginBottom: 8 }}>相关推荐：</strong>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {related.map((r, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(r);
                handleSearch(r); 
              }}
              style={{
                padding: '6px 12px',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ccc',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    )}
    </div>
  );
};

export default BingSearch;
