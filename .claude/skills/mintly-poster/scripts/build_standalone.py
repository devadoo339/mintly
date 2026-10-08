#!/usr/bin/env python3
"""Turn the poster's .dc.html into a plain HTML file that opens in any browser.

Usage: build_standalone.py [<Main.dc.html>] [<out.html>]

Defaults: the bundled assets/project/Main.dc.html -> assets/poster-standalone.html.
The page is 24x36 in (2304x3456 CSS px) with a matching @page size, so
"Print > Save as PDF" with margins off and background graphics on gives the poster.
"""
import re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
src = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / "assets" / "project" / "Main.dc.html"
dst = Path(sys.argv[2]) if len(sys.argv) > 2 else HERE / "assets" / "poster-standalone.html"

html = src.read_text()
helmet = re.search(r"<helmet>(.*?)</helmet>", html, re.S).group(1).strip()
body = re.search(r"</helmet>(.*)</x-dc>", html, re.S).group(1).strip()
title = re.search(r"<title>(.*?)</title>", html, re.S).group(1)

dst.write_text(f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
{helmet}
<style>
@page {{ size: 24in 36in; margin: 0 }}
html {{ -webkit-print-color-adjust: exact; print-color-adjust: exact }}
</style>
</head>
<body>
{body}
</body>
</html>
""")
print(dst)
