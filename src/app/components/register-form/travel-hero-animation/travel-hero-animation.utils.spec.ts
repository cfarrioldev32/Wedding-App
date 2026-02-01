import { prefersReducedMotion } from './travel-hero-animation.utils';

describe('travel-hero-animation utils', () => {
  it('detects reduced motion preference', () => {
    const matchMedia = (query: string) => ({
      media: query,
      matches: true,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false
    });

    expect(prefersReducedMotion(matchMedia as unknown as (q: string) => MediaQueryList)).toBeTrue();
  });
});
