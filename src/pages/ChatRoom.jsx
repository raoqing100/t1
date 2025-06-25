import React, { useState, useEffect, useCallback, useRef } from 'react';
import { theme } from '../styles/theme';
import DiscussionStats from '../components/DiscussionStats';
import InteractionGraph from '../components/InteractionGraph';
import SavedDiscussions from '../components/SavedDiscussions';
import { generateAgentResponse as apiGenerateAgentResponse, generateDiscussionSummary as apiGenerateDiscussionSummary, isReasoningModel, parseReasoningResponse } from '../services/api';
import { saveDiscussion, getDiscussionById, getDiscussionList, getAgentConfigList, getAgentConfigById, moderatorConfigStorage } from '../services/localStorage';
import { DiscussionModerator } from '../services/moderator';
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
  
  // 新增主持人相关状态
  const [knowledgeBase, setKnowledgeBase] = useState('');
  const [moderatorEnabled, setModeratorEnabled] = useState(true);
  const [discussionMode, setDiscussionMode] = useState('sequential'); // 'sequential' 轮流发言 或 'round' 轮次发言
  const [moderator, setModerator] = useState(null);
  const [qualityReport, setQualityReport] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentRound, setCurrentRound] = useState(0); // 当前轮次
  const [autoScroll, setAutoScroll] = useState(true); // 控制是否自动滚动
  const [userScrolledUp, setUserScrolledUp] = useState(false); // 用户是否向上滚动
  
  // 用户参与讨论相关状态
  const [showUserInput, setShowUserInput] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [userName, setUserName] = useState('用户'); // 可以让用户自定义名字
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
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

  // 处理文件上传
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const newFile = {
          id: Date.now() + Math.random(),
          name: file.name,
          content: content,
          type: file.type,
          uploadedAt: new Date().toISOString()
        };
        
        setUploadedFiles(prev => [...prev, newFile]);
        
        // 将文件内容添加到知识库
        const fileContent = `\n\n📄 文件: ${file.name}\n${content}`;
        setKnowledgeBase(prev => prev + fileContent);
      };
      
      reader.readAsText(file);
    });
  };

  // 删除上传的文件
  const handleRemoveFile = (fileId) => {
    const fileToRemove = uploadedFiles.find(f => f.id === fileId);
    if (fileToRemove) {
      // 从知识库中移除文件内容
      const fileContent = `\n\n📄 文件: ${fileToRemove.name}\n${fileToRemove.content}`;
      setKnowledgeBase(prev => prev.replace(fileContent, ''));
      
      // 从文件列表中移除
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    }
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
    let initialMessages = [];
    
    // 系统消息
    const systemMessage = {
      id: Date.now().toString(),
      agentId: 'system',
      text: `讨论话题: ${topic}`,
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    initialMessages.push(systemMessage);
    
    // 如果有知识库，添加知识库消息
    if (knowledgeBase.trim()) {
      const knowledgeMessage = {
        id: (Date.now() + 1).toString(),
        agentId: 'system',
        text: `📚 背景知识库：\n${knowledgeBase}`,
        timestamp: new Date().toISOString(),
        type: 'knowledge'
      };
      initialMessages.push(knowledgeMessage);
    }
    
    // 初始化主持人并让其开场发言
    if (moderatorEnabled) {
      const moderatorConfig = moderatorConfigStorage.getModeratorConfig();
      console.log('🎭 初始化主持人:', {
        moderatorEnabled,
        moderatorConfig,
        hasApiKey: !!moderatorConfig.apiKey,
        topic,
        agentCount: agents.length
      });
      
      const newModerator = new DiscussionModerator(agents, topic, knowledgeBase, moderatorConfig);
      setModerator(newModerator);
      console.log('✅ 主持人初始化完成');
      
      // 主持人开场发言（同步添加到初始消息中）
      setTimeout(async () => {
        try {
          const openingMessage = await newModerator.generateOpeningMessage();
          if (openingMessage) {
            console.log('🎭 主持人开场发言生成:', openingMessage);
            // 直接更新消息列表，添加主持人开场
            setMessages(prev => [...prev, openingMessage]);
            console.log('🎭 主持人开场发言已添加');
          }
        } catch (error) {
          console.error('主持人开场发言生成失败:', error);
        }
      }, 500); // 延迟500ms确保UI更新完成
    } else {
      console.log('⏭️ 主持人功能未启用');
      setModerator(null);
    }
    
    // 设置初始消息
    setMessages(initialMessages);
    
    // 保存讨论记录
    saveDiscussion({
      id: newDiscussionId,
      topic: topic,
      messages: initialMessages,
      agents: agents,
      knowledgeBase: knowledgeBase,
      moderatorEnabled: moderatorEnabled,
      discussionMode: discussionMode,
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
    
    // 不自动开始讨论，让用户手动点击"继续讨论"按钮
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
    if (agentId === 'user') {
      return {
        id: 'user',
        name: userName,
        role: '参与者',
        description: '讨论参与者'
      };
    }
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
      '参与者': '#E53E3E',
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
      '参与者': '👤',
      '系统': '🤖'
    };
    return roleIcons[role] || roleIcons['系统'];
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 检查用户是否向上滚动
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px的缓冲区
    
    if (isAtBottom) {
      setUserScrolledUp(false);
      setAutoScroll(true);
    } else {
      setUserScrolledUp(true);
      setAutoScroll(false);
    }
  };

  // 智能滚动控制
  useEffect(() => {
    if (autoScroll && !userScrolledUp) {
    scrollToBottom();
    }
  }, [messages, streamingMessage, autoScroll, userScrolledUp]);

  // 手动滚动到底部的函数
  const forceScrollToBottom = () => {
    setUserScrolledUp(false);
    setAutoScroll(true);
    scrollToBottom();
  };

  // 用户参与讨论的处理函数
  const handleUserParticipate = () => {
    if (!userMessage.trim()) {
      alert('请输入您的发言内容');
      return;
    }

    // 创建用户消息
    const userMessageObj = {
      id: Date.now().toString(),
      agentId: 'user',
      text: userMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'message',
      userName: userName
    };

    // 添加用户消息到讨论中
    setMessages(prev => [...prev, userMessageObj]);
    
    // 清空输入框并隐藏输入区域
    setUserMessage('');
    setShowUserInput(false);
    
    // 自动滚动到底部
    setTimeout(() => {
      forceScrollToBottom();
    }, 100);
  };

  // 显示/隐藏用户输入区域
  const toggleUserInput = () => {
    setShowUserInput(!showUserInput);
    if (!showUserInput) {
      // 显示输入框时自动聚焦
      setTimeout(() => {
        const textarea = document.getElementById('user-message-input');
        if (textarea) textarea.focus();
      }, 100);
    }
  };
  
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
      console.log('模型检查：', agent.model, '是否为推理模型：', isReasoningModel(agent.model));
      
      // 检查是否为推理模型
      const isReasoning = isReasoningModel(agent.model);
      
      // 创建初始的流式消息对象
      const initialStreamingMessage = {
        id: Date.now().toString(),
        agentId: agent.id,
        text: '',
        timestamp: new Date().toISOString(),
        type: 'message',
        isStreaming: true,
        isReasoning: isReasoning,
        thinking: '',
        answer: ''
      };
      
      // 设置初始流式消息
      setStreamingMessage(initialStreamingMessage);
      
      // 处理流式响应的回调函数
      const handleStreamChunk = (chunk, fullText) => {
        if (isReasoning) {
          // 对推理模型，实时解析思考过程和答案
          const parsed = parseReasoningResponse(fullText);
          setStreamingMessage(prev => ({
            ...prev,
            text: fullText,
            thinking: parsed.thinking,
            answer: parsed.answer
          }));
        } else {
          // 普通模型直接更新文本
        setStreamingMessage(prev => ({
          ...prev,
          text: fullText
        }));
        }
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
      
      // 如果是推理模型，解析最终响应
      if (isReasoning) {
        const parsed = parseReasoningResponse(responseText);
        return {
          id: Date.now().toString(),
          agentId: agent.id,
          text: responseText,
          timestamp: new Date().toISOString(),
          type: 'message',
          isReasoning: true,
          thinking: parsed.thinking,
          answer: parsed.answer
        };
      } else {
      return {
        id: Date.now().toString(),
        agentId: agent.id,
        text: responseText,
        timestamp: new Date().toISOString(),
        type: 'message'
      };
      }
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
  


  // 限制发言长度
  const limitMessageLength = (text, maxLength = 300) => {
    if (text.length <= maxLength) return text;
    
    // 在最后一个句号或问号处截断，保持完整性
    const truncated = text.substring(0, maxLength);
    const lastPunctuation = Math.max(
      truncated.lastIndexOf('。'),
      truncated.lastIndexOf('？'),
      truncated.lastIndexOf('！')
    );
    
    if (lastPunctuation > maxLength * 0.7) {
      return truncated.substring(0, lastPunctuation + 1);
    }
    
    return truncated + '...';
  };
  
  const continueDiscussion = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const currentMessages = [...messages];
      
      // 第一步：检查是否需要主持人引导
      // 排除系统消息和主持人自己的消息，只计算智能体的实际讨论消息
      const agentMessages = currentMessages.filter(msg => 
        msg.type === 'message' && agents.some(agent => agent.id === msg.agentId)
      );
      
      // 主持人发言条件：从第2轮开始，每轮都让主持人先引导
      const shouldModeratorSpeak = moderatorEnabled && moderator && agentMessages.length >= 1;
      
      console.log('🔍 主持人发言检查:', {
        moderatorEnabled,
        moderatorExists: !!moderator,
        totalMessages: currentMessages.length,
        agentMessages: agentMessages.length,
        shouldModeratorSpeak
      });
      
      if (shouldModeratorSpeak) {
        console.log('🎭 主持人开始本轮引导...');
        try {
          const moderatorGuidance = await moderator.moderate(currentMessages);
          console.log('🎭 主持人引导结果:', moderatorGuidance);
          
          if (moderatorGuidance) {
            currentMessages.push(moderatorGuidance);
            setMessages([...currentMessages]);
            
            // 更新质量报告
            const report = moderator.getQualityReport();
            setQualityReport(report);
            console.log('📊 质量报告更新:', report);
            
            // 给用户一点时间阅读主持人的引导
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            console.log('❌ 主持人返回了空结果');
          }
        } catch (error) {
          console.error('❌ 主持人调用失败:', error);
        }
      } else {
        console.log('⏭️ 本轮跳过主持人引导（首轮或主持人未启用）');
      }
      
      const agentResponses = [];
      
      if (discussionMode === 'sequential') {
        // 轮流发言模式：按顺序让智能体发言
      let nextAgentId;
      
        // 找到最后一个发言的智能体（排除系统消息和主持人消息）
        const lastAgentMessage = currentMessages.slice().reverse().find(msg => 
          msg.type === 'message' && agents.some(agent => agent.id === msg.agentId)
        );
        
        if (!lastAgentMessage) {
        nextAgentId = agents[0].id; // 第一个智能体开始
      } else {
        const lastMessageAgentIndex = agents.findIndex(agent => 
            agent.id === lastAgentMessage.agentId
        );
        const nextAgentIndex = (lastMessageAgentIndex + 1) % agents.length;
        nextAgentId = agents[nextAgentIndex].id;
      }
      
        try {
          const response = await generateAgentResponse(nextAgentId, currentMessages);
          if (response) {
            // 限制发言长度
            response.text = limitMessageLength(response.text);
            agentResponses.push(response);
            currentMessages.push(response);
          }
        } catch (error) {
          console.error(`为智能体生成回应失败:`, error);
        }
      } else if (discussionMode === 'round') {
        // 轮次发言模式：点击一次，所有人轮流发言一次
        const baseMessages = [...currentMessages];
        
        // 异步处理每个智能体的发言，不阻塞UI
        const processAgentsSequentially = async () => {
          for (let i = 0; i < agents.length; i++) {
            try {
              const response = await generateAgentResponse(agents[i].id, baseMessages);
              if (response) {
                // 限制发言长度
                response.text = limitMessageLength(response.text);
                agentResponses.push(response);
                baseMessages.push(response);
                
                // 实时更新消息列表，让用户能看到每个智能体的发言
                setMessages(prev => [...prev, response]);
              }
            } catch (error) {
              console.error(`为智能体 ${agents[i].name} 生成回应失败:`, error);
            }
          }
          
          // 所有智能体发言完成后更新轮次
          setCurrentRound(prev => prev + 1);
      
      // 更新讨论记录
      if (currentDiscussionId) {
            const discussionData = getDiscussionById(currentDiscussionId) || {};
            const finalMessages = [...baseMessages.slice(0, baseMessages.length - agentResponses.length), ...agentResponses];
        saveDiscussion({
          id: currentDiscussionId,
          topic: topic,
              messages: finalMessages,
          agents: agents,
              knowledgeBase: knowledgeBase,
              moderatorEnabled: moderatorEnabled,
              discussionMode: discussionMode,
              createdAt: discussionData.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isSummarized: false
            });
          }
        };
        
        // 启动异步处理，不等待完成
        processAgentsSequentially().finally(() => {
          setIsLoading(false);
        });
        
        // 立即返回，不阻塞UI
        return;
      }
      
      // 更新消息列表（只对sequential模式）
      setMessages(currentMessages);
      
      // 更新讨论记录（只对sequential模式）
      if (currentDiscussionId) {
        const discussionData = getDiscussionById(currentDiscussionId) || {};
        saveDiscussion({
          id: currentDiscussionId,
          topic: topic,
          messages: currentMessages,
          agents: agents,
          knowledgeBase: knowledgeBase,
          moderatorEnabled: moderatorEnabled,
          discussionMode: discussionMode,
          createdAt: discussionData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isSummarized: false
        });
      }
    } catch (error) {
      console.error('继续讨论失败:', error);
      alert('生成回复时出现错误，请检查API密钥或网络连接');
    } finally {
      // 只对sequential模式设置loading为false，round模式在异步函数中处理
      if (discussionMode === 'sequential') {
      setIsLoading(false);
      }
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
          
          {/* 知识库输入区域 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label htmlFor="knowledge" style={{ fontWeight: 'bold' }}>
                背景知识库（可选）：
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="file"
                  id="fileUpload"
                  multiple
                  accept=".txt,.md,.doc,.docx"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => document.getElementById('fileUpload').click()}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.5rem 0.75rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  📁 上传文档
                </button>
              </div>
            </div>
            
            {/* 显示已上传的文件 */}
            {uploadedFiles.length > 0 && (
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>
                  已上传文件：
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {uploadedFiles.map(file => (
                    <div key={file.id} style={{
                      backgroundColor: '#e3f2fd',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      📄 {file.name}
                      <button
                        onClick={() => handleRemoveFile(file.id)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#f44336',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          padding: '0'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <textarea 
              id="knowledge"
              value={knowledgeBase}
              onChange={(e) => setKnowledgeBase(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '0.9rem',
                minHeight: '80px',
                resize: 'vertical'
              }}
              placeholder="输入与讨论话题相关的背景资料、数据、案例等，帮助智能体更好地理解上下文..."
            />
          </div>

          {/* 讨论模式选择 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              讨论模式：
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="discussionMode" 
                  value="sequential"
                  checked={discussionMode === 'sequential'}
                  onChange={(e) => setDiscussionMode(e.target.value)}
                  style={{ marginRight: '0.5rem' }}
                />
                <div>
                  <span style={{ fontWeight: 'bold' }}>轮流发言</span>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>智能体按顺序逐个发言，适合深度讨论</div>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="discussionMode" 
                  value="round"
                  checked={discussionMode === 'round'}
                  onChange={(e) => setDiscussionMode(e.target.value)}
                  style={{ marginRight: '0.5rem' }}
                />
                <div>
                  <span style={{ fontWeight: 'bold' }}>轮次发言</span>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>点击一次，所有智能体轮流发言一轮，适合快速收集观点</div>
                </div>
              </label>
            </div>
          </div>

          {/* 主持人功能开关 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={moderatorEnabled}
                onChange={(e) => setModeratorEnabled(e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              <span style={{ fontWeight: 'bold' }}>启用智能主持人</span>
            </label>
            <p style={{ margin: '0.5rem 0 0 1.5rem', fontSize: '0.85rem', color: '#666' }}>
              主持人将分析讨论状态，提供引导问题，确保讨论深度和质量
            </p>
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
        <div style={{ 
          display: 'flex', 
          gap: '1.5rem', 
          height: 'calc(100vh - 280px)', /* 为底部按钮留出更多空间 */
          marginBottom: '80px' /* 为固定底部按钮留出空间 */
        }}>
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
            
            <div 
              ref={messagesContainerRef}
              onScroll={handleScroll}
              style={{ 
                flex: 1,
                overflowY: 'auto',
                padding: '1rem',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                position: 'relative'
              }}
            >
              <h3 style={{ marginTop: 0, color: theme.colors.primary }}>
                讨论主题: {topic}
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                {messages.map((message) => {
                  const agent = getAgentById(message.agentId);
                  const isSystemMessage = message.agentId === 'system';
                  const isModeratorMessage = message.type === 'moderator';
                  const isSummary = message.type === 'summary';
                  const isKnowledge = message.type === 'knowledge';
                  
                  return (
                    <div 
                      key={message.id} 
                      style={{
                        marginBottom: '1rem',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        backgroundColor: isSummary ? '#f0f4f8' : 
                                       isModeratorMessage ? '#fff3cd' : 
                                       isKnowledge ? '#e8f5e8' :
                                       isSystemMessage ? '#f0f0f0' : 'white',
                        borderLeft: isModeratorMessage ? '4px solid #ffc107' :
                                  !isSystemMessage && !isKnowledge ? `4px solid ${getRoleColor(agent.role)}` : 
                                  isKnowledge ? '4px solid #28a745' : 'none',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                    >
                      {!isSystemMessage && !isKnowledge && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          marginBottom: '0.5rem' 
                        }}>
                          <div style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '50%', 
                            backgroundColor: isModeratorMessage ? '#ffc107' : getRoleColor(agent.role),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            marginRight: '0.75rem'
                          }}>
                            {isModeratorMessage ? '🎭' : agent.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>
                              {isModeratorMessage ? '讨论主持人' : agent.name}
                            </div>
                            <div style={{ 
                              fontSize: '0.8rem', 
                              color: '#666',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <span style={{ marginRight: '0.25rem' }}>
                                {isModeratorMessage ? '🎯' : getRoleIcon(agent.role)}
                              </span>
                              {isModeratorMessage ? '主持人' : agent.role}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* 如果是推理模型，显示思考过程和答案 */}
                      {message.isReasoning ? (
                        <div>
                          {/* 思考过程 */}
                          {message.thinking && (
                            <div style={{
                              backgroundColor: '#f8f9fa',
                              border: '1px solid #e9ecef',
                              borderRadius: '6px',
                              padding: '0.75rem',
                              marginBottom: '0.75rem'
                            }}>
                              <div style={{
                                fontWeight: 'bold',
                                color: '#6c757d',
                                fontSize: '0.9rem',
                                marginBottom: '0.5rem',
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                🤔 思考过程：
                              </div>
                              <div style={{
                                whiteSpace: 'pre-wrap',
                                lineHeight: '1.4',
                                color: '#6c757d',
                                fontSize: '0.9rem',
                                fontStyle: 'italic'
                              }}>
                                {message.thinking}
                              </div>
                            </div>
                          )}
                          
                          {/* 最终答案 */}
                          <div style={{
                            backgroundColor: '#fff',
                            border: '2px solid #28a745',
                            borderRadius: '6px',
                            padding: '0.75rem'
                          }}>
                            <div style={{
                              fontWeight: 'bold',
                              color: '#28a745',
                              fontSize: '0.9rem',
                              marginBottom: '0.5rem',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              💡 最终回答：
                            </div>
                            <div style={{
                              whiteSpace: 'pre-wrap',
                              lineHeight: '1.5',
                              color: '#333'
                            }}>
                              {message.answer || message.text}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* 普通消息显示 */
                      <div style={{ 
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.5',
                        color: isSystemMessage ? '#444' : '#333'
                      }}>
                        {message.text}
                      </div>
                      )}
                      
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
                    
                    {/* 如果是推理模型的流式消息，显示思考过程和答案 */}
                    {streamingMessage.isReasoning ? (
                      <div>
                        {/* 思考过程 */}
                        {streamingMessage.thinking && (
                          <div style={{
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #e9ecef',
                            borderRadius: '6px',
                            padding: '0.75rem',
                            marginBottom: '0.75rem'
                          }}>
                            <div style={{
                              fontWeight: 'bold',
                              color: '#6c757d',
                              fontSize: '0.9rem',
                              marginBottom: '0.5rem',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              🤔 思考过程：
                            </div>
                            <div style={{
                              whiteSpace: 'pre-wrap',
                              lineHeight: '1.4',
                              color: '#6c757d',
                              fontSize: '0.9rem',
                              fontStyle: 'italic'
                            }}>
                              {streamingMessage.thinking}
                              <span className="typing-cursor" style={{
                                display: 'inline-block',
                                width: '0.5em',
                                height: '1.2em',
                                backgroundColor: '#6c757d',
                                marginLeft: '2px',
                                animation: 'blink 1s infinite'
                              }}></span>
                            </div>
                          </div>
                        )}
                        
                        {/* 最终答案 */}
                        {streamingMessage.answer && (
                          <div style={{
                            backgroundColor: '#fff',
                            border: '2px solid #28a745',
                            borderRadius: '6px',
                            padding: '0.75rem'
                          }}>
                            <div style={{
                              fontWeight: 'bold',
                              color: '#28a745',
                              fontSize: '0.9rem',
                              marginBottom: '0.5rem',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              💡 最终回答：
                            </div>
                            <div style={{
                              whiteSpace: 'pre-wrap',
                              lineHeight: '1.5',
                              color: '#333'
                            }}>
                              {streamingMessage.answer}
                              <span className="typing-cursor" style={{
                                display: 'inline-block',
                                width: '0.5em',
                                height: '1.2em',
                                backgroundColor: '#333',
                                marginLeft: '2px',
                                animation: 'blink 1s infinite'
                              }}></span>
                            </div>
                          </div>
                        )}
                        
                        <style>{`
                          @keyframes blink {
                            0%, 100% { opacity: 1; }
                            50% { opacity: 0; }
                          }
                        `}</style>
                      </div>
                    ) : (
                      /* 普通流式消息显示 */
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
                    )}
                    
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
                
                {/* 回到底部按钮 */}
                {userScrolledUp && (
                  <button
                    onClick={forceScrollToBottom}
                    style={{
                      position: 'absolute',
                      bottom: '20px',
                      right: '20px',
                      width: '50px',
                      height: '50px',
                      backgroundColor: theme.colors.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      transition: 'all 0.2s ease',
                      zIndex: 1000
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1)';
                      e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    title="回到底部"
                  >
                    ⬇️
                  </button>
                )}
              </div>
            </div>


            {/* 用户参与讨论输入区域 */}
            {showUserInput && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '1rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '2px solid #E53E3E',
                marginTop: '1rem'
              }}>
                <h4 style={{ 
                  margin: '0 0 1rem 0', 
                  color: '#E53E3E', 
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>👤</span>
                  参与讨论
                </h4>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}>
                    您的名字：
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="请输入您的名字"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}>
                    您的发言：
                  </label>
                  <textarea
                    id="user-message-input"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="请输入您对这个话题的观点、建议或问题..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#666', 
                    textAlign: 'right',
                    marginTop: '0.25rem'
                  }}>
                    {userMessage.length}/500字
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  gap: '0.75rem', 
                  justifyContent: 'flex-end' 
                }}>
                  <button
                    onClick={() => setShowUserInput(false)}
                    style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    取消
                  </button>
                  <button
                    onClick={handleUserParticipate}
                    disabled={!userMessage.trim() || userMessage.length > 500}
                    style={{
                      backgroundColor: '#E53E3E',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: !userMessage.trim() || userMessage.length > 500 ? 'not-allowed' : 'pointer',
                      opacity: !userMessage.trim() || userMessage.length > 500 ? 0.7 : 1,
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}
                  >
                    发布发言
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 右侧统计区域 */}
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.length > 0 && (
              <>
                {/* 主持人质量报告 */}
                {moderatorEnabled && qualityReport && (
                  <div style={{ 
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '1rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    height: 'fit-content',
                    border: '2px solid #ffc107'
                  }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#ffc107', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>🎭</span>
                      主持人质量报告
                    </h4>
                    <div style={{ fontSize: '0.9rem' }}>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <strong>第 {qualityReport.round} 轮</strong> | 策略: <span style={{ 
                          backgroundColor: '#fff3cd', 
                          padding: '2px 6px', 
                          borderRadius: '3px',
                          fontSize: '0.8rem'
                        }}>
                          {qualityReport.strategy}
                        </span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div style={{ textAlign: 'center', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: qualityReport.scores.depth > 70 ? '#28a745' : qualityReport.scores.depth > 40 ? '#ffc107' : '#dc3545' }}>
                            {qualityReport.scores.depth}%
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>深度</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: qualityReport.scores.breadth > 60 ? '#28a745' : qualityReport.scores.breadth > 30 ? '#ffc107' : '#dc3545' }}>
                            {qualityReport.scores.breadth}%
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>广度</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: qualityReport.scores.engagement > 70 ? '#28a745' : qualityReport.scores.engagement > 40 ? '#ffc107' : '#dc3545' }}>
                            {qualityReport.scores.engagement}%
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>参与</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: qualityReport.scores.innovation > 40 ? '#28a745' : qualityReport.scores.innovation > 20 ? '#ffc107' : '#dc3545' }}>
                            {qualityReport.scores.innovation}%
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>创新</div>
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: qualityReport.overall > 70 ? '#d4edda' : qualityReport.overall > 50 ? '#fff3cd' : '#f8d7da', borderRadius: '4px' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: qualityReport.overall > 70 ? '#155724' : qualityReport.overall > 50 ? '#856404' : '#721c24' }}>
                          {qualityReport.overall}%
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>综合质量</div>
                      </div>
                    </div>
                  </div>
                )}
                
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

      {/* 固定在页面底部的操作按钮区域 */}
      {isDiscussionStarted && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderTop: '2px solid #e9ecef',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
          padding: '1rem',
          zIndex: 999
        }}>
          {/* 用户参与讨论输入区域 */}
          {showUserInput && (
            <div style={{
              backgroundColor: '#fff3cd',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              border: '2px solid #E53E3E',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ 
                margin: '0 0 1rem 0', 
                color: '#E53E3E', 
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>👤</span>
                参与讨论
              </h4>
              
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: '0 0 200px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}>
                    您的名字：
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="请输入您的名字"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
                
                <div style={{ flex: 1 }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}>
                    您的发言：
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <textarea
                      id="user-message-input"
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      placeholder="请输入您对这个话题的观点、建议或问题..."
                      rows={2}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        resize: 'none'
                      }}
                    />
                    <button 
                      onClick={handleUserParticipate}
                      disabled={!userMessage.trim() || userMessage.length > 500}
                      style={{
                        backgroundColor: '#E53E3E',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: !userMessage.trim() || userMessage.length > 500 ? 'not-allowed' : 'pointer',
                        opacity: !userMessage.trim() || userMessage.length > 500 ? 0.7 : 1,
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        height: 'fit-content'
                      }}
                    >
                      发布发言
                    </button>
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem',
                    color: userMessage.length > 500 ? '#dc3545' : '#6c757d',
                    marginTop: '0.25rem'
                  }}>
                    字数: {userMessage.length}/500
                    {userMessage.length > 500 && <span style={{ color: '#dc3545', marginLeft: '0.5rem' }}>超出字数限制</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮区域 */}
          <div style={{ 
            display: 'flex', 
            gap: '0.75rem', 
            justifyContent: 'center',
            flexWrap: 'wrap',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <button 
              onClick={toggleUserInput}
              disabled={!isDiscussionStarted}
              style={{
                backgroundColor: '#E53E3E',
                color: 'white',
                padding: '0.75rem 1.25rem',
                border: 'none',
                borderRadius: '6px',
                cursor: !isDiscussionStarted ? 'not-allowed' : 'pointer',
                opacity: !isDiscussionStarted ? 0.7 : 1,
                fontWeight: 'bold',
                flex: 1,
                minWidth: '120px',
                maxWidth: '160px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>👤</span>
              {showUserInput ? '取消发言' : '我要发言'}
            </button>

            <button 
              onClick={continueDiscussion}
              disabled={isLoading || isSummarizing}
              style={{
                backgroundColor: theme.colors.primary,
                color: 'white',
                padding: '0.75rem 1.25rem',
                border: 'none',
                borderRadius: '6px',
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
                fontSize: '0.9rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
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
                  {discussionMode === 'round' ? '开始一轮讨论' : '继续讨论'}
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
                borderRadius: '6px',
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
                fontSize: '0.9rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
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
                borderRadius: '6px',
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
                fontSize: '0.9rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
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
                borderRadius: '6px',
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
                fontSize: '0.9rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>📋</span>
              复制对话
            </button>
          </div>
        </div>
      )}
    </div>
  );
}