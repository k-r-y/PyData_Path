import html
import re


def render_markdown(md: str) -> str:
    def format_inline(text: str) -> str:
        parts = re.split(r"(`[^`]+`)", text)
        out: list[str] = []
        for idx, part in enumerate(parts):
            if idx % 2 == 1:
                inner = html.escape(part[1:-1], quote=False)
                out.append(f"<code>{inner}</code>")
            else:
                esc = html.escape(part, quote=False)
                esc = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", esc)
                esc = re.sub(r"\*(.+?)\*", r"<em>\1</em>", esc)
                out.append(esc)
        return "".join(out)

    blocks: list[str] = []
    lines = md.splitlines()
    i = 0
    n = len(lines)

    while i < n:
        line = lines[i]
        stripped = line.strip()
        if not stripped:
            i += 1
            continue

        if stripped.startswith("```"):
            i += 1
            code_lines: list[str] = []
            while i < n and not lines[i].strip().startswith("```"):
                code_lines.append(html.escape(lines[i], quote=False))
                i += 1
            if i < n:
                i += 1
            blocks.append(f"<pre><code>{'\n'.join(code_lines)}</code></pre>")
            continue

        m = re.match(r"^(#{1,3})\s+(.*)$", line)
        if m:
            lvl = len(m.group(1))
            blocks.append(f"<h{lvl}>{format_inline(m.group(2))}</h{lvl}>")
            i += 1
            continue

        if line.startswith("- "):
            items: list[str] = []
            while i < n and lines[i].startswith("- "):
                items.append(f"<li>{format_inline(lines[i][2:])}</li>")
                i += 1
            blocks.append(f"<ul>{''.join(items)}</ul>")
            continue

        para_lines: list[str] = []
        while (
            i < n
            and lines[i].strip()
            and not lines[i].strip().startswith("```")
            and not lines[i].startswith("- ")
            and not re.match(r"^#{1,3}\s+", lines[i])
        ):
            para_lines.append(format_inline(lines[i]))
            i += 1
        blocks.append(f"<p>{' '.join(para_lines)}</p>")

    return "\n".join(blocks)
