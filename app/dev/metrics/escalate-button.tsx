'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { escalateToPostgres } from './actions';

interface EscalateButtonProps {
  logId: string;
  currentVerdict?: string;
}

export function EscalateButton({ logId, currentVerdict }: EscalateButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleEscalate = async () => {
    if (isLoading || isSuccess) return;
    
    const feedback = window.prompt(
      `标记为误判\n\n当前判决: ${currentVerdict || 'unknown'}\n\n请描述问题（可选）:`,
      ''
    );
    
    // 用户取消
    if (feedback === null) return;
    
    setIsLoading(true);
    
    try {
      const result = await escalateToPostgres(logId, feedback || undefined);
      
      if (result.success) {
        setIsSuccess(true);
        alert(`✅ 已封存至 PostgreSQL\n案例ID: ${result.caseId}`);
      }
    } catch (error) {
      alert(`❌ 封存失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Button 
        variant="ghost" 
        size="sm"
        disabled
        className="text-green-400 text-xs"
      >
        ✓ 已封存
      </Button>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={handleEscalate}
      disabled={isLoading}
      className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 text-xs"
    >
      {isLoading ? '封存中...' : '标记误判'}
    </Button>
  );
}
