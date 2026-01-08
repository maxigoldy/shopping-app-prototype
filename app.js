/* Mobile-first Shopping List App (green / modern / search-first)
   - Logo top-right opens options sheet (keeps kebab function)
   - Custom item add/edit sheet with category/icon
   - Custom items stored in catalog, reusable across lists
   - List tap toggles checked, "recently checked" re-add with +
   - Persist via localStorage
*/

const KEY = "shopping_app_mobile_v2_green";

/* Categories/icons (simple set; you can extend freely) */
const ICONS = {
  fruit: { bg:"#22C55E", svg:`<svg viewBox="0 0 24 24"><path d="M12 6c3.5 0 6 2.7 6 6 0 4-3.2 8-6 8s-6-4-6-8c0-3.3 2.5-6 6-6Z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M12 6c0-2 1.5-3.5 3.5-4" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`},
  grain: { bg:"#F59E0B", svg:`<svg viewBox="0 0 24 24"><path d="M12 5c4 2 6 5 6 9s-3 5-6 5-6-1-6-5 2-7 6-9Z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M12 7v11" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`},
  dairy: { bg:"#3B82F6", svg:`<svg viewBox="0 0 24 24"><path d="M9 3h6l1 3v15H8V6l1-3Z" fill="none" stroke="white" stroke-width="2" stroke-linejoin="round"/><path d="M8 9h8" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`},
  veg:   { bg:"#06B6D4", svg:`<svg viewBox="0 0 24 24"><path d="M12 20c-5 0-7-3-7-7 0-4 4-8 7-8s7 4 7 8c0 4-2 7-7 7Z" fill="none" stroke="white" stroke-width="2"/><path d="M12 6c0-2 2-3 4-3" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`},
  bread: { bg:"#9CA3AF", svg:`<svg viewBox="0 0 24 24"><path d="M6 11c0-4 3-6 6-6s6 2 6 6v8H6v-8Z" fill="none" stroke="white" stroke-width="2" stroke-linejoin="round"/><path d="M9 8c0 1-1 2-2 2M15 8c0 1 1 2 2 2" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`},
  other: { bg:"#64748B", svg:`<svg viewBox="0 0 24 24"><path d="M12 6v12M6 12h12" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`},
};

const DEMO_CATALOG = [
  { name:"Bananen", cat:"fruit" },
  { name:"Äpfel", cat:"fruit" },
  { name:"Nussmischung", cat:"grain" },
  { name:"Haferflocken", cat:"grain" },
  { name:"Milch", cat:"dairy" },
  { name:"Buttermilch", cat:"dairy" },
  { name:"Käse", cat:"dairy" },
  { name:"Babyspinat", cat:"veg" },
  { name:"Tomaten", cat:"veg" },
  { name:"Gurke", cat:"veg" },
  { name:"Brot", cat:"bread" },
  { name:"Mehl", cat:"grain" },
];

function uid(prefix="id"){
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}
function normalize(s){ return (s||"").toString().trim().toLowerCase(); }
function now(){ return new Date().toISOString(); }

function demoState(){
  const list = {
    id: uid("list"),
    name: "Zuhause",
    items: [
      { id: uid("it"), name:"Bananen", qty:"4", cat:"fruit", checked:false, updatedAt: now() },
      { id: uid("it"), name:"Nussmischung", qty:"", cat:"grain", checked:false, updatedAt: now() },
      { id: uid("it"), name:"Milch", qty:"3L, 1,5%", cat:"dairy", checked:false, updatedAt: now() },
    ],
    recentlyChecked: [
      { id: uid("rc"), name:"Babyspinat", qty:"", cat:"veg", checked:true, updatedAt: now() },
      { id: uid("rc"), name:"Buttermilch", qty:"", cat:"dairy", checked:true, updatedAt: now() },
      { id: uid("rc"), name:"Brot", qty:"", cat:"bread", checked:true, updatedAt: now() },
    ],
  };

  const recipe = {
    id: uid("rec"),
    title: "Pasta Pomodoro",
    ingredients: [
      { id: uid("ing"), name:"Pasta", qty:"1 Pck", cat:"grain" },
      { id: uid("ing"), name:"Tomaten", qty:"800g", cat:"veg" },
      { id: uid("ing"), name:"Olivenöl", qty:"2 EL", cat:"other" },
    ]
  };

  return {
    profile: { name:"Alex Demo", household:"WG", diet:"omnivor", store:"Aldi", updatedAt: now() },
    catalog: DEMO_CATALOG,
    lists: [list, { id: uid("list"), name:"Büro", items: [], recentlyChecked: [] }],
    activeListId: list.id,
    recipes: [recipe],
    activeRecipeId: recipe.id,
  };
}

