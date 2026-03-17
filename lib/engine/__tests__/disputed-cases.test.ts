// 争议案例回归测试
// 用于验证规则修正后，争议案例是否得到正确处理

import { describe, it, expect } from 'vitest';
import { evaluate } from '../index';
import { EvaluationInput } from '../types';

// 案例1: 三里屯临街一居室（备考场景）
// 争议点: 系统 cautious，人工预期 avoid
// 原因: 临街噪音对备考场景是致命问题
const case1Input: EvaluationInput = {
  layoutType: "one_bedroom",
  areaSqm: 45,
  orientation: "south",
  floorLevel: "middle",
  totalFloors: 18,
  hasElevator: true,
  buildingAge: "medium",
  hasWestFacingWindow: false,
  windowExposure: "full",
  facesMainRoad: true,
  nearElevator: false,
  unitPosition: "middle",
  hasBalcony: true,
  kitchenType: "closed",
  bathroomPosition: "far_from_bedroom",
  bedPosition: "away_from_door",
  deskPosition: "facing_window",
  ventilation: "good",
  dampSigns: [],
  isShared: false,
  primaryGoal: "exam_prep",
  monthlyBudget: "medium",
  allowsLightRenovation: true,
  allowsFurnitureMove: true,
  allowsSoftImprovements: true,
};

// 案例2: 五道口合租主卧（情侣场景）
// 争议点: 系统 cautious，人工预期 avoid
// 原因: 合租对情侣是隐私硬伤
const case2Input: EvaluationInput = {
  layoutType: "studio",
  areaSqm: 20,
  orientation: "south",
  floorLevel: "high",
  totalFloors: 28,
  hasElevator: true,
  buildingAge: "new",
  hasWestFacingWindow: false,
  windowExposure: "full",
  facesMainRoad: false,
  nearElevator: true,
  unitPosition: "corner",
  hasBalcony: false,
  kitchenType: "open",
  bathroomPosition: "near_bedroom",
  bedPosition: "away_from_door",
  deskPosition: "facing_wall",
  ventilation: "good",
  dampSigns: [],
  isShared: true,
  roommateSituation: "strangers",
  primaryGoal: "couple",
  monthlyBudget: "medium",
  allowsLightRenovation: true,
  allowsFurnitureMove: true,
  allowsSoftImprovements: true,
};

describe('争议案例验证', () => {
  it('案例1: 备考场景临街房应该被判为 avoid', () => {
    const result = evaluate(case1Input);
    
    console.log('案例1输出:', {
      verdict: result.verdict,
      overallScore: result.overallScore,
      risks: result.risks.map(r => ({ id: r.id, severity: r.severity })),
    });
    
    // 期望: 应该被判为 avoid
    expect(result.verdict).toBe('avoid');
    
    // 应该识别出临街噪音风险
    const streetNoiseRisk = result.risks.find(r => r.id === 'street_noise_low' || r.id === 'street_noise_high');
    expect(streetNoiseRisk).toBeDefined();
    expect(streetNoiseRisk?.severity).toBe('high');
  });
  
  it('案例2: 情侣合租应该被判为 avoid', () => {
    const result = evaluate(case2Input);
    
    console.log('案例2输出:', {
      verdict: result.verdict,
      overallScore: result.overallScore,
      risks: result.risks.map(r => ({ id: r.id, severity: r.severity })),
    });
    
    // 期望: 应该被判为 avoid
    expect(result.verdict).toBe('avoid');
    
    // 应该识别出合租隐私风险
    const sharedPrivacyRisk = result.risks.find(r => r.id === 'shared_privacy');
    expect(sharedPrivacyRisk).toBeDefined();
    expect(sharedPrivacyRisk?.severity).toBe('high');
  });
});
