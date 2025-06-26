import React, { useState } from 'react';
import debateGameConfig from '../config/debateGameConfig';
import '../styles/DebateGameConfig.css';

/**
 * 辩论博弈策略配置组件
 * @param {Object} props - 组件属性
 * @param {Function} props.onLoadConfig - 加载配置的回调函数
 * @param {boolean} props.isOpen - 是否显示模态框
 * @param {Function} props.onClose - 关闭模态框的回调函数
 */
const DebateGameConfig = ({ onLoadConfig, isOpen, onClose }) => {
  const [selectedTopic, setSelectedTopic] = useState('');

  if (!isOpen) return null;

  const handleLoadConfig = () => {
    // 加载辩论博弈策略配置
    onLoadConfig(debateGameConfig);
    onClose();
  };

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content debate-game-modal">
        <div className="modal-header">
          <h2>🔥 辩论博弈策略</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {/* 策略介绍 */}
          <div className="strategy-intro">
            <div className="intro-card">
              <h3>🎯 策略目标</h3>
              <p>通过6个不同立场的智能体进行激烈辩论，从质疑、反驳到深度反思，最终形成更加深刻、全面的认知。</p>
            </div>
            
            <div className="intro-card">
              <h3>📋 讨论流程</h3>
              <div className="discussion-flow">
                <div className="flow-step">
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <h4>立场表达</h4>
                    <p>各方表达初始观点和立场</p>
                  </div>
                </div>
                <div className="flow-step">
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <h4>交锋对辩</h4>
                    <p>针对其他观点进行质疑和反驳</p>
                  </div>
                </div>
                <div className="flow-step">
                  <span className="step-number">3</span>
                  <div className="step-content">
                    <h4>深度剖析</h4>
                    <p>更深层次的分析和质疑</p>
                  </div>
                </div>
                <div className="flow-step">
                  <span className="step-number">4</span>
                  <div className="step-content">
                    <h4>反思整合</h4>
                    <p>基于争论进行反思并寻求平衡</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 智能体角色展示 */}
          <div className="agents-preview">
            <h3>🎭 参与角色</h3>
            <div className="agents-grid">
              {debateGameConfig.agents.map((agent, index) => (
                <div key={agent.id} className="agent-card" style={{ borderColor: agent.color }}>
                  <div className="agent-header">
                    <div className="agent-avatar" style={{ backgroundColor: agent.color }}>
                      {agent.name[0]}
                    </div>
                    <div className="agent-info">
                      <h4>{agent.name}</h4>
                      <span className="agent-role">{agent.role}</span>
                    </div>
                  </div>
                  <p className="agent-description">{agent.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 建议话题 */}
          <div className="suggested-topics">
            <h3>💡 建议话题</h3>
            <p className="topics-intro">选择一个话题开始激烈的辩论博弈：</p>
            <div className="topics-grid">
              {debateGameConfig.suggestedTopics.map((topic, index) => (
                <div 
                  key={index} 
                  className={`topic-card ${selectedTopic === topic ? 'selected' : ''}`}
                  onClick={() => handleTopicSelect(topic)}
                >
                  {topic}
                </div>
              ))}
            </div>
          </div>

          {/* 使用说明 */}
          <div className="usage-tips">
            <h3>💎 使用建议</h3>
            <div className="tips-list">
              <div className="tip-item">
                <span className="tip-icon">🔑</span>
                <span>确保所有智能体都配置了API密钥</span>
              </div>
              <div className="tip-item">
                <span className="tip-icon">🎯</span>
                <span>选择有争议性的社会话题效果最佳</span>
              </div>
              <div className="tip-item">
                <span className="tip-icon">⏰</span>
                <span>建议让讨论进行3-4轮以达到深度</span>
              </div>
              <div className="tip-item">
                <span className="tip-icon">🔥</span>
                <span>鼓励智能体之间的激烈观点碰撞</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            取消
          </button>
          <button className="btn btn-primary" onClick={handleLoadConfig}>
            加载辩论博弈策略
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebateGameConfig; 