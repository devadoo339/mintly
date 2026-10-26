/* Mintly theme: light/dark toggle + the demo's Customize panel (accent, background, font).
   Loaded in <head> so saved choices apply before first paint; the dock is built once the DOM is ready. */
(function () {
  const KEY_THEME = "mintly:theme", KEY_CUSTOM = "mintly:custom";
  const root = document.documentElement;
  const read = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  const PAL = [["Graphite", ["#151515", "#151515", "#E9E9E6", "#fff"], ["#A8DDC0", "#A8DDC0", "#16301F", "#0E0E0E"]], ["Violet", ["#6C47FF", "#5B3AE8", "#ECE8FF", "#fff"], ["#8F73FF", "#A58FFF", "#241B4A", "#0E0E0E"]], ["Tangerine", ["#F25C05", "#BF4300", "#FFEADB", "#fff"], ["#FF8A3D", "#FF9A5C", "#3A1E0E", "#0E0E0E"]], ["Rose", ["#E11D63", "#C0124F", "#FFE4EE", "#fff"], ["#FF5C93", "#FF7DA8", "#3A1020", "#0E0E0E"]], ["Ultramarine", ["#2F5BFF", "#2446D6", "#E4EBFF", "#fff"], ["#6F8FFF", "#8EA8FF", "#14214A", "#0E0E0E"]]];
  const BGS = [["Stone", ["#F5F5F4", "#fff"], ["#0E0E0E", "#181817"]], ["White", ["#fff", "#F5F5F4"], ["#000", "#141414"]], ["Silver", ["#E8E8EA", "#F7F7F8"], ["#17171A", "#202024"]]];
  const FONTS = [["Sora + Inter", "'Sora',system-ui,sans-serif", "'Inter',system-ui,sans-serif"], ["Fraunces + Inter", "'Fraunces',Georgia,serif", "'Inter',system-ui,sans-serif"], ["Space Grotesk", "'Space Grotesk',system-ui,sans-serif", "'Space Grotesk',system-ui,sans-serif"], ["System", "system-ui,-apple-system,'Segoe UI',sans-serif", "system-ui,-apple-system,'Segoe UI',sans-serif"]];

  let C = Object.assign({ a: 0, b: 0, f: 0 }, read(KEY_CUSTOM, {}));
  const saved = read(KEY_THEME, null);
  if (saved === "light" || saved === "dark") root.dataset.theme = saved;

  const isDark = () => root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;

  function apply() {
    const st = root.style, keys = ["--acc", "--acct", "--accsoft", "--onacc", "--bg", "--panel", "--fh", "--fb"];
    if (!C.a && !C.b && !C.f) keys.forEach(k => st.removeProperty(k));
    else {
      const d = isDark() ? 2 : 1, p = PAL[C.a][d], b = BGS[C.b][d];
      ["--acc", "--acct", "--accsoft", "--onacc"].forEach((k, j) => st.setProperty(k, p[j]));
      st.setProperty("--bg", b[0]); st.setProperty("--panel", b[1]);
      st.setProperty("--fh", FONTS[C.f][1]); st.setProperty("--fb", FONTS[C.f][2]);
    }
    document.querySelectorAll("#cp [data-k]").forEach(e => e.classList.toggle("on", C[e.dataset.k] == e.dataset.i));
    const tg = document.getElementById("tg");
    if (tg) tg.textContent = isDark() ? "Switch to light mode" : "Switch to dark mode";
  }
  apply();

  function build() {
    const dock = document.createElement("div");
    dock.className = "dock";
    dock.innerHTML = '<button class="tgl" id="cu" type="button">Customize</button><button class="tgl" id="tg" type="button"></button>';
    const cp = document.createElement("div");
    cp.className = "cp"; cp.id = "cp";
    cp.innerHTML = `<h4>Accent color</h4><div class="sw">${PAL.map((p, i) => `<button type="button" data-k="a" data-i="${i}" title="${p[0]}" aria-label="${p[0]}" style="background:${p[1][0]}"></button>`).join("")}</div>
<h4>Background</h4><div class="sw">${BGS.map((p, i) => `<button type="button" class="sq" data-k="b" data-i="${i}" title="${p[0]}" aria-label="${p[0]}" style="background:${p[1][0]}"></button>`).join("")}</div>
<h4>Font</h4><div class="cp-chips">${FONTS.map((p, i) => `<button type="button" class="cp-chip" data-k="f" data-i="${i}" style="font-family:${p[2]}">${p[0]}</button>`).join("")}</div>
<button type="button" class="cp-reset" id="cp-reset">Reset to original</button>`;
    document.body.append(cp, dock);

    document.getElementById("cu").onclick = () => cp.classList.toggle("open");
    document.getElementById("tg").onclick = () => {
      root.dataset.theme = isDark() ? "light" : "dark";
      write(KEY_THEME, root.dataset.theme); apply();
    };
    cp.addEventListener("click", e => {
      const b = e.target.closest("[data-k]");
      if (b) { C[b.dataset.k] = +b.dataset.i; write(KEY_CUSTOM, C); apply(); }
    });
    document.getElementById("cp-reset").onclick = () => {
      C = { a: 0, b: 0, f: 0 }; delete root.dataset.theme;
      try { localStorage.removeItem(KEY_THEME); localStorage.removeItem(KEY_CUSTOM); } catch (e) {}
      apply();
    };
    addEventListener("keydown", e => { if (e.key === "Escape") cp.classList.remove("open"); });
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", apply);
    apply();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})();
