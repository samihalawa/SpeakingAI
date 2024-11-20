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

  test('should send and receive chat messages with vocabulary detection', async ({ page, request }) => {
    const testMessage = "hola kitty. era para decirte un poco del problem'on que tengo encima";
    
    // Send message via API
    const response = await request.post('/api/chat/send', {
      data: { content: testMessage }
    });
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.message).toBeDefined();
    expect(data.response).toBeDefined();
    expect(data.detectedVocabulary).toBeDefined();
    
    // Test UI interaction and animations
    await page.goto('/');
    const input = await page.getByPlaceholder('Type your message...');
    await input.fill(testMessage);
    await page.getByRole('button', { name: 'Send' }).click();
    
    // Wait for response and check vocabulary items
    await page.waitForSelector('.bg-accent/50');
    const vocabItems = await page.$$('.bg-accent/50 motion.div');
    expect(vocabItems.length).toBeGreaterThan(0);
    
    // Check animation classes
    const firstVocabItem = vocabItems[0];
    const hasAnimation = await firstVocabItem.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.opacity !== '0' && style.transform !== 'translateY(20px)';
    });
    expect(hasAnimation).toBeTruthy();
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
