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
  const [ads, setAds] = useState<any[]>([]);
  const [knowledgeCard, setKnowledgeCard] = useState<any>(null);
  const [relatedQuestions, setRelatedQuestions] = useState<any[]>([]);
  const [relatedSearches, setRelatedSearches] = useState<string[]>([]);
  const [pagination, setPagination] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const curTask = session!.taskSequence[session!.currentTaskId];

  useBehaviorTracker({username: session!.username, platform: curTask.platform, task: curTask.type, active: true});

  const handleSearch = async (q?: string, pageNum: number = 1) => {
    const searchTerm = q ?? query;
    setLoading(true);
    setSearchQuery(searchTerm);
    setPage(pageNum);
    
    try {
      const response = await axios.post('/api/search', { 
        query: searchTerm,
        page: pageNum
      });
      
      setResults(response.data.results || []);
      setAds(response.data.ads || []);
      setKnowledgeCard(response.data.knowledgeCard || null);
      setRelatedQuestions(response.data.relatedQuestions || []);
      setRelatedSearches(response.data.relatedSearches || []);
      setPagination(response.data.pagination || {});
      
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    window.scrollTo(0, 0);
    handleSearch(query, newPage);
  };

  const handleClick = () => {
    onExit(session!)
  };

  // 渲染知识卡片
  const renderKnowledgeCard = () => {
    if (!knowledgeCard) return null;
    
    return (
      <div className="knowledge-card">
        {knowledgeCard.title && (
          <div className="knowledge-card-header">
            <h2>{knowledgeCard.title}</h2>
            {knowledgeCard.url && (
              <a href={knowledgeCard.url} target="_blank" rel="noreferrer" className="knowledge-card-source">
                {new URL(knowledgeCard.url).hostname}
              </a>
            )}
          </div>
        )}
        
        <div className="knowledge-card-content">
          {knowledgeCard.image && (
            <img 
              src={knowledgeCard.image} 
              alt={knowledgeCard.title || "Knowledge Card"} 
              className="knowledge-card-image"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          )}
          
          <div className="knowledge-card-text">
            {(knowledgeCard.description || knowledgeCard.answer) && (
              <p className="knowledge-card-description">
                {knowledgeCard.description || knowledgeCard.answer}
              </p>
            )}
            
            {knowledgeCard.attributes && (
              <div className="knowledge-card-attributes">
                {Object.entries(knowledgeCard.attributes).map(([key, value], i) => (
                  <div key={i} className="attribute">
                    <span className="attribute-key">{key}:</span>
                    <span className="attribute-value">{value as string}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 渲染广告
  const renderAds = () => {
    if (ads.length === 0) return null;
    
    return (
      <div className="ads-container">
        <div className="ads-label">广告</div>
        {ads.map((ad, idx) => (
          <div key={`ad-${idx}`} className="ad-result">
            <div className="ad-url">{ad.displayLink}</div>
            <a href={ad.url} target="_blank" rel="noreferrer" className="ad-title">
              {ad.title}
            </a>
            <p className="ad-snippet">{ad.snippet}</p>
          </div>
        ))}
      </div>
    );
  };

  // 渲染相关问题
  const renderRelatedQuestions = () => {
    if (relatedQuestions.length === 0) return null;
    
    return (
      <div className="related-questions">
        <h3 className="related-questions-title">其他人也问了</h3>
        {relatedQuestions.map((q, idx) => (
          <div key={idx} className="related-question">
            <div className="question-header">
              <i className="fas fa-question-circle"></i>
              <a href={q.url} target="_blank" rel="noreferrer" className="question-text">
                {q.question}
              </a>
            </div>
            <p className="question-snippet">{q.snippet}</p>
          </div>
        ))}
      </div>
    );
  };

  // 渲染分页控件
  const renderPagination = () => {
    if (results.length === 0 || loading) return null;
    
    const totalPages = Math.ceil((pagination.totalResults || 8790000) / 10);
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return (
      <div className='pagination'>
        {page > 1 && (
          <div 
            className='page-btn prev-next'
            onClick={() => handlePageChange(page - 1)}
          >
            上一页
          </div>
        )}
        
        {pages.map(pageNum => (
          <div 
            key={pageNum}
            className={`page-btn ${pageNum === page ? 'active' : ''}`}
            onClick={() => handlePageChange(pageNum)}
          >
            {pageNum}
          </div>
        ))}
        
        {page < totalPages && (
          <div 
            className='page-btn prev-next'
            onClick={() => handlePageChange(page + 1)}
          >
            下一页
          </div>
        )}
      </div>
    );
  };

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
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className='search-box'
            data-component="SearchInput"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className='my-search-button'
            data-component="SearchButton"
          >
            {loading ? '搜索中...' : '搜索'}
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
              <div className='results-count'>
                约 {(pagination.totalResults || 8790000).toLocaleString('zh-CN')} 个结果
                <span className='results-time'>（搜索用时 0.52 秒）</span>
              </div>
            </div>
          )}
          
          {/* 广告区域 */}
          {renderAds()}
          
          {/* AI摘要/知识卡片 */}
          <div data-component="AISummary">
            {renderKnowledgeCard()}
          </div>
          
          {/* 自然搜索结果 */}
          {results.map((item, idx) => (
            <div key={idx} className="search-result-container">
              <div className="search-result-url-container">
                {item.thumbnail && (
                  <img 
                    src={item.thumbnail} 
                    alt={item.title} 
                    className="search-result-thumbnail"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <span className="search-result-display-link">
                    {item.displayLink || new URL(item.url).hostname}
                  </span>
                  {item.date && <span className="search-result-date"> · {item.date}</span>}
                </div>
              </div>
              
              <a 
                href={item.url} 
                target="_blank" 
                rel="noreferrer" 
                className="search-result-title"
              >
                {item.title}
                <svg className="external-icon" viewBox="0 0 24 24">
                  <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"></path>
                  <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7z"></path>
                </svg>
              </a>
              
              <p className="search-result-desc">
                {item.snippet}
              </p>
            </div>
          ))}
          
          {/* 相关问题 */}
          {renderRelatedQuestions()}
          
          {/* 分页控件 */}
          {renderPagination()}

        </div>
        <div className='right-body'>
          {/* 知识卡片右侧位置 */}
          {knowledgeCard && knowledgeCard.image && (
            <div className="knowledge-card-right">
              <img 
                src={knowledgeCard.image} 
                alt={knowledgeCard.title || "Knowledge Card"} 
                className="knowledge-card-image-right"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
              {knowledgeCard.attributes && (
                <div className="knowledge-card-attributes-right">
                  {Object.entries(knowledgeCard.attributes).slice(0, 5).map(([key, value], i) => (
                    <div key={i} className="attribute">
                      <span className="attribute-key">{key}:</span>
                      <span className="attribute-value">{value as string}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* 相关搜索 */}
          {relatedSearches.length > 0 && (
            <div data-component="RelatedSuggestions" className='related-suggestions-container'>
              <p className='related-suggestions-title'>
                <span className='related-suggestions-title-red'>{searchQuery} </span>的相关搜索
              </p>
              <div className='related-suggestions-button-container'>
                {relatedSearches.map((r, i) => (
                  <div key={i} className="related-suggestion-item">
                    <i className='fas fa-search related-suggestions-icon'></i>
                    <button
                      onClick={() => {
                        setQuery(r);
                        handleSearch(r); 
                      }}
                      className='related-suggestions-button'
                    >
                      {r}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 页脚 */}
      <footer className="bing-footer">
        <div className="footer-links">
          <a href="#">隐私和 Cookie</a>
          <a href="#">法律声明</a>
          <a href="#">广告</a>
          <a href="#">关于我们的广告</a>
          <a href="#">帮助</a>
          <a href="#">反馈</a>
        </div>
        <div className="footer-copyright">© {new Date().getFullYear()} Microsoft</div>
      </footer>
    </div>
  );
};

export default BingSearch;