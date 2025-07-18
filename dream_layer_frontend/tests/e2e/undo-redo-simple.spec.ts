import { test, expect } from '@playwright/test';

test.describe('Simple Undo/Redo test', () => {
  test('basic undo test', async ({ page }) => {
    // Navigate to the page
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForSelector('textarea[placeholder="Enter your prompt here"]', { timeout: 10000 });
    
    // Find the prompt textarea
    const promptTextarea = page.locator('textarea[placeholder="Enter your prompt here"]');
    
    // Clear any existing value and type new text
    await promptTextarea.click();
    await promptTextarea.press('Control+A');
    await promptTextarea.type('a beautiful landscape');
    
    // Verify the text was entered
    await expect(promptTextarea).toHaveValue('a beautiful landscape');
    
    // Wait a bit for state to update
    await page.waitForTimeout(500);
    
    // Press Ctrl+Z to undo
    await promptTextarea.press('Control+Z');
    
    // Check that the field is now empty
    await expect(promptTextarea).toHaveValue('');
  });
});