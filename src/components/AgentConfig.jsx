import React, { useState, useEffect } from 'react';
import { moderatorConfigStorage } from '../services/localStorage';
import { saveApiKey, getApiKey, saveAgentConfig, getAgentConfigList, getAgentConfigById } from '../services/localStorage';

// MCP服务列表（预留扩展功能）
// const mcpServices = [
//   { id: 'openai', name: 'OpenAI API', endpoint: 'https://api.openai.com/v1' },
//   { id: 'claude', name: 'Claude API', endpoint: 'https://api.anthropic.com' },
//   { id: 'gemini', name: 'Google Gemini', endpoint: 'https://generativelanguage.googleapis.com' },
//   { id: 'local', name: '本地部署', endpoint: 'http://localhost:8080' }
// ];

const AgentConfig = ({ agents = [], onAgentsConfigured }) => {
  // 角色模板定义
  const roleTemplates = {
    // 智慧协调模式角色
    '战略分析师': {
      name: '战略思维者',
      description: '你是一个深度战略思维专家，专注于从宏观和长远角度分析问题。你的使命是：1）识别问题的根本原因和深层结构 2）分析各种方案的长期影响和战略意义 3）提出具有前瞻性的解决框架 4）评估不同选择的机会成本和风险收益 5）在复杂性中寻找关键的突破点。你善于在博弈中寻找多赢的策略空间，用系统性思维指导讨论方向。每次发言字数不超过200字。'
    },
    '创新专家': {
      name: '创新催化者',
      description: '你是一个富有创造力的创新引导者，专门激发突破性思维。你的职责是：1）提出跳出框架的全新视角和解决路径 2）挑战传统假设，启发逆向和侧向思维 3）整合跨领域的知识和经验，产生创新灵感 4）在看似无关的概念间建立创造性连接 5）推动从"是什么"向"可能是什么"的思维转换。你通过建设性的挑战推动创新，而非破坏性的否定。每次发言字数不超过200字。'
    },
    '质量控制专家': {
      name: '严谨验证者',
      description: '你是一个逻辑严密的质量守门人，确保讨论的准确性和严谨性。你的任务是：1）识别论证中的逻辑漏洞和证据不足 2）要求提供具体数据、案例和可验证的支撑材料 3）检查假设的合理性和结论的可靠性 4）指出可能的偏见、盲点和错误推理 5）确保每个重要观点都经过充分的论证检验。你通过建设性的质疑提升讨论质量，而非为了质疑而质疑。每次发言字数不超过200字。'
    },
    '执行策略专家': {
      name: '实践整合者',
      description: '你是一个将理论转化为实践的桥梁建设者，专注于可操作性。你的使命是：1）评估方案的可行性和实施难度 2）识别执行过程中的关键节点和潜在障碍 3）设计具体的实施路径和资源配置方案 4）平衡理想目标与现实约束，寻找最优实现路径 5）确保抽象讨论能转化为具体行动计划。你在博弈中寻求实用与理想的最佳平衡点。每次发言字数不超过200字。'
    },
    '共识建设专家': {
      name: '协调整合者',
      description: '你是一个善于在分歧中寻找共同点的协调大师，专注于建设性整合。你的职责是：1）识别不同观点背后的共同价值和目标 2）寻找看似对立观点间的互补性和协同潜力 3）设计能够融合多方智慧的综合方案 4）化解冲突为合作，将竞争转化为协作 5）构建让各方都能接受和贡献的解决框架。你通过智慧的协调实现集体智慧的最大化。每次发言字数不超过200字。'
    },
    '全局分析师': {
      name: '多元视角者',
      description: '你是一个具有全方位视野的多维度思考者，专门拓展讨论的广度和深度。你的任务是：1）从不同利益相关者的角度分析问题 2）考虑短期、中期、长期的不同时间维度影响 3）整合技术、经济、社会、文化等多重因素 4）识别被忽视的重要方面和潜在连锁反应 5）确保讨论覆盖问题的各个重要维度。你像一个智慧的探照灯，照亮讨论的盲区。每次发言字数不超过200字。'
    },
    '伦理顾问': {
      name: '价值引导者',
      description: '你是一个具有深厚智慧的价值守护者，确保讨论不偏离正确的价值导向。你的使命是：1）分析不同方案的伦理影响和道德考量 2）评估决策对各方福祉和社会整体利益的影响 3）确保解决方案符合公平、正义、可持续发展等基本价值原则 4）在效率与公平、创新与稳定间寻找平衡 5）引导讨论向着更高层次的价值目标发展。你是团队的道德罗盘和智慧之光。每次发言字数不超过200字。'
    },

    // 企业决策模式角色
    '首席执行官': {
      name: 'CEO',
      description: '你是企业的最高决策者，负责制定企业总体战略方向和重大决策。你的职责包括：1）从全局视角审视企业发展战略和市场机遇 2）平衡股东利益、员工福利和社会责任 3）做出影响企业长远发展的关键决策 4）确保企业在激烈竞争中保持优势地位 5）承担最终决策责任，推动企业持续增长。你具备敏锐的商业嗅觉和卓越的领导力，能在复杂环境中做出明智决策。每次发言字数不超过200字。'
    },
    '首席技术官': {
      name: 'CTO',
      description: '你是企业的技术领导者，负责技术战略规划和创新驱动。你的使命是：1）制定企业技术发展路线图和架构规划 2）评估新技术对业务的潜在影响和应用价值 3）领导技术团队攻克关键技术难题 4）确保技术投入产出比和创新效果最大化 5）推动技术与业务的深度融合。你拥有深厚的技术功底和前瞻性技术视野，能将复杂技术转化为商业价值。每次发言字数不超过200字。'
    },
    '首席财务官': {
      name: 'CFO',
      description: '你是企业的财务管理专家，负责资金规划和财务风险控制。你的核心职能：1）分析财务数据，评估投资回报率和财务风险 2）制定预算计划，优化资源配置和成本结构 3）监控现金流，确保企业财务健康和流动性 4）评估融资方案，平衡债务与股权结构 5）为重大决策提供财务建议和数据支撑。你以数据说话，用财务角度解析商业决策的可行性和价值。每次发言字数不超过200字。'
    },
    '首席营销官': {
      name: 'CMO',
      description: '你是市场营销和品牌建设的领导者，负责提升企业市场影响力。你的专业领域：1）分析市场趋势和消费者行为，制定营销战略 2）打造品牌形象，提升品牌价值和市场认知度 3）设计营销活动，提高客户获取和留存率 4）监控营销效果，优化营销投入产出比 5）洞察竞争对手动态，制定差异化竞争策略。你善于将创意转化为商业成果，用营销思维驱动业务增长。每次发言字数不超过200字。'
    },
    '首席运营官': {
      name: 'COO',
      description: '你是企业运营管理的核心，负责日常运营和流程优化。你的管理重点：1）优化业务流程，提升运营效率和服务质量 2）协调各部门协作，确保企业整体运营顺畅 3）监控关键绩效指标，持续改进运营管理体系 4）管理供应链和合作伙伴关系，降低运营成本 5）推动数字化转型，提升企业运营能力。你具备丰富的管理经验和执行力，能将战略目标转化为具体的运营成果。每次发言字数不超过200字。'
    },
    '产品总监': {
      name: '产品负责人',
      description: '你是产品策略和用户体验的专家，负责产品全生命周期管理。你的产品思维：1）深入了解用户需求，设计满足市场需求的产品功能 2）制定产品路线图，平衡功能创新与技术可行性 3）协调研发、设计、运营团队，确保产品按时交付 4）分析产品数据，持续优化用户体验和产品价值 5）洞察行业趋势，保持产品竞争优势。你以用户为中心，用产品思维解决商业问题。每次发言字数不超过200字。'
    },
    '人力资源总监': {
      name: 'CHRO',
      description: '你是人才管理和组织发展的专家，负责企业人力资源战略。你的核心任务：1）制定人才招聘和培养策略，建设高绩效团队 2）设计薪酬福利体系，激励员工创造更大价值 3）推动企业文化建设，营造积极向上的工作氛围 4）管理员工关系，处理劳资纠纷和冲突问题 5）规划组织架构调整，支持企业战略发展需要。你理解人性，善于激发团队潜能，用人力资源管理推动企业发展。每次发言字数不超过200字。'
    },
    '法务总监': {
      name: '首席法务官',
      description: '你是企业法律风险管控的专家，负责法律合规和风险防范。你的专业职责：1）评估商业决策的法律风险，提供合规建议 2）起草和审核重要合同，保护企业合法权益 3）处理诉讼纠纷，维护企业声誉和利益 4）监控法律法规变化，确保企业经营合规 5）建立法律风险防控体系，降低企业法律风险。你具备扎实的法律功底和商业思维，能在复杂的法律环境中保护企业利益。每次发言字数不超过200字。'
    }
  };

  // 获取当前模式的角色列表
  const getCurrentModeRoles = () => {
    if (configMode === 'enterprise') {
      return ['首席执行官', '首席技术官', '首席财务官', '首席营销官', '首席运营官', '产品总监', '人力资源总监', '法务总监'];
    } else {
      return ['战略分析师', '创新专家', '质量控制专家', '执行策略专家', '共识建设专家', '全局分析师', '伦理顾问'];
    }
  };

  const getDefaultAgents = () => {
    const currentRoles = getCurrentModeRoles();
    
    return currentRoles.map((role, index) => ({
      id: `agent${index + 1}`,
      name: roleTemplates[role].name,
      role: role,
      apiKey: '',
      model: '',
      description: roleTemplates[role].description
    }));
  };

  // 切换配置模式时更新智能体配置
  const handleModeChange = (newMode) => {
    if (newMode !== configMode) {
      setConfigMode(newMode);
      
      // 自动更新智能体配置以匹配新模式
      const newAgents = newMode === 'enterprise' ? 
        getEnterpriseAgents() : getDefaultAgents();
      
      setAgentList(newAgents);
      saveAgentsConfig(newAgents);
    }
  };

  // 获取企业模式的默认智能体配置
  const getEnterpriseAgents = () => {
    return [
      { 
        id: 'agent1', 
        name: 'CEO', 
        role: '首席执行官', 
        apiKey: '', 
        model: 'deepseek-ai/DeepSeek-V3', 
        description: roleTemplates['首席执行官'].description
      },
      { 
        id: 'agent2', 
        name: 'CTO', 
        role: '首席技术官', 
        apiKey: '', 
        model: 'Qwen/QwQ-32B', 
        description: roleTemplates['首席技术官'].description
      },
      { 
        id: 'agent3', 
        name: 'CFO', 
        role: '首席财务官', 
        apiKey: '', 
        model: 'Qwen/Qwen2.5-72B-Instruct', 
        description: roleTemplates['首席财务官'].description
      },
      { 
        id: 'agent4', 
        name: 'CMO', 
        role: '首席营销官', 
        apiKey: '', 
        model: 'deepseek-ai/DeepSeek-V2.5', 
        description: roleTemplates['首席营销官'].description
      },
      { 
        id: 'agent5', 
        name: 'COO', 
        role: '首席运营官', 
        apiKey: '', 
        model: 'Qwen/Qwen2.5-32B-Instruct', 
        description: roleTemplates['首席运营官'].description
      },
      { 
        id: 'agent6', 
        name: '产品负责人', 
        role: '产品总监', 
        apiKey: '', 
        model: 'THUDM/GLM-4-32B-0414', 
        description: roleTemplates['产品总监'].description
      },
      { 
        id: 'agent7', 
        name: 'CHRO', 
        role: '人力资源总监', 
        apiKey: '', 
        model: 'Qwen/Qwen2.5-14B-Instruct', 
        description: roleTemplates['人力资源总监'].description
      },
      { 
        id: 'agent8', 
        name: '首席法务官', 
        role: '法务总监', 
        apiKey: '', 
        model: 'Qwen/Qwen2.5-7B-Instruct', 
        description: roleTemplates['法务总监'].description
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
    // 使用智慧协调模式作为默认
    const customRoles = ['战略分析师', '创新专家', '质量控制专家', '执行策略专家', '共识建设专家', '全局分析师', '伦理顾问'];
    return customRoles.map((role, index) => ({
      id: `agent${index + 1}`,
      name: roleTemplates[role].name,
      role: role,
      apiKey: '',
      model: '',
      description: roleTemplates[role].description
    }));
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
      // 返回智慧协调模式的默认配置
      const defaultAgents = getDefaultAgents();
      return defaultAgents;
    }
    
    return loadSavedAgents();
  });
  const [configMode, setConfigMode] = useState('custom'); // 'custom' | 'enterprise'
  const [showModeratorConfig, setShowModeratorConfig] = useState(false);
  const [moderatorConfig, setModeratorConfig] = useState(moderatorConfigStorage.getModeratorConfig());

  // 新增状态管理
  const [showSaveConfigModal, setShowSaveConfigModal] = useState(false);
  const [showLoadConfigModal, setShowLoadConfigModal] = useState(false);
  const [configName, setConfigName] = useState('');
  const [configDescription, setConfigDescription] = useState('');
  const [savedConfigs, setSavedConfigs] = useState([]);

  // 确保默认配置被保存
  useEffect(() => {
    if (agentList.length > 0) {
      saveAgentsConfig(agentList);
    }
  }, [agentList]);

  // 加载已保存的配置列表
  useEffect(() => {
    const loadSavedConfigs = () => {
      try {
        const configs = getAgentConfigList();
        setSavedConfigs(configs);
      } catch (error) {
        console.error('加载配置列表失败:', error);
      }
    };
    loadSavedConfigs();
  }, []);
  

  
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
      
      // 自动保存/更新"最近配置"
      const recentConfig = {
        name: '最近配置',
        description: `最后更新时间: ${new Date().toLocaleString()}`,
        agents: agents
      };
      
      // 查找是否已存在"最近配置"
      const savedConfigs = getAgentConfigList();
      const recentConfigIndex = savedConfigs.findIndex(config => config.name === '最近配置');
      
      if (recentConfigIndex >= 0) {
        // 更新现有的最近配置
        recentConfig.id = savedConfigs[recentConfigIndex].id;
        recentConfig.createdAt = savedConfigs[recentConfigIndex].createdAt;
      }
      
      saveAgentConfig(recentConfig);
      
      console.log('智能体配置已保存');
    } catch (error) {
      console.error('保存智能体配置失败', error);
    }
  };

  // 处理主持人配置变更
  const handleModeratorConfigChange = (field, value) => {
    const newConfig = { ...moderatorConfig, [field]: value };
    setModeratorConfig(newConfig);
    moderatorConfigStorage.saveModeratorConfig(newConfig);
  };

  // 更新代理信息
  const updateAgent = (index, field, value) => {
    const updatedAgents = [...agentList];
    updatedAgents[index] = {
      ...updatedAgents[index],
      [field]: value
    };

    // 如果更新的是角色，自动更新名称和描述
    if (field === 'role' && roleTemplates[value]) {
      updatedAgents[index].name = roleTemplates[value].name;
      updatedAgents[index].description = roleTemplates[value].description;
    }

    setAgentList(updatedAgents);
    saveAgentsConfig(updatedAgents);
  };

  // 添加智能体
  const addAgent = () => {
    const currentRoles = getCurrentModeRoles();
    const defaultRole = currentRoles[0];
    
    const newAgent = {
      id: `agent${Date.now()}`,
      name: roleTemplates[defaultRole].name,
      role: defaultRole,
      apiKey: '',
      model: '',
      description: roleTemplates[defaultRole].description
    };

    const updatedAgents = [...agentList, newAgent];
    setAgentList(updatedAgents);
    saveAgentsConfig(updatedAgents);
  };

  // 删除智能体
  const removeAgent = (index) => {
    if (agentList.length <= 1) {
      alert('至少需要保留一个智能体');
      return;
    }

    const updatedAgents = agentList.filter((_, i) => i !== index);
    setAgentList(updatedAgents);
    saveAgentsConfig(updatedAgents);
  };

  // 重置为默认配置
  const resetToDefault = () => {
    if (window.confirm('确定要重置为默认配置吗？这将清除当前所有自定义设置。')) {
      const defaultAgents = configMode === 'enterprise' ? getEnterpriseAgents() : getDefaultAgents();
      setAgentList(defaultAgents);
      saveAgentsConfig(defaultAgents);
    }
  };

  // 保存配置（简单版本）
  const saveConfiguration = () => {
    setShowSaveConfigModal(true);
  };

  // 确认保存配置
  const confirmSaveConfig = async () => {
    if (!configName.trim()) {
      alert('请输入配置名称');
      return;
    }

    try {
      const configData = {
        name: configName.trim(),
        description: configDescription.trim(),
        agents: agentList
      };

      const configId = saveAgentConfig(configData);
      if (configId) {
        alert('✅ 配置已保存成功！');
        setShowSaveConfigModal(false);
        setConfigName('');
        setConfigDescription('');
        
        // 重新加载配置列表
        const configs = getAgentConfigList();
        setSavedConfigs(configs);
      } else {
        alert('❌ 保存配置失败，请重试');
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      alert('❌ 保存配置失败，请检查并重试');
    }
  };

  // 加载保存的配置
  const loadSavedConfig = async (configId) => {
    try {
      const config = getAgentConfigById(configId);
      if (config && config.agents) {
        setAgentList(config.agents);
        saveAgentsConfig(config.agents);
        setShowLoadConfigModal(false);
        alert(`✅ 配置"${config.name}"已加载成功！`);
      } else {
        alert('❌ 加载配置失败，配置可能已损坏');
      }
    } catch (error) {
      console.error('加载配置失败:', error);
      alert('❌ 加载配置失败，请重试');
    }
  };

  // 启动聊天
  const startChat = () => {
    const validAgents = agentList.filter(agent => agent.name && agent.role && agent.apiKey && agent.model);
    if (validAgents.length === 0) {
      alert('请至少配置一个完整的智能体（包含名称、角色、API密钥和模型）');
      return;
    }
    
    // 自动保存配置
    saveAgentsConfig(agentList);
    onAgentsConfigured(agentList);
  };

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '2rem',
      backgroundColor: 'var(--background)',
      color: 'var(--text-color)',
      minHeight: '100vh'
    }}>
      <h2 style={{
        textAlign: 'center',
        marginBottom: '2rem',
        color: 'var(--primary-color)',
        fontSize: '2rem',
        fontWeight: 'bold'
      }}>
        配置智能体
      </h2>

      {/* 配置模式选择 */}
      <div className="config-mode-selector" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>选择配置模式</h3>
        <div className="mode-buttons" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button 
            className={`mode-button ${configMode === 'custom' ? 'active' : ''}`}
            onClick={() => handleModeChange('custom')}
            style={{
              backgroundColor: configMode === 'custom' ? '#7c3aed' : 'var(--card-bg)',
              color: configMode === 'custom' ? 'white' : 'var(--text-color)',
              border: '2px solid #7c3aed',
              borderRadius: '8px',
              padding: '1rem',
              cursor: 'pointer',
              flex: 1,
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            🧠 智慧协调模式
          </button>
          <button 
            className={`mode-button ${configMode === 'enterprise' ? 'active' : ''}`}
            onClick={() => handleModeChange('enterprise')}
            style={{
              backgroundColor: configMode === 'enterprise' ? '#7c3aed' : 'var(--card-bg)',
              color: configMode === 'enterprise' ? 'white' : 'var(--text-color)',
              border: '2px solid #7c3aed',
              borderRadius: '8px',
              padding: '1rem',
              cursor: 'pointer',
              flex: 1,
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            🏢 企业决策模式
          </button>
        </div>
        <div className="mode-description" style={{
          padding: '1rem',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          {configMode === 'custom' ? (
            <p style={{ margin: 0, color: 'var(--text-color)' }}>
              7个智慧协调的智能体角色，通过建设性博弈与协调，实现深度思维融合
            </p>
          ) : (
            <p style={{ margin: 0, color: 'var(--text-color)' }}>
              8个专业企业角色，模拟真实企业高管团队的决策流程和讨论
            </p>
          )}
        </div>
      </div>

      {/* 企业模式角色展示 */}
      {configMode === 'enterprise' && (
        <div className="enterprise-mode" style={{ marginBottom: '2rem' }}>
          <div className="enterprise-roles" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            {getCurrentModeRoles().map((roleName) => (
              <div key={roleName} className="role-category" style={{
                backgroundColor: 'var(--card-bg)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }}>
                  {roleTemplates[roleName].name} ({roleName})
                </h4>
                <p style={{ 
                  margin: 0, 
                  color: 'var(--text-color)', 
                  fontSize: '0.9rem',
                  lineHeight: '1.4',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {roleTemplates[roleName].description.split('。')[0]}...
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 主持人配置面板 */}
      {showModeratorConfig && (
        <div style={{
          border: '2px solid #7c3aed',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          backgroundColor: 'rgba(124, 58, 237, 0.05)',
          boxShadow: '0 4px 8px rgba(124, 58, 237, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h3 style={{
              margin: 0,
              color: '#7c3aed',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              🎭 超级主持人配置
            </h3>
            <button
              onClick={() => setShowModeratorConfig(false)}
              style={{
                marginLeft: 'auto',
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#7c3aed'
              }}
            >
              ×
            </button>
          </div>

          <div style={{
            backgroundColor: 'rgba(124, 58, 237, 0.08)',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid rgba(124, 58, 237, 0.2)'
          }}>
            <p style={{ margin: 0, color: '#5b21b6', fontSize: '0.9rem' }}>
              💡 <strong>超级主持人</strong>是一个AI驱动的智能引导者，它会：<br/>
              • 实时分析讨论质量和深度<br/>
              • 智能选择最佳引导策略<br/>
              • 提出深度问题推动思辨<br/>
              • 防止讨论偏离主题或流于表面
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#5b21b6' }}>
                API密钥 *
              </label>
              <input
                type="password"
                value={moderatorConfig.apiKey}
                onChange={(e) => handleModeratorConfigChange('apiKey', e.target.value)}
                placeholder="输入主持人使用的API密钥"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  borderRadius: '4px',
                  backgroundColor: 'white'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#5b21b6' }}>
                AI模型
              </label>
              <select
                value={moderatorConfig.model}
                onChange={(e) => handleModeratorConfigChange('model', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  borderRadius: '4px',
                  backgroundColor: 'white'
                }}
              >
                <option value="">选择模型</option>
                {/* 推理模型 - 主持人专用推荐 */}
                <option value="deepseek-ai/DeepSeek-R1">🧠 DeepSeek-R1 (推理模型)</option>
                <option value="Pro/deepseek-ai/DeepSeek-R1">🧠 DeepSeek-R1 Pro (推理模型)</option>
                
                {/* 顶级语言模型 */}
                <option value="deepseek-ai/DeepSeek-V3">🚀 DeepSeek-V3 (强化版)</option>
                <option value="Pro/deepseek-ai/DeepSeek-V3">🚀 DeepSeek-V3 Pro (强化版)</option>
                <option value="Qwen/QwQ-32B">🤔 QwQ-32B (思考模型)</option>
                <option value="Qwen/Qwen2.5-72B-Instruct">💎 Qwen2.5-72B (大参数)</option>
                
                {/* 高性价比选择 */}
                <option value="Qwen/Qwen2.5-32B-Instruct">⚡ Qwen2.5-32B</option>
                <option value="deepseek-ai/DeepSeek-V2.5">🔥 DeepSeek-V2.5</option>
                
                {/* 免费模型 */}
                <option value="Qwen/Qwen2.5-7B-Instruct">🆓 Qwen2.5-7B (免费)</option>
                <option value="THUDM/glm-4-9b-chat">🆓 GLM-4-9B (免费)</option>
              </select>
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

      {/* 智能体列表 */}
      {agentList.map((agent, index) => (
        <div key={agent.id} style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h3 style={{ margin: 0, fontWeight: 'bold' }}>智能体 #{index + 1}</h3>
            {agentList.length > 1 && (
              <button
                onClick={() => removeAgent(index)}
                style={{
                  backgroundColor: '#f43f5e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                删除
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                名称
              </label>
              <input
                type="text"
                value={agent.name}
                onChange={(e) => updateAgent(index, 'name', e.target.value)}
                placeholder="智能体名称"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-color)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                角色
              </label>
              <select
                value={agent.role}
                onChange={(e) => updateAgent(index, 'role', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-color)'
                }}
              >
                <option value="">选择角色</option>
                {getCurrentModeRoles().map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                API密钥
              </label>
              <input
                type="password"
                value={agent.apiKey}
                onChange={(e) => updateAgent(index, 'apiKey', e.target.value)}
                placeholder="输入API密钥"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-color)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                大模型选择
              </label>
              <select
                value={agent.model || ''}
                onChange={(e) => updateAgent(index, 'model', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-color)'
                }}
              >
                <option value="">选择模型</option>
                {/* 推理模型 - 最新最强 */}
                <option value="deepseek-ai/DeepSeek-R1">🧠 DeepSeek-R1 (推理模型)</option>
                <option value="Pro/deepseek-ai/DeepSeek-R1">🧠 DeepSeek-R1 Pro (推理模型)</option>
                
                {/* 顶级语言模型 - 最常用 */}
                <option value="deepseek-ai/DeepSeek-V3">🚀 DeepSeek-V3 (强化版)</option>
                <option value="Pro/deepseek-ai/DeepSeek-V3">🚀 DeepSeek-V3 Pro (强化版)</option>
                <option value="Qwen/QwQ-32B">🤔 QwQ-32B (思考模型)</option>
                <option value="Qwen/Qwen3-32B">✨ Qwen3-32B (最新版)</option>
                <option value="Qwen/Qwen2.5-72B-Instruct">💎 Qwen2.5-72B (大参数)</option>
                
                {/* 高性价比选择 */}
                <option value="Qwen/Qwen2.5-32B-Instruct">⚡ Qwen2.5-32B</option>
                <option value="deepseek-ai/DeepSeek-V2.5">🔥 DeepSeek-V2.5</option>
                <option value="Qwen/Qwen2.5-14B-Instruct">💫 Qwen2.5-14B</option>
                <option value="THUDM/GLM-4-32B-0414">🌟 GLM-4-32B</option>
                
                {/* 免费模型 */}
                <option value="Qwen/Qwen2.5-7B-Instruct">🆓 Qwen2.5-7B (免费)</option>
                <option value="Qwen/Qwen3-8B">🆓 Qwen3-8B (免费)</option>
                <option value="THUDM/glm-4-9b-chat">🆓 GLM-4-9B (免费)</option>
                <option value="deepseek-ai/DeepSeek-R1-Distill-Qwen-7B">🆓 DeepSeek-R1-Distill-7B (免费)</option>
                
                {/* 专业模型 */}
                <option value="Qwen/Qwen2.5-Coder-32B-Instruct">👨‍💻 Qwen2.5-Coder-32B (编程)</option>
                <option value="Qwen/Qwen2.5-VL-32B-Instruct">👁️ Qwen2.5-VL-32B (视觉)</option>
                <option value="deepseek-ai/deepseek-vl2">👁️ DeepSeek-VL2 (视觉)</option>
                <option value="Qwen/QVQ-72B-Preview">🎥 QVQ-72B (视频理解)</option>
                
                {/* Pro版本 - 高质量服务 */}
                <option value="Pro/Qwen/Qwen2.5-7B-Instruct">⭐ Qwen2.5-7B Pro</option>
                <option value="Pro/Qwen/Qwen2.5-VL-7B-Instruct">⭐ Qwen2.5-VL-7B Pro</option>
                <option value="Pro/THUDM/glm-4-9b-chat">⭐ GLM-4-9B Pro</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              角色描述
            </label>
            <textarea
              value={agent.description}
              onChange={(e) => updateAgent(index, 'description', e.target.value)}
              placeholder="描述智能体的角色特点和行为方式"
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-color)',
                resize: 'vertical'
              }}
            />
          </div>
        </div>
      ))}

      {/* 操作按钮 */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginTop: '2rem',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={addAgent}
          style={{
            backgroundColor: 'var(--secondary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          添加智能体
        </button>

        <button
          onClick={resetToDefault}
          style={{
            backgroundColor: '#f43f5e',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          重置为默认
        </button>

        <button
          onClick={() => setShowModeratorConfig(!showModeratorConfig)}
          style={{
            backgroundColor: showModeratorConfig ? '#9333ea' : '#7c3aed',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontWeight: 'bold',
            transform: showModeratorConfig ? 'scale(0.98)' : 'scale(1)',
            transition: 'all 0.2s ease'
          }}
        >
          🎭 {showModeratorConfig ? '关闭主持人配置' : '配置主持人'}
        </button>

        <button
          onClick={saveConfiguration}
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#059669';
            e.target.style.transform = 'scale(1.02)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#10b981';
            e.target.style.transform = 'scale(1)';
          }}
        >
          💾 保存配置
        </button>

        <button
          onClick={() => setShowLoadConfigModal(true)}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#2563eb';
            e.target.style.transform = 'scale(1.02)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#3b82f6';
            e.target.style.transform = 'scale(1)';
          }}
        >
          📂 加载配置
        </button>

        <button
          onClick={startChat}
          style={{
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginLeft: 'auto',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.02)';
            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = 'none';
          }}
        >
          🚀 开始讨论
        </button>
      </div>

             {/* 保存配置弹窗 */}
       {showSaveConfigModal && (
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
             backgroundColor: 'var(--background)',
             color: 'var(--text-color)',
             padding: '2rem',
             borderRadius: '8px',
             maxWidth: '400px',
             width: '90%',
             boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
           }}>
             <h2 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>💾 保存配置</h2>
             <input
               type="text"
               value={configName}
               onChange={(e) => setConfigName(e.target.value)}
               placeholder="输入配置名称"
               style={{
                 width: '100%',
                 padding: '0.75rem',
                 marginBottom: '1rem',
                 border: '1px solid var(--border-color)',
                 borderRadius: '4px',
                 backgroundColor: 'var(--input-bg)',
                 color: 'var(--text-color)',
                 fontSize: '1rem'
               }}
             />
             <textarea
               value={configDescription}
               onChange={(e) => setConfigDescription(e.target.value)}
               placeholder="配置描述（可选）"
               rows="3"
               style={{
                 width: '100%',
                 padding: '0.75rem',
                 marginBottom: '1rem',
                 border: '1px solid var(--border-color)',
                 borderRadius: '4px',
                 backgroundColor: 'var(--input-bg)',
                 color: 'var(--text-color)',
                 fontSize: '1rem',
                 resize: 'vertical'
               }}
             />
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
               <button
                 onClick={confirmSaveConfig}
                 style={{
                   backgroundColor: '#10b981',
                   color: 'white',
                   border: 'none',
                   borderRadius: '4px',
                   padding: '0.75rem 1.5rem',
                   cursor: 'pointer',
                   fontWeight: 'bold',
                   flex: 1,
                   transition: 'all 0.2s ease'
                 }}
                 onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                 onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
               >
                 💾 保存
               </button>
               <button
                 onClick={() => {
                   setShowSaveConfigModal(false);
                   setConfigName('');
                   setConfigDescription('');
                 }}
                 style={{
                   backgroundColor: '#6b7280',
                   color: 'white',
                   border: 'none',
                   borderRadius: '4px',
                   padding: '0.75rem 1.5rem',
                   cursor: 'pointer',
                   fontWeight: 'bold',
                   flex: 1,
                   transition: 'all 0.2s ease'
                 }}
                 onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
                 onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
               >
                 取消
               </button>
             </div>
           </div>
         </div>
       )}

                 {/* 加载配置弹窗 */}
           {showLoadConfigModal && (
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
                 backgroundColor: 'var(--background)',
                 color: 'var(--text-color)',
                 padding: '2rem',
                 borderRadius: '8px',
                 maxWidth: '500px',
                 width: '90%',
                 maxHeight: '80vh',
                 overflowY: 'auto'
               }}>
                 <h2 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>加载保存的配置</h2>
                 
                 {savedConfigs.length === 0 ? (
                   <p style={{ marginBottom: '1rem' }}>暂无保存的配置</p>
                 ) : (
                   <div style={{ marginBottom: '1rem' }}>
                     {savedConfigs.map((config) => (
                       <div 
                         key={config.id} 
                         style={{
                           border: '1px solid var(--border-color)',
                           borderRadius: '8px',
                           padding: '1rem',
                           marginBottom: '1rem',
                           backgroundColor: 'var(--card-bg)',
                           cursor: 'pointer'
                         }}
                         onClick={() => loadSavedConfig(config.id)}
                       >
                         <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)' }}>
                           {config.name}
                         </h3>
                         {config.description && (
                           <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                             {config.description}
                           </p>
                         )}
                         <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                           <span>智能体数量: {config.agents?.length || 0} | </span>
                           <span>创建时间: {new Date(config.createdAt).toLocaleDateString()}</span>
                         </div>
                         <div style={{
                           marginTop: '0.5rem',
                           padding: '0.5rem',
                           backgroundColor: 'rgba(124, 58, 237, 0.1)',
                           borderRadius: '4px',
                           fontSize: '0.8rem'
                         }}>
                           点击加载此配置
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
                 
                 <div style={{ display: 'flex', justifyContent: 'center' }}>
                   <button
                     onClick={() => setShowLoadConfigModal(false)}
                     style={{
                       backgroundColor: '#f43f5e',
                       color: 'white',
                       border: 'none',
                       borderRadius: '4px',
                       padding: '0.75rem 1.5rem',
                       cursor: 'pointer',
                       fontWeight: 'bold'
                     }}
                   >
                     关闭
                   </button>
                 </div>
               </div>
             </div>
           )}
    </div>
  );
};

export default AgentConfig; 
