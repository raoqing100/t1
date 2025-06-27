/**
 * 讨论主持人智能体核心模块
 * 负责分析讨论状态、选择引导策略、生成引导内容
 */

/**
 * 主持人的核心能力模块
 */
export const ModeratorCore = {
  // 能力1：讨论状态感知
  perception: {
    /**
     * 分析讨论深度 (0-1分)
     * @param {Array} messages - 讨论消息数组
     * @returns {number} 深度分数
     */
    analyzeDepth(messages) {
      if (!messages || messages.length === 0) return 0;
      
      let depthScore = 0;
      const recentMessages = messages.slice(-5); // 分析最近5条消息
      
      // 检查深度指标
      const indicators = {
        // 是否包含"为什么"类问题
        hasWhyQuestions: this.countWhyQuestions(recentMessages) * 0.2,
        // 是否有证据支撑
        hasEvidence: this.countEvidenceReferences(recentMessages) * 0.2,
        // 是否有反驳和质疑
        hasCounterArguments: this.countCounterArguments(recentMessages) * 0.3,
        // 是否探讨根本原因
        hasRootCauseAnalysis: this.detectRootCauseDiscussion(recentMessages) * 0.3
      };
      
      depthScore = Object.values(indicators).reduce((sum, score) => sum + score, 0);
      return Math.min(1, depthScore);
    },

    /**
     * 分析讨论广度 (0-1分)
     * @param {Array} messages - 讨论消息数组
     * @returns {number} 广度分数
     */
    analyzeBreadth(messages) {
      if (!messages || messages.length === 0) return 0;
      
      // 预期的讨论维度
      const expectedDimensions = [
        'technical', 'economic', 'social', 'ethical', 
        'legal', 'environmental', 'cultural', 'practical'
      ];
      
      const coveredDimensions = expectedDimensions.filter(dimension => 
        this.isDimensionCovered(messages, dimension)
      );
      
      return coveredDimensions.length / expectedDimensions.length;
    },

    /**
     * 分析参与度 (0-1分)
     * @param {Array} messages - 讨论消息数组
     * @param {Array} agents - 智能体数组
     * @returns {number} 参与度分数
     */
    analyzeEngagement(messages, agents) {
      if (!messages || !agents || agents.length === 0) return 0;
      
      const recentMessages = messages.slice(-8); // 分析最近8条消息
      const agentParticipation = {};
      
      // 统计各智能体的参与情况
      agents.forEach(agent => {
        agentParticipation[agent.id] = recentMessages.filter(
          msg => msg.agentId === agent.id
        ).length;
      });
      
      // 计算参与平衡度
      const participationCounts = Object.values(agentParticipation);
      const avgParticipation = participationCounts.reduce((a, b) => a + b, 0) / agents.length;
      const variance = participationCounts.reduce((sum, count) => 
        sum + Math.pow(count - avgParticipation, 2), 0) / agents.length;
      
      // 参与度越平衡，分数越高
      return Math.max(0, 1 - variance / (avgParticipation + 1));
    },

    /**
     * 检测争议程度 (0-1分)
     * @param {Array} messages - 讨论消息数组
     * @returns {number} 争议程度分数
     */
    detectControversy(messages) {
      if (!messages || messages.length < 2) return 0;
      
      const controversyKeywords = [
        '不同意', '反对', '质疑', '但是', '然而', '相反',
        '错误', '不对', '问题', '挑战', '争议'
      ];
      
      let controversyCount = 0;
      messages.forEach(message => {
        const text = message.text.toLowerCase();
        controversyKeywords.forEach(keyword => {
          if (text.includes(keyword)) {
            controversyCount++;
          }
        });
      });
      
      return Math.min(1, controversyCount / (messages.length * 0.3));
    },

    /**
     * 检测创新程度 (0-1分)
     * @param {Array} messages - 讨论消息数组
     * @returns {number} 创新程度分数
     */
    detectInnovation(messages) {
      if (!messages || messages.length === 0) return 0;
      
      const innovationKeywords = [
        '新的', '创新', '突破', '革命性', '前所未有',
        '想象', '如果', '可能', '未来', '改变'
      ];
      
      let innovationCount = 0;
      messages.forEach(message => {
        const text = message.text.toLowerCase();
        innovationKeywords.forEach(keyword => {
          if (text.includes(keyword)) {
            innovationCount++;
          }
        });
      });
      
      return Math.min(1, innovationCount / (messages.length * 0.2));
    },

    // 辅助方法
    countWhyQuestions(messages) {
      return messages.filter(msg => 
        msg.text.includes('为什么') || msg.text.includes('原因')
      ).length;
    },

    countEvidenceReferences(messages) {
      const evidenceKeywords = ['数据', '研究', '证据', '案例', '实验', '统计'];
      return messages.filter(msg =>
        evidenceKeywords.some(keyword => msg.text.includes(keyword))
      ).length;
    },

    countCounterArguments(messages) {
      const counterKeywords = ['不过', '但是', '然而', '相反', '质疑'];
      return messages.filter(msg =>
        counterKeywords.some(keyword => msg.text.includes(keyword))
      ).length;
    },

    detectRootCauseDiscussion(messages) {
      const rootCauseKeywords = ['根本', '本质', '核心', '深层', '根源'];
      const count = messages.filter(msg =>
        rootCauseKeywords.some(keyword => msg.text.includes(keyword))
      ).length;
      return count > 0 ? 1 : 0;
    },

    isDimensionCovered(messages, dimension) {
      const dimensionKeywords = {
        technical: ['技术', '方法', '工具', '实现', '算法'],
        economic: ['经济', '成本', '效益', '投资', '收益'],
        social: ['社会', '人群', '影响', '关系', '文化'],
        ethical: ['道德', '伦理', '价值观', '责任'],
        legal: ['法律', '法规', '合规', '规定'],
        environmental: ['环境', '生态', '可持续', '绿色'],
        cultural: ['文化', '传统', '习俗', '背景'],
        practical: ['实际', '可行', '操作', '执行']
      };
      
      const keywords = dimensionKeywords[dimension] || [];
      return messages.some(msg =>
        keywords.some(keyword => msg.text.includes(keyword))
      );
    }
  },

  // 能力2：策略决策
  strategy: {
    /**
     * 分析当前讨论状态
     * @param {Array} messages - 讨论消息数组
     * @param {Array} agents - 智能体数组
     * @returns {Object} 讨论状态分析结果
     */
    analyzeCurrentState(messages, agents) {
      return {
        depth_score: ModeratorCore.perception.analyzeDepth(messages),
        breadth_score: ModeratorCore.perception.analyzeBreadth(messages),
        engagement_score: ModeratorCore.perception.analyzeEngagement(messages, agents),
        controversy_level: ModeratorCore.perception.detectControversy(messages),
        innovation_level: ModeratorCore.perception.detectInnovation(messages)
      };
    },

    /**
     * 选择最佳引导策略
     * @param {Object} state - 讨论状态分析结果
     * @returns {string} 选择的策略
     */
    selectOptimalStrategy(state) {
      // 策略选择优先级：优先解决最紧迫的问题
      if (state.depth_score < 0.3) {
        return 'DEEPEN'; // 深化讨论
      } else if (state.breadth_score < 0.4) {
        return 'BROADEN'; // 拓展视角
      } else if (state.controversy_level < 0.3) {
        return 'CHALLENGE'; // 制造争议
      } else if (state.engagement_score < 0.5) {
        return 'STIMULATE'; // 激发参与
      } else if (state.innovation_level < 0.4) {
        return 'INNOVATE'; // 推动创新
      } else {
        return 'SYNTHESIZE'; // 综合整合
      }
    }
  },

  // 能力3：精准引导
  guidance: {
    /**
     * 生成引导内容
     * @param {string} strategy - 选择的策略
     * @param {Object} context - 讨论上下文
     * @returns {Object} 引导内容
     */
    generateGuidance(strategy, context) {
      const templates = {
        DEEPEN: {
          observation: `我发现当前讨论还停留在表面层次`,
          question: `让我们深入思考：${context.topic}的根本原因是什么？`,
          task: `请各位从自己的专业角度分析这个问题的深层机制`,
          direction: `我们要挖掘问题的本质，而不仅仅是现象`
        },
        
        BROADEN: {
          observation: `我注意到讨论的视角还比较单一`,
          question: `除了已经讨论的方面，还有哪些重要维度需要考虑？`,
          task: `请从技术、经济、社会、伦理等不同角度来分析`,
          direction: `我们要确保讨论的全面性和完整性`
        },
        
        CHALLENGE: {
          observation: `我注意到大家的观点比较一致，缺乏有价值的争议`,
          question: `有人能对刚才的观点提出质疑吗？`,
          task: `请${ModeratorCore.guidance.selectChallengerAgent(context)}扮演魔鬼代言人，找出可能的问题`,
          direction: `通过辩论来检验观点的可靠性`
        },
        
        STIMULATE: {
          observation: `我感觉讨论的参与度还可以更高`,
          question: `还有哪些智能体想要分享自己的观点？`,
          task: `请每位智能体从自己的角色出发，提出独特的见解`,
          direction: `让我们确保每个声音都被听到`
        },
        
        INNOVATE: {
          observation: `讨论已经很深入了，现在让我们尝试一些创新思维`,
          question: `如果我们完全跳出传统思维框架，会有什么新的可能？`,
          task: `请大家发挥想象力，提出前所未有的解决方案`,
          direction: `我们要追求突破性的创新和洞察`
        },
        
        SYNTHESIZE: {
          observation: `讨论已经产生了很多有价值的观点`,
          question: `如何将这些观点整合成一个完整的解决方案？`,
          task: `请大家尝试找出观点间的内在联系`,
          direction: `我们要形成一个系统性的认知框架`
        }
      };
      
      return templates[strategy] || templates.DEEPEN;
    },

    /**
     * 选择挑战者智能体
     * @param {Object} context - 讨论上下文
     * @returns {string} 智能体名称
     */
    selectChallengerAgent(context) {
      // 简单实现：选择批评者角色或随机选择
      const agents = context.agents || [];
      const critic = agents.find(agent => 
        agent.role.includes('批评') || agent.role.includes('质疑')
      );
      
      if (critic) {
        return critic.name;
      }
      
      // 如果没有专门的批评者，随机选择一个
      return agents.length > 0 ? agents[0].name : '某位智能体';
    }
  }
};

