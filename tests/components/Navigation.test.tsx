import { test, expect } from '@playwright/test';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navigation } from '../../client/src/components/Navigation';

test.describe('Navigation Component', () => {
  test('renders navigation links correctly', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    
    // Check if logo is visible
    await expect(page.getByText('¡Aprende!')).toBeVisible();
    
    // Check if navigation links are visible in desktop view
    await expect(page.getByText('Chat')).toBeVisible();
    await expect(page.getByText('Vocabulary')).toBeVisible();
  });

  test('shows dropdown menu on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if menu button is visible
    const menuButton = page.getByRole('button', { name: 'Navigation menu' });
    await expect(menuButton).toBeVisible();
    
    // Click menu button and verify dropdown
    await menuButton.click();
    await expect(page.getByRole('menuitem').first()).toBeVisible();
  });

  test('handles navigation correctly', async ({ page }) => {
    await page.goto('/');
    
    // Click vocabulary link
    await page.getByText('Vocabulary').click();
    await expect(page.url()).toContain('/vocabulary');
    
    // Click chat link
    await page.getByText('Chat').click();
    await expect(page.url()).toBe(page.url());
  });

  test('accessibility requirements', async ({ page }) => {
    await page.goto('/');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.getByText('¡Aprende!')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByText('Chat')).toBeFocused();
    
    // Check ARIA attributes
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('navigation')).toBeVisible();
  });
});
