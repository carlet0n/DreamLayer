import { test, expect } from '@playwright/test';

test.describe('Undo/Redo functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Prompt Input');
  });

  test('types text, undoes, and checks field is blank', async ({ page }) => {
    // Find the prompt textarea
    const promptTextarea = page.locator('textarea[placeholder="Enter your prompt here"]');
    
    // Clear and type some text
    await promptTextarea.click();
    await promptTextarea.press('Control+A');
    await promptTextarea.type('a beautiful landscape');
    await expect(promptTextarea).toHaveValue('a beautiful landscape');
    
    // Wait for debounce and then undo
    await page.waitForTimeout(500);
    await page.keyboard.press('Control+Z');
    
    // Check that the field is blank
    await expect(promptTextarea).toHaveValue('');
  });

  test('supports multiple undo/redo operations', async ({ page }) => {
    const promptTextarea = page.locator('textarea[placeholder="Enter your prompt here"]');
    const negativePromptTextarea = page.locator('textarea[placeholder="Enter negative prompt here"]');
    
    // Make multiple changes with proper typing and debounce waits
    await promptTextarea.click();
    await promptTextarea.press('Control+A');
    await promptTextarea.type('first prompt');
    await page.waitForTimeout(500);
    
    await promptTextarea.press('Control+A');
    await promptTextarea.type('second prompt');
    await page.waitForTimeout(500);
    
    await negativePromptTextarea.click();
    await negativePromptTextarea.type('bad quality');
    await page.waitForTimeout(500);
    
    // Undo three times
    await page.keyboard.press('Control+Z');
    await expect(negativePromptTextarea).toHaveValue('');
    
    await page.keyboard.press('Control+Z');
    await expect(promptTextarea).toHaveValue('first prompt');
    
    await page.keyboard.press('Control+Z');
    await expect(promptTextarea).toHaveValue('');
    
    // Redo
    await page.keyboard.press('Control+Y');
    await expect(promptTextarea).toHaveValue('first prompt');
    
    await page.keyboard.press('Control+Y');
    await expect(promptTextarea).toHaveValue('second prompt');
    
    await page.keyboard.press('Control+Y');
    await expect(negativePromptTextarea).toHaveValue('bad quality');
  });

  test('undo/redo buttons work correctly', async ({ page }) => {
    const promptTextarea = page.locator('textarea[placeholder="Enter your prompt here"]');
    // Target the first undo/redo button (which should be in the prompt input section)
    const undoButton = page.locator('button[title="Undo (Ctrl+Z)"]').first();
    const redoButton = page.locator('button[title="Redo (Ctrl+Y)"]').first();
    
    // Initially, all undo/redo buttons should be disabled
    await expect(undoButton).toBeDisabled();
    await expect(redoButton).toBeDisabled();
    
    // Type text with proper debounce
    await promptTextarea.click();
    await promptTextarea.type('test prompt');
    await page.waitForTimeout(500);
    
    // All undo buttons should be enabled (they share the same state)
    await expect(undoButton).toBeEnabled();
    await expect(redoButton).toBeDisabled();
    
    // Click undo
    await undoButton.click();
    await expect(promptTextarea).toHaveValue('');
    
    // Now redo should be enabled and undo disabled
    await expect(undoButton).toBeDisabled();
    await expect(redoButton).toBeEnabled();
    
    // Click redo
    await redoButton.click();
    await expect(promptTextarea).toHaveValue('test prompt');
  });

  test('history is limited to 25 states', async ({ page }) => {
    const promptTextarea = page.locator('textarea[placeholder="Enter your prompt here"]');
    
    // Make 30 changes with proper debounce
    for (let i = 1; i <= 30; i++) {
      await promptTextarea.click();
      await promptTextarea.press('Control+A');
      await promptTextarea.type(`prompt ${i}`);
      await page.waitForTimeout(400); // Wait for debounce
    }
    
    // Try to undo 26 times - should only go back 25 states
    for (let i = 0; i < 26; i++) {
      await page.keyboard.press('Control+Z');
      await page.waitForTimeout(100);
    }
    
    // Should be at "prompt 5" (30 - 25 = 5)
    await expect(promptTextarea).toHaveValue('prompt 5');
    
    // One more undo should not change the value
    await page.keyboard.press('Control+Z');
    await expect(promptTextarea).toHaveValue('prompt 5');
  });

  test('slider changes can be undone/redone', async ({ page }) => {
    // Test actual slider functionality
    const batchSizeInput = page.locator('input[type="number"][min="1"][max="8"]');
    const cfgInput = page.locator('input[type="number"][min="1"][max="30"]');
    
    // Get initial values
    const initialBatchSize = await batchSizeInput.inputValue();
    const initialCfg = await cfgInput.inputValue();
    
    // Change batch size
    await batchSizeInput.click();
    await batchSizeInput.press('Control+A');
    await batchSizeInput.type('6');
    await page.waitForTimeout(500);
    
    // Change CFG scale
    await cfgInput.click();
    await cfgInput.press('Control+A');
    await cfgInput.type('12');
    await page.waitForTimeout(500);
    
    // Verify changes
    await expect(batchSizeInput).toHaveValue('6');
    await expect(cfgInput).toHaveValue('12');
    
    // Undo CFG change
    await page.keyboard.press('Control+Z');
    await expect(cfgInput).toHaveValue(initialCfg);
    await expect(batchSizeInput).toHaveValue('6'); // Should still be changed
    
    // Undo batch size change
    await page.keyboard.press('Control+Z');
    await expect(batchSizeInput).toHaveValue(initialBatchSize);
    await expect(cfgInput).toHaveValue(initialCfg);
    
    // Redo batch size change
    await page.keyboard.press('Control+Y');
    await expect(batchSizeInput).toHaveValue('6');
    await expect(cfgInput).toHaveValue(initialCfg);
    
    // Redo CFG change
    await page.keyboard.press('Control+Y');
    await expect(batchSizeInput).toHaveValue('6');
    await expect(cfgInput).toHaveValue('12');
  });
});