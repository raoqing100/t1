// 本地存储服务 - 用于对话记录的存储和检索

// 存储键名
const STORAGE_KEYS = {
  DISCUSSIONS: 'multiagent_discussions',
  API_KEYS: 'multiagent_api_keys',
  AGENT_CONFIGS: 'multiagent_agent_configs',
};

/**
 * 简单的加密函数（非安全加密，仅用于基本保护）
 * @param {string} text - 要加密的文本
 * @param {string} key - 加密密钥
 * @returns {string} - 加密后的文本
 */
const encrypt = (text, key = 'multiagent-chat-app') => {
  // 创建一个简单的替换密码
  const result = [];
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result.push(String.fromCharCode(charCode));
  }
  return btoa(result.join('')); // Base64编码
};

/**
 * 简单的解密函数
 * @param {string} encryptedText - 加密文本
 * @param {string} key - 解密密钥
 * @returns {string} - 解密后的文本
 */
const decrypt = (encryptedText, key = 'multiagent-chat-app') => {
  try {
    const encryptedBytes = atob(encryptedText); // Base64解码
    const result = [];
    for (let i = 0; i < encryptedBytes.length; i++) {
      const charCode = encryptedBytes.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result.push(String.fromCharCode(charCode));
    }
    return result.join('');
  } catch (error) {
    console.error('解密失败:', error);
    return '';
  }
};

/**
 * 保存API密钥
 * @param {string} provider - API提供商
 * @param {string} apiKey - API密钥
 * @returns {boolean} - 保存是否成功
 */
export const saveApiKey = (provider, apiKey) => {
  try {
    // 获取现有的API密钥
    const apiKeys = getApiKeys();
    
    // 加密API密钥
    const encryptedApiKey = encrypt(apiKey);
    
    // 更新或添加API密钥
    apiKeys[provider] = {
      key: encryptedApiKey,
      updatedAt: new Date().toISOString()
    };
    
    // 保存到localStorage
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(apiKeys));
    return true;
  } catch (error) {
    console.error('保存API密钥失败:', error);
    return false;
  }
};

/**
 * 获取API密钥
 * @param {string} provider - API提供商
 * @returns {string|null} - API密钥，如果不存在则返回null
 */
export const getApiKey = (provider) => {
  try {
    const apiKeys = getApiKeys();
    const encryptedApiKey = apiKeys[provider]?.key;
    
    if (!encryptedApiKey) return null;
    
    // 解密API密钥
    return decrypt(encryptedApiKey);
  } catch (error) {
    console.error(`获取API密钥(${provider})失败:`, error);
    return null;
  }
};

/**
 * 获取所有API密钥
 * @returns {Object} - API密钥对象
 */
export const getApiKeys = () => {
  try {
    const apiKeysJson = localStorage.getItem(STORAGE_KEYS.API_KEYS);
    return apiKeysJson ? JSON.parse(apiKeysJson) : {};
  } catch (error) {
    console.error('获取API密钥列表失败:', error);
    return {};
  }
};

/**
 * 删除API密钥
 * @param {string} provider - API提供商
 * @returns {boolean} - 删除是否成功
 */
export const deleteApiKey = (provider) => {
  try {
    const apiKeys = getApiKeys();
    
    if (!apiKeys[provider]) {
      return false;
    }
    
    delete apiKeys[provider];
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(apiKeys));
    return true;
  } catch (error) {
    console.error(`删除API密钥(${provider})失败:`, error);
    return false;
  }
};

/**
 * 保存对话记录
 * @param {Object} discussion - 对话记录对象
 * @param {string} discussion.id - 对话ID
 * @param {string} discussion.topic - 讨论话题
 * @param {Array} discussion.messages - 消息列表
 * @param {Date} discussion.createdAt - 创建时间
 * @returns {boolean} - 保存是否成功
 */