/**
 * 主持人智能体主类
 */
export class DiscussionModerator {
  constructor(agents, topic, knowledgeBase = '', moderatorConfig = {}) {
    this.agents = agents;
    this.topic = topic;
    this.knowledgeBase = knowledgeBase;
    this.discussionHistory = [];
    this.currentRound = 0;
    this.lastStrategy = null;
    
    // 新增：讨论阶段管理
    this.discussionPhase = {
      current: 'TOPIC_ANALYSIS',     // 当前阶段
      isTopicAnalyzed: false,        // 主题是否已分析
      isInformationComplete: false,  // 信息是否完整
      isReadyForDiscussion: false,   // 是否准备好开始讨论
      pendingQuestions: [],          // 待确认的问题
      topicBreakdown: null           // 主题拆解结果
    };
    
    // 主持人配置
    this.moderatorConfig = {
      apiKey: moderatorConfig.apiKey || '',
      model: moderatorConfig.model || 'gpt-3.5-turbo',
      personality: moderatorConfig.personality || 'professional', // professional, creative, critical
      style: moderatorConfig.style || 'socratic', // socratic, directive, collaborative
      maxResponseLength: moderatorConfig.maxResponseLength || 300,
      ...moderatorConfig
    };
    
    // 讨论规则
    this.discussionRules = {
      maxMessageLength: 300,
      avoidRepetition: true,
      requireEvidence: false,
      encourageDebate: true
    };
  }

