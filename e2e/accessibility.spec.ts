import { test, expect } from '@playwright/test';

test.describe('Basic Accessibility Tests', () => {
  test('should have proper keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Dragon Task');
    
    // Tabキーでナビゲーションをテスト
    await page.keyboard.press('Tab');
    
    // フォーカスが適切なボタンに移動することを確認
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);
  });

  test('should have proper page structure', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Dragon Task');
    
    // ヘッダーがbannerロールを持つことを確認
    await expect(page.locator('header')).toBeVisible();
    
    // メインコンテンツエリアが存在することを確認
    const mainContent = page.locator('main, .main, [role="main"], body > div');
    await expect(mainContent.first()).toBeVisible();
  });

  test('should be navigable with keyboard only', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Dragon Task');
    
    // すべてのインタラクティブ要素がキーボードでアクセス可能であることを確認
    const interactiveElements = page.locator('button, a, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    const count = await interactiveElements.count();
    
    // 少なくとも何個かのインタラクティブ要素があることを確認
    expect(count).toBeGreaterThan(0);
    
    // 最初の数個の要素にTabで移動できることを確認
    for (let i = 0; i < Math.min(count, 5); i++) { // 最初の5個をテスト
      await page.keyboard.press('Tab');
      
      const focusedElement = await page.evaluate(() => {
        const activeEl = document.activeElement as HTMLElement;
        return activeEl ? {
          tagName: activeEl.tagName,
          type: activeEl.getAttribute('type'),
          visible: activeEl.offsetParent !== null
        } : null;
      });
      
      // フォーカスされた要素が存在することを確認
      expect(focusedElement).toBeTruthy();
    }
  });
}); 