function load(){
  const raw = localStorage.getItem(KEY);
  if (!raw) return demoState();
  try {
    const s = JSON.parse(raw);
    if (!s?.lists?.length) return demoState();
    if (!Array.isArray(s.catalog)) s.catalog = [];
    return s;
  } catch {
    return demoState();
  }
}
function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }

let state = load();

/* DOM */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const activeListName = $("#activeListName");
const itemsList = $("#itemsList");
const recentList = $("#recentList");

const searchInput = $("#searchInput");
const btnClearSearch = $("#btnClearSearch");
const searchOverlay = $("#searchOverlay");
const searchActions = $("#searchActions");
const searchSuggestions = $("#searchSuggestions");
const searchRecipes = $("#searchRecipes");
const btnCloseOverlay = $("#btnCloseOverlay");

const navBtns = $$(".navbtn");
const screenList = $("#screenList");
const screenRecipes = $("#screenRecipes");
const screenProfile = $("#screenProfile");

const fabAdd = $("#fabAdd");

/* Drawer */
const btnDrawer = $("#btnDrawer");
const drawerBackdrop = $("#drawerBackdrop");
const drawer = $("#drawer");
const btnCloseDrawer = $("#btnCloseDrawer");
const listsDrawer = $("#listsDrawer");
const btnNewList = $("#btnNewList");

/* Top sheet */
const btnTopMenu = $("#btnTopMenu");
const sheetBackdrop = $("#sheetBackdrop");
const topSheet = $("#topSheet");
const btnCloseSheet = $("#btnCloseSheet");
const btnRenameList = $("#btnRenameList");
const btnDeleteList = $("#btnDeleteList");
const btnGoProfile = $("#btnGoProfile");
const btnGoRecipes = $("#btnGoRecipes");

/* Item sheet */
const itemSheetBackdrop = $("#itemSheetBackdrop");
const itemSheet = $("#itemSheet");
const itemSheetTitle = $("#itemSheetTitle");
const btnCloseItemSheet = $("#btnCloseItemSheet");
const itemForm = $("#itemForm");
const itemName = $("#itemName");
const itemQty = $("#itemQty");
const itemCat = $("#itemCat");
const btnItemCancel = $("#btnItemCancel");

/* Prompt dialog */
const promptDialog = $("#promptDialog");
const promptForm = $("#promptForm");
const promptTitle = $("#promptTitle");
const promptInput = $("#promptInput");

/* Recipes */
const recipesList = $("#recipesList");
const recipeTitle = $("#recipeTitle");
const ingredientForm = $("#ingredientForm");
const ingName = $("#ingName");
const ingQty = $("#ingQty");
const ingredientsList = $("#ingredientsList");
const btnNewRecipe = $("#btnNewRecipe");
const btnAddRecipeToList = $("#btnAddRecipeToList");

/* Profile */
const avatar = $("#avatar");
const profileNameLabel = $("#profileNameLabel");
const profileSubLabel = $("#profileSubLabel");
const profileForm = $("#profileForm");
const profileName = $("#profileName");
const profileHousehold = $("#profileHousehold");
const profileDiet = $("#profileDiet");
const profileStore = $("#profileStore");
const btnResetDemo = $("#btnResetDemo");

/* transient UI state */
let itemSheetMode = "add";        // "add" | "editCatalog"
let itemSheetPrefill = null;      // {name, qty, cat}
let itemSheetCatalogKey = null;   // normalized name for edit

