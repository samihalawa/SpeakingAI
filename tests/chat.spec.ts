import { test, expect } from '@playwright/test';

test.describe('Chat Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5000');
  });

  test('should send and receive messages', async ({ page }) => {
    // Get the input field and send button
    const input = page.locator('input[placeholder="Type your message..."]');
    const sendButton = page.locator('button[type="submit"]');

    // Type and send a message
    await input.fill('Hola, ¿cómo estás?');
    await sendButton.click();

    // Wait for the response
    await page.waitForResponse('/api/chat/send');

    // Verify message was sent and received
    const messages = page.locator('.space-y-4 > div');
    await expect(messages).toHaveCount(2); // User message and bot response

    // Check if vocabulary detection works
    const vocabularySection = page.locator('.bg-accent/50');
    await expect(vocabularySection).toBeVisible();
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Simulate offline state
    await page.route('/api/chat/send', route => route.abort());
    
    const input = page.locator('input[placeholder="Type your message..."]');
    const sendButton = page.locator('button[type="submit"]');

    await input.fill('Test message');
    await sendButton.click();

    // Check for error toast
    const errorToast = page.locator('text=Failed to send message');
    await expect(errorToast).toBeVisible();
  });
});
