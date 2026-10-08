#!/usr/bin/env python3
"""Print the poster's QR <svg> element for a URL, in the poster's own markup.

Usage: qr_svg.py <url> [--label "QR code linking to the Mintly demo"]

Needs the pure-Python `segno` package (pip install segno; use a venv if the
system Python is externally managed). Replace the whole <svg ...>...</svg>
inside the QR frame in Main.dc.html with the output.
"""
import argparse
import segno

ap = argparse.ArgumentParser()
ap.add_argument("url")
ap.add_argument("--label", default="QR code linking to the Mintly demo")
args = ap.parse_args()

QUIET = 4
qr = segno.make(args.url, error="m", micro=False)
rows = [list(r) for r in qr.matrix]
n = len(rows) + 2 * QUIET
d = "".join(
    f"M{x + QUIET} {y + QUIET}h1v1h-1z"
    for y, row in enumerate(rows)
    for x, on in enumerate(row)
    if on
)
print(
    f'<svg width="300" height="300" viewBox="0 0 {n} {n}" role="img" '
    f'aria-label="{args.label}" shape-rendering="crispEdges" '
    f'style="flex-shrink: 0; display: block"><rect width="{n}" height="{n}" '
    f'fill="#FFFFFF"></rect><path d="{d}" fill="#151515"></path></svg>'
)
