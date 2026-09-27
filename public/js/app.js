(function () {
  "use strict";

  const APP_URL = "https://jargon-buster.suvadipchakraborty.workers.dev/";
  const STORAGE_KEY = "jb.q3deck.v1";

  // ---------------------------------------------------------------
  // Elements
  // ---------------------------------------------------------------
  const tabHome = document.getElementById("tab-home");
  const tabAbout = document.getElementById("tab-about");
  const panelHome = document.getElementById("panel-home");
  const panelAbout = document.getElementById("panel-about");

  const generateBtn = document.getElementById("generateBtn");
  const memoIdle = document.getElementById("memoIdle");
  const memoLoading = document.getElementById("memoLoading");
  const memoResult = document.getElementById("memoResult");
  const loadingText = document.getElementById("loadingText");
  const stampMark = document.getElementById("stampMark");
  const jargonText = document.getElementById("jargonText");
  const meaningText = document.getElementById("meaningText");

  const shareBtn = document.getElementById("shareBtn");
  const saveBtn = document.getElementById("saveBtn");
  const saveBtnLabel = document.getElementById("saveBtnLabel");

  const deckSection = document.getElementById("deckSection");
  const deckToggle = document.getElementById("deckToggle");
  const deckToggleLabel = document.getElementById("deckToggleLabel");
  const deckList = document.getElementById("deckList");

  const feedbackLink = document.getElementById("feedbackLink");
  const toast = document.getElementById("toast");

  let current = null; // { phrase, translation }
  let toastTimer = null;

  // ---------------------------------------------------------------
  // Tabs
  // ---------------------------------------------------------------
  function selectTab(which) {
    const home = which === "home";
    tabHome.setAttribute("aria-selected", String(home));
    tabAbout.setAttribute("aria-selected", String(!home));
    panelHome.hidden = !home;
    panelAbout.hidden = home;
    window.scrollTo(0, 0);
  }
  tabHome.addEventListener("click", () => selectTab("home"));
  tabAbout.addEventListener("click", () => selectTab("about"));

  // ---------------------------------------------------------------
  // Fake corporate loading copy
  // ---------------------------------------------------------------
  const LOADING_LINES = [
    "Circling back to stakeholders\u2026",
    "Leveraging synergies\u2026",
    "Boiling the ocean, briefly\u2026",
    "Taking this offline\u2026",
    "Socializing the deck\u2026",
    "Getting alignment from legal\u2026",
    "Pinging a director for visibility\u2026",
    "Running it up the flagpole\u2026",
    "Actioning the action items\u2026",
    "Double-clicking on the ask\u2026"
  ];

  function cycleLoadingText() {
    let i = Math.floor(Math.random() * LOADING_LINES.length);
    loadingText.textContent = LOADING_LINES[i];
    return setInterval(() => {
      i = (i + 1) % LOADING_LINES.length;
      loadingText.textContent = LOADING_LINES[i];
    }, 420);
  }

  // ---------------------------------------------------------------
  // Generate
  // ---------------------------------------------------------------
  async function generate() {
    generateBtn.disabled = true;
    memoIdle.hidden = true;
    memoResult.hidden = true;
    memoLoading.hidden = false;
    const timer = cycleLoadingText();

    const started = Date.now();
    let phrase = null;

    try {
      const res = await fetch("/api/jargon", { cache: "no-store" });
      if (!res.ok) throw new Error("bad status");
      const data = await res.json();
      phrase = data && data.phrase;
      if (!phrase) throw new Error("no phrase");
    } catch (err) {
      phrase = null;
    }

    // Keep the fake-loading theatre on screen for a beat, even on a fast network —
    // that's the joke. But never less than ~650ms, never more than ~1500ms.
    const elapsed = Date.now() - started;
    const minDelay = 650;
    const wait = Math.max(0, minDelay - elapsed);
    await new Promise((r) => setTimeout(r, wait));

    clearInterval(timer);
    memoLoading.hidden = true;
    generateBtn.disabled = false;

    if (!phrase) {
      memoIdle.hidden = false;
      memoIdle.querySelector(".memo__idle-text").textContent =
        "The jargon server is unreachable. Even corporate speak needs an internet connection.";
      return;
    }

    const { translation } = translateJargon(phrase);
    current = { phrase, translation };

    jargonText.textContent = "\u201c" + phrase + "\u201d";
    meaningText.textContent = translation;
    memoResult.hidden = false;

    saveBtn.dataset.active = "false";
    saveBtnLabel.textContent = "Save to Q3";

    stampMark.classList.remove("stamp--pop");
    // restart animation
    void stampMark.offsetWidth;
    stampMark.classList.add("stamp--pop");
  }

  generateBtn.addEventListener("click", generate);

  // ---------------------------------------------------------------
  // Share
  // ---------------------------------------------------------------
  shareBtn.addEventListener("click", async () => {
    const text = current
      ? `"${current.phrase}"\n\nWhat it actually means: ${current.translation}`
      : "Jargon Buster \u2014 corporate speak, decoded before lunch.";

    const shareData = {
      title: "Jargon Buster",
      text: text,
      url: APP_URL
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // user cancelled — no-op
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(text + "\n\n" + APP_URL);
      showToast("Copied to clipboard");
    } catch (err) {
      showToast("Couldn't share \u2014 copy it manually");
    }
  });

  // ---------------------------------------------------------------
  // Q3 Strategy Deck (localStorage)
  // ---------------------------------------------------------------
  function loadDeck() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  function persistDeck(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      // storage full or unavailable — fail silently, this is a bonus feature
    }
  }

  function renderDeck() {
    const items = loadDeck();
    deckSection.hidden = items.length === 0 && !deckList.dataset.opened;
    deckToggleLabel.textContent = `Q3 Strategy Deck (${items.length})`;

    if (items.length === 0) {
      deckList.innerHTML = '<p class="deck__empty">Nothing filed yet. Save a translation to add it here.</p>';
      return;
    }

    deckList.innerHTML = "";
    items.slice().reverse().forEach((item) => {
      const row = document.createElement("div");
      row.className = "deck__item";
      row.innerHTML = `
        <div class="deck__item-text">
          <p class="deck__item-jargon">${escapeHtml(item.phrase)}</p>
          <p class="deck__item-meaning">${escapeHtml(item.translation)}</p>
        </div>
        <button class="deck__item-remove" aria-label="Remove from deck" data-id="${item.id}">&times;</button>
      `;
      deckList.appendChild(row);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  saveBtn.addEventListener("click", () => {
    if (!current) return;
    const items = loadDeck();

    if (saveBtn.dataset.active === "true") {
      showToast("Already filed under Q3");
      return;
    }

    items.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      phrase: current.phrase,
      translation: current.translation
    });
    persistDeck(items);
    saveBtn.dataset.active = "true";
    saveBtnLabel.textContent = "Filed";
    deckSection.hidden = false;
    renderDeck();
    showToast("Saved to Q3 Strategy Deck");
  });

  deckToggle.addEventListener("click", () => {
    const expanded = deckToggle.getAttribute("aria-expanded") === "true";
    deckToggle.setAttribute("aria-expanded", String(!expanded));
    deckList.hidden = expanded;
    deckList.dataset.opened = expanded ? "" : "1";
  });

  deckList.addEventListener("click", (e) => {
    const btn = e.target.closest(".deck__item-remove");
    if (!btn) return;
    const id = btn.dataset.id;
    const items = loadDeck().filter((it) => it.id !== id);
    persistDeck(items);
    renderDeck();
  });

  // ---------------------------------------------------------------
  // Feedback mailto
  // ---------------------------------------------------------------
  feedbackLink.href =
    "mailto:suvadipchakraborty@gmail.com" +
    "?subject=" + encodeURIComponent("Feedback on Jargon Buster") +
    "&body=" + encodeURIComponent("Hey Suva,\n\nI was using Jargon Buster and wanted to say...\n\n");

  // ---------------------------------------------------------------
  // Toast
  // ---------------------------------------------------------------
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }

  // ---------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------
  renderDeck();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }
})();
