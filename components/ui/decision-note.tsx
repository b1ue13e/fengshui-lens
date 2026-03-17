/**
 * Decision Note Component
 * 
 * 结构性缺陷提示组件 - 高质感警示卡片
 * 用于展示引擎输出的 "一票否决" 级别风险
 * 
 * 设计规范：
 * - critical: 橙色主题 (structural_defect)
 * - warning: 黄色主题 (shared_coordination)
 * - 必须形成视觉阻断感，绝对隔离于普通 Action Card
 */

'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DecisionNote } from '@/lib/engine/decision-note';

interface DecisionNoteCardProps {
  note: DecisionNote;
  className?: string;
}

// 等级映射：将 note.type + severity 映射到 UI level
function resolveLevel(note: DecisionNote): 'critical' | 'warning' {
  if (note.type === 'structural_defect') return 'critical';
  if (note.severity === 'high') return 'critical';
  return 'warning';
}

export function DecisionNoteCard({ note, className }: DecisionNoteCardProps) {
  const level = resolveLevel(note);
  
  // 颜色系统 - 与 Stone 主题协调的橙/黄警示
  const colorSystem = {
    critical: {
      bg: 'bg-orange-50/90',
      border: 'border-orange-200/80',
      text: 'text-orange-900',
      textMuted: 'text-orange-800/80',
      icon: 'text-orange-600',
      glow: 'bg-orange-400/20',
      shadow: 'shadow-orange-500/10',
    },
    warning: {
      bg: 'bg-yellow-50/90',
      border: 'border-yellow-200/80',
      text: 'text-yellow-900',
      textMuted: 'text-yellow-800/80',
      icon: 'text-yellow-600',
      glow: 'bg-yellow-400/20',
      shadow: 'shadow-yellow-500/10',
    },
  };
  
  const colors = colorSystem[level];
  const Icon = level === 'critical' ? AlertTriangle : Info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'relative mt-6 overflow-hidden rounded-2xl border backdrop-blur-sm',
        colors.bg,
        colors.border,
        colors.shadow,
        'shadow-lg',
        className
      )}
    >
      {/* 右上角光晕效果 - 高级感灵魂 */}
      <div 
        className={cn(
          'pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl',
          colors.glow
        )}
      />
      
      <div className="relative flex gap-4 p-5">
        {/* 图标区域 - shrink-0 防止挤压变形 */}
        <div className="flex-shrink-0 pt-0.5">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            'bg-white/60 backdrop-blur-sm',
            'shadow-sm'
          )}>
            <Icon 
              className={cn('h-5 w-5 stroke-[2.5px]', colors.icon)} 
            />
          </div>
        </div>
        
        {/* 内容区域 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {level === 'critical' ? '⚠️ 核心缺陷排雷' : '💡 建议关注'}
            </span>
          </div>
          
          <h4 className={cn('text-lg font-semibold leading-tight', colors.text)}>
            {note.title}
          </h4>
          
          <p className={cn('text-sm leading-relaxed', colors.textMuted)}>
            {note.message}
          </p>
        </div>
      </div>
      
      {/* 底部渐变条 - 增加层次 */}
      <div 
        className={cn(
          'h-1 w-full',
          level === 'critical' 
            ? 'bg-gradient-to-r from-orange-300 via-orange-400 to-orange-300' 
            : 'bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300'
        )} 
      />
    </motion.div>
  );
}

// 轻量版本（用于列表展示）
export function DecisionNoteBadge({ note }: { note: DecisionNote }) {
  const level = resolveLevel(note);
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
      level === 'critical' 
        ? 'bg-orange-100 text-orange-800 border border-orange-200'
        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
    )}>
      {level === 'critical' ? <AlertTriangle className="h-3 w-3" /> : <Info className="h-3 w-3" />}
      {note.title}
    </span>
  );
}
