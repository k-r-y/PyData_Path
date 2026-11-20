import{D as e,E as t,F as n,O as r,R as i,g as a}from"./index-CPtcHmMJ.js";import{E as o,n as s,r as c,t as l}from"./runner-D_tfcKVJ.js";import{t as u}from"./dist-Dy2ME_fX.js";import{t as d}from"./rotate-ccw-Di4BlGlb.js";var f={name:`skip-back`,size:24,node:[[`path`,{d:`M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z`,key:`15892j`}],[`path`,{d:`M3 20V4`,key:`1ptbpl`}]]};f.node;var p=t(f),m={name:`skip-forward`,size:24,node:[[`path`,{d:`M21 4v16`,key:`7j8fe9`}],[`path`,{d:`M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z`,key:`zs4d6`}]]};m.node;var h=t(m),g=i(n(),1),_=`import sys
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
    try:
        compiled = compile(source_code, "<traced_code>", "exec")
        sys.settrace(tracer)
        exec(compiled, ns)
    except Exception as exc:
        error = f"{type(exc).__name__}: {exc}"
    finally:
        sys.settrace(None)
        sys.stdout = old_stdout

    return json.dumps({
        "steps": steps,
        "error": error,
        "finalStdout": stdout_buf.getvalue(),
    })
`,v=r(),y=`total = 0
scores = [85, 90, 78]
for s in scores:
    total += s
avg = total / len(scores)
print("Average:", avg)`;function b(){let{resolvedTheme:t}=e(),[n,r]=(0,g.useState)(y),[i,f]=(0,g.useState)([]),[m,b]=(0,g.useState)(0),[x,S]=(0,g.useState)(null),[C,w]=(0,g.useState)(!1),T=async()=>{w(!0),S(null),f([]),b(0);try{let e=`${_}\nprint(run_with_trace(${JSON.stringify(n)}))`,t=await l.run(e);if(!t.ok){S(t.error??`Failed to trace code.`);return}let r=JSON.parse(t.stdout.trim());f(r.steps),r.error&&S(r.error)}catch(e){S(e instanceof Error?e.message:String(e))}finally{w(!1)}},E=i[m],D=n.split(`
`);return(0,v.jsxs)(`div`,{className:`max-w-5xl mx-auto px-6 py-8 space-y-6`,children:[(0,v.jsxs)(`header`,{className:`space-y-1 border-b border-neutral-200 dark:border-neutral-800 pb-4`,children:[(0,v.jsxs)(`h1`,{className:`text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2`,children:[(0,v.jsx)(a,{className:`w-6 h-6 text-neutral-600 dark:text-neutral-400`}),`Step-Through Variable Visualizer`]}),(0,v.jsxs)(`p`,{className:`text-xs text-neutral-500 dark:text-neutral-400`,children:[`Powered by Python `,(0,v.jsx)(`code`,{className:`font-mono`,children:`sys.settrace`}),` inside Pyodide. Inspect how variables change line by line.`]})]}),(0,v.jsxs)(`div`,{className:`grid grid-cols-1 lg:grid-cols-2 gap-6`,children:[(0,v.jsxs)(`div`,{className:`space-y-3`,children:[(0,v.jsx)(`div`,{className:`rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden`,children:(0,v.jsx)(s,{value:n,height:`240px`,extensions:[u()],theme:t===`dark`?c:`light`,onChange:r})}),(0,v.jsxs)(`div`,{className:`flex flex-wrap items-center gap-2`,children:[(0,v.jsxs)(`button`,{type:`button`,disabled:C,onClick:T,className:`inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-neutral-600 hover:bg-neutral-700 disabled:opacity-50 text-white text-xs font-semibold`,children:[(0,v.jsx)(o,{className:`w-3.5 h-3.5`}),C?`Tracing...`:`Trace Execution`]}),i.length>0&&(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(`button`,{type:`button`,onClick:()=>b(0),"aria-label":`Reset to first step`,className:`p-2 rounded border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800`,children:(0,v.jsx)(d,{className:`w-3.5 h-3.5`})}),(0,v.jsx)(`button`,{type:`button`,disabled:m===0,onClick:()=>b(e=>Math.max(0,e-1)),"aria-label":`Previous step`,className:`p-2 rounded border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40`,children:(0,v.jsx)(p,{className:`w-3.5 h-3.5`})}),(0,v.jsx)(`button`,{type:`button`,disabled:m>=i.length-1,onClick:()=>b(e=>Math.min(i.length-1,e+1)),"aria-label":`Next step`,className:`p-2 rounded border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40`,children:(0,v.jsx)(h,{className:`w-3.5 h-3.5`})}),(0,v.jsxs)(`span`,{className:`text-xs text-neutral-600 dark:text-neutral-400 ml-1`,children:[`Step `,m+1,` / `,i.length]})]})]}),x&&(0,v.jsx)(`div`,{className:`rounded-md border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-mono text-rose-700 dark:text-rose-300`,children:x})]}),(0,v.jsxs)(`div`,{className:`space-y-4`,children:[(0,v.jsxs)(`div`,{className:`rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-3`,children:[(0,v.jsx)(`h2`,{className:`text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2`,children:`Execution Line`}),(0,v.jsx)(`div`,{className:`font-mono text-xs space-y-0.5`,children:D.map((e,t)=>{let n=t+1,r=E?.line===n;return(0,v.jsxs)(`div`,{className:`px-2 py-0.5 rounded flex gap-3 ${r?`bg-amber-100 dark:bg-amber-900/50 text-amber-950 dark:text-amber-100 font-semibold`:`text-neutral-600 dark:text-neutral-400`}`,children:[(0,v.jsx)(`span`,{className:`w-5 text-right select-none opacity-60`,children:n}),(0,v.jsx)(`span`,{className:`whitespace-pre`,children:e||` `})]},n)})})]}),(0,v.jsxs)(`div`,{className:`rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-3`,children:[(0,v.jsx)(`h2`,{className:`text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2`,children:`Variables in Scope`}),!E||Object.keys(E.locals).length===0?(0,v.jsx)(`p`,{className:`text-xs text-neutral-400`,children:`No variables yet.`}):(0,v.jsxs)(`table`,{className:`w-full text-xs font-mono`,children:[(0,v.jsx)(`thead`,{children:(0,v.jsxs)(`tr`,{className:`border-b border-neutral-200 dark:border-neutral-800 text-left text-neutral-500`,children:[(0,v.jsx)(`th`,{className:`py-1 pr-3`,children:`Name`}),(0,v.jsx)(`th`,{className:`py-1`,children:`Value`})]})}),(0,v.jsx)(`tbody`,{children:Object.entries(E.locals).map(([e,t])=>(0,v.jsxs)(`tr`,{className:`border-b border-neutral-100 dark:border-neutral-800/60`,children:[(0,v.jsx)(`td`,{className:`py-1.5 pr-3 text-neutral-700 dark:text-neutral-400`,children:e}),(0,v.jsx)(`td`,{className:`py-1.5 text-neutral-800 dark:text-neutral-200`,children:t})]},e))})]})]}),E?.stdout&&(0,v.jsxs)(`div`,{className:`rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-neutral-100 p-3`,children:[(0,v.jsx)(`h2`,{className:`text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1`,children:`Output so far`}),(0,v.jsx)(`pre`,{className:`text-xs font-mono whitespace-pre-wrap`,children:E.stdout})]})]})]})]})}export{b as StepVisualizer};