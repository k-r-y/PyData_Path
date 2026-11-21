import{G as e,J as t,N as n,P as r,x as i}from"./index-BdFRfiYc.js";import{I as a,a as o,i as s,t as c}from"./runner-b5ofqqQn.js";import{t as l}from"./loader-circle-CUCG1VUr.js";var u=t(e(),1),d=r(),f=`
import sqlite3, json
conn = sqlite3.connect(":memory:")
cur = conn.cursor()
cur.execute("CREATE TABLE courses (code TEXT PRIMARY KEY, title TEXT, credits INTEGER)")
cur.execute("CREATE TABLE enrollments (id INTEGER PRIMARY KEY, student TEXT, course_code TEXT, grade REAL)")
cur.executemany("INSERT INTO courses VALUES (?, ?, ?)", [
    ("IS-101", "Intro to IS", 3),
    ("IS-204", "Database Systems", 3),
    ("IS-301", "Business Analytics", 3),
])
cur.executemany("INSERT INTO enrollments VALUES (?, ?, ?, ?)", [
    (1, "Ana", "IS-101", 91.0),
    (2, "Ben", "IS-101", 84.5),
    (3, "Ana", "IS-204", 88.0),
    (4, "Cara", "IS-301", 95.0),
    (5, "Ben", "IS-301", 79.0),
])
conn.commit()
`;function p(){let{resolvedTheme:e}=n(),[t,r]=(0,u.useState)(`SELECT c.code, c.title, COUNT(e.id) AS enrolled, ROUND(AVG(e.grade), 1) AS avg_grade
FROM courses c
LEFT JOIN enrollments e ON c.code = e.course_code
GROUP BY c.code, c.title
ORDER BY enrolled DESC;`),[p,m]=(0,u.useState)([]),[h,g]=(0,u.useState)([]),[_,v]=(0,u.useState)(null),[y,b]=(0,u.useState)(!1);return(0,d.jsxs)(`div`,{className:`max-w-5xl mx-auto px-6 py-8 space-y-6`,children:[(0,d.jsxs)(`header`,{className:`space-y-1 border-b border-neutral-200 dark:border-neutral-800 pb-4`,children:[(0,d.jsxs)(`h1`,{className:`text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2`,children:[(0,d.jsx)(i,{className:`w-6 h-6 text-neutral-600 dark:text-neutral-400`}),`SQL Playground (SQLite)`]}),(0,d.jsxs)(`p`,{className:`text-xs text-neutral-500 dark:text-neutral-400`,children:[`Runs against an in-browser SQLite database with `,(0,d.jsx)(`code`,{className:`font-mono`,children:`courses`}),` and `,(0,d.jsx)(`code`,{className:`font-mono`,children:`enrollments`}),` tables.`]})]}),(0,d.jsx)(`div`,{className:`rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden`,children:(0,d.jsx)(s,{value:t,height:`160px`,theme:e===`dark`?o:`light`,onChange:r})}),(0,d.jsxs)(`button`,{type:`button`,disabled:y,onClick:async()=>{b(!0),v(null);try{let e=`${f}
cur.execute(${JSON.stringify(t)})
cols = [d[0] for d in cur.description] if cur.description else []
data = cur.fetchall()
print(json.dumps({"columns": cols, "rows": data}))`,n=await c.run(e);if(!n.ok){v(n.error??n.stderr??`SQL execution failed`);return}let r=JSON.parse(n.stdout.trim());m(r.columns),g(r.rows)}catch(e){v(e instanceof Error?e.message:String(e))}finally{b(!1)}},className:`inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold`,children:[y?(0,d.jsx)(l,{className:`w-3.5 h-3.5 animate-spin`}):(0,d.jsx)(a,{className:`w-3.5 h-3.5`}),`Execute SQL`]}),_&&(0,d.jsx)(`pre`,{className:`rounded-md border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-mono text-rose-700 dark:text-rose-300 whitespace-pre-wrap`,children:_}),p.length>0&&(0,d.jsx)(`div`,{className:`rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] overflow-x-auto`,children:(0,d.jsxs)(`table`,{className:`w-full text-xs text-left border-collapse`,children:[(0,d.jsx)(`thead`,{children:(0,d.jsx)(`tr`,{className:`bg-neutral-50 dark:bg-[#09090b] border-b border-neutral-200 dark:border-neutral-800`,children:p.map(e=>(0,d.jsx)(`th`,{className:`px-3 py-2 font-semibold`,children:e},e))})}),(0,d.jsx)(`tbody`,{children:h.map((e,t)=>(0,d.jsx)(`tr`,{className:`border-b border-neutral-100 dark:border-neutral-800/60`,children:e.map((e,t)=>(0,d.jsx)(`td`,{className:`px-3 py-1.5 font-mono`,children:String(e)},t))},t))})]})})]})}export{p as SqlLabPage};