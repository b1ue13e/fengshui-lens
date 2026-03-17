/**
 * Shadow Logger - 影子模式日志系统
 * 
 * 职责：在生产环境异步记录 [输入 + 判定结果]，用于后续算法优化
 * 原则：不阻塞主流程，异步写入，结构化存储
 */

import type { EvaluationInput, EngineResult } from '@/lib/engine/types';

export interface ShadowLogEntry {
  // 唯一标识
  id: string;
  timestamp: number;
  sessionId: string;
  
  // 输入数据（完整）
  input: EvaluationInput;
  
  // 输出结果（完整）
  result: {
    verdict: EngineResult['verdict'];
    overallScore: number;
    risks: Array<{
      id: string;
      title: string;
      severity: string;
    }>;
    actions: Array<{
      code: string;
      title: string;
    }>;
    decisionNote?: {
      type: string;
      title: string;
      severity: string;
    };
  };
  
  // 输入质量（新增）
  inputQuality?: {
    confidence: 'high' | 'medium' | 'low';
    warningCount: number;
    warnings: Array<{
      field: string;
      code: string;
      severity: 'low' | 'medium' | 'high';
    }>;
  };
  
  // 元数据
  meta: {
    source: 'web' | 'api' | 'batch';
    userAgent?: string;
    url?: string;
    version: string; // 引擎版本
  };
  
  // 反馈状态（初始为空，用户反馈后更新）
  feedback?: {
    timestamp: number;
    isAccurate: boolean; // 用户认为判定是否准确
    userComment?: string;
    correctedVerdict?: EngineResult['verdict'];
  };
}

// 配置
const CONFIG = {
  // 本地存储键名
  STORAGE_KEY: 'spacerisk_shadow_logs',
  
  // 最大本地缓存数
  MAX_LOCAL_CACHE: 100,
  
  // 批量上报阈值
  BATCH_SIZE: 10,
  
  // 引擎版本（每次发布更新）
  ENGINE_VERSION: '1.2.0',
};

/**
 * 生成唯一ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 获取或创建会话ID
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server-side';
  
  let sessionId = sessionStorage.getItem('spacerisk_session_id');
  if (!sessionId) {
    sessionId = generateId();
    sessionStorage.setItem('spacerisk_session_id', sessionId);
  }
  return sessionId;
}

/**
 * 记录评估日志（影子模式）
 */
export function logEvaluation(
  input: EvaluationInput,
  result: EngineResult,
  source: 'web' | 'api' | 'batch' = 'web',
  inputQuality?: ShadowLogEntry['inputQuality']
): ShadowLogEntry {
  const entry: ShadowLogEntry = {
    id: generateId(),
    timestamp: Date.now(),
    sessionId: getSessionId(),
    input,
    result: {
      verdict: result.verdict,
      overallScore: result.overallScore,
      risks: result.risks.map(r => ({
        id: r.id,
        title: r.title,
        severity: r.severity,
      })),
      actions: result.actions.map(a => ({
        code: a.code,
        title: a.title,
      })),
      decisionNote: result.decisionNote ? {
        type: result.decisionNote.type,
        title: result.decisionNote.title,
        severity: result.decisionNote.severity,
      } : undefined,
    },
    inputQuality,
    meta: {
      source,
      version: CONFIG.ENGINE_VERSION,
      ...(typeof window !== 'undefined' && {
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    },
  };
  
  // 异步存储（不阻塞主流程）
  queueMicrotask(() => {
    storeLog(entry);
  });
  
  return entry;
}

/**
 * 本地存储（IndexedDB 或 LocalStorage 降级）
 */
function storeLog(entry: ShadowLogEntry): void {
  if (typeof window === 'undefined') return;
  
  try {
    // 读取现有缓存
    const existing = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
    
    // 添加新条目
    existing.push(entry);
    
    // 限制缓存大小（保留最新的）
    if (existing.length > CONFIG.MAX_LOCAL_CACHE) {
      existing.splice(0, existing.length - CONFIG.MAX_LOCAL_CACHE);
    }
    
    // 写回存储
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(existing));
    
    // 达到批量上报阈值时触发同步
    if (existing.length >= CONFIG.BATCH_SIZE) {
      queueMicrotask(syncLogs);
    }
  } catch (e) {
    console.error('[ShadowLogger] Failed to store log:', e);
  }
}

/**
 * 同步日志到服务端
 */
export async function syncLogs(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    const logs = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
    if (logs.length === 0) return;
    
    // 发送到服务端（使用 Beacon API 确保页面关闭时也能发送）
    const success = navigator.sendBeacon?.(
      '/api/feedback/shadow-log',
      JSON.stringify({ logs })
    );
    
    if (success) {
      // 清空已同步的日志
      localStorage.removeItem(CONFIG.STORAGE_KEY);
    } else {
      // 降级：使用 fetch
      const response = await fetch('/api/feedback/shadow-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs }),
        keepalive: true, // 确保页面关闭时也能完成
      });
      
      if (response.ok) {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
      }
    }
  } catch (e) {
    console.error('[ShadowLogger] Failed to sync logs:', e);
  }
}

/**
 * 记录用户反馈
 */
export function logUserFeedback(
  logId: string,
  feedback: {
    isAccurate: boolean;
    userComment?: string;
    correctedVerdict?: EngineResult['verdict'];
  }
): void {
  queueMicrotask(() => {
    try {
      const logs = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
      const log = logs.find((l: ShadowLogEntry) => l.id === logId);
      
      if (log) {
        log.feedback = {
          timestamp: Date.now(),
          ...feedback,
        };
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(logs));
        
        // 立即触发同步
        syncLogs();
      }
    } catch (e) {
      console.error('[ShadowLogger] Failed to store feedback:', e);
    }
  });
}

/**
 * 获取所有本地缓存的日志（用于调试）
 */
export function getLocalLogs(): ShadowLogEntry[] {
  if (typeof window === 'undefined') return [];
  
  try {
    return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * 清空本地缓存
 */
export function clearLocalLogs(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CONFIG.STORAGE_KEY);
}

// 统一 API 对象，供聚合模块使用
export const shadowLogs = {
  getEntries: getLocalLogs,
  clear: clearLocalLogs,
};

// 页面卸载时尝试同步
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    syncLogs();
  });
}
