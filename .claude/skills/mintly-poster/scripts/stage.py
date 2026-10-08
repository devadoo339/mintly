#!/usr/bin/env python3
"""Copy the bundled poster source into a publish folder and stamp the index.

Usage: stage.py <root> [--title "Mintly Poster"]

Writes <root>/project/Main.dc.html and <root>/project/canvas.json. The index's
createdOnFiles.at is set to now, which a newly created canvas index requires.
"""
import argparse, json, shutil
from datetime import datetime, timezone
from pathlib import Path

ASSETS = Path(__file__).resolve().parent.parent / "assets" / "project"

ap = argparse.ArgumentParser()
ap.add_argument("root")
ap.add_argument("--title")
args = ap.parse_args()

out = Path(args.root) / "project"
out.mkdir(parents=True, exist_ok=True)
shutil.copyfile(ASSETS / "Main.dc.html", out / "Main.dc.html")

index = json.loads((ASSETS / "canvas.json").read_text())
index["createdOnFiles"]["at"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
if args.title:
    index["title"] = args.title
(out / "canvas.json").write_text(json.dumps(index, separators=(",", ":")))
print(out / "canvas.json")
print(out / "Main.dc.html")
