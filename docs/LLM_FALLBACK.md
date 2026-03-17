# 大模型备选方案 - 高维打击

## 问题背景

Cheerio 无法处理 SPA（单页应用）动态渲染的页面。

许多现代房产网站（如部分自如页面）使用 React/Vue 构建，HTML 源码中只有：
```html
<div id="root"></div>
<script src="app.js"></script>
```

实际数据由浏览器执行 JS 后动态插入，Cheerio 抓不到。

---

## 破局方案：大模型降噪萃取

不解析 HTML 结构，直接把页面纯文本喂给大模型，让其提取关键信息。

### 核心优势

| 优势 | 说明 |
|------|------|
| **容错率极高** | 不需要精确选择器，大模型理解自然语言 |
| **自适应结构变化** | 网页改版不影响提取逻辑 |
| **处理非结构化数据** | 图片 OCR、复杂排版都能处理 |
| **快速部署** | 无需维护大量选择器规则 |

---

## 实现架构

```
用户链接 -> 抓取 HTML -> 提取纯文本 -> LLM API -> 结构化 JSON -> Adapter -> 引擎
```

### 代码实现

```typescript
// app/api/extract-listing-llm/route.ts
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { targetUrl } = await req.json();
  
  // 1. 抓取页面（只取文本，不解析 DOM）
  const response = await fetch(targetUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 ...' },
  });
  const html = await response.text();
  
  // 2. 简单清洗：去标签，保留文本
  const text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 8000); // 限制 token 数
  
  // 3. 大模型提取
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo', // 或更轻的 gpt-4o-mini
    messages: [
      {
        role: 'system',
        content: `你是一个房源信息提取专家。从以下杂乱无章的房产广告词中，提取关键信息并严格按照 JSON 格式返回。

必须提取的字段：
- title: 房源标题
- floor_info: 楼层信息（如"中楼层/共18层"）
- area: 面积（如"45.5㎡"）
- orientation: 朝向（如"南北"）
- tags: 标签数组（如["近地铁", "精装"]）
- layout: 户型（如"1室1厅"）
- building_age: 建筑年代（如"2015年"）
- has_elevator: 是否有电梯（true/false）

如果某字段无法确定，使用 null。
只返回 JSON，不要其他文字。`
      },
      {
        role: 'user',
        content: text,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1, // 低温度，稳定输出
  });
  
  const extracted = JSON.parse(completion.choices[0].message.content || '{}');
  
  return NextResponse.json({
    success: true,
    data: extracted,
    method: 'llm',
  });
}
```

---

## 成本与性能

| 指标 | 数值 | 说明 |
|------|------|------|
| **单次请求 token** | ~2000-4000 | 取决于页面大小 |
| **GPT-3.5 成本** | ~$0.001-0.002/次 | 约 0.007-0.014 元人民币 |
| **响应时间** | 2-5s | 比 Cheerio 慢 1-2s |
| **准确率** | 85-95% | 对中文房源信息提取效果良好 |

---

## 混合策略（推荐）

生产环境采用 **Cheerio + LLM 降级** 的混合策略：

```typescript
export async function POST(req: Request) {
  const { targetUrl } = await req.json();
  
  // 先尝试 Cheerio（快、便宜）
  const cheerioResult = await tryCheerioExtract(targetUrl);
  if (cheerioResult.success && hasCoreFields(cheerioResult.data)) {
    return NextResponse.json(cheerioResult);
  }
  
  // Cheerio 失败，降级到 LLM（慢、贵但稳）
  console.log('[Extract] Cheerio failed, falling back to LLM');
  const llmResult = await tryLLMExtract(targetUrl);
  return NextResponse.json(llmResult);
}
```

---

## 进一步优化

### 1. 缓存机制

热门房源 URL 的结果缓存 24 小时，减少重复调用：

```typescript
// Vercel KV 或 Redis
const cacheKey = `listing:${md5(targetUrl)}`;
const cached = await kv.get(cacheKey);
if (cached) return NextResponse.json(cached);

const result = await extract(targetUrl);
await kv.set(cacheKey, result, { ex: 86400 });
```

### 2. 轻量模型

使用国内大模型降低成本：
- **百度文心**: ERNIE-Speed，成本更低
- **阿里通义**: qwen-turbo，中文优化好
- **DeepSeek**: deepseek-chat，性价比极高

### 3. 结构化提示词优化

提供示例输出（Few-shot），提高准确率：

```typescript
const examples = `
示例 1:
输入: "朝阳区 精装一居 中楼层 朝南 45平米 近地铁"
输出: {"floor_info": "中楼层", "area": "45平米", "orientation": "朝南", ...}

示例 2:
...
`;
```

---

## 实施建议

| 阶段 | 建议 |
|------|------|
| **MVP 阶段** | 只用 Cheerio，覆盖主流平台 |
| **增长阶段** | 引入 LLM 作为降级方案 |
| **成熟阶段** | Cheerio + LLM 混合，加缓存 |

---

## 风险与限制

1. **API 成本**: 高频调用成本可观，需加缓存和限流
2. **响应延迟**: 2-5s 比 Cheerio 慢，需 loading 状态
3. **数据隐私**: 用户房源链接可能包含敏感信息，需脱敏
4. **模型幻觉**: 极少数情况会编造数据，需校验

---

**结论**: 大模型方案是当前最优的兜底策略，当 Cheerio 失效时的完美 Plan B。