  /**
   * 分析讨论并生成引导（新的阶段性流程）
   * @param {Array} messages - 当前讨论消息
   * @returns {Object|null} 主持人的引导内容或null（如果不需要介入）
   */
  async moderate(messages) {
    this.discussionHistory = messages;
    
    // 根据当前阶段决定是否需要主持人介入
    const shouldIntervene = this.shouldModeratorIntervene(messages);
    
    if (!shouldIntervene) {
      return null; // 不需要介入
    }
    
    this.currentRound++;
    
    // 根据当前阶段选择不同的处理流程
    switch (this.discussionPhase.current) {
      case 'TOPIC_ANALYSIS':
        return await this.handleTopicAnalysisPhase(messages);
      
      case 'INFORMATION_GATHERING':
        return await this.handleInformationGatheringPhase(messages);
      
      case 'DISCUSSION_READY':
        return await this.handleDiscussionReadyPhase(messages);
      
      case 'ACTIVE_DISCUSSION':
        return await this.handleActiveDiscussionPhase(messages);
      
      default:
        return await this.handleActiveDiscussionPhase(messages);
    }
  }

  /**
   * 判断主持人是否需要介入
   * @param {Array} messages - 当前讨论消息
   * @returns {boolean} 是否需要介入
   */
  shouldModeratorIntervene(messages) {
    // 如果还在主题分析或信息收集阶段，总是需要介入
    if (this.discussionPhase.current === 'TOPIC_ANALYSIS' || 
        this.discussionPhase.current === 'INFORMATION_GATHERING') {
      return true;
    }
    
    // 如果准备开始讨论，需要介入一次
    if (this.discussionPhase.current === 'DISCUSSION_READY') {
      return true;
    }
    
    // 在正式讨论阶段，根据讨论质量决定是否介入
    if (this.discussionPhase.current === 'ACTIVE_DISCUSSION') {
      return this.shouldInterveneDuringDiscussion(messages);
    }
    
    return false;
  }

  /**
   * 在讨论过程中判断是否需要介入
   * @param {Array} messages - 当前讨论消息
   * @returns {boolean} 是否需要介入
   */
  shouldInterveneDuringDiscussion(messages) {
    // 如果没有消息，不需要介入
    if (!messages || messages.length === 0) return false;
    
    // 获取最近的智能体消息（排除主持人消息）
    const agentMessages = messages.filter(msg => 
      msg.type === 'message' && 
      this.agents.some(agent => agent.id === msg.agentId)
    );
    
    // 如果智能体消息少于3轮，不需要介入
    if (agentMessages.length < 3) return false;
    
    // 分析讨论状态
    const state = ModeratorCore.strategy.analyzeCurrentState(messages, this.agents);
    
    // 如果有严重的质量问题，需要介入
    const hasQualityIssues = (
      state.depth_score < 0.2 ||      // 深度严重不足
      state.breadth_score < 0.3 ||    // 视角过于单一
      state.engagement_score < 0.3 || // 参与度过低
      state.controversy_level < 0.1   // 缺乏有效争议
    );
    
    // 检查是否陷入重复循环
    const recentMessages = agentMessages.slice(-6);
    const hasRepetition = this.detectRepetitiveDiscussion(recentMessages);
    
    // 检查是否停滞不前
    const isStagnant = this.detectDiscussionStagnation(agentMessages);
    
    return hasQualityIssues || hasRepetition || isStagnant;
  }

  /**
   * 处理主题分析阶段
   * @param {Array} messages - 当前讨论消息
   * @returns {Object} 主持人消息对象
   */
  async handleTopicAnalysisPhase(messages) {
    // 生成主题深度分析
    const topicAnalysis = await this.generateTopicAnalysis();
    
    // 更新阶段状态
    this.discussionPhase.isTopicAnalyzed = true;
    this.discussionPhase.topicBreakdown = topicAnalysis;
    
    // 如果有待确认的问题，进入信息收集阶段
    if (topicAnalysis.pendingQuestions && topicAnalysis.pendingQuestions.length > 0) {
      this.discussionPhase.current = 'INFORMATION_GATHERING';
      this.discussionPhase.pendingQuestions = topicAnalysis.pendingQuestions;
    } else {
      // 没有待确认问题，直接准备讨论
      this.discussionPhase.current = 'DISCUSSION_READY';
      this.discussionPhase.isInformationComplete = true;
      this.discussionPhase.isReadyForDiscussion = true;
    }
    
    return this.buildTopicAnalysisMessage(topicAnalysis);
  }

  /**
   * 处理信息收集阶段
   * @param {Array} messages - 当前讨论消息
   * @returns {Object} 主持人消息对象
   */
  async handleInformationGatheringPhase(messages) {
    // 检查用户是否提供了补充信息
    const userResponse = this.extractUserResponse(messages);
    
    if (userResponse) {
      // 分析用户提供的信息是否充分
      const isInformationComplete = await this.evaluateUserResponse(userResponse);
      
      if (isInformationComplete) {
        // 信息充分，准备开始讨论
        this.discussionPhase.current = 'DISCUSSION_READY';
        this.discussionPhase.isInformationComplete = true;
        this.discussionPhase.isReadyForDiscussion = true;
        
        return this.buildInformationCompleteMessage(userResponse);
      } else {
        // 信息仍不充分，继续询问
        const additionalQuestions = await this.generateAdditionalQuestions(userResponse);
        this.discussionPhase.pendingQuestions = additionalQuestions;
        
        return this.buildAdditionalQuestionsMessage(additionalQuestions);
      }
    } else {
      // 用户还没有回应，重新提醒
      return this.buildReminderMessage();
    }
  }

  /**
   * 处理讨论准备阶段
   * @param {Array} messages - 当前讨论消息
   * @returns {Object} 主持人消息对象
   */
  async handleDiscussionReadyPhase(messages) {
    // 生成讨论启动消息
    this.discussionPhase.current = 'ACTIVE_DISCUSSION';
    
    return this.buildDiscussionStartMessage();
  }

