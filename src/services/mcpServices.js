/**
 * AI服务配置
 * 基于 SiliconFlow 文档: https://docs.siliconflow.cn/
 */
export const mcpServices = [
  {
    id: 'siliconflow',
    name: 'SiliconFlow',
    description: 'SiliconFlow AI 平台 - 支持多种大模型',
    endpoint: 'https://api.siliconflow.cn/v1',
    models: [
      'Qwen/Qwen2.5-7B-Instruct',
      'Qwen/Qwen2.5-14B-Instruct', 
      'Qwen/Qwen2.5-32B-Instruct',
      'Qwen/Qwen2.5-72B-Instruct',
      'deepseek-ai/DeepSeek-V2.5',
      'meta-llama/Meta-Llama-3.1-8B-Instruct',
      'meta-llama/Meta-Llama-3.1-70B-Instruct',
      'meta-llama/Meta-Llama-3.1-405B-Instruct'
    ]
  },
  {
    id: 'custom',
    name: '自定义API',
    description: '使用自定义的API服务',
    endpoint: '',
    models: []
  }
]; 