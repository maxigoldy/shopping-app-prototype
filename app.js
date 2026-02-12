const SECRET = "shopping_app_leaf";

/* Category icons used throughout the UI */
const ICONS = {
  fruit: { bg: "#22C55E", svg: `<svg viewBox="0 0 24 24"><path d="M12 6c3.5 0 6 2.7 6 6 0 4-3.2 8-6 8s-6-4-6-8c0-3.3 2.5-6 6-6Z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M12 6c0-2 1.5-3.5 3.5-4" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>` },
  grain: { bg: "#F59E0B", svg: `<svg viewBox="0 0 24 24"><path d="M12 5c4 2 6 5 6 9s-3 5-6 5-6-1-6-5 2-7 6-9Z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M12 7v11" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>` },
  dairy: { bg: "#3B82F6", svg: `<svg viewBox="0 0 24 24"><path d="M9 3h6l1 3v15H8V6l1-3Z" fill="none" stroke="white" stroke-width="2" stroke-linejoin="round"/><path d="M8 9h8" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>` },
  veg: { bg: "#06B6D4", svg: `<svg viewBox="0 0 24 24"><path d="M12 20c-5 0-7-3-7-7 0-4 4-8 7-8s7 4 7 8c0 4-2 7-7 7Z" fill="none" stroke="white" stroke-width="2"/><path d="M12 6c0-2 2-3 4-3" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>` },
  bread: { bg: "#9CA3AF", svg: `<svg viewBox="0 0 24 24"><path d="M6 11c0-4 3-6 6-6s6 2 6 6v8H6v-8Z" fill="none" stroke="white" stroke-width="2" stroke-linejoin="round"/><path d="M9 8c0 1-1 2-2 2M15 8c0 1 1 2 2 2" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>` },
  other: { bg: "#64748B", svg: `<svg viewBox="0 0 24 24"><path d="M12 6v12M6 12h12" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>` },
};

/* Default inspirations list. Each entry has a title, list of ingredients and a starting heart count. */
const INSPIRATIONS_DEMO = [
  {
    id: generateId("insp"),
    title: "Spaghetti Carbonara",
    ingredients: [
      { name: "Spaghetti", qty: "500g", cat: "grain" },
      { name: "Speck", qty: "100g", cat: "other" },
      { name: "Parmesan", qty: "50g", cat: "dairy" },
      { name: "Eier", qty: "2", cat: "dairy" },
    ],
    hearts: 120,
  },
  {
    id: generateId("insp"),
    title: "Caprese Salat",
    ingredients: [
      { name: "Tomaten", qty: "3", cat: "veg" },
      { name: "Mozzarella", qty: "200g", cat: "dairy" },
      { name: "Basilikum", qty: "", cat: "veg" },
    ],
    hearts: 85,
  },
  {
    id: generateId("insp"),
    title: "Gemüsepfanne",
    ingredients: [
      { name: "Paprika", qty: "2", cat: "veg" },
      { name: "Zucchini", qty: "1", cat: "veg" },
      { name: "Karotten", qty: "3", cat: "veg" },
      { name: "Reis", qty: "200g", cat: "grain" },
    ],
    hearts: 64,
  },
  {
    id: generateId("insp"),
    title: "Bananen-Smoothie",
    ingredients: [
      { name: "Bananen", qty: "2", cat: "fruit" },
      { name: "Milch", qty: "300ml", cat: "dairy" },
      { name: "Honig", qty: "1 EL", cat: "other" },
    ],
    hearts: 150,
  },
];


var hash = CryptoJS.HmacSHA512(SECRET, "powered by HSB");
const KEY = hash.toString();
//console.log("KEY: ", KEY)

/* Utility functions */
function generateId(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}
function normalize(str) {
  return (str || "").toString().trim().toLowerCase();
}
function now() {
  return new Date().toISOString();
}
function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch {
    return "";
  }
}

/* State handling: load and save from localStorage */
function loadState() {

  // Migrate old data to new storage
  try {
    const olddata = localStorage.getItem(KEY);
    if (olddata){
      localStorage.setItem("data", CryptoJS.AES.encrypt(JSON.stringify(olddata), KEY).toString());
      localStorage.removeItem(KEY);
      }
  } catch (error) {
    return null;
  }

  try {
    const raw = CryptoJS.AES.decrypt(localStorage.getItem("data"), KEY).toString(CryptoJS.enc.Utf8);
    if (!raw) return demoState();
    const st = JSON.parse(raw);
    // Ensure arrays exist
    if (!Array.isArray(st.lists) || !st.lists.length) return demoState();
    if (!Array.isArray(st.catalog)) st.catalog = [];
    if (!Array.isArray(st.recipes)) st.recipes = [];
    if (!Array.isArray(st.history)) st.history = [];
    if (!Array.isArray(st.inspirations)) st.inspirations = INSPIRATIONS_DEMO.slice();
    if (typeof st.isPro !== "boolean") st.isPro = false;
    return st;
  } catch {
    return demoState();
  }
}

