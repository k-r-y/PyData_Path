Implement `render_markdown(md: str) -> str` converting a safe subset of Markdown into HTML fragments separated by `"\n"`.

### Rules
1. Escape `&` -> `&amp;`, `<` -> `&lt;`, `>` -> `&gt;` in all user content before emitting HTML tags.
2. Fenced code blocks (``` line to closing ``` line) emit `<pre><code>...</code></pre>` joining enclosed lines with `"\n"` and applying **no** bold/italic formatting inside.
3. Headings `# `, `## `, `### ` emit `<h1>...</h1>`, `<h2>...</h2>`, `<h3>...</h3>`.
4. Consecutive lines starting with `"- "` group into `<ul><li>...</li>...</ul>`.
5. Plain consecutive non-blank lines join with `" "` inside `<p>...</p>`.
6. Inline formatting outside code blocks/code spans: backticks `code` -> `<code>code</code>`, `**bold**` -> `<strong>bold</strong>`, `*italic*` -> `<em>italic</em>`. Empty/blank input returns `""`.
