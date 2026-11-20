import { useState } from 'react';
import { FileText, Search } from 'lucide-react';

interface CheatItem {
  module: string;
  title: string;
  snippet: string;
  note: string;
}

const CHEAT_ITEMS: CheatItem[] = [
  {
    module: 'A1 Setup & Anatomy',
    title: 'Shell commands',
    snippet: 'python3 --version\npython3 script.py\npython3 -m pip install pandas\npython3 -m venv .venv',
    note: 'Run these in your OS terminal, not inside a .py file.',
  },
  {
    module: 'A1 Setup & Anatomy',
    title: 'Imports',
    snippet: 'import math\nfrom statistics import mean\nimport math as m',
    note: 'Place imports at the top of the file (PEP 8).',
  },
  {
    module: 'A1 Setup & Anatomy',
    title: 'print() options',
    snippet: 'print("A", "B", sep="-", end="!")',
    note: 'sep controls what goes between arguments; end controls the trailing character.',
  },
  {
    module: 'C2 SQLite',
    title: 'Parameterized query in Python',
    snippet: 'import sqlite3\nconn = sqlite3.connect(":memory:")\ncur = conn.cursor()\ncur.execute("SELECT * FROM items WHERE stock > ?", (10,))',
    note: 'Use ? placeholders instead of string formatting to avoid SQL injection.',
  },
  {
    module: 'C4 pandas',
    title: 'Read CSV & inspect',
    snippet: 'import pandas as pd\ndf = pd.read_csv("data.csv")\ndf.head()\ndf.info()',
    note: 'Verify column dtypes and missing values before aggregating.',
  },
];

export function CheatSheetsPage() {
  const [query, setQuery] = useState('');
  const filtered = CHEAT_ITEMS.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.module.toLowerCase().includes(query.toLowerCase()) ||
      c.snippet.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <header className="space-y-2 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
          Searchable Cheat Sheets
        </h1>
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search syntax or module..."
            aria-label="Search cheat sheets"
            className="w-full pl-9 pr-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#0c0c0e] text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-4 space-y-2"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              {item.module}
            </span>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">{item.title}</h2>
            <pre className="rounded bg-neutral-900 text-neutral-100 p-3 text-xs font-mono overflow-x-auto">
              {item.snippet}
            </pre>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">{item.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
