import { EvaluationInput, NormalizedInput } from './types';

export function normalizeInput(input: EvaluationInput): NormalizedInput {
  const floorRatio = input.totalFloors > 0 ? 
    (input.floorLevel === 'low' ? 0.25 : 
     input.floorLevel === 'middle' ? 0.5 : 
     input.floorLevel === 'high' ? 0.75 : 1.0) : 0.5;

  const isLowFloor = input.floorLevel === 'low';
  const isTopFloor = input.floorLevel === 'top';
  
  const goodOrientations = ['south', 'southeast', 'southwest'];
  const hasGoodOrientation = goodOrientations.includes(input.orientation);

  return {
    ...input,
    floorRatio,
    isLowFloor,
    isTopFloor,
    hasGoodOrientation,
  };
}