  /**
   * 处理正式讨论阶段
   * @param {Array} messages - 当前讨论消息
   * @returns {Object} 主持人消息对象
   */
  async handleActiveDiscussionPhase(messages) {
    // 使用原有的讨论引导逻辑
    const state = ModeratorCore.strategy.analyzeCurrentState(messages, this.agents);
    const strategy = ModeratorCore.strategy.selectOptimalStrategy(state);
    this.lastStrategy = strategy;
    
    const context = {
      topic: this.topic,
      agents: this.agents,
      knowledgeBase: this.knowledgeBase,
      currentRound: this.currentRound,
      state: state,
      recentMessages: messages.slice(-5),
      discussionRules: this.discussionRules,
      topicBreakdown: this.discussionPhase.topicBreakdown
    };
    
    let guidance;
    if (this.moderatorConfig.apiKey) {
      guidance = await this.generateAIGuidance(strategy, context);
    } else {
      guidance = ModeratorCore.guidance.generateGuidance(strategy, context);
    }
    
    return this.buildModeratorMessage(guidance, state, strategy);
  }

  /**
   * 构建主持人消息
   * @param {Object} guidance - 引导内容
   * @param {Object} state - 讨论状态
   * @param {string} strategy - 使用的策略
   * @returns {Object} 主持人消息对象
   */
  buildModeratorMessage(guidance, state, strategy) {
    const message = {
      id: `moderator_${Date.now()}`,
      agentId: 'moderator',
      agentName: '讨论主持人',
      role: '主持人',
      text: this.formatModeratorMessage(guidance, state),
      timestamp: new Date().toISOString(),
      type: 'moderator',
      strategy: strategy,
      state: state
    };

    // 如果是推理模型生成的，添加思考过程信息
    if (guidance.isReasoning) {
      message.isReasoning = true;
      message.thinking = guidance.thinking;
      message.answer = guidance.rawAnswer || guidance.task;
    }

    return message;
  }

  /**
   * 格式化主持人消息
   * @param {Object} guidance - 引导内容
   * @param {Object} state - 讨论状态
   * @returns {string} 格式化的消息文本
   */
  formatModeratorMessage(guidance, state) {
    const stateEmoji = this.getStateEmoji(state);
    
    return `🎭 【主持人发言 - 第${this.currentRound}轮】

📊 **讨论状态评价**：
${guidance.observation}
${stateEmoji}

🎯 **引导问题**：
${guidance.question}

👥 **任务分配**：
${guidance.task}

🗺️ **方向指引**：
${guidance.direction}

---
💡 *让我们继续这场有价值的讨论！*`;
  }

  /**
   * 根据讨论状态生成表情符号
   * @param {Object} state - 讨论状态
   * @returns {string} 状态表情符号
   */
  getStateEmoji(state) {
    const depth = state.depth_score;
    const breadth = state.breadth_score;
    const engagement = state.engagement_score;
    
    let emoji = '';
    
    if (depth > 0.7) emoji += '🎯深度优秀 ';
    else if (depth > 0.4) emoji += '📊深度良好 ';
    else emoji += '📈需要深化 ';
    
    if (breadth > 0.6) emoji += '🌐视角全面 ';
    else emoji += '🔍需要拓展 ';
    
    if (engagement > 0.7) emoji += '🔥参与活跃';
    else if (engagement > 0.4) emoji += '👥参与良好';
    else emoji += '💪需要激发';
    
    return emoji;
  }

  /**
   * 获取讨论质量报告
   * @returns {Object} 质量报告
   */
  getQualityReport() {
    if (this.discussionHistory.length === 0) {
      return { message: '暂无讨论数据' };
    }

    const state = ModeratorCore.strategy.analyzeCurrentState(
      this.discussionHistory, 
      this.agents
    );

    return {
      round: this.currentRound,
      strategy: this.lastStrategy,
      scores: {
        depth: Math.round(state.depth_score * 100),
        breadth: Math.round(state.breadth_score * 100),
        engagement: Math.round(state.engagement_score * 100),
        controversy: Math.round(state.controversy_level * 100),
        innovation: Math.round(state.innovation_level * 100)
      },
      overall: Math.round(
        (state.depth_score + state.breadth_score + state.engagement_score + 
         state.controversy_level + state.innovation_level) * 20
      )
    };
  }

  /**
   * 生成主持人开场发言
   * @returns {Object} 开场消息对象
   */
  async generateOpeningMessage() {
    const context = {
      topic: this.topic,
      agents: this.agents,
      knowledgeBase: this.knowledgeBase,
      currentRound: 0,
      discussionRules: this.discussionRules
    };

    // 如果有API key，使用AI生成个性化开场
    let openingContent;
    if (this.moderatorConfig.apiKey) {
      openingContent = await this.generateAIOpening(context);
    } else {
      openingContent = this.generateTemplateOpening(context);
    }

    const openingMessage = {
      id: `moderator_opening_${Date.now()}`,
      agentId: 'moderator',
      agentName: '讨论主持人',
      role: '主持人',
      text: openingContent,
      timestamp: new Date().toISOString(),
      type: 'moderator',
      strategy: 'OPENING',
      isOpening: true
    };

    return openingMessage;
  }

  /**
   * 使用AI生成个性化开场
   * @param {Object} context - 讨论上下文
   * @returns {string} 开场内容
   */
  async generateAIOpening(context) {
    try {
      const openingPrompt = this.buildOpeningPrompt(context);
      const response = await this.callAIAPI(openingPrompt);
      return this.formatOpeningMessage(response);
    } catch (error) {
      console.error('AI开场生成失败，使用模板:', error);
      return this.generateTemplateOpening(context);
    }
  }

  /**
   * 构建开场AI Prompt
   * @param {Object} context - 讨论上下文
   * @returns {string} 开场prompt
   */
  buildOpeningPrompt(context) {
    const agentIntros = context.agents.map(agent => 
      `${agent.name}(${agent.role}): ${agent.description || '专业参与者'}`
    ).join('\n');

    return `🎭 你是一位世界级的讨论主持人，即将主持一场重要的多智能体讨论。

【讨论信息】
话题: ${context.topic}
参与者: ${context.agents.length}位智能体
${agentIntros}

【背景资料】
${context.knowledgeBase || '无特定背景资料'}

【你的任务】
作为讨论主持人，你需要：
1. 热情欢迎所有参与者
2. 清晰介绍讨论话题和目标
3. 简要说明讨论规则和期望
4. 激发参与者的讨论热情
5. 为深度讨论营造良好氛围

【风格要求】
- 保持${this.moderatorConfig.personality}的风格（professional=专业权威, creative=创意启发, critical=严谨犀利）
- 语言简洁有力，开门见山
- 严格控制在150字以内
- 直接进入主题，少说废话

【输出格式】
请直接生成开场发言内容，不需要额外格式化。

现在，以你的专业素养和魅力，为这场讨论拉开序幕：`;
  }

