import OpenAI from 'openai';

const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
});

export interface LLMResponse<T> {
  data: T;
  raw: string;
}

export async function generateWithDeepSeek<T>(
  prompt: string,
  schema: { name: string; description: string },
  parser: (text: string) => T
): Promise<LLMResponse<T>> {
  try {
    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant. ${schema.description}. Output valid JSON only.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || '';
    
    // 提取JSON（防止模型输出markdown代码块）
    const jsonMatch = content.match(/```json\n?([\s\S]*?)```/) || 
                      content.match(/```\n?([\s\S]*?)```/) ||
                      [null, content];
    
    const jsonStr = jsonMatch[1]?.trim() || content.trim();
    const data = parser(jsonStr);
    
    return { data, raw: content };
  } catch (error) {
    console.error('DeepSeek API error:', error);
    throw error;
  }
}

export { deepseek };