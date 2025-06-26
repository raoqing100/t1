import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccountInfo } from '../services/api';
import { getAgentConfigList, deleteAgentConfig, saveAgentConfig } from '../services/localStorage';
import debateGameConfig from '../config/debateGameConfig';
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
  
  // 智能体配置相关状态
  const [agentConfigs, setAgentConfigs] = useState([]);
  const [loadingConfigs, setLoadingConfigs] = useState(false);
  
  // 从本地存储加载API密钥
  useEffect(() => {
    const savedApiKey = localStorage.getItem('apiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // 加载智能体配置列表
  useEffect(() => {
    const loadAgentConfigs = () => {
      setLoadingConfigs(true);
      try {
        const configs = getAgentConfigList();
        
        // 检查是否存在默认典型配置和辩论博弈策略配置
        const hasDefaultConfig = configs.some(config => config.name === '典型配置');
        const hasDebateConfig = configs.some(config => config.name === '辩论博弈策略');
        
        // 如果没有默认配置，创建一个
        if (!hasDefaultConfig) {
          const defaultConfig = {
            name: '典型配置',
            description: '包含7个智慧协调角色的默认配置，适合大多数讨论场景',
            agents: [
              { 
                id: 'agent1', 
                name: '战略思维者', 
                role: '战略分析师', 
                apiKey: '', 
                model: 'deepseek-ai/DeepSeek-V3', 
                description: '专注于从宏观和长远角度分析问题，识别根本原因和深层结构，提出具有前瞻性的解决框架。'
              },
              { 
                id: 'agent2', 
                name: '创新催化者', 
                role: '创新专家', 
                apiKey: '', 
                model: 'Qwen/QwQ-32B', 
                description: '激发突破性思维，提出跳出框架的全新视角，挑战传统假设，启发逆向和侧向思维。'
              },
              { 
                id: 'agent3', 
                name: '严谨验证者', 
                role: '质量控制专家', 
                apiKey: '', 
                model: 'Qwen/Qwen2.5-72B-Instruct', 
                description: '确保讨论的准确性和严谨性，识别逻辑漏洞，要求提供具体数据和可验证的支撑材料。'
              },
              { 
                id: 'agent4', 
                name: '实践整合者', 
                role: '执行策略专家', 
                apiKey: '', 
                model: 'deepseek-ai/DeepSeek-V2.5', 
                description: '将理论转化为实践，评估方案可行性，设计具体实施路径，平衡理想与现实约束。'
              },
              { 
                id: 'agent5', 
                name: '协调整合者', 
                role: '共识建设专家', 
                apiKey: '', 
                model: 'Qwen/Qwen2.5-32B-Instruct', 
                description: '在分歧中寻找共同点，设计融合多方智慧的综合方案，化解冲突为合作。'
              },
              { 
                id: 'agent6', 
                name: '多元视角者', 
                role: '全局分析师', 
                apiKey: '', 
                model: 'THUDM/GLM-4-32B-0414', 
                description: '拓展讨论的广度和深度，从不同利益相关者角度分析，整合多重因素考量。'
              },
              { 
                id: 'agent7', 
                name: '价值引导者', 
                role: '伦理顾问', 
                apiKey: '', 
                model: 'Qwen/Qwen2.5-14B-Instruct', 
                description: '确保讨论符合正确价值导向，分析伦理影响，引导向更高层次价值目标发展。'
              }
            ]
          };
          
          // 保存默认配置
          const configId = saveAgentConfig(defaultConfig);
          if (configId) {
            console.log('默认典型配置已创建');
          }
        }

        // 如果没有辩论博弈策略配置，创建一个
        if (!hasDebateConfig) {
          const debateConfig = {
            name: debateGameConfig.name,
            description: debateGameConfig.description,
            agents: debateGameConfig.agents.map(agent => ({
              ...agent,
              apiKey: '' // 用户需要自己填入API密钥
            })),
            category: debateGameConfig.category,
            metadata: debateGameConfig.metadata
          };
          
          // 保存辩论博弈配置
          const debateConfigId = saveAgentConfig(debateConfig);
          if (debateConfigId) {
            console.log('辩论博弈策略配置已创建');
          }
        }

        // 重新获取配置列表
        const finalConfigs = getAgentConfigList();
        setAgentConfigs(finalConfigs);
      } catch (error) {
        console.error('加载智能体配置失败:', error);
      } finally {
        setLoadingConfigs(false);
      }
    };

    loadAgentConfigs();
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

  // 处理智能体配置相关操作
  const handleEditConfig = (configId) => {
    // 跳转到智能体配置页面，并传递配置ID
    navigate('/agent-config', { state: { loadConfigId: configId } });
  };

  const handleDeleteConfig = async (configId, configName) => {
    if (window.confirm(`确定要删除配置"${configName}"吗？此操作不可撤销。`)) {
      try {
        const success = deleteAgentConfig(configId);
        if (success) {
          // 重新加载配置列表
          const configs = getAgentConfigList();
          setAgentConfigs(configs);
          alert('配置删除成功');
        } else {
          alert('配置删除失败');
        }
      } catch (error) {
        console.error('删除配置失败:', error);
        alert('配置删除失败');
      }
    }
  };

  const handleCreateNewConfig = () => {
    navigate('/agent-config');
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

      <div className="agent-configs-section">
        <h2>已存智能体配置</h2>
        {loadingConfigs ? (
          <p>加载配置中...</p>
        ) : agentConfigs.length === 0 ? (
          <div className="no-configs">
            <p>暂无保存的智能体配置</p>
            <button 
              className="create-config-button"
              onClick={handleCreateNewConfig}
            >
              创建新配置
            </button>
          </div>
        ) : (
          <div className="configs-list">
            <div className="configs-header">
              <button 
                className="create-config-button"
                onClick={handleCreateNewConfig}
              >
                + 创建新配置
              </button>
            </div>
            
            <div className="configs-grid">
              {agentConfigs.map((config) => (
                <div key={config.id} className="config-card">
                  <div className="config-header">
                    <h3 className="config-name">{config.name}</h3>
                    <div className="config-actions">
                      <button 
                        className="edit-button"
                        onClick={() => handleEditConfig(config.id)}
                        title="编辑配置"
                      >
                        ✏️
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => handleDeleteConfig(config.id, config.name)}
                        title="删除配置"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  {config.description && (
                    <p className="config-description">{config.description}</p>
                  )}
                  
                  <div className="config-details">
                    <div className="detail-item">
                      <span className="detail-label">智能体数量:</span>
                      <span className="detail-value">{config.agents?.length || 0}个</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">创建时间:</span>
                      <span className="detail-value">
                        {new Date(config.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {config.updatedAt && config.updatedAt !== config.createdAt && (
                      <div className="detail-item">
                        <span className="detail-label">更新时间:</span>
                        <span className="detail-value">
                          {new Date(config.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="config-agents">
                    <h4>包含的智能体:</h4>
                    <div className="agents-list">
                      {config.agents?.map((agent, index) => (
                        <span key={index} className="agent-tag">
                          {agent.name} ({agent.role})
                        </span>
                      )) || <span className="no-agents">无智能体</span>}
                    </div>
                  </div>
                  
                  <button 
                    className="use-config-button"
                    onClick={() => handleEditConfig(config.id)}
                  >
                    编辑使用此配置
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="button-group">
        <button onClick={() => navigate('/')}>返回首页</button>
      </div>
    </div>
  );
};

export default AccountSettings; 