  /**
   * 生成模板开场
   * @param {Object} context - 讨论上下文
   * @returns {string} 模板开场内容
   */
  generateTemplateOpening(context) {
    const agentNames = context.agents.map(agent => agent.name).join('、');
    
    const templates = {
      professional: `🎭 【讨论正式开始】

各位参与者，欢迎来到今天的讨论！

📋 **讨论话题**: ${context.topic}

👥 **参与者**: ${agentNames}

🎯 **讨论目标**: 通过深入交流，探索问题的多个维度，形成有价值的见解和共识。

📝 **讨论规则**: 
- 每次发言控制在300字以内
- 鼓励不同观点的碰撞
- 基于事实和逻辑进行论证
- 保持开放和尊重的态度

让我们开始这场精彩的思想交锋吧！请各位踊跃发言。`,

      creative: `🎭 【创意讨论时间】

欢迎大家来到这个思想碰撞的创意空间！✨

🌟 **今天的话题**: ${context.topic}

🎨 **创意伙伴**: ${agentNames}

💡 **我们的使命**: 突破常规思维，探索无限可能，创造前所未有的洞察！

🚀 **创意规则**: 
- 大胆想象，勇敢表达
- 没有标准答案，只有精彩观点
- 让思维自由飞翔
- 在碰撞中产生火花

准备好了吗？让我们一起开启这场创意之旅！`,

      critical: `🎭 【严谨讨论开始】

各位，今天我们将进行一场严谨而深入的学术讨论。

🔍 **讨论主题**: ${context.topic}

🧠 **讨论成员**: ${agentNames}

⚖️ **讨论标准**: 我们要求每个观点都经得起推敲，每个结论都有充分依据。

📊 **严谨要求**: 
- 观点必须有逻辑支撑
- 欢迎质疑和反驳
- 避免空洞的表态
- 追求真理，不怕争议

现在，让我们以学者的严谨态度，开始这场思辨之旅。`
    };

    return templates[this.moderatorConfig.personality] || templates.professional;
  }

  /**
   * 格式化开场消息
   * @param {string} aiResponse - AI生成的开场内容
   * @returns {string} 格式化的开场消息
   */
  formatOpeningMessage(aiResponse) {
    // 确保开场消息有合适的格式
    if (!aiResponse.includes('🎭')) {
      aiResponse = `🎭 【讨论主持人】\n\n${aiResponse}`;
    }
    
    return aiResponse;
  }

  /**
   * 使用AI生成智能引导内容
   * @param {string} strategy - 选择的策略
   * @param {Object} context - 讨论上下文
   * @returns {Object} AI生成的引导内容
   */
  async generateAIGuidance(strategy, context) {
    try {
      // 构建主持人的超级Prompt
      const moderatorPrompt = this.buildModeratorPrompt(strategy, context);
      
      // 调用AI API生成引导内容
      const response = await this.callAIAPI(moderatorPrompt);
      
      // 解析AI回复，提取结构化内容
      const guidance = this.parseAIResponse(response.content, strategy);
      
      // 如果是推理模型，添加思考过程信息
      if (response.isReasoning) {
        guidance.isReasoning = true;
        guidance.thinking = response.thinking;
        guidance.rawAnswer = response.answer;
      }
      
      return guidance;
    } catch (error) {
      console.error('AI引导生成失败，使用备用模板:', error);
      // 如果AI调用失败，回退到模板
      return ModeratorCore.guidance.generateGuidance(strategy, context);
    }
  }

  /**
   * 构建主持人的AI Prompt
   * @param {string} strategy - 引导策略
   * @param {Object} context - 讨论上下文
   * @returns {string} 构建的prompt
   */
  buildModeratorPrompt(strategy, context) {
    const strategyDescriptions = {
      DEEPEN: '深化讨论 - 引导参与者挖掘问题的根本原因和深层机制',
      BROADEN: '拓展视角 - 引入新的维度和不同的观点角度',
      CHALLENGE: '制造争议 - 提出质疑，激发有价值的辩论',
      STIMULATE: '激发参与 - 鼓励所有智能体积极参与讨论',
      INNOVATE: '推动创新 - 引导突破传统思维，产生新洞察',
      SYNTHESIZE: '综合整合 - 将分散的观点整合成系统性认知'
    };

    const recentContent = context.recentMessages
      .filter(msg => msg.type === 'message')
      .map(msg => {
        const agent = context.agents.find(a => a.id === msg.agentId);
        return `${agent?.name || '未知'}: ${msg.text}`;
      })
      .join('\n');

    return `🎭 你是世界顶级的讨论主持人，拥有苏格拉底的智慧、奥普拉的引导技巧和TED演讲的深度洞察力。

【核心身份】
你不是普通的会议主持人，而是思想的催化剂、智慧的引导者、深度思考的推动者。

【当前使命】
引导策略: ${strategy} - ${strategyDescriptions[strategy]}

【讨论现状】
话题: ${context.topic}
轮次: 第${context.currentRound}轮
参与者: ${context.agents.map(a => `${a.name}(${a.role})`).join(', ')}

【背景资料】
${context.knowledgeBase || '无特定背景知识'}

【最近发言】
${recentContent}

【智能分析】
- 深度指数: ${Math.round(context.state.depth_score * 100)}% ${context.state.depth_score < 0.4 ? '⚠️需要深挖' : '✅良好'}
- 广度指数: ${Math.round(context.state.breadth_score * 100)}% ${context.state.breadth_score < 0.4 ? '⚠️视角单一' : '✅多元'}
- 参与指数: ${Math.round(context.state.engagement_score * 100)}% ${context.state.engagement_score < 0.5 ? '⚠️需要激发' : '✅活跃'}
- 争议指数: ${Math.round(context.state.controversy_level * 100)}% ${context.state.controversy_level < 0.3 ? '⚠️过于和谐' : '✅有益辩论'}
- 创新指数: ${Math.round(context.state.innovation_level * 100)}% ${context.state.innovation_level < 0.4 ? '⚠️缺乏突破' : '✅有新思路'}

【引导原则】
根据${strategy}策略，你需要：
- 如果是DEEPEN：像考古学家一样挖掘问题的根源，追问"为什么"和"如何"
- 如果是BROADEN：像探险家一样开拓新视角，引入被忽视的维度
- 如果是CHALLENGE：像法庭律师一样质疑观点，制造有价值的争论
- 如果是STIMULATE：像教练一样激发潜能，让每个声音都被听到
- 如果是INNOVATE：像发明家一样突破常规，推动创新思维
- 如果是SYNTHESIZE：像建筑师一样整合观点，构建完整框架

【风格要求】
- 保持${this.moderatorConfig.personality}的个性（professional=专业严谨, creative=创意启发, critical=批判犀利）
- 严格控制在100字以内，追求精准简洁
- 语言犀利有力，一针见血
- 避免废话套话，直击要害
- 提出一个让人深思的核心问题

【输出要求】
请生成简洁有力的引导发言（总共不超过100字），格式：
[简短观察] + [核心问题] + [明确指向]

示例：
"讨论还在表面打转。核心问题是：我们到底要解决什么？请各位直击痛点。"

现在，以你的智慧和洞察力，生成这个关键时刻的引导发言：`;
  }

