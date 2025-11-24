/**
 * レート制限ユーティリティ
 * クライアントサイドでの連続投稿を防止
 */

const RATE_LIMIT_KEY = 'lastReportSubmitTime';
const MIN_INTERVAL_MS = 60 * 1000; // 1分

/**
 * 投稿が許可されているかチェック
 * @returns {Object} { allowed: boolean, remainingSeconds: number }
 */
export function checkRateLimit() {
    try {
        const lastSubmitTime = localStorage.getItem(RATE_LIMIT_KEY);

        if (!lastSubmitTime) {
            return { allowed: true, remainingSeconds: 0 };
        }

        const lastTime = parseInt(lastSubmitTime, 10);
        const now = Date.now();
        const elapsed = now - lastTime;

        if (elapsed < MIN_INTERVAL_MS) {
            const remainingSeconds = Math.ceil((MIN_INTERVAL_MS - elapsed) / 1000);
            return { allowed: false, remainingSeconds };
        }

        return { allowed: true, remainingSeconds: 0 };
    } catch (error) {
        // localStorageが使用できない場合は許可
        console.warn('localStorage not available:', error);
        return { allowed: true, remainingSeconds: 0 };
    }
}

/**
 * 投稿時刻を記録
 */
export function recordSubmit() {
    try {
        localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
    } catch (error) {
        console.warn('Failed to record submit time:', error);
    }
}

/**
 * レート制限をリセット（テスト用）
 */
export function resetRateLimit() {
    try {
        localStorage.removeItem(RATE_LIMIT_KEY);
    } catch (error) {
        console.warn('Failed to reset rate limit:', error);
    }
}
