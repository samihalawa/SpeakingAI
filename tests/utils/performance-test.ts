import { test, expect } from '@playwright/test';
import { onCLS, onFID, onLCP } from 'web-vitals';

async function getPerformanceMetrics(page: any) {
  const navigationTimingJson = await page.evaluate(() =>
    JSON.stringify(performance.getEntriesByType('navigation')[0])
  );
  const navigationTiming = JSON.parse(navigationTimingJson);

  const lcpElement = await page.evaluate(() => {
    const entries = performance.getEntriesByType('element') as PerformanceElementTiming[];
    return entries.length ? entries[0].element.outerHTML : null;
  });

  return {
    timeToFirstByte: navigationTiming.responseStart - navigationTiming.requestStart,
    domContentLoaded: navigationTiming.domContentLoadedEventEnd - navigationTiming.requestStart,
    largestContentfulPaint: lcpElement,
  };
}

export async function validatePerformanceMetrics(page: any) {
  const metrics: any = {};

  await page.evaluate(() => {
    return new Promise((resolve) => {
      let metricsCollected = 0;
      const requiredMetrics = 3;

      onCLS((metric) => {
        metrics.cls = metric.value;
        metricsCollected++;
        if (metricsCollected === requiredMetrics) resolve(metrics);
      });

      onFID((metric) => {
        metrics.fid = metric.value;
        metricsCollected++;
        if (metricsCollected === requiredMetrics) resolve(metrics);
      });

      onLCP((metric) => {
        metrics.lcp = metric.value;
        metricsCollected++;
        if (metricsCollected === requiredMetrics) resolve(metrics);
      });
    });
  });

  // Lighthouse scores validation
  const scores = await runLighthouse(page.url());
  
  expect(scores.performance).toBeGreaterThan(90);
  expect(scores.accessibility).toBeGreaterThan(95);
  expect(scores.bestPractices).toBeGreaterThan(90);

  // Web Vitals validation
  expect(metrics.cls).toBeLessThan(0.1); // Good CLS score
  expect(metrics.fid).toBeLessThan(100); // Good FID score
  expect(metrics.lcp).toBeLessThan(2500); // Good LCP score

  return { scores, metrics };
}