function saveState() {
  //localStorage.setItem(KEY, JSON.stringify(state));
  localStorage.setItem("data", CryptoJS.AES.encrypt(JSON.stringify(state), KEY).toString());
}

/* Default state used on first load */
function demoState() {
  const list = {
    id: generateId("list"),
    name: "Zuhause",
    items: [
      { id: generateId("it"), name: "Bananen", qty: "4", cat: "fruit", checked: false, updatedAt: now() },
      { id: generateId("it"), name: "Nussmischung", qty: "", cat: "grain", checked: false, updatedAt: now() },
      { id: generateId("it"), name: "Milch", qty: "3L, 1,5%", cat: "dairy", checked: false, updatedAt: now() },
    ],
    recentlyChecked: [
      { id: generateId("rc"), name: "Babyspinat", qty: "", cat: "veg", checked: true, updatedAt: now() },
      { id: generateId("rc"), name: "Buttermilch", qty: "", cat: "dairy", checked: true, updatedAt: now() },
      { id: generateId("rc"), name: "Brot", qty: "", cat: "bread", checked: true, updatedAt: now() },
    ],
  };
  const recipe = {
    id: generateId("rec"),
    title: "Pasta Pomodoro",
    ingredients: [
      { id: generateId("ing"), name: "Pasta", qty: "1 Pck", cat: "grain" },
      { id: generateId("ing"), name: "Tomaten", qty: "800g", cat: "veg" },
      { id: generateId("ing"), name: "Olivenöl", qty: "2 EL", cat: "other" },
    ],
  };
  return {
    profile: { name: "Max Mustermann", household: "WG", diet: "omnivor", store: "Aldi", updatedAt: now() },
    catalog: [
      { name: "Bananen", cat: "fruit" },
      { name: "Äpfel", cat: "fruit" },
      { name: "Nussmischung", cat: "grain" },
      { name: "Haferflocken", cat: "grain" },
      { name: "Milch", cat: "dairy" },
      { name: "Buttermilch", cat: "dairy" },
      { name: "Käse", cat: "dairy" },
      { name: "Babyspinat", cat: "veg" },
      { name: "Tomaten", cat: "veg" },
      { name: "Gurke", cat: "veg" },
      { name: "Brot", cat: "bread" },
      { name: "Mehl", cat: "grain" },
    ],
    lists: [list, { id: generateId("list"), name: "Büro", items: [], recentlyChecked: [] }],
    activeListId: list.id,
    recipes: [recipe],
    activeRecipeId: recipe.id,
    history: [],
    inspirations: INSPIRATIONS_DEMO.slice(),
    isPro: false,
  };
}

let state = loadState();

/* DOM references */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// Elements for list page
const activeListName = $("#activeListName");
const itemsList = $("#itemsList");
const recentList = $("#recentList");

// Search elements
const searchInput = $("#searchInput");
const btnClearSearch = $("#btnClearSearch");
const searchOverlay = $("#searchOverlay");
const searchActions = $("#searchActions");
const searchSuggestions = $("#searchSuggestions");
const searchRecipes = $("#searchRecipes");
const btnCloseOverlay = $("#btnCloseOverlay");
const searchWrap = document.querySelector('.search-wrap');

// Navigation & screens
const navBtns = $$(".navbtn");
const screenList = $("#screenList");
const screenRecipes = $("#screenRecipes");
const screenProfile = $("#screenProfile");
const screenInspire = $("#screenInspire");
const screenHistory = $("#screenHistory");
const fabAdd = $("#fabAdd");

// Drawer
const btnDrawer = $("#btnDrawer");
const drawerBackdrop = $("#drawerBackdrop");
const drawer = $("#drawer");
const btnCloseDrawer = $("#btnCloseDrawer");
const listsDrawer = $("#listsDrawer");
const btnNewList = $("#btnNewList");

// Top sheet
const btnTopMenu = $("#btnTopMenu");
const sheetBackdrop = $("#sheetBackdrop");
const topSheet = $("#topSheet");
const btnCloseSheet = $("#btnCloseSheet");
const btnRenameList = $("#btnRenameList");
const btnDeleteList = $("#btnDeleteList");
const btnGoProfile = $("#btnGoProfile");
const btnGoRecipes = $("#btnGoRecipes");

// Item sheet
const itemSheetBackdrop = $("#itemSheetBackdrop");
const itemSheet = $("#itemSheet");
const itemSheetTitle = $("#itemSheetTitle");
const btnCloseItemSheet = $("#btnCloseItemSheet");
const itemForm = $("#itemForm");
const itemName = $("#itemName");
const itemQty = $("#itemQty");
const itemCat = $("#itemCat");
const btnItemCancel = $("#btnItemCancel");

// Prompt dialog
const promptDialog = $("#promptDialog");
const promptForm = $("#promptForm");
const promptTitle = $("#promptTitle");
const promptInput = $("#promptInput");

