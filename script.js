const Mintly = (() => {
  const PROGRESS_PREFIX = "mintly:completed:";
  const USERS_KEY = "mintly:users";
  const SESSION_KEY = "mintly:session";
  const INTEREST_PREFIX = "mintly:interest:";
  // The Financial Literacy course, in order. Add a lesson here and it shows up in the course
  // list, progress counts, "Continue learning" links and the locked-course messages.
  const LESSONS = [
    { id: "lesson-1", title: "What is financial literacy?", mins: 20 },
    { id: "lesson-2", title: "Needs vs. wants: building a simple budget", mins: 10 },
    { id: "lesson-3", title: "Saving for something you want", mins: 12 },
    { id: "lesson-4", title: "How banks work: accounts, debit cards and interest", mins: 12 },
    { id: "lesson-5", title: "Intro to investing: stocks, risk and diversification", mins: 15 },
  ];
  const LESSON_IDS = LESSONS.map((l) => l.id);

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

  // The first lesson not yet completed (or lesson 1 again once everything is done).
  function nextLesson() {
    return LESSONS.find((l) => !isLessonComplete(l.id)) || LESSONS[0];
  }

  // --- Research interest (what the user chose to learn about on Explore) ---

  function saveInterest(interest) {
    writeJSON(INTEREST_PREFIX + progressScope(), interest);
  }

  function getInterest() {
    return readJSON(INTEREST_PREFIX + progressScope(), null);
  }

  // Phones hide .nav-links, so add a menu button that shows them as a dropdown.
  function setupMobileNav() {
    const nav = document.querySelector(".navbar");
    const links = nav && nav.querySelector(".nav-links");
    const right = nav && nav.querySelector(".nav-right");
    if (!links || !right) return;
    links.id = links.id || "nav-links";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "nav-toggle";
    btn.setAttribute("aria-label", "Menu");
    btn.setAttribute("aria-controls", links.id);
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = "<span></span><span></span><span></span>";
    btn.addEventListener("click", () => {
      btn.setAttribute("aria-expanded", String(nav.classList.toggle("nav-open")));
    });
    right.appendChild(btn);
    const close = () => {
      nav.classList.remove("nav-open");
      btn.setAttribute("aria-expanded", "false");
    };
    // close the menu after a tap on a link (needed for same-page links like #simulate) or on Escape
    links.addEventListener("click", (e) => { if (e.target.closest("a")) close(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("nav-open")) { close(); btn.focus(); } });
  }

  // Mark the current section in the header so people can see where they are.
  // Lessons and the course page count as "Learn"; electives count as "Explore".
  function markActiveNav() {
    const here = location.pathname.split("/").pop() || "index.html";
    const inLessons = location.pathname.includes("/lessons/");
    let section = here;
    if (inLessons && /^(lesson-\d+|financial-literacy)\.html$/.test(here)) section = "learn";
    else if (inLessons) section = "explore";
    document.querySelectorAll(".nav-links a").forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (href.includes("#")) return;
      const file = href.split("?")[0].split("/").pop();
      const match =
        (section === "learn" && /^lesson-\d+\.html$/.test(file)) ||
        (section === "explore" && file === "explore.html") ||
        (!inLessons && file === here);
      if (match) a.setAttribute("aria-current", "page");
    });
  }

  function requireSubscription() {
    if (!hasActivePlan()) {
      window.location.href = rootPath("pricing.html");
    }
  }

  return {
    LESSONS,
    LESSON_IDS,
    nextLesson,
    markActiveNav,
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
    setupMobileNav,
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  Mintly.renderNavAuth("nav-auth");
  Mintly.setupMobileNav();
  Mintly.markActiveNav();
});
