import { test, expect } from '@playwright/test';

test.describe('Comprehensive Undo/Redo functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Prompt Input');
  });

  test('prompt input undo/redo buttons work', async ({ page }) => {
    const promptTextarea = page.locator('textarea[placeholder="Enter your prompt here"]');
    const promptUndoButton = page.locator('div:has(h4:text("1. Prompt Input")) button[title="Undo (Ctrl+Z)"]');
    const promptRedoButton = page.locator('div:has(h4:text("1. Prompt Input")) button[title="Redo (Ctrl+Y)"]');
    
    // Initially buttons should be disabled
    await expect(promptUndoButton).toBeDisabled();
    await expect(promptRedoButton).toBeDisabled();
    
    // Type text
    await promptTextarea.click();
    await promptTextarea.type('test prompt');
    await page.waitForTimeout(500);
    
    // Undo button should be enabled
    await expect(promptUndoButton).toBeEnabled();
    await expect(promptRedoButton).toBeDisabled();
    
    // Click undo
    await promptUndoButton.click();
    await expect(promptTextarea).toHaveValue('');
    
    // Redo button should be enabled
    await expect(promptUndoButton).toBeDisabled();
    await expect(promptRedoButton).toBeEnabled();
    
    // Click redo
    await promptRedoButton.click();
    await expect(promptTextarea).toHaveValue('test prompt');
  });

  test('sizing settings undo/redo buttons work', async ({ page }) => {
    const widthInput = page.locator('input[type="number"]').first();
    const heightInput = page.locator('input[type="number"]').nth(1);
    const sizingUndoButton = page.locator('div:has(label:text("Width")) button[title="Undo (Ctrl+Z)"]');
    const sizingRedoButton = page.locator('div:has(label:text("Width")) button[title="Redo (Ctrl+Y)"]');
    
    // Get initial values
    const initialWidth = await widthInput.inputValue();
    const initialHeight = await heightInput.inputValue();
    
    // Change width
    await widthInput.click();
    await widthInput.press('Control+A');
    await widthInput.type('1024');
    await page.waitForTimeout(500);
    
    // Undo button should be enabled
    await expect(sizingUndoButton).toBeEnabled();
    
    // Click undo
    await sizingUndoButton.click();
    await expect(widthInput).toHaveValue(initialWidth);
    
    // Redo button should be enabled
    await expect(sizingRedoButton).toBeEnabled();
    
    // Click redo
    await sizingRedoButton.click();
    await expect(widthInput).toHaveValue('1024');
  });

  test('output quantity undo/redo buttons work', async ({ page }) => {
    // Wait for the batch size slider to be visible
    await page.waitForSelector('text=Batch Size');
    
    const batchSizeInput = page.locator('input[type="number"]').filter({ hasText: /Max: 8/ });
    const outputUndoButton = page.locator('div:has(text="Batch Size") button[title="Undo (Ctrl+Z)"]');
    const outputRedoButton = page.locator('div:has(text="Batch Size") button[title="Redo (Ctrl+Y)"]');
    
    // Get initial value
    const initialValue = await batchSizeInput.inputValue();
    
    // Change batch size
    await batchSizeInput.click();
    await batchSizeInput.press('Control+A');
    await batchSizeInput.type('6');
    await page.waitForTimeout(500);
    
    // Undo button should be enabled
    await expect(outputUndoButton).toBeEnabled();
    
    // Click undo
    await outputUndoButton.click();
    await expect(batchSizeInput).toHaveValue(initialValue);
    
    // Redo button should be enabled
    await expect(outputRedoButton).toBeEnabled();
    
    // Click redo
    await outputRedoButton.click();
    await expect(batchSizeInput).toHaveValue('6');
  });

  test('generation ID undo/redo buttons work', async ({ page }) => {
    const seedInput = page.locator('input[type="number"]').filter({ hasText: /seed/i });
    const randomCheckbox = page.locator('input[type="checkbox"]');
    const seedUndoButton = page.locator('div:has(label:text("Generation Seed")) button[title="Undo (Ctrl+Z)"]');
    const seedRedoButton = page.locator('div:has(label:text("Generation Seed")) button[title="Redo (Ctrl+Y)"]');
    
    // Change random checkbox
    await randomCheckbox.uncheck();
    await page.waitForTimeout(500);
    
    // Undo button should be enabled
    await expect(seedUndoButton).toBeEnabled();
    
    // Click undo
    await seedUndoButton.click();
    await expect(randomCheckbox).toBeChecked();
    
    // Redo button should be enabled
    await expect(seedRedoButton).toBeEnabled();
    
    // Click redo
    await seedRedoButton.click();
    await expect(randomCheckbox).not.toBeChecked();
  });

  test('cross-component undo/redo works with keyboard shortcuts', async ({ page }) => {
    const promptTextarea = page.locator('textarea[placeholder="Enter your prompt here"]');
    const widthInput = page.locator('input[type="number"]').first();
    
    // Make changes across different components
    await promptTextarea.click();
    await promptTextarea.type('test prompt');
    await page.waitForTimeout(500);
    
    await widthInput.click();
    await widthInput.press('Control+A');
    await widthInput.type('1024');
    await page.waitForTimeout(500);
    
    // Use keyboard shortcut to undo width change
    await page.keyboard.press('Control+Z');
    await expect(widthInput).not.toHaveValue('1024');
    
    // Use keyboard shortcut to undo prompt change
    await page.keyboard.press('Control+Z');
    await expect(promptTextarea).toHaveValue('');
    
    // Use keyboard shortcut to redo prompt change
    await page.keyboard.press('Control+Y');
    await expect(promptTextarea).toHaveValue('test prompt');
    
    // Use keyboard shortcut to redo width change
    await page.keyboard.press('Control+Y');
    await expect(widthInput).toHaveValue('1024');
  });

  test('all component buttons are present and functional', async ({ page }) => {
    // Check that all sections have undo/redo buttons
    const promptButtons = page.locator('div:has(h4:text("1. Prompt Input")) button[title*="Undo"], div:has(h4:text("1. Prompt Input")) button[title*="Redo"]');
    const renderButtons = page.locator('div:has(h4:text("2. Sampling Settings")) button[title*="Undo"], div:has(h4:text("2. Sampling Settings")) button[title*="Redo"]');
    const sizingButtons = page.locator('div:has(label:text("Width")) button[title*="Undo"], div:has(label:text("Width")) button[title*="Redo"]');
    const outputButtons = page.locator('div:has(text="Batch Size") button[title*="Undo"], div:has(text="Batch Size") button[title*="Redo"]');
    const seedButtons = page.locator('div:has(label:text("Generation Seed")) button[title*="Undo"], div:has(label:text("Generation Seed")) button[title*="Redo"]');
    
    // All button pairs should be present
    await expect(promptButtons).toHaveCount(2);
    await expect(renderButtons).toHaveCount(2);
    await expect(sizingButtons).toHaveCount(2);
    await expect(outputButtons).toHaveCount(2);
    await expect(seedButtons).toHaveCount(2);
    
    // All buttons should initially be disabled
    await expect(promptButtons).toBeDisabled();
    await expect(renderButtons).toBeDisabled();
    await expect(sizingButtons).toBeDisabled();
    await expect(outputButtons).toBeDisabled();
    await expect(seedButtons).toBeDisabled();
  });
});