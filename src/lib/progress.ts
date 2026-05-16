export type KPIType = 'numeric' | 'percentage' | 'zero-based' | 'timeline';

export function calculateProgress(
  actual: number,
  target: number,
  type: KPIType = 'numeric',
  baseline: number = 0
): number {
  if (actual === undefined || target === undefined || target === null) return 0;
  
  let progress = 0;

  switch (type) {
    case 'numeric':
    case 'percentage':
    case 'timeline':
      if (target === 0) return actual >= 0 ? 100 : 0;
      progress = (actual / target) * 100;
      break;

    case 'zero-based':
      if (baseline === 0 && target === 0) return actual <= 0 ? 100 : 0;
      const improvement = baseline - actual;
      const totalRequiredImprovement = baseline - target;
      if (totalRequiredImprovement === 0) return 100;
      progress = (improvement / totalRequiredImprovement) * 100;
      break;
      
    default:
      if (target === 0) return 0;
      progress = (actual / target) * 100;
  }

  return Math.min(Math.max(Math.round(progress), 0), 100);
}

export function getColorByProgress(progress: number): string {
  if (progress >= 100) return "text-green-500 stroke-green-500";
  if (progress >= 70) return "text-blue-500 stroke-blue-500";
  if (progress >= 40) return "text-orange-500 stroke-orange-500";
  return "text-destructive stroke-destructive";
}
