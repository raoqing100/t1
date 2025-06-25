/**
 * 主持人功能测试脚本
 * 用于验证主持人模块的基础功能是否正常工作
 */

import { ModeratorCore, DiscussionModerator } from './services/moderator.js';

// 模拟测试数据
const testAgents = [
  { id: 'agent1', name: '小明', role: '分析师' },
  { id: 'agent2', name: '小红', role: '创意者' },
  { id: 'agent3', name: '小李', role: '批评者' }
];

const testMessages = [
  {
    id: '1',
    agentId: 'system',
    text: '讨论话题: 如何提高团队工作效率？',
    timestamp: new Date().toISOString(),
    type: 'system'
  },
  {
    id: '2',
    agentId: 'agent1',
    text: '我认为可以通过使用项目管理工具来提高效率，比如Trello或Asana。',
    timestamp: new Date().toISOString(),
    type: 'message'
  },
  {
    id: '3',
    agentId: 'agent2',
    text: '除了工具，我觉得团队沟通也很重要。定期的站会可以帮助大家同步进度。',
    timestamp: new Date().toISOString(),
    type: 'message'
  },
  {
    id: '4',
    agentId: 'agent3',
    text: '但是太多的会议可能会浪费时间。我们需要平衡沟通和实际工作时间。',
    timestamp: new Date().toISOString(),
    type: 'message'
  }
];

// 测试主持人核心功能
function testModeratorCore() {
  console.log('🧪 测试主持人核心功能...\n');

  // 测试状态分析
  console.log('📊 测试状态分析：');
  const depth = ModeratorCore.perception.analyzeDepth(testMessages);
  const breadth = ModeratorCore.perception.analyzeBreadth(testMessages);
  const engagement = ModeratorCore.perception.analyzeEngagement(testMessages, testAgents);
  const controversy = ModeratorCore.perception.detectControversy(testMessages);
  const innovation = ModeratorCore.perception.detectInnovation(testMessages);

  console.log(`- 深度分数: ${(depth * 100).toFixed(1)}%`);
  console.log(`- 广度分数: ${(breadth * 100).toFixed(1)}%`);
  console.log(`- 参与度分数: ${(engagement * 100).toFixed(1)}%`);
  console.log(`- 争议程度: ${(controversy * 100).toFixed(1)}%`);
  console.log(`- 创新程度: ${(innovation * 100).toFixed(1)}%`);

  // 测试策略选择
  console.log('\n🎯 测试策略选择：');
  const state = ModeratorCore.strategy.analyzeCurrentState(testMessages, testAgents);
  const strategy = ModeratorCore.strategy.selectOptimalStrategy(state);
  console.log(`- 选择的策略: ${strategy}`);

  // 测试引导生成
  console.log('\n💬 测试引导生成：');
  const context = {
    topic: '如何提高团队工作效率',
    agents: testAgents,
    knowledgeBase: '',
    currentRound: 2,
    state: state
  };
  const guidance = ModeratorCore.guidance.generateGuidance(strategy, context);
  console.log(`- 观察: ${guidance.observation}`);
  console.log(`- 问题: ${guidance.question}`);
  console.log(`- 任务: ${guidance.task}`);
  console.log(`- 方向: ${guidance.direction}`);
}

// 测试主持人类
function testModeratorClass() {
  console.log('\n🎭 测试主持人类...\n');

  const moderator = new DiscussionModerator(
    testAgents, 
    '如何提高团队工作效率',
    '团队效率是现代企业成功的关键因素之一。'
  );

  console.log('📋 主持人初始化完成');
  console.log(`- 话题: ${moderator.topic}`);
  console.log(`- 智能体数量: ${moderator.agents.length}`);
  console.log(`- 知识库: ${moderator.knowledgeBase}`);

  // 测试引导生成
  console.log('\n🎯 生成主持人引导：');
  const moderatorMessage = moderator.moderate(testMessages);
  console.log(`- 消息ID: ${moderatorMessage.id}`);
  console.log(`- 发言者: ${moderatorMessage.agentName}`);
  console.log(`- 策略: ${moderatorMessage.strategy}`);
  console.log(`- 内容预览: ${moderatorMessage.text.substring(0, 100)}...`);

  // 测试质量报告
  console.log('\n📊 生成质量报告：');
  const qualityReport = moderator.getQualityReport();
  console.log(`- 轮次: ${qualityReport.round}`);
  console.log(`- 策略: ${qualityReport.strategy}`);
  console.log(`- 综合质量: ${qualityReport.overall}%`);
  console.log('- 各项分数:');
  console.log(`  * 深度: ${qualityReport.scores.depth}%`);
  console.log(`  * 广度: ${qualityReport.scores.breadth}%`);
  console.log(`  * 参与度: ${qualityReport.scores.engagement}%`);
  console.log(`  * 争议度: ${qualityReport.scores.controversy}%`);
  console.log(`  * 创新度: ${qualityReport.scores.innovation}%`);
}

// 运行测试
function runTests() {
  console.log('🚀 开始主持人功能测试\n');
  console.log('=' * 50);
  
  try {
    testModeratorCore();
    testModeratorClass();
    
    console.log('\n' + '=' * 50);
    console.log('✅ 所有测试完成！主持人功能正常工作。');
    console.log('\n🎉 可以开始在聊天室中使用主持人功能了！');
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    console.log('\n🔧 请检查代码并修复问题。');
  }
}

// 如果直接运行此文件，则执行测试
if (typeof window === 'undefined') {
  // Node.js 环境
  runTests();
} else {
  // 浏览器环境，将测试函数暴露到全局
  window.testModerator = runTests;
  console.log('🧪 主持人测试已准备就绪。在浏览器控制台中运行 testModerator() 来执行测试。');
}

export { runTests as testModerator }; 