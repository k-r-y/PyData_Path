export interface DiffLine {
  type: 'equal' | 'add' | 'remove';
  text: string;
  oldLine?: number;
  newLine?: number;
}

/**
 * Computes a clean line-by-line diff between baseCode (submission) and
 * currentCode (editor) using Longest Common Subsequence dynamic programming.
 */
export function computeLineDiff(baseCode: string, currentCode: string): DiffLine[] {
  const a = baseCode.replace(/\r\n/g, '\n').split('\n');
  const b = currentCode.replace(/\r\n/g, '\n').split('\n');
  const m = a.length;
  const n = b.length;

  // Guard very large inputs with a simple fallback
  if (m * n > 250_000) {
    const out: DiffLine[] = [];
    const maxLen = Math.max(m, n);
    for (let i = 0; i < maxLen; i++) {
      if (i < m && i < n && a[i] === b[i]) {
        out.push({ type: 'equal', text: a[i], oldLine: i + 1, newLine: i + 1 });
      } else {
        if (i < m) out.push({ type: 'remove', text: a[i], oldLine: i + 1 });
        if (i < n) out.push({ type: 'add', text: b[i], newLine: i + 1 });
      }
    }
    return out;
  }

  const dp: Uint32Array[] = Array.from({ length: m + 1 }, () => new Uint32Array(n + 1));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (a[i] === b[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = dp[i + 1][j] >= dp[i][j + 1] ? dp[i + 1][j] : dp[i][j + 1];
      }
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      result.push({ type: 'equal', text: a[i], oldLine: i + 1, newLine: j + 1 });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: 'remove', text: a[i], oldLine: i + 1 });
      i++;
    } else {
      result.push({ type: 'add', text: b[j], newLine: j + 1 });
      j++;
    }
  }
  while (i < m) {
    result.push({ type: 'remove', text: a[i], oldLine: i + 1 });
    i++;
  }
  while (j < n) {
    result.push({ type: 'add', text: b[j], newLine: j + 1 });
    j++;
  }

  return result;
}
