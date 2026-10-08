---
name: mintly-poster
description: Recreate the Mintly Poster — the 24×36 in showcase poster for the Mintly teen financial-literacy site — as a Design canvas artifact, a standalone HTML file, or a print-ready PDF, from the exact bundled source. Use this whenever the user asks to recreate, rebuild, restore, re-publish, duplicate, export or print the Mintly poster, wants a new copy or variant of it (filled-in placeholders, changed copy, a different demo link or QR code, another size), or mentions "the poster" while working in the Mintly repo — even if they don't say "skill". Start from the bundled files instead of designing a poster from scratch.
---

# Mintly Poster

The poster already exists as finished source in this skill. Recreating it means
publishing that source again, not redesigning it — a from-memory rebuild drifts in
spacing, copy and color, and the QR code cannot be redrawn by hand at all.

## What's bundled

| Path | What it is |
| --- | --- |
| `assets/project/Main.dc.html` | The poster artboard, exactly as published (Design canvas format) |
| `assets/project/canvas.json` | The canvas index: one 2304×3456 artboard titled "Mintly poster · 24×36 in" |
| `assets/poster-standalone.html` | The same poster as plain HTML that opens in any browser |
| `scripts/stage.py` | Copies the source into a publish folder and timestamps the index |
| `scripts/build_standalone.py` | Regenerates the standalone HTML from a `.dc.html` |
| `scripts/qr_svg.py` | Generates the QR `<svg>` for a new link, in the poster's markup |

## Pick the output

- **A poster to view, edit or share on claude.ai** (the default; this is what the
  original is) → Design canvas, below.
- **A file, a PDF, or something to print** → standalone HTML, below.
- If the user just says "recreate the poster", make the Design canvas.

## Recreate as a Design canvas

1. Stage the files into a scratchpad folder (the script sets the index's
   `createdOnFiles.at` to now, which a new canvas needs):

   ```bash
   python3 <skill>/scripts/stage.py <scratchpad>/mintly-poster
   ```

2. Make any requested changes to `<scratchpad>/mintly-poster/project/Main.dc.html`
   (see "Making changes"). For an exact recreation, change nothing.

3. Create the canvas. Call the Artifact tool's `quickstart` with intent `design` to
   get the Design type's link, then publish with that `type_url` and
   `title: "Mintly Poster"` and no files. Use the `url` that comes back for
   everything after. Skip the design-system step the type describes: the poster
   carries its own look and installing one would restyle it.

4. Publish both files to that `url` in one call:
   `root` = `<scratchpad>/mintly-poster`, `file_path` = the absolute path of
   `project/canvas.json`, `files` = `{"project/Main.dc.html": "project/Main.dc.html"}`.

5. Give the user the link. Don't render or screenshot it to check — the source is
   known-good.

This always makes a **new** canvas. To change the original poster in place
instead, the user has to ask for that; then read and update that artifact by its
own URL (find it with the Artifact `list` action) following the type's revising
rules, rather than using the bundled copy, since they may have edited it since.

If the Design type isn't offered in the session, say so and deliver the standalone
HTML instead.

## Recreate as a file or PDF

`assets/poster-standalone.html` is ready to use as is: copy it to where the user
wants it. It is 2304×3456 CSS px with `@page { size: 24in 36in }`, so in Chrome
"Print → Save as PDF" with margins None and background graphics on gives a
one-page 24×36 in PDF. Headless works too:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
  --no-pdf-header-footer --print-to-pdf=mintly-poster.pdf poster-standalone.html
```

It loads Sora and Inter from Google Fonts, so it needs a network connection the
first time it renders. After editing a `.dc.html`, regenerate the standalone copy
with `python3 <skill>/scripts/build_standalone.py <edited.dc.html> <out.html>`.

## Making changes

Edit the staged copy, never the files in `assets/` — those are the reference.

**Placeholders.** The poster ships with five unfilled slots, written in brackets so
they are obvious on the wall. Leave them unless the user supplies the facts; don't
invent results or names:

- `[AI MODEL OR TOOL LEAF RUNS ON]` — "How we use AI" card
- `[WHO TRIED IT AND WHAT HAPPENED]` and `[YOUR BIGGEST LESSON]` — "Impact" card
- `[YOUR NAME] · [SCHOOL AND GRADE] · [EMAIL]` — footer pill

When recreating, mention which of these are still empty.

**The demo link and QR code.** The QR encodes
`https://devadoo339.github.io/mintly/mintly.demo.html`, and the same address is
printed in the footer. They have to change together. For a new link:

```bash
pip install segno   # pure Python; use a venv if pip refuses
python3 <skill>/scripts/qr_svg.py "https://new.example/link"
```

Replace the whole `<svg width="300" …>…</svg>` inside the QR frame with the output
and update the footer text. Never hand-edit the QR path: one wrong module makes it
unscannable, and nobody notices until the poster is printed.

**Copy and layout.** Structure, top to bottom: dark header band (wordmark,
headline, QR) → Purpose / The problem cards → five phone-style step cards (Choose,
Research, Ask Leaf, Make your case, Simulate and reflect) → How we use AI / Impact
cards → What's next roadmap → footer pill. The root is a fixed 2304×3456 flex
column with `justify-content: space-between` and `overflow: hidden`, so text that
grows a section pushes the rest toward the bottom edge and then clips. Keep
replacement copy about the length of what it replaces, or trim elsewhere.

**Staying on-style.** Use only what's already there:

- Color: ink `#151515`, paper `#F5F5F4`, white `#FFFFFF`, mint `#A8DDC0`, deep mint
  `#2F7D58` (labels on light grounds), peach `#F6B8A8`, greys `#E9E9E6`, `#E4E4E1`,
  `#6A6A66`, `#9A9A95`, `#2A2A28`.
- Type: Sora 700/800 for the wordmark, headlines, step names and pills; Inter
  400–700 for everything else. Section labels are 30px, 700, uppercase, 0.12em
  tracking.
- Shape: big radii (48px cards, 52px step cards, 999px pills) and hard offset
  shadows with no blur (`12px 12px 0 #A8DDC0`), no gradients.
- The wordmark is lowercase `mintly` followed by a mint period.

**Another size.** Keep the 2:3 ratio and scale everything, or the composition
breaks. For the canvas, the artboard's root `width`/`height`, the `$preview` in
`data-props`, and `w`/`h` in `canvas.json` must all agree. For print-only resizing,
leave the HTML alone and let the PDF scale (18×27 in or 12×18 in are the same
ratio).