/* helpers */
function activeList(){
  return state.lists.find(l => l.id === state.activeListId) || state.lists[0];
}
function activeRecipe(){
  return state.recipes.find(r => r.id === state.activeRecipeId) || state.recipes[0];
}
function catalogFindByName(name){
  const k = normalize(name);
  return (state.catalog || []).find(c => normalize(c.name) === k) || null;
}
function guessCatByName(name){
  return catalogFindByName(name)?.cat || "other";
}
function ensureCatalogEntry(name, cat){
  const k = normalize(name);
  if (!k) return;
  const hit = (state.catalog || []).find(c => normalize(c.name) === k);
  if (hit){
    hit.cat = cat || hit.cat || "other";
  } else {
    state.catalog = state.catalog || [];
    state.catalog.unshift({ name: name.trim(), cat: cat || "other" });
  }
}

/* navigation */
function setScreen(screen){
  const map = { list: screenList, recipes: screenRecipes, profile: screenProfile };
  Object.entries(map).forEach(([k, el]) => el.classList.toggle("hidden", k !== screen));
  navBtns.forEach(b => b.classList.toggle("is-active", b.dataset.screen === screen));
}

/* prompt */
function ask(title, value=""){
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
    promptDialog.addEventListener("close", onClose, { once:true });
  });
}

