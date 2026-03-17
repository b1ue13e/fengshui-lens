/**
 * Transformer Warnings & Confidence 测试
 */

import { describe, it, expect } from 'vitest';
import { transformRawToEngineInput } from '../listing-transformer';

describe('Transformer Warnings', () => {
  it('缺字段时应产生 missing 或 fallback_used warning', () => {
    const raw = {}; // 空输入
    
    const result = transformRawToEngineInput(raw);
    
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.code === 'fallback_used')).toBe(true);
  });

  it('格式异常时应产生 invalid_format warning', () => {
    const raw = {
      area: '不是数字', // 无效格式
    };
    
    const result = transformRawToEngineInput(raw);
    
    expect(result.warnings.some(w => w.field === 'areaSqm' && w.code === 'invalid_format')).toBe(true);
  });

  it('使用默认值时应记录 fallback_used', () => {
    const raw = {
      floor_info: '', // 空字符串，将使用默认值
    };
    
    const result = transformRawToEngineInput(raw);
    
    expect(result.warnings.some(w => w.field === 'floorLevel' && w.code === 'fallback_used')).toBe(true);
  });

  it('无法识别户型时应产生 ambiguous warning', () => {
    const raw = {
      layout: '未知户型XYZ',
    };
    
    const result = transformRawToEngineInput(raw);
    
    expect(result.warnings.some(w => w.field === 'layout' && w.code === 'ambiguous')).toBe(true);
  });

  it('warnings 应包含 field, code, message, severity', () => {
    const raw = { area: 'invalid' };
    
    const result = transformRawToEngineInput(raw);
    const warning = result.warnings[0];
    
    expect(warning).toHaveProperty('field');
    expect(warning).toHaveProperty('code');
    expect(warning).toHaveProperty('message');
    expect(warning).toHaveProperty('severity');
    expect(['low', 'medium', 'high']).toContain(warning.severity);
  });
});

describe('Transformer Confidence', () => {
  it('干净输入应返回 high confidence', () => {
    const raw = {
      floor_info: '中楼层/共18层',
      area: '45.5平米',
      orientation: '南北',
      tags: ['近地铁', '精装'],
      building_age: '2018年',
      layout: '1室1厅',
    };
    
    const result = transformRawToEngineInput(raw);
    
    expect(result.confidence).toBe('high');
  });

  it('中等缺失输入应返回 medium confidence', () => {
    const raw = {
      floor_info: '中楼层/共18层',
      area: '45平米',
      orientation: '南向',
      building_age: '2015年',
      layout: '1室1厅',
      // 缺少 tags（非关键字段）
    };
    
    const result = transformRawToEngineInput(raw);
    
    // 关键字段齐全，只有非关键字段缺失，应为 high 或 medium
    expect(['high', 'medium']).toContain(result.confidence);
  });

  it('关键字段缺失应返回 low confidence', () => {
    const raw = {
      // 完全缺失关键字段
    };
    
    const result = transformRawToEngineInput(raw);
    
    expect(result.confidence).toBe('low');
    expect(result.warnings.filter(w => w.severity === 'high').length).toBeGreaterThan(0);
  });

  it('high severity warning 应导致 low confidence', () => {
    const raw = {
      floor_info: '', // 关键字段缺失
      area: '45',
    };
    
    const result = transformRawToEngineInput(raw);
    
    // floorLevel 是 critical field，缺失应导致 low confidence
    expect(result.confidence).toBe('low');
  });

  it('返回结果应包含 input, warnings, confidence', () => {
    const raw = { area: '50' };
    
    const result = transformRawToEngineInput(raw);
    
    expect(result).toHaveProperty('input');
    expect(result).toHaveProperty('warnings');
    expect(result).toHaveProperty('confidence');
    expect(Array.isArray(result.warnings)).toBe(true);
  });
});

describe('Transformer 字段解析', () => {
  it('应正确解析楼层信息', () => {
    const testCases = [
      { input: { floor_info: '低楼层/共6层' }, expected: 'low' },
      { input: { floor_info: '中楼层/共18层' }, expected: 'middle' },
      { input: { floor_info: '高楼层/共33层' }, expected: 'high' },
      { input: { floor_level: '底层' }, expected: 'low' },
    ];

    testCases.forEach(({ input, expected }) => {
      const result = transformRawToEngineInput(input);
      expect(result.input.floorLevel).toBe(expected);
    });
  });

  it('应正确解析面积', () => {
    const testCases = [
      { input: { area: '45.5平米' }, expected: 45.5 },
      { input: { area: '约50平' }, expected: 50 },
      { input: { area: 60 }, expected: 60 },
    ];

    testCases.forEach(({ input, expected }) => {
      const result = transformRawToEngineInput(input);
      expect(result.input.areaSqm).toBe(expected);
    });
  });

  it('应正确解析朝向', () => {
    const testCases = [
      { input: { orientation: '南北通透' }, expected: 'south' },
      { input: { orientation: '南向' }, expected: 'south' },
      { input: { orientation: '朝北' }, expected: 'north' },
      { input: { orientation: '东向' }, expected: 'east' },
    ];

    testCases.forEach(({ input, expected }) => {
      const result = transformRawToEngineInput(input);
      expect(result.input.orientation).toBe(expected);
    });
  });

  it('应从标签提取临街信息', () => {
    const raw = {
      tags: ['近地铁', '临街', '精装'],
    };
    
    const result = transformRawToEngineInput(raw);
    
    expect(result.input.facesMainRoad).toBe(true);
  });

  it('合租类型应正确识别', () => {
    const testCases = [
      { input: { rent_type: '合租' }, isShared: true },
      { input: { rent_type: '整租' }, isShared: false },
      { input: { rent_type: '主卧' }, isShared: true },
    ];

    testCases.forEach(({ input, isShared }) => {
      const result = transformRawToEngineInput(input);
      expect(result.input.isShared).toBe(isShared);
    });
  });
});
