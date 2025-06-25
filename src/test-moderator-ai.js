/**
 * 测试主持人AI功能
 * 验证主持人是否能够正确调用AI API并生成智能引导
 */

import { DiscussionModerator } from './services/moderator.js';

// 模拟的智能体配置
const testAgents = [
  {
    id: 'agent1',
    name: '创新者',
    role: '创意者',
    apiKey: 'test-key',
    model: 'deepseek-ai/DeepSeek-R1'
  },
  {
    id: 'agent2', 
    name: '批评家',
    role: '批评者',
    apiKey: 'test-key',
    model: 'deepseek-ai/DeepSeek-R1'
  }
];

// 模拟的主持人配置
const moderatorConfig = {
  apiKey: 'sk-test-key-12345', // 请替换为真实的API密钥
  model: 'deepseek-ai/DeepSeek-R1',
  personality: 'professional',
  style: 'socratic',
  maxResponseLength: 300
};

// 模拟的讨论消息
const testMessages = [
  {
    id: '1',
    agentId: 'system',
    text: '讨论话题: 人工智能是否会取代人类工作',
    timestamp: new Date().toISOString(),
    type: 'system'
  },
  {
    id: '2',
    agentId: 'agent1',
    agentName: '创新者',
    text: '我认为AI将创造更多新的工作机会，历史上每次技术革命都是如此。',
    timestamp: new Date().toISOString(),
    type: 'message'
  },
  {
    id: '3',
    agentId: 'agent2',
    agentName: '批评家',
    text: '这次不同，AI的能力范围太广了，可能会同时影响多个行业。',
    timestamp: new Date().toISOString(),
    type: 'message'
  }
];

async function testModeratorAI() {
  console.log('🎭 开始测试主持人AI功能...\n');
  
  // 创建主持人实例
  const moderator = new DiscussionModerator(
    testAgents,
    '人工智能是否会取代人类工作',
    '相关背景：当前AI技术发展迅速，GPT、Claude等大语言模型已经在多个领域展现出强大能力。',
    moderatorConfig
  );
  
  try {
    console.log('📊 分析讨论状态...');
    
    // 测试主持人的分析和引导功能
    const guidance = await moderator.moderate(testMessages);
    
    console.log('✅ 主持人引导成功生成！');
    console.log('🎯 引导内容:');
    console.log('-----------------------------------');
    console.log(`发言者: ${guidance.agentName}`);
    console.log(`策略: ${guidance.strategy}`);
    console.log(`内容: ${guidance.text}`);
    console.log('-----------------------------------\n');
    
    // 获取质量报告
    const report = moderator.getQualityReport();
    console.log('📈 讨论质量报告:');
    console.log(`轮次: ${report.round}`);
    console.log(`策略: ${report.strategy}`);
    console.log(`深度: ${report.scores.depth}%`);
    console.log(`广度: ${report.scores.breadth}%`);
    console.log(`参与度: ${report.scores.engagement}%`);
    console.log(`争议度: ${report.scores.controversy}%`);
    console.log(`创新度: ${report.scores.innovation}%`);
    console.log(`综合质量: ${report.overall}%\n`);
    
    console.log('🎉 主持人AI功能测试完成！');
    
  } catch (error) {
    console.error('❌ 主持人AI功能测试失败:');
    console.error('错误详情:', error.message);
    
    if (error.message.includes('API请求失败')) {
      console.log('\n💡 可能的解决方案:');
      console.log('1. 检查API密钥是否正确配置');
      console.log('2. 检查网络连接是否正常');
      console.log('3. 确认硅基流动账户余额充足');
      console.log('4. 验证选择的模型是否可用');
    }
    
    // 测试备用模板功能
    console.log('\n🔄 测试备用模板功能...');
    try {
      const moderatorWithoutAPI = new DiscussionModerator(
        testAgents,
        '人工智能是否会取代人类工作',
        '相关背景：当前AI技术发展迅速。',
        { ...moderatorConfig, apiKey: '' } // 不提供API密钥
      );
      
      const templateGuidance = await moderatorWithoutAPI.moderate(testMessages);
      console.log('✅ 备用模板功能正常！');
      console.log(`模板内容: ${templateGuidance.text.substring(0, 100)}...`);
      
    } catch (templateError) {
      console.error('❌ 备用模板功能也失败:', templateError.message);
    }
  }
}

// 运行测试
if (typeof window === 'undefined') {
  // Node.js环境
  testModeratorAI().catch(console.error);
} else {
  // 浏览器环境
  window.testModeratorAI = testModeratorAI;
  console.log('🌐 在浏览器控制台中运行: testModeratorAI()');
}

export { testModeratorAI }; 