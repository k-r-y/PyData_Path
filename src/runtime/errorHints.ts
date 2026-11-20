/**
 * Maps raw Python exception tracebacks to calm, plain-language debugging hints
 * without giving away the exact fix (per DESIGN.md).
 */
export function getPlainLanguageErrorHint(rawError: string): string {
  if (rawError.includes('SyntaxError')) {
    return 'Check for missing colons (:), unclosed quotes, or mismatched parentheses on or just before the highlighted line.';
  }
  if (rawError.includes('IndentationError') || rawError.includes('TabError')) {
    return 'Python uses consistent indentation (usually 4 spaces) to group code blocks. Check that lines in the same block align cleanly.';
  }
  if (rawError.includes('NameError')) {
    return 'A variable or function name is being used before it was defined, or it has a spelling/capitalization typo.';
  }
  if (rawError.includes('TypeError')) {
    return 'An operation or function received a value of the wrong type (for example, adding text to a number, or calling something that is not a function).';
  }
  if (rawError.includes('ValueError')) {
    return 'The type is valid, but the specific value cannot be processed (for example, converting non-numeric text with int()).';
  }
  if (rawError.includes('ZeroDivisionError')) {
    return 'Your code attempted to divide by zero. Check the denominator value before dividing.';
  }
  if (rawError.includes('IndexError')) {
    return 'You tried to access a position in a sequence that is outside its valid range. Remember Python indexing starts at 0.';
  }
  if (rawError.includes('KeyError')) {
    return 'A dictionary key you requested does not exist. Check the exact spelling and case of the key.';
  }
  if (rawError.includes('ModuleNotFoundError') || rawError.includes('ImportError')) {
    return 'Python could not find that module or name. Check the module name spelling and whether it is available in this environment.';
  }
  if (rawError.includes('AssertionError')) {
    return 'Your code ran without crashing, but one of the test checks did not get the expected result. Compare your output with the prompt requirements.';
  }
  if (rawError.includes('EOFError')) {
    return 'Your code called input() without enough values in the Stdin tab. Open the Stdin tab and enter one value per line before running.';
  }
  return 'Read the last line of the traceback first to see the error type, then look at the line number listed right above it.';
}
