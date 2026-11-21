import re


def render_markdown(md: str) -> str:
    blocks = []
    for p in md.strip().split("\n\n"):
        if p.startswith("# "):
            blocks.append(f"<h1>{p[2:]}</h1>")
        else:
            blocks.append(f"<p>{p}</p>")
    return "\n".join(blocks)
