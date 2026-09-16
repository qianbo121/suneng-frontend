export const DEFAULT_WORKPIECE_DIFFICULTY_POINTS = [
  '材料与执行标准需先确认',
  '尺寸、重量和装料方式影响处理一致性',
  '目标工艺与验收要求需工程核对',
] as const;

export function takeDifficultyPoints(
  ...sources: Array<readonly string[] | null | undefined>
): string[] {
  const points = sources.find((items) => items && items.length > 0);
  return [...(points?.slice(0, 3) ?? DEFAULT_WORKPIECE_DIFFICULTY_POINTS)];
}
