import { z } from 'zod';

export const SummarySchema = z.object({
  overallComment: z.string(),
  strength: z.string(),
  concern: z.string(),
  recommendation: z.string(),
});

export const ChatScriptSchema = z.object({
  scripts: z.array(z.object({
    scenario: z.enum(['negotiate', 'repair', 'renovation']),
    title: z.string(),
    content: z.string(),
  })),
});

export type SummaryOutput = z.infer<typeof SummarySchema>;
export type ChatScriptOutput = z.infer<typeof ChatScriptSchema>;