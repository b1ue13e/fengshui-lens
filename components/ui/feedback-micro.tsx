/**
 * Feedback Micro-Interaction - 端内微交互
 * 
 * 在 cautious 房源报告底部展示轻量反馈收集器
 * 用于收集用户对判定准确性的反馈
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, X, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logUserFeedback } from '@/lib/feedback/shadow-logger';

interface FeedbackMicroProps {
  logId: string;
  topRiskTitle?: string;
  className?: string;
}

export function FeedbackMicro({ logId, topRiskTitle, className }: FeedbackMicroProps) {
  const [state, setState] = useState<'idle' | 'submitted' | 'dismissed'>('idle');
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');

  const handleFeedback = (isAccurate: boolean) => {
    logUserFeedback(logId, {
      isAccurate,
      userComment: comment || undefined,
    });
    
    if (!isAccurate && !comment) {
      // 如果不准确且没有评论，展开评论框
      setShowComment(true);
    } else {
      setState('submitted');
    }
  };

  const handleSubmitComment = () => {
    logUserFeedback(logId, {
      isAccurate: false,
      userComment: comment,
    });
    setState('submitted');
  };

  const handleDismiss = () => {
    setState('dismissed');
  };

  if (state === 'dismissed') return null;

  return (
    <AnimatePresence>
      {state === 'submitted' ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={cn(
            'mt-6 p-4 rounded-xl bg-stone-100 border border-stone-200 text-center',
            className
          )}
        >
          <p className="text-sm text-stone-600">
            感谢您的反馈！这将帮助我们改进算法。
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'mt-6 relative',
            className
          )}
        >
          {/* 主卡片 */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-stone-700 leading-relaxed">
                  系统判定该房源{topRiskTitle ? `存在「${topRiskTitle}」风险` : '需谨慎考虑'}
                  。如果您实地看房后觉得判定{showComment ? '不够准确' : '与实际不符'}，
                  <span className="font-medium text-stone-900">请点击反馈帮助我们改进</span>。
                </p>
              </div>
              
              {/* 关闭按钮 */}
              <button
                onClick={handleDismiss}
                className="p-1 rounded-full hover:bg-stone-200 transition-colors"
                aria-label="关闭"
              >
                <X className="h-4 w-4 text-stone-400" />
              </button>
            </div>

            {/* 反馈按钮组 */}
            {!showComment && (
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => handleFeedback(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors text-sm font-medium"
                >
                  <ThumbsUp className="h-4 w-4" />
                  判定准确
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-200 text-stone-700 hover:bg-stone-300 transition-colors text-sm font-medium"
                >
                  <ThumbsDown className="h-4 w-4" />
                  不够准确
                </button>
              </div>
            )}

            {/* 评论输入框 */}
            <AnimatePresence>
              {showComment && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-stone-400 mt-2.5" />
                    <div className="flex-1">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="请简要说明实际情况，例如：「实际噪音不大，因为窗户是双层玻璃」"
                        className="w-full p-3 rounded-lg border border-stone-300 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-stone-400"
                        rows={3}
                      />
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <button
                          onClick={() => setShowComment(false)}
                          className="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleSubmitComment}
                          disabled={!comment.trim()}
                          className="px-4 py-1.5 rounded-lg bg-stone-800 text-white text-sm font-medium hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          提交反馈
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 简版反馈按钮（用于紧凑布局）
export function FeedbackButtons({ logId, className }: { logId: string; className?: string }) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <span className="text-xs text-stone-400">已反馈</span>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-xs text-stone-500">判定准确吗？</span>
      <button
        onClick={() => {
          logUserFeedback(logId, { isAccurate: true });
          setSubmitted(true);
        }}
        className="p-1.5 rounded-full hover:bg-emerald-100 text-stone-400 hover:text-emerald-600 transition-colors"
        aria-label="判定准确"
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => {
          logUserFeedback(logId, { isAccurate: false });
          setSubmitted(true);
        }}
        className="p-1.5 rounded-full hover:bg-red-100 text-stone-400 hover:text-red-600 transition-colors"
        aria-label="判定不准确"
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
