/**
 * 环境变量配置
 * 支持从环境变量或localStorage获取配置
 */

// 默认API配置
export const API_CONFIG = {
  // SiliconFlow API配置
  SILICONFLOW: {
    baseUrl: process.env.REACT_APP_SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1',
    apiKey: process.env.REACT_APP_SILICONFLOW_API_KEY || null,
    defaultModel: process.env.REACT_APP_SILICONFLOW_DEFAULT_MODEL || 'Qwen/Qwen2.5-7B-Instruct'
  },
  
  // OpenAI API配置
  OPENAI: {
    baseUrl: process.env.REACT_APP_OPENAI_BASE_URL || 'https://api.openai.com/v1',
    apiKey: process.env.REACT_APP_OPENAI_API_KEY || null,
    defaultModel: process.env.REACT_APP_OPENAI_DEFAULT_MODEL || 'gpt-3.5-turbo'
  },
  
  // Dify API配置
  DIFY: {
    baseUrl: process.env.REACT_APP_DIFY_BASE_URL || null,
    apiKey: process.env.REACT_APP_DIFY_API_KEY || null
  },
  
  // Coze API配置
  COZE: {
    baseUrl: process.env.REACT_APP_COZE_BASE_URL || null,
    apiKey: process.env.REACT_APP_COZE_API_KEY || null
  }
};

// 应用配置
export const APP_CONFIG = {
  // 应用名称
  name: process.env.REACT_APP_NAME || 'AI多智能体聊天室',
  
  // 版本号
  version: process.env.REACT_APP_VERSION || '1.0.0',
  
  // 调试模式
  debug: process.env.REACT_APP_DEBUG === 'true' || process.env.NODE_ENV === 'development',
  
  // 最大智能体数量
  maxAgents: parseInt(process.env.REACT_APP_MAX_AGENTS) || 8,
  
  // 默认讨论轮数
  defaultDiscussionRounds: parseInt(process.env.REACT_APP_DEFAULT_DISCUSSION_ROUNDS) || 5
};

/**
 * 获取API密钥
 * 优先级：localStorage > 环境变量 > null
 * @param {string} provider - API提供商 (SILICONFLOW, OPENAI, DIFY, COZE)
 * @param {string} localStorageKey - localStorage中的密钥名
 * @returns {string|null} - API密钥
 */
export const getApiKey = (provider, localStorageKey = null) => {
  // 首先尝试从localStorage获取（用户手动配置的优先级最高）
  if (localStorageKey) {
    try {
      const stored = localStorage.getItem(localStorageKey);
      if (stored) return stored;
    } catch (error) {
      console.warn('从localStorage获取API密钥失败:', error);
    }
  }
  
  // 然后从环境变量获取
  const envKey = API_CONFIG[provider]?.apiKey;
  if (envKey) return envKey;
  
  return null;
};

/**
 * 获取API基础URL
 * @param {string} provider - API提供商
 * @returns {string} - API基础URL
 */
export const getApiBaseUrl = (provider) => {
  return API_CONFIG[provider]?.baseUrl || null;
};

/**
 * 获取默认模型
 * @param {string} provider - API提供商
 * @returns {string} - 默认模型名称
 */
export const getDefaultModel = (provider) => {
  return API_CONFIG[provider]?.defaultModel || null;
};

/**
 * 检查是否为开发环境
 * @returns {boolean} - 是否为开发环境
 */
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

/**
 * 检查是否为生产环境
 * @returns {boolean} - 是否为生产环境
 */
export const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

/**
 * 获取完整的环境配置信息（用于调试）
 * @returns {Object} - 环境配置信息
 */
export const getEnvInfo = () => {
  if (!APP_CONFIG.debug) {
    return { message: '调试模式未启用' };
  }
  
  return {
    nodeEnv: process.env.NODE_ENV,
    appConfig: APP_CONFIG,
    apiConfig: {
      SILICONFLOW: {
        baseUrl: API_CONFIG.SILICONFLOW.baseUrl,
        hasApiKey: !!API_CONFIG.SILICONFLOW.apiKey,
        defaultModel: API_CONFIG.SILICONFLOW.defaultModel
      },
      OPENAI: {
        baseUrl: API_CONFIG.OPENAI.baseUrl,
        hasApiKey: !!API_CONFIG.OPENAI.apiKey,
        defaultModel: API_CONFIG.OPENAI.defaultModel
      },
      DIFY: {
        baseUrl: API_CONFIG.DIFY.baseUrl,
        hasApiKey: !!API_CONFIG.DIFY.apiKey
      },
      COZE: {
        baseUrl: API_CONFIG.COZE.baseUrl,
        hasApiKey: !!API_CONFIG.COZE.apiKey
      }
    }
  };
}; 