// Recipes
const recipesList = $("#recipesList");
const recipeTitle = $("#recipeTitle");
const ingredientForm = $("#ingredientForm");
const ingName = $("#ingName");
const ingQty = $("#ingQty");
const ingredientsList = $("#ingredientsList");
const btnNewRecipe = $("#btnNewRecipe");
const btnAddRecipeToList = $("#btnAddRecipeToList");

// Inspiration and History
const inspirationList = $("#inspirationList");
const historyList = $("#historyList");

// Profile
const avatar = $("#avatar");
const profileNameLabel = $("#profileNameLabel");
const profileSubLabel = $("#profileSubLabel");
const profileForm = $("#profileForm");
const profileName = $("#profileName");
const profileHousehold = $("#profileHousehold");
const profileDiet = $("#profileDiet");
const profileStore = $("#profileStore");
const btnResetDemo = $("#btnResetDemo");
const cardFree = $("#cardFree");
const cardPro = $("#cardPro");
const btnProAction = $("#btnProAction");

/* Transient state for item sheet */
let itemSheetMode = "add"; // "add" or "editCatalog"
let itemSheetPrefill = null; // prefill values when editing
let itemSheetCatalogKey = null; // normalized catalog key when editing

/* Helper functions to get active list and recipe */
function activeList() {
  return state.lists.find((l) => l.id === state.activeListId) || state.lists[0];
}
function activeRecipe() {
  return state.recipes.find((r) => r.id === state.activeRecipeId) || state.recipes[0];
}

/* Catalog helpers */
function catalogFindByName(name) {
  const key = normalize(name);
  return (state.catalog || []).find((c) => normalize(c.name) === key) || null;
}
function guessCatByName(name) {
  const hit = catalogFindByName(name);
  return hit?.cat || "other";
}
function ensureCatalogEntry(name, cat) {
  const n = (name || "").trim();
  if (!n) return;
  const key = normalize(n);
  const existing = (state.catalog || []).find((c) => normalize(c.name) === key);
  if (existing) {
    existing.cat = cat || existing.cat || "other";
  } else {
    state.catalog.unshift({ name: n, cat: cat || "other" });
  }
}

/* History management: add entry when item checked */
function recordHistoryEntry(item, list) {
  state.history = state.history || [];
  state.history.unshift({
    id: generateId("hist"),
    name: item.name,
    qty: item.qty,
    cat: item.cat,
    listId: list.id,
    listName: list.name,
    purchasedAt: now(),
  });
}

/* Prompt helper using dialog element. Returns value or null. */
function ask(title, value = "") {
  promptTitle.textContent = title;
  promptInput.value = value;
  promptDialog.showModal();
  setTimeout(() => promptInput.focus(), 0);
  return new Promise((resolve) => {
    const onClose = () => {
      promptDialog.removeEventListener("close", onClose);
      const ok = promptDialog.returnValue === "ok";
      resolve(ok ? promptInput.value.trim() : null);
    };
    promptDialog.addEventListener("close", onClose, { once: true });
  });
}

