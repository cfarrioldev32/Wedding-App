export interface Point {
  x: number;
  y: number;
}

export const prefersReducedMotion = (matchMediaFn?: (query: string) => MediaQueryList): boolean => {
  if (!matchMediaFn) {
    return false;
  }

  try {
    return matchMediaFn('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};
