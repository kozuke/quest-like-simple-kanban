import { test, expect } from '@playwright/test';

test.describe('RPG Kanban User Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // 各テスト前にページをリロードしてクリーンな状態に
    await page.goto('/');
    // ローカルストレージをクリア
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('application loads and displays main elements', async ({ page }) => {
    // メインタイトルが表示される
    await expect(page.locator('h1')).toContainText('Dragon Task');
    
    // ヘッダーボタンが表示される
    await expect(page.locator('button:has-text("日報")')).toBeVisible();
    await expect(page.locator('button:has-text("テンプレート")')).toBeVisible();
    
    // 基本的なページ構造が表示される
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main, .main, [role="main"]')).toBeVisible();
  });

  test('header buttons are clickable', async ({ page }) => {
    // 日報ボタンをクリック
    await page.click('button:has-text("日報")');
    
    // 何らかのモーダルまたは反応があることを確認（具体的なセレクタは実装に依存）
    // ここでは単純にエラーが発生しないことを確認
    await page.waitForTimeout(500); // 短い待機
    
    // テンプレートボタンをクリック
    await page.click('button:has-text("テンプレート")');
    await page.waitForTimeout(500);
  });

  test('responsive design works on mobile', async ({ page }) => {
    // モバイルサイズに設定
    await page.setViewportSize({ width: 375, height: 667 });

    // アプリが正しく表示される
    await expect(page.locator('h1')).toContainText('Dragon Task');
    
    // ヘッダーが表示される
    await expect(page.locator('header')).toBeVisible();
  });
}); 