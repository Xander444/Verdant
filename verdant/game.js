(() => {
  "use strict";
  const G = window.Garden;
  const { SPECIES, CATALOG, RARITIES, LOCATIONS, GOALS, SUPPLIES, HOUR } = G;
  const STORE = "verdant-greenhouse-v1";
  const app = document.querySelector("#app");
  const dialog = document.querySelector("#dialog");
  const toast = document.querySelector("#toast");
  const clock = document.querySelector("#local-clock");
  const wallet = document.querySelector("#wallet");
  const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
  const numberFormat = new Intl.NumberFormat();
  const paths = {
    sprout: '<path d="M12 22v-9m0 2C5 15 3 11 3 6c5 0 9 3 9 9Zm0 1c0-7 3-11 9-12 1 6-2 11-9 12Z"/>',
    home: '<path d="M3 10 12 3l9 7v11H3Zm6 11v-7h6v7M12 3v5"/>',
    shop: '<path d="M3 9 5 4h14l2 5v2c0 3-4 3-5 1-1 2-5 2-6 0-1 2-5 2-7 0Zm1 5v7h16v-7M9 21v-6h6v6"/>',
    dna: '<path d="M4 20c10 0 16-6 16-16M4 4c0 10 6 16 16 16M5 8h4m6 8h4M8 19v-4m8-10v4"/>',
    book: '<path d="M12 5v16M3 4h5c2 0 4 1 4 2 0-1 2-2 4-2h5v15h-5c-2 0-4 1-4 2 0-1-2-2-4-2H3Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
    moon: '<path d="M20.8 14.1a9 9 0 0 1-11-11A9 9 0 1 0 20.8 14.1Z"/>',
    sunset: '<path d="M3 17h18M5 21h14M8 17a4 4 0 1 1 8 0M12 3v3m-7 4 2 2m12-2-2 2"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10m2-8h-3a1.5 1.5 0 1 0 0 3h2a1.5 1.5 0 1 1 0 3h-3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    drop: '<path d="M12 3c3 4 6 7 6 11a6 6 0 1 1-12 0c0-4 3-7 6-11Z"/><path d="M9 14c0 2 1 3 3 3"/>',
    heart: '<path d="M12 20 4 12a5 5 0 0 1 8-6 5 5 0 0 1 8 6Z"/>',
    prune: '<circle cx="5.5" cy="5.5" r="2.5"/><circle cx="5.5" cy="18.5" r="2.5"/><path d="m7.5 7.5 13 13m-13-4 13-13m-8 8L10 14"/>',
    fertilizer: '<path d="M8 3h8m-7 0v6l-5 8a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-8V3M7 14h10m-6 3h.01"/>',
    mist: '<path d="M4 7h9m3 0h4M3 12h4m3 0h11M5 17h9m3 0h3"/>',
    trophy: '<path d="M8 4h8v8a4 4 0 0 1-8 0Zm0 2H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 4v4m-4 0h8"/>',
    display: '<path d="M5 14h14v4H5Zm-2 7h18m-3 0v-3M6 21v-3M12 3v7M8 7h8"/>',
    plus: '<path d="M5 12h14m-7-7v14"/>',
    arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
    chevron: '<path d="m8 10 4 4 4-4"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    leaf: '<path d="M5 19c-2-5 1-12 7-13l8-2-2 8c-1 6-7 9-13 7Zm0 0 10-9"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    shelf: '<path d="M3 4v16M21 4v16M3 9h18M3 16h18m-14-7V5h4v4m3 7v-4h3v4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
    tag: '<path d="M3 4h8l10 10-7 7L3 10Z"/><circle cx="7.5" cy="8" r="1"/>',
  };

  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
  const coins = n => `${icon("coin")} <span>${numberFormat.format(n)}</span>`;
  const reward = n => `${icon("coin")} <span>+${numberFormat.format(n)}</span>`;
  const percent = value => Math.floor(value + .000001);
  const countSpecies = () => new Set(state.discovered.map(key => key.split(":")[0])).size;
  const totalPhenotypes = CATALOG.reduce((sum, species) => sum + species.phenotypes.length, 0);
  const activePlant = () => state.plants.find(plant => plant.id === state.selected) || state.plants[0];
  const canRescue = () => !state.plants.length && G.freeSlots(state) > 0 && state.coins < SPECIES.golden.price;
  const tierBadge = species => `<span class="badge rarity-${species.tier}"><i></i>${RARITIES[species.tier]}</span>`;
  const currentPage = () => ["greenhouse", "market", "breeding", "guide"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "greenhouse";
  const button = (label, action, { symbol, extra = "", className = "", disabled = false } = {}) =>
    `<button type="button" class="button ${className}" data-action="${action}" ${extra}${disabled ? " disabled" : ""}>${symbol ? icon(symbol) : ""}${label}</button>`;
  const canvas = (species, { pheno = 0, size = 58, health = 95, large = false } = {}) =>
    `<canvas class="plant-art" width="${large ? 680 : 340}" height="${large ? 610 : 305}" data-species="${species.id}" data-pheno="${pheno}" data-size="${percent(size)}" data-health="${percent(health)}" aria-hidden="true"></canvas>`;

  let state;
  let lastSaved;
  let storageWorks = true;
  let toastTimer;
  let view = { marketFilter: "all", guideFilter: "all", parentA: "", parentB: "" };

  function syncSave() {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw !== lastSaved && raw) {
        const saved = JSON.parse(raw);
        if (saved.version === 1 && Array.isArray(saved.plants) && Array.isArray(saved.seeds) &&
            Array.isArray(saved.discovered) && saved.inventory && saved.history && Array.isArray(saved.claimed) &&
            Number.isFinite(saved.updatedAt) && saved.plants.every(plant => SPECIES[plant.species])) {
          state = saved;
        }
      }
      lastSaved = raw;
    } catch {
      storageWorks = false;
    }
    if (!state) state = G.fresh(Date.now());
  }

  function save() {
    try {
      const raw = JSON.stringify(state);
      localStorage.setItem(STORE, raw);
      lastSaved = raw;
      storageWorks = true;
    } catch {
      storageWorks = false;
    }
  }

  function notify(message) {
    clearTimeout(toastTimer);
    toast.innerHTML = `<span class="toast-icon">${icon("leaf")}</span><span>${message}</span>`;
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 4000);
  }

  function trackRecovery() {
    if (state.history.recovered) return;
    const starter = state.plants.find(plant => plant.id === 1);
    if (starter ? starter.health >= 72 : state.plants.some(plant => plant.health >= 72)) state.history.recovered = true;
  }

  function remaining(until, now) {
    const seconds = Math.max(0, Math.ceil((until - now) / 1000));
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.ceil(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }

  function hero(now) {
    const phase = G.phaseAt(now);
    return `<section class="hero phase-${phase.name.toLowerCase()}">
        <div class="hero-content">
          <span class="hero-time">${icon(phase.icon)} ${phase.name === "Night" ? "The greenhouse at night" : `${phase.name} light`}</span>
          <h1>The Greenhouse</h1>
          <p>Care for your plants, build your collection, and breed rare varieties.</p>
        </div>
      </section>`;
  }

  function metric(label, symbol, value, caption, mood, bar) {
    return `<div class="metric ${mood || ""}">
      <div class="metric-heading"><span>${icon(symbol)} ${label}</span><strong>${value}</strong></div>
      ${bar === undefined ? "" : `<div class="meter"><span style="--value:${percent(bar)}%"></span></div>`}
      <small>${caption}</small>
    </div>`;
  }

  function controlsFor(plant, now) {
    const needs = G.careNeeds(plant, now);
    const canWater = plant.water <= Math.min(needs.dry + 10, 60);
    const timers = { prune: plant.prunedAt === null ? 0 : plant.prunedAt + 12 * HOUR, feed: plant.fedAt === null ? 0 : plant.fedAt + 6 * HOUR,
      mist: plant.mistedAt === null ? 0 : plant.mistedAt + HOUR, tonic: plant.tonicAt === null ? 0 : plant.tonicAt + 2 * HOUR };
    return {
      water: canWater, prune: timers.prune <= now && (plant.quality < 5 || plant.health < 85),
      feed: timers.feed <= now && state.inventory.fertilizer > 0 && plant.nutrients < 84,
      mist: timers.mist <= now && plant.humidity < 83,
      tonic: timers.tonic <= now && state.inventory.tonic > 0 && plant.health < 94,
      timers,
    };
  }

  function careView(plant, now) {
    const species = SPECIES[plant.species];
    const needs = G.careNeeds(plant, now);
    const allowed = controlsFor(plant, now);
    const sick = plant.health < 55;
    const waterMood = plant.water < needs.dry ? "warning" : plant.water > needs.wet ? "warning" : "blue";
    const lightGood = needs.light === plant.location;
    const stage = plant.size >= 83 ? "Mature" : plant.size >= 42 ? "Established" : plant.size >= 23 ? "Young plant" : "Seedling";
    const healthLabel = sick ? "Needs care" : plant.health < 72 ? "Recovering" : "Healthy";
    const healthTip = sick ? "Needs attention" : plant.health < 72 ? "On the mend" : "Doing well";
    const waterTip = plant.water < needs.dry ? "Soil is dry" : plant.water > needs.wet ? "Soil is too wet" : "Moisture is good";
    return `<article class="care-card paper">
      <div class="plant-scene phase-${G.phaseAt(now).name.toLowerCase()}">
        <span class="plant-status ${sick ? "sick" : plant.health >= 72 ? "healthy" : "recovering"}"><i></i>${healthLabel}</span>
        ${canvas(species, { ...plant, large: true })}
        <span class="stage-label">${icon("sprout")} ${stage}${plant.quality ? ` · Shape ${plant.quality}/5` : ""}</span>
      </div>
      <div class="care-body">
        <div class="plant-heading">
          <div>${tierBadge(species)}<h3>${species.name}</h3><p>${species.phenotypes[plant.pheno]}</p></div>
          ${button(icon("book"), "inspect", { className: "icon-button", extra: `data-id="${species.id}" title="Open plant entry" aria-label="Open ${species.name} entry"` })}
        </div>
        <div class="metric-grid">
          ${metric("Health", "heart", `${percent(plant.health)}%`, healthTip, plant.health < 72 ? "warning" : "", plant.health)}
          ${metric("Water", "drop", `${percent(plant.water)}%`, waterTip, waterMood, plant.water)}
          ${metric("Growth", "sprout", `${percent(plant.size)}%`, plant.size >= 42 ? "Breeding size" : "Breeding at 42%", "", plant.size)}
          ${metric("Light", "sun", LOCATIONS[plant.location], lightGood ? "Right for now" : `Move to ${LOCATIONS[needs.light].toLowerCase()}`, lightGood ? "" : "warning")}
          ${needs.humidity ? metric("Humidity", "mist", `${percent(plant.humidity)}%`, plant.humidity < needs.humidity ? "Needs misting" : "Humidity is good", plant.humidity < needs.humidity ? "warning" : "blue", plant.humidity) : ""}
          ${species.tier >= 1 ? metric("Nutrients", "fertilizer", `${percent(plant.nutrients)}%`, plant.nutrients < needs.food ? "Needs fertilizer" : "Nutrients are good", plant.nutrients < needs.food ? "warning" : "", plant.nutrients) : ""}
        </div>
        <div class="care-actions">
          ${button("Water", "water", { symbol: "drop", className: "primary", disabled: !allowed.water, extra: 'title="Water dry soil"' })}
          ${button("Move", "move", { symbol: "sun", extra: 'title="Choose where this plant gets its light"' })}
          ${button("Prune", "prune", { symbol: "prune", disabled: !allowed.prune, extra: `title="${allowed.timers.prune > now ? `Ready in ${remaining(allowed.timers.prune, now)}` : "Trim damaged leaves and improve the plant's shape"}"` })}
          ${button(`Feed <small>${state.inventory.fertilizer}</small>`, "feed", { symbol: "fertilizer", disabled: !allowed.feed, extra: `title="${allowed.timers.feed > now ? `Ready in ${remaining(allowed.timers.feed, now)}` : "Use one dose of fertilizer"}"` })}
          ${needs.humidity ? button("Mist", "mist", { symbol: "mist", disabled: !allowed.mist }) : ""}
          ${state.inventory.tonic ? button(`Tonic <small>${state.inventory.tonic}</small>`, "tonic", { symbol: "heart", disabled: !allowed.tonic }) : ""}
        </div>
        <div class="care-trade">
          ${button(plant.onDisplay ? "Remove from display" : "Put on display", "display", { symbol: "display", className: "text-button" })}
          ${button(`Sell for ${numberFormat.format(G.salePrice(plant))}`, "sell", { symbol: "tag", className: "text-button sell-link" })}
        </div>
      </div>
    </article>`;
  }

  function goalCard() {
    const index = GOALS.findIndex((_, i) => !state.claimed.includes(i));
    if (index < 0) return `<div class="paper goal-card completed"><span class="tile-icon">${icon("trophy")}</span><h3>All goals complete</h3><p>${state.discovered.length} of ${totalPhenotypes} phenotypes discovered.</p><a class="text-link" href="#guide">Open Field Guide ${icon("arrow")}</a></div>`;
    const goal = GOALS[index];
    const done = goal.test(state);
    const description = index === 0 && !state.plants.some(plant => plant.id === 1)
      ? "Bring a plant to 72% health." : goal.description;
    return `<div class="paper goal-card">
      <div class="goal-top"><span class="tile-icon">${icon("trophy")}</span><span class="goal-count">${index + 1} of ${GOALS.length}</span></div>
      <h3>${goal.name}</h3><p>${description}</p>
      <div class="goal-bottom">
        <span class="goal-reward">${reward(goal.reward)}</span>
        ${done ? button("Claim reward", "claim", { className: "primary compact", extra: `data-id="${index}"` }) : `<span class="goal-state"><i></i> In progress</span>`}
      </div>
    </div>`;
  }

  function incomeCard() {
    const displayed = state.plants.filter(plant => plant.onDisplay);
    const rate = displayed.reduce((sum, plant) => sum + G.displayRate(plant), 0);
    const available = Math.floor(state.displayBank + .0000001);
    return `<section class="paper income-card">
      <div class="income-heading"><span class="tile-icon">${icon("display")}</span><div><h3>Display earnings</h3>
        <p>${displayed.length ? `${displayed.length} on display · ${rate.toFixed(2)} coins/hr` : "Put a plant on display to earn coins."}</p></div></div>
      <div class="income-bottom"><span class="income-coins">${coins(available)}</span>
        ${button("Collect", "collect", { className: "compact", disabled: available < 1 })}</div>
    </section>`;
  }

  function shelfView(plant, now) {
    const slots = G.freeSlots(state);
    const plants = state.plants.map(item => {
      const species = SPECIES[item.species];
      return `<button class="shelf-plant ${item === plant ? "selected" : ""}" type="button" data-action="select" data-id="${item.id}" aria-pressed="${item === plant}">
        <span class="shelf-preview">${canvas(species, item)}${item.onDisplay ? `<span class="shelf-display" title="On display">${icon("display")}</span>` : ""}</span>
        <span><strong>${species.name}</strong><small>${species.phenotypes[item.pheno]}</small></span>
      </button>`;
    }).join("");
    const seeds = state.seeds.map(seed => `<a class="shelf-plant seed-slot" href="#breeding"><span class="shelf-placeholder">${icon("sprout")}</span><span><strong>${seed.readyAt <= now ? "Ready to pot" : "Seed tray"}</strong><small>Reserved space</small></span></a>`).join("");
    const empty = slots > 0 ? `<a class="shelf-plant empty-slot" href="#market"><span class="shelf-placeholder">${icon("plus")}</span><span><strong>Empty shelf</strong><small>${slots} open ${slots === 1 ? "space" : "spaces"}</small></span></a>` : "";
    return `<section class="shelf-section" aria-labelledby="shelf-title">
      <div class="section-heading"><div class="heading-with-count"><h2 id="shelf-title">Your shelves</h2><span class="count-pill">${state.capacity - slots} / ${state.capacity} spaces</span></div><a class="text-link" href="#market">${icon("plus")} Expand shelves</a></div>
      <div class="shelf-grid">${plants}${seeds}${empty}</div>
    </section>`;
  }

  function greenhouse(now) {
    const plant = activePlant();
    return `${hero(now)}
      <div class="greenhouse-grid">
        <section aria-labelledby="care-title">
          <div class="section-heading"><h2 id="care-title">Plant care</h2><span class="section-note">${icon("clock")} Tracks your local time</span></div>
          ${plant ? careView(plant, now) : `<div class="paper empty-state"><span class="tile-icon">${icon("sprout")}</span><h3>Your shelves are ready</h3>
            <p>${canRescue() ? "Adopt a free rescue pothos." : G.freeSlots(state) ? "Find a new plant at the market." : "Your shelf spaces are reserved for seedlings."}</p>
            ${canRescue() ? button("Adopt rescue plant", "rescue", { symbol: "sprout", className: "primary" }) :
              G.freeSlots(state) ? '<a class="button primary" href="#market">Open market</a>' : '<a class="button primary" href="#breeding">Open breeding room</a>'}</div>`}
        </section>
        <aside aria-labelledby="goals-title">
          <div class="section-heading"><h2 id="goals-title">Grower goals</h2></div>
          ${goalCard()}${incomeCard()}
        </aside>
      </div>${shelfView(plant, now)}`;
  }

  function pageIntro(title, description, symbol, stat = "") {
    return `<header class="page-intro"><div><span class="page-icon">${icon(symbol)}</span><h1>${title}</h1><p>${description}</p></div>${stat}</header>`;
  }

  function rarityFilter(name, selected) {
    return `<label class="filter">Rarity
      <select id="${name}" data-filter="${name}"><option value="all">All rarities</option>
      ${RARITIES.map((rarity, tier) => `<option value="${tier}"${String(tier) === selected ? " selected" : ""}>${rarity}</option>`).join("")}</select></label>`;
  }

  function market() {
    const spaceCost = G.shelfCost(state);
    const open = G.freeSlots(state);
    const stock = CATALOG.filter(species => view.marketFilter === "all" || String(species.tier) === view.marketFilter);
    const supplies = Object.entries(SUPPLIES).map(([id, item]) => `<article class="paper supply-card">
      <span class="tile-icon">${icon(item.icon)}</span><div><h3>${item.name}</h3><p>${item.description}</p><small>${state.inventory[id]} in stock</small></div>
      ${button(coins(item.cost), "buy-supply", { extra: `data-id="${id}" aria-label="Buy ${item.name} for ${item.cost} coins"`, disabled: state.coins < item.cost })}</article>`).join("");
    return `${pageIntro("The Market", "Find a new plant, stock up on supplies, or expand your shelves.", "shop", `<span class="count-pill">${icon("shelf")} ${open} open ${open === 1 ? "space" : "spaces"}</span>`)}
      <div class="supplies-grid">
        <article class="paper supply-card" id="shelf-upgrade"><span class="tile-icon">${icon("shelf")}</span>
          <div><h3>Extra shelf space</h3><p>Add two spaces for plants or seedlings.</p><small>${state.capacity} total spaces</small></div>
          ${button(coins(spaceCost), "expand", { extra: `aria-label="Buy two shelf spaces for ${spaceCost} coins"`, disabled: state.coins < spaceCost })}</article>
        ${supplies}
      </div>
      <section aria-labelledby="stock-title">
        <div class="section-heading listing-heading"><h2 id="stock-title">Plants for sale</h2>${rarityFilter("marketFilter", view.marketFilter)}</div>
        ${open ? "" : `<p class="inline-note">${icon("info")} Your shelves are full. Add spaces or sell a plant to make room.</p>`}
        <div class="catalog-grid">${stock.map(species => {
          const unlocked = G.marketUnlocked(state, species);
          return `<article class="paper catalog-card">
            <div class="catalog-art rarity-back-${species.tier}">${tierBadge(species)}${canvas(species, { size: 59 })}</div>
            <div class="catalog-copy"><h3>${species.name}</h3><p>${species.note}</p>
            ${unlocked ? button(`Buy ${coins(species.price)}`, "buy-plant", {
              className: "catalog-button", extra: `data-id="${species.id}" aria-label="Buy ${species.name} for ${species.price} coins"`, disabled: !open || state.coins < species.price,
            }) : `<span class="locked">${icon("lock")} Discover ${[0, 3, 9, 15][species.tier]} species or breed this plant</span>`}</div>
          </article>`;
        }).join("")}</div>
      </section>`;
  }

  function breeding(now) {
    const findParent = id => state.plants.find(plant => String(plant.id) === id);
    const a = findParent(view.parentA);
    const b = findParent(view.parentB);
    const valid = a && b && a !== b;
    const target = valid ? G.crossPreview(a, b) : null;
    const problem = valid ? G.parentProblem(a, now) || G.parentProblem(b, now) : "";
    const parentSlot = (id, label, plant, other) => {
      const species = plant && SPECIES[plant.species];
      return `<div class="parent-slot">
        <label for="${id}">${label}</label>
        <select id="${id}" data-filter="${id}">
          <option value="">Choose a plant</option>
          ${state.plants.map(item => {
            const option = SPECIES[item.species];
            const blocked = G.parentProblem(item, now);
            return `<option value="${item.id}"${item === plant ? " selected" : ""}${item === other ? " disabled" : ""}>${option.name} #${item.id}${blocked ? ` · ${blocked}` : ""}</option>`;
          }).join("")}
        </select>
        <div class="parent-preview">${species ? canvas(species, plant) : icon("sprout")}</div>
        ${species ? `<p class="parent-detail">${species.phenotypes[plant.pheno]} · ${RARITIES[species.tier]}</p>` : ""}
      </div>`;
    };

    const crossNote = !valid ? "Choose two plants with at least 72% health and 42% growth."
      : target ? `<strong>72% chance of ${target.name}</strong> · ${RARITIES[target.tier]}<br>Otherwise, a species from either parent.`
      : a.species === b.species ? `<strong>${SPECIES[a.species].name}</strong><br>Seedlings can inherit or develop a different phenotype.`
      : "<strong>Either parent's species</strong><br>Pair different species of the same rarity to breed up a tier.";
    const cause = problem || (!G.freeSlots(state) ? "Open a shelf space for the seedling." : state.coins < G.CROSS_COST ? "You need 5 coins to start a cross." : "");
    return `${pageIntro("Breeding Room", "Pair healthy plants to discover new species and phenotypes.", "dna")}
      <div class="breeding-grid">
        <section class="paper cross-card"><div class="section-heading"><h2>Choose parents</h2><span class="count-pill">${coins(G.CROSS_COST)} per cross</span></div>
          <div class="parents">${parentSlot("parentA", "First parent", a, b)}<span class="cross-plus">${icon("plus")}</span>${parentSlot("parentB", "Second parent", b, a)}</div>
          <div class="cross-note">${icon("info")}<p>${crossNote}</p></div>
          ${cause ? `<p class="breeding-warning">${cause}</p>` : ""}
          ${button("Start cross", "breed", { symbol: "dna", className: "primary", disabled: !valid || Boolean(cause) })}
        </section>
        <section class="paper nursery-card">
          <div class="section-heading"><h2>Seed tray</h2><span class="count-pill">${state.seeds.length} growing</span></div>
          ${state.seeds.length ? `<div class="seed-list">${state.seeds.map(seed => {
            const ready = seed.readyAt <= now;
            return `<article class="seed-row"><span class="tile-icon">${icon("sprout")}</span><div><h3>${ready ? "Ready to pot" : "Germinating"}</h3>
              <p>${ready ? SPECIES[seed.species].name : `${remaining(seed.readyAt, now)} remaining`}</p></div>
              ${button("Pot seedling", "pot", { className: "compact", extra: `data-id="${seed.id}"`, disabled: !ready })}</article>`;
          }).join("")}</div>` : `<div class="nursery-empty"><span class="tile-icon">${icon("leaf")}</span><h3>The tray is empty</h3><p>New crosses will germinate here. Each seed reserves one shelf space.</p></div>`}
        </section>
      </div>`;
  }

  function guide() {
    const stock = CATALOG.filter(species => view.guideFilter === "all" || String(species.tier) === view.guideFilter);
    return `${pageIntro("Field Guide", "Track the species and phenotypes you discover as you grow your collection.", "book",
      `<div class="guide-count"><strong>${countSpecies()} / ${CATALOG.length}</strong><span>Species discovered</span></div>`)}
      <section aria-labelledby="catalog-title">
        <div class="section-heading listing-heading"><div class="heading-with-count"><h2 id="catalog-title">Plant catalog</h2><span class="count-pill">${state.discovered.length} / ${totalPhenotypes} phenotypes</span></div>${rarityFilter("guideFilter", view.guideFilter)}</div>
        <div class="catalog-grid">${stock.map(species => {
          const found = species.phenotypes.map((_, i) => i).filter(i => state.discovered.includes(`${species.id}:${i}`));
          return `<article class="paper catalog-card">
            <div class="catalog-art rarity-back-${species.tier}">${tierBadge(species)}${canvas(species, { pheno: found[0] || 0 })}</div>
            <div class="catalog-copy"><h3>${species.name}</h3><p>${found.length} / ${species.phenotypes.length} phenotypes discovered</p>
            ${button(`View entry ${icon("arrow")}`, "inspect", { className: "catalog-button", extra: `data-id="${species.id}"` })}</div>
          </article>`;
        }).join("")}</div>
      </section>`;
  }

  function render() {
    const now = Date.now();
    const page = currentPage();
    const focus = app.contains(document.activeElement) ? document.activeElement : null;
    const previous = focus ? { action: focus.dataset.action, id: focus.dataset.id, elementId: focus.id } : null;
    const date = new Date(now);
    clock.innerHTML = `${icon("clock")} <span>${timeFormat.format(date)}</span>`;
    clock.dateTime = date.toISOString();
    wallet.innerHTML = coins(state.coins);
    wallet.setAttribute("aria-label", `${state.coins} coins`);
    for (const link of document.querySelectorAll("[data-page]")) {
      if (link.dataset.page === page) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
    const content = page === "market" ? market() : page === "breeding" ? breeding(now) : page === "guide" ? guide() : greenhouse(now);
    const html = `${content}<footer class="footer">${icon(storageWorks ? "check" : "info")} ${storageWorks ? "Progress saved on this browser" : "Browser saving is unavailable"}</footer>`;
    if (html === view.markup) return;
    view.markup = html;
    app.innerHTML = html;
    paint(app);
    if (previous) {
      const next = previous.elementId ? document.getElementById(previous.elementId) :
        previous.action && Array.from(app.querySelectorAll("[data-action]")).find(element =>
          element.dataset.action === previous.action && element.dataset.id === previous.id);
      if (next && !next.disabled) next.focus({ preventScroll: true });
    }
  }

  function paint(root) {
    for (const element of root.querySelectorAll(".plant-art")) window.PlantArt.draw(element);
  }

  function openDialog(title, content, kicker = "") {
    dialog.innerHTML = `<div class="dialog-inner"><header>
      <div>${kicker}<h2 id="dialog-title">${title}</h2></div>
      ${button(icon("close"), "close", { className: "icon-button", extra: 'aria-label="Close dialog" autofocus' })}
      </header>${content}</div>`;
    paint(dialog);
    if (!dialog.open) dialog.showModal();
  }

  function showEntry(species) {
    const variants = species.phenotypes.map((name, i) => {
      const found = state.discovered.includes(`${species.id}:${i}`);
      return `<div class="phenotype ${found ? "discovered" : ""}"><span class="phenotype-art">${found ? canvas(species, { pheno: i, size: 53 }) : icon("leaf")}</span>
        <div><strong>${name}</strong><small>${found ? "Discovered" : "Undiscovered"}</small></div></div>`;
    }).join("");
    const needs = G.careNeeds({ species: species.id }, Date.now());
    openDialog(species.name, `<p>${species.note}</p>
      <p class="species-needs">${icon("sun")} ${LOCATIONS[needs.light]} now · Water below ${needs.dry}%${needs.humidity ? ` · Mist below ${needs.humidity}% humidity` : ""}</p>
      <h3>Phenotypes</h3><div class="phenotypes">${variants}</div>`, tierBadge(species));
  }

  function showMove(plant, now) {
    const best = G.careNeeds(plant, now).light;
    const phase = G.phaseAt(now).name.toLowerCase();
    openDialog("Move plant", `<p>Choose a spot for the ${phase}. Light needs change over the day.</p>
      <div class="move-options">${LOCATIONS.map((spot, i) => button(`${spot}${i === best ? " <small>Recommended now</small>" : ""}${i === plant.location ? " <small>Current</small>" : ""}`, "place", {
        symbol: ["moon", "sun", "sun"][i], extra: `data-id="${i}" data-plant="${plant.id}"`, disabled: i === plant.location,
        className: i === best ? "recommended" : "",
      })).join("")}</div>`);
  }

  function careAction(action, plant, now) {
    const allowed = controlsFor(plant, now);
    if (!allowed[action]) return "That care action is unavailable right now.";
    const needs = G.careNeeds(plant, now);
    const increase = (key, amount) => { plant[key] = G.clamp(plant[key] + amount); };
    switch (action) {
      case "water":
        if (plant.water < needs.dry) increase("health", 17);
        const amount = SPECIES[plant.species].shape === "succulent" ? 33 : 43;
        increase("water", Math.min(amount, needs.wet - 4 - plant.water));
        return "Plant watered.";
      case "prune":
        increase("health", plant.health < 72 ? 10 : 3);
        plant.quality = Math.min(5, plant.quality + 1);
        increase("size", -Math.min(3, Math.max(0, plant.size - 8)));
        plant.prunedAt = now;
        return "Plant pruned. A better shape raises its value.";
      case "feed":
        state.inventory.fertilizer--;
        plant.fedAt = now;
        increase("nutrients", 36);
        increase("size", plant.health >= 55 ? 18 : 7);
        increase("health", 6);
        return "Fertilizer applied. New growth is showing.";
      case "mist":
        if (plant.humidity < needs.humidity) increase("health", 6);
        increase("humidity", 32);
        plant.mistedAt = now;
        return "Leaves misted.";
      case "tonic":
        state.inventory.tonic--;
        plant.tonicAt = now;
        increase("health", 19);
        return "Root tonic applied.";
    }
  }

  function perform(action, target, now, plantId) {
    const id = target.dataset.id;
    const plant = state.plants.find(item => item.id === plantId);
    const species = SPECIES[id];
    switch (action) {
      case "close":
        dialog.close();
        return;
      case "inspect":
        if (species) showEntry(species);
        return;
      case "select":
        if (state.plants.some(item => item.id === Number(id))) state.selected = Number(id);
        return;
      case "move":
        if (plant) showMove(plant, now);
        return;
      case "place": {
        const moved = state.plants.find(item => item.id === Number(target.dataset.plant));
        const spot = Number(id);
        dialog.close();
        if (!moved || !LOCATIONS[spot] || moved.location === spot) return;
        const need = G.careNeeds(moved, now).light;
        moved.location = spot;
        if (spot === need) moved.health = G.clamp(moved.health + 10);
        else moved.health = G.clamp(moved.health - 10, 10);
        return `Plant moved to ${LOCATIONS[spot].toLowerCase()}.`;
      }
      case "water":
      case "prune":
      case "feed":
      case "mist":
      case "tonic":
        if (plant) return careAction(action, plant, now);
        return;
      case "display":
        if (!plant) return;
        plant.onDisplay = !plant.onDisplay;
        return plant.onDisplay ? `${SPECIES[plant.species].name} is on display.` : "Plant removed from display.";
      case "collect": {
        const available = Math.floor(state.displayBank + .0000001);
        if (available < 1) return;
        state.displayBank = Math.max(0, state.displayBank - available);
        state.coins += available;
        return `Collected ${available} ${available === 1 ? "coin" : "coins"}.`;
      }
      case "sell":
        if (!plant) return;
        openDialog(`Sell ${SPECIES[plant.species].name}?`, `<p>This frees a shelf space. Its phenotype will stay in your Field Guide.</p>
          <div class="dialog-actions">${button("Cancel", "close")}${button(`Sell for ${coins(G.salePrice(plant))}`, "confirm-sell", {
            className: "primary", extra: `data-id="${plant.id}"`,
          })}</div>`);
        return;
      case "confirm-sell": {
        const sold = state.plants.find(item => item.id === Number(id));
        dialog.close();
        if (!sold) return;
        const value = G.salePrice(sold);
        state.coins += value;
        state.plants = state.plants.filter(item => item !== sold);
        return `Sold ${SPECIES[sold.species].name} for ${value} coins.`;
      }
      case "claim": {
        const index = Number(id);
        if (!GOALS[index]?.test(state) || state.claimed.includes(index)) return;
        state.claimed.push(index);
        state.coins += GOALS[index].reward;
        return `Goal complete. You earned ${GOALS[index].reward} coins.`;
      }
      case "expand": {
        const price = G.shelfCost(state);
        if (state.coins < price) return;
        state.coins -= price;
        state.capacity += 2;
        return "Two shelf spaces added.";
      }
      case "buy-supply": {
        const item = SUPPLIES[id];
        if (!item || state.coins < item.cost) return;
        state.coins -= item.cost;
        state.inventory[id] += item.quantity;
        return `${item.name} added to your supplies.`;
      }
      case "buy-plant":
        if (!species || !G.marketUnlocked(state, species) || !G.freeSlots(state) || state.coins < species.price) return;
        G.addPlant(state, species.id, 0, now, "market");
        state.coins -= species.price;
        state.history.bought = true;
        return `${species.name} added to your shelves.`;
      case "rescue":
        if (!canRescue()) return;
        G.addPlant(state, "golden", 0, now, "starter");
        return "Rescue pothos adopted.";
      case "breed": {
        const a = state.plants.find(item => String(item.id) === view.parentA);
        const b = state.plants.find(item => String(item.id) === view.parentB);
        if (!G.breed(state, a, b, now)) return "This pair is unavailable for breeding right now.";
        view.parentA = view.parentB = "";
        return "Cross started. Check the seed tray for progress.";
      }
      case "pot": {
        const seed = state.seeds.find(item => item.id === Number(id));
        const seedling = G.potSeed(state, seed, now);
        if (!seedling) return;
        return `${SPECIES[seedling.species].name} added to your shelves.`;
      }
    }
  }

  document.addEventListener("click", event => {
    const target = event.target.closest("button[data-action]");
    if (!target || target.disabled) return;
    const plantId = activePlant()?.id;
    syncSave();
    const now = Date.now();
    G.advance(state, now);
    const message = perform(target.dataset.action, target, now, plantId);
    trackRecovery();
    save();
    render();
    if (message) notify(message);
  });

  app.addEventListener("change", event => {
    const { filter } = event.target.dataset;
    if (!filter || !Object.hasOwn(view, filter)) return;
    view[filter] = event.target.value;
    render();
  });

  window.addEventListener("hashchange", () => {
    if (dialog.open) dialog.close();
    render();
    window.scrollTo(0, 0);
  });

  function refresh() {
    syncSave();
    G.advance(state, Date.now());
    trackRecovery();
    if (!dialog.open && document.activeElement?.tagName !== "SELECT") render();
  }

  window.addEventListener("storage", event => { if (event.key === STORE) refresh(); });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refresh();
  });
  window.addEventListener("pagehide", () => {
    syncSave();
    G.advance(state, Date.now());
    save();
  });
  for (const element of document.querySelectorAll("[data-icon]")) element.innerHTML = icon(element.dataset.icon);
  syncSave();
  G.advance(state, Date.now());
  trackRecovery();
  save();
  render();
  setInterval(() => { if (!document.hidden) refresh(); }, 5000);
})();
