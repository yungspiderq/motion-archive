(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const body = document.body;
  const menuBtn = $("#menuBtn");
  const scrim = $("#navScrim");
  const searchForm = $("#searchForm");
  const q = $("#q");
  const clearBtn = $("#clearBtn");
  const chips = $$(".chip");
  const navItems = $$(".nav-item[data-chip]");
  const cards = $$(".card");
  const grid = $("#grid");
  const empty = $("#empty");
  const emptyReset = $("#resetBtn");
  const countEl = $("#count");
  const titleEl = $("#sectionTitle");
  const sortEl = $("#sort");
  const baseTitle = document.title;

  let activeTag = "all";
  let query = "";

  const mobileMq = window.matchMedia("(max-width: 1023px)");
  const normalize = s => String(s).toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
  const plural = n => (n === 1 ? "клип" : n >= 2 && n <= 4 ? "клипа" : "клипов");

  function setMenuState() {
    const open = mobileMq.matches
      ? body.classList.contains("nav-open")
      : !body.classList.contains("nav-collapsed");
    menuBtn.setAttribute("aria-expanded", String(open));
  }

  function closeNav() {
    body.classList.remove("nav-open");
    setMenuState();
  }

  function setActiveNav(tag, target = null) {
    navItems.forEach(item => {
      const sameTag = item.dataset.chip === tag;
      const sameTarget = target
        ? item.dataset.target === target
        : tag !== "all"
          ? item.dataset.target === "clips"
          : item.dataset.target === "top";
      item.classList.toggle("active", sameTag && sameTarget);
    });
  }

  function apply() {
    const term = normalize(query);
    let visible = 0;

    cards.forEach(card => {
      const tags = (card.dataset.tags || "").split(/\s+/);
      const tagOK = activeTag === "all" || tags.includes(activeTag);
      const haystack = normalize(card.dataset.search + " " + card.textContent);
      const queryOK = !term || haystack.includes(term);
      const show = tagOK && queryOK;
      card.hidden = !show;
      if (show) visible++;
    });

    const isEmpty = visible === 0;
    grid.hidden = isEmpty;
    empty.hidden = !isEmpty;
    countEl.textContent = visible + " " + plural(visible);

    const trimmed = query.trim();
    if (trimmed) {
      const shown = trimmed.length > 42 ? trimmed.slice(0, 42).trimEnd() + "…" : trimmed;
      titleEl.textContent = "Поиск: «" + shown + "»";
    } else if (activeTag === "new") {
      titleEl.textContent = "Новинки";
    } else if (activeTag === "halloween") {
      titleEl.textContent = "Хэллоуин";
    } else if (activeTag === "candy") {
      titleEl.textContent = "Кэнди-поп";
    } else {
      titleEl.textContent = "Все клипы";
    }

    clearBtn.hidden = query.length === 0;

    chips.forEach(chip => {
      const on = chip.dataset.tag === activeTag;
      chip.classList.toggle("active", on);
      chip.setAttribute("aria-pressed", String(on));
    });

    document.title = trimmed
      ? "Поиск: " + trimmed + " — Клипы HALLO CEL"
      : baseTitle;
  }

  function setTag(tag, navTarget = null) {
    activeTag = tag;
    if (navTarget) setActiveNav(tag, navTarget);
    else setActiveNav(tag);
    apply();
  }

  chips.forEach(chip => {
    chip.addEventListener("click", () => setTag(chip.dataset.tag));
  });

  navItems.forEach(item => {
    item.addEventListener("click", event => {
      event.preventDefault();
      const tag = item.dataset.chip;
      setTag(tag, item.dataset.target);
      closeNav();
      if (item.dataset.target === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        $("#clips").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  $(".nav-item[href='#about']")?.addEventListener("click", closeNav);

  searchForm.addEventListener("submit", event => {
    event.preventDefault();
    query = q.value;
    apply();
    q.blur();
  });

  q.addEventListener("input", () => {
    query = q.value;
    apply();
  });

  clearBtn.addEventListener("click", () => {
    q.value = "";
    query = "";
    apply();
    q.focus();
  });

  emptyReset.addEventListener("click", () => {
    q.value = "";
    query = "";
    activeTag = "all";
    setActiveNav("all");
    sortEl.value = "new";
    apply();
    q.focus();
  });

  sortEl.addEventListener("change", () => {
    const mode = sortEl.value;
    const sorted = [...cards].sort((a, b) => {
      if (mode === "az") {
        return a.dataset.title.localeCompare(b.dataset.title, "ru");
      }
      const da = Date.parse(a.dataset.date) || 0;
      const db = Date.parse(b.dataset.date) || 0;
      return mode === "old" ? da - db : db - da;
    });
    sorted.forEach(card => grid.appendChild(card));
  });

  menuBtn.addEventListener("click", () => {
    if (mobileMq.matches) body.classList.toggle("nav-open");
    else body.classList.toggle("nav-collapsed");
    setMenuState();
  });

  scrim.addEventListener("click", closeNav);

  document.addEventListener("keydown", event => {
    const tag = document.activeElement ? document.activeElement.tagName : "";
    const editing = /INPUT|TEXTAREA|SELECT/.test(tag);

    if (event.key === "/" && !editing && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      q.focus();
      q.select();
      return;
    }

    if (event.key === "Escape") {
      if (document.activeElement === q) {
        if (q.value) {
          q.value = "";
          query = "";
          apply();
        } else {
          q.blur();
        }
      } else if (body.classList.contains("nav-open")) {
        closeNav();
      }
    }
  });

  const onViewportChange = () => {
    body.classList.remove("nav-open");
    setMenuState();
  };

  if (mobileMq.addEventListener) mobileMq.addEventListener("change", onViewportChange);
  else mobileMq.addListener(onViewportChange);

  setMenuState();
  apply();
})();
