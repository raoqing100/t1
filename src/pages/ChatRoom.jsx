import React, { useState, useEffect, useCallback, useRef } from 'react';
import { theme } from '../styles/theme';
import DiscussionStats from '../components/DiscussionStats';
import InteractionGraph from '../components/InteractionGraph';
import SavedDiscussions from '../components/SavedDiscussions';
import { generateAgentResponse as apiGenerateAgentResponse, generateDiscussionSummary as apiGenerateDiscussionSummary } from '../services/api';
import { saveDiscussion, getDiscussionById, getDiscussionList, deleteDiscussion, getAgentConfigList, getAgentConfigById } from '../services/localStorage';
import '../styles/ChatRoom.css';

export default function ChatRoom({ agents: propAgents, selectedDiscussionId, onViewHistory }) {
  const [messages, setMessages] = useState([]);
  const [topic, setTopic] = useState('');
  const [isDiscussionStarted, setIsDiscussionStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showTopicSuggestions, setShowTopicSuggestions] = useState(false);
  const [currentDiscussionId, setCurrentDiscussionId] = useState(null);
  const [savedDiscussions, setSavedDiscussions] = useState([]);
  const [showSavedDiscussions, setShowSavedDiscussions] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState(null);
  const [showLoadConfigModal, setShowLoadConfigModal] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveFileName, setSaveFileName] = useState('');
  const messagesEndRef = useRef(null);
  
  const topicSuggestions = [
    '如何提高团队工作效率？',
    '人工智能对未来就业市场的影响',
    '可持续发展与环保策略',
    '远程工作的优缺点分析',
    '数字化转型面临的挑战',
    '提高创新能力的方法',
    '元宇宙的发展前景'
  ];
  
  const selectTopicSuggestion = (suggestion) => {
    setTopic(suggestion);
    setShowTopicSuggestions(false);
  };
  
  // 选择已保存的讨论记录
  const handleSelectDiscussion = useCallback((discussionId) => {
    const discussion = getDiscussionById(discussionId);
    if (discussion) {
      setCurrentDiscussionId(discussionId);
      setTopic(discussion.topic);
      setMessages(discussion.messages);
      setIsDiscussionStarted(true);
      setShowSavedDiscussions(false);
    } else {
      alert('加载讨论记录失败');
    }
  }, []);
  
  // 加载已保存的讨论记录
  useEffect(() => {
    const loadSavedDiscussions = () => {
      const discussions = getDiscussionList();
      // 按更新时间降序排序
      discussions.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setSavedDiscussions(discussions);
    };
    
    loadSavedDiscussions();
    
    // 如果有selectedDiscussionId，加载对应的讨论记录
    if (selectedDiscussionId) {
      handleSelectDiscussion(selectedDiscussionId);
    }
  }, [selectedDiscussionId, handleSelectDiscussion]);

  // 加载已保存的配置列表
  useEffect(() => {
    const configs = getAgentConfigList();
    setSavedConfigs(configs);
  }, []);
  
  // 删除讨论记录
  const handleDeleteDiscussion = (discussionId) => {
    const newDiscussions = savedDiscussions.filter(d => d.id !== discussionId);
    setSavedDiscussions(newDiscussions);
    
    // 如果删除的是当前正在查看的讨论，则重置状态
    if (discussionId === currentDiscussionId) {
      resetDiscussion();
    }
  };
  
  // 使用传入的智能体数据或默认数据
  const [agents, setAgents] = useState(propAgents || [
    { id: 'agent1', name: '小明', role: '主持人', apiKey: '', description: '负责引导讨论方向和总结观点' },
    { id: 'agent2', name: '小红', role: '创意者', apiKey: '', description: '提供创新的想法和解决方案' },
    { id: 'agent3', name: '小李', role: '批评者', apiKey: '', description: '质疑假设并指出潜在问题' },
    { id: 'agent4', name: '小张', role: '分析者', apiKey: '', description: '分析数据和趋势，提供客观见解' }
  ]);
  
  const startDiscussion = () => {
    if (!topic.trim()) {
      alert('请输入讨论主题');
      return;
    }
    
    // 创建新的讨论ID
    const newDiscussionId = `discussion_${Date.now()}`;
    setCurrentDiscussionId(newDiscussionId);
    setIsDiscussionStarted(true);
    
    // 创建系统消息作为讨论的开始
    const initialMessage = {
      id: Date.now().toString(),
      agentId: 'system',
      text: `讨论话题: ${topic}`,
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    
    const newMessages = [initialMessage];
    setMessages(newMessages);
    
    // 保存讨论记录
    saveDiscussion({
      id: newDiscussionId,
      topic: topic,
      messages: newMessages,
      agents: agents,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSummarized: false
    });
    
    // 更新已保存的讨论列表
    const updatedDiscussions = [
      {
        id: newDiscussionId,
        topic: topic,
        updatedAt: new Date().toISOString(),
        isSummarized: false
      },
      ...savedDiscussions
    ];
    setSavedDiscussions(updatedDiscussions);
    
    continueDiscussion();
  };
  
  const resetDiscussion = () => {
    setMessages([]);
    setTopic('');
    setIsDiscussionStarted(false);
    setIsLoading(false);
    setIsSummarizing(false);
    setCurrentDiscussionId(null);
    setShowSavedDiscussions(false);
  };

  // 加载智能体配置
  const handleLoadAgentConfig = (configId) => {
    const config = getAgentConfigById(configId);
    if (config && config.agents) {
      setAgents(config.agents);
      setShowLoadConfigModal(false);
      alert(`成功加载配置: ${config.name}`);
    } else {
      alert('配置加载失败');
    }
  };

  // 生成对话文本内容
  const generateConversationText = () => {
    let content = `讨论主题: ${topic}\n`;
    content += `讨论时间: ${new Date().toLocaleString()}\n`;
    content += `参与智能体: ${agents.map(agent => `${agent.name}(${agent.role})`).join(', ')}\n`;
    content += `\n${'='.repeat(50)}\n\n`;

    messages.forEach((message, index) => {
      const agent = getAgentById(message.agentId);
      if (message.agentId === 'system') {
        content += `[系统] ${message.text}\n\n`;
      } else {
        content += `${agent.name} (${agent.role}):\n`;
        content += `${message.text}\n`;
        content += `时间: ${new Date(message.timestamp).toLocaleString()}\n\n`;
      }
    });

    return content;
  };

  // 复制对话到剪贴板
  const copyConversationToClipboard = async () => {
    try {
      const content = generateConversationText();
      await navigator.clipboard.writeText(content);
      alert('对话内容已复制到剪贴板！');
    } catch (err) {
      console.error('复制失败:', err);
      alert('复制失败，请手动复制');
    }
  };

  // 下载对话为文件
  const downloadConversation = () => {
    const content = generateConversationText();
    const fileName = saveFileName.trim() || `讨论记录_${topic}_${new Date().toISOString().slice(0, 10)}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setShowSaveModal(false);
    setSaveFileName('');
    alert('对话记录已保存到本地！');
  };

  // 打开保存模态框
  const openSaveModal = () => {
    const defaultFileName = `讨论记录_${topic}_${new Date().toISOString().slice(0, 10)}`;
    setSaveFileName(defaultFileName);
    setShowSaveModal(true);
  };
  
  const getAgentById = (agentId) => {
    return agents.find(agent => agent.id === agentId) || { name: '系统', role: '系统' };
  };
  
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
      '系统': '#4A5568'
    };
    return roleColors[role] || roleColors['系统'];
  };
  
  const getRoleIcon = (role) => {
    const roleIcons = {
      '主持人': '🎯',
      '创意者': '💡',
      '批评者': '🔍',
      '整合者': '🔄',
      '分析者': '📊',
      '执行者': '🛠️',
      '协调者': '🤝',
      '专家': '🧠',
      '记录者': '📝',
      '系统': '🤖'
    };
    return roleIcons[role] || roleIcons['系统'];
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);
  
  const generateAgentResponse = async (agentId, currentMessages) => {
    const agent = getAgentById(agentId);
    
    // 准备消息历史，为每条消息添加发言者信息
    const formattedMessages = currentMessages.map(msg => {
      const msgAgent = getAgentById(msg.agentId);
      return {
        agentId: msg.agentId,
        agentName: msgAgent.name,
        text: msg.text
      };
    });
    
    // 如果API密钥为空，直接使用备用的本地生成逻辑
    if (!agent.apiKey) {
      console.log('API密钥为空，使用本地生成逻辑');
      return generateLocalResponse(agent, currentMessages);
    }
    
    try {
      console.log('准备调用API生成回复，智能体：', agent.name, '，消息数量：', formattedMessages.length);
      
      // 创建初始的流式消息对象
      const initialStreamingMessage = {
        id: Date.now().toString(),
        agentId: agent.id,
        text: '',
        timestamp: new Date().toISOString(),
        type: 'message',
        isStreaming: true
      };
      
      // 设置初始流式消息
      setStreamingMessage(initialStreamingMessage);
      
      // 处理流式响应的回调函数
      const handleStreamChunk = (chunk, fullText) => {
        setStreamingMessage(prev => ({
          ...prev,
          text: fullText
        }));
      };
      
      // 调用流式API
      const responseText = await apiGenerateAgentResponse(
        agent.apiKey,
        agent,
        formattedMessages,
        topic, // 传递讨论主题
        true, // 启用流式响应
        handleStreamChunk
      );
      
      // 清除流式消息状态
      setStreamingMessage(null);
      
      return {
        id: Date.now().toString(),
        agentId: agent.id,
        text: responseText,
        timestamp: new Date().toISOString(),
        type: 'message'
      };
    } catch (error) {
      console.error(`${agent.name}生成回复失败:`, error);
      
      // 清除流式消息状态
      setStreamingMessage(null);
      
      // 返回错误消息
      return {
        id: Date.now().toString(),
        agentId: agent.id,
        text: `抱歉，我(${agent.name})暂时无法回应，请稍后再试。`,
        timestamp: new Date().toISOString(),
        type: 'message'
      };
    }
  };
  
  // 本地生成智能体回复的函数
  const generateLocalResponse = (agent, currentMessages) => {
    let responseText = '';
    
    // 根据角色和之前的对话内容生成回复
    switch(agent.role) {
      case '主持人':
        if (currentMessages.length === 0) {
          responseText = `让我们开始讨论"${topic}"。每个人可以先分享一下自己的初步想法。`;
        } else if (currentMessages.length < 3) {
          responseText = `让我们继续讨论"${topic}"。每个人可以先分享一下自己的初步想法。`;
        } else {
          // 根据之前的讨论内容，提出更深入的问题
          const lastMessage = currentMessages[currentMessages.length - 1];
          const lastAgent = getAgentById(lastMessage.agentId);
          responseText = `感谢${lastAgent.name}的观点。关于"${topic}"，我们已经有了一些讨论，现在可以更深入地探讨一下。${Math.random() > 0.5 ? '有没有人可以从不同角度分析一下这个问题？' : '我们能否结合之前的观点，提出一些具体的解决方案？'}`;
        }
        break;
      case '创意者':
        if (currentMessages.length === 0) {
          responseText = `关于"${topic}"，我有一个创新的想法：我们可以从${Math.random() > 0.5 ? '技术角度' : '用户体验角度'}来思考这个问题。`;
        } else {
          // 基于之前的讨论，提出创新观点
          responseText = `听了大家的讨论，我想从创新角度补充一点：我们可以${Math.random() > 0.5 ? '结合最新的AI技术，开发一个更智能的解决方案' : '从用户体验出发，重新设计整个流程'}。这样不仅能解决当前问题，还能为未来发展打下基础。`;
        }
        break;
      case '批评者':
        if (currentMessages.length === 0) {
          responseText = `我认为关于"${topic}"，我们需要保持谨慎，考虑一下潜在的问题。`;
        } else {
          // 基于之前的讨论，提出质疑和批评
          responseText = `我理解大家的观点，但我认为我们需要考虑一些潜在的问题：${Math.random() > 0.5 ? '这个方案的实施成本可能过高，投入产出比值得商榷' : '在实际操作中可能会遇到很多技术和管理上的阻力'}。我们是否充分评估了这些风险？`;
        }
        break;
      case '分析者':
        if (currentMessages.length === 0) {
          responseText = `从分析的角度看，关于"${topic}"，我们需要更多的数据支持。`;
        } else {
          // 基于之前的讨论，提供数据分析
          responseText = `根据我对之前讨论的分析，${Math.random() > 0.5 ? '当前的市场趋势表明这个方向是有潜力的' : '数据显示用户确实有这方面的需求'}。不过，我们需要更多的${Math.random() > 0.5 ? '用户反馈' : '实验数据'}来验证我们的假设，确保我们的方案是可行的。`;
        }
        break;
      default:
        if (currentMessages.length === 0) {
          responseText = `关于"${topic}"，我认为我们应该从多角度思考。`;
        } else {
          responseText = `关于"${topic}"，听了大家的讨论，我认为${Math.random() > 0.5 ? '我们应该平衡创新和实用性' : '我们需要更具体的行动计划'}。`;
        }
    }
    
    return {
      id: Date.now().toString(),
      agentId: agent.id,
      text: responseText,
      timestamp: new Date().toISOString(),
      type: 'message'
    };
  };
  
  const continueDiscussion = async () => {
    setIsLoading(true);
    
    try {
      let nextAgentId;
      
      if (messages.length === 0) {
        nextAgentId = agents[0].id; // 第一个智能体开始
      } else {
        // 确定下一个发言的智能体
        const lastMessageAgentIndex = agents.findIndex(agent => 
          agent.id === messages[messages.length - 1].agentId
        );
        
        const nextAgentIndex = (lastMessageAgentIndex + 1) % agents.length;
        nextAgentId = agents[nextAgentIndex].id;
      }
      
      // 异步生成智能体回复
      const newMessage = await generateAgentResponse(nextAgentId, messages);
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      
      // 更新讨论记录
      if (currentDiscussionId) {
        saveDiscussion({
          id: currentDiscussionId,
          topic: topic,
          messages: updatedMessages,
          agents: agents,
          createdAt: getDiscussionById(currentDiscussionId)?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('继续讨论失败:', error);
      alert('生成回复时出现错误，请检查API密钥或网络连接');
    } finally {
      setIsLoading(false);
    }
  };
  
  const summarizeDiscussion = async () => {
    setIsSummarizing(true);
    
    try {
      // 获取第一个智能体的API密钥用于生成总结
      // 这里假设至少有一个智能体，且第一个智能体有有效的API密钥
      const apiKey = agents[0].apiKey;
      
      // 过滤掉系统消息，只保留智能体的发言
      const discussionMessages = messages.filter(msg => msg.type === 'message');
      
      // 为每条消息添加发言者信息
      const formattedMessages = discussionMessages.map(msg => {
        const agent = getAgentById(msg.agentId);
        return {
          ...msg,
          agentName: agent.name
        };
      });
      
      // 创建初始的流式消息对象
      const initialSummaryMessage = {
        id: Date.now().toString(),
        agentId: 'system',
        text: '',
        timestamp: new Date().toISOString(),
        type: 'summary',
        isStreaming: true
      };
      
      // 设置初始流式消息
      setStreamingMessage(initialSummaryMessage);
      
      // 处理流式响应的回调函数
      const handleStreamChunk = (chunk, fullText) => {
        setStreamingMessage(prev => ({
          ...prev,
          text: fullText
        }));
      };
      
      // 调用流式API生成总结
      const summaryText = await apiGenerateDiscussionSummary(
        apiKey, 
        topic, 
        formattedMessages,
        true, // 启用流式响应
        handleStreamChunk
      );
      
      // 清除流式消息状态
      setStreamingMessage(null);
      
      const summaryMessage = {
        id: Date.now().toString(),
        agentId: 'system',
        text: summaryText,
        timestamp: new Date().toISOString(),
        type: 'summary'
      };
      
      const updatedMessages = [...messages, summaryMessage];
      setMessages(updatedMessages);
      
      // 更新讨论记录
      if (currentDiscussionId) {
        saveDiscussion({
          id: currentDiscussionId,
          topic: topic,
          messages: updatedMessages,
          agents: agents,
          createdAt: getDiscussionById(currentDiscussionId)?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isSummarized: true
        });
      }
    } catch (error) {
      console.error('生成讨论总结失败:', error);
      
      // 清除流式消息状态
      setStreamingMessage(null);
      
      // 如果API调用失败，使用备用的本地生成逻辑
      const summaryMessage = {
        id: Date.now().toString(),
        agentId: 'system',
        text: `讨论总结：关于"${topic}"的讨论中，参与者提出了多个观点。主要包括了创新思路、潜在问题分析以及数据支持的见解。团队需要进一步深入探讨具体实施方案和评估可行性。`,
        timestamp: new Date().toISOString(),
        type: 'summary'
      };
      
      const updatedMessages = [...messages, summaryMessage];
      setMessages(updatedMessages);
      
      // 更新讨论记录
      if (currentDiscussionId) {
        saveDiscussion({
          id: currentDiscussionId,
          topic: topic,
          messages: updatedMessages,
          agents: agents,
          createdAt: getDiscussionById(currentDiscussionId)?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isSummarized: true
        });
      }
      
      alert('生成总结时出现错误，已使用备用总结');
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: theme.colors.primary, margin: 0, textAlign: 'center', flex: 1 }}>
          多智能体头脑风暴
        </h2>
        {!isDiscussionStarted && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setShowSavedDiscussions(true)}
              style={{
                backgroundColor: theme.colors.secondary,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>📋</span>
              最近讨论
            </button>
            <button
              onClick={onViewHistory}
              style={{
                backgroundColor: theme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🗂️</span>
              历史记录
            </button>
          </div>
        )}
      </div>
      
      {/* 显示已保存的讨论记录 */}
      {showSavedDiscussions && (
        <SavedDiscussions
          discussions={savedDiscussions}
          onSelectDiscussion={handleSelectDiscussion}
          onDeleteDiscussion={handleDeleteDiscussion}
          onClose={() => setShowSavedDiscussions(false)}
        />
      )}
      
      {!isDiscussionStarted ? (
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            color: theme.colors.primary, 
            marginTop: 0, 
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            开始新讨论
          </h3>
          
          <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
            <label htmlFor="topic" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              讨论话题：
            </label>
            <input 
              id="topic"
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '1rem'
              }}
              placeholder="输入讨论话题..."
            />
            
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <button 
                onClick={() => setShowTopicSuggestions(!showTopicSuggestions)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: theme.colors.primary,
                  cursor: 'pointer',
                  padding: '0.25rem 0',
                  fontSize: '0.875rem',
                  textDecoration: 'underline'
                }}
              >
                话题建议
              </button>
            </div>
            
            {showTopicSuggestions && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 10,
                marginTop: '0.25rem'
              }}>
                {topicSuggestions.map((suggestion, index) => (
                  <div 
                    key={index}
                    onClick={() => selectTopicSuggestion(suggestion)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderBottom: index < topicSuggestions.length - 1 ? '1px solid #eee' : 'none',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button 
              onClick={() => setShowLoadConfigModal(true)}
              style={{
                backgroundColor: theme.colors.secondary,
                color: 'white',
                padding: '0.75rem 1rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                flex: 1,
                fontSize: '0.9rem'
              }}
            >
              加载配置
            </button>
          </div>

          <button 
            onClick={startDiscussion}
            style={{
              backgroundColor: theme.colors.primary,
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              width: '100%',
              fontSize: '1rem'
            }}
          >
            开始讨论
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 200px)' }}>
          {/* 左侧聊天区域 */}
          <div style={{ flex: '2.5', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button 
                onClick={resetDiscussion}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ fontSize: '1rem' }}>🗑️</span>
                重置讨论
              </button>
            </div>
            
            <div style={{ 
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <h3 style={{ marginTop: 0, color: theme.colors.primary }}>
                讨论主题: {topic}
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                {messages.map((message) => {
                  const agent = getAgentById(message.agentId);
                  const isSystemMessage = message.agentId === 'system';
                  const isSummary = message.type === 'summary';
                  
                  return (
                    <div 
                      key={message.id} 
                      style={{
                        marginBottom: '1rem',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        backgroundColor: isSummary ? '#f0f4f8' : isSystemMessage ? '#f0f0f0' : 'white',
                        borderLeft: !isSystemMessage ? `4px solid ${getRoleColor(agent.role)}` : 'none',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                    >
                      {!isSystemMessage && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          marginBottom: '0.5rem' 
                        }}>
                          <div style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '50%', 
                            backgroundColor: getRoleColor(agent.role),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            marginRight: '0.75rem'
                          }}>
                            {agent.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>{agent.name}</div>
                            <div style={{ 
                              fontSize: '0.8rem', 
                              color: '#666',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <span style={{ marginRight: '0.25rem' }}>{getRoleIcon(agent.role)}</span>
                              {agent.role}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div style={{ 
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.5',
                        color: isSystemMessage ? '#444' : '#333'
                      }}>
                        {message.text}
                      </div>
                      
                      {!isSystemMessage && (
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: '#999', 
                          textAlign: 'right',
                          marginTop: '0.5rem'
                        }}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {/* 显示正在流式生成的消息 */}
                {streamingMessage && (
                  <div 
                    key="streaming-message" 
                    style={{
                      marginBottom: '1rem',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: streamingMessage.type === 'summary' ? '#f0f4f8' : streamingMessage.agentId === 'system' ? '#f0f0f0' : 'white',
                      borderLeft: streamingMessage.agentId !== 'system' ? `4px solid ${getRoleColor(getAgentById(streamingMessage.agentId).role)}` : 'none',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    {streamingMessage.agentId !== 'system' && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        marginBottom: '0.5rem' 
                      }}>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          backgroundColor: getRoleColor(getAgentById(streamingMessage.agentId).role),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          marginRight: '0.75rem'
                        }}>
                          {getAgentById(streamingMessage.agentId).name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{getAgentById(streamingMessage.agentId).name}</div>
                          <div style={{ 
                            fontSize: '0.8rem', 
                            color: '#666',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <span style={{ marginRight: '0.25rem' }}>{getRoleIcon(getAgentById(streamingMessage.agentId).role)}</span>
                            {getAgentById(streamingMessage.agentId).role}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div style={{ 
                      whiteSpace: 'pre-wrap',
                      lineHeight: '1.5',
                      color: streamingMessage.agentId === 'system' ? '#444' : '#333'
                    }}>
                      {streamingMessage.text}
                      <span className="typing-cursor" style={{
                        display: 'inline-block',
                        width: '0.5em',
                        height: '1.2em',
                        backgroundColor: '#333',
                        marginLeft: '2px',
                        animation: 'blink 1s infinite'
                      }}></span>
                      <style>{`
                        @keyframes blink {
                          0%, 100% { opacity: 1; }
                          50% { opacity: 0; }
                        }
                      `}</style>
                    </div>
                    
                    {streamingMessage.agentId !== 'system' && (
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#999', 
                        textAlign: 'right',
                        marginTop: '0.5rem'
                      }}>
                        {new Date(streamingMessage.timestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                )}
                
                {/* 引用以便滚动到底部 */}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '0.75rem', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={continueDiscussion}
                disabled={isLoading || isSummarizing}
                style={{
                  backgroundColor: theme.colors.primary,
                  color: 'white',
                  padding: '0.75rem 1.25rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading || isSummarizing ? 'not-allowed' : 'pointer',
                  opacity: isLoading || isSummarizing ? 0.7 : 1,
                  fontWeight: 'bold',
                  flex: 1,
                  minWidth: '120px',
                  maxWidth: '160px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem'
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      border: '2px solid rgba(255,255,255,0.3)', 
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <style>{`
                      @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                    `}</style>
                    生成中...
                  </>
                ) : (
                  <>
                    <span>💬</span>
                    继续讨论
                  </>
                )}
              </button>
              
              <button 
                onClick={summarizeDiscussion}
                disabled={isLoading || isSummarizing || messages.length < 4}
                style={{
                  backgroundColor: theme.colors.secondary,
                  color: 'white',
                  padding: '0.75rem 1.25rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading || isSummarizing || messages.length < 4 ? 'not-allowed' : 'pointer',
                  opacity: isLoading || isSummarizing || messages.length < 4 ? 0.7 : 1,
                  fontWeight: 'bold',
                  flex: 1,
                  minWidth: '120px',
                  maxWidth: '160px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem'
                }}
              >
                {isSummarizing ? (
                  <>
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      border: '2px solid rgba(255,255,255,0.3)', 
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    总结中...
                  </>
                ) : (
                  <>
                    <span>📝</span>
                    总结讨论
                  </>
                )}
              </button>

              <button 
                onClick={openSaveModal}
                disabled={messages.length < 2}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  padding: '0.75rem 1.25rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: messages.length < 2 ? 'not-allowed' : 'pointer',
                  opacity: messages.length < 2 ? 0.7 : 1,
                  fontWeight: 'bold',
                  flex: 1,
                  minWidth: '120px',
                  maxWidth: '160px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem'
                }}
              >
                <span>💾</span>
                保存对话
              </button>

              <button 
                onClick={copyConversationToClipboard}
                disabled={messages.length < 2}
                style={{
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  padding: '0.75rem 1.25rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: messages.length < 2 ? 'not-allowed' : 'pointer',
                  opacity: messages.length < 2 ? 0.7 : 1,
                  fontWeight: 'bold',
                  flex: 1,
                  minWidth: '120px',
                  maxWidth: '160px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem'
                }}
              >
                <span>📋</span>
                复制对话
              </button>
            </div>
          </div>

          {/* 右侧统计区域 */}
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.length > 0 && (
              <>
                <div style={{ 
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '1rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  height: 'fit-content'
                }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: theme.colors.primary, fontSize: '1rem' }}>
                    讨论统计
                  </h4>
                  <DiscussionStats messages={messages} agents={agents} />
                </div>
                
                <div style={{ 
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '1rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  height: 'fit-content'
                }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: theme.colors.primary, fontSize: '1rem' }}>
                    互动关系图
                  </h4>
                  <InteractionGraph messages={messages} agents={agents} />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 加载配置模态框 */}
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
        }} onClick={() => setShowLoadConfigModal(false)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: theme.colors.primary }}>
              加载智能体配置
            </h3>
            {savedConfigs.length === 0 ? (
              <p>暂无已保存的配置</p>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {savedConfigs.map(config => (
                  <div key={config.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    backgroundColor: '#f9f9f9'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', color: '#333' }}>{config.name}</h4>
                      <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '0.9em' }}>
                        {config.description}
                      </p>
                      <small style={{ color: '#999', fontSize: '0.8em' }}>
                        创建时间: {new Date(config.createdAt).toLocaleString()}
                      </small>
                    </div>
                    <button 
                      onClick={() => handleLoadAgentConfig(config.id)}
                      style={{
                        backgroundColor: theme.colors.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        marginLeft: '12px'
                      }}
                    >
                      加载
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '20px'
            }}>
              <button 
                onClick={() => setShowLoadConfigModal(false)}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
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

      {/* 保存对话模态框 */}
      {showSaveModal && (
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
        }} onClick={() => setShowSaveModal(false)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ 
              marginTop: 0, 
              marginBottom: '20px', 
              color: theme.colors.primary,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>💾</span>
              保存对话记录
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold',
                color: '#333'
              }}>
                文件名：
              </label>
              <input 
                type="text"
                value={saveFileName}
                onChange={(e) => setSaveFileName(e.target.value)}
                placeholder="输入文件名（不含扩展名）"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              <small style={{ color: '#666', fontSize: '12px' }}>
                文件将保存为 .txt 格式
              </small>
            </div>

            <div style={{ 
              backgroundColor: '#f8f9fa',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '20px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#495057', fontSize: '14px' }}>
                保存内容预览：
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#6c757d', fontSize: '13px' }}>
                <li>讨论主题和时间</li>
                <li>参与智能体信息</li>
                <li>完整对话记录（{messages.length} 条消息）</li>
                <li>每条消息的时间戳</li>
              </ul>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button 
                onClick={() => setShowSaveModal(false)}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                取消
              </button>
              <button 
                onClick={copyConversationToClipboard}
                style={{
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>📋</span>
                复制到剪贴板
              </button>
              <button 
                onClick={downloadConversation}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>💾</span>
                下载文件
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}