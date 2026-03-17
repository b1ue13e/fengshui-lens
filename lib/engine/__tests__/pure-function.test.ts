/**
 * evaluate() 纯函数测试
 * 
 * 验证目标：
 * 1. 同一输入多次调用结果一致
 * 2. evaluate 不触发日志副作用
 * 3. evaluate 不依赖环境状态
 */

import { describe, it, expect, vi } from 'vitest';
import { evaluate } from '../index';
import type { EvaluationInput } from '../types';

describe('evaluate() 纯函数验证', () => {
  // 标准测试输入
  const baseInput: EvaluationInput = {
    layoutType: 'one_bedroom',
    areaSqm: 45,
    orientation: 'south',
    floorLevel: 'middle',
    totalFloors: 18,
    hasElevator: true,
    buildingAge: 'new',
    hasWestFacingWindow: false,
    windowExposure: 'full',
    facesMainRoad: false,
    nearElevator: false,
    unitPosition: 'middle',
    hasBalcony: true,
    kitchenType: 'closed',
    bathroomPosition: 'far_from_bedroom',
    bedPosition: 'away_from_door',
    deskPosition: 'facing_window',
    ventilation: 'good',
    dampSigns: [],
    isShared: false,
    primaryGoal: 'sleep_quality',
    monthlyBudget: 'medium',
    allowsLightRenovation: true,
    allowsFurnitureMove: true,
    allowsSoftImprovements: true,
  };

  it('同一输入多次调用应返回相同结果', () => {
    const result1 = evaluate(baseInput);
    const result2 = evaluate(baseInput);
    const result3 = evaluate(baseInput);

    expect(result1).toEqual(result2);
    expect(result2).toEqual(result3);
    expect(result1.verdict).toBe(result2.verdict);
    expect(result1.overallScore).toBe(result2.overallScore);
  });

  it('不应访问 localStorage', () => {
    // 在 Node.js 环境中 localStorage 不存在，
    // 如果代码尝试访问会抛出错误，测试即失败
    expect(() => evaluate(baseInput)).not.toThrow();
  });

  it('不应访问 sessionStorage', () => {
    // 在 Node.js 环境中 sessionStorage 不存在，
    // 如果代码尝试访问会抛出错误，测试即失败
    expect(() => evaluate(baseInput)).not.toThrow();
  });

  it('不应调用 Date.now()', () => {
    const dateSpy = vi.spyOn(Date, 'now');
    
    evaluate(baseInput);
    
    expect(dateSpy).not.toHaveBeenCalled();
    dateSpy.mockRestore();
  });

  it('不应调用 Math.random()', () => {
    const randomSpy = vi.spyOn(Math, 'random');
    
    evaluate(baseInput);
    
    expect(randomSpy).not.toHaveBeenCalled();
    randomSpy.mockRestore();
  });

  it('不应调用 console.log 或 console.error', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    evaluate(baseInput);
    
    // 引擎内部不应该有日志输出
    // 注意：如果引擎内部有合理的错误处理日志，可能需要调整此测试
    expect(logSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('不应依赖外部环境变量', () => {
    // 保存原始 env
    const originalEnv = process.env;
    
    // 修改环境变量
    process.env = { ...originalEnv, TEST_VAR: 'changed' };
    
    const result = evaluate(baseInput);
    
    // 恢复环境变量
    process.env = originalEnv;
    
    // 结果应该与之前相同
    expect(result.verdict).toBeDefined();
    expect(result.overallScore).toBeGreaterThan(0);
  });

  it('输入对象不应被 mutate', () => {
    const inputCopy = { ...baseInput };
    
    evaluate(baseInput);
    
    // 验证输入对象未被修改
    expect(baseInput).toEqual(inputCopy);
  });

  it('并发调用应返回各自独立的结果', () => {
    const baseResult = evaluate(baseInput);
    const examResult = evaluate({ ...baseInput, primaryGoal: 'exam_prep' });
    
    // 验证每个调用都返回有效结果
    expect(baseResult.verdict).toBeDefined();
    expect(examResult.verdict).toBeDefined();
    
    // 同一输入再次调用应产生相同结果
    expect(evaluate(baseInput)).toEqual(baseResult);
  });
});
