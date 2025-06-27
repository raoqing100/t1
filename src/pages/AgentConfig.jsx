import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { theme } from '../styles/theme';
import { agentConfigStorage, moderatorConfigStorage } from '../services/localStorage';
import { getAgentConfigById, saveAgentConfig } from '../services/localStorage';
import DebateGameConfig from '../components/DebateGameConfig';

// 预设的角色模板
const roleTemplates = {
  brainstorm: [
    { 
      id: 1, 
      name: '主持人', 
      role: '主持人', 
      apiKey: '', 
      description: '你是一个严格的主持人，不满足于表面的讨论。你要推动深入的辩论，当讨论过于和谐时主动挑起争议，提出尖锐的问题，确保每个观点都经过充分的质疑和检验。' 
    },
    { 
      id: 2, 
      name: '创意家', 
      role: '创意者', 
      apiKey: '', 
      description: '你是一个激进的创新者，对传统方案和保守思维毫不留情。你要大胆质疑现状，提出颠覆性的想法，挑战其他人的思维局限，推动讨论突破常规框架。' 
    },
    { 
      id: 3, 
      name: '批评家', 
      role: '批评者', 
      apiKey: '', 
      description: '你是一个尖锐的批评者，专门寻找其他观点的漏洞和问题。你要毫不客气地指出方案的缺陷，质疑不充分的论证，要求提供更多证据，绝不轻易认同任何观点。' 
    },
    { 
      id: 4, 
      name: '整合者', 
      role: '整合者', 
      apiKey: '', 
      description: '你是一个严格的整合者，不接受表面的妥协。你要深入挖掘观点冲突的根源，质疑虚假的一致性，推动各方进行更深入的辩论，直到找到真正经得起考验的解决方案。' 
    },
    { 
      id: 5, 
      name: '分析师', 
      role: '分析师', 
      apiKey: '', 
      description: '你是一个严谨的数据分析师，用逻辑和证据无情地拆解其他人的观点。你要指出论证中的逻辑错误，质疑缺乏数据支持的结论，推动讨论更加理性和严谨。' 
    }
  ],
  debate: [
    { 
      id: 1, 
      name: '主持人', 
      role: '主持人', 
      apiKey: '', 
      description: '你是一个犀利的辩论主持人，要推动激烈的思辨。当辩论不够深入时，你要提出更尖锐的问题，挑战双方的论点，确保辩论达到足够的深度和强度。' 
    },
    { 
      id: 2, 
      name: '正方辩手', 
      role: '创意者', 
      apiKey: '', 
      description: '你是正方的强力辩手，要全力为你的立场辩护。你要积极攻击反方的观点，寻找对方论证的漏洞，提出有力的反驳，绝不轻易让步。' 
    },
    { 
      id: 3, 
      name: '反方辩手', 
      role: '批评者', 
      apiKey: '', 
      description: '你是反方的犀利辩手，要无情地拆解正方的论点。你要指出对方观点的错误和不足，提出强有力的反驳证据，坚决维护你的立场。' 
    },
    { 
      id: 4, 
      name: '评判员', 
      role: '分析师', 
      apiKey: '', 
      description: '你是一个严格的评判员，要客观而尖锐地分析双方论点。你不会轻易满意任何一方的表现，要指出双方论证的不足，推动更高质量的辩论。' 
    }
  ],
  expert: [
    { 
      id: 1, 
      name: '技术专家', 
      role: '专家', 
      apiKey: '', 
      description: '你是技术领域的权威专家，对技术细节要求极其严格。你要用专业知识质疑不准确的技术观点，指出外行的错误理解，推动讨论达到专业水准。' 
    },
    { 
      id: 2, 
      name: '商业分析师', 
      role: '分析师', 
      apiKey: '', 
      description: '你是商业领域的资深分析师，对商业逻辑和市场分析极其严谨。你要质疑不切实际的商业计划，用数据和案例反驳错误的商业判断。' 
    },
    { 
      id: 3, 
      name: '风险评估师', 
      role: '批评者', 
      apiKey: '', 
      description: '你是专业的风险评估师，专门识别和放大潜在风险。你要毫不留情地指出方案中的风险点，质疑过于乐观的预期，要求更全面的风险防控措施。' 
    },
    { 
      id: 4, 
      name: '执行顾问', 
      role: '执行者', 
      apiKey: '', 
      description: '你是实战经验丰富的执行顾问，对执行细节要求极高。你要质疑不切实际的执行方案，指出实施中的困难和障碍，推动更务实的解决方案。' 
    }
  ]
};

