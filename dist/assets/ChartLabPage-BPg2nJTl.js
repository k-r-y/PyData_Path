import{D as e,F as t,O as n,R as r,x as i}from"./index-CPtcHmMJ.js";import{E as a,n as o,r as s,t as c}from"./runner-D_tfcKVJ.js";import{t as l}from"./dist-Dy2ME_fX.js";import{t as u}from"./loader-circle-BRk6AMbj.js";var d=r(t(),1),f=n(),p=`import matplotlib.pyplot as plt

months = ["Jan", "Feb", "Mar", "Apr", "May"]
sales = [120, 145, 132, 178, 210]

fig, ax = plt.subplots(figsize=(6, 3.5))
ax.bar(months, sales, color="#4f46e5")
ax.set_title("Monthly Campus Store Sales")
ax.set_ylabel("Units Sold")
ax.grid(axis="y", alpha=0.3)`;function m(){let{resolvedTheme:t}=e(),[n,r]=(0,d.useState)(p),[m,h]=(0,d.useState)(null),[g,_]=(0,d.useState)(null),[v,y]=(0,d.useState)(!1);return(0,f.jsxs)(`div`,{className:`max-w-5xl mx-auto px-6 py-8 space-y-6`,children:[(0,f.jsxs)(`header`,{className:`space-y-1 border-b border-neutral-200 dark:border-neutral-800 pb-4`,children:[(0,f.jsxs)(`h1`,{className:`text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2`,children:[(0,f.jsx)(i,{className:`w-6 h-6 text-neutral-600 dark:text-neutral-400`}),`Chart Lab (Matplotlib)`]}),(0,f.jsx)(`p`,{className:`text-xs text-neutral-500 dark:text-neutral-400`,children:`Renders Matplotlib figures inside Pyodide using the non-interactive Agg backend as PNG images.`})]}),(0,f.jsxs)(`div`,{className:`grid grid-cols-1 lg:grid-cols-2 gap-6`,children:[(0,f.jsxs)(`div`,{className:`space-y-3`,children:[(0,f.jsx)(`div`,{className:`rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden`,children:(0,f.jsx)(o,{value:n,height:`260px`,extensions:[l()],theme:t===`dark`?s:`light`,onChange:r})}),(0,f.jsxs)(`button`,{type:`button`,disabled:v,onClick:async()=>{y(!0),_(null);try{await c.loadPackages([`matplotlib`]);let e=`import matplotlib
matplotlib.use("Agg")
import io, base64
${n}
__buf = io.BytesIO()
plt.savefig(__buf, format="png", bbox_inches="tight", dpi=130)
plt.close("all")
print("__IMG_B64__:" + base64.b64encode(__buf.getvalue()).decode("ascii"))`,t=await c.run(e,{timeoutMs:2e4});if(!t.ok){_(t.error??t.stderr??`Plot failed`);return}let r=t.stdout.split(`
`).find(e=>e.startsWith(`__IMG_B64__:`));r&&h(`data:image/png;base64,${r.slice(12)}`)}catch(e){_(e instanceof Error?e.message:String(e))}finally{y(!1)}},className:`inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold`,children:[v?(0,f.jsx)(u,{className:`w-3.5 h-3.5 animate-spin`}):(0,f.jsx)(a,{className:`w-3.5 h-3.5`}),v?`Rendering...`:`Render Chart`]})]}),(0,f.jsx)(`div`,{className:`rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-4 flex items-center justify-center min-h-[260px]`,children:g?(0,f.jsx)(`pre`,{className:`text-xs font-mono text-rose-600 dark:text-rose-400 whitespace-pre-wrap`,children:g}):m?(0,f.jsx)(`img`,{src:m,alt:`Matplotlib chart output`,className:`max-w-full rounded`}):(0,f.jsx)(`p`,{className:`text-xs text-neutral-400`,children:`Click Render Chart to generate your plot.`})})]})]})}export{m as ChartLabPage};