import React, { useContext, useState } from 'react';
import axios from 'axios';
import { SessionContext, type SessionInfo } from '../types/SessionContext';
import { useBehaviorTracker } from '../hooks/useBehaviorTracker';
import bingLogo from '../assets/bing.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/BingSearch.css';

const BingSearch: React.FC<{ onExit: (info: SessionInfo) => void }> = ({ onExit }) => {
  const session = useContext(SessionContext);
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [related, setRelated] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const curTask = session!.taskSequence[session!.currentTaskId];

  useBehaviorTracker({username: session!.username, platform: curTask.platform, task: curTask.type, active: true});

  const handleSearch = async (q?: string) => {
    const searchTerm = q ?? query;
    setLoading(true);
    setSearchQuery(searchTerm);
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
    <div className='bing-search-container'>
      <div className='header'>
        <div className='logo-container'>
          <img src={bingLogo} alt="Bing Logo" className='logo'></img>
        </div>
        <div className="search-container">
          <i className='fas fa-search search-icon'/>
          <input
            type='text'
            placeholder='Search the web'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className='search-box'
            data-component="SearchInput"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className='my-search-button'
            data-component="SearchButton"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
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
      <div className='body'>
        <div className='left-body'>
          { results.length !== 0 && !loading && (
            <div className='results-header'>
              <div className='results-count'>约 8,790,000个结果</div>
            </div>
          )}
          {summary && (
            <div data-component="AISummary" className='ai-summary-container'>
              <div className='ai-summary-title'>{searchQuery}</div>
              <div className='ai-summary-desc'>{summary}</div>
            </div>
          )}

          {results.map((item, idx) => (
            <div key={idx} data-component="SearchResultItem" className='search-result-container'>
              <span className='search-result-url'>{item.url}</span>
              <a href={item.url} target="_blank" rel="noreferrer" className='search-result-title'>
                {item.title}
              </a>
              <p className='search-result-desc'>{item.snippet}</p>
            </div>
          ))}

          { results.length !== 0 && !loading && (
          <div className='pagination'>
            <div className='page-btn active'>1</div>
            <div className='page-btn'>2</div>
            <div className='page-btn'>3</div>
            <div className='page-btn'>4</div>
            <div className='page-btn'>5</div>
            <div className='page-btn'>下一页</div>
          </div>
          )}

        </div>
        <div className='right-body'>
           {related.length > 0 && (
            <div data-component="RelatedSuggestions" className='related-suggestions-container'>
              <p className='related-suggestions-title'><span className='related-suggestions-title-red'>{searchQuery} </span>的相关推荐</p>
              <div className='related-suggestions-button-container'>
                {related.map((r, i) => (
                  <>
                    <i className='fas fa-search related-suggestions-icon'></i>
                    <button
                      key={i}
                      onClick={() => {
                        setQuery(r);
                        handleSearch(r); 
                      }}
                      className='related-suggestions-button'
                    >
                      {r}
                    </button>
                  </>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BingSearch;
