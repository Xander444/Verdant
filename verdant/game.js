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
  const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
  const numberFormat = new Intl.NumberFormat();
  const oddsFormat = new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 1 });
  const paths = {
    sprout: '<path d="M12 22v-9m0 2C5 15 3 11 3 6c5 0 9 3 9 9Zm0 1c0-7 3-11 9-12 1 6-2 11-9 12Z"/>',
    home: '<path d="M3 10 12 3l9 7v11H3Zm6 11v-7h6v7M12 3v5"/>',
    shop: '<path d="M3 9 5 4h14l2 5v2c0 3-4 3-5 1-1 2-5 2-6 0-1 2-5 2-7 0Zm1 5v7h16v-7M9 21v-6h6v6"/>',
    clipboard: '<path d="M8 5H5v16h14V5h-3M8 3h8v5H8Zm0 9h8m-8 4h6"/>',
    pin: '<path d="m15 4 5 5-4 2-2 6-7-7 6-2 2-4Zm-5 10-5 5"/>',
    dna: '<path d="M4 20c10 0 16-6 16-16M4 4c0 10 6 16 16 16M5 8h4m6 8h4M8 19v-4m8-10v4"/>',
    book: '<path d="M12 5v16M3 4h5c2 0 4 1 4 2 0-1 2-2 4-2h5v15h-5c-2 0-4 1-4 2 0-1-2-2-4-2H3Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
    moon: '<path d="M20.8 14.1a9 9 0 0 1-11-11A9 9 0 1 0 20.8 14.1Z"/>',
    sunset: '<path d="M3 17h18M5 21h14M8 17a4 4 0 1 1 8 0M12 3v3m-7 4 2 2m12-2-2 2"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10m2-8h-3a1.5 1.5 0 1 0 0 3h2a1.5 1.5 0 1 1 0 3h-3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    drop: '<path d="M12 3c3 4 6 7 6 11a6 6 0 1 1-12 0c0-4 3-7 6-11Z"/><path d="M9 14c0 2 1 3 3 3"/>',
    can: '<path d="M7 12h10v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2Zm10 3 4-5-2-1-2 3M7 13a3 3 0 1 0 0 5m2-6V9a3 3 0 0 1 6 0v3m6-7v.01M18 6v.01"/>',
    lamp: '<path d="M12 3v3M8 6h8l4 7H4Zm-4 10-1 2m5-2v4m8-4v4m4-4 1 2"/>',
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
    branch: '<path d="M9 21V10m0 6c0-3 3-5 7-5m-7 1C9 9 7 7 4 7m5 4c0-4 4-7 9-7"/><circle cx="18" cy="4" r="1.4"/><circle cx="4" cy="7" r="1.4"/><circle cx="16" cy="11" r="1.4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
    tag: '<path d="M3 4h8l10 10-7 7L3 10Z"/><circle cx="7.5" cy="8" r="1"/>',
  };

  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
  const coins = n => `${icon("coin")} <span>${numberFormat.format(n)}</span>`;
  const reward = n => `${icon("coin")} <span>+${numberFormat.format(n)}</span>`;
  const percent = value => Math.floor(value + .000001);
  const countSpecies = () => new Set(state.discovered.map(key => key.split(":")[0])).size;
  const stationIcons = ["leaf", "sun", "lamp"];
  const stationNotes = ["Soft light, slower drying", "Light follows the day", "Steady light, faster drying"];
  const totalPhenotypes = CATALOG.reduce((sum, species) => sum + species.phenotypes.length, 0);
  const activePlant = () => state.plants.find(plant => plant.id === state.selected) || state.plants[0];
  const canRescue = () => !state.plants.length && G.freeSlots(state) > 0 && state.coins < SPECIES.golden.price;
  const tierBadge = species => `<span class="badge rarity-${species.tier}"><i></i>${RARITIES[species.tier]}</span>`;
  const currentPage = () => ["greenhouse", "market", "orders", "breeding", "guide"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "greenhouse";
  const button = (label, action, { symbol, extra = "", className = "", disabled = false } = {}) =>
    `<button type="button" class="button ${className}" data-action="${action}" ${extra}${disabled ? " disabled" : ""}>${symbol ? icon(symbol) : ""}${label}</button>`;
  const canvas = (species, { pheno = 0, size = 58, health = 95, quality = 0, training, large = false } = {}) =>
    `<canvas class="plant-art" width="${large ? 680 : 340}" height="${large ? 610 : 305}" data-species="${species.id}" data-pheno="${pheno}" data-size="${percent(size)}" data-health="${percent(health)}" data-quality="${quality}"${training ? ` data-training="${G.branchAngles({ training }).join(",")}"` : ""} aria-hidden="true"></canvas>`;

  let state;
  let lastSaved;
  let storageWorks = true;
  let toastTimer;
  let draggedPlant;
  let pouring;
  let pruning;
  let training;
  let view = { marketFilter: "all", guideFilter: "all", parentA: "", parentB: "", favoredParent: "" };

  function syncSave() {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw !== lastSaved && raw) {
        const saved = JSON.parse(raw);
        if (saved.version === 1 && Array.isArray(saved.plants) && Array.isArray(saved.seeds) &&
            Array.isArray(saved.discovered) && saved.inventory && saved.history && Array.isArray(saved.claimed) &&
            Number.isFinite(saved.updatedAt) && saved.plants.every(plant => SPECIES[plant.species])) {
          state = saved;
          state.journal ??= [];
          state.marketPurchases ??= { window: -1, quantities: {} };
          state.orders ??= null;
          state.stationUpgrades ??= [[], [], []];
          G.enforceDisplayLimit(state);
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

  const dryingLabel = (plant, now, spot) => `Loses ${G.dryingRate(plant, now, spot, state).toFixed(1)}% moisture/hr`;

  const countdown = until => `<span data-countdown="${until}"></span>`;

  function advanceTo(now) {
    G.advance(state, now);
    G.rotateOrders(state, now);
    trackRecovery();
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
    const timers = { prune: G.pruningReadyAt(plant), feed: plant.fedAt === null ? 0 : plant.fedAt + 6 * HOUR,
      mist: plant.mistedAt === null ? 0 : plant.mistedAt + HOUR, tonic: plant.tonicAt === null ? 0 : plant.tonicAt + 2 * HOUR };
    return {
      prune: G.canPrune(plant, now),
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
    const lightGood = G.lightWorks(plant, now, plant.location, state);
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
          ${button("Watering can", "watering-can", { symbol: "can", className: "primary" })}
          ${button("Move", "move", { symbol: "sun", extra: 'title="Choose where this plant gets its light"' })}
          ${button("Prune", "prune", { symbol: "prune", disabled: !allowed.prune, extra: `title="${allowed.timers.prune > now ? `Ready in ${remaining(allowed.timers.prune, now)}` : "Trim damaged leaves and improve the plant's shape"}"` })}
          ${species.shape === "tree" ? button("Train branches", "train", { symbol: "branch" }) : ""}
          ${button(`Feed <small>${state.inventory.fertilizer}</small>`, "feed", { symbol: "fertilizer", disabled: !allowed.feed, extra: `title="${allowed.timers.feed > now ? `Ready in ${remaining(allowed.timers.feed, now)}` : "Use one dose of fertilizer"}"` })}
          ${needs.humidity ? button("Mist", "mist", { symbol: "mist", disabled: !allowed.mist }) : ""}
          ${state.inventory.tonic ? button(`Tonic <small>${state.inventory.tonic}</small>`, "tonic", { symbol: "heart", disabled: !allowed.tonic }) : ""}
        </div>
        <div class="care-trade">
          ${button(plant.onDisplay ? "Remove from display" : G.displayedPlants(state).length >= G.DISPLAY_LIMIT ? "Swap onto display" : "Put on display", "display", { symbol: "display", className: "text-button" })}
          ${button("Take cutting", "view-cutting", { symbol: "sprout", className: "text-button" })}
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
    const displayed = G.displayedPlants(state);
    const rate = displayed.reduce((sum, plant) => sum + G.displayRate(plant), 0);
    const available = Math.floor(state.displayBank + .0000001);
    return `<section class="paper income-card">
      <div class="income-heading"><span class="tile-icon">${icon("display")}</span><div><h3>Display earnings</h3>
        <p>${displayed.length} / ${G.DISPLAY_LIMIT} display spots${displayed.length ? ` · ${rate.toFixed(2)} coins/hr` : ""}</p></div></div>
      <div class="income-bottom"><span class="income-coins">${coins(available)}</span>
        ${button("Collect", "collect", { className: "compact", disabled: available < 1 })}</div>
    </section>`;
  }

  function shelfView(plant, now) {
    const slots = G.freeSlots(state);
    const plantTile = item => {
      const species = SPECIES[item.species];
      return `<button class="shelf-plant ${item === plant ? "selected" : ""}" type="button" draggable="true" data-action="select" data-id="${item.id}" aria-pressed="${item === plant}">
        <span class="shelf-preview">${canvas(species, item)}${item.onDisplay ? `<span class="shelf-display" title="On display">${icon("display")}</span>` : ""}</span>
        <span><strong>${species.name}</strong><small>${species.phenotypes[item.pheno]}</small></span>
      </button>`;
    };
    const stations = LOCATIONS.map((name, spot) => {
      const residents = state.plants.filter(item => item.location === spot);
      const current = plant?.location === spot;
      const recommended = plant && G.lightWorks(plant, now, spot, state);
      const upgrades = Object.entries(G.STATION_UPGRADES).filter(([id]) => G.hasUpgrade(state, spot, id));
      return `<article class="paper station station-${spot}" data-station="${spot}">
        <div class="station-heading"><span class="tile-icon">${icon(stationIcons[spot])}</span>
          <div><h3>${name}</h3><p>${stationNotes[spot]}</p></div>
          ${recommended ? '<span class="count-pill station-recommended">Good light now</span>' : ""}</div>
        <div class="station-pots">${residents.length ? residents.map(plantTile).join("") :
          `<div class="station-empty">${icon("sprout")} Empty spot</div>`}</div>
        ${plant ? `<div class="station-footer"><small title="Current soil drying rate">${icon("drop")} ${dryingLabel(plant, now, spot)}</small>
          ${button(current ? "Here now" : "Move here", "station-place", { className: "compact", disabled: current,
            extra: `data-id="${spot}" data-plant="${plant.id}" aria-label="${current ? `${SPECIES[plant.species].name} is here` : `Move ${SPECIES[plant.species].name} to ${name.toLowerCase()}`}"`,
          })}</div>` : ""}
        <div class="station-upgrades">
          ${button("Upgrade shelf", "view-upgrades", { symbol: "plus", className: "text-button",
            extra: `data-id="${spot}" aria-label="Upgrade ${name.toLowerCase()} shelf"` })}
          ${upgrades.map(([, upgrade]) => `<span class="count-pill">${upgrade.name}</span>`).join("")}
        </div>
      </article>`;
    }).join("");
    const seeds = state.seeds.map(seed => `<a class="shelf-plant seed-slot" href="#breeding"><span class="shelf-placeholder">${icon("sprout")}</span><span><strong>${seed.readyAt <= now ? "Ready to pot" : seed.source === "cutting" ? "Rooting cutting" : "Seed tray"}</strong><small>Reserved space</small></span></a>`).join("");
    const empty = slots > 0 ? `<a class="shelf-plant empty-slot" href="#market"><span class="shelf-placeholder">${icon("plus")}</span><span><strong>Add a plant</strong><small>${slots} open ${slots === 1 ? "space" : "spaces"}</small></span></a>` : "";
    return `<section class="shelf-section" aria-labelledby="shelf-title">
      <div class="section-heading"><div class="heading-with-count"><h2 id="shelf-title">Your shelves</h2><span class="count-pill">${state.capacity - slots} / ${state.capacity} spaces</span></div><a class="text-link" href="#market">${icon("plus")} Expand shelves</a></div>
      ${plant ? `<p class="section-description shelf-hint"><strong>${SPECIES[plant.species].name} selected.</strong> Drag a pot between shelves, or select a pot and choose Move here.</p>` : ""}
      <div class="station-grid">${stations}</div>
      ${seeds || empty ? `<div class="shelf-grid shelf-extras">${seeds}${empty}</div>` : ""}
    </section>`;
  }

  function greenhouse(now) {
    const plant = activePlant();
    return `${hero(now)}
      <div class="greenhouse-grid">
        <section aria-labelledby="care-title">
          <div class="section-heading"><h2 id="care-title">Plant care</h2></div>
          ${plant ? careView(plant, now) : `<div class="paper empty-state"><span class="tile-icon">${icon("sprout")}</span><h3>Your shelves are ready</h3>
            <p>${canRescue() ? "Adopt a free rescue pothos." : G.freeSlots(state) ? "Find a new plant at the market." : "Your shelf spaces are reserved for plants in the nursery."}</p>
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
    return `<header class="page-intro intro-${symbol}"><div><span class="page-icon">${icon(symbol)}</span><h1>${title}</h1><p>${description}</p></div>${stat}</header>`;
  }

  function rarityFilter(name, selected) {
    return `<label class="filter">Rarity
      <select id="${name}" data-filter="${name}"><option value="all">All rarities</option>
      ${RARITIES.map((rarity, tier) => `<option value="${tier}"${String(tier) === selected ? " selected" : ""}>${rarity}</option>`).join("")}</select></label>`;
  }

  function market(now) {
    const spaceCost = G.shelfCost(state);
    const open = G.freeSlots(state);
    const stock = CATALOG
      .filter(species => view.marketFilter === "all" || String(species.tier) === view.marketFilter)
      .map(species => ({ species, quantity: G.marketStock(state, species, now) }))
      .filter(item => item.quantity > 0)
      .sort((a, b) => b.species.tier - a.species.tier);
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
        <div class="section-heading listing-heading"><div class="heading-with-count"><h2 id="stock-title">Plants for sale</h2>
          <span class="count-pill">${icon("clock")} Restock in ${countdown(G.nextRestock(state, now))}</span></div>${rarityFilter("marketFilter", view.marketFilter)}</div>
        <p class="section-description">The selection changes every five minutes. Look for limited stock and plants you can add to your Field Guide.</p>
        ${open ? "" : `<p class="inline-note">${icon("info")} Your shelves are full. Add spaces or sell a plant to make room.</p>`}
        ${stock.length ? `<div class="catalog-grid">${stock.map(({ species, quantity }) => {
          const isNew = !G.speciesUnlocked(state, species);
          return `<article class="paper catalog-card">
            <div class="catalog-art rarity-back-${species.tier}">${tierBadge(species)}${canvas(species, { size: 59 })}</div>
            <div class="catalog-copy"><h3>${species.name}</h3><p>${species.note}</p>
            ${Number.isFinite(quantity) ? `<p class="stock-label in-stock"><i></i>${quantity} in stock${isNew ? " · New to your guide" : ""}</p>` : ""}
            ${button(`Buy <span class="catalog-price">${coins(species.price)}</span>`, "buy-plant", {
              className: "catalog-button", extra: `data-id="${species.id}" aria-label="Buy ${species.name} for ${species.price} coins"`,
              disabled: !open || state.coins < species.price,
            })}</div>
          </article>`;
        }).join("")}</div>` : `<div class="paper collection-empty">${icon("clock")} Check the next restock for plants of this rarity.</div>`}
      </section>`;
  }

  const orderTitles = { grow: "Room to grow", prune: "Shaped by hand", phenotype: "A collector’s eye" };
  const orderIcons = { grow: "sprout", prune: "prune", phenotype: "leaf" };

  function orderRequirement(order) {
    const species = SPECIES[order.species];
    if (order.slot === "grow") return `Any Common plant at ${order.size}% growth or higher.`;
    if (order.slot === "prune") return `${species.name} at ${order.size}% growth or higher and Shape ${order.quality} or better.`;
    return `${species.name} with the ${species.phenotypes[order.pheno]} phenotype.`;
  }

  function orders(now) {
    return `${pageIntro("Collector Orders", "Deliver plants to local collectors for their sale value plus a coin bonus.", "clipboard",
      `<span class="count-pill">${icon("clock")} New orders in ${countdown(G.nextOrderDay(now))}</span>`)}
      <section aria-labelledby="orders-title">
        <div class="section-heading listing-heading"><h2 id="orders-title">Order board</h2></div>
        <p class="section-description">Orders rotate at local midnight. Pin one to keep it until you deliver it or unpin it.</p>
        <div class="order-grid">${state.orders.entries.map(order => {
          const matches = order.fulfilled ? 0 : state.plants.filter(plant => G.orderMatches(order, plant)).length;
          return `<article class="paper order-card ${order.pinned ? "pinned-order" : ""}">
            <div class="goal-top"><span class="tile-icon">${icon(orderIcons[order.slot])}</span>
              ${order.fulfilled ? `<span class="count-pill">${icon("check")} Delivered</span>` :
                button(order.pinned ? "Pinned" : "Pin order", "pin-order", { symbol: "pin", className: "compact",
                  extra: `data-id="${order.id}" aria-pressed="${Boolean(order.pinned)}"` })}</div>
            <h3>${orderTitles[order.slot]}</h3><p>${orderRequirement(order)}</p>
            <div class="order-bottom"><span class="goal-reward">${reward(order.bonus)} bonus</span>
              ${order.fulfilled ? "" : button(matches ? "Choose plant" : "No match yet", "choose-delivery", {
                className: "primary compact", disabled: !matches, extra: `data-id="${order.id}"`,
              })}</div>
          </article>`;
        }).join("")}</div>
      </section>`;
  }

  function journal() {
    return `<section class="journal-section" aria-labelledby="journal-title">
      <div class="section-heading"><div class="heading-with-count"><h2 id="journal-title">Breeding journal</h2>
        <span class="count-pill">${state.journal.length} ${state.journal.length === 1 ? "entry" : "entries"}</span></div></div>
      ${!state.journal.length ? `<div class="paper collection-empty">${icon("book")} Potted seedlings and cuttings appear here with their parent plants.</div>` :
        `<div class="journal-list">${state.journal.map(entry => {
          const child = SPECIES[entry.species];
          const pair = entry.parents.map(parent => {
            const species = SPECIES[parent.species];
            return `<span><strong>${species.name}</strong> <small>#${parent.id} · ${species.phenotypes[parent.pheno]}</small></span>`;
          }).join("<span aria-hidden=\"true\">×</span>");
          const fromCutting = entry.source === "cutting";
          const favorite = entry.parents.find(parent => parent.id === entry.favoredParentId);
          const canReuse = entry.parents.length === 2 && entry.parents.every(parent => state.plants.some(plant => plant.id === parent.id));
          return `<article class="paper journal-row">
            <span class="shelf-preview">${canvas(child, { pheno: entry.pheno, size: 38 })}</span>
            <div><h3>${child.name}</h3><p>${child.phenotypes[entry.pheno]} · ${dateFormat.format(entry.pottedAt)}</p>
              ${favorite ? `<span class="journal-favorite">${icon("leaf")} Favored ${SPECIES[favorite.species].phenotypes[favorite.pheno]} · #${favorite.id}</span>` : ""}
              <div class="journal-parents">${fromCutting ? "Cutting from " : ""}${pair || "Parents unavailable"}</div></div>
            ${canReuse ? button("Use this pair", "reuse-parents", { symbol: "dna", className: "compact", extra: `data-id="${entry.id}"` }) :
              entry.parents.length && !fromCutting ? '<small class="journal-unavailable">Pair no longer on shelves</small>' : ""}
          </article>`;
        }).join("")}</div>`}
    </section>`;
  }

  function traitPicker(a, b) {
    const species = SPECIES[a.species];
    const distinct = a.pheno !== b.pheno;
    const favored = distinct && [String(a.id), String(b.id)].includes(view.favoredParent)
      ? Number(view.favoredParent) : null;
    const odds = G.phenotypeOdds(a, b, favored);
    const preferred = [a, b].find(parent => parent.id === favored);
    const choices = distinct ? `<fieldset class="trait-choices"><legend>Favor a phenotype</legend>
      <div>${[[null, "Balanced"], [a.id, species.phenotypes[a.pheno]], [b.id, species.phenotypes[b.pheno]]].map(([id, name]) =>
        `<label><input type="radio" id="trait-${id ?? "balanced"}" name="trait" data-filter="favoredParent" value="${id ?? ""}"${id === favored ? " checked" : ""}>
          <span>${name}</span></label>`).join("")}</div></fieldset>` : "";
    return `<section class="trait-panel" aria-label="Phenotype options">
      ${choices}
      <h3>Seedling odds</h3>
      <ul class="trait-odds">${species.phenotypes.map((name, i) =>
        `<li${preferred?.pheno === i ? ' class="favored"' : ""}><span>${name}</span><strong>${oddsFormat.format(odds[i])}</strong></li>`).join("")}</ul>
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
      : target ? `<strong>72% chance of ${G.speciesUnlocked(state, target) ? target.name : `an undiscovered ${RARITIES[target.tier]} plant`}</strong><br>Otherwise, a species from either parent.`
      : a.species === b.species ? `<strong>${SPECIES[a.species].name}</strong><br>Seedlings can inherit or develop a different phenotype.`
      : "<strong>Either parent's species</strong><br>Pair different species of the same rarity to breed up a tier.";
    const cause = problem || (!G.freeSlots(state) ? "Open a shelf space for the seedling." : state.coins < G.CROSS_COST ? "You need 5 coins to start a cross." : "");
    return `${pageIntro("Breeding Room", "Pair healthy plants to discover new species and phenotypes.", "dna")}
      <div class="breeding-grid">
        <section class="paper cross-card"><div class="section-heading"><h2>Choose parents</h2><span class="count-pill">${coins(G.CROSS_COST)} per cross</span></div>
          <div class="parents">${parentSlot("parentA", "First parent", a, b)}<span class="cross-plus">${icon("plus")}</span>${parentSlot("parentB", "Second parent", b, a)}</div>
          <div class="cross-note">${icon("info")}<p>${crossNote}</p></div>
          ${valid && a.species === b.species ? traitPicker(a, b) : ""}
          ${cause ? `<p class="breeding-warning">${cause}</p>` : ""}
          ${button("Start cross", "breed", { symbol: "dna", className: "primary", disabled: !valid || Boolean(cause) })}
        </section>
        <section class="paper nursery-card">
          <div class="section-heading"><h2>Nursery tray</h2><span class="count-pill">${state.seeds.length} growing</span></div>
          ${state.seeds.length ? `<div class="seed-list">${state.seeds.map(seed => {
            const ready = seed.readyAt <= now;
            const species = SPECIES[seed.species];
            const cutting = seed.source === "cutting";
            const name = G.speciesUnlocked(state, species) ? species.name : `Undiscovered ${RARITIES[species.tier]} plant`;
            return `<article class="seed-row"><span class="tile-icon">${icon("sprout")}</span><div><h3>${ready ? "Ready to pot" : cutting ? "Rooting cutting" : "Germinating"}</h3>
              <p>${cutting || ready ? name : ""}${!ready ? `${cutting ? " · " : ""}${countdown(seed.readyAt)} remaining` : ""}</p></div>
              ${button(cutting ? "Pot cutting" : "Pot seedling", "pot", { className: "compact", extra: `data-id="${seed.id}"`, disabled: !ready })}</article>`;
          }).join("")}</div>` : `<div class="nursery-empty"><span class="tile-icon">${icon("leaf")}</span><h3>The tray is empty</h3><p>Seeds and cuttings grow here. Each reserves one shelf space.</p></div>`}
        </section>
      </div>${journal()}`;
  }

  function guide() {
    const filtered = CATALOG.filter(species => view.guideFilter === "all" || String(species.tier) === view.guideFilter);
    const stock = filtered.filter(species => G.speciesUnlocked(state, species));
    const hidden = filtered.length - stock.length;
    return `${pageIntro("Field Guide", "Track the species and phenotypes you discover as you grow your collection.", "book",
      `<div class="guide-count"><strong>${countSpecies()} / ${CATALOG.length}</strong><span>Species discovered</span></div>`)}
      <section aria-labelledby="catalog-title">
        <div class="section-heading listing-heading"><div class="heading-with-count"><h2 id="catalog-title">Plant catalog</h2><span class="count-pill">${state.discovered.length} / ${totalPhenotypes} phenotypes</span></div>${rarityFilter("guideFilter", view.guideFilter)}</div>
        ${hidden ? `<p class="inline-note">${icon("lock")} ${hidden} hidden ${hidden === 1 ? "species awaits" : "species await"} discovery in the breeding room.</p>` : ""}
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
    const content = page === "market" ? market(now) : page === "orders" ? orders(now) :
      page === "breeding" ? breeding(now) : page === "guide" ? guide() : greenhouse(now);
    const html = `${content}<footer class="footer">${icon(storageWorks ? "check" : "info")} ${storageWorks ? "Progress saved on this browser" : "Browser saving is unavailable"}</footer>`;
    if (html !== view.markup) {
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
    for (const timer of app.querySelectorAll("[data-countdown]")) timer.textContent = remaining(Number(timer.dataset.countdown), now);
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
    const phase = G.phaseAt(now).name.toLowerCase();
    openDialog("Move plant", `<p>Choose a spot for the ${phase}. Light needs change over the day.</p>
      <div class="move-options">${LOCATIONS.map((spot, i) => {
        const good = G.lightWorks(plant, now, i, state);
        return button(`${spot}${good ? " <small>Recommended now</small>" : ""}${i === plant.location ? " <small>Current</small>" : ""}`, "place", {
          symbol: stationIcons[i], extra: `data-id="${i}" data-plant="${plant.id}"`, disabled: i === plant.location,
          className: good ? "recommended" : "",
        });
      }).join("")}</div>`);
  }

  function showWatering(plant, now) {
    const species = SPECIES[plant.species];
    const range = G.waterRange(plant, now);
    const { wet } = G.careNeeds(plant, now);
    openDialog(`Water ${species.name}`, `<div class="water-panel" data-water-plant="${plant.id}"
        data-min="${range.min}" data-max="${range.max}" data-wet="${wet}">
      <div class="water-scene">${canvas(species, plant)}<span class="water-can" aria-hidden="true">${icon("can")}</span><i class="water-stream" aria-hidden="true"></i></div>
      <p>Hold to pour. Release when the moisture reaches the green range.</p>
      <div class="water-readout"><strong>Soil moisture</strong><strong data-water-level></strong></div>
      <div class="water-gauge" role="meter" aria-label="Soil moisture" aria-valuemin="0" aria-valuemax="100"
        style="--band-start:${range.min}%;--band-width:${range.max - range.min}%">
        <span class="water-band"></span><span class="water-marker"></span>
      </div>
      <div class="water-readout"><small>Target ${range.min}–${range.max}%</small><small data-water-condition></small></div>
      <div class="pour-actions">
        <button class="button primary" type="button" data-pour-hold>${icon("can")} Hold to pour</button>
        <button class="button" type="button" data-pour-toggle>Start pouring</button>
      </div>
      <p class="pour-result" data-pour-result role="status"></p>
    </div>`);
    const panel = dialog.querySelector(".water-panel");
    updateWaterPanel(panel, plant.water);
  }

  function updateWaterPanel(panel, level) {
    const value = Math.floor(level);
    const { min, max, wet } = panel.dataset;
    const condition = level > Number(wet) ? "Too wet" : level > Number(max) ? "Above target" :
      level >= Number(min) ? "In target range" : "Below target";
    panel.classList.toggle("too-wet", level > Number(wet));
    const meter = panel.querySelector(".water-gauge");
    meter.style.setProperty("--level", `${level}%`);
    meter.setAttribute("aria-valuenow", String(value));
    meter.setAttribute("aria-valuetext", `${value}% · ${condition}`);
    panel.querySelector("[data-water-level]").textContent = `${value}%`;
    panel.querySelector("[data-water-condition]").textContent = condition;

    if (!pouring) {
      for (const element of panel.querySelectorAll("[data-pour-hold], [data-pour-toggle]")) element.disabled = level >= 100;
    }
  }

  function pouredAmount(session, current) {
    return Math.floor(Math.max(0, current - session.started) * .026);
  }

  function beginPour(panel, control) {
    if (pouring) return false;
    syncSave();
    advanceTo(Date.now());
    const plant = state.plants.find(item => item.id === Number(panel.dataset.waterPlant));
    if (!plant) {
      dialog.close();
      notify("This plant is no longer on your shelves.");
      return false;
    }
    if (plant.water >= 100) return false;

    const session = { panel, control, plantId: plant.id, baseline: plant.water, started: performance.now(), frame: 0 };
    pouring = session;
    panel.classList.add("is-pouring");
    panel.querySelector("[data-pour-toggle]").textContent = "Stop pouring";
    panel.querySelector("[data-pour-result]").textContent = "";
    function tick(current) {
      if (pouring !== session) return;
      const level = G.clamp(session.baseline + pouredAmount(session, current));
      updateWaterPanel(panel, level);
      if (level < 100) session.frame = requestAnimationFrame(tick);
    }
    session.frame = requestAnimationFrame(tick);
    return true;
  }

  function endPour(apply) {
    const session = pouring;
    if (!session) return;
    pouring = undefined;
    cancelAnimationFrame(session.frame);
    const { panel } = session;
    panel.classList.remove("is-pouring");
    panel.querySelector("[data-pour-toggle]").textContent = "Start pouring";
    if (!apply) {
      updateWaterPanel(panel, session.baseline);
      return;
    }

    const amount = pouredAmount(session, performance.now());
    syncSave();
    const now = Date.now();
    advanceTo(now);
    const plant = state.plants.find(item => item.id === session.plantId);
    if (!plant) {
      dialog.close();
      render();
      notify("This plant is no longer on your shelves.");
      return;
    }
    G.waterPlant(plant, amount, now);
    trackRecovery();
    save();
    render();
    updateWaterPanel(panel, plant.water);
    const { min, max } = G.waterRange(plant, now);
    panel.querySelector("[data-pour-result]").textContent = amount < 1 ? "Hold a little longer to pour." :
      plant.water > G.careNeeds(plant, now).wet ? "The soil is soaked. Give it time to dry." :
      plant.water >= min && plant.water <= max ? "Watered into the target range." : `Watered to ${percent(plant.water)}%.`;
  }

  function showPruning(plant) {
    const species = SPECIES[plant.species];
    const nextShape = Math.min(5, plant.quality + 1);
    const shape = nextShape > plant.quality ? `Shape ${plant.quality}/5 → ${nextShape}/5` : `Shape ${plant.quality}/5`;
    openDialog(`Prune ${species.name}`, `<div class="prune-panel">
      <p>Snip each leaf as it is marked, then finish pruning.</p>
      <div class="prune-scene"><div class="prune-art">${canvas(species, { ...plant, large: true })}<div data-prune-targets></div></div></div>
      <div class="prune-readout"><strong>${shape}</strong><span data-prune-progress role="status"></span></div>
      <div class="prune-actions">
        ${button("Finish pruning", "finish-prune", { symbol: "prune", className: "primary", disabled: true })}
      </div>
    </div>`);
    const panel = dialog.querySelector(".prune-panel");
    const art = panel.querySelector("canvas");
    const removed = new Set();
    const targets = window.PlantArt.draw(art, { removedLeaves: removed }) || [];
    pruning = { plantId: plant.id, panel, art, removed, total: targets.length };
    panel.querySelector("[data-prune-targets]").innerHTML = targets.map((target, index) =>
      `<button class="snip-target" type="button" data-snip="${target.id}"${index === 0 ? "" : " hidden"}
        style="--x:${(target.x / 340 * 100).toFixed(2)}%;--y:${(target.y / 305 * 100).toFixed(2)}%"
        aria-label="Snip leaf ${index + 1}">${icon("prune")}</button>`).join("");
    showPruneProgress();
  }

  function showPruneProgress() {
    const { panel, removed, total } = pruning;
    const done = total > 0 && removed.size === total;
    panel.querySelector("[data-prune-progress]").textContent = total ? `${removed.size} / ${total} leaves trimmed` :
      "Leaf markers unavailable. Close and reopen pruning.";
    const finish = panel.querySelector('[data-action="finish-prune"]');
    finish.disabled = !done;
    return finish;
  }

  function trimLeaf(target) {
    if (!pruning || !pruning.panel.contains(target) || target.hidden) return;
    const { art, panel, removed } = pruning;
    removed.add(Number(target.dataset.snip));
    window.PlantArt.draw(art, { removedLeaves: removed });
    const restoreFocus = document.activeElement === target;
    target.hidden = true;
    const next = panel.querySelectorAll("[data-snip]")[removed.size];
    if (next) next.hidden = false;
    const finish = showPruneProgress();
    if (restoreFocus) (next || finish).focus({ preventScroll: true });
  }

  function showTraining(plant) {
    const species = SPECIES[plant.species];
    const original = G.branchAngles(plant);
    openDialog(`Train ${species.name}`, `<div class="training-panel">
      <div class="prune-scene"><div class="prune-art">${canvas(species, { ...plant, large: true })}</div></div>
      <div class="training-controls">
        <label for="training-branch">Branch</label>
        <select id="training-branch" data-training-branch>${G.TREE_BRANCHES.map((name, i) => `<option value="${i}">${name}</option>`).join("")}</select>
        <div><label for="training-angle">Bend</label><output for="training-angle" data-training-output></output></div>
        <input id="training-angle" data-training-angle type="range" min="${-G.BRANCH_LIMIT}" max="${G.BRANCH_LIMIT}" step="1">
      </div>
      <div class="dialog-actions">${button("Cancel", "close")}${button("Save shape", "save-training", { symbol: "branch", className: "primary", disabled: true })}</div>
    </div>`);
    const panel = dialog.querySelector(".training-panel");
    training = { plantId: plant.id, active: 0, original, angles: [...original], panel };
    updateTraining();
  }

  function updateTraining() {
    const { panel, active, angles, original } = training;
    const angle = angles[active];
    const text = angle === 0 ? "Straight" : `${Math.abs(angle)}° ${angle < 0 ? "counterclockwise" : "clockwise"}`;
    const slider = panel.querySelector("[data-training-angle]");
    slider.value = angle;
    slider.setAttribute("aria-valuetext", text);
    panel.querySelector("[data-training-output]").textContent = text;
    const art = panel.querySelector("canvas");
    art.dataset.training = angles.join(",");
    window.PlantArt.draw(art, { highlightBranch: active });
    panel.querySelector('[data-action="save-training"]').disabled = !angles.some((value, i) => value !== original[i]);
  }

  function showCutting(plant, now) {
    const species = SPECIES[plant.species];
    const problem = G.cuttingProblem(plant, now) || (G.freeSlots(state) <= 0 ? "Free a shelf space to reserve for the cutting" : "");
    const duration = G.rootingTime(plant) / G.MINUTE;
    openDialog(`Take a cutting from ${species.name}`, `<p>Grow a new ${species.phenotypes[plant.pheno]} plant. The cutting takes ${duration} minutes to root in the nursery and reserves one shelf space.</p>
      <p class="species-needs">The parent gives up 8 growth points and can provide one cutting every 12 hours.</p>
    ${problem ? `<p class="cutting-warning">${icon("info")} ${problem}</p>` : ""}
      <div class="dialog-actions">${button("Cancel", "close")}${button("Take cutting", "cut", {
        symbol: "prune", className: "primary", extra: `data-id="${plant.id}"`, disabled: Boolean(problem),
      })}</div>`);
  }

  function showUpgrades(spot) {
    const available = Object.entries(G.STATION_UPGRADES).filter(([, item]) => item.stations.includes(spot));
    const symbols = { tray: "mist", curtain: "sun", timer: "clock" };
    openDialog(`${LOCATIONS[spot]} upgrades`, `<div class="upgrade-list">${available.map(([id, item]) => {
      const installed = G.hasUpgrade(state, spot, id);
      return `<article class="upgrade-option">
        <span class="tile-icon">${icon(symbols[id])}</span><div><h3>${item.name}</h3><p>${item.description}</p></div>
        ${installed ? `<span class="count-pill">${icon("check")} Installed</span>` : button(coins(item.cost), "buy-upgrade", {
          className: "compact", extra: `data-id="${id}" data-station="${spot}" aria-label="Buy ${item.name} for ${item.cost} coins"`,
          disabled: state.coins < item.cost,
        })}
      </article>`;
    }).join("")}</div>`);
  }

  function showDisplaySwap(incoming) {
    const species = SPECIES[incoming.species];
    openDialog("Swap a display plant", `<p>Both display spots are filled. Choose which plant to take down to make room for ${species.name}.</p>
      <div class="delivery-options">${G.displayedPlants(state).map(plant => {
        const displayed = SPECIES[plant.species];
        return button(`<span>${displayed.name} #${plant.id}<small>${displayed.phenotypes[plant.pheno]}</small></span>
          <span class="count-pill">${G.displayRate(plant).toFixed(2)} coins/hr</span>`, "swap-display", {
          className: "delivery-option", extra: `data-id="${plant.id}" data-plant="${incoming.id}" aria-label="Replace ${displayed.name} number ${plant.id}"`,
        });
      }).join("")}</div>`);
  }

  function chooseDelivery(order) {
    const options = state.plants.filter(plant => G.orderMatches(order, plant)).map(plant => {
      const species = SPECIES[plant.species];
      const payout = G.salePrice(plant) + order.bonus;
      return button(`<span>${species.name} #${plant.id}<small>${species.phenotypes[plant.pheno]} · ${percent(plant.size)}% growth</small></span>
        <span class="goal-reward">${coins(payout)}</span>`, "deliver-order", {
        className: "delivery-option", extra: `data-id="${order.id}" data-plant="${plant.id}" aria-label="Deliver ${species.name} number ${plant.id} for ${payout} coins"`,
      });
    }).join("");
    openDialog(orderTitles[order.slot], `<p>${orderRequirement(order)} The plant you deliver leaves your shelf.</p>
      <div class="delivery-options">${options || "<p>No plants currently meet this order.</p>"}</div>`);
  }

  function careAction(action, plant, now) {
    const allowed = controlsFor(plant, now);
    if (!allowed[action]) return "That care action is unavailable right now.";
    const needs = G.careNeeds(plant, now);
    const increase = (key, amount) => { plant[key] = G.clamp(plant[key] + amount); };
    switch (action) {
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

  function perform(action, data, now, plantId) {
    const { id } = data;
    const plant = state.plants.find(item => item.id === plantId);
    const species = SPECIES[id];
    switch (action) {
      case "close":
        dialog.close();
        return;
      case "inspect":
        if (species && G.speciesUnlocked(state, species)) showEntry(species);
        return;
      case "select":
        if (state.plants.some(item => item.id === Number(id))) state.selected = Number(id);
        return;
      case "move":
        if (plant) showMove(plant, now);
        return;
      case "place":
      case "station-place": {
        const moved = state.plants.find(item => item.id === Number(data.plant));
        const spot = Number(id);
        if (action === "place") dialog.close();
        if (!moved || !G.movePlant(moved, spot, now, state)) return;
        state.selected = moved.id;
        return `${SPECIES[moved.species].name} moved to ${LOCATIONS[spot].toLowerCase()}.`;
      }
      case "view-upgrades": {
        const spot = Number(id);
        if (LOCATIONS[spot]) showUpgrades(spot);
        return;
      }
      case "buy-upgrade": {
        const spot = Number(data.station);
        if (!G.buyUpgrade(state, spot, id)) return "This shelf upgrade is unavailable.";
        dialog.close();
        return `${G.STATION_UPGRADES[id].name} installed at the ${LOCATIONS[spot].toLowerCase()} shelf.`;
      }
      case "watering-can":
        if (plant) showWatering(plant, now);
        return;
      case "prune":
        if (plant && G.canPrune(plant, now)) showPruning(plant);
        return;
      case "finish-prune": {
        if (!pruning || !pruning.total || pruning.removed.size !== pruning.total) return;
        const trimmed = state.plants.find(item => item.id === pruning.plantId);
        dialog.close();
        if (!trimmed || !G.prunePlant(trimmed, now)) return "This plant is unavailable for pruning.";
        return `${SPECIES[trimmed.species].name} pruned. Shape ${trimmed.quality}/5.`;
      }
      case "train":
        if (plant && SPECIES[plant.species].shape === "tree") showTraining(plant);
        return;
      case "save-training": {
        if (!training) return;
        const tree = state.plants.find(item => item.id === training.plantId);
        dialog.close();
        if (!tree || !G.trainBranches(tree, training.angles)) return "This plant is unavailable for training.";
        return `${SPECIES[tree.species].name} shape saved.`;
      }
      case "view-cutting":
        if (plant) showCutting(plant, now);
        return;
      case "cut": {
        const parent = state.plants.find(item => item.id === Number(id));
        if (!G.takeCutting(state, parent, now)) return "This cutting is unavailable right now.";
        dialog.close();
        return `Cutting from ${SPECIES[parent.species].name} is rooting in the nursery.`;
      }
      case "feed":
      case "mist":
      case "tonic":
        if (plant) return careAction(action, plant, now);
        return;
      case "display": {
        if (!plant) return;
        if (!G.setDisplay(state, plant)) {
          showDisplaySwap(plant);
          return;
        }
        return plant.onDisplay ? `${SPECIES[plant.species].name} is on display.` : "Plant removed from display.";
      }
      case "swap-display": {
        const incoming = state.plants.find(item => item.id === Number(data.plant));
        const outgoing = state.plants.find(item => item.id === Number(id));
        dialog.close();
        if (!outgoing || !G.setDisplay(state, incoming, outgoing)) return "That display spot changed. Choose again.";
        return `${SPECIES[incoming.species].name} is on display.`;
      }
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
      case "buy-plant": {
        const isNew = species && !G.speciesUnlocked(state, species);
        if (!species || !G.buyPlant(state, species, now)) return "That plant is unavailable right now.";
        return isNew ? `${species.name} discovered. Added to your Field Guide.` : `${species.name} added to your shelves.`;
      }
      case "pin-order":
      case "choose-delivery":
      case "deliver-order": {
        const order = state.orders.entries.find(entry => entry.id === id);
        if (!order || order.fulfilled) {
          if (dialog.open) dialog.close();
          return "This order is no longer open.";
        }
        if (action === "pin-order") return G.toggleOrderPin(state, order) ? "Order pinned." : "Order unpinned.";
        if (action === "choose-delivery") {
          chooseDelivery(order);
          return;
        }
        const delivered = state.plants.find(item => item.id === Number(data.plant));
        const payout = G.deliverOrder(state, order, delivered);
        dialog.close();
        return payout ? `Order delivered. You earned ${payout} coins.` : "This plant is unavailable for delivery.";
      }
      case "rescue":
        if (!canRescue()) return;
        G.addPlant(state, "golden", 0, now, "starter");
        return "Rescue pothos adopted.";
      case "breed": {
        const a = state.plants.find(item => String(item.id) === view.parentA);
        const b = state.plants.find(item => String(item.id) === view.parentB);
        if (!G.breed(state, a, b, now, Math.random, Number(view.favoredParent) || null)) return "This pair is unavailable for breeding right now.";
        view.parentA = view.parentB = view.favoredParent = "";
        return "Cross started. Check the seed tray for progress.";
      }
      case "reuse-parents": {
        const entry = state.journal.find(item => item.id === Number(id));
        if (entry?.parents.length !== 2 || !entry.parents.every(parent => state.plants.some(item => item.id === parent.id))) {
          return "This pair is no longer on your shelves.";
        }
        [view.parentA, view.parentB] = entry.parents.map(parent => String(parent.id));
        view.favoredParent = entry.favoredParentId ? String(entry.favoredParentId) : "";
        requestAnimationFrame(() => {
          const firstParent = document.querySelector("#parentA");
          firstParent?.focus({ preventScroll: true });
          firstParent?.scrollIntoView({ block: "center" });
        });
        return "Parents selected.";
      }
      case "pot": {
        const seed = state.seeds.find(item => item.id === Number(id));
        const newSpecies = seed && !G.speciesUnlocked(state, SPECIES[seed.species]);
        const seedling = G.potSeed(state, seed, now);
        if (!seedling) return;
        const name = SPECIES[seedling.species].name;
        return newSpecies ? `${name} discovered. Added to your Field Guide.` : `${name} added to your shelves.`;
      }
    }
  }

  function runAction(action, data) {
    const plantId = activePlant()?.id;
    syncSave();
    const now = Date.now();
    advanceTo(now);
    const message = perform(action, data, now, plantId);
    trackRecovery();
    save();
    render();
    if (message) notify(message);
  }

  document.addEventListener("click", event => {
    const target = event.target.closest("button[data-action]");
    if (target && !target.disabled) runAction(target.dataset.action, target.dataset);
  });

  dialog.addEventListener("pointerdown", event => {
    const hold = event.target.closest("[data-pour-hold]");
    if (!hold || hold.disabled || event.button !== 0) return;
    if (beginPour(hold.closest(".water-panel"), event.pointerId)) hold.setPointerCapture(event.pointerId);
  });
  dialog.addEventListener("pointerup", event => {
    if (pouring?.control === event.pointerId) endPour(true);
  });
  for (const type of ["pointercancel", "lostpointercapture"]) {
    dialog.addEventListener(type, event => {
      if (pouring?.control === event.pointerId) endPour(false);
    });
  }
  dialog.addEventListener("keydown", event => {
    if (event.repeat && event.key === "Enter" && event.target.closest('[data-snip], [data-action="finish-prune"]')) {
      event.preventDefault();
      return;
    }
    const hold = event.target.closest("[data-pour-hold]");
    if (!hold || hold.disabled || ![" ", "Enter"].includes(event.key)) return;
    event.preventDefault();
    if (!event.repeat) beginPour(hold.closest(".water-panel"), event.key);
  });
  window.addEventListener("keyup", event => {
    if (pouring?.control !== event.key) return;
    event.preventDefault();
    endPour(true);
  });
  dialog.addEventListener("click", event => {
    const leaf = event.target.closest("[data-snip]");
    if (leaf) trimLeaf(leaf);
    const toggle = event.target.closest("[data-pour-toggle]");
    if (!toggle || toggle.disabled) return;
    if (pouring) endPour(true);
    else beginPour(toggle.closest(".water-panel"), "toggle");
  });
  dialog.addEventListener("close", () => {
    if (dialog.open) return;
    endPour(false);
    pruning = undefined;
    training = undefined;
  });
  dialog.addEventListener("change", event => {
    if (!training || !event.target.matches("[data-training-branch]")) return;
    training.active = Number(event.target.value);
    updateTraining();
  });
  dialog.addEventListener("input", event => {
    if (!training || !event.target.matches("[data-training-angle]")) return;
    training.angles[training.active] = Number(event.target.value);
    updateTraining();
  });
  window.addEventListener("blur", () => endPour(false));

  function clearDrag() {
    if (!draggedPlant) return;
    draggedPlant.source.classList.remove("is-dragged");
    draggedPlant.station?.classList.remove("drop-target");
    draggedPlant = undefined;
  }

  app.addEventListener("dragstart", event => {
    const tile = event.target.closest(".station-pots [draggable]");
    if (!tile || !event.dataTransfer) return;
    const id = tile.dataset.id;
    draggedPlant = { id, source: tile };
    event.dataTransfer.setData("text/plain", id);
    event.dataTransfer.effectAllowed = "move";
    tile.classList.add("is-dragged");
  });
  app.addEventListener("dragover", event => {
    const station = event.target.closest("[data-station]");
    if (!draggedPlant || !station) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (draggedPlant.station === station) return;
    draggedPlant.station?.classList.remove("drop-target");
    draggedPlant.station = station;
    station.classList.add("drop-target");
  });
  app.addEventListener("dragleave", event => {
    const station = event.target.closest("[data-station]");
    if (!station || draggedPlant?.station !== station || station.contains(event.relatedTarget)) return;
    station.classList.remove("drop-target");
    draggedPlant.station = undefined;
  });
  app.addEventListener("drop", event => {
    const station = event.target.closest("[data-station]");
    if (!draggedPlant || !station) return;
    event.preventDefault();
    const plant = draggedPlant.id;
    clearDrag();
    runAction("station-place", { id: station.dataset.station, plant });
  });
  app.addEventListener("dragend", clearDrag);

  app.addEventListener("change", event => {
    const { filter } = event.target.dataset;
    if (!filter || !Object.hasOwn(view, filter)) return;
    view[filter] = event.target.value;
    if (filter === "parentA" || filter === "parentB") view.favoredParent = "";
    render();
  });

  window.addEventListener("hashchange", () => {
    if (dialog.open) dialog.close();
    clearDrag();
    syncSave();
    advanceTo(Date.now());
    render();
    window.scrollTo(0, 0);
  });

  function refresh() {
    syncSave();
    advanceTo(Date.now());
    if (!dialog.open && !draggedPlant) render();
  }

  window.addEventListener("storage", event => { if (event.key === STORE) refresh(); });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refresh();
  });
  window.addEventListener("pagehide", () => {
    syncSave();
    advanceTo(Date.now());
    save();
  });
  for (const element of document.querySelectorAll("[data-icon]")) element.innerHTML = icon(element.dataset.icon);
  syncSave();
  advanceTo(Date.now());
  save();
  render();
  setInterval(() => { if (!document.hidden) refresh(); }, 5000);
})();
