import sys
import io
import copy
import json
import math
import time
import traceback
import builtins
from collections import Counter


def _extract_student_line(exc):
    if isinstance(exc, SyntaxError) and exc.lineno is not None:
        return int(exc.lineno)
    tb = exc.__traceback__
    line_no = None
    for frame in traceback.extract_tb(tb):
        if frame.filename == "<student_code>":
            line_no = int(frame.lineno)
    return line_no


def _safe_repr(val, max_len=240):
    try:
        r = repr(val)
    except Exception:
        return "<unprintable>"
    if len(r) > max_len:
        return r[: max_len - 14] + "... (truncated)"
    return r


def _deep_exact_equal(a, b):
    if isinstance(a, bool) or isinstance(b, bool):
        return type(a) is type(b) and a == b
    if isinstance(a, float) and isinstance(b, float):
        if math.isnan(a) or math.isnan(b):
            return math.isnan(a) and math.isnan(b)
        return a == b
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        if type(a) is not type(b) or len(a) != len(b):
            return False
        return all(_deep_exact_equal(x, y) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        if len(a) != len(b) or set(a.keys()) != set(b.keys()):
            return False
        return all(_deep_exact_equal(a[k], b[k]) for k in a)
    if isinstance(a, set) and isinstance(b, set):
        return len(a) == len(b) and a == b
    if type(a) is not type(b):
        if isinstance(a, (int, float)) and isinstance(b, (int, float)):
            return a == b
        return False
    return a == b


def _hash_key(val):
    if isinstance(val, bool):
        return ("bool", val)
    if isinstance(val, (int, float)):
        if isinstance(val, float) and math.isnan(val):
            return ("nan",)
        return ("num", val)
    if isinstance(val, tuple):
        return ("tuple", tuple(_hash_key(x) for x in val))
    return (type(val).__name__, val)


def _deep_unordered_equal(a, b):
    if isinstance(a, set) and isinstance(b, set):
        return a == b
    if not isinstance(a, (list, tuple)) or not isinstance(b, (list, tuple)):
        return _deep_exact_equal(a, b)
    if type(a) is not type(b) or len(a) != len(b):
        return False
    try:
        return Counter(_hash_key(x) for x in a) == Counter(_hash_key(y) for y in b)
    except TypeError:
        used = [False] * len(b)
        for item_a in a:
            matched = False
            for idx, item_b in enumerate(b):
                if not used[idx] and _deep_exact_equal(item_a, item_b):
                    used[idx] = True
                    matched = True
                    break
            if not matched:
                return False
        return True


def _deep_float_equal(a, b, tol):
    if isinstance(a, bool) or isinstance(b, bool):
        return False
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        if math.isnan(a) or math.isnan(b):
            return math.isnan(a) and math.isnan(b)
        if math.isinf(a) or math.isinf(b):
            return a == b
        return abs(a - b) <= tol
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        if type(a) is not type(b) or len(a) != len(b):
            return False
        return all(_deep_float_equal(x, y, tol) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        if len(a) != len(b) or set(a.keys()) != set(b.keys()):
            return False
        return all(_deep_float_equal(a[k], b[k], tol) for k in a)
    return _deep_exact_equal(a, b)


def _compare_values(actual, expected, compare_spec, orig_args, checker_code):
    if compare_spec == "exact":
        return _deep_exact_equal(actual, expected), None
    if compare_spec == "unordered":
        return _deep_unordered_equal(actual, expected), None
    if isinstance(compare_spec, dict) and "float" in compare_spec:
        tol = float(compare_spec["float"])
        return _deep_float_equal(actual, expected, tol), None
    if isinstance(compare_spec, dict) and "checker" in compare_spec:
        if not checker_code:
            return False, "Missing checker.py implementation."
        checker_ns = {"__name__": "__checker__"}
        compiled = compile(checker_code, "<checker>", "exec")
        exec(compiled, checker_ns)
        check_fn = checker_ns.get("check")
        if not callable(check_fn):
            return False, "checker.py must define check(args, actual, expected)."
        try:
            res = check_fn(copy.deepcopy(orig_args), actual, copy.deepcopy(expected))
        except AssertionError as exc:
            return False, str(exc) or "Checker assertion failed."
        if isinstance(res, tuple) and len(res) == 2:
            return bool(res[0]), str(res[1]) if not res[0] else None
        return bool(res), None if res else "Output did not satisfy problem checker."
    return False, f"Unsupported compare mode: {compare_spec}"


def prepare_problem_run(source_code, inputs=None, datasets=None):
    if datasets:
        for fname, content in datasets.items():
            with open(fname, "w", encoding="utf-8") as fh:
                fh.write(content)

    stdout_buf = io.StringIO()
    stderr_buf = io.StringIO()
    old_stdout = sys.stdout
    old_stderr = sys.stderr
    old_input = builtins.input

    input_iter = iter(list(inputs or []))

    def _custom_input(prompt=""):
        if prompt:
            sys.stdout.write(str(prompt))
        try:
            val = next(input_iter)
            sys.stdout.write(str(val) + "\n")
            return str(val)
        except StopIteration:
            raise EOFError("No more pre-supplied inputs available for input().")

    ns = {"__name__": "__main__"}
    ok = True
    error = ""
    error_type = ""
    error_line = None

    try:
        sys.stdout = stdout_buf
        sys.stderr = stderr_buf
        builtins.input = _custom_input
        compiled = compile(source_code, "<student_code>", "exec")
        exec(compiled, ns)
    except SyntaxError as exc:
        ok = False
        error_type = type(exc).__name__
        error_line = _extract_student_line(exc)
        error = traceback.format_exc()
    except Exception as exc:
        ok = False
        error_type = type(exc).__name__
        error_line = _extract_student_line(exc)
        error = traceback.format_exc()
    finally:
        sys.stdout = old_stdout
        sys.stderr = old_stderr
        builtins.input = old_input

    return ns, {
        "ok": ok,
        "stdout": stdout_buf.getvalue(),
        "stderr": stderr_buf.getvalue(),
        "error": error,
        "errorType": error_type,
        "errorLine": error_line,
    }


def run_problem_test(ns, entry, compare, test_spec, checker_code=None):
    stdout_buf = io.StringIO()
    stderr_buf = io.StringIO()
    old_stdout = sys.stdout
    old_stderr = sys.stderr

    t0 = time.perf_counter()
    status = "Passed"
    passed = False
    error = ""
    error_type = ""
    error_line = None
    input_repr = ""
    expected_repr = ""
    actual_repr = ""

    try:
        sys.stdout = stdout_buf
        sys.stderr = stderr_buf

        if entry["type"] == "function":
            fn_name = entry["name"]
            fn = ns.get(fn_name)
            if not callable(fn):
                status = "Runtime Error"
                error_type = "NameError"
                error = f"NameError: Required function '{fn_name}' is not defined."
            else:
                eval_env = {"__builtins__": builtins}
                if test_spec.get("argsExpr") is not None:
                    raw_args = eval(test_spec["argsExpr"], eval_env)
                    if isinstance(raw_args, tuple):
                        raw_args = list(raw_args)
                    elif not isinstance(raw_args, list):
                        raise ValueError("Test argsExpr must evaluate to a tuple or list of positional arguments.")
                else:
                    raw_args = list(test_spec.get("args") or [])

                orig_args = copy.deepcopy(raw_args)
                call_args = copy.deepcopy(raw_args)

                if test_spec.get("expectedExpr") is not None:
                    expected = eval(test_spec["expectedExpr"], eval_env)
                else:
                    expected = copy.deepcopy(test_spec.get("expected"))

                input_repr = ", ".join(_safe_repr(a, 140) for a in orig_args)
                expected_repr = _safe_repr(expected)

                try:
                    actual = fn(*call_args)
                except Exception as exc:
                    status = "Runtime Error"
                    error_type = type(exc).__name__
                    error_line = _extract_student_line(exc)
                    error = traceback.format_exc()
                else:
                    actual_repr = _safe_repr(actual)
                    checks = test_spec.get("checks") or []
                    if "inputUnchanged" in checks and not _deep_exact_equal(call_args, orig_args):
                        status = "Wrong Answer"
                        error = "Input argument was mutated in place (expected input to remain unchanged)."
                    else:
                        ok, reason = _compare_values(
                            actual, expected, compare, orig_args, checker_code
                        )
                        if ok:
                            status = "Passed"
                            passed = True
                        else:
                            status = "Wrong Answer"
                            error = reason or f"Expected {expected_repr}, got {actual_repr}"

        elif entry["type"] == "script":
            test_ns = dict(ns)
            input_repr = test_spec.get("inputDisplay") or ""
            expected_repr = test_spec.get("expectedDisplay") or "All assertions pass"
            compiled_test = compile(test_spec["script"], "<test_script>", "exec")
            try:
                exec(compiled_test, test_ns)
                status = "Passed"
                passed = True
                actual_repr = "Passed"
            except AssertionError as exc:
                status = "Wrong Answer"
                error_type = "AssertionError"
                error = str(exc) or traceback.format_exc()
                actual_repr = "Assertion failed"
            except Exception as exc:
                status = "Runtime Error"
                error_type = type(exc).__name__
                error_line = _extract_student_line(exc)
                error = traceback.format_exc()
                actual_repr = f"{error_type}: {exc}"
        else:
            status = "Runtime Error"
            error = f"Unknown entry type: {entry.get('type')}"
    except Exception as exc:
        status = "Runtime Error"
        error_type = type(exc).__name__
        error_line = _extract_student_line(exc)
        error = traceback.format_exc()
    finally:
        sys.stdout = old_stdout
        sys.stderr = old_stderr

    elapsed_ms = round((time.perf_counter() - t0) * 1000.0, 3)

    return {
        "label": test_spec.get("label", "Test"),
        "status": status,
        "passed": passed,
        "runtimeMs": elapsed_ms,
        "inputRepr": input_repr,
        "expectedRepr": expected_repr,
        "actualRepr": actual_repr,
        "stdout": stdout_buf.getvalue(),
        "stderr": stderr_buf.getvalue(),
        "error": error or None,
        "errorType": error_type or None,
        "errorLine": error_line,
    }


def run_problem_custom(ns, entry, custom_text):
    stdout_buf = io.StringIO()
    stderr_buf = io.StringIO()
    old_stdout = sys.stdout
    old_stderr = sys.stderr

    t0 = time.perf_counter()
    ok = True
    return_repr = ""
    error = ""
    error_line = None

    try:
        sys.stdout = stdout_buf
        sys.stderr = stderr_buf
        trimmed = (custom_text or "").strip()

        if entry["type"] == "function":
            fn_name = entry["name"]
            fn = ns.get(fn_name)
            if not callable(fn):
                raise NameError(f"Required function '{fn_name}' is not defined.")
            if trimmed == "":
                args = ()
            else:
                val = eval(trimmed, dict(ns))
                if isinstance(val, tuple):
                    args = val
                else:
                    args = (val,)
            call_args = copy.deepcopy(list(args))
            res = fn(*call_args)
            return_repr = _safe_repr(res, 500)
        else:
            custom_ns = dict(ns)
            compiled = compile(trimmed, "<custom_input>", "exec")
            exec(compiled, custom_ns)
            return_repr = "Executed snippet"
    except SyntaxError as exc:
        ok = False
        error_line = exc.lineno if exc.filename == "<student_code>" else None
        error = traceback.format_exc()
    except Exception as exc:
        ok = False
        error_line = _extract_student_line(exc)
        error = traceback.format_exc()
    finally:
        sys.stdout = old_stdout
        sys.stderr = old_stderr

    elapsed_ms = round((time.perf_counter() - t0) * 1000.0, 3)
    return {
        "ok": ok,
        "runtimeMs": elapsed_ms,
        "returnRepr": return_repr,
        "stdout": stdout_buf.getvalue(),
        "stderr": stderr_buf.getvalue(),
        "error": error or None,
        "errorLine": error_line,
    }
