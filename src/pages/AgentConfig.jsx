import React, { useState, useEffect } from 'react';
import { theme } from '../styles/theme';

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
      name: '创意者', 
      role: '创意者', 
      apiKey: '', 
      description: '你是一个激进的创新者，对传统方案和保守思维毫不留情。你要大胆质疑现状，提出颠覆性的想法，挑战其他人的思维局限，推动讨论突破常规框架。' 
    },
    { 
      id: 3, 
      name: '批评者', 
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
      name: '分析者', 
      role: '分析者', 
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
      role: '分析者', 
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
      role: '分析者', 
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
      name: '创意者', 
      role: '创意者', 
      apiKey: '', 
      description: '你是一个激进的创新者，对传统方案和保守思维毫不留情。你要大胆质疑现状，提出颠覆性的想法，挑战其他人的思维局限，推动讨论突破常规框架。' 
    },
    { 
      id: 3, 
      name: '批评者', 
      role: '批评者', 
      apiKey: '', 
      description: '你是一个尖锐的批评者，专门寻找其他观点的漏洞和问题。你要毫不客气地指出方案的缺陷，质疑不充分的论证，要求提供更多证据，绝不轻易认同任何观点。' 
    },
    { 
      id: 4, 
      name: '分析者', 
      role: '分析者', 
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
  
  // 角色图标映射
  const roleIcons = {
    '主持人': '👨‍💼',
    '创意者': '💡',
    '批评者': '🔍',
    '整合者': '🔄',
    '分析者': '📊',
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
      name: '创意者', 
      role: '创意者', 
      apiKey: '', 
      description: '你是一个激进的创新者，对传统方案和保守思维毫不留情。你要大胆质疑现状，提出颠覆性的想法，挑战其他人的思维局限，推动讨论突破常规框架。' 
    },
    { 
      id: 3, 
      name: '批评者', 
      role: '批评者', 
      apiKey: '', 
      description: '你是一个尖锐的批评者，专门寻找其他观点的漏洞和问题。你要毫不客气地指出方案的缺陷，质疑不充分的论证，要求提供更多证据，绝不轻易认同任何观点。' 
    },
    { 
      id: 4, 
      name: '分析者', 
      role: '分析者', 
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
        智能体配置
      </h2>
      
      <div style={{
        backgroundColor: '#e3f2fd',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        border: `1px solid ${theme.colors.primary}20`
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: theme.colors.primary, fontSize: '1rem' }}>
          🔥 默认对峙性智能体团队
        </h3>
        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', lineHeight: '1.4' }}>
          当前配置包含7个具有强烈对峙性的智能体角色，它们会积极质疑、挑战和批判彼此的观点，
          推动更深入的思辨和讨论。每个角色都有明确的"攻击性"职责，确保讨论不会流于表面。
        </p>
      </div>
      
      <div style={{ 
        marginBottom: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        alignItems: 'center'
      }}>
        <button 
          onClick={addAgent}
          style={{
            backgroundColor: theme.colors.primary,
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          添加智能体
        </button>
        
        <button 
          onClick={() => setShowTemplates(!showTemplates)}
          style={{
            backgroundColor: 'white',
            color: theme.colors.primary,
            padding: '0.5rem 1rem',
            border: `1px solid ${theme.colors.primary}`,
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          使用预设模板
        </button>
        
        <button 
          onClick={resetToDefault}
          style={{
            backgroundColor: '#f44336',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          重置为默认配置
        </button>
        
        {showTemplates && (
          <div style={{ 
            position: 'relative',
            marginLeft: '0.5rem',
            display: 'flex',
            gap: '0.5rem'
          }}>
            <button 
              onClick={() => applyTemplate('brainstorm')}
              style={{
                backgroundColor: '#e3f2fd',
                color: theme.colors.primary,
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'normal'
              }}
            >
              头脑风暴模板
            </button>
            
            <button 
              onClick={() => applyTemplate('debate')}
              style={{
                backgroundColor: '#e3f2fd',
                color: theme.colors.primary,
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'normal'
              }}
            >
              辩论模板
            </button>
            
            <button 
              onClick={() => applyTemplate('expert')}
              style={{
                backgroundColor: '#e3f2fd',
                color: theme.colors.primary,
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'normal'
              }}
            >
              专家团队模板
            </button>
          </div>
        )}
      </div>

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
                  backgroundColor: '#f44336',
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
                <option value="分析者">📊 分析者</option>
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
          onClick={() => {
            // 这里可以添加保存配置到本地存储或后端的逻辑
            alert('配置已保存');
          }}
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
              alert('请至少为一个智能体配置名称和角色');
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
    </div>
  );
}