export default function AgentConfig({ onAgentsConfigured }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 默认加载对峙性智能体配置
  const [agents, setAgents] = useState([
    { 
      id: 1, 
      name: '主持人', 
      role: '主持人', 
      apiKey: '', 
      description: '你是一个严格的主持人，不满足于表面的讨论。你要推动深入的辩论，当讨论过于和谐时主动挑起争议，提出尖锐的问题，确保每个观点都经过充分的质疑和检验。' 
    },
    { 
      id: 2, 
      name: '创意家', 
      role: '创意者', 
      apiKey: '', 
      description: '你是一个激进的创新者，对传统方案和保守思维毫不留情。你要大胆质疑现状，提出颠覆性的想法，挑战其他人的思维局限，推动讨论突破常规框架。' 
    },
    { 
      id: 3, 
      name: '批评家', 
      role: '批评者', 
      apiKey: '', 
      description: '你是一个尖锐的批评者，专门寻找其他观点的漏洞和问题。你要毫不客气地指出方案的缺陷，质疑不充分的论证，要求提供更多证据，绝不轻易认同任何观点。' 
    },
    { 
      id: 4, 
      name: '分析师', 
      role: '分析师', 
      apiKey: '', 
      description: '你是一个严谨的数据分析师，用逻辑和证据无情地拆解其他人的观点。你要指出论证中的逻辑错误，质疑缺乏数据支持的结论，推动讨论更加理性和严谨。' 
    },
    { 
      id: 5, 
      name: '整合者', 
      role: '整合者', 
      apiKey: '', 
      description: '你是一个严格的整合者，不接受表面的妥协。你要深入挖掘观点冲突的根源，质疑虚假的一致性，推动各方进行更深入的辩论，直到找到真正经得起考验的解决方案。' 
    },
    { 
      id: 6, 
      name: '执行者', 
      role: '执行者', 
      apiKey: '', 
      description: '你是一个注重实践的执行者，质疑不切实际的想法和方案。你要指出执行中的困难和障碍，要求提供具体的实施细节，挑战过于理想化的观点，推动讨论更加务实和可行。' 
    },
    { 
      id: 7, 
      name: '专家', 
      role: '专家', 
      apiKey: '', 
      description: '你是该领域的权威专家，用专业知识无情批判错误观点。你要指出其他人认知上的盲点和错误，提出更专业、更深入的见解，不容忍外行的错误理解，推动讨论达到专业水准。' 
    }
  ]);
  
  const [showTemplates, setShowTemplates] = useState(false);
  const [showModeratorConfig, setShowModeratorConfig] = useState(false);
  const [showDebateGameConfig, setShowDebateGameConfig] = useState(false);
  const [moderatorConfig, setModeratorConfig] = useState(moderatorConfigStorage.getModeratorConfig());
  const [configMode, setConfigMode] = useState('smart'); // 配置模式：smart, enterprise, debate
  
  // 配置管理相关状态
  const [currentConfigId, setCurrentConfigId] = useState(null);
  const [configName, setConfigName] = useState('');
  const [configDescription, setConfigDescription] = useState('');
  
  // 角色图标映射
  const roleIcons = {
    '主持人': '👨‍💼',
    '创意者': '💡',
    '批评者': '🔍',
    '整合者': '🔄',
    '分析师': '📊',
    '执行者': '🛠️',
    '协调者': '🤝',
    '专家': '🧠',
    '记录者': '📝',
    '其他': '👤'
  };

  const handleChange = (id, field, value) => {
    setAgents(agents.map(agent => 
      agent.id === id ? {...agent, [field]: value} : agent
    ));
  };

  // 处理主持人配置变更
  const handleModeratorConfigChange = (field, value) => {
    const newConfig = { ...moderatorConfig, [field]: value };
    setModeratorConfig(newConfig);
    moderatorConfigStorage.saveModeratorConfig(newConfig);
  };

  // 处理配置模式切换
  const handleModeChange = (mode) => {
    setConfigMode(mode);
    
    if (mode === 'smart') {
      // 智慧协调模式
      const smartAgents = [
        { id: 1, name: '战略分析师', role: '分析师', apiKey: '', description: '专注于战略思考和趋势分析，提供前瞻性洞察' },
        { id: 2, name: '创新专家', role: '创意者', apiKey: '', description: '推动创新思维，提出突破性想法和解决方案' },
        { id: 3, name: '实务专家', role: '执行者', apiKey: '', description: '关注可执行性，提供务实的实施建议' },
        { id: 4, name: '协调员', role: '协调者', apiKey: '', description: '促进团队合作，整合不同观点达成共识' },
        { id: 5, name: '质量监督', role: '批评者', apiKey: '', description: '确保方案质量，指出潜在问题和改进点' },
        { id: 6, name: '记录员', role: '记录者', apiKey: '', description: '记录讨论要点，整理总结关键信息' },
        { id: 7, name: '主持人', role: '主持人', apiKey: '', description: '引导讨论进程，确保讨论高效有序进行' }
      ];
      setAgents(smartAgents);
      setConfigName('智慧协调团队');
      setConfigDescription('7个智慧协调的智能体角色，通过建设性协调实现深度思维融合');
    } else if (mode === 'enterprise') {
      // 企业决策模式
      const enterpriseAgents = [
        { id: 1, name: 'CEO', role: '主持人', apiKey: '', description: '企业最高决策者，负责战略方向和最终决策' },
        { id: 2, name: 'CTO', role: '专家', apiKey: '', description: '技术领导者，负责技术战略和创新驱动' },
        { id: 3, name: 'CFO', role: '分析师', apiKey: '', description: '财务专家，负责资金规划和风险控制' },
        { id: 4, name: 'CMO', role: '创意者', apiKey: '', description: '营销领导者，负责品牌建设和市场影响力' },
        { id: 5, name: 'COO', role: '执行者', apiKey: '', description: '运营核心，负责日常运营和流程优化' },
        { id: 6, name: '产品总监', role: '协调者', apiKey: '', description: '产品策略专家，负责产品全生命周期管理' },
        { id: 7, name: 'CHRO', role: '其他', apiKey: '', description: '人力资源专家，负责人才管理和组织发展' },
        { id: 8, name: '法务总监', role: '批评者', apiKey: '', description: '法律风险专家，负责合规和风险防范' }
      ];
      setAgents(enterpriseAgents);
      setConfigName('企业决策团队');
      setConfigDescription('8个企业高管角色，模拟真实企业高管团队决策过程');
    } else if (mode === 'debate') {
      // 辩论博弈模式
      const debateAgents = [
        { id: 1, name: '激进先锋', role: '创意者', apiKey: '', description: '激进的变革推动者，质疑传统，追求突破性创新。不满足于渐进式改良，主张颠覆性变革。' },
        { id: 2, name: '稳健卫士', role: '批评者', apiKey: '', description: '坚定的传统价值守护者，重视稳定性和延续性。相信渐进式改进胜过激进变革。' },
        { id: 3, name: '逻辑大师', role: '分析师', apiKey: '', description: '坚持数据驱动的理性分析师，要求一切观点都有充分的事实和逻辑支撑。' },
        { id: 4, name: '人文关怀者', role: '协调者', apiKey: '', description: '关注人性和情感因素的人文主义者，强调决策对人的影响。' },
        { id: 5, name: '实战专家', role: '执行者', apiKey: '', description: '关注实际执行的务实派，重视可操作性、成本控制和实际效果。' },
        { id: 6, name: '质疑大师', role: '专家', apiKey: '', description: '专业的魔鬼代言人，善于发现任何方案的漏洞和问题。' }
      ];
      setAgents(debateAgents);
      setConfigName('辩论博弈模式');
      setConfigDescription('6个立场鲜明的对立角色进行激烈辩论，推动深度思考和全面认知');
    }
  };

  // 处理辩论博弈策略配置加载（保留兼容性）
  const handleDebateGameConfigLoad = (debateConfig) => {
    handleModeChange('debate');
  };

  // 保存智能体配置
  const saveAgentConfigs = () => {
    agents.forEach(agent => {
      if (agent.name && agent.role) {
        agentConfigStorage.saveAgentConfig(agent.id, agent);
      }
    });
    alert('智能体配置已保存！');
  };

  // 保存完整配置
  const saveCompleteConfig = () => {
    if (!configName.trim()) {
      alert('请输入配置名称！');
      return;
    }

    const configToSave = {
      id: currentConfigId || `config_${Date.now()}`,
      name: configName.trim(),
      description: configDescription.trim(),
      agents: agents,
      createdAt: currentConfigId ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const savedId = saveAgentConfig(configToSave);
    if (savedId) {
      setCurrentConfigId(savedId);
      alert(currentConfigId ? '配置更新成功！' : '配置保存成功！');
    } else {
      alert('配置保存失败');
    }
  };

  // 首先处理URL参数（优先级最高）
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const modeParam = urlParams.get('mode');
    
    console.log('🔍 AgentConfig URL检查:', {
      search: location.search,
      modeParam: modeParam,
      currentConfigMode: configMode
    });
    
    if (modeParam === 'debate') {
      console.log('🔥 从URL参数强制加载辩论博弈模式');
      setConfigMode('debate');
      // 直接设置辩论博弈模式的智能体
      const debateAgents = [
        { id: 1, name: '激进先锋', role: '创意者', apiKey: '', description: '激进的变革推动者，质疑传统，追求突破性创新。不满足于渐进式改良，主张颠覆性变革。' },
        { id: 2, name: '稳健卫士', role: '批评者', apiKey: '', description: '坚定的传统价值守护者，重视稳定性和延续性。相信渐进式改进胜过激进变革。' },
        { id: 3, name: '逻辑大师', role: '分析师', apiKey: '', description: '坚持数据驱动的理性分析师，要求一切观点都有充分的事实和逻辑支撑。' },
        { id: 4, name: '人文关怀者', role: '协调者', apiKey: '', description: '关注人性和情感因素的人文主义者，强调决策对人的影响。' },
        { id: 5, name: '实战专家', role: '执行者', apiKey: '', description: '关注实际执行的务实派，重视可操作性、成本控制和实际效果。' },
        { id: 6, name: '质疑大师', role: '专家', apiKey: '', description: '专业的魔鬼代言人，善于发现任何方案的漏洞和问题。' }
      ];
      setAgents(debateAgents);
      setConfigName('辩论博弈模式');
      setConfigDescription('6个立场鲜明的对立角色进行激烈辩论，推动深度思考和全面认知');
    } else if (modeParam === 'enterprise') {
      console.log('🏢 从URL参数加载企业决策模式');
      setConfigMode('enterprise');
      handleModeChange('enterprise');
    } else if (modeParam === 'smart') {
      console.log('🧠 从URL参数加载智慧协调模式');
      setConfigMode('smart');
      handleModeChange('smart');
    }
  }, [location.search]);

  // 检查是否需要加载特定配置
  useEffect(() => {
    const loadConfigId = location.state?.loadConfigId;
    if (loadConfigId) {
      const config = getAgentConfigById(loadConfigId);
      if (config) {
        setCurrentConfigId(config.id);
        setConfigName(config.name);
        setConfigDescription(config.description || '');
        setAgents(config.agents || []);
        console.log('已加载配置:', config.name);
      } else {
        console.error('未找到指定的配置:', loadConfigId);
      }
    }
  }, [location.state]);

  // 加载已保存的智能体配置
  useEffect(() => {
    const savedConfigs = agentConfigStorage.getAllAgentConfigs();
    if (Object.keys(savedConfigs).length > 0) {
      // 如果有保存的配置，可以选择性地加载
      console.log('发现已保存的配置:', savedConfigs);
    }
  }, []);
  
  // 获取角色对应的图标
  const getRoleIcon = (role) => {
    return roleIcons[role] || roleIcons['其他'];
  };

  const addAgent = () => {
    const newId = Math.max(...agents.map(a => a.id), 0) + 1;
    setAgents([...agents, { id: newId, name: '', role: '', apiKey: '', description: '' }]);
  };

  const removeAgent = (id) => {
    if (agents.length > 1) {
      setAgents(agents.filter(agent => agent.id !== id));
    }
  };

  // 默认对峙性配置
  const defaultAgents = [
    { 
      id: 1, 
      name: '主持人', 
      role: '主持人', 
      apiKey: '', 
      description: '你是一个严格的主持人，不满足于表面的讨论。你要推动深入的辩论，当讨论过于和谐时主动挑起争议，提出尖锐的问题，确保每个观点都经过充分的质疑和检验。' 
    },
    { 
      id: 2, 
      name: '创意家', 
      role: '创意者', 
      apiKey: '', 
      description: '你是一个激进的创新者，对传统方案和保守思维毫不留情。你要大胆质疑现状，提出颠覆性的想法，挑战其他人的思维局限，推动讨论突破常规框架。' 
    },
    { 
      id: 3, 
      name: '批评家', 
      role: '批评者', 
      apiKey: '', 
      description: '你是一个尖锐的批评者，专门寻找其他观点的漏洞和问题。你要毫不客气地指出方案的缺陷，质疑不充分的论证，要求提供更多证据，绝不轻易认同任何观点。' 
    },
    { 
      id: 4, 
      name: '分析师', 
      role: '分析师', 
      apiKey: '', 
      description: '你是一个严谨的数据分析师，用逻辑和证据无情地拆解其他人的观点。你要指出论证中的逻辑错误，质疑缺乏数据支持的结论，推动讨论更加理性和严谨。' 
    },
    { 
      id: 5, 
      name: '整合者', 
      role: '整合者', 
      apiKey: '', 
      description: '你是一个严格的整合者，不接受表面的妥协。你要深入挖掘观点冲突的根源，质疑虚假的一致性，推动各方进行更深入的辩论，直到找到真正经得起考验的解决方案。' 
    },
    { 
      id: 6, 
      name: '执行者', 
      role: '执行者', 
      apiKey: '', 
      description: '你是一个注重实践的执行者，质疑不切实际的想法和方案。你要指出执行中的困难和障碍，要求提供具体的实施细节，挑战过于理想化的观点，推动讨论更加务实和可行。' 
    },
    { 
      id: 7, 
      name: '专家', 
      role: '专家', 
      apiKey: '', 
      description: '你是该领域的权威专家，用专业知识无情批判错误观点。你要指出其他人认知上的盲点和错误，提出更专业、更深入的见解，不容忍外行的错误理解，推动讨论达到专业水准。' 
    }
  ];

  // 应用预设模板
  const applyTemplate = (templateName) => {
    if (roleTemplates[templateName]) {
      setAgents([...roleTemplates[templateName]]);
      setShowTemplates(false);
    }
  };

  // 重置为默认配置
  const resetToDefault = () => {
    setAgents([...defaultAgents]);
  };

  // 初始化配置模式（仅在没有URL参数时使用）
  React.useEffect(() => {
    // 延迟检查，确保URL参数处理优先执行
    setTimeout(() => {
      const urlParams = new URLSearchParams(location.search);
      const modeParam = urlParams.get('mode');
      
      if (!modeParam && configMode === 'smart') {
        // 没有URL参数且还是默认状态时，才设置智慧协调模式
        console.log('使用默认智慧协调模式');
        handleModeChange('smart');
      }
    }, 100);
  }, []);

  // 自动保存默认配置到localStorage
  React.useEffect(() => {
    const savedDefaultConfig = localStorage.getItem('defaultAgentConfig');
    if (!savedDefaultConfig) {
      // 如果没有保存过默认配置，则保存当前的默认配置
      const configToSave = {
        id: 'default-confrontational',
        name: '默认对峙性团队',
        description: '包含7个具有强烈对峙性的智能体角色',
        agents: defaultAgents,
        createdAt: new Date().toISOString()
      };
      
      // 保存到智能体配置列表中
      const existingConfigs = JSON.parse(localStorage.getItem('agentConfigs') || '[]');
      const updatedConfigs = [configToSave, ...existingConfigs];
      localStorage.setItem('agentConfigs', JSON.stringify(updatedConfigs));
      localStorage.setItem('defaultAgentConfig', 'saved');
    }
  }, []);

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 style={{ 
        fontSize: '1.5rem', 
        marginBottom: '0.5rem',
        color: theme.colors.primary,
        fontWeight: 'bold'
      }}>
        配置智能体
      </h2>

      {/* 调试信息面板 */}
      <div style={{
        backgroundColor: '#f0f8ff',
        border: '1px solid #2196f3',
        borderRadius: '8px',
        padding: '10px',
        marginBottom: '1rem',
        fontSize: '12px'
      }}>
        <strong>🔍 调试信息：</strong><br/>
        URL搜索参数: {location.search || '(无)'}<br/>
        当前模式: {configMode}<br/>
        智能体数量: {agents.length}<br/>
        配置名称: {configName || '(未设置)'}
      </div>

      {/* 配置模式选择 */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: theme.colors.primary, fontSize: '1.1rem' }}>
          选择配置模式
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1rem', 
          marginBottom: '1rem' 
        }}>
          <button 
            onClick={() => handleModeChange('smart')}
            style={{
              backgroundColor: configMode === 'smart' ? '#7c3aed' : '#f8f9fa',
              color: configMode === 'smart' ? 'white' : '#333',
              border: '2px solid #7c3aed',
              borderRadius: '12px',
              padding: '1rem',
              cursor: 'pointer',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease'
            }}
          >
            🧠 智慧协调模式
          </button>
          <button 
            onClick={() => handleModeChange('enterprise')}
            style={{
              backgroundColor: configMode === 'enterprise' ? '#7c3aed' : '#f8f9fa',
              color: configMode === 'enterprise' ? 'white' : '#333',
              border: '2px solid #7c3aed',
              borderRadius: '12px',
              padding: '1rem',
              cursor: 'pointer',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease'
            }}
          >
            🏢 企业决策模式
          </button>
          <button 
            onClick={() => handleModeChange('debate')}
            style={{
              backgroundColor: configMode === 'debate' ? '#7c3aed' : '#f8f9fa',
              color: configMode === 'debate' ? 'white' : '#333',
              border: '2px solid #7c3aed',
              borderRadius: '12px',
              padding: '1rem',
              cursor: 'pointer',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease'
            }}
          >
            🔥 辩论博弈模式
          </button>
        </div>
        <div style={{
          padding: '1rem',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#5b21b6'
        }}>
          {configMode === 'smart' && '7个智慧协调的智能体角色，通过建设性协调实现深度思维融合'}
          {configMode === 'enterprise' && '8个企业高管角色，模拟真实企业高管团队决策过程'}
          {configMode === 'debate' && '6个立场鲜明的对立角色进行激烈辩论，推动深度思考和全面认知'}
        </div>
      </div>

      {/* 配置基本信息 */}
      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        border: '1px solid #ddd'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: theme.colors.primary, fontSize: '1rem' }}>
          📝 配置信息
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: 'bold',
              color: '#333'
            }}>
              配置名称:
            </label>
            <input
              type="text"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="例如：企业决策智囊团"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            />
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: 'bold',
              color: '#333'
            }}>
              配置描述:
            </label>
            <textarea
              value={configDescription}
              onChange={(e) => setConfigDescription(e.target.value)}
              placeholder="描述这个智能体团队的特点和适用场景..."
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.9rem',
                minHeight: '60px',
                resize: 'vertical'
              }}
            />
          </div>
          
          <button 
            onClick={saveCompleteConfig}
            style={{
              backgroundColor: '#22c55e',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              alignSelf: 'flex-start'
            }}
          >
            💾 保存配置
          </button>
        </div>
      </div>

      {/* 快速配置选项 */}
      <div style={{ 
        marginBottom: '1.5rem',
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={() => setShowTemplates(!showTemplates)}
          style={{
            backgroundColor: theme.colors.primary,
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          📋 预设模板
        </button>
        

        
        <button 
          onClick={resetToDefault}
          style={{
            backgroundColor: '#94a3b8',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          🔄 重置默认
        </button>
        
        <button 
          onClick={addAgent}
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          ➕ 添加智能体
        </button>
        
        <button 
          onClick={() => setShowModeratorConfig(!showModeratorConfig)}
          style={{
            backgroundColor: '#7c3aed',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          👨‍💼 主持人配置
        </button>
      </div>

      {/* 预设模板选择 */}
      {showTemplates && (
        <div style={{
          backgroundColor: '#f9f9f9',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '1px solid #ddd'
        }}>
          <h4 style={{ marginBottom: '1rem', color: theme.colors.primary }}>选择预设模板：</h4>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => applyTemplate('brainstorm')}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              💡 头脑风暴团队
            </button>
            <button 
              onClick={() => applyTemplate('debate')}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🗣️ 辩论对战团队
            </button>
            <button 
              onClick={() => applyTemplate('expert')}
              style={{
                backgroundColor: '#8b5cf6',
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🧠 专业咨询团队
            </button>
          </div>
        </div>
      )}

      {/* 主持人配置 */}
      {showModeratorConfig && (
        <div style={{
          backgroundColor: '#faf5ff',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '1px solid #e9d5ff'
        }}>
          <h4 style={{ marginBottom: '1rem', color: '#7c3aed' }}>👨‍💼 超级主持人配置</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                API密钥:
              </label>
              <input
                type="password"
                value={moderatorConfig.apiKey}
                onChange={(e) => handleModeratorConfigChange('apiKey', e.target.value)}
                placeholder="输入主持人API密钥"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                模型选择:
              </label>
              <select
                value={moderatorConfig.model}
                onChange={(e) => handleModeratorConfigChange('model', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px'
                }}
              >
                <option value="deepseek-chat">DeepSeek Chat</option>
                <option value="gpt-4">GPT-4</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                干预阈值:
              </label>
              <select
                value={moderatorConfig.interventionThreshold}
                onChange={(e) => handleModeratorConfigChange('interventionThreshold', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px'
                }}
              >
                <option value="2">2轮后介入</option>
                <option value="3">3轮后介入</option>
                <option value="4">4轮后介入</option>
                <option value="5">5轮后介入</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                回复长度:
              </label>
              <span style={{ 
                display: 'inline-block', 
                padding: '0.5rem', 
                backgroundColor: 'white', 
                border: '1px solid #e0e0e0', 
                borderRadius: '4px', 
                minWidth: '60px' 
              }}>
                {moderatorConfig.maxResponseLength}字
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="enableModerator"
              checked={moderatorConfig.enabled}
              onChange={(e) => handleModeratorConfigChange('enabled', e.target.checked)}
              style={{ transform: 'scale(1.2)' }}
            />
            <label htmlFor="enableModerator" style={{ fontWeight: 'bold', color: '#5b21b6' }}>
              启用超级主持人功能
            </label>
          </div>

          <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: 'rgba(124, 58, 237, 0.3)', borderRadius: '4px' }}>
            <small style={{ color: '#5b21b6' }}>
              💡 提示：主持人会在讨论进行3轮后开始介入，智能分析讨论状态并提供引导。
              {!moderatorConfig.apiKey && <strong> 请先配置API密钥！</strong>}
            </small>
          </div>
        </div>
      )}

      {/* 智能体配置列表 */}
      {agents.map(agent => (
        <div key={agent.id} style={{ 
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
          backgroundColor: 'white'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '0.5rem'
          }}>
            <h3 style={{ fontWeight: 'bold' }}>智能体 #{agent.id}</h3>
            {agents.length > 1 && (
              <button 
                onClick={() => removeAgent(agent.id)}
                style={{
                  backgroundColor: '#f43f5e',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                删除
              </button>
            )}
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              名称：
              <input 
                type="text" 
                value={agent.name} 
                onChange={(e) => handleChange(agent.id, 'name', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  marginTop: '0.25rem'
                }}
                placeholder="例如：创意顾问"
              />
            </label>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              角色：
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '40px',
                height: '40px',
                backgroundColor: theme.colors.primary,
                color: 'white',
                borderRadius: '50%',
                fontSize: '1.5rem'
              }}>
                {getRoleIcon(agent.role)}
              </div>
              <select
                value={agent.role}
                onChange={(e) => handleChange(agent.id, 'role', e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              >
                <option value="">请选择角色</option>
                <option value="主持人">👨‍💼 主持人</option>
                <option value="创意者">💡 创意者</option>
                <option value="批评者">🔍 批评者</option>
                <option value="整合者">🔄 整合者</option>
                <option value="分析师">📊 分析师</option>
                <option value="执行者">🛠️ 执行者</option>
                <option value="协调者">🤝 协调者</option>
                <option value="专家">🧠 专家</option>
                <option value="记录者">📝 记录者</option>
                <option value="其他">👤 其他</option>
              </select>
            </div>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              API密钥：
              <input 
                type="password" 
                value={agent.apiKey} 
                onChange={(e) => handleChange(agent.id, 'apiKey', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  marginTop: '0.25rem'
                }}
                placeholder="输入API密钥"
              />
            </label>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              角色描述：
              <textarea 
                value={agent.description} 
                onChange={(e) => handleChange(agent.id, 'description', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  minHeight: '100px',
                  marginTop: '0.25rem'
                }}
                placeholder="描述这个智能体的角色特点和行为方式"
              />
            </label>
          </div>
        </div>
      ))}
      
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
        <button 
          onClick={saveAgentConfigs}
          style={{
            backgroundColor: theme.colors.primary,
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            flex: 1
          }}
        >
          保存配置
        </button>
        
        <button 
          onClick={() => {
            // 检查是否至少有一个智能体配置了名称和角色
            const isValid = agents.some(agent => agent.name && agent.role);
            if (isValid) {
              // 将配置好的智能体数据传递给父组件
              onAgentsConfigured(agents);
            } else {
              alert('请至少为一个智能体配置名称和角色！');
            }
          }}
          style={{
            backgroundColor: '#4caf50',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            flex: 1
          }}
        >
          开始聊天
        </button>
      </div>
      
      {/* 辩论博弈策略模态框 */}
      <DebateGameConfig
        isOpen={showDebateGameConfig}
        onClose={() => setShowDebateGameConfig(false)}
        onLoadConfig={handleDebateGameConfigLoad}
      />
    </div>
  );
}
