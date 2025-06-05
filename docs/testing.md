# テストガイド

このドキュメントでは、Quest-like Simple Kanbanプロジェクトに実装されているテストの種類と実行方法について説明します。

## 📋 テスト構成概要

本プロジェクトでは以下の3つのレベルでテストを実装しています：

- **ユニットテスト**: 個別の関数・モジュールの動作確認
- **コンポーネントテスト**: Reactコンポーネントの表示・操作確認
- **E2Eテスト**: ブラウザでの実際のユーザー操作確認

## 🛠️ テストツール構成

| テストレベル | ツール | 用途 |
|-------------|--------|------|
| ユニット・コンポーネント | [Vitest](https://vitest.dev/) | 高速なテスト実行エンジン |
| コンポーネント | [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) | Reactコンポーネントテスト |
| E2E | [Playwright](https://playwright.dev/) | クロスブラウザテスト |
| アクセシビリティ | [@axe-core/playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright) | a11yテスト |

## 🧪 テストの種類別詳細

### 1. ユニットテスト

#### セキュリティテスト
**ファイル**: `src/__tests__/utils/security.test.ts`

```typescript
// XSS攻撃対策のテスト例
it('should remove script tags', () => {
  const maliciousInput = '<script>alert("XSS attack!")</script>Hello World';
  const result = sanitizeForXSS(maliciousInput);
  expect(result).toBe('Hello World');
});
```

**テスト内容**:
- XSS攻撃パターンの除去確認（6テスト）
- `<script>`タグ、`javascript:`プロトコル、`eval()`関数の無効化
- 入力データのサニタイゼーション動作確認

#### ストアテスト
**ファイル**: `src/__tests__/store/useTaskStore.test.ts`

```typescript
// タスク追加機能のテスト例
it('should add a new task to backlog by default', () => {
  const store = useTaskStore.getState();
  store.addTask('新しいタスク', 'タスクの説明');
  
  const state = useTaskStore.getState();
  const taskIds = Object.keys(state.tasks);
  expect(taskIds).toHaveLength(1);
});
```

**テスト内容**:
- タスクCRUD操作（5テスト）
- Zustand状態管理の動作確認
- ローカルストレージとの連携確認

### 2. コンポーネントテスト

#### TaskCardコンポーネント
**ファイル**: `src/__tests__/components/TaskCard.test.tsx`

```typescript
// コンポーネント表示テストの例
it('should display task title and description', () => {
  render(<TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
  
  expect(screen.getByText('テストタスク')).toBeInTheDocument();
  expect(screen.getByText('これはテスト用のタスクです')).toBeInTheDocument();
});
```

**テスト内容**:
- タスク情報の表示確認（6テスト）
- 編集・削除ボタンのインタラクション
- 空のタイトル処理

#### Headerコンポーネント
**ファイル**: `src/__tests__/components/Header.test.tsx`

```typescript
// ボタンクリックテストの例
it('should call openReportModal when report button is clicked', async () => {
  const user = userEvent.setup();
  render(<Header openReportModal={mockOpenReportModal} openTemplateModal={mockOpenTemplateModal} />);
  
  const reportButton = screen.getByText('日報');
  await user.click(reportButton);
  
  expect(mockOpenReportModal).toHaveBeenCalledTimes(1);
});
```

**テスト内容**:
- ヘッダー要素の表示確認（8テスト）
- 音量・テンプレート・日報ボタンの機能確認
- RPGテーマスタイリングの確認

### 3. E2Eテスト

#### ユーザーワークフローテスト
**ファイル**: `e2e/userWorkflow.spec.ts`

```typescript
// ページ読み込みテストの例
test('application loads and displays main elements', async ({ page }) => {
  await expect(page.locator('h1')).toContainText('Dragon Task');
  await expect(page.locator('button:has-text("日報")')).toBeVisible();
  await expect(page.locator('header')).toBeVisible();
});
```

**テスト内容**:
- アプリケーション基本機能（3テスト）
- ページ読み込み・表示確認
- ヘッダーボタンのクリック動作
- レスポンシブデザイン確認

#### アクセシビリティテスト
**ファイル**: `e2e/accessibility.spec.ts`

```typescript
// キーボードナビゲーションテストの例
test('should have proper keyboard navigation', async ({ page }) => {
  await page.keyboard.press('Tab');
  
  const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
  expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);
});
```

**テスト内容**:
- キーボードナビゲーション（3テスト）
- ページ構造の適切性確認
- フォーカス管理の動作確認

## 🚀 テスト実行方法

### ユニット・コンポーネントテスト（Vitest）

```bash
# 開発時（watch モード）
npm test

# 1回だけ実行（CI用）
npm run test:run

# ブラウザUIでテスト実行
npm run test:ui
```

**設定ファイル**: `vite.config.ts`
```typescript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
  exclude: ['**/node_modules/**', '**/e2e/**'],
}
```

### E2Eテスト（Playwright）

```bash
# 全ブラウザでE2Eテスト実行
npm run test:e2e

# ブラウザUIでE2Eテスト実行
npm run test:e2e:ui

# 特定ブラウザのみ実行
npm run test:e2e -- --project=chromium
```

**設定ファイル**: `playwright.config.ts`
```typescript
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:5173',
  reuseExistingServer: !process.env.CI,
}
```

### 全テスト実行

```bash
# ユニット + E2E テストを順次実行
npm run test:all
```

## 📊 テスト結果例

### 成功時の出力
```bash
# ユニット・コンポーネントテスト
✅ Test Files: 4 passed (4)
✅ Tests: 25 passed (25)
   - セキュリティテスト: 6 passed
   - ストアテスト: 5 passed  
   - TaskCardテスト: 6 passed
   - Headerテスト: 8 passed

# E2Eテスト
✅ Test Files: 2 passed (2)
✅ Tests: 6 passed (6)
   - ユーザーワークフロー: 3 passed
   - アクセシビリティ: 3 passed
```

## 🔧 テスト環境セットアップ

### 必要な依存関係

```json
{
  "devDependencies": {
    "vitest": "^3.2.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/jest-dom": "^6.6.3", 
    "@testing-library/user-event": "^14.6.1",
    "@playwright/test": "^1.52.0",
    "@axe-core/playwright": "^4.10.2",
    "jsdom": "^26.1.0"
  }
}
```

### 初回セットアップ

```bash
# 依存関係インストール
npm install

# Playwrightブラウザインストール
npx playwright install
```

## 🎯 テストカバレッジ

| 領域 | カバー範囲 | テスト数 |
|------|------------|----------|
| **セキュリティ** | XSS対策、入力検証 | 6 |
| **状態管理** | タスクCRUD、永続化 | 5 |
| **UI表示** | コンポーネント表示・操作 | 14 |
| **E2E** | ユーザー操作フロー | 3 |
| **a11y** | アクセシビリティ | 3 |
| **合計** | - | **31テスト** |

## 🐛 トラブルシューティング

### よくある問題

1. **テストが見つからない**
   ```bash
   # キャッシュクリア
   npm run test:run -- --no-cache
   ```

2. **E2Eテストがタイムアウト**
   ```bash
   # 開発サーバーが起動していることを確認
   npm run dev
   ```

3. **ブラウザが見つからない**
   ```bash
   # Playwrightブラウザ再インストール  
   npx playwright install
   ```

### デバッグモード

```bash
# Vitest UIモード
npm run test:ui

# Playwright デバッグモード
npm run test:e2e -- --debug

# 特定テストファイルのみ実行
npm test -- TaskCard.test.tsx
```

## 📚 参考リンク

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Axe Accessibility Testing](https://www.deque.com/axe/)

---

このテストガイドは、開発者がプロジェクトのテストを理解し、効果的に活用するためのリファレンスとして作成されています。 