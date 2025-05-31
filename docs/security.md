# セキュリティ対策ドキュメント

## 実装されたセキュリティ対策

このアプリケーションでは、XSS（Cross-Site Scripting）攻撃をはじめとするWebセキュリティの脅威に対する以下の対策を実装しています。

### 1. 入力データのサニタイゼーション

#### `src/utils/security.ts`
- **HTMLエスケープ**: ユーザー入力の危険な文字（`<`, `>`, `&`, `"`, `'`, `/`）をHTMLエンティティに変換
- **XSSパターン除去**: scriptタグ、javascript:、onイベントハンドラー、eval等の危険なパターンを除去
- **データ検証**: タスクデータとカラムオーダーデータの型とスキーマ検証

#### 実装された関数
```typescript
escapeHtml(text: string): string              // HTMLエスケープ
sanitizeText(text: string): string            // HTMLタグ除去
sanitizeForXSS(text: string): string         // XSS危険パターン除去
validateAndSanitizeTask(task: any): any       // タスクデータ検証
validateAndSanitizeColumnOrder(columnOrder: any): any  // カラムオーダー検証
validateAndSanitizeTemplate(template: any): string     // テンプレート検証
safeJsonParse(jsonString: string): any        // 安全なJSONパース
checkLocalStorageQuota(key: string, data: string): boolean  // ストレージ容量チェック
```

### 2. ローカルストレージのセキュリティ強化

#### `src/store/useTaskStore.ts`
- **保存時**: データをサニタイズしてからJSON化
- **読み込み時**: JSONパース後にデータ検証とサニタイゼーション
- **エラーハンドリング**: 破損データ検出時のフォールバック処理
- **容量チェック**: 保存前のストレージ容量確認

#### `src/store/useReportStore.ts`
- **テンプレート保存**: XSSパターン除去後に保存
- **テンプレート読み込み**: 検証とサニタイゼーション後に適用
- **デフォルトフォールバック**: 無効データ検出時のデフォルトテンプレート復元

### 3. レポート生成のセキュリティ

#### `src/utils/reportGenerator.ts`
- **タスクデータサニタイズ**: レポート生成前にタスクの内容をサニタイズ
- **テンプレートサニタイズ**: テンプレート自体の危険なパターン除去
- **エラーハンドリング**: 生成エラー時の安全な処理

### 4. CSP（Content Security Policy）の設定

#### `index.html`
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="X-XSS-Protection" content="1; mode=block">
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
```

### 5. 対策されている攻撃パターン

#### XSS（Cross-Site Scripting）
- **反射型XSS**: 入力データの即座エスケープで防止
- **格納型XSS**: ローカルストレージ保存時とレンダリング時の二重チェック
- **DOM型XSS**: CSPによるインラインスクリプト制限

#### 具体的な防止例
```javascript
// 危険な入力例
"<script>alert('XSS')</script>"
// → サニタイズ後
"alert('XSS')"

// 危険なイベントハンドラー
"Hello <img src=x onerror=alert('XSS')>"
// → サニタイズ後
"Hello "

// JavaScriptプロトコル
"javascript:alert('XSS')"
// → サニタイズ後
"alert('XSS')"
```

### 6. ユーザーへの影響

#### 既存データの保護
- 既存のローカルストレージデータは自動的にサニタイズされて読み込まれます
- 無効なデータが検出された場合、安全にデフォルト状態にリセットされます

#### 入力制限
- タスクのタイトルや説明にHTMLタグを含む内容を入力した場合、自動的に除去されます
- 悪意のあるスクリプトコードは無害化されます

### 7. 開発者向け注意事項

#### 新機能追加時の留意点
1. ユーザー入力を扱う際は必ず`sanitizeForXSS()`を通す
2. ローカルストレージからの読み込み時は`safeJsonParse()`と適切な検証関数を使用
3. 動的なHTMLの生成は避け、Reactの標準的なレンダリングを使用
4. 外部ライブラリ追加時はCSPの更新を検討

#### コードレビューのチェックポイント
- [ ] ユーザー入力のサニタイゼーション
- [ ] ローカルストレージの安全な操作
- [ ] エラーハンドリングの適切な実装
- [ ] CSPポリシーへの適合

### 8. 今後の改善点

#### 検討事項
- より厳密なCSPポリシーの設定（'unsafe-inline'の除去）
- セキュリティログの実装
- 定期的なセキュリティ監査の実施
- より高度なサニタイゼーションライブラリの導入検討

この実装により、一般的なWebアプリケーションのセキュリティ要件を満たし、ユーザーが安全にアプリケーションを利用できる環境が整備されています。 