export const saveDiscussion = (discussion) => {
  try {
    // 确保discussion对象包含必要字段
    if (!discussion.id || !discussion.topic || !discussion.messages) {
      console.error('保存对话记录失败: 缺少必要字段');
      return false;
    }

    // 获取现有的对话记录列表
    const discussions = getDiscussionList();

    // 检查是否已存在相同ID的对话记录
    const existingIndex = discussions.findIndex(d => d.id === discussion.id);
    
    // 处理智能体中的API密钥，保存前加密
    if (discussion.agents) {
      discussion.agents = discussion.agents.map(agent => {
        if (agent.apiKey) {
          // 将API密钥存储到单独的位置
          saveApiKey(`agent_${agent.id}`, agent.apiKey);
          // 在讨论记录中只保存一个标记，表示有API密钥
          return { ...agent, apiKey: agent.apiKey ? 'HAS_KEY' : '' };
        }
        return agent;
      });
    }
    
    if (existingIndex >= 0) {
      // 更新现有记录
      discussions[existingIndex] = discussion;
    } else {
      // 添加新记录
      discussions.push(discussion);
    }

    // 保存到localStorage
    localStorage.setItem(STORAGE_KEYS.DISCUSSIONS, JSON.stringify(discussions));
    return true;
  } catch (error) {
    console.error('保存对话记录失败:', error);
    return false;
  }
};

/**
 * 获取对话记录列表
 * @returns {Array} - 对话记录列表
 */
export const getDiscussionList = () => {
  try {
    const discussionsJson = localStorage.getItem(STORAGE_KEYS.DISCUSSIONS);
    return discussionsJson ? JSON.parse(discussionsJson) : [];
  } catch (error) {
    console.error('获取对话记录列表失败:', error);
    return [];
  }
};

/**
 * 获取特定对话记录
 * @param {string} discussionId - 对话ID
 * @returns {Object|null} - 对话记录对象，如果不存在则返回null
 */
export const getDiscussionById = (discussionId) => {
  try {
    const discussions = getDiscussionList();
    const discussion = discussions.find(d => d.id === discussionId) || null;
    
    // 如果找到讨论记录，恢复智能体的API密钥
    if (discussion && discussion.agents) {
      discussion.agents = discussion.agents.map(agent => {
        if (agent.apiKey === 'HAS_KEY') {
          // 从单独存储中获取API密钥
          const apiKey = getApiKey(`agent_${agent.id}`);
          return { ...agent, apiKey: apiKey || '' };
        }
        return agent;
      });
    }
    
    return discussion;
  } catch (error) {
    console.error(`获取对话记录(ID: ${discussionId})失败:`, error);
    return null;
  }
};

/**
 * 删除特定对话记录
 * @param {string} discussionId - 对话ID
 * @returns {boolean} - 删除是否成功
 */
export const deleteDiscussion = (discussionId) => {
  try {
    const discussions = getDiscussionList();
    const discussion = discussions.find(d => d.id === discussionId);
    
    // 如果找到讨论，删除相关的API密钥
    if (discussion && discussion.agents) {
      discussion.agents.forEach(agent => {
        if (agent.apiKey === 'HAS_KEY') {
          deleteApiKey(`agent_${agent.id}`);
        }
      });
    }
    
    const newDiscussions = discussions.filter(d => d.id !== discussionId);
    
    if (newDiscussions.length === discussions.length) {
      // 没有找到要删除的记录
      return false;
    }
    
    localStorage.setItem(STORAGE_KEYS.DISCUSSIONS, JSON.stringify(newDiscussions));
    return true;
  } catch (error) {
    console.error(`删除对话记录(ID: ${discussionId})失败:`, error);
    return false;
  }
};

/**
 * 导出对话记录为JSON文件
 * @param {string} discussionId - 对话ID
 */
