/**
 * セキュリティ関連のユーティリティ関数
 */

// HTMLエスケープのためのマッピング
const HTML_ESCAPE_MAP: Record<string, string> = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

// XSSサニタイゼーション結果のキャッシュ
const xssSanitizeCache = new Map<string, string>();
const MAX_CACHE_SIZE = 1000; // キャッシュの最大サイズ

/**
 * HTMLエスケープを行う
 * @param text エスケープする文字列
 * @returns エスケープされた文字列
 */
export const escapeHtml = (text: string): string => {
  if (typeof text !== 'string') {
    return '';
  }
  return text.replace(/[<>&"'/]/g, (char) => HTML_ESCAPE_MAP[char] || char);
};

/**
 * 基本的なHTMLタグを除去する
 * @param text サニタイズする文字列
 * @returns サニタイズされた文字列
 */
export const sanitizeText = (text: string): string => {
  if (typeof text !== 'string') {
    return '';
  }
  // HTMLタグを除去
  return text.replace(/<[^>]*>/g, '');
};

/**
 * JavaScriptの危険なパターンを検出・除去する（キャッシュ機能付き）
 * @param text チェックする文字列
 * @returns サニタイズされた文字列
 */
export const sanitizeForXSS = (text: string): string => {
  if (typeof text !== 'string') {
    return '';
  }

  // キャッシュから結果を取得
  if (xssSanitizeCache.has(text)) {
    return xssSanitizeCache.get(text)!;
  }
  
  let sanitized = text;
  
  // scriptタグの除去
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // javascript:の除去
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // on*イベントハンドラーの除去
  sanitized = sanitized.replace(/\bon\w+\s*=\s*"[^"]*"/gi, '');
  sanitized = sanitized.replace(/\bon\w+\s*=\s*'[^']*'/gi, '');
  
  // eval、Function等の危険な関数の除去
  sanitized = sanitized.replace(/\b(eval|Function|setTimeout|setInterval)\s*\(/gi, '');

  // キャッシュサイズが上限に達したら、古いエントリを削除
  if (xssSanitizeCache.size >= MAX_CACHE_SIZE) {
    const firstKey = xssSanitizeCache.keys().next().value;
    if (firstKey) {
      xssSanitizeCache.delete(firstKey);
    }
  }

  // 結果をキャッシュに保存
  xssSanitizeCache.set(text, sanitized);
  
  return sanitized;
};

/**
 * タスクデータの検証とサニタイゼーション
 */
export const validateAndSanitizeTask = (task: any): any => {
  if (!task || typeof task !== 'object') {
    return null;
  }

  return {
    id: typeof task.id === 'string' ? sanitizeText(task.id) : '',
    title: typeof task.title === 'string' ? sanitizeForXSS(task.title) : '',
    description: typeof task.description === 'string' ? sanitizeForXSS(task.description) : '',
    createdAt: typeof task.createdAt === 'number' ? task.createdAt : Date.now(),
    status: ['backlog', 'doing', 'done'].includes(task.status) ? task.status : 'backlog',
  };
};

/**
 * カラムオーダーデータの検証とサニタイゼーション
 */
export const validateAndSanitizeColumnOrder = (columnOrder: any): any => {
  if (!columnOrder || typeof columnOrder !== 'object') {
    return { backlog: [], doing: [], done: [] };
  }

  const sanitized = { backlog: [], doing: [], done: [] } as any;
  
  for (const column of ['backlog', 'doing', 'done']) {
    if (Array.isArray(columnOrder[column])) {
      sanitized[column] = columnOrder[column]
        .filter((id: any) => typeof id === 'string')
        .map((id: string) => sanitizeText(id));
    }
  }
  
  return sanitized;
};

/**
 * テンプレートデータの検証とサニタイゼーション
 */
export const validateAndSanitizeTemplate = (template: any): string => {
  if (typeof template !== 'string') {
    return '';
  }
  
  // テンプレートは表示時にエスケープするので、基本的なサニタイゼーションのみ
  return sanitizeForXSS(template);
};

/**
 * JSONパースを安全に行う
 */
export const safeJsonParse = (jsonString: string): any => {
  try {
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.error('JSON parse error:', error);
    return null;
  }
};

/**
 * ローカルストレージのサイズをチェック
 */
export const checkLocalStorageQuota = (key: string, data: string): boolean => {
  try {
    const testKey = `__test_${key}`;
    localStorage.setItem(testKey, data);
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.warn('LocalStorage quota exceeded or unavailable');
    return false;
  }
}; 