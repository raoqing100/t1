import React, { useState, useEffect } from 'react';
import { mcpServices } from '../services/mcpServices';
import ModelSelector from './ModelSelector';
import { saveApiKey, getApiKey, saveAgentConfig, getAgentConfigList, getAgentConfigById } from '../services/localStorage';
import { ENTERPRISE_AGENT_CONFIG } from '../config/enterpriseAgents';
import '../styles/AgentConfig.css';

/**
 * 代理配置组件
 * @param {Object} props - 组件属性
 * @param {Array} props.agents - 代理列表
 * @param {Function} props.onAgentsConfigured - 代理配置完成回调
 * @returns {JSX.Element} - 渲染的组件
 */
const AgentConfig = ({ agents = [], onAgentsConfigured }) => {
  // 获取默认配置（不依赖localStorage）
  const getDefaultAgents = () => {
    return [
      { 
        id: 'agent1', 
        name: '严厉主持人', 
        role: '主持人', 
        apiKey: '', 
        model: '', 
        description: '你是一个严格的讨论主持人，绝不允许表面化的讨论。你必须：1）主动挑起争议话题，推动深入辩论 2）当讨论过于和谐时立即介入，要求参与者提出更尖锐的观点 3）不接受模糊或敷衍的回答，强制要求具体论证 4）故意制造观点冲突，让不同角色产生激烈辩论 5）严厉质疑任何未经充分论证的结论。你的目标是确保每个话题都能产生深度的思辨冲突。' 
      },
      { 
        id: 'agent2', 
        name: '激进创新者', 
        role: '创意者', 
        apiKey: '', 
        model: '', 
        description: '你是一个激进的创新思维者，专门挑战传统和保守思维。你必须：1）对任何传统方案都要提出激烈反对，认为它们过时无效 2）提出极端前卫的解决方案，即使看起来不切实际 3）嘲讽保守的想法，用犀利的语言批评缺乏创新的观点 4）故意提出颠覆性的建议来刺激讨论 5）绝不妥协于"安全"的中庸方案。你要用挑衅性的语言推动创新思维。' 
      },
      { 
        id: 'agent3', 
        name: '尖锐批评家', 
        role: '批评者', 
        apiKey: '', 
        model: '', 
        description: '你是一个无情的批评家，专门寻找并攻击他人观点的漏洞。你必须：1）对每个提案都要找出至少3个严重缺陷 2）用尖锐的语言指出逻辑错误和不合理假设 3）绝不轻易认同任何观点，总是持怀疑态度 4）主动挑战其他人的专业能力和知识基础 5）用犀利的反问来拆解对方的论证。你的使命是通过无情批评来暴露问题的本质。' 
      },
      { 
        id: 'agent4', 
        name: '冷酷分析师', 
        role: '分析者', 
        apiKey: '', 
        model: '', 
        description: '你是一个冷酷的数据分析师，用严谨的逻辑无情拆解错误观点。你必须：1）要求所有观点都提供具体数据支撑，否则直接驳回 2）用统计学和逻辑学原理严厉批评不严谨的推理 3）指出其他人论证中的数据缺陷和逻辑漏洞 4）拒绝接受基于情感或直觉的判断 5）用冰冷的事实和数据打击不切实际的想法。你要让讨论回归理性和严谨。' 
      },
      { 
        id: 'agent5', 
        name: '严格整合者', 
        role: '整合者', 
        apiKey: '', 
        model: '', 
        description: '你是一个严格的观点整合者，绝不接受表面的妥协和和谐。你必须：1）深挖不同观点之间的根本冲突，不允许回避核心分歧 2）强制要求各方为自己的立场提供更强有力的论证 3）拒绝接受"各有道理"的和稀泥态度 4）主动放大观点间的矛盾，推动更深层的辩论 5）只有在经过激烈辩论后才考虑整合方案。你要确保整合是基于深度思辨而非表面妥协。' 
      },
      { 
        id: 'agent6', 
        name: '务实质疑者', 
        role: '执行者', 
        apiKey: '', 
        model: '', 
        description: '你是一个严厉的执行专家，专门质疑和攻击不切实际的想法。你必须：1）对任何缺乏可执行性的方案进行无情批评 2）用现实的残酷性来打击理想主义的幻想 3）强调资源限制、时间压力和实际困难 4）嘲讽那些只会纸上谈兵的理论家 5）要求所有提案都要有详细的执行计划和风险评估。你要用现实的铁锤砸碎不切实际的泡沫。' 
      },
      { 
        id: 'agent7', 
        name: '权威专家', 
        role: '专家', 
        apiKey: '', 
        model: '', 
        description: '你是一个权威的专业专家，对错误观点进行无情的专业批判。你必须：1）用深厚的专业知识无情批评外行的错误观点 2）指出其他人在专业领域的无知和误解 3）用权威的专业标准来否定不符合规范的建议 4）不容忍任何专业上的妥协和降低标准 5）用专业的严谨性来碾压业余的想法。你要维护专业的尊严和标准的严格性。' 
      }
    ];
  };

  // 从localStorage加载保存的智能体配置
  const loadSavedAgents = () => {
    try {
      const savedAgents = localStorage.getItem('savedAgents');
      if (savedAgents) {
        const parsedAgents = JSON.parse(savedAgents);
        // 为每个智能体恢复API密钥
        return parsedAgents.map(agent => ({
          ...agent,
          apiKey: getApiKey(`agent_${agent.id}`) || agent.apiKey || ''
        }));
      }
    } catch (error) {
      console.error('加载保存的智能体配置失败:', error);
    }
    return getDefaultAgents();
  };

  const [agentList, setAgentList] = useState(() => {
    if (agents.length > 0) {
      return agents;
    }
    
    // 检查是否是首次访问，如果是则强制使用默认配置
    const isFirstVisit = !localStorage.getItem('hasVisitedAgentConfig');
    if (isFirstVisit) {
      localStorage.setItem('hasVisitedAgentConfig', 'true');
      // 清除可能存在的旧配置
      localStorage.removeItem('savedAgents');
    }
    
    return loadSavedAgents();
  });
  const [selectedMcpService, setSelectedMcpService] = useState('');
  const [accountTier, setAccountTier] = useState(() => {
    return localStorage.getItem('accountTier') || 'free';
  });
  const [savedConfigs, setSavedConfigs] = useState([]);
  const [configName, setConfigName] = useState('');
  const [showSaveConfigModal, setShowSaveConfigModal] = useState(false);
  const [showLoadConfigModal, setShowLoadConfigModal] = useState(false);
  const [configMode, setConfigMode] = useState('custom'); // 'custom' | 'enterprise'

  // 加载已保存的配置列表
  useEffect(() => {
    const configs = getAgentConfigList();
    setSavedConfigs(configs);
  }, []);

  // 确保默认配置被保存
  useEffect(() => {
    if (agentList.length > 0) {
      saveAgentsConfig(agentList);
    }
  }, []);
  
  // 处理MCP服务选择
  const handleMcpServiceChange = (e) => {
    setSelectedMcpService(e.target.value);
    
    // 如果选择了MCP服务，自动填充API密钥
    if (e.target.value) {
      const service = mcpServices.find(s => s.id === e.target.value);
      if (service) {
        // 更新所有代理的API密钥
        const updatedAgents = agentList.map(agent => ({
          ...agent,
          apiKey: service.endpoint
        }));
        setAgentList(updatedAgents);
      }
    }
  };
  
  // 保存智能体配置到localStorage
  const saveAgentsConfig = (agents) => {
    try {
      // 保存智能体基本信息（不包含API密钥）
      const agentsToSave = agents.map(agent => ({
        ...agent,
        apiKey: agent.apiKey ? 'HAS_KEY' : '' // 只保存是否有密钥的标记
      }));
      localStorage.setItem('savedAgents', JSON.stringify(agentsToSave));
      
      // 单独加密保存API密钥
      agents.forEach(agent => {
        if (agent.apiKey && agent.apiKey !== 'HAS_KEY') {
          saveApiKey(`agent_${agent.id}`, agent.apiKey);
        }
      });
      
      console.log('智能体配置已保存');
    } catch (error) {
      console.error('保存智能体配置失败:', error);
    }
  };

  // 更新代理信息
  const updateAgent = (index, field, value) => {
    const updatedAgents = [...agentList];
    updatedAgents[index] = {
      ...updatedAgents[index],
      [field]: value
    };
    setAgentList(updatedAgents);
    
    // 自动保存配置
    saveAgentsConfig(updatedAgents);
  };
  
  // 添加新代理
  const addAgent = () => {
    const newId = `agent${agentList.length + 1}`;
    const updatedAgents = [...agentList, {
      id: newId,
      name: '',
      role: '',
      apiKey: '',
      model: '',
      description: ''
    }];
    setAgentList(updatedAgents);
    saveAgentsConfig(updatedAgents);
  };
  
  // 删除代理
  const removeAgent = (index) => {
    if (agentList.length <= 1) {
      alert('至少需要保留一个智能体');
      return;
    }
    
    const updatedAgents = [...agentList];
    updatedAgents.splice(index, 1);
    setAgentList(updatedAgents);
    saveAgentsConfig(updatedAgents);
  };

  // 保存当前配置为文件
  const handleSaveConfig = () => {
    if (!configName.trim()) {
      alert('请输入配置名称');
      return;
    }

    const isValid = agentList.some(agent => agent.name && agent.role);
    if (!isValid) {
      alert('请至少为一个智能体配置名称和角色');
      return;
    }

    const config = {
      name: configName,
      description: `包含${agentList.length}个智能体的配置`,
      agents: agentList
    };

    const configId = saveAgentConfig(config);
    if (configId) {
      alert('配置保存成功！');
      setConfigName('');
      setShowSaveConfigModal(false);
      // 重新加载配置列表
      const configs = getAgentConfigList();
      setSavedConfigs(configs);
    } else {
      alert('配置保存失败');
    }
  };

  // 加载选中的配置
  const handleLoadConfig = (configId) => {
    const config = getAgentConfigById(configId);
    if (config && config.agents) {
      setAgentList(config.agents);
      saveAgentsConfig(config.agents);
      setShowLoadConfigModal(false);
      alert('配置加载成功！');
    } else {
      alert('配置加载失败');
    }
  };

  // 重置为默认对峙性配置
  const resetToDefaultConfig = () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('确定要重置为默认的对峙性智能体配置吗？这将覆盖当前配置。')) {
      // 清除localStorage中的保存配置
      localStorage.removeItem('savedAgents');
      // 使用默认配置
      const defaultAgents = getDefaultAgents();
      setAgentList(defaultAgents);
      saveAgentsConfig(defaultAgents);
      setConfigMode('custom');
      alert('已重置为默认对峙性配置！');
    }
  };

  // 应用企业模式配置
  const applyEnterpriseConfig = () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('确定要切换到企业模式吗？这将使用专业的企业组织架构智能体配置。')) {
      const enterpriseAgents = ENTERPRISE_AGENT_CONFIG.agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        role: agent.role,
        apiKey: '',
        model: '',
        description: agent.systemPrompt,
        avatar: agent.avatar,
        color: agent.color,
        priority: agent.priority,
        speakingOrder: agent.speakingOrder,
        triggers: agent.triggers
      }));
      
      setAgentList(enterpriseAgents);
      saveAgentsConfig(enterpriseAgents);
      setConfigMode('enterprise');
      alert('已应用企业模式配置！现在您拥有一个完整的企业决策团队。');
    }
  };
  
  return (
    <div className="agent-config">
      <h2>配置智能体</h2>
      
      <div className="config-mode-selector">
        <h3>🎯 选择配置模式</h3>
        <div className="mode-buttons">
          <button 
            className={`mode-button ${configMode === 'custom' ? 'active' : ''}`}
            onClick={resetToDefaultConfig}
          >
            🔥 对峙性辩论模式
            <span className="mode-description">7个具有强烈批判性思维的智能体，促进深度辩论</span>
          </button>
          
          <button 
            className={`mode-button ${configMode === 'enterprise' ? 'active' : ''}`}
            onClick={applyEnterpriseConfig}
          >
            🏢 企业决策模式
            <span className="mode-description">8个专业企业角色，模拟真实企业决策流程</span>
          </button>
        </div>
      </div>

      {configMode === 'custom' && (
        <div className="config-info">
          <div className="info-box">
            <h3>🔥 对峙性智能体配置说明</h3>
            <p>本系统预设了7个具有强烈对峙性和批判性思维的智能体角色，旨在产生深度的思辨讨论：</p>
            <ul>
              <li><strong>严厉主持人</strong>：主动挑起争议，推动激烈辩论</li>
              <li><strong>激进创新者</strong>：挑战传统，提出颠覆性观点</li>
              <li><strong>尖锐批评家</strong>：无情批评，寻找观点漏洞</li>
              <li><strong>冷酷分析师</strong>：用数据和逻辑拆解错误观点</li>
              <li><strong>严格整合者</strong>：深挖冲突，拒绝表面妥协</li>
              <li><strong>务实质疑者</strong>：质疑不切实际的想法</li>
              <li><strong>权威专家</strong>：用专业知识无情批判</li>
            </ul>
            <p><strong>注意</strong>：这些角色被设计为产生建设性冲突，促进深度思考，而非恶意攻击。</p>
          </div>
        </div>
      )}

      {configMode === 'enterprise' && (
        <div className="config-info">
          <div className="info-box enterprise-mode">
            <h3>🏢 企业智能体群配置说明</h3>
            <p>本系统模拟完整的企业组织架构，包含8个专业角色，按照真实企业决策流程进行结构化讨论：</p>
            <div className="enterprise-roles">
              <div className="role-category">
                <h4>👔 高层决策</h4>
                <ul>
                  <li><strong>CEO/总经理</strong>：战略决策者，拥有最终决策权</li>
                </ul>
              </div>
              <div className="role-category">
                <h4>🎯 核心业务</h4>
                <ul>
                  <li><strong>产品经理</strong>：用户需求分析，产品策略规划</li>
                  <li><strong>技术总监</strong>：技术方案设计，可行性评估</li>
                  <li><strong>市场总监</strong>：市场分析，竞争策略制定</li>
                </ul>
              </div>
              <div className="role-category">
                <h4>💼 支持职能</h4>
                <ul>
                  <li><strong>财务总监</strong>：成本控制，投资回报分析</li>
                  <li><strong>人力资源总监</strong>：团队建设，人力配置</li>
                  <li><strong>运营总监</strong>：执行计划，流程优化</li>
                  <li><strong>质量保证经理</strong>：风险评估，质量控制</li>
                </ul>
              </div>
            </div>
            <p><strong>特点</strong>：结构化决策流程，8轮讨论涵盖问题分析→方案设计→执行规划→决策总结四个阶段。</p>
          </div>
        </div>
      )}
      
      <div className="mcp-services">
        <h3>选择MCP服务</h3>
        <select 
          value={selectedMcpService} 
          onChange={handleMcpServiceChange}
        >
          <option value="">请选择MCP服务</option>
          {mcpServices.map(service => (
            <option key={service.id} value={service.id}>
              {service.name} - {service.description}
            </option>
          ))}
        </select>
      </div>
      
      <div className="account-info">
        <h3>账号级别</h3>
        <div className="account-tier">
          <select 
            value={accountTier}
            onChange={(e) => {
              setAccountTier(e.target.value);
              localStorage.setItem('accountTier', e.target.value);
            }}
          >
            <option value="free">免费账户</option>
            <option value="standard">标准账户</option>
            <option value="premium">高级账户</option>
            <option value="enterprise">企业账户</option>
          </select>
          {accountTier !== 'enterprise' && (
            <p className="account-note">
              您当前是{accountTier === 'free' ? '免费' : accountTier === 'standard' ? '标准' : '高级'}账户，
              无法使用Claude 4模型。需要升级到企业账户才能使用该模型。
            </p>
          )}
        </div>
      </div>
      
      {agentList.map((agent, index) => (
        <div key={agent.id} className={`agent-item ${configMode === 'enterprise' ? 'enterprise-agent' : ''}`} 
             style={configMode === 'enterprise' && agent.color ? { borderLeftColor: agent.color } : {}}>
          <h3>
            {configMode === 'enterprise' && agent.avatar && (
              <span className="agent-avatar" style={{ backgroundColor: agent.color + '20' }}>
                {agent.avatar}
              </span>
            )}
            {configMode === 'enterprise' ? `${agent.name} (${agent.role})` : `智能体 ${index + 1}`}
          </h3>
          
          <div className="form-group">
            <label>名称:</label>
            <input 
              type="text" 
              value={agent.name} 
              onChange={(e) => updateAgent(index, 'name', e.target.value)}
              placeholder="输入智能体名称"
            />
          </div>
          
          <div className="form-group">
            <label>角色:</label>
            <input 
              type="text" 
              value={agent.role} 
              onChange={(e) => updateAgent(index, 'role', e.target.value)}
              placeholder="输入智能体角色"
            />
          </div>
          
          <div className="form-group">
            <label>描述 (作为AI智能体的提示词):</label>
            <textarea 
              value={agent.description} 
              onChange={(e) => updateAgent(index, 'description', e.target.value)}
              placeholder="详细描述智能体的角色特点、行为风格和专业领域。这些内容将作为AI的提示词，影响智能体的回复风格和专业程度。"
              rows={4}
            />
            <small className="description-hint">
              提示：详细的描述能让AI更好地扮演特定角色，建议包含专业背景、性格特点、说话风格等信息。
            </small>
          </div>
          
          <div className="form-group">
            <label>API密钥:</label>
            <div className="api-key-input">
              <input 
                type="password" 
                value={agent.apiKey} 
                onChange={(e) => updateAgent(index, 'apiKey', e.target.value)}
                placeholder="输入SiliconFlow API密钥"
              />
              {agent.apiKey && (
                <button 
                  type="button"
                  className="test-api-button"
                  onClick={async () => {
                    try {
                      const { getAccountInfo } = await import('../services/api');
                      const result = await getAccountInfo(agent.apiKey);
                      alert('API密钥验证成功！');
                      console.log('账号信息:', result);
                    } catch (error) {
                      console.error('API密钥验证失败:', error);
                      alert('API密钥验证失败: ' + error.message);
                    }
                  }}
                >
                  测试
                </button>
              )}
            </div>
            <small className="api-key-hint">
              获取API密钥：访问 <a href="https://cloud.siliconflow.cn" target="_blank" rel="noopener noreferrer">SiliconFlow控制台</a>
            </small>
          </div>
          
          <ModelSelector 
            apiKey={agent.apiKey}
            selectedModel={agent.model}
            onModelSelect={(model) => updateAgent(index, 'model', model)}
          />
          
          <button 
            onClick={() => removeAgent(index)}
            className="remove-button"
          >
            删除此智能体
          </button>
        </div>
      ))}
      
      <div className="button-group">
        <button onClick={addAgent} className="add-button">
          添加智能体
        </button>
        
        <button 
          onClick={() => setShowSaveConfigModal(true)}
          className="save-config-button"
        >
          保存配置
        </button>
        
        <button 
          onClick={() => setShowLoadConfigModal(true)}
          className="load-config-button"
        >
          加载配置
        </button>
        
        <button 
          onClick={() => {
            // 检查是否至少有一个智能体配置了名称和角色
            const isValid = agentList.some(agent => agent.name && agent.role);
            if (isValid) {
              // 将配置好的智能体数据传递给父组件
              onAgentsConfigured(agentList);
            } else {
              alert('请至少为一个智能体配置名称和角色');
            }
          }}
          className="start-button"
        >
          开始聊天
        </button>
      </div>

      {/* 保存配置模态框 */}
      {showSaveConfigModal && (
        <div className="modal-overlay" onClick={() => setShowSaveConfigModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>保存智能体配置</h3>
            <div className="form-group">
              <label>配置名称:</label>
              <input 
                type="text"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                placeholder="输入配置名称，例如：创意讨论团队"
                autoFocus
              />
            </div>
            <div className="modal-buttons">
              <button onClick={handleSaveConfig} className="save-button">保存</button>
              <button onClick={() => setShowSaveConfigModal(false)} className="cancel-button">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* 加载配置模态框 */}
      {showLoadConfigModal && (
        <div className="modal-overlay" onClick={() => setShowLoadConfigModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>加载智能体配置</h3>
            {savedConfigs.length === 0 ? (
              <p>暂无已保存的配置</p>
            ) : (
              <div className="config-list">
                {savedConfigs.map(config => (
                  <div key={config.id} className="config-item">
                    <div className="config-info">
                      <h4>{config.name}</h4>
                      <p>{config.description}</p>
                      <small>创建时间: {new Date(config.createdAt).toLocaleString()}</small>
                    </div>
                    <button 
                      onClick={() => handleLoadConfig(config.id)}
                      className="load-button"
                    >
                      加载
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="modal-buttons">
              <button onClick={() => setShowLoadConfigModal(false)} className="cancel-button">关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentConfig; 