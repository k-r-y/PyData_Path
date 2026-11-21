import sys
import io
import json

def run_with_trace(source_code, max_steps=300):
    steps = []
    stdout_buf = io.StringIO()
    old_stdout = sys.stdout
    sys.stdout = stdout_buf

    def tracer(frame, event, arg):
        if frame.f_code.co_filename != "<traced_code>":
            return tracer
        if event == "line":
            if len(steps) >= max_steps:
                raise RuntimeError(f"Trace limit reached ({max_steps} steps).")
            safe_locals = {}
            for k, v in frame.f_locals.items():
                if not k.startswith("__"):
                    try:
                        safe_locals[k] = repr(v)
                    except Exception:
                        safe_locals[k] = "<unprintable>"
            steps.append({
                "line": frame.f_lineno,
                "locals": safe_locals,
                "stdout": stdout_buf.getvalue(),
            })
        return tracer

    ns = {"__name__": "__main__"}
    error = None
    truncated = False
    try:
        compiled = compile(source_code, "<traced_code>", "exec")
        sys.settrace(tracer)
        exec(compiled, ns)
    except Exception as exc:
        if isinstance(exc, RuntimeError) and f"Trace limit reached ({max_steps} steps)." in str(exc):
            truncated = True
        error = f"{type(exc).__name__}: {exc}"
    finally:
        sys.settrace(None)
        sys.stdout = old_stdout

    return json.dumps({
        "steps": steps,
        "truncated": truncated,
        "maxSteps": max_steps,
        "error": error,
        "finalStdout": stdout_buf.getvalue(),
    })