export const exportDiscussionAsJson = (discussionId) => {
  try {
    const discussion = getDiscussionById(discussionId);
    if (!discussion) {
      throw new Error(`未找到ID为${discussionId}的对话记录`);
    }
    
    // 创建导出版本，不包含API密钥
    const exportVersion = {
      ...discussion,
      agents: discussion.agents?.map(agent => ({
        ...agent,
        apiKey: '' // 不导出API密钥
      }))
    };
    
    // 创建Blob对象
    const blob = new Blob([JSON.stringify(exportVersion, null, 2)], { type: 'application/json' });
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discussion_${discussion.topic.substring(0, 20)}_${new Date().toISOString().split('T')[0]}.json`;
    
    // 触发下载
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    return true;
  } catch (error) {
    console.error(`导出对话记录(ID: ${discussionId})失败:`, error);
    return false;
  }
};

/**
 * 保存智能体配置文件
 * @param {Object} config - 配置对象
 * @param {string} config.name - 配置名称
 * @param {Array} config.agents - 智能体列表
 * @returns {string|boolean} - 保存成功返回配置ID，失败返回false
 */
export const saveAgentConfig = (config) => {
  try {
    if (!config.name || !config.agents) {
      console.error('保存智能体配置失败: 缺少必要字段');
      return false;
    }

    // 获取现有配置列表
    const configs = getAgentConfigList();

    // 创建配置对象
    const configToSave = {
      id: config.id || `config_${Date.now()}`,
      name: config.name,
      description: config.description || '',
      agents: config.agents.map(agent => ({
        ...agent,
        apiKey: agent.apiKey ? 'HAS_KEY' : ''  // 不直接保存API密钥
      })),
      createdAt: config.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 保存API密钥到单独的位置
    config.agents.forEach(agent => {
      if (agent.apiKey && agent.apiKey !== 'HAS_KEY') {
        saveApiKey(`config_${configToSave.id}_agent_${agent.id}`, agent.apiKey);
      }
    });

    // 检查是否已存在相同ID的配置
    const existingIndex = configs.findIndex(c => c.id === configToSave.id);
    
    if (existingIndex >= 0) {
      configs[existingIndex] = configToSave;
    } else {
      configs.push(configToSave);
    }

    // 保存到localStorage
    localStorage.setItem(STORAGE_KEYS.AGENT_CONFIGS, JSON.stringify(configs));
    return configToSave.id;
  } catch (error) {
    console.error('保存智能体配置失败:', error);
    return false;
  }
};

/**
 * 获取智能体配置列表
 * @returns {Array} - 配置列表
 */
export const getAgentConfigList = () => {
  try {
    const configsJson = localStorage.getItem(STORAGE_KEYS.AGENT_CONFIGS);
    return configsJson ? JSON.parse(configsJson) : [];
  } catch (error) {
    console.error('获取智能体配置列表失败:', error);
    return [];
  }
};

/**
 * 获取特定智能体配置
 * @param {string} configId - 配置ID
 * @returns {Object|null} - 配置对象
 */
export const getAgentConfigById = (configId) => {
  try {
    const configs = getAgentConfigList();
    const config = configs.find(c => c.id === configId);
    
    if (!config) return null;

    // 恢复API密钥
    const configWithApiKeys = {
      ...config,
      agents: config.agents.map(agent => {
        if (agent.apiKey === 'HAS_KEY') {
          const apiKey = getApiKey(`config_${configId}_agent_${agent.id}`);
          return { ...agent, apiKey: apiKey || '' };
        }
        return agent;
      })
    };

    return configWithApiKeys;
  } catch (error) {
    console.error(`获取智能体配置(ID: ${configId})失败:`, error);
    return null;
  }
};

/**
 * 删除智能体配置
 * @param {string} configId - 配置ID
 * @returns {boolean} - 删除是否成功
 */
export const deleteAgentConfig = (configId) => {
  try {
    const configs = getAgentConfigList();
    const config = configs.find(c => c.id === configId);
    
    // 删除相关的API密钥
    if (config && config.agents) {
      config.agents.forEach(agent => {
        if (agent.apiKey === 'HAS_KEY') {
          deleteApiKey(`config_${configId}_agent_${agent.id}`);
        }
      });
    }
    
    const newConfigs = configs.filter(c => c.id !== configId);
    
    if (newConfigs.length === configs.length) {
      return false;
    }
    
    localStorage.setItem(STORAGE_KEYS.AGENT_CONFIGS, JSON.stringify(newConfigs));
    return true;
  } catch (error) {
    console.error(`删除智能体配置(ID: ${configId})失败:`, error);
    return false;
  }
};

/**
 * 导出智能体配置为JSON文件
 * @param {string} configId - 配置ID
 */
export const exportAgentConfigAsJson = (configId) => {
  try {
    const config = getAgentConfigById(configId);
    if (!config) {
      throw new Error(`未找到ID为${configId}的智能体配置`);
    }
    
    // 创建导出版本，不包含API密钥
    const exportVersion = {
      ...config,
      agents: config.agents.map(agent => ({
        ...agent,
        apiKey: ''  // 不导出API密钥
      }))
    };
    
    // 创建Blob对象
    const blob = new Blob([JSON.stringify(exportVersion, null, 2)], { type: 'application/json' });
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent_config_${config.name}_${new Date().toISOString().split('T')[0]}.json`;
    
    // 触发下载
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    return true;
  } catch (error) {
    console.error(`导出智能体配置(ID: ${configId})失败:`, error);
    return false;
  }
};