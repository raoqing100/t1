import React, { useState, useEffect } from 'react';
import { theme } from '../styles/theme';
import { getDiscussionList, deleteDiscussion, exportDiscussionAsJson } from '../services/localStorage';

export default function DiscussionHistory({ onSelectDiscussion, onBack }) {
  const [discussions, setDiscussions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt'); // 'updatedAt', 'createdAt', 'topic'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  // 加载讨论记录
  useEffect(() => {
    loadDiscussions();
  }, []);

  const loadDiscussions = () => {
    const allDiscussions = getDiscussionList();
    setDiscussions(allDiscussions);
  };

  // 处理删除讨论记录
  const handleDelete = (e, discussionId) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这条讨论记录吗？')) {
      const success = deleteDiscussion(discussionId);
      if (success) {
        setDiscussions(prevDiscussions => 
          prevDiscussions.filter(d => d.id !== discussionId)
        );
      } else {
        alert('删除讨论记录失败');
      }
    }
  };

  // 处理导出讨论记录
  const handleExport = (e, discussionId) => {
    e.stopPropagation();
    exportDiscussionAsJson(discussionId);
  };

  // 格式化日期时间
  const formatDateTime = (isoString) => {
    if (!isoString) return '未知时间';
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 过滤和排序讨论记录
  const filteredAndSortedDiscussions = discussions
    .filter(discussion => 
      discussion.topic.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const valueA = a[sortBy] ? new Date(a[sortBy]) : 0;
      const valueB = b[sortBy] ? new Date(b[sortBy]) : 0;
      
      if (sortOrder === 'asc') {
        return valueA - valueB;
      } else {
        return valueB - valueA;
      }
    });

  // 切换排序方式
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: theme.colors.primary, margin: 0 }}>
          讨论历史记录
        </h2>
        <button
          onClick={onBack}
          style={{
            backgroundColor: theme.colors.secondary,
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>←</span>
          返回讨论室
        </button>
      </div>

      {/* 搜索和排序控件 */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1, maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="搜索讨论主题..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '1rem'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span>排序: </span>
          <button
            onClick={() => toggleSort('updatedAt')}
            style={{
              backgroundColor: sortBy === 'updatedAt' ? theme.colors.primary : '#f0f0f0',
              color: sortBy === 'updatedAt' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            更新时间
            {sortBy === 'updatedAt' && (
              <span>{sortOrder === 'desc' ? '↓' : '↑'}</span>
            )}
          </button>
          <button
            onClick={() => toggleSort('createdAt')}
            style={{
              backgroundColor: sortBy === 'createdAt' ? theme.colors.primary : '#f0f0f0',
              color: sortBy === 'createdAt' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            创建时间
            {sortBy === 'createdAt' && (
              <span>{sortOrder === 'desc' ? '↓' : '↑'}</span>
            )}
          </button>
        </div>
      </div>

      {/* 讨论记录列表 */}
      {filteredAndSortedDiscussions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            {searchTerm ? '没有找到匹配的讨论记录' : '暂无保存的讨论记录'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredAndSortedDiscussions.map(discussion => (
            <div
              key={discussion.id}
              onClick={() => onSelectDiscussion(discussion.id)}
              style={{
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '1px solid #eee',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                position: 'relative'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#f9f9f9';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
              }}
            >
              <div style={{ marginBottom: '0.75rem', fontWeight: 'bold', fontSize: '1.1rem', paddingRight: '7rem' }}>
                {discussion.topic}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div>
                    {discussion.messages?.length || 0} 条消息
                  </div>
                  {discussion.isSummarized && (
                    <div style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                      已总结
                    </div>
                  )}
                </div>
                <div>
                  <div>更新: {formatDateTime(discussion.updatedAt)}</div>
                  <div>创建: {formatDateTime(discussion.createdAt)}</div>
                </div>
              </div>
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                display: 'flex',
                gap: '0.5rem'
              }}>
                <button
                  onClick={(e) => handleExport(e, discussion.id)}
                  title="导出为JSON"
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  导出
                </button>
                <button
                  onClick={(e) => handleDelete(e, discussion.id)}
                  title="删除讨论"
                  style={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}