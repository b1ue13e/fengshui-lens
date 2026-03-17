#!/usr/bin/env tsx
/**
 * 闭环反哺脚本：将已解决的争议案例同步到测试集
 * 
 * 工作流程：
 * 1. 连接生产环境 PostgreSQL
 * 2. 拉取所有 status === 'RESOLVED' 且未同步的 DisputedCase
 * 3. 将案例转换为测试 fixtures，追加到 lib/engine/__tests__/fixtures/disputed-cases.ts
 * 4. 标记已同步的案例
 * 
 * 执行方式：
 *   npx tsx scripts/sync-disputed-cases.ts
 *   或 npm run sync:disputed
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// 测试文件路径
const FIXTURES_DIR = path.join(process.cwd(), 'lib', 'engine', '__tests__', 'fixtures');
const DISPUTED_CASES_FILE = path.join(FIXTURES_DIR, 'disputed-cases.ts');

/**
 * 生成唯一的测试用例 ID
 */
function generateTestCaseId(index: number): string {
  return `disputed-${Date.now()}-${index}`;
}

/**
 * 将数据库案例转换为测试用例格式
 */
function convertToTestCase(dbCase: any, index: number): string {
  const testId = generateTestCaseId(index);
  const rawInput = JSON.parse(dbCase.rawInput);
  
  return `  {
    id: '${testId}',
    description: '${dbCase.userFeedback?.replace(/'/g, "\\'") || 'Auto-synced disputed case'}',
    input: ${JSON.stringify(rawInput, null, 4).replace(/^/gm, '    ')},
    expected: {
      verdict: '${dbCase.correctedVerdict || 'cautious'}',
      note: 'Resolved from production dispute',
    },
    metadata: {
      originalVerdict: '${dbCase.verdictIssued}',
      engineVersion: '${dbCase.engineVersion}',
      disputedAt: '${dbCase.createdAt.toISOString()}',
      resolvedAt: '${dbCase.updatedAt.toISOString()}',
    },
  }`;
}

/**
 * 更新 fixtures 文件
 */
async function updateFixturesFile(cases: any[]): Promise<number> {
  // 确保目录存在
  if (!fs.existsSync(FIXTURES_DIR)) {
    fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  }

  // 读取现有文件内容（如果存在）
  let existingContent = '';
  let existingCases: string[] = [];
  
  if (fs.existsSync(DISPUTED_CASES_FILE)) {
    existingContent = fs.readFileSync(DISPUTED_CASES_FILE, 'utf-8');
    // 提取现有的案例（简单解析）
    const match = existingContent.match(/export const disputedCases = \[([\s\S]*)\];/);
    if (match) {
      existingCases.push(match[1].trim());
    }
  }

  // 转换新案例
  const newCaseStrings = cases.map((c, i) => convertToTestCase(c, i));
  
  // 合并所有案例
  const allCases = [...existingCases, ...newCaseStrings];
  
  // 生成新的文件内容
  const fileContent = `/**
 * 争议案例测试集 - 自动从生产环境同步
 * 
 * 这些案例来源于真实用户的负面反馈，
 * 经过人工确认后标记为 RESOLVED，
 * 用于确保引擎不会重复犯同样的错误。
 * 
 * 同步时间: ${new Date().toISOString()}
 * 案例数量: ${allCases.length}
 */

export const disputedCases = [
${allCases.join(',\n')},
];

export type DisputedCase = typeof disputedCases[number];
`;

  // 写入文件
  fs.writeFileSync(DISPUTED_CASES_FILE, fileContent, 'utf-8');
  
  return cases.length;
}

/**
 * 标记案例为已同步
 */
async function markCasesAsSynced(caseIds: string[]): Promise<void> {
  await prisma.disputedCase.updateMany({
    where: {
      id: {
        in: caseIds,
      },
    },
    data: {
      syncedToTest: true,
      status: 'SYNCED',
    },
  });
}

/**
 * 主流程
 */
async function main() {
  console.log('🔄 [闭环反哺] 启动争议案例同步...\n');

  try {
    // 1. 查询已解决但未同步的案例
    console.log('📡 正在查询生产数据库...');
    const disputedCases = await prisma.disputedCase.findMany({
      where: {
        status: 'RESOLVED',
        syncedToTest: false,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    console.log(`✅ 找到 ${disputedCases.length} 个待同步的争议案例\n`);

    if (disputedCases.length === 0) {
      console.log('💡 没有新的争议案例需要同步');
      return;
    }

    // 2. 更新 fixtures 文件
    console.log('📝 正在更新测试 fixtures...');
    const syncedCount = await updateFixturesFile(disputedCases);
    console.log(`✅ 已写入 ${syncedCount} 个案例到:`);
    console.log(`   ${DISPUTED_CASES_FILE}\n`);

    // 3. 标记为已同步
    console.log('🏷️  正在标记同步状态...');
    await markCasesAsSynced(disputedCases.map(c => c.id));
    console.log(`✅ 已标记 ${syncedCount} 个案例为 SYNCED\n`);

    // 4. 输出摘要
    console.log('📊 同步摘要:');
    console.log('─────────────────────────────');
    disputedCases.forEach((c, i) => {
      console.log(`${i + 1}. ${c.id}`);
      console.log(`   原判决: ${c.verdictIssued} → 应判决: ${c.correctedVerdict}`);
      console.log(`   反馈: ${c.userFeedback?.substring(0, 50)}...`);
      console.log('');
    });

    console.log('\n🎯 下一步:');
    console.log('   npm run test  # 运行测试，确保不再重复犯错');
    console.log('   git add lib/engine/__tests__/fixtures/disputed-cases.ts');
    console.log('   git commit -m "test: 同步争议案例到测试集"');

  } catch (error) {
    console.error('❌ 同步失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
