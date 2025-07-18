import { test, expect } from '@playwright/test';

test.describe('Slider Undo/Redo functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Prompt Input');
  });

  test('batch size slider responds to undo/redo', async ({ page }) => {
    // Find the batch size slider input
    const batchSizeInput = page.locator('input[type="number"][min="1"][max="8"]');
    
    // Get initial value
    const initialValue = await batchSizeInput.inputValue();
    console.log('Initial batch size:', initialValue);
    
    // Change the value via the input
    await batchSizeInput.click();
    await batchSizeInput.press('Control+A');
    await batchSizeInput.type('6');
    await page.waitForTimeout(500);
    
    // Verify the value changed
    await expect(batchSizeInput).toHaveValue('6');
    
    // Use keyboard shortcut to undo
    await page.keyboard.press('Control+Z');
    
    // Verify the value reverted
    await expect(batchSizeInput).toHaveValue(initialValue);
    
    // Use keyboard shortcut to redo
    await page.keyboard.press('Control+Y');
    
    // Verify the value is back to 6
    await expect(batchSizeInput).toHaveValue('6');
  });

  test('batch size slider buttons work for undo/redo', async ({ page }) => {
    // Find the batch size slider input
    const batchSizeInput = page.locator('input[type="number"][min="1"][max="8"]');
    
    // Find the undo/redo buttons in the OutputQuantity component
    const undoButton = page.locator('button[title="Undo (Ctrl+Z)"]').first();
    const redoButton = page.locator('button[title="Redo (Ctrl+Y)"]').first();
    
    // Get initial value
    const initialValue = await batchSizeInput.inputValue();
    
    // Change the value
    await batchSizeInput.click();
    await batchSizeInput.press('Control+A');
    await batchSizeInput.type('7');
    await page.waitForTimeout(500);
    
    // Verify the value changed
    await expect(batchSizeInput).toHaveValue('7');
    
    // Click undo button
    await undoButton.click();
    
    // Verify the value reverted
    await expect(batchSizeInput).toHaveValue(initialValue);
    
    // Click redo button
    await redoButton.click();
    
    // Verify the value is back to 7
    await expect(batchSizeInput).toHaveValue('7');
  });

  test('CFG scale slider responds to undo/redo', async ({ page }) => {
    // Find the CFG scale slider input (should be min=1, max=30)
    const cfgInput = page.locator('input[type="number"][min="1"][max="30"]');
    
    // Get initial value
    const initialValue = await cfgInput.inputValue();
    console.log('Initial CFG scale:', initialValue);
    
    // Change the value via the input
    await cfgInput.click();
    await cfgInput.press('Control+A');
    await cfgInput.type('15');
    await page.waitForTimeout(500);
    
    // Verify the value changed
    await expect(cfgInput).toHaveValue('15');
    
    // Use keyboard shortcut to undo
    await page.keyboard.press('Control+Z');
    
    // Verify the value reverted
    await expect(cfgInput).toHaveValue(initialValue);
    
    // Use keyboard shortcut to redo
    await page.keyboard.press('Control+Y');
    
    // Verify the value is back to 15
    await expect(cfgInput).toHaveValue('15');
  });

  test('sampling steps slider responds to undo/redo', async ({ page }) => {
    // Find the sampling steps slider input (should be min=1, max=150)
    const stepsInput = page.locator('input[type="number"][min="1"][max="150"]');
    
    // Get initial value
    const initialValue = await stepsInput.inputValue();
    console.log('Initial sampling steps:', initialValue);
    
    // Change the value via the input
    await stepsInput.click();
    await stepsInput.press('Control+A');
    await stepsInput.type('30');
    await page.waitForTimeout(500);
    
    // Verify the value changed
    await expect(stepsInput).toHaveValue('30');
    
    // Use keyboard shortcut to undo
    await page.keyboard.press('Control+Z');
    
    // Verify the value reverted
    await expect(stepsInput).toHaveValue(initialValue);
    
    // Use keyboard shortcut to redo
    await page.keyboard.press('Control+Y');
    
    // Verify the value is back to 30
    await expect(stepsInput).toHaveValue('30');
  });
});