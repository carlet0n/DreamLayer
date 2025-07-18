import { test, expect } from '@playwright/test';

test.describe('Component-level Undo/Redo functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Prompt Input');
  });

  test('keyboard shortcuts work across all components including sliders', async ({ page }) => {
    const promptTextarea = page.locator('textarea[placeholder="Enter your prompt here"]');
    const negativePromptTextarea = page.locator('textarea[placeholder="Enter negative prompt here"]');
    const batchSizeInput = page.locator('input[type="number"][min="1"][max="8"]');
    const cfgInput = page.locator('input[type="number"][min="1"][max="30"]');
    
    // Get initial values
    const initialBatchSize = await batchSizeInput.inputValue();
    const initialCfg = await cfgInput.inputValue();
    
    // Make multiple changes across components including sliders
    await promptTextarea.click();
    await promptTextarea.type('positive prompt');
    await page.waitForTimeout(500);
    
    await batchSizeInput.click();
    await batchSizeInput.press('Control+A');
    await batchSizeInput.type('6');
    await page.waitForTimeout(500);
    
    await cfgInput.click();
    await cfgInput.press('Control+A');
    await cfgInput.type('15');
    await page.waitForTimeout(500);
    
    await negativePromptTextarea.click();
    await negativePromptTextarea.type('negative prompt');
    await page.waitForTimeout(500);
    
    // Test keyboard shortcuts work in reverse order
    await page.keyboard.press('Control+Z');
    await expect(negativePromptTextarea).toHaveValue('');
    
    await page.keyboard.press('Control+Z');
    await expect(cfgInput).toHaveValue(initialCfg);
    
    await page.keyboard.press('Control+Z');
    await expect(batchSizeInput).toHaveValue(initialBatchSize);
    
    await page.keyboard.press('Control+Z');
    await expect(promptTextarea).toHaveValue('');
    
    // Test redo
    await page.keyboard.press('Control+Y');
    await expect(promptTextarea).toHaveValue('positive prompt');
    
    await page.keyboard.press('Control+Y');
    await expect(batchSizeInput).toHaveValue('6');
    
    await page.keyboard.press('Control+Y');
    await expect(cfgInput).toHaveValue('15');
    
    await page.keyboard.press('Control+Y');
    await expect(negativePromptTextarea).toHaveValue('negative prompt');
  });

  test('undo/redo buttons are present in all components', async ({ page }) => {
    // Check that undo/redo buttons are present and initially disabled
    const allUndoButtons = page.locator('button[title="Undo (Ctrl+Z)"]');
    const allRedoButtons = page.locator('button[title="Redo (Ctrl+Y)"]');
    
    // Should have multiple undo/redo button pairs
    await expect(allUndoButtons).toHaveCount(5); // One for each component
    await expect(allRedoButtons).toHaveCount(5);
    
    // All should be disabled initially
    for (let i = 0; i < 5; i++) {
      await expect(allUndoButtons.nth(i)).toBeDisabled();
      await expect(allRedoButtons.nth(i)).toBeDisabled();
    }
  });

  test('individual component buttons work', async ({ page }) => {
    const promptTextarea = page.locator('textarea[placeholder="Enter your prompt here"]');
    
    // Make a change
    await promptTextarea.click();
    await promptTextarea.type('test');
    await page.waitForTimeout(500);
    
    // At least one undo button should be enabled
    const enabledUndoButtons = page.locator('button[title="Undo (Ctrl+Z)"]:not([disabled])');
    await expect(enabledUndoButtons).toHaveCount(5); // All buttons should be enabled since they share state
    
    // Click any undo button
    await enabledUndoButtons.first().click();
    await expect(promptTextarea).toHaveValue('');
    
    // At least one redo button should be enabled
    const enabledRedoButtons = page.locator('button[title="Redo (Ctrl+Y)"]:not([disabled])');
    await expect(enabledRedoButtons).toHaveCount(5);
    
    // Click any redo button
    await enabledRedoButtons.first().click();
    await expect(promptTextarea).toHaveValue('test');
  });

  test('width and height inputs work with undo/redo', async ({ page }) => {
    // Find the width input more specifically - it's the one with min=64 and max=2048
    const widthInput = page.locator('input[type="number"][min="64"][max="2048"]').first();
    
    // Get initial value
    const initialWidth = await widthInput.inputValue();
    
    // Change width
    await widthInput.click();
    await widthInput.press('Control+A');
    await widthInput.type('1024');
    await page.waitForTimeout(500);
    
    // Use keyboard shortcut to undo
    await page.keyboard.press('Control+Z');
    await expect(widthInput).toHaveValue(initialWidth);
    
    // Use keyboard shortcut to redo
    await page.keyboard.press('Control+Y');
    await expect(widthInput).toHaveValue('1024');
  });

  test('checkbox changes are tracked', async ({ page }) => {
    const randomCheckbox = page.locator('input[type="checkbox"]');
    
    // Initially should be checked
    await expect(randomCheckbox).toBeChecked();
    
    // Uncheck
    await randomCheckbox.uncheck();
    await page.waitForTimeout(500);
    
    // Use keyboard shortcut to undo
    await page.keyboard.press('Control+Z');
    await expect(randomCheckbox).toBeChecked();
    
    // Use keyboard shortcut to redo
    await page.keyboard.press('Control+Y');
    await expect(randomCheckbox).not.toBeChecked();
  });

  test('all slider types respond to undo/redo', async ({ page }) => {
    // Test all three main slider types
    const batchSizeInput = page.locator('input[type="number"][min="1"][max="8"]');
    const cfgInput = page.locator('input[type="number"][min="1"][max="30"]');
    const stepsInput = page.locator('input[type="number"][min="1"][max="150"]');
    
    // Get initial values
    const initialBatchSize = await batchSizeInput.inputValue();
    const initialCfg = await cfgInput.inputValue();
    const initialSteps = await stepsInput.inputValue();
    
    // Change all sliders
    await batchSizeInput.click();
    await batchSizeInput.press('Control+A');
    await batchSizeInput.type('7');
    await page.waitForTimeout(500);
    
    await cfgInput.click();
    await cfgInput.press('Control+A');
    await cfgInput.type('12');
    await page.waitForTimeout(500);
    
    await stepsInput.click();
    await stepsInput.press('Control+A');
    await stepsInput.type('25');
    await page.waitForTimeout(500);
    
    // Verify all changed
    await expect(batchSizeInput).toHaveValue('7');
    await expect(cfgInput).toHaveValue('12');
    await expect(stepsInput).toHaveValue('25');
    
    // Undo all changes
    await page.keyboard.press('Control+Z');
    await expect(stepsInput).toHaveValue(initialSteps);
    
    await page.keyboard.press('Control+Z');
    await expect(cfgInput).toHaveValue(initialCfg);
    
    await page.keyboard.press('Control+Z');
    await expect(batchSizeInput).toHaveValue(initialBatchSize);
    
    // Redo all changes
    await page.keyboard.press('Control+Y');
    await expect(batchSizeInput).toHaveValue('7');
    
    await page.keyboard.press('Control+Y');
    await expect(cfgInput).toHaveValue('12');
    
    await page.keyboard.press('Control+Y');
    await expect(stepsInput).toHaveValue('25');
  });

  test('slider component buttons work correctly', async ({ page }) => {
    const batchSizeInput = page.locator('input[type="number"][min="1"][max="8"]');
    const undoButton = page.locator('button[title="Undo (Ctrl+Z)"]').first();
    const redoButton = page.locator('button[title="Redo (Ctrl+Y)"]').first();
    
    // Get initial value
    const initialValue = await batchSizeInput.inputValue();
    
    // Change the value
    await batchSizeInput.click();
    await batchSizeInput.press('Control+A');
    await batchSizeInput.type('8');
    await page.waitForTimeout(500);
    
    // Verify change
    await expect(batchSizeInput).toHaveValue('8');
    
    // Use component undo button
    await undoButton.click();
    await expect(batchSizeInput).toHaveValue(initialValue);
    
    // Use component redo button
    await redoButton.click();
    await expect(batchSizeInput).toHaveValue('8');
  });

  test('sliders maintain sync between input and slider elements', async ({ page }) => {
    // This test verifies that both the input field and the actual slider element stay in sync
    const batchSizeInput = page.locator('input[type="number"][min="1"][max="8"]');
    
    // Change value via input
    await batchSizeInput.click();
    await batchSizeInput.press('Control+A');
    await batchSizeInput.type('5');
    await page.waitForTimeout(500);
    
    // Verify input shows new value
    await expect(batchSizeInput).toHaveValue('5');
    
    // Undo
    await page.keyboard.press('Control+Z');
    
    // Verify input shows original value (both input and slider should be in sync)
    await expect(batchSizeInput).not.toHaveValue('5');
    
    // Redo
    await page.keyboard.press('Control+Y');
    
    // Verify input shows the changed value again
    await expect(batchSizeInput).toHaveValue('5');
  });
});