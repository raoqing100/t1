import React from 'react';
import { theme } from '../styles/theme';
import { exportDiscussionAsJson, deleteDiscussion } from '../services/localStorage';

/**
 * 已保存讨论列表组件
 * @param {Object} props - 组件属性
 * @param {Array} props.discussions - 讨论记录列表
 * @param {Function} props.onSelectDiscussion - 选择讨论的回调函数
 * @param {Function} props.onDeleteDiscussion - 删除讨论的回调函数
 * @param {Function} props.onClose - 关闭列表的回调函数
 */
const SavedDiscussions = ({ discussions, onSelectDiscussion, onDeleteDiscussion, onClose }) => {
  // 导出讨论记录为JSON文件
  const handleExport = (e, discussionId) => {
    e.stopPropagation(); // 阻止事件冒泡
    exportDiscussionAsJson(discussionId);
  };

  // 删除讨论记录
  const handleDelete = (e, discussionId) => {
    e.stopPropagation(); // 阻止事件冒泡
    if (window.confirm('确定要删除这条讨论记录吗？')) {
      const success = deleteDiscussion(discussionId);
      if (success) {
        onDeleteDiscussion(discussionId);
      } else {
        alert('删除讨论记录失败');
      }
    }
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

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h3 style={{ margin: 0, color: theme.colors.primary }}>已保存的讨论</h3>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            &times;
          </button>
        </div>

        {discussions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            暂无保存的讨论记录
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {discussions.map(discussion => (
              <div
                key={discussion.id}
                onClick={() => onSelectDiscussion(discussion.id)}
                style={{
                  backgroundColor: '#f9f9f9',
                  borderRadius: '4px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  border: '1px solid #eee',
                  position: 'relative'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
              >
                <div style={{ marginBottom: '0.5rem', fontWeight: 'bold', paddingRight: '6rem' }}>
                  {discussion.topic}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666' }}>
                  <div>
                    {discussion.messages.length} 条消息
                    {discussion.isSummarized && (
                      <span style={{ marginLeft: '0.5rem', color: theme.colors.primary, fontWeight: 'bold' }}>
                        已总结
                      </span>
                    )}
                  </div>
                  <div>
                    {formatDateTime(discussion.updatedAt)}
                  </div>
                </div>
                <div style={{
                  position: 'absolute',
                  top: '0.75rem',
                  right: '0.75rem',
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
                      fontSize: '0.75rem',
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
                      fontSize: '0.75rem',
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
    </div>
  );
};

export default SavedDiscussions;