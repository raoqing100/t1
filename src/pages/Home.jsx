import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAccountInfo } from '../services/api';
import '../styles/Home.css';

/**
 * 首页组件
 * @returns {JSX.Element} - 渲染的组件
 */
const Home = () => {
  const [apiKey, setApiKey] = useState('');
  const [accountInfo, setAccountInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // 从本地存储加载API密钥
  useEffect(() => {
    const savedApiKey = localStorage.getItem('apiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);
  
  // 当API密钥变化时，获取账号信息
  useEffect(() => {
    const fetchAccountInfo = async () => {
      if (!apiKey) {
        setAccountInfo(null);
        return;
      }
      
      setLoading(true);
      
      try {
        const info = await getAccountInfo(apiKey);
        setAccountInfo(info);
      } catch (err) {
        console.error('获取账号信息失败:', err);
        setAccountInfo(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAccountInfo();
  }, [apiKey]);
  
  // 获取账号级别显示文本
  const getAccountTierDisplay = (tier) => {
    switch (tier) {
      case 'free':
        return '免费账户';
      case 'standard':
        return '标准账户';
      case 'premium':
        return '高级账户';
      case 'enterprise':
        return '企业账户';
      default:
        return '未知账户类型';
    }
  };
  
  return (
    <div className="home">
      <section className="hero">
        <h1>企业多智能大脑系统</h1>
          <p className="subtitle">企业级AI智能体协作平台，实现深度讨论与知识创新</p>
        
        <div className="cta-buttons">
          <Link to="/config" className="cta-button primary">开始配置</Link>
          <Link to="/chat" className="cta-button secondary">进入讨论大厅</Link>
        </div>
      </section>
      
      {loading ? (
        <section className="account-status loading">
          <p>加载账号信息中...</p>
        </section>
      ) : accountInfo ? (
        <section className="account-status">
          <h2>账号状态</h2>
          <p>
            您当前的账号级别: <strong>{getAccountTierDisplay(accountInfo.tier)}</strong>
          </p>
          
          {accountInfo.tier !== 'enterprise' ? (
            <div className="upgrade-notice">
              <p>您的账号无法使用Claude 4模型，该模型仅限企业账户使用。</p>
              <Link to="/account" className="upgrade-link">查看账号详情</Link>
            </div>
          ) : (
            <div className="premium-notice">
              <p>您的企业账户可以使用所有模型，包括Claude 4。</p>
            </div>
          )}
        </section>
      ) : (
              <section className="account-status">
        <h2>账号状态</h2>
        <p>未检测到API密钥，请配置SiliconFlow API密钥以使用AI功能。</p>
        <div className="api-guide">
          <h3>如何获取SiliconFlow API密钥？</h3>
          <ol>
            <li>访问 <a href="https://cloud.siliconflow.cn" target="_blank" rel="noopener noreferrer">SiliconFlow控制台</a></li>
            <li>注册并登录账号</li>
            <li>在控制台中生成API密钥</li>
            <li>在配置智能体页面中输入API密钥</li>
          </ol>
        </div>
        <Link to="/config" className="cta-button secondary">配置智能体</Link>
      </section>
      )}
      
      <section className="features">
        <h2>功能特点</h2>
        
        <div className="feature-grid">
          <div className="feature-card">
            <h3>多智能体协作</h3>
            <p>配置多个AI智能体，赋予它们不同的角色和特点，让它们共同讨论话题。</p>
          </div>
          
          <div className="feature-card">
            <h3>自定义角色</h3>
            <p>为每个智能体定制名称、角色和行为特点，创建丰富多样的讨论环境。</p>
          </div>
          
          <div className="feature-card">
            <h3>支持多种模型</h3>
            <p>根据账号级别，可以使用从通义千问到Claude 4在内的多种AI模型。</p>
          </div>
          
          <div className="feature-card">
            <h3>讨论记录保存</h3>
            <p>自动保存讨论记录，随时回顾和继续之前的对话。</p>
          </div>
          
          <div className="feature-card">
            <h3>MCP服务集成</h3>
            <p>支持集成常用的MCP服务，简化配置流程。</p>
          </div>
          
          <div className="feature-card">
            <h3>讨论总结</h3>
            <p>自动生成讨论总结，提炼关键观点和结论。</p>
          </div>
        </div>
      </section>
      
      <section className="claude-info">
        <h2>关于Claude 4模型</h2>
        <div className="claude-content">
          <div className="claude-text">
            <p>
              Claude 4是Anthropic公司推出的最先进的AI助手，具有卓越的推理能力、
              更广泛的知识和更强的工具使用能力。
            </p>
            <p>
              Claude 4在复杂推理、编程、数学和创意写作等任务上表现优异，
              能够理解和处理更长的上下文，生成更高质量的回复。
            </p>
            <p>
              <strong>注意：</strong> Claude 4模型仅对企业账户开放，
              需要升级到企业账户才能使用该模型。
            </p>
            <Link to="/account" className="cta-button secondary">查看账号详情</Link>
          </div>
          <div className="claude-image">
            <div className="image-placeholder">
              Claude 4模型图片
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 