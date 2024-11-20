import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

interface MetricReport {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

const metrics: MetricReport[] = [];

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  switch (name) {
    case 'CLS':
      return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
    case 'FID':
      return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
    case 'LCP':
      return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
    case 'FCP':
      return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
    case 'TTFB':
      return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
    default:
      return 'needs-improvement';
  }
}

function handleMetric(metric: any) {
  const report: MetricReport = {
    name: metric.name,
    value: metric.value,
    rating: getRating(metric.name, metric.value),
    timestamp: Date.now(),
  };
  
  metrics.push(report);
  console.log('[Performance]', report);
  
  // Send metrics to backend if needed
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    }).catch(console.error);
  }
}

export function initializePerformanceMonitoring() {
  onCLS(handleMetric);
  onFID(handleMetric);
  onLCP(handleMetric);
  onFCP(handleMetric);
  onTTFB(handleMetric);
}

export function getPerformanceMetrics() {
  return metrics;
}
