const Mintly = (() => {
  const PROGRESS_PREFIX = "mintly:completed:";
  const USERS_KEY = "mintly:users";
  const SESSION_KEY = "mintly:session";
  const INTEREST_PREFIX = "mintly:interest:";
  const THEME_KEY = "mintly:theme";
  const LESSON_IDS = ["lesson-1", "lesson-2", "lesson-3", "lesson-4"];

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  // --- Auth (demo only: accounts live in this browser's localStorage,
  // not a real server. Do not reuse this pattern for real passwords.) ---

  function getUsers() {
    return readJSON(USERS_KEY, {});
  }

  function currentUser() {
    const email = localStorage.getItem(SESSION_KEY);
    if (!email) return null;
    const users = getUsers();
    return users[email] || null;
  }

  function progressScope() {
    const user = currentUser();
    return user ? user.email : "guest";
  }

  function signUp({ name, email, password, plan }) {
    email = (email || "").trim().toLowerCase();
    if (!name || !email || !password) {
      return { ok: false, error: "Please fill in every field." };
    }
    const users = getUsers();
    if (users[email]) {
      return { ok: false, error: "An account with that email already exists." };
    }

    const guestCompleted = LESSON_IDS.filter((id) =>
      localStorage.getItem(PROGRESS_PREFIX + "guest:" + id) === "true"
    );

    users[email] = { name, email, password, plan: plan || null };
    writeJSON(USERS_KEY, users);
    localStorage.setItem(SESSION_KEY, email);

    guestCompleted.forEach((id) => markLessonComplete(id));

    return { ok: true };
  }

  function logIn({ email, password }) {
    email = (email || "").trim().toLowerCase();
    const users = getUsers();
    const user = users[email];
    if (!user || user.password !== password) {
      return { ok: false, error: "That email and password don't match." };
    }
    localStorage.setItem(SESSION_KEY, email);
    return { ok: true };
  }

  function logOut() {
    localStorage.removeItem(SESSION_KEY);
  }

  function setPlan(plan) {
    const email = localStorage.getItem(SESSION_KEY);
    if (!email) return;
    const users = getUsers();
    if (!users[email]) return;
    users[email].plan = plan;
    writeJSON(USERS_KEY, users);
  }

  function hasActivePlan() {
    const user = currentUser();
    return !!(user && user.plan);
  }

  function rootPath(page) {
    return location.pathname.includes("/lessons/") ? "../" + page : page;
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderNavAuth(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const user = currentUser();
    const signinHref = rootPath("signin.html");
    if (user) {
      const firstName = escapeHTML(user.name.split(" ")[0]);
      el.innerHTML =
        '<span class="nav-account-link">Hi, ' + firstName + '</span>' +
        '<button class="btn-dark" id="nav-logout-btn">Log out</button>';
      document.getElementById("nav-logout-btn").addEventListener("click", () => {
        logOut();
        window.location.href = rootPath("index.html");
      });
    } else {
      el.innerHTML =
        '<a class="nav-account-link" href="' + signinHref + '">Log in</a>' +
        '<a class="btn-dark" href="' + signinHref + '">Join the waitlist</a>';
    }
  }

  // --- Lesson progress (scoped to the signed-in account, or "guest") ---

  function isLessonComplete(id) {
    return localStorage.getItem(PROGRESS_PREFIX + progressScope() + ":" + id) === "true";
  }

  function markLessonComplete(id) {
    try {
      localStorage.setItem(PROGRESS_PREFIX + progressScope() + ":" + id, "true");
    } catch (e) {}
  }

  function completedCount() {
    return LESSON_IDS.filter(isLessonComplete).length;
  }

  function isCourseComplete() {
    return completedCount() === LESSON_IDS.length;
  }

  // --- Research interest (what the user chose to learn about on Explore) ---

  function saveInterest(interest) {
    writeJSON(INTEREST_PREFIX + progressScope(), interest);
  }

  function getInterest() {
    return readJSON(INTEREST_PREFIX + progressScope(), null);
  }

  // --- Theme (light/dark). With no saved choice, the system setting decides. ---

  function isDarkTheme() {
    const chosen = document.documentElement.dataset.theme;
    if (chosen) return chosen === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  const SUN_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const MOON_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  function renderThemeToggle(btn) {
    const dark = isDarkTheme();
    btn.innerHTML = dark ? SUN_ICON : MOON_ICON;
    btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    btn.title = dark ? "Light mode" : "Dark mode";
  }

  function setupThemeToggle() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-toggle";
    btn.addEventListener("click", () => {
      const next = isDarkTheme() ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {}
      renderThemeToggle(btn);
    });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => renderThemeToggle(btn));
    renderThemeToggle(btn);
    document.body.appendChild(btn);
  }

  function requireSubscription() {
    if (!hasActivePlan()) {
      window.location.href = rootPath("pricing.html");
    }
  }

  return {
    LESSON_IDS,
    isLessonComplete,
    markLessonComplete,
    completedCount,
    isCourseComplete,
    saveInterest,
    getInterest,
    currentUser,
    signUp,
    logIn,
    logOut,
    setPlan,
    hasActivePlan,
    requireSubscription,
    renderNavAuth,
    setupThemeToggle,
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  Mintly.renderNavAuth("nav-auth");
  Mintly.setupThemeToggle();
});