  /**
   * 调用AI API
   * @param {string} prompt - 发送给AI的prompt
   * @returns {Object} AI的回复，包含原始内容和解析后的思考过程
   */
  async callAIAPI(prompt) {
    // 这里需要导入API调用函数
    const { generateResponse, isReasoningModel, parseReasoningResponse } = await import('../services/api.js');
    
    // 构建消息历史，使用系统prompt
    const messages = [
      {
        role: 'system',
        content: prompt
      },
      {
        role: 'user', 
        content: '请根据以上分析生成你的引导发言。'
      }
    ];

    // 调用API生成回复
    const response = await generateResponse(
      this.moderatorConfig.apiKey, 
      this.moderatorConfig.model, 
      messages, 
      false // 不使用流式响应
    );
    
    const responseText = response.choices[0].message.content;
    
    // 检查是否为推理模型
    if (isReasoningModel(this.moderatorConfig.model)) {
      // 解析推理过程
      const parsed = parseReasoningResponse(responseText);
      return {
        content: responseText,
        isReasoning: true,
        thinking: parsed.thinking,
        answer: parsed.answer
      };
    } else {
      return {
        content: responseText,
        isReasoning: false
      };
    }
  }

  /**
   * 解析AI回复
   * @param {string} aiResponse - AI的原始回复
   * @param {string} strategy - 使用的策略
   * @returns {Object} 解析后的引导内容
   */
  parseAIResponse(aiResponse, strategy) {
    // 尝试从AI回复中提取结构化内容
    const lines = aiResponse.split('\n').filter(line => line.trim());
    
    // 查找观察、问题、任务和方向
    let observation = '';
    let question = '';
    let task = '';
    let direction = '';
    
    // 简单的关键词匹配来提取结构化内容
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.includes('观察') || trimmedLine.includes('发现') || trimmedLine.includes('注意到')) {
        observation = trimmedLine;
      } else if (trimmedLine.includes('？') || trimmedLine.includes('?')) {
        question = trimmedLine;
      } else if (trimmedLine.includes('建议') || trimmedLine.includes('请') || trimmedLine.includes('让我们')) {
        if (!task) task = trimmedLine;
      }
    }
    
    // 如果没有找到结构化内容，使用整个回复作为任务
    if (!task && !observation && !question) {
      task = aiResponse;
    }
    
    // 设置默认方向
    if (!direction) {
      const strategyNames = {
        DEEPEN: '深化讨论',
        BROADEN: '拓展视角', 
        CHALLENGE: '制造争议',
        STIMULATE: '激发参与',
        INNOVATE: '推动创新',
        SYNTHESIZE: '综合整合'
      };
      direction = `让我们通过${strategyNames[strategy] || strategy}来推进讨论`;
    }
    
    return {
      observation: observation || `基于当前讨论状态，我准备进行${strategy}引导`,
      question: question || this.extractQuestionFromResponse(aiResponse),
      task: task || aiResponse,
      direction: direction
    };
  }

  /**
   * 从AI回复中提取问题
   * @param {string} response - AI回复
   * @returns {string} 提取的问题
   */
  extractQuestionFromResponse(response) {
    // 查找问号结尾的句子
    const questionMatch = response.match(/[^。！]*？/);
    if (questionMatch) {
      return questionMatch[0];
    }
    
    // 如果没有找到问题，返回前50个字符
    return response.substring(0, 50) + '...';
  }

  // ========== 新增的阶段性流程辅助方法 ==========

  /**
   * 生成主题深度分析
   * @returns {Object} 主题分析结果
   */
  async generateTopicAnalysis() {
    const analysisPrompt = this.buildTopicAnalysisPrompt();
    
    if (this.moderatorConfig.apiKey) {
      try {
        const aiResponse = await this.callAIAPI(analysisPrompt);
        return this.parseTopicAnalysisResponse(aiResponse.content);
      } catch (error) {
        console.error('AI主题分析失败，使用模板分析:', error);
        return this.generateTemplateTopicAnalysis();
      }
    } else {
      return this.generateTemplateTopicAnalysis();
    }
  }

  /**
   * 构建主题分析的AI Prompt
   * @returns {string} 主题分析prompt
   */
  buildTopicAnalysisPrompt() {
    return `🔍 你是世界顶级的问题分析专家，具备麦肯锡咨询顾问的结构化思维、斯坦福设计思维的深度洞察。

【核心任务】
对讨论主题进行深度分析和拆解，为后续的多智能体讨论奠定基础。

【讨论主题】
"${this.topic}"

【背景资料】
${this.knowledgeBase || '无特定背景资料'}

【分析维度】
请从以下维度深度分析这个主题：

1. 【问题背景】- 这个问题产生的历史背景和现实环境
2. 【核心目的】- 讨论这个问题希望达成的主要目标
3. 【深层目标】- 问题背后的根本性诉求和长远意义
4. 【隐含条件】- 问题中未明确说明但影响讨论的重要条件
5. 【关键要素】- 影响问题解决的核心要素和变量
6. 【潜在障碍】- 可能影响讨论深度和效果的潜在问题

【输出要求】
1. 对每个维度给出具体分析（每项30-50字）
2. 识别需要用户补充说明的关键信息点
3. 如果发现信息不足，请列出2-3个关键问题需要用户补充

格式要求：
==== 主题分析 ====
问题背景：[具体描述]
核心目的：[具体描述]  
深层目标：[具体描述]
隐含条件：[具体描述]
关键要素：[具体描述]
潜在障碍：[具体描述]

==== 待确认问题 ====
[如果需要补充信息，列出具体问题，格式为：
1. 问题1？
2. 问题2？
3. 问题3？
如果信息充分，写：信息充分，可直接开始讨论]

现在请开始分析：`;
  }

  /**
   * 生成模板主题分析（备用方案）
   * @returns {Object} 主题分析结果
   */
  generateTemplateTopicAnalysis() {
    return {
      background: `"${this.topic}"是一个值得深入探讨的重要话题`,
      purpose: '通过多角度分析形成全面认知',
      deepGoals: '促进理性思考和观点碰撞',
      implicitConditions: '各参与者具备基本的讨论素养',
      keyElements: ['观点多样性', '逻辑严谨性', '建设性辩论'],
      potentialObstacles: ['表面化讨论', '观点单一', '缺乏深度'],
      pendingQuestions: [
        '这个话题有什么特定的应用场景或约束条件吗？',
        '您希望讨论重点关注哪个层面（理论、实践、还是两者兼顾）？',
        '有什么特殊的背景信息需要我们了解吗？'
      ]
    };
  }

  /**
   * 解析主题分析的AI回复
   * @param {string} response - AI回复
   * @returns {Object} 解析后的分析结果
   */
  parseTopicAnalysisResponse(response) {
    const analysis = {
      background: '',
      purpose: '',
      deepGoals: '',
      implicitConditions: '',
      keyElements: [],
      potentialObstacles: [],
      pendingQuestions: []
    };

    // 简单的文本解析
    const lines = response.split('\n').filter(line => line.trim());
    let currentSection = '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.includes('问题背景') || trimmedLine.includes('背景')) {
        currentSection = 'background';
        analysis.background = this.extractContent(trimmedLine);
      } else if (trimmedLine.includes('核心目的') || trimmedLine.includes('目的')) {
        currentSection = 'purpose';
        analysis.purpose = this.extractContent(trimmedLine);
      } else if (trimmedLine.includes('深层目标') || trimmedLine.includes('深层')) {
        currentSection = 'deepGoals';
        analysis.deepGoals = this.extractContent(trimmedLine);
      } else if (trimmedLine.includes('隐含条件') || trimmedLine.includes('条件')) {
        currentSection = 'implicitConditions';
        analysis.implicitConditions = this.extractContent(trimmedLine);
      } else if (trimmedLine.includes('待确认') || trimmedLine.includes('问题')) {
        currentSection = 'questions';
      } else if (trimmedLine.match(/^\d+\./)) {
        // 数字开头的行，可能是问题列表
        if (currentSection === 'questions') {
          const question = trimmedLine.replace(/^\d+\./, '').trim();
          if (question && !question.includes('信息充分')) {
            analysis.pendingQuestions.push(question);
          }
        }
      }
    }

    // 如果解析失败，使用模板分析
    if (!analysis.background && !analysis.purpose) {
      return this.generateTemplateTopicAnalysis();
    }

    return analysis;
  }

  /**
   * 从文本行中提取内容
   * @param {string} line - 文本行
   * @returns {string} 提取的内容
   */
  extractContent(line) {
    const colonIndex = line.indexOf('：');
    if (colonIndex > -1) {
      return line.substring(colonIndex + 1).trim();
    }
    const colonIndex2 = line.indexOf(':');
    if (colonIndex2 > -1) {
      return line.substring(colonIndex2 + 1).trim();
    }
    return line.trim();
  }

  /**
   * 构建主题分析消息
   * @param {Object} analysis - 主题分析结果
   * @returns {Object} 主持人消息对象
   */
  buildTopicAnalysisMessage(analysis) {
    let messageText = `🎭 【超级主持人 - 主题深度分析】

📋 **主题拆解完成，让我为大家深度解析一下讨论主题：**

🔍 **问题背景**：${analysis.background || '需要进一步明确'}

🎯 **核心目的**：${analysis.purpose || '促进深度思考和观点交流'}

🚀 **深层目标**：${analysis.deepGoals || '形成全面认知和实践指导'}

⚙️ **隐含条件**：${analysis.implicitConditions || '理性讨论，建设性思维'}

🔑 **关键要素**：${Array.isArray(analysis.keyElements) ? analysis.keyElements.join('、') : '多维度分析'}

⚠️ **潜在障碍**：${Array.isArray(analysis.potentialObstacles) ? analysis.potentialObstacles.join('、') : '表面化讨论'}`;

    if (analysis.pendingQuestions && analysis.pendingQuestions.length > 0) {
      messageText += `

❓ **需要确认的关键信息**：
${analysis.pendingQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

⏳ **请您补充以上信息，以便我们进行更精准的讨论分析。**`;
    } else {
      messageText += `

✅ **信息充分，准备启动讨论！**`;
    }

    return {
      id: `moderator_analysis_${Date.now()}`,
      agentId: 'moderator',
      agentName: '讨论主持人',
      role: '主持人',
      text: messageText,
      timestamp: new Date().toISOString(),
      type: 'moderator',
      phase: 'TOPIC_ANALYSIS',
      analysis: analysis
    };
  }

  /**
   * 提取用户回复
   * @param {Array} messages - 消息列表
   * @returns {string|null} 用户回复内容
   */
  extractUserResponse(messages) {
    // 查找最近的用户消息
    const userMessages = messages.filter(msg => msg.agentId === 'user');
    if (userMessages.length > 0) {
      return userMessages[userMessages.length - 1].text;
    }
    return null;
  }

  /**
   * 评估用户回复是否充分
   * @param {string} userResponse - 用户回复
   * @returns {boolean} 信息是否充分
   */
  async evaluateUserResponse(userResponse) {
    // 简单的评估逻辑：如果回复包含具体信息且长度合理，认为充分
    if (userResponse.length > 20 && 
        (userResponse.includes('场景') || 
         userResponse.includes('目标') || 
         userResponse.includes('要求') ||
         userResponse.includes('背景'))) {
      return true;
    }
    return false;
  }

  /**
   * 生成额外问题
   * @param {string} userResponse - 用户回复
   * @returns {Array} 额外问题列表
   */
  async generateAdditionalQuestions(userResponse) {
    return [
      '能否提供更具体的应用场景或实例？',
      '这个问题有什么特殊的约束条件吗？',
      '您希望讨论达到什么具体的效果？'
    ];
  }

  /**
   * 构建信息完整消息
   * @param {string} userResponse - 用户回复
   * @returns {Object} 主持人消息对象
   */
  buildInformationCompleteMessage(userResponse) {
    return {
      id: `moderator_complete_${Date.now()}`,
      agentId: 'moderator',
      agentName: '讨论主持人',
      role: '主持人',
      text: `🎭 【超级主持人 - 信息确认完成】

✅ **信息收集完成，感谢您的补充！**

📝 **补充信息摘要**：${userResponse.substring(0, 100)}${userResponse.length > 100 ? '...' : ''}

🚀 **现在我们有了充分的背景信息，可以开始高质量的讨论了！**

💡 **各位智能体准备好了吗？让我们开始这场精彩的思维碰撞！**`,
      timestamp: new Date().toISOString(),
      type: 'moderator',
      phase: 'INFORMATION_COMPLETE'
    };
  }

  /**
   * 构建额外问题消息
   * @param {Array} questions - 问题列表
   * @returns {Object} 主持人消息对象
   */
  buildAdditionalQuestionsMessage(questions) {
    return {
      id: `moderator_questions_${Date.now()}`,
      agentId: 'moderator',
      agentName: '讨论主持人',
      role: '主持人',
      text: `🎭 【超级主持人 - 补充信息请求】

📝 **感谢您的回复，为了确保讨论的深度和精准性，还需要确认几个关键信息：**

❓ **请补充以下信息**：
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

⏳ **请您详细回答，这将帮助我们进行更有针对性的讨论。**`,
      timestamp: new Date().toISOString(),
      type: 'moderator',
      phase: 'INFORMATION_GATHERING'
    };
  }

  /**
   * 构建提醒消息
   * @returns {Object} 主持人消息对象
   */
  buildReminderMessage() {
    return {
      id: `moderator_reminder_${Date.now()}`,
      agentId: 'moderator',
      agentName: '讨论主持人',
      role: '主持人',
      text: `🎭 【超级主持人 - 友好提醒】

⏰ **还在等待您的补充信息哦！**

📋 **为了确保讨论的质量，请您回答一下之前提出的关键问题。**

💡 **有了这些信息，我们就能开始一场精彩的深度讨论了！**`,
      timestamp: new Date().toISOString(),
      type: 'moderator',
      phase: 'REMINDER'
    };
  }

  /**
   * 构建讨论开始消息
   * @returns {Object} 主持人消息对象
   */
  buildDiscussionStartMessage() {
    return {
      id: `moderator_start_${Date.now()}`,
      agentId: 'moderator',
      agentName: '讨论主持人',
      role: '主持人',
      text: `🎭 【超级主持人 - 正式启动讨论】

🎉 **主题分析完成，信息收集充分，现在正式启动讨论！**

📊 **讨论框架已建立，基础已夯实**

🚀 **各位智能体，请根据你们的角色特色，围绕"${this.topic}"展开深度讨论！**

⚔️ **记住：保持批判性思维，不要轻易认同，要敢于质疑和挑战！**

💡 **让我们开始这场思维的盛宴吧！**`,
      timestamp: new Date().toISOString(),
      type: 'moderator',
      phase: 'DISCUSSION_START'
    };
  }

  /**
   * 检测重复性讨论
   * @param {Array} messages - 消息列表
   * @returns {boolean} 是否有重复
   */
  detectRepetitiveDiscussion(messages) {
    if (messages.length < 4) return false;
    
    // 简单的重复检测：检查最近几条消息的相似度
    const recent = messages.slice(-4);
    const keywords = ['同意', '认为', '觉得', '应该'];
    
    let repetitionCount = 0;
    for (let i = 0; i < recent.length - 1; i++) {
      for (let j = i + 1; j < recent.length; j++) {
        const similarity = this.calculateMessageSimilarity(recent[i].text, recent[j].text);
        if (similarity > 0.6) {
          repetitionCount++;
        }
      }
    }
    
    return repetitionCount > 2;
  }

  /**
   * 检测讨论停滞
   * @param {Array} agentMessages - 智能体消息
   * @returns {boolean} 是否停滞
   */
  detectDiscussionStagnation(agentMessages) {
    if (agentMessages.length < 6) return false;
    
    const recentMessages = agentMessages.slice(-6);
    
    // 检查是否缺乏新观点
    const uniqueAgents = new Set(recentMessages.map(msg => msg.agentId));
    const avgLength = recentMessages.reduce((sum, msg) => sum + msg.text.length, 0) / recentMessages.length;
    
    // 如果参与者太少或消息太短，可能是停滞
    return uniqueAgents.size < 2 || avgLength < 50;
  }

  /**
   * 计算消息相似度
   * @param {string} text1 - 文本1
   * @param {string} text2 - 文本2
   * @returns {number} 相似度分数 (0-1)
   */
  calculateMessageSimilarity(text1, text2) {
    const words1 = text1.split('');
    const words2 = text2.split('');
    
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }
}

const ModeratorModule = { ModeratorCore, DiscussionModerator };
export default ModeratorModule; 