/* Row template used for list and history items */
function rowTemplate({ name, qty, cat, checked, rightMode = "check", subText = null }) {
  const icon = ICONS[cat] || ICONS.other;
  const rightContent =
    rightMode === "plus"
      ? `<div class="plus-pill" aria-label="Hinzufügen">+</div>`
      : `<div class="qty">${qty ? escapeHtml(qty) : ""}</div>
         <div class="circle ${checked ? "checked" : ""}" aria-hidden="true">
           ${checked ? `<svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" fill="none" stroke="white" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ``}
         </div>`;
  const sub = subText ? `<div class="row-sub">${escapeHtml(subText)}</div>` : "";
  return `
    <div class="row-item" role="button" tabindex="0">
      <div class="left-ico" style="background:${icon.bg}">${icon.svg}</div>
      <div class="row-main">
        <div class="row-title">${escapeHtml(name)}</div>
        ${sub}
      </div>
      <div class="row-right">${rightContent}</div>
    </div>
  `;
}

/* Escape HTML to avoid injection in templates */
function escapeHtml(str) {
  return (str ?? "").toString().replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

/* Add item to active list, optionally updating catalog and history */
function addItemToActiveList({ name, qty = "", cat = null, persistToCatalog = true }) {
  const list = activeList();
  const n = (name || "").trim();
  if (!n) return;
  const finalCat = cat || guessCatByName(n) || "other";
  if (persistToCatalog) ensureCatalogEntry(n, finalCat);
  // Check if item already exists and is open
  const existing = list.items.find((i) => normalize(i.name) === normalize(n) && !i.checked);
  if (existing) {
    existing.updatedAt = now();
    if (qty) existing.qty = qty.trim();
    existing.cat = finalCat;
    list.items = [existing, ...list.items.filter((i) => i.id !== existing.id)];
    saveState();
    render();
    return;
  }
  list.items.unshift({
    id: generateId("it"),
    name: n,
    qty: (qty || "").trim(),
    cat: finalCat,
    checked: false,
    updatedAt: now(),
  });
  saveState();
  render();
}

/* Toggle an item's checked state; record history on check */
function toggleItem(itemId) {
  const list = activeList();
  const item = list.items.find((i) => i.id === itemId);
  if (!item) return;
  item.checked = !item.checked;
  item.updatedAt = now();
  if (item.checked) {
    // Add to recently checked unique list
    const rc = { id: generateId("rc"), name: item.name, qty: item.qty, cat: item.cat, checked: true, updatedAt: now() };
    const dedup = (list.recentlyChecked || []).filter((x) => normalize(x.name) !== normalize(item.name));
    list.recentlyChecked = [rc, ...dedup].slice(0, 20);
    // Record history entry
    recordHistoryEntry(item, list);
  }
  saveState();
  render();
}

/* Re-add a recently checked item by id */
function reAddRecent(recentId) {
  const list = activeList();
  const rc = (list.recentlyChecked || []).find((x) => x.id === recentId);
  if (!rc) return;
  addItemToActiveList({ name: rc.name, qty: rc.qty || "", cat: rc.cat || guessCatByName(rc.name), persistToCatalog: true });
}

/* Add or update a catalog entry; used when editing icons */
function createOrUpdateCatalogItem({ name, cat }) {
  ensureCatalogEntry(name, cat);
  saveState();
}

/* Rendering functions */
function render() {
  // Update nav active states
  navBtns.forEach((btn) => btn.classList.remove("is-active"));
  // Disable nav buttons that require Pro subscription
  navBtns.forEach((btn) => {
    const dis = !state.isPro && (btn.dataset.screen === 'recipes' || btn.dataset.screen === 'inspire');
    btn.classList.toggle('disabled', dis);
  });
  // Render sections
  renderList();
  renderRecent();
  renderDrawer();
  renderSearchOverlay();
  renderRecipes();
  renderInspiration();
  renderHistory();
  renderProfile();
  // Update pro state class on body for visual toggles
  document.body.classList.toggle('is-pro', state.isPro);
}

function renderList() {
  const list = activeList();
  activeListName.textContent = list?.name || "Zuhause";
  itemsList.innerHTML = "";
  if (!list) return;
  const open = list.items.filter((i) => !i.checked);
  const done = list.items.filter((i) => i.checked);
  const all = [...open, ...done];
  all.forEach((item) => {
    const wrap = document.createElement("div");
    wrap.innerHTML = rowTemplate({ name: item.name, qty: item.qty, cat: item.cat, checked: item.checked });
    const el = wrap.firstElementChild;
    el.addEventListener("click", () => toggleItem(item.id));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleItem(item.id); }
    });
    // Context menu for editing catalog icon
    el.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      openItemSheet({ title: "Artikel (Katalog) bearbeiten", mode: "editCatalog", prefill: { name: item.name, qty: item.qty, cat: item.cat || guessCatByName(item.name) }, catalogKey: normalize(item.name) });
    });
    itemsList.appendChild(el);
  });
}

function renderRecent() {
  const list = activeList();
  recentList.innerHTML = "";
  (list.recentlyChecked || []).forEach((rc) => {
    const wrap = document.createElement("div");
    wrap.innerHTML = rowTemplate({ name: rc.name, qty: rc.qty || "", cat: rc.cat || guessCatByName(rc.name), checked: rc.checked, rightMode: "plus" });
    const el = wrap.firstElementChild;
    el.addEventListener("click", () => reAddRecent(rc.id));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); reAddRecent(rc.id); }
    });
    recentList.appendChild(el);
  });
  if (!(list.recentlyChecked || []).length) {
    const empty = document.createElement("div");
    empty.className = "row-item";
    empty.innerHTML = `<div class="row-main"><div class="row-sub">Noch nichts abgehakt.</div></div>`;
    recentList.appendChild(empty);
  }
}

function renderDrawer() {
  listsDrawer.innerHTML = "";
  state.lists.forEach((l) => {
    const el = document.createElement("div");
    el.className = "drawer-item" + (l.id === state.activeListId ? " is-active" : "");
    const openCount = l.items.filter((i) => !i.checked).length;
    el.innerHTML = `
      <div>
        <div class="name">${escapeHtml(l.name)}</div>
        <div class="meta">${openCount} offen</div>
      </div>
      <div class="meta">›</div>`;
    el.addEventListener("click", () => {
      state.activeListId = l.id;
      saveState();
      render();
      closeDrawer();
    });
    listsDrawer.appendChild(el);
  });
}

/* Search overlay rendering and suggestion handling */
function renderSearchOverlay() {
  const queryRaw = searchInput.value || "";
  const q = normalize(queryRaw);
  const list = activeList();
  // ACTIONS
  searchActions.innerHTML = "";
  // Quick add: if in catalog, add directly; else open item sheet for icon selection
  const quickAdd = () => {
    const txt = queryRaw.trim();
    if (!txt) return;
    const hit = catalogFindByName(txt);
    if (hit) {
      addItemToActiveList({ name: txt, qty: "", cat: hit.cat, persistToCatalog: true });
      searchInput.value = "";
      renderSearchOverlay();
      closeOverlay();
    } else {
      openItemSheet({ title: "Eigenen Artikel hinzufügen", mode: "add", prefill: { name: txt, qty: "", cat: guessCatByName(txt) || "other" }, catalogKey: null });
    }
  };
  searchActions.appendChild(chip(`+ "${queryRaw.trim() || "Artikel"}"`, quickAdd, "primary"));
  // Always show custom add
  searchActions.appendChild(chip("Eigenen Artikel…", () => {
    openItemSheet({ title: "Eigenen Artikel hinzufügen", mode: "add", prefill: { name: queryRaw.trim(), qty: "", cat: guessCatByName(queryRaw.trim()) || "other" }, catalogKey: null });
  }));
  // New recipe or pro gating
  if (state.isPro) {
    searchActions.appendChild(chip("Neues Rezept", async () => {
      const title = await ask("Rezeptname", queryRaw.trim() || "Neues Rezept");
      if (!title) return;
      const rec = { id: generateId("rec"), title, ingredients: [] };
      state.recipes.unshift(rec);
      state.activeRecipeId = rec.id;
      saveState();
      render();
      closeOverlay();
      setScreen("recipes");
    }));
  } else {
    // Show pro hint for recipe creation
    searchActions.appendChild(chip("Rezepte (Pro)", () => {
      setScreen('profile');
      closeOverlay();
    }, 'ghost'));
  }
  // SUGGESTIONS from catalog & recent
  const pool = [
    ...(state.catalog || []).map((x) => ({ name: x.name, cat: x.cat, kind: "catalog" })),
    ...((list?.recentlyChecked || []).map((x) => ({ name: x.name, cat: x.cat, kind: "recent" }))),
  ];
  const uniq = new Map();
  pool.forEach((p) => {
    const key = normalize(p.name);
    if (!uniq.has(key)) uniq.set(key, p);
  });
  const suggestions = Array.from(uniq.values()).filter((p) => !q || normalize(p.name).includes(q)).slice(0, 14);
  searchSuggestions.innerHTML = "";
  if (!suggestions.length) {
    searchSuggestions.innerHTML = `<div class="row-item"><div class="row-main"><div class="row-sub">Keine Vorschläge.</div></div></div>`;
  } else {
    suggestions.forEach((s) => {
      const wrap = document.createElement("div");
      wrap.innerHTML = rowTemplate({ name: s.name, qty: "", cat: s.cat || "other", checked: false });
      const el = wrap.firstElementChild;
      el.addEventListener("click", () => {
        // Add using catalog cat
        const hit = catalogFindByName(s.name);
        addItemToActiveList({ name: s.name, qty: "", cat: hit?.cat || s.cat || "other", persistToCatalog: true });
        searchInput.value = "";
        renderSearchOverlay();
        closeOverlay();
      });
      // Edit catalog via context menu
      el.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        openItemSheet({ title: "Artikel (Katalog) bearbeiten", mode: "editCatalog", prefill: { name: s.name, qty: "", cat: s.cat || guessCatByName(s.name) }, catalogKey: normalize(s.name) });
      });
      searchSuggestions.appendChild(el);
    });
  }
  // RECIPES suggestions (gated by Pro)
  searchRecipes.innerHTML = "";
  if (!state.isPro) {
    searchRecipes.innerHTML = `<div class="row-item"><div class="row-main"><div class="row-sub">Rezepte nur für Pro-Abonnenten.</div></div></div>`;
  } else {
    const recipes = (state.recipes || []).filter((r) => !q || normalize(r.title).includes(q) || (r.ingredients || []).some((i) => normalize(i.name).includes(q))).slice(0, 8);
    if (!recipes.length) {
      searchRecipes.innerHTML = `<div class="row-item"><div class="row-main"><div class="row-sub">Keine Rezepte gefunden.</div></div></div>`;
    } else {
      recipes.forEach((r) => {
        const wrap = document.createElement("div");
        wrap.innerHTML = `
          <div class="row-item" role="button" tabindex="0">
            <div class="left-ico" style="background:${ICONS.other.bg}">${ICONS.other.svg}</div>
            <div class="row-main">
              <div class="row-title">${escapeHtml(r.title)}</div>
              <div class="row-sub">${(r.ingredients || []).length} Zutaten</div>
            </div>
            <div class="row-right">
              <div class="chip primary" style="padding:8px 10px;">Öffnen</div>
            </div>
          </div>
        `;
        const el = wrap.firstElementChild;
        el.addEventListener("click", () => {
          state.activeRecipeId = r.id;
          saveState();
          render();
          closeOverlay();
          setScreen("recipes");
        });
        searchRecipes.appendChild(el);
      });
    }
  }
}

function renderRecipes() {
  const rec = activeRecipe();
  recipesList.innerHTML = "";
  (state.recipes || []).forEach((r) => {
    const el = document.createElement("div");
    el.className = "row-item";
    el.innerHTML = `
      <div class="row-main">
        <div class="row-title">${escapeHtml(r.title)}</div>
        <div class="row-sub">${(r.ingredients || []).length} Zutaten</div>
      </div>
      <div class="row-right"><div class="row-sub">›</div></div>`;
    el.addEventListener("click", () => {
      state.activeRecipeId = r.id;
      saveState();
      render();
    });
    recipesList.appendChild(el);
  });
  if (rec) {
    recipeTitle.textContent = rec.title;
    ingredientsList.innerHTML = "";
    (rec.ingredients || []).forEach((ing) => {
      const wrap = document.createElement("div");
      wrap.innerHTML = rowTemplate({ name: ing.name, qty: ing.qty || "", cat: ing.cat || guessCatByName(ing.name), checked: false });
      const el = wrap.firstElementChild;
      // remove ingredient by tap
      el.addEventListener("click", () => {
        rec.ingredients = rec.ingredients.filter((x) => x.id !== ing.id);
        saveState();
        render();
      });
      ingredientsList.appendChild(el);
    });
    if (!(rec.ingredients || []).length) {
      ingredientsList.innerHTML = `<div class="row-item"><div class="row-main"><div class="row-sub">Noch keine Zutaten. Tippe oben, um welche hinzuzufügen.</div></div></div>`;
    }
  }
}

/* Inspiration rendering */
function renderInspiration() {
  inspirationList.innerHTML = "";
  (state.inspirations || []).forEach((insp) => {
    const card = document.createElement("div");
    card.className = "inspire-card";
    // Build card content
    card.innerHTML = `
      <div class="inspire-head">
        <div class="inspire-title">${escapeHtml(insp.title)}</div>
        <button class="heart-btn" data-id="${insp.id}" type="button" aria-label="Like">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <span>${insp.hearts}</span>
        </button>
      </div>
      <div class="inspire-sub">${escapeHtml(insp.ingredients.map((i) => (i.qty ? i.qty + ' ' + i.name : i.name)).join(', '))}</div>
      <div class="inspire-actions">
        <button class="add-btn" data-id="${insp.id}" type="button">+ Zur Liste</button>
      </div>
    `;
    // Heart click
    const heartBtn = card.querySelector('.heart-btn');
    heartBtn.addEventListener('click', () => {
      const target = state.inspirations.find((x) => x.id === insp.id);
      if (!target) return;
      target.hearts = (target.hearts || 0) + 1;
      // Add to recipes if not already present
      if (!state.recipes.some((r) => normalize(r.title) === normalize(target.title))) {
        const newRec = { id: generateId('rec'), title: target.title, ingredients: target.ingredients.map((ing) => ({ ...ing, id: generateId('ing') })) };
        state.recipes.unshift(newRec);
      }
      saveState();
      render();
    });
    // Add to list click
    const addBtn = card.querySelector('.add-btn');
    addBtn.addEventListener('click', () => {
      const target = state.inspirations.find((x) => x.id === insp.id);
      if (!target) return;
      // ensure catalog entries and add each ingredient to list
      target.ingredients.forEach((ing) => {
        ensureCatalogEntry(ing.name, ing.cat || guessCatByName(ing.name));
        addItemToActiveList({ name: ing.name, qty: ing.qty || '', cat: ing.cat || guessCatByName(ing.name), persistToCatalog: true });
      });
    });
    inspirationList.appendChild(card);
  });
}

/* History rendering: show entries from last 14 days with date */
function renderHistory() {
  historyList.innerHTML = "";
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);
  const entries = (state.history || []).filter((h) => {
    return new Date(h.purchasedAt) >= cutoff;
  });
  if (!entries.length) {
    const empty = document.createElement('div');
    empty.className = 'row-item';
    empty.innerHTML = `<div class="row-main"><div class="row-sub">Keine Einkäufe in den letzten 14 Tagen.</div></div>`;
    historyList.appendChild(empty);
    return;
  }
  entries.forEach((h) => {
    const wrap = document.createElement('div');
    wrap.innerHTML = rowTemplate({ name: h.name, qty: h.qty || '', cat: h.cat || guessCatByName(h.name), checked: true, subText: `Eingekauft am ${formatDate(h.purchasedAt)}` });
    const el = wrap.firstElementChild;
    el.classList.add('history-item');
    historyList.appendChild(el);
  });
}

/* Profile rendering */
function renderProfile() {
  const p = state.profile || {};
  const initial = (p.name || 'U').trim().slice(0, 1).toUpperCase();
  avatar.textContent = initial;
  profileNameLabel.textContent = p.name || 'User';
  profileSubLabel.textContent = `${p.household || 'Haushalt'} • ${p.diet || 'Ernährung'} • ${p.store || 'Lieblingsladen'}`;
  profileName.value = p.name || 'User';
  profileHousehold.value = p.household || '';
  profileDiet.value = p.diet || 'omnivor';
  profileStore.value = p.store || '';

  // Pro UI updates
  if (state.isPro) {
    cardFree.classList.remove('selected');
    cardPro.classList.add('selected');
    btnProAction.textContent = "Abo verwalten";
    btnProAction.classList.add('ghost');
  } else {
    cardFree.classList.add('selected');
    cardPro.classList.remove('selected');
    btnProAction.textContent = "Pro aktivieren";
    btnProAction.classList.remove('ghost');
  }
}

/* Navigation: set screen and update nav active states */
function setScreen(screen) {
  const screens = { list: screenList, recipes: screenRecipes, inspire: screenInspire, history: screenHistory, profile: screenProfile };
  Object.entries(screens).forEach(([key, el]) => {
    el.classList.toggle('hidden', key !== screen);
  });
  navBtns.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.screen === screen));
}

/* Chip builder used in search overlay */
function chip(text, onClick, cls = '') {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `chip ${cls}`.trim();
  b.textContent = text;
  b.addEventListener('click', onClick);
  return b;
}

/* Overlay open/close */
function openOverlay() { searchOverlay.classList.remove('hidden'); }
function closeOverlay() { searchOverlay.classList.add('hidden'); }

/* Drawer open/close */
function openDrawer() { drawerBackdrop.classList.remove('hidden'); drawer.classList.remove('hidden'); }
function closeDrawer() { drawerBackdrop.classList.add('hidden'); drawer.classList.add('hidden'); }

/* Sheet open/close */
function openSheet() { sheetBackdrop.classList.remove('hidden'); topSheet.classList.remove('hidden'); }
function closeSheet() { sheetBackdrop.classList.add('hidden'); topSheet.classList.add('hidden'); }

/* Item sheet open/close */
function openItemSheet({ title = 'Artikel hinzufügen', mode = 'add', prefill = null, catalogKey = null }) {
  itemSheetMode = mode;
  itemSheetPrefill = prefill;
  itemSheetCatalogKey = catalogKey;
  itemSheetTitle.textContent = title;
  itemName.value = prefill?.name || '';
  itemQty.value = prefill?.qty || '';
  itemCat.value = prefill?.cat || guessCatByName(prefill?.name) || 'other';
  itemSheetBackdrop.classList.remove('hidden');
  itemSheet.classList.remove('hidden');
  setTimeout(() => itemName.focus(), 0);
}
function closeItemSheet() {
  itemSheetBackdrop.classList.add('hidden');
  itemSheet.classList.add('hidden');
}

/* Event listeners */
// Navigation
navBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.screen;
    // Gate pro-only screens: recipes and inspiration
    if (!state.isPro && (target === 'recipes' || target === 'inspire')) {
      // Redirect to profile to encourage upgrade
      setScreen('profile');
      return;
    }
    setScreen(target);
  });
});

// Drawer events
btnDrawer.addEventListener('click', openDrawer);
btnCloseDrawer.addEventListener('click', closeDrawer);
drawerBackdrop.addEventListener('click', closeDrawer);

// Top menu sheet events
btnTopMenu.addEventListener('click', openSheet);
btnCloseSheet.addEventListener('click', closeSheet);
sheetBackdrop.addEventListener('click', closeSheet);
btnGoProfile.addEventListener('click', () => { closeSheet(); setScreen('profile'); });
btnGoRecipes.addEventListener('click', () => {
  closeSheet();
  // Pro gating: only allow navigating to recipes if subscribed
  if (!state.isPro) {
    setScreen('profile');
    return;
  }
  setScreen('recipes');
});
btnRenameList.addEventListener('click', async () => {
  closeSheet();
  const list = activeList();
  const name = await ask('Liste umbenennen', list.name);
  if (!name) return;
  list.name = name;
  saveState();
  render();
});
btnDeleteList.addEventListener('click', () => {
  closeSheet();
  const list = activeList();
  if (state.lists.length === 1) {
    list.items = [];
    list.recentlyChecked = [];
    list.name = 'Zuhause';
  } else {
    state.lists = state.lists.filter((l) => l.id !== list.id);
    state.activeListId = state.lists[0].id;
  }
  saveState();
  render();
});

// Add new list
btnNewList.addEventListener('click', async () => {
  const name = await ask('Neue Liste', 'Neue Liste');
  if (!name) return;
  const list = { id: generateId('list'), name, items: [], recentlyChecked: [] };
  state.lists.unshift(list);
  state.activeListId = list.id;
  saveState();
  render();
  closeDrawer();
});

/* Search overlay behaviour */
fabAdd.addEventListener('click', () => {
  searchInput.focus();
  openOverlay();
});
btnClearSearch.addEventListener('click', () => {
  searchInput.value = '';
  renderSearchOverlay();
  searchInput.focus();
});
btnCloseOverlay.addEventListener('click', closeOverlay);
searchOverlay.addEventListener('click', (e) => {
  if (e.target === searchOverlay) {
    closeOverlay();
  }
});
searchInput.addEventListener('focus', () => {
  openOverlay();
  renderSearchOverlay();
});
searchInput.addEventListener('input', () => {
  renderSearchOverlay();
  if (searchOverlay.classList.contains('hidden')) openOverlay();
});
searchInput.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const txt = searchInput.value.trim();
    if (!txt) return;
    const hit = catalogFindByName(txt);
    if (hit) {
      addItemToActiveList({ name: txt, qty: '', cat: hit.cat, persistToCatalog: true });
      searchInput.value = '';
      renderSearchOverlay();
      closeOverlay();
    } else {
      openItemSheet({ title: 'Eigenen Artikel hinzufügen', mode: 'add', prefill: { name: txt, qty: '', cat: 'other' } });
    }
  }
  if (e.key === 'Escape') {
    closeOverlay();
    searchInput.blur();
  }
});

/* Item sheet events */
btnCloseItemSheet.addEventListener('click', closeItemSheet);
itemSheetBackdrop.addEventListener('click', closeItemSheet);
btnItemCancel.addEventListener('click', closeItemSheet);
itemForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const n = itemName.value.trim();
  const q = itemQty.value.trim();
  const c = itemCat.value;
  if (!n) return;
  // Save to catalog
  createOrUpdateCatalogItem({ name: n, cat: c });
  // Add to list
  addItemToActiveList({ name: n, qty: q, cat: c, persistToCatalog: true });
  // If editing catalog: update existing items across lists
  if (itemSheetMode === 'editCatalog') {
    const key = itemSheetCatalogKey || normalize(n);
    state.lists.forEach((l) => {
      l.items.forEach((it) => {
        if (normalize(it.name) === key) it.cat = c;
      });
      (l.recentlyChecked || []).forEach((rc) => {
        if (normalize(rc.name) === key) rc.cat = c;
      });
    });
  }
  closeItemSheet();
  searchInput.value = '';
  renderSearchOverlay();
  closeOverlay();
  render();
});

/* Recipes page events */
btnNewRecipe.addEventListener('click', async () => {
  const title = await ask('Rezeptname', 'Neues Rezept');
  if (!title) return;
  const rec = { id: generateId('rec'), title, ingredients: [] };
  state.recipes.unshift(rec);
  state.activeRecipeId = rec.id;
  saveState();
  render();
});
ingredientForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const rec = activeRecipe();
  if (!rec) return;
  const name = ingName.value.trim();
  if (!name) return;
  const qty = ingQty.value.trim();
  const cat = guessCatByName(name);
  rec.ingredients.unshift({ id: generateId('ing'), name, qty, cat });
  ingName.value = '';
  ingQty.value = '';
  ingName.focus();
  saveState();
  render();
});
btnAddRecipeToList.addEventListener('click', () => {
  const rec = activeRecipe();
  if (!rec) return;
  (rec.ingredients || []).forEach((ing) => {
    ensureCatalogEntry(ing.name, ing.cat || guessCatByName(ing.name));
    addItemToActiveList({ name: ing.name, qty: ing.qty || '', cat: ing.cat || guessCatByName(ing.name), persistToCatalog: true });
  });
  saveState();
  render();
  setScreen('list');
});

/* Profile events */
profileForm.addEventListener('submit', (e) => {
  e.preventDefault();
  state.profile = {
    name: profileName.value.trim() || 'User',
    household: profileHousehold.value.trim(),
    diet: profileDiet.value,
    store: profileStore.value.trim(),
    updatedAt: now(),
  };
  saveState();
  render();
});
btnResetDemo.addEventListener('click', () => {
  state = demoState();
  saveState();
  render();
});
// Pro Plan interactions
cardFree.addEventListener('click', () => {
  if (state.isPro) {
    // Switch to free
    state.isPro = false;
    saveState();
    render();
  }
});
cardPro.addEventListener('click', () => {
  if (!state.isPro) {
    state.isPro = true;
    saveState();
    render();
  }
});
btnProAction.addEventListener('click', () => {
  // If free, activate pro. If pro, toggle off (cancel)
  state.isPro = !state.isPro;
  saveState();
  render();
});

/* Scroll behavior: make search bar float to top when header is out of view */
window.addEventListener('scroll', () => {
  const threshold = 56; // height of appbar
  if (window.scrollY > threshold) {
    searchWrap.classList.add('floating');
  } else {
    searchWrap.classList.remove('floating');
  }
});

/* Initialization */
(function init() {
  // Ensure state has valid ids
  if (!state.activeListId) state.activeListId = state.lists[0]?.id;
  if (!state.activeRecipeId) state.activeRecipeId = state.recipes[0]?.id;
  saveState();
  setScreen('list');
  render();
})();

// NOTICE //
localStorage.setItem("NOTICE", "Why are you reading out what we write in local storage? Noting to worry but feel free to check.");
