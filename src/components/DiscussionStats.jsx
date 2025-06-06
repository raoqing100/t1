import React from 'react';
import { theme } from '../styles/theme';

const DiscussionStats = ({ messages, agents }) => {
  // 计算每个智能体的发言次数
  const getAgentMessageCounts = () => {
    const counts = {};
    
    messages.forEach(message => {
      if (!counts[message.agentId]) {
        counts[message.agentId] = 0;
      }
      counts[message.agentId]++;
    });
    
    return counts;
  };
  
  // 计算讨论总时长（从第一条消息到最后一条消息）
  const getDiscussionDuration = () => {
    if (messages.length < 2) return '0分钟';
    
    const firstMessage = messages[0];
    const lastMessage = messages[messages.length - 1];
    
    const startTime = new Date(firstMessage.timestamp).getTime();
    const endTime = new Date(lastMessage.timestamp).getTime();
    
    const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
    
    if (durationMinutes < 1) return '不到1分钟';
    return `${durationMinutes}分钟`;
  };
  
  // 获取智能体信息
  const getAgentById = (agentId) => {
    return agents.find(agent => agent.id === agentId) || { name: '未知', role: '未知' };
  };
  
  // 获取角色对应的颜色
  const getRoleColor = (role) => {
    const roleColors = {
      '主持人': '#4A6FA5',
      '创意者': '#47B881',
      '批评者': '#D14343',
      '整合者': '#9F7AEA',
      '分析者': '#3182CE',
      '执行者': '#DD6B20',
      '协调者': '#38A169',
      '专家': '#805AD5',
      '记录者': '#718096',
      '其他': '#4A5568'
    };
    return roleColors[role] || roleColors['其他'];
  };
  
  const messageCounts = getAgentMessageCounts();
  const duration = getDiscussionDuration();
  
  return (
    <div>
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '0.9rem' }}>讨论时长</div>
        <div style={{ fontSize: '0.9rem' }}>{duration}</div>
      </div>
      
      <div>
        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem' }}>发言统计</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {Object.entries(messageCounts).map(([agentId, count]) => {
            const agent = getAgentById(agentId);
            const percentage = Math.round((count / messages.length) * 100);
            
            return (
              <div key={agentId} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  borderRadius: '50%', 
                  backgroundColor: getRoleColor(agent.role),
                  marginRight: '0.4rem',
                  flexShrink: 0
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <div style={{ fontSize: '0.85rem' }}>{agent.name}</div>
                    <div style={{ fontSize: '0.85rem' }}>{count}条 ({percentage}%)</div>
                  </div>
                  <div style={{ 
                    height: '4px', 
                    backgroundColor: '#e0e0e0', 
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${percentage}%`, 
                      backgroundColor: getRoleColor(agent.role),
                      borderRadius: '2px'
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DiscussionStats;