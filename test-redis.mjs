// test-redis.mjs
// 本地实弹演习：直接向 Upstash Redis 写入测试日志

import { Redis } from '@upstash/redis';
import 'dotenv/config'; // 自动读取 .env 文件

const redis = Redis.fromEnv();

async function fireTestLog() {
  console.log('🚀 [发射倒计时] 正在向 Upstash 阵列推送高危房源 Shadow Log...\n');

  // 伪造一条极致真实的 Beta 阶段观测日志
  const mockLog = {
    id: `test-case-${Date.now()}`,
    timestamp: Date.now(),
    sessionId: 'anonymous-hacker-001',
    input: {
      layoutType: 'studio',
      areaSqm: 25,
      orientation: 'north',
      floorLevel: 'low',
      totalFloors: 6,
      hasElevator: false,
      buildingAge: 'old',
      hasWestFacingWindow: false,
      facesMainRoad: true,
      nearElevator: true,
      isShared: true,
      roommateSituation: 'stranger',
      primaryGoal: 'sleep_quality',
      allowsLightRenovation: false,
      allowsFurnitureMove: false,
      allowsSoftImprovements: false,
    },
    result: {
      verdict: 'avoid',
      overallScore: 32,
      risks: [
        { id: 'no_window', title: '无独立窗户', severity: 'high' },
        { id: 'shared_stranger', title: '与陌生人合租', severity: 'high' },
        { id: 'main_road_noise', title: '临街主干道噪音', severity: 'medium' },
      ],
      actions: [
        { code: 'change', title: '建议更换房源' },
      ],
      decisionNote: {
        type: 'structural_defect',
        title: '结构性缺陷',
        severity: 'high',
      },
    },
    inputQuality: {
      confidence: 'high',
      warningCount: 0,
      warnings: [],
    },
    meta: {
      source: 'web',
      version: '1.2.0',
      userAgent: 'Mozilla/5.0 (Test Script)',
      url: 'http://localhost:3000/test',
    },
  };

  try {
    const pipeline = redis.pipeline();
    const REDIS_KEY = 'shadow:logs:beta';

    // 核心连招：推入 -> 续期 -> 截断
    pipeline.lpush(REDIS_KEY, JSON.stringify(mockLog));
    pipeline.expire(REDIS_KEY, 7 * 24 * 60 * 60); // 7天过期
    pipeline.ltrim(REDIS_KEY, 0, 4999); // 保留最新5000条

    await pipeline.exec();

    console.log('✅ [打击确认] 命中目标！数据已成功写入 N. Virginia 节点。\n');
    console.log('📊 写入的数据预览：');
    console.log(JSON.stringify({
      id: mockLog.id,
      verdict: mockLog.result.verdict,
      score: mockLog.result.overallScore,
      goal: mockLog.input.primaryGoal,
    }, null, 2));
    
    console.log('\n🌐 验证步骤：');
    console.log('1. 启动本地服务器: npm run dev');
    console.log('2. 访问: http://localhost:3000/dev/metrics');
    console.log('3. 查看 Recent Logs 中是否出现这条测试数据');
    
  } catch (error) {
    console.error('❌ [打击失败] 链接或凭证异常：', error);
    process.exit(1);
  }
}

// 验证 Redis 连接
async function verifyConnection() {
  console.log('🔌 [链路检测] 正在验证 Upstash 连接...\n');
  try {
    const ping = await redis.ping();
    console.log(`✅ Redis 连接正常: ${ping}\n`);
    return true;
  } catch (e) {
    console.error('❌ Redis 连接失败:', e.message);
    console.log('\n💡 请检查:');
    console.log('   - .env 文件是否存在且包含 UPSTASH_REDIS_REST_URL 和 TOKEN');
    console.log('   - 网络连接是否正常');
    return false;
  }
}

// 主流程
async function main() {
  const connected = await verifyConnection();
  if (connected) {
    await fireTestLog();
  }
}

main();
