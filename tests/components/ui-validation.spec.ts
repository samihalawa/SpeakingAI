import { test, expect } from '@playwright/test';
import { validatePerformanceMetrics } from '../utils/performance-test';

const BREAKPOINTS = {
  mobile: { width: 320, height: 568 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1024, height: 768 },
};

test.describe('UI Component Validation Suite', () => {
  // Test at different breakpoints
  for (const [device, viewport] of Object.entries(BREAKPOINTS)) {
    test(`responsive behavior - ${device}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');
      
      // Navigation menu visibility
      if (viewport.width < 768) {
        await expect(page.locator('button[aria-label="Navigation menu"]')).toBeVisible();
      } else {
        await expect(page.locator('nav.desktop-nav')).toBeVisible();
      }

      // Split pane behavior
      const splitPane = page.locator('.split-pane');
      if (viewport.width >= 768) {
        await expect(splitPane).toHaveCSS('display', 'flex');
      } else {
        await expect(splitPane).toHaveCSS('display', 'block');
      }
    });
  }

  // Accessibility testing
  test('keyboard navigation and accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('role', 'button');
    
    // ARIA attributes
    await expect(page.locator('[role="navigation"]')).toBeVisible();
    await expect(page.locator('[role="main"]')).toBeVisible();
    
    // Color contrast
    const textElements = await page.$$('text, button, a');
    for (const element of textElements) {
      const contrast = await page.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return window.getComputedStyle(el).color;
      }, element);
      expect(contrast).toBeTruthy();
    }
  });

  // Animation testing
  test('animations and transitions', async ({ page }) => {
    await page.goto('/');
    
    // Menu animation
    const menuButton = page.locator('button[aria-label="Navigation menu"]');
    await menuButton.click();
    
    // Verify animation classes
    await expect(page.locator('.animate-in')).toHaveClass(/opacity-100/);
    
    // Theme transition
    const themeToggle = page.locator('[aria-label="Toggle theme"]');
    await themeToggle.click();
    
    // Verify smooth transition
    await expect(page.locator('body')).toHaveClass(/transition-colors/);
  });

  // Error Boundary testing
  test('error boundary recovery', async ({ page }) => {
    await page.goto('/');
    
    // Trigger error
    await page.evaluate(() => {
      throw new Error('Test error');
    });
    
    // Verify error boundary
    await expect(page.locator('.error-boundary')).toBeVisible();
    
    // Test recovery
    const retryButton = page.locator('button:text("Try again")');
    await retryButton.click();
    await expect(page.locator('.error-boundary')).not.toBeVisible();
  });

  // Screenshot testing
  test('visual regression', async ({ page }) => {
    await page.goto('/');
    
    // Capture base state
    await expect(page).toHaveScreenshot('base-state.png');
    
    // Toggle theme
    await page.click('[aria-label="Toggle theme"]');
    await expect(page).toHaveScreenshot('dark-theme.png');
    
    // Mobile menu
    await page.setViewportSize(BREAKPOINTS.mobile);
    await page.click('button[aria-label="Navigation menu"]');
    await expect(page).toHaveScreenshot('mobile-menu.png');
  });

  // WebSocket reconnection
  test('websocket reconnection', async ({ page }) => {
    await page.goto('/');
    
    // Simulate disconnection
    await page.evaluate(() => {
      window.dispatchEvent(new Event('offline'));
    });
    
    // Verify reconnection attempt
    await expect(page.locator('[aria-label="Reconnecting"]')).toBeVisible();
    
    // Simulate reconnection
    await page.evaluate(() => {
      window.dispatchEvent(new Event('online'));
    });
    
    // Verify successful reconnection
    await expect(page.locator('[aria-label="Connected"]')).toBeVisible();
  });

  // Performance metrics
  test('core performance metrics', async ({ page }) => {
    await page.goto('/');
    const metrics = await getPerformanceMetrics(page);
    
    // Basic performance assertions
    expect(metrics.timeToFirstByte).toBeLessThan(1000);
    expect(metrics.domContentLoaded).toBeLessThan(2500);
    expect(metrics.largestContentfulPaint).toBeTruthy();

    // Verify smooth animations
    await expect(page.locator('.animate-in')).toHaveCSS('transition-duration', '0.2s');
    
    // Test responsive layout changes
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.split-pane')).toHaveCSS('display', 'flex');
    
    await page.setViewportSize({ width: 320, height: 568 });
    await expect(page.locator('.split-pane')).toHaveCSS('display', 'block');
  });
});
