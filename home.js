/* Homepage only (index.html): live NVDA teaser, Buy/Wait/Pass prompts, lesson progress, scroll reveals.
   Live data comes from server.js (/api/chart), which reads ALPHA_VANTAGE_API_KEY from the environment.
   Without a key (or when opened as a file) the card falls back to practice data. */
(function () {
  const $ = (id) => document.getElementById(id);
  const API = location.protocol === "file:" ? "http://localhost:8000" : "";
  const usd = (n) => "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  let range = "1M", live = false;

  function path(p) {
    const mn = Math.min(...p), mx = Math.max(...p), w = 600 / Math.max(1, p.length - 1);
    return p.map((v, i) => (i ? "L" : "M") + (i * w).toFixed(1) + "," + (94 - (v - mn) / ((mx - mn) || 1) * 88).toFixed(1)).join("");
  }
  // Same seeded practice line the demo uses, so the fallback looks familiar.
  function mockPoints(seed) {
    let s = 0; for (const ch of seed) s = s * 31 + ch.charCodeAt(0);
    const r = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
    let y = 50; const p = [];
    for (let i = 0; i < 40; i++) { y += (r() - .45) * 12 + .9; p.push(y); }
    return p;
  }
  function draw(p, color) {
    $("hm-chart").innerHTML = '<svg viewBox="0 0 600 100" preserveAspectRatio="none" class="spark" role="img" aria-label="NVDA price chart"><path d="' + path(p) +
      '" pathLength="1" fill="none" stroke="' + color + '" stroke-width="2.5" vector-effect="non-scaling-stroke"/></svg>';
  }
  function setRangeButtons(ok) {
    $("hm-rng").querySelectorAll("button").forEach((b) => {
      b.classList.toggle("on", b.dataset.r === range);
      if (ok) { const yes = ok.includes(b.dataset.r); b.disabled = !yes; b.title = yes ? "" : "Needs a premium Alpha Vantage key"; }
    });
  }

  async function loadChart() {
    try {
      const r = await fetch(API + "/api/chart?symbol=NVDA&range=" + range), d = await r.json();
      if (!r.ok) throw Error(d.error);
      const p = d.points.map((x) => x.c), chg = (p[p.length - 1] / p[0] - 1) * 100, col = "var(" + (chg >= 0 ? "--gain" : "--bad") + ")";
      // label color: deep green / ink keep 4.5:1 contrast on white (the line keeps gain/loss colors)
      const lbl = chg >= 0 ? "var(--pgreen)" : "var(--ink)";
      draw(p, col);
      $("hm-px").textContent = usd(d.quote.price);
      $("hm-chg").textContent = (chg >= 0 ? "+" : "") + chg.toFixed(2) + "%";
      $("hm-chg").style.color = lbl;
      setRangeButtons(d.ranges);
      $("hm-src").textContent = "Simulation. No real money. Live price from Alpha Vantage, last trading day " + d.quote.day +
        (d.stale ? " (rate limit reached, showing last saved data)." : ".");
      live = true;
    } catch (e) {
      if (live) return;
      draw(mockPoints("NVDA" + range), "var(--gain)");
      setRangeButtons();
      $("hm-src").textContent = "Simulation. No real money. Practice data shown: the live price needs the Mintly server with an Alpha Vantage key.";
    }
  }

  function initQuote() {
    if (!$("hm-chart")) return;
    $("hm-rng").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b || b.disabled) return;
      range = b.dataset.r; live = false; setRangeButtons(); loadChart();
    });
    document.querySelectorAll(".hm-pick .chip").forEach((c) => c.addEventListener("click", () => {
      document.querySelectorAll(".hm-pick .chip").forEach((x) => x.classList.toggle("on", x === c));
      $("hm-fb").textContent = "Leaf: " + c.dataset.m;
    }));
    loadChart();
    setInterval(() => { if (!document.hidden && live) loadChart(); }, 60000);
  }

  function initProgress() {
    if (typeof Mintly === "undefined") return;
    let done = 0;
    document.querySelectorAll("[data-lesson]").forEach((row) => {
      if (Mintly.isLessonComplete(row.dataset.lesson)) {
        done++; row.classList.add("done");
        row.querySelector(".num").textContent = "✓";
        row.querySelector(".go").textContent = "Review →";
      }
    });
    const total = Mintly.LESSON_IDS.length;
    $("hm-progress").textContent = done ? done + " of " + total + " lessons complete." : "Five lessons are ready now. More are on the way.";
  }

  function initReveal() {
    if (!("IntersectionObserver" in window)) return;
    document.documentElement.classList.add("js-reveal");
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { threshold: 0.15 });
    document.querySelectorAll(".hm-reveal").forEach((el) => io.observe(el));
  }

  document.addEventListener("DOMContentLoaded", () => { initQuote(); initProgress(); initReveal(); });
})();
