import { test, expect } from '@playwright/test';

test.describe('Spanish Learning Platform Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5000');
  });

  test('should have correct title and navigation', async ({ page }) => {
    const title = await page.textContent('a.text-2xl');
    expect(title).toBe('¡Aprende!');

    const links = await page.$$('a');
    const linkTexts = await Promise.all(
      links.map(link => link.textContent())
    );
    expect(linkTexts.filter(Boolean)).toContain('Chat');
    expect(linkTexts.filter(Boolean)).toContain('Vocabulary');
  });

  test('should handle Chinese to Spanish translation', async ({ page }) => {
    const testMessage = "我想学习西班牙语";
    
    await page.goto('/');
    const input = await page.getByPlaceholder('Type your message...');
    await input.fill(testMessage);
    await page.getByRole('button', { name: 'Send' }).click();

    // Wait for response
    await page.waitForSelector('.bg-[#FBD38D]');
    const response = await page.textContent('.bg-[#FBD38D] p:first-child');
    expect(response).toBeTruthy();
    
    // Check if explanation is in Chinese
    const explanation = await page.textContent('.bg-[#FBD38D] p:nth-child(2)');
    // Verify if the text contains Chinese characters
    expect(explanation?.match(/[\u4E00-\u9FFF]/g)).toBeTruthy();
  });

  test('should handle Spanish with vocabulary detection', async ({ page }) => {
    const testMessage = "hola kitty. era para decirte un poco del problem'on que tengo encima";
    
    await page.goto('/');
    const input = await page.getByPlaceholder('Type your message...');
    await input.fill(testMessage);
    await page.getByRole('button', { name: 'Send' }).click();
    
    // Wait for response and check vocabulary items
    await page.waitForSelector('.bg-accent/50');
    const vocabItems = await page.$$('.bg-accent/50 motion.div');
    expect(vocabItems.length).toBeGreaterThan(0);
    
    // Test vocabulary tooltips
    const firstVocabItem = vocabItems[0];
    await firstVocabItem.hover();
    const tooltip = await page.waitForSelector('.group-hover\\:block');
    expect(await tooltip.isVisible()).toBeTruthy();
    
    // Test vocabulary addition and WebSocket update
    const addButton = await page.getByRole('button', { name: 'Add to Vocabulary' });
    await addButton.first().click();
    
    // Wait for WebSocket update notification
    await page.waitForSelector('.toast');
    const toast = await page.textContent('.toast');
    expect(toast).toContain('Word added to vocabulary');
  });

  test('should manage vocabulary items', async ({ request }) => {
    // Add vocabulary item
    const addResponse = await request.post('/api/vocabulary', {
      data: {
        spanish: 'perro',
        chinese: '狗',
        example: 'El perro es amigable.'
      }
    });
    expect(addResponse.ok()).toBeTruthy();
    
    // Fetch vocabulary items
    const getResponse = await request.get('/api/vocabulary');
    expect(getResponse.ok()).toBeTruthy();
    
    const items = await getResponse.json();
    expect(items.some(item => item.spanish === 'perro')).toBeTruthy();
  });

  test('should support basic UI interactions', async ({ page }) => {
    // Test navigation
    await page.click('a:has-text("Vocabulary")');
    expect(page.url()).toContain('/vocabulary');
    
    // Test vocabulary form visibility
    const addButton = await page.getByRole('button', { name: 'Add Word' });
    await addButton.click();
    
    const form = await page.getByRole('dialog');
    expect(await form.isVisible()).toBeTruthy();
  });
});
