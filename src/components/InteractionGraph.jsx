import React, { useEffect, useRef } from 'react';
import { theme } from '../styles/theme';

const InteractionGraph = ({ messages, agents }) => {
  const canvasRef = useRef(null);
  
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
  
  // 计算智能体之间的互动次数
  const calculateInteractions = () => {
    const interactions = {};
    const agentIds = agents.map(agent => agent.id);
    
    // 初始化互动计数器
    agentIds.forEach(fromId => {
      interactions[fromId] = {};
      agentIds.forEach(toId => {
        if (fromId !== toId) {
          interactions[fromId][toId] = 0;
        }
      });
    });
    
    // 计算互动次数（一条消息后紧跟着另一个智能体的消息算作一次互动）
    for (let i = 0; i < messages.length - 1; i++) {
      const currentMessage = messages[i];
      const nextMessage = messages[i + 1];
      
      if (currentMessage.agentId !== nextMessage.agentId) {
        if (interactions[currentMessage.agentId] && 
            interactions[currentMessage.agentId][nextMessage.agentId] !== undefined) {
          interactions[currentMessage.agentId][nextMessage.agentId]++;
        }
      }
    }
    
    return interactions;
  };
  
  // 绘制互动关系图
  useEffect(() => {
    if (!canvasRef.current || messages.length < 2 || agents.length < 2) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 计算互动
    const interactions = calculateInteractions();
    
    // 计算节点位置（围成一个圆）
    const radius = Math.min(width, height) * 0.35;
    const centerX = width / 2;
    const centerY = height / 2;
    const nodePositions = {};
    
    agents.forEach((agent, index) => {
      const angle = (index / agents.length) * Math.PI * 2;
      nodePositions[agent.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        agent: agent
      };
    });
    
    // 绘制连线
    Object.keys(interactions).forEach(fromId => {
      Object.keys(interactions[fromId]).forEach(toId => {
        const interactionCount = interactions[fromId][toId];
        if (interactionCount > 0 && nodePositions[fromId] && nodePositions[toId]) {
          const fromPos = nodePositions[fromId];
          const toPos = nodePositions[toId];
          
          // 线宽基于互动次数，但有最大值
          const maxLineWidth = 5;
          const lineWidth = Math.min(1 + interactionCount / 2, maxLineWidth);
          
          // 绘制带箭头的线
          ctx.beginPath();
          ctx.moveTo(fromPos.x, fromPos.y);
          ctx.lineTo(toPos.x, toPos.y);
          ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
          ctx.lineWidth = lineWidth;
          ctx.stroke();
          
          // 绘制箭头
          const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);
          const arrowSize = 6 + lineWidth;
          
          // 计算箭头位置（距离目标节点有一定距离）
          const nodeRadius = 15;
          const arrowX = toPos.x - Math.cos(angle) * nodeRadius;
          const arrowY = toPos.y - Math.sin(angle) * nodeRadius;
          
          ctx.beginPath();
          ctx.moveTo(arrowX, arrowY);
          ctx.lineTo(
            arrowX - arrowSize * Math.cos(angle - Math.PI / 6),
            arrowY - arrowSize * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            arrowX - arrowSize * Math.cos(angle + Math.PI / 6),
            arrowY - arrowSize * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fillStyle = 'rgba(100, 100, 100, 0.7)';
          ctx.fill();
          
          // 在线中间显示互动次数
          const textX = (fromPos.x + toPos.x) / 2;
          const textY = (fromPos.y + toPos.y) / 2;
          ctx.font = '10px Arial';
          ctx.fillStyle = '#333';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // 添加白色背景使文字更清晰
          const textWidth = ctx.measureText(interactionCount.toString()).width;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(textX - textWidth / 2 - 1, textY - 6, textWidth + 2, 12);
          
          ctx.fillStyle = '#333';
          ctx.fillText(interactionCount.toString(), textX, textY);
        }
      });
    });
    
    // 绘制节点
    Object.values(nodePositions).forEach(node => {
      const { x, y, agent } = node;
      
      // 绘制圆形节点
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fillStyle = getRoleColor(agent.role);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // 绘制节点标签
      ctx.font = 'bold 10px Arial';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // 节点内显示首字母
      ctx.fillStyle = '#fff';
      ctx.fillText(agent.name.charAt(0), x, y);
      
      // 节点下方显示名称
      ctx.font = '9px Arial';
      ctx.fillStyle = '#333';
      ctx.fillText(agent.name, x, y + 28);
    });
    
  }, [messages, agents]);
  
  return (
    <div>
      {messages.length < 2 || agents.length < 2 ? (
        <div style={{ textAlign: 'center', padding: '1rem 0', color: '#666', fontSize: '0.85rem' }}>
          需要至少两个智能体和两条消息才能生成互动关系图
        </div>
      ) : (
        <canvas 
          ref={canvasRef} 
          width={280} 
          height={200} 
          style={{ width: '100%', height: 'auto', border: '1px solid #e0e0e0', borderRadius: '4px' }}
        />
      )}
    </div>
  );
};

export default InteractionGraph;