function escapeHtml(s){
  return (s ?? "").toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/* UI sheets */
function openOverlay(){ searchOverlay.classList.remove("hidden"); }
function closeOverlay(){ searchOverlay.classList.add("hidden"); }

function openDrawer(){
  drawerBackdrop.classList.remove("hidden");
  drawer.classList.remove("hidden");
}
function closeDrawer(){
  drawerBackdrop.classList.add("hidden");
  drawer.classList.add("hidden");
}

function openSheet(){
  sheetBackdrop.classList.remove("hidden");
  topSheet.classList.remove("hidden");
}
function closeSheet(){
  sheetBackdrop.classList.add("hidden");
  topSheet.classList.add("hidden");
}

function openItemSheet({ title="Artikel hinzufügen", mode="add", prefill=null, catalogKey=null }){
  itemSheetTitle.textContent = title;
  itemSheetMode = mode;
  itemSheetPrefill = prefill;
  itemSheetCatalogKey = catalogKey;

  itemName.value = prefill?.name || "";
  itemQty.value = prefill?.qty || "";
  itemCat.value = prefill?.cat || guessCatByName(prefill?.name || "") || "other";

  itemSheetBackdrop.classList.remove("hidden");
  itemSheet.classList.remove("hidden");
  setTimeout(() => itemName.focus(), 0);
}
function closeItemSheet(){
  itemSheetBackdrop.classList.add("hidden");
  itemSheet.classList.add("hidden");
}

/* templates */
function rowTemplate({name, qty, cat, checked, rightMode="check"}){
  const icon = ICONS[cat] || ICONS.other;

  const right = rightMode === "plus"
    ? `<div class="plus-pill" aria-label="Hinzufügen">+</div>`
    : `<div class="qty">${qty ? escapeHtml(qty) : ""}</div>
       <div class="circle ${checked ? "checked" : ""}" aria-hidden="true">
         ${checked ? `<svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" fill="none" stroke="white" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ``}
       </div>`;

  return `
    <div class="row-item" role="button" tabindex="0">
      <div class="left-ico" style="background:${icon.bg}">${icon.svg}</div>
      <div class="row-main">
        <div class="row-title">${escapeHtml(name)}</div>
      </div>
      <div class="row-right">${right}</div>
    </div>
  `;
}

/* mutations */
function addItemToActiveList({ name, qty="", cat=null, persistToCatalog=true }){
  const list = activeList();
  const n = (name || "").trim();
  if (!n) return;

  const finalCat = cat || guessCatByName(n) || "other";
  if (persistToCatalog) ensureCatalogEntry(n, finalCat);

  // If item already open -> bump to top, update qty/cat if provided
  const existing = list.items.find(i => normalize(i.name) === normalize(n) && !i.checked);
  if (existing){
    existing.updatedAt = now();
    if (qty) existing.qty = qty.trim();
    if (cat) existing.cat = finalCat;
    list.items = [existing, ...list.items.filter(i => i.id !== existing.id)];
    save(); render();
    return;
  }

  list.items.unshift({
    id: uid("it"),
    name: n,
    qty: (qty || "").trim(),
    cat: finalCat,
    checked: false,
    updatedAt: now()
  });

  save(); render();
}

function toggleItem(itemId){
  const list = activeList();
  const item = list.items.find(i => i.id === itemId);
  if (!item) return;

  item.checked = !item.checked;
  item.updatedAt = now();

  if (item.checked){
    // add to recently checked (dedup by name)
    const rc = { id: uid("rc"), name:item.name, qty:item.qty, cat:item.cat, checked:true, updatedAt: now() };
    const dedup = (list.recentlyChecked || []).filter(x => normalize(x.name) !== normalize(item.name));
    list.recentlyChecked = [rc, ...dedup].slice(0, 20);
  }

  save(); render();
}

function reAddRecent(recentId){
  const list = activeList();
  const rc = (list.recentlyChecked || []).find(x => x.id === recentId);
  if (!rc) return;
  addItemToActiveList({ name: rc.name, qty: rc.qty || "", cat: rc.cat || guessCatByName(rc.name) });
}

function createOrUpdateCatalogItem({ name, cat }){
  const n = (name || "").trim();
  if (!n) return;
  const finalCat = cat || "other";
  ensureCatalogEntry(n, finalCat);
  save();
}

function chip(text, onClick, cls=""){
  const b = document.createElement("button");
  b.type = "button";
  b.className = `chip ${cls}`.trim();
  b.textContent = text;
  b.addEventListener("click", onClick);
  return b;
}

/* render */
function render(){
  const list = activeList();
  activeListName.textContent = list?.name || "Zuhause";
  renderList();
  renderRecent();
  renderDrawer();
  renderSearchOverlay();
  renderRecipes();
  renderProfile();
}

function renderList(){
  const list = activeList();
  if (!list) return;

  const open = list.items.filter(i => !i.checked);
  const done = list.items.filter(i => i.checked);
  const all = [...open, ...done];

  itemsList.innerHTML = "";
  all.forEach(item => {
    const wrap = document.createElement("div");
    wrap.innerHTML = rowTemplate(item);
    const el = wrap.firstElementChild;

    // Tap = toggle (as before)
    el.addEventListener("click", () => toggleItem(item.id));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleItem(item.id); }
    });

    // Long-press / context menu to edit icon/qty quickly (mobile-friendly fallback: right click)
    el.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      openItemSheet({
        title: "Artikel (Katalog) bearbeiten",
        mode: "editCatalog",
        prefill: { name: item.name, qty: item.qty || "", cat: item.cat || guessCatByName(item.name) },
        catalogKey: normalize(item.name)
      });
    });

    itemsList.appendChild(el);
  });
}

function renderRecent(){
  const list = activeList();
  recentList.innerHTML = "";

  (list.recentlyChecked || []).forEach(rc => {
    const wrap = document.createElement("div");
    wrap.innerHTML = rowTemplate({ ...rc, rightMode:"plus" });
    const el = wrap.firstElementChild;
    el.addEventListener("click", () => reAddRecent(rc.id));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); reAddRecent(rc.id); }
    });
    recentList.appendChild(el);
  });

  if (!(list.recentlyChecked || []).length){
    const empty = document.createElement("div");
    empty.className = "row-item";
    empty.innerHTML = `<div class="row-main"><div class="row-sub">Noch nichts abgehakt.</div></div>`;
    recentList.appendChild(empty);
  }
}

function renderDrawer(){
  listsDrawer.innerHTML = "";
  state.lists.forEach(l => {
    const el = document.createElement("div");
    el.className = "drawer-item" + (l.id === state.activeListId ? " is-active" : "");
    const openCount = l.items.filter(i => !i.checked).length;
    el.innerHTML = `
      <div>
        <div class="name">${escapeHtml(l.name)}</div>
        <div class="meta">${openCount} offen</div>
      </div>
      <div class="meta">›</div>
    `;
    el.addEventListener("click", () => {
      state.activeListId = l.id;
      save(); render();
      closeDrawer();
    });
    listsDrawer.appendChild(el);
  });
}

function renderSearchOverlay(){
  const qRaw = searchInput.value || "";
  const q = normalize(qRaw);
  const list = activeList();

  // ACTIONS
  searchActions.innerHTML = "";

  // 1) Quick add (uses catalog cat if exists, otherwise prompts via item sheet)
  searchActions.appendChild(
    chip(`+ "${qRaw.trim() || "Artikel"}"`, () => {
      const txt = qRaw.trim();
      if (!txt) return;

      const hit = catalogFindByName(txt);
      if (hit){
        addItemToActiveList({ name: txt, qty: "", cat: hit.cat, persistToCatalog: true });
        searchInput.value = "";
        renderSearchOverlay();
        closeOverlay();
      } else {
        // new custom -> open item sheet for icon selection
        openItemSheet({
          title: "Eigenen Artikel hinzufügen",
          mode: "add",
          prefill: { name: txt, qty: "", cat: "other" },
          catalogKey: null
        });
      }
    }, "primary")
  );

  // 2) Open custom add sheet (always)
  searchActions.appendChild(
    chip("Eigenen Artikel…", () => {
      openItemSheet({
        title: "Eigenen Artikel hinzufügen",
        mode: "add",
        prefill: { name: qRaw.trim(), qty: "", cat: guessCatByName(qRaw.trim()) || "other" },
        catalogKey: null
      });
    })
  );

  // 3) New recipe
  searchActions.appendChild(
    chip("Neues Rezept", async () => {
      const title = await ask("Rezeptname", qRaw.trim() || "Neues Rezept");
      if (!title) return;
      const rec = { id: uid("rec"), title, ingredients: [] };
      state.recipes.unshift(rec);
      state.activeRecipeId = rec.id;
      save(); render();
      closeOverlay();
      setScreen("recipes");
    })
  );

  // SUGGESTIONS (catalog + recent)
  const pool = [
    ...(state.catalog || []).map(x => ({ name:x.name, cat:x.cat, kind:"catalog" })),
    ...(list?.recentlyChecked || []).map(x => ({ name:x.name, cat:x.cat, kind:"recent" })),
  ];
  const uniq = new Map();
  pool.forEach(p => {
    const k = normalize(p.name);
    if (!uniq.has(k)) uniq.set(k, p);
  });

  const suggestions = Array.from(uniq.values())
    .filter(p => !q || normalize(p.name).includes(q))
    .slice(0, 14);

  searchSuggestions.innerHTML = "";
  if (!suggestions.length){
    searchSuggestions.innerHTML = `<div class="row-item"><div class="row-main"><div class="row-sub">Keine Vorschläge.</div></div></div>`;
  } else {
    suggestions.forEach(s => {
      const wrap = document.createElement("div");
      wrap.innerHTML = rowTemplate({ name:s.name, qty:"", cat:s.cat || "other", checked:false });
      const el = wrap.firstElementChild;

      el.addEventListener("click", () => {
        // add using catalog cat
        const hit = catalogFindByName(s.name);
        addItemToActiveList({ name: s.name, qty: "", cat: hit?.cat || s.cat || "other", persistToCatalog: true });
        searchInput.value = "";
        renderSearchOverlay();
        closeOverlay();
      });

      // edit catalog icon on long press / right click
      el.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        openItemSheet({
          title: "Artikel (Katalog) bearbeiten",
          mode: "editCatalog",
          prefill: { name: s.name, qty: "", cat: s.cat || guessCatByName(s.name) },
          catalogKey: normalize(s.name)
        });
      });

      searchSuggestions.appendChild(el);
    });
  }

  // RECIPES (search by title or ingredient)
  const recipes = (state.recipes || [])
    .filter(r => !q
      || normalize(r.title).includes(q)
      || (r.ingredients || []).some(i => normalize(i.name).includes(q))
    )
    .slice(0, 8);

  searchRecipes.innerHTML = "";
  if (!recipes.length){
    searchRecipes.innerHTML = `<div class="row-item"><div class="row-main"><div class="row-sub">Keine Rezepte gefunden.</div></div></div>`;
  } else {
    recipes.forEach(r => {
      const wrap = document.createElement("div");
      wrap.innerHTML = `
        <div class="row-item" role="button" tabindex="0">
          <div class="left-ico" style="background:${ICONS.other.bg}">${ICONS.other.svg}</div>
          <div class="row-main">
            <div class="row-title">${escapeHtml(r.title)}</div>
            <div class="row-sub">${(r.ingredients||[]).length} Zutaten</div>
          </div>
          <div class="row-right">
            <div class="chip primary" style="padding:8px 10px;">Öffnen</div>
          </div>
        </div>
      `;
      const el = wrap.firstElementChild;
      el.addEventListener("click", () => {
        state.activeRecipeId = r.id;
        save(); render();
        closeOverlay();
        setScreen("recipes");
      });
      searchRecipes.appendChild(el);
    });
  }
}

function renderRecipes(){
  const rec = activeRecipe();
  recipesList.innerHTML = "";

  (state.recipes || []).forEach(r => {
    const el = document.createElement("div");
    el.className = "row-item";
    el.innerHTML = `
      <div class="row-main">
        <div class="row-title">${escapeHtml(r.title)}</div>
        <div class="row-sub">${(r.ingredients||[]).length} Zutaten</div>
      </div>
      <div class="row-right"><div class="row-sub">›</div></div>
    `;
    el.addEventListener("click", () => {
      state.activeRecipeId = r.id;
      save(); render();
    });
    recipesList.appendChild(el);
  });

  if (rec){
    recipeTitle.textContent = rec.title;
    ingredientsList.innerHTML = "";

    (rec.ingredients || []).forEach(ing => {
      const wrap = document.createElement("div");
      wrap.innerHTML = rowTemplate({ name: ing.name, qty: ing.qty || "", cat: ing.cat || guessCatByName(ing.name), checked:false });
      const el = wrap.firstElementChild;

      // tap ingredient to remove
      el.addEventListener("click", () => {
        rec.ingredients = rec.ingredients.filter(x => x.id !== ing.id);
        save(); render();
      });

      ingredientsList.appendChild(el);
    });

    if (!(rec.ingredients || []).length){
      ingredientsList.innerHTML = `<div class="row-item"><div class="row-main"><div class="row-sub">Noch keine Zutaten. Tippe oben, um welche hinzuzufügen.</div></div></div>`;
    }
  }
}

function renderProfile(){
  const p = state.profile || {};
  const initial = (p.name || "U").trim().slice(0,1).toUpperCase();
  avatar.textContent = initial;

  profileNameLabel.textContent = p.name || "User";
  profileSubLabel.textContent = `${p.household || "Haushalt"} • ${p.diet || "Ernährung"} • ${p.store || "Lieblingsladen"}`;

  profileName.value = p.name || "User";
  profileHousehold.value = p.household || "";
  profileDiet.value = p.diet || "omnivor";
  profileStore.value = p.store || "";
}

/* Events */
navBtns.forEach(b => b.addEventListener("click", () => setScreen(b.dataset.screen)));

btnDrawer.addEventListener("click", openDrawer);
btnCloseDrawer.addEventListener("click", closeDrawer);
drawerBackdrop.addEventListener("click", closeDrawer);

btnTopMenu.addEventListener("click", openSheet);      // logo keeps the function!
btnCloseSheet.addEventListener("click", closeSheet);
sheetBackdrop.addEventListener("click", closeSheet);

btnGoProfile.addEventListener("click", () => { closeSheet(); setScreen("profile"); });
btnGoRecipes.addEventListener("click", () => { closeSheet(); setScreen("recipes"); });

btnRenameList.addEventListener("click", async () => {
  closeSheet();
  const list = activeList();
  const name = await ask("Liste umbenennen", list.name);
  if (!name) return;
  list.name = name;
  save(); render();
});

btnDeleteList.addEventListener("click", () => {
  closeSheet();
  const list = activeList();
  if (state.lists.length === 1){
    list.items = [];
    list.recentlyChecked = [];
    list.name = "Zuhause";
  } else {
    state.lists = state.lists.filter(l => l.id !== list.id);
    state.activeListId = state.lists[0].id;
  }
  save(); render();
});

btnNewList.addEventListener("click", async () => {
  const name = await ask("Neue Liste", "Neue Liste");
  if (!name) return;
  const list = { id: uid("list"), name, items: [], recentlyChecked: [] };
  state.lists.unshift(list);
  state.activeListId = list.id;
  save(); render();
  closeDrawer();
});

/* Search overlay behavior */
fabAdd.addEventListener("click", () => { searchInput.focus(); openOverlay(); });

btnClearSearch.addEventListener("click", () => {
  searchInput.value = "";
  renderSearchOverlay();
  searchInput.focus();
});

btnCloseOverlay.addEventListener("click", closeOverlay);

searchInput.addEventListener("focus", () => {
  openOverlay();
  renderSearchOverlay();
});

searchInput.addEventListener("input", () => {
  renderSearchOverlay();
  if (searchOverlay.classList.contains("hidden")) openOverlay();
});

// Enter: if known catalog item -> add directly; else open item sheet (for icon selection)
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter"){
    e.preventDefault();
    const txt = searchInput.value.trim();
    if (!txt) return;

    const hit = catalogFindByName(txt);
    if (hit){
      addItemToActiveList({ name: txt, qty: "", cat: hit.cat, persistToCatalog: true });
      searchInput.value = "";
      renderSearchOverlay();
      closeOverlay();
    } else {
      openItemSheet({
        title: "Eigenen Artikel hinzufügen",
        mode: "add",
        prefill: { name: txt, qty: "", cat: "other" }
      });
    }
  }
  if (e.key === "Escape"){
    closeOverlay();
    searchInput.blur();
  }
});

/* Item sheet events */
btnCloseItemSheet.addEventListener("click", closeItemSheet);
itemSheetBackdrop.addEventListener("click", closeItemSheet);
btnItemCancel.addEventListener("click", closeItemSheet);

itemForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const n = itemName.value.trim();
  const q = itemQty.value.trim();
  const c = itemCat.value;

  if (!n) return;

  // save in catalog for future + other lists
  createOrUpdateCatalogItem({ name: n, cat: c });

  // add to active list now
  addItemToActiveList({ name: n, qty: q, cat: c, persistToCatalog: true });

  // if editing catalog, also update existing open items across ALL lists for consistent icon
  if (itemSheetMode === "editCatalog"){
    const key = itemSheetCatalogKey || normalize(n);
    state.lists.forEach(l => {
      l.items.forEach(it => {
        if (normalize(it.name) === key) it.cat = c;
      });
      (l.recentlyChecked || []).forEach(rc => {
        if (normalize(rc.name) === key) rc.cat = c;
      });
    });
    save();
  }

  closeItemSheet();
  // nice UX: clear search and close overlay
  searchInput.value = "";
  renderSearchOverlay();
  closeOverlay();
  render();
});

/* Recipes */
btnNewRecipe.addEventListener("click", async () => {
  const title = await ask("Rezeptname", "Neues Rezept");
  if (!title) return;
  const rec = { id: uid("rec"), title, ingredients: [] };
  state.recipes.unshift(rec);
  state.activeRecipeId = rec.id;
  save(); render();
});

ingredientForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const rec = activeRecipe();
  if (!rec) return;

  const name = ingName.value.trim();
  if (!name) return;

  const cat = guessCatByName(name);

  rec.ingredients.unshift({
    id: uid("ing"),
    name,
    qty: ingQty.value.trim(),
    cat
  });

  ingName.value = "";
  ingQty.value = "";
  ingName.focus();

  save(); render();
});

btnAddRecipeToList.addEventListener("click", () => {
  const rec = activeRecipe();
  if (!rec) return;
  (rec.ingredients || []).forEach(ing => {
    // ensure ingredient becomes reusable catalog item
    ensureCatalogEntry(ing.name, ing.cat || guessCatByName(ing.name));
    addItemToActiveList({ name: ing.name, qty: ing.qty || "", cat: ing.cat || guessCatByName(ing.name), persistToCatalog: true });
  });
  save(); render();
  setScreen("list");
});

/* Profile */
profileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  state.profile = {
    name: profileName.value.trim() || "User",
    household: profileHousehold.value.trim(),
    diet: profileDiet.value,
    store: profileStore.value.trim(),
    updatedAt: now()
  };
  save(); render();
});

btnResetDemo.addEventListener("click", () => {
  state = demoState();
  save(); render();
});

/* init */
(function init(){
  if (!state.activeListId) state.activeListId = state.lists[0]?.id;
  if (!state.activeRecipeId) state.activeRecipeId = state.recipes[0]?.id;
  if (!Array.isArray(state.catalog)) state.catalog = [];
  save();
  render();
  setScreen("list");
})();