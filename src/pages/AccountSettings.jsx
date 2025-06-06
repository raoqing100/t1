import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccountInfo } from '../services/api';
import '../styles/AccountSettings.css';

/**
 * 账号设置页面组件
 * @returns {JSX.Element} - 渲染的组件
 */
const AccountSettings = () => {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [accountInfo, setAccountInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
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
      setError(null);
      
      try {
        const info = await getAccountInfo(apiKey);
        setAccountInfo(info);
      } catch (err) {
        console.error('获取账号信息失败:', err);
        setError('获取账号信息失败，请检查API密钥是否正确');
        setAccountInfo(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAccountInfo();
  }, [apiKey]);
  
  // 保存API密钥
  const handleSaveApiKey = () => {
    localStorage.setItem('apiKey', apiKey);
    alert('API密钥已保存');
  };
  
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
  
  // 获取账号级别颜色
  const getAccountTierColor = (tier) => {
    switch (tier) {
      case 'free':
        return '#2E8B57'; // 绿色
      case 'standard':
        return '#4682B4'; // 蓝色
      case 'premium':
        return '#FFD700'; // 金色
      case 'enterprise':
        return '#9370DB'; // 紫色
      default:
        return '#999'; // 灰色
    }
  };
  
  return (
    <div className="account-settings">
      <h1>账号设置</h1>
      
      <div className="api-key-section">
        <h2>API密钥设置</h2>
        <div className="form-group">
          <label htmlFor="apiKey">API密钥:</label>
          <input 
            type="password" 
            id="apiKey"
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="输入您的API密钥"
          />
          <button onClick={handleSaveApiKey}>保存API密钥</button>
        </div>
      </div>
      
      <div className="account-info-section">
        <h2>账号信息</h2>
        {loading ? (
          <p>加载账号信息中...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : accountInfo ? (
          <div className="account-details">
            <div className="info-item">
              <span className="label">账号ID:</span>
              <span className="value">{accountInfo.id}</span>
            </div>
            
            <div className="info-item">
              <span className="label">账号级别:</span>
              <span 
                className="value tier" 
                style={{ color: getAccountTierColor(accountInfo.tier) }}
              >
                {getAccountTierDisplay(accountInfo.tier)}
              </span>
            </div>
            
            <div className="info-item">
              <span className="label">创建时间:</span>
              <span className="value">
                {new Date(accountInfo.created * 1000).toLocaleString()}
              </span>
            </div>
            
            {accountInfo.tier !== 'enterprise' && (
              <div className="upgrade-info">
                <h3>升级账号</h3>
                <p>
                  您当前是{getAccountTierDisplay(accountInfo.tier)}，
                  无法使用Claude 4模型。需要升级到企业账户才能使用该模型。
                </p>
                <button 
                  className="upgrade-button"
                  onClick={() => window.open('https://www.siliconflow.cn/pricing', '_blank')}
                >
                  升级账号
                </button>
              </div>
            )}
          </div>
        ) : (
          <p>请输入API密钥以查看账号信息</p>
        )}
      </div>
      
      <div className="model-access-section">
        <h2>模型访问权限</h2>
        <div className="model-access-table">
          <div className="table-header">
            <div className="model-name">模型</div>
            <div className="access-status">访问权限</div>
            <div className="required-tier">所需账号级别</div>
          </div>
          
          <div className="table-row">
            <div className="model-name">通义千问系列</div>
            <div className="access-status available">可用</div>
            <div className="required-tier">免费账户</div>
          </div>
          
          <div className="table-row">
            <div className="model-name">Claude 3 Haiku</div>
            <div className="access-status available">可用</div>
            <div className="required-tier">标准账户</div>
          </div>
          
          <div className="table-row">
            <div className="model-name">Claude 3 Sonnet</div>
            <div className="access-status">
              {accountInfo && ['standard', 'premium', 'enterprise'].includes(accountInfo.tier) 
                ? <span className="available">可用</span> 
                : <span className="unavailable">不可用</span>}
            </div>
            <div className="required-tier">标准账户</div>
          </div>
          
          <div className="table-row">
            <div className="model-name">Claude 3 Opus</div>
            <div className="access-status">
              {accountInfo && ['premium', 'enterprise'].includes(accountInfo.tier) 
                ? <span className="available">可用</span> 
                : <span className="unavailable">不可用</span>}
            </div>
            <div className="required-tier">高级账户</div>
          </div>
          
          <div className="table-row">
            <div className="model-name">Claude 4</div>
            <div className="access-status">
              {accountInfo && accountInfo.tier === 'enterprise' 
                ? <span className="available">可用</span> 
                : <span className="unavailable">不可用</span>}
            </div>
            <div className="required-tier">企业账户</div>
          </div>
        </div>
      </div>
      
      <div className="button-group">
        <button onClick={() => navigate('/')}>返回首页</button>
      </div>
    </div>
  );
};

export default AccountSettings; 