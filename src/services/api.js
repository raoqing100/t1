/**
 * SiliconFlow API 服务
 * 基于 SiliconFlow 文档: https://docs.siliconflow.cn/
 */

import { getApiBaseUrl, getDefaultModel } from '../config/env';

// API基础URL
const API_BASE_URL = getApiBaseUrl('SILICONFLOW') || 'https://api.siliconflow.cn/v1';

// 最大重试次数
const MAX_RETRIES = 3;
// 重试延迟（毫秒）
const RETRY_DELAY = 1000;

// 模型访问级别
const MODEL_ACCESS_LEVELS = {
  FREE: 'free',
  STANDARD: 'standard',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise'
};

/**
 * 创建API请求头
 * @param {string} apiKey - API密钥
 * @returns {Object} - 请求头对象
 */
const createHeaders = (apiKey) => {
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };
};

/**
 * 带重试机制的API请求
 * @param {string} url - 请求URL
 * @param {Object} options - 请求选项
 * @param {number} retries - 剩余重试次数
 * @returns {Promise} - 请求响应
 */
const fetchWithRetry = async (url, options, retries = MAX_RETRIES) => {
  try {
    const response = await fetch(url, options);
    
    // 如果响应成功，直接返回
    if (response.ok) {
      return await response.json();
    }
    
    // 处理不同类型的错误
    if (response.status === 429) {
      // 速率限制错误，等待更长时间再重试
      const retryAfter = response.headers.get('Retry-After') || 2;
      if (retries > 0) {
        console.warn(`API速率限制，${retryAfter}秒后重试，剩余重试次数: ${retries}`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return fetchWithRetry(url, options, retries - 1);
      }
    } else if (response.status >= 500 && retries > 0) {
      // 服务器错误，尝试重试
      console.warn(`服务器错误(${response.status})，${RETRY_DELAY/1000}秒后重试，剩余重试次数: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    
    // 其他错误或重试次数已用完
    const errorData = await response.text();
    throw new Error(`API请求失败: ${response.status} - ${errorData}`);
  } catch (error) {
    if (error.name === 'TypeError' && retries > 0) {
      // 网络错误，尝试重试
      console.warn(`网络错误，${RETRY_DELAY/1000}秒后重试，剩余重试次数: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

/**
 * 获取可用模型列表
 * @param {string} apiKey - API密钥
 * @returns {Promise} - 可用模型列表
 */
export const getAvailableModels = async (apiKey) => {
  try {
    const response = await fetchWithRetry(
      `${API_BASE_URL}/models`, 
      {
        method: 'GET',
        headers: createHeaders(apiKey)
      }
    );
    
    // 处理响应，添加模型访问级别信息
    if (response && response.data) {
      response.data = response.data.map(model => {
        // 根据模型ID添加访问级别信息
        let accessLevel = MODEL_ACCESS_LEVELS.FREE;
        
        if (model.id.includes('claude-3-opus')) {
          accessLevel = MODEL_ACCESS_LEVELS.PREMIUM;
        } else if (model.id.includes('claude-3-sonnet')) {
          accessLevel = MODEL_ACCESS_LEVELS.STANDARD;
        } else if (model.id.includes('claude-4')) {
          accessLevel = MODEL_ACCESS_LEVELS.ENTERPRISE;
        }
        
        return {
          ...model,
          accessLevel
        };
      });
    }
    
    return response;
  } catch (error) {
    console.error('获取模型列表失败:', error);
    throw error;
  }
};

/**
 * 检查用户是否可以访问特定模型
 * @param {string} apiKey - API密钥
 * @param {string} modelId - 模型ID
 * @returns {Promise<boolean>} - 是否可以访问
 */
export const canAccessModel = async (apiKey, modelId) => {
  try {
    // 获取用户账号信息
    const accountInfo = await fetchWithRetry(
      `${API_BASE_URL}/account`, 
      {
        method: 'GET',
        headers: createHeaders(apiKey)
      }
    );
    
    // 获取模型列表
    const models = await getAvailableModels(apiKey);
    
    // 查找请求的模型
    const requestedModel = models.data.find(model => model.id === modelId);
    
    if (!requestedModel) {
      console.warn(`模型 ${modelId} 不存在`);
      return false;
    }
    
    // 检查用户账号级别是否可以访问该模型
    const userAccessLevel = accountInfo.tier || MODEL_ACCESS_LEVELS.FREE;
    
    // Claude 4 仅限企业账户
    if (modelId.includes('claude-4') && userAccessLevel !== MODEL_ACCESS_LEVELS.ENTERPRISE) {
      console.log(`用户账号级别 (${userAccessLevel}) 无法访问 Claude 4 模型`);
      return false;
    }
    
    // Claude 3 Opus 需要高级账户或更高级别
    if (modelId.includes('claude-3-opus') && 
        ![MODEL_ACCESS_LEVELS.PREMIUM, MODEL_ACCESS_LEVELS.ENTERPRISE].includes(userAccessLevel)) {
      console.log(`用户账号级别 (${userAccessLevel}) 无法访问 Claude 3 Opus 模型`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('检查模型访问权限失败:', error);
    return false;
  }
};

/**
 * 生成AI回复
 * @param {string} apiKey - API密钥
 * @param {string} model - 模型名称
 * @param {Array} messages - 消息历史
 * @param {boolean} stream - 是否使用流式响应
 * @param {Function} onChunk - 流式响应回调函数
 * @returns {Promise} - 生成的回复
 */
export const generateResponse = async (apiKey, model, messages, stream = false, onChunk = null) => {
  try {
    // 使用SiliconFlow推荐的默认模型
    const selectedModel = model || getDefaultModel('SILICONFLOW') || 'Qwen/Qwen2.5-7B-Instruct';
    
    console.log('API请求参数:', {
      url: `${API_BASE_URL}/chat/completions`,
      model: selectedModel,
      messagesCount: messages.length,
      stream: stream
    });

    // 如果不使用流式响应，使用普通请求
    if (!stream || !onChunk) {
      return await fetchWithRetry(
        `${API_BASE_URL}/chat/completions`, 
        {
          method: 'POST',
          headers: createHeaders(apiKey),
          body: JSON.stringify({
            model: selectedModel,
            messages: messages,
            temperature: 0.8,
            max_tokens: 1000,
            top_p: 0.9,
            frequency_penalty: 0.3,
            presence_penalty: 0.3
          })
        }
      );
    }
    
    // 使用流式响应
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: createHeaders(apiKey),
      body: JSON.stringify({
        model: selectedModel,
        messages: messages,
        temperature: 0.8,
        max_tokens: 1000,
        top_p: 0.9,
        frequency_penalty: 0.3,
        presence_penalty: 0.3,
        stream: true
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API请求失败: ${response.status} - ${errorData}`);
    }
    
    // 处理流式响应
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';
    
    // 读取流式数据
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // 解码数据块
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');
      
      // 处理每一行数据
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          // 处理流结束标记
          if (data === '[DONE]') continue;
          
          try {
            const json = JSON.parse(data);
            const content = json.choices[0]?.delta?.content || '';
            
            if (content) {
              fullText += content;
              onChunk(content, fullText);
            }
          } catch (e) {
            console.warn('解析流式响应数据失败:', e);
          }
        }
      }
    }
    
    // 返回完整的响应
    return {
      choices: [{
        message: {
          content: fullText
        }
      }]
    };
  } catch (error) {
    console.error('生成回复失败:', error);
    console.error('错误详情:', {
      message: error.message,
      apiKey: apiKey ? '已配置' : '未配置',
      model: model,
      messagesCount: messages.length
    });
    throw error;
  }
};

/**
 * 根据角色和对话历史生成回复
 * @param {string} apiKey - API密钥
 * @param {Object} agent - 智能体信息
 * @param {Array} messages - 消息历史
 * @param {string} topic - 讨论主题
 * @param {boolean} stream - 是否使用流式响应
 * @param {Function} onChunk - 流式响应回调函数
 * @returns {Promise<string>} - 生成的回复文本
 */
export const generateAgentResponse = async (apiKey, agent, messages, topic = '', stream = false, onChunk = null) => {
  // 根据角色构建更具对峙性的系统提示
  const getRoleSpecificPrompt = (role) => {
    const rolePrompts = {
      '批评者': `你是一个严格的批评者，你的职责是：
- 质疑其他人的观点，寻找逻辑漏洞和不足之处
- 提出尖锐的反对意见和挑战性问题
- 不轻易认同，要求提供更多证据和论证
- 指出方案的潜在风险和问题
- 保持怀疑态度，推动更深入的思考`,

      '创意者': `你是一个富有创意的思考者，你的职责是：
- 提出新颖、独特的想法和解决方案
- 挑战传统思维模式，打破常规
- 当其他人的想法过于保守时，要大胆质疑
- 推动讨论向更创新的方向发展
- 不满足于平庸的解决方案`,

      '分析者': `你是一个严谨的分析师，你的职责是：
- 用数据和逻辑分析其他人的观点
- 指出论证中的逻辑错误和数据缺陷
- 要求提供具体的证据支持
- 质疑不够严谨的结论
- 推动讨论更加理性和客观`,

      '整合者': `你是一个整合不同观点的协调者，但你不是和稀泥的人：
- 当发现观点冲突时，要深入挖掘分歧的根源
- 质疑表面的一致性，寻找深层的矛盾
- 推动各方进行更深入的辩论
- 不轻易接受妥协方案，要求更完善的解决方案`,

      '执行者': `你是一个注重实践的执行者，你的职责是：
- 质疑不切实际的想法和方案
- 指出执行中的困难和障碍
- 要求提供具体的实施细节
- 挑战过于理想化的观点
- 推动讨论更加务实和可行`,

      '专家': `你是该领域的专家，你的职责是：
- 用专业知识质疑不准确的观点
- 指出其他人认知上的盲点和错误
- 提出更专业、更深入的见解
- 不容忍外行的错误理解
- 推动讨论达到专业水准`,

      '协调者': `你是一个协调者，但你要推动建设性的冲突：
- 当讨论过于和谐时，要主动挑起争议
- 鼓励不同观点的碰撞和辩论
- 质疑过于快速的共识
- 推动各方表达真实的不同意见`,

      '主持人': `你是讨论的主持人，你的职责是：
- 推动更深入的辩论和思考
- 当讨论浅尝辄止时，要提出更尖锐的问题
- 不满足于表面的答案，要求更深层的分析
- 鼓励参与者挑战彼此的观点`,

      '记录者': `你是一个记录者，但你要做批判性的记录：
- 指出讨论中的逻辑不一致之处
- 质疑前后矛盾的观点
- 提醒大家注意被忽视的重要问题
- 推动讨论更加严谨和完整`
    };
    
    return rolePrompts[role] || `你扮演"${role}"角色，要积极参与辩论，不要轻易认同他人观点，要提出质疑和挑战。`;
  };

  // 构建系统提示，强调对峙性和批判性思维
  const systemPrompt = `你是一个名为"${agent.name}"的智能体，扮演"${agent.role}"角色。

${getRoleSpecificPrompt(agent.role)}

${agent.description || ''}

当前讨论主题："${topic}"

重要指导原则：
1. 不要轻易认同其他人的观点，要保持批判性思维
2. 积极寻找其他观点中的问题、漏洞和不足
3. 提出尖锐的问题和挑战性的反驳
4. 推动讨论向更深层次发展，不满足于表面的答案
5. 即使部分认同，也要指出需要改进的地方
6. 保持你的角色特色，不要被其他人的观点轻易说服
7. 当讨论过于和谐时，要主动制造建设性的冲突

请根据以上原则，以你的角色身份参与这场激烈的辩论！`;
  
  // 构建消息历史
  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(msg => ({
      role: msg.agentId === agent.id ? 'assistant' : 'user',
      content: `${msg.agentName || '用户'}: ${msg.text}`
    }))
  ];
  
  // 调用API生成回复
  try {
    console.log('调用API生成回复，参数：', { apiKey: apiKey ? '已配置' : '未配置', agent: agent.name, messagesCount: messages.length, stream });
    const response = await generateResponse(apiKey, null, formattedMessages, stream, onChunk);
    console.log('API响应成功');
    return response.choices[0].message.content;
  } catch (error) {
    console.error(`${agent.name}生成回复失败:`, error);
    return `抱歉，我(${agent.name})暂时无法回应，请稍后再试。`;
  }
};

/**
 * 生成讨论总结
 * @param {string} apiKey - API密钥
 * @param {string} topic - 讨论主题
 * @param {Array} messages - 消息历史
 * @param {boolean} stream - 是否使用流式响应
 * @param {Function} onChunk - 流式响应回调函数
 * @returns {Promise<string>} - 生成的总结文本
 */
export const generateDiscussionSummary = async (apiKey, topic, messages, stream = false, onChunk = null) => {
  // 构建系统提示
  const systemPrompt = `你是一个专业的讨论总结者。请对以下关于"${topic}"的多人讨论进行简洁的总结，提炼出主要观点和结论。`;
  
  // 构建消息历史
  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: messages.map(msg => `${msg.agentName || '用户'}: ${msg.text}`).join('\n') }
  ];
  
  // 调用API生成总结
  try {
    const response = await generateResponse(apiKey, null, formattedMessages, stream, onChunk);
    return response.choices[0].message.content;
  } catch (error) {
    console.error('生成讨论总结失败:', error);
    return `抱歉，暂时无法生成讨论总结，请稍后再试。`;
  }
};

/**
 * 获取账号信息
 * @param {string} apiKey - API密钥
 * @returns {Promise<Object>} - 账号信息
 */
export const getAccountInfo = async (apiKey) => {
  try {
    return await fetchWithRetry(
      `${API_BASE_URL}/account`, 
      {
        method: 'GET',
        headers: createHeaders(apiKey)
      }
    );
  } catch (error) {
    console.error('获取账号信息失败:', error);
    throw error;
  }
};