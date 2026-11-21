export interface ParsedPythonError {
  errorType: string;
  line: number | null;
  message: string;
  hint: string;
}

/**
 * Maps raw Python exception tracebacks and timeouts to calm, plain-language
 * debugging hints ("what to check") without giving away the exact fix.
 */
export function getPlainLanguageErrorHint(rawError: string): string {
  if (rawError.includes('Time Limit Exceeded') || rawError.includes('timed out')) {
    return 'Execution took too long. Check for an infinite while loop, missing base case in recursion, or an O(n^2) nested loop on a large input.';
  }
  if (rawError.includes('IndentationError') || rawError.includes('TabError')) {
    return 'Python uses consistent indentation (4 spaces per level) to group code blocks. Check that lines inside functions, loops, and if blocks align cleanly without mixing tabs and spaces.';
  }
  if (rawError.includes('SyntaxError')) {
    return 'Check for missing colons (:), unclosed quotes, mismatched parentheses/brackets, or using = instead of == on or just before the highlighted line.';
  }
  if (rawError.includes('NameError')) {
    return 'A variable or function name is being used before it was defined, or it has a spelling/capitalization typo (or is only defined inside another scope).';
  }
  if (rawError.includes('TypeError')) {
    return 'An operation or function received a value of the wrong type, wrong number of arguments, or you tried to call/index a value (like None or int) that does not support it.';
  }
  if (rawError.includes('IndexError')) {
    return 'You tried to access a list, tuple, or string index outside its valid range. Check empty inputs, off-by-one bounds (< len vs <= len), and loop ranges.';
  }
  if (rawError.includes('KeyError')) {
    return 'A dictionary key you requested does not exist. Check exact key spelling/type, or use .get(key, default) / "key in d" before indexing.';
  }
  if (rawError.includes('ValueError')) {
    return 'The type is valid, but the specific value cannot be processed (for example, int("abc"), unpacking the wrong number of values, or an invalid argument).';
  }
  if (rawError.includes('AttributeError')) {
    return 'You accessed a method or attribute that does not exist on that object. Check whether the value became None unexpectedly or has a different type (for example, calling .append() on a tuple or str).';
  }
  if (rawError.includes('ZeroDivisionError')) {
    return 'Your code attempted to divide or modulo by zero. Guard against empty lengths (len(items) == 0) or a 0 divisor before dividing.';
  }
  if (rawError.includes('RecursionError')) {
    return 'Your recursive function exceeded Python maximum recursion depth. Check that every recursive branch moves closer to a reachable base case.';
  }
  if (rawError.includes('ModuleNotFoundError') || rawError.includes('ImportError')) {
    return 'Python could not find that module or name. Check the module name spelling and whether it is part of the standard library in this browser runtime.';
  }
  if (rawError.includes('AssertionError')) {
    return 'Your code ran without crashing, but one of the test checks did not get the expected result. Compare your return value and edge cases against the problem requirements.';
  }
  if (rawError.includes('EOFError')) {
    return 'Your code called input() without enough values in the input queue. Provide one line per input() call before running.';
  }
  return 'Read the last line of the traceback first to see the error type, then inspect the highlighted line number and variable types right above it.';
}

/**
 * Extracts the last line number inside <student_code> (or <module>) from a Python traceback.
 */
export function extractErrorLine(traceback: string | null | undefined): number | null {
  if (!traceback) return null;
  const studentRegex = /File "<student_code>", line (\d+)/g;
  let match: RegExpExecArray | null = null;
  let lastLine: number | null = null;
  while ((match = studentRegex.exec(traceback)) !== null) {
    const parsed = Number(match[1]);
    if (Number.isFinite(parsed) && parsed > 0) {
      lastLine = parsed;
    }
  }
  if (lastLine !== null) return lastLine;

  const fallbackRegex = /File "[^"]+", line (\d+)/g;
  while ((match = fallbackRegex.exec(traceback)) !== null) {
    const parsed = Number(match[1]);
    if (Number.isFinite(parsed) && parsed > 0) {
      lastLine = parsed;
    }
  }
  return lastLine;
}

/**
 * Parses a raw Python traceback or runtime error into structured diagnostic parts.
 */
export function parsePythonError(rawError: string): ParsedPythonError {
  const lines = rawError.trim().split('\n').filter((l) => l.trim().length > 0);
  const lastLine = lines[lines.length - 1] ?? rawError.trim();
  const match = lastLine.match(/^([A-Za-z_][A-Za-z0-9_]*(?:Error|Exception|Interrupt)?)\s*:\s*(.*)$/);
  const errorType = match ? match[1] : rawError.includes('Time Limit Exceeded') ? 'TimeLimitExceeded' : 'Error';
  const message = match && match[2] ? match[2].trim() : lastLine;

  return {
    errorType,
    line: extractErrorLine(rawError),
    message,
    hint: getPlainLanguageErrorHint(rawError),
  };
}
