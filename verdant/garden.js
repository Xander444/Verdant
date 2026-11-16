/* Catalog and real-time simulation. Each cross is a game mechanic. */
"use strict";

window.Garden = (() => {
  const MINUTE = 60_000;
  const HOUR = 60 * MINUTE;
  const RESTOCK_INTERVAL = 5 * MINUTE;
  const CROSS_COST = 5;
  const RARITIES = ["Common", "Uncommon", "Rare", "Legendary"];
  const PHASES = [
    { name: "Night", icon: "moon", until: 6, evaporation: .57, growth: .36 },
    { name: "Morning", icon: "sun", until: 11, evaporation: .9, growth: 1.18 },
    { name: "Afternoon", icon: "sun", until: 17, evaporation: 1.35, growth: 1.34 },
    { name: "Evening", icon: "sunset", until: 20, evaporation: .76, growth: .82 },
    { name: "Night", icon: "moon", until: 24, evaporation: .57, growth: .36 },
  ];
  const LOCATIONS = ["Shade", "Window", "Grow lamp"];
  const MARKET_PRICES = [
    [13, 16, 17, 19, 21], [38, 43, 48, 53, 58], [105, 118, 131, 144, 157], [275, 305, 335, 365, 395],
  ];
  const CATALOG = [
    ["golden", "Golden Pothos", "trailing", "#55763e", ["Golden Speckle", "Jade", "Lemon Splash"], "A forgiving trailing vine with golden flecks."],
    ["jade", "Jade Plant", "succulent", "#66864e", ["Classic Green", "Crimson Edge"], "Rounded leaves stack up like little green coins."],
    ["spider", "Spider Plant", "grass", "#6a9046", ["Green Stripe", "Ivory Ribbon", "Lime Twist"], "Arching ribbons spill over the sides of its pot."],
    ["heart", "Heartleaf", "heart", "#3a784a", ["Emerald", "Copper Heart", "Lime Veins", "Snow Edge"], "A climber with soft, heart-shaped foliage."],
    ["boston", "Boston Fern", "fern", "#658436", ["Featherleaf", "Moss Lace"], "A cloud of finely divided fronds."],
    ["polka", "Polka Dot Plant", "bush", "#9f5769", ["Blush", "White Confetti", "Berry Freckle", "Ruby Dots"], "Freckled leaves with a painterly finish."],
    ["velvet", "Velvet Alocasia", "shield", "#355857", ["Green Velvet", "Silver Vein", "Cinder", "Ghost Shield"], "Dark, velvety shields catch the light along their veins."],
    ["purple", "Purple Oxalis", "flower", "#805177", ["Plum", "Wine Star", "Pink Flutter", "Frost Plum", "Copper Wing"], "Triangular leaves fold into delicate clusters."],
    ["snake", "Moonshine Snake Plant", "spear", "#809c73", ["Moonshine", "Jade Edge", "Butter Stripe"], "Upright leaves show a soft, silvery sheen."],
    ["prayer", "Prayer Plant", "heart", "#4f754e", ["Red Vein", "Lemon Line", "Night Stripe", "Painted Pearl"], "Patterned foliage lifts toward evening."],
    ["pink", "Pink Princess", "shield", "#385e43", ["Rose Sector", "Dark Cherry", "Bubblegum", "Marble Rose", "Cream Flame"], "Rose-colored patches break up its deep green leaves."],
    ["jewel", "Jewel Orchid", "flower", "#68466a", ["Copper Net", "Gold Rain", "Ivory Vein", "Ruby Thread", "Obsidian", "Luminous Pink"], "Fine metallic lines trace the leaves beneath its blooms."],
    ["blue", "Blue Star Fern", "fern", "#45847a", ["Blue Star", "Mist Blue", "Jade Wave", "Sea Glass", "Silver Frond"], "Sculptural fronds carry a blue-green cast."],
    ["cotton", "Cotton Candy Caladium", "heart", "#b36178", ["Candy Floss", "Raspberry", "Pearl Heart", "Blush Vein", "White Flame", "Peach Halo"], "Color gathers along the broad leaves and branching veins."],
    ["string", "String of Rubies", "trailing", "#8f5369", ["Wine Beads", "Green Flame", "Rose Dew", "Garnet", "Plum Splash"], "Long trails of ruby-tinted leaves tumble from the pot."],
    ["constellation", "Thai Constellation", "monstera", "#4d783f", ["Star Map", "Milky Way", "Cream Sector", "Lime Galaxy", "White Nova", "Mint Orbit", "Sunspot", "Silver Comet"], "Split leaves carry constellations of pale speckles."],
    ["spirit", "Spirit Philodendron", "shield", "#8eae78", ["Mint Ghost", "Candlelight", "Silver Flame", "Moon Jade", "Pink Apparition", "Frost"], "New growth unfurls in unusually pale shades."],
    ["black", "Black Bat Flower", "flower", "#533a59", ["Ink Wing", "Violet Night", "Red Velvet", "White Bat", "Silver Whisker", "Black Pearl", "Ember"], "Spidery blooms hover above broad tropical leaves."],
    ["glass", "Glass Succulent", "succulent", "#75a899", ["Clear Mint", "Opal", "Rose Quartz", "Amber Glass", "Sea Crystal", "Blue Chalcedony", "Frosted Jade", "Lavender Ice"], "Translucent tips glow like polished stones."],
    ["fire", "Firefly Fern", "fern", "#829143", ["Golden Lantern", "Lime Spark", "Copper Glow", "Ivory Ember", "Mint Lantern", "Rose Flicker", "Sun Shower"], "Bright new fronds seem to catch stray rays of light."],
  ].map(([id, name, shape, color, phenotypes, note], i) => ({
    id, name, shape, color, phenotypes, note, tier: Math.floor(i / 5), position: i % 5,
    price: MARKET_PRICES[Math.floor(i / 5)][i % 5],
  }));
  const SPECIES = Object.fromEntries(CATALOG.map(species => [species.id, species]));
  const SUPPLIES = {
    fertilizer: { name: "Fertilizer", icon: "fertilizer", cost: 12, quantity: 3, description: "3 doses that support healthy growth." },
    tonic: { name: "Root tonic", icon: "heart", cost: 8, quantity: 2, description: "2 doses to help a struggling plant recover." },
  };
  const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));

  function phaseAt(now) {
    const date = new Date(now);
    return PHASES.find(phase => date.getHours() < phase.until);
  }

  function lightTarget(species, now) {
    const phase = phaseAt(now).name;
    if (phase === "Night") return species.tier >= 2 ? 2 : 0;
    if (phase === "Afternoon" && ["fern", "shield", "heart", "flower"].includes(species.shape)) return 0;
    return 1;
  }

  function makePlant(state, speciesId, pheno, now, source) {
    const species = SPECIES[speciesId];
    const starter = source === "starter";
    const seedling = source === "seedling";
    return {
      id: state.nextId++, species: speciesId, pheno,
      health: starter ? 38 : seedling ? 86 : 82,
      water: starter ? 19 : seedling ? 55 : 51,
      humidity: starter ? 50 : 68,
      nutrients: starter ? 31 : seedling ? 65 : 59,
      size: starter ? 37 : seedling ? 8 : 36,
      quality: 0, location: starter ? (lightTarget(species, now) + 1) % LOCATIONS.length : lightTarget(species, now),
      fedAt: null, mistedAt: null, tonicAt: null, prunedAt: null, bredUntil: 0, onDisplay: false,
    };
  }

  function discover(state, plant) {
    const key = plant.species + ":" + plant.pheno;
    if (!state.discovered.includes(key)) state.discovered.push(key);
  }

  function fresh(now) {
    const state = {
      version: 1, updatedAt: now, coins: 36, displayBank: 0, capacity: 4,
      nextId: 1, inventory: { fertilizer: 2, tonic: 0 }, plants: [], seeds: [], discovered: [],
      history: { recovered: false, bought: false, harvested: false, rareCross: false },
      claimed: [], selected: 1, journal: [],
      marketPurchases: { window: -1, quantities: {} }, orders: null,
    };
    const plant = makePlant(state, "golden", 0, now, "starter");
    state.plants.push(plant);
    discover(state, plant);
    return state;
  }

  function addPlant(state, species, pheno, now, source) {
    const plant = makePlant(state, species, pheno, now, source);
    state.plants.push(plant);
    discover(state, plant);
    state.selected = plant.id;
    return plant;
  }

  function displayRate(plant) {
    const tier = SPECIES[plant.species].tier;
    return [.19, .43, .92, 1.75][tier] *
      (1 + (plant.size / 60) ** 2 + plant.quality * .52) *
      (.38 + .62 * plant.health / 100) * (1 + plant.pheno * .055);
  }

  function salePrice(plant) {
    const tier = SPECIES[plant.species].tier;
    return Math.max(2, Math.round([7, 18, 44, 105][tier] *
      (.5 + 3.1 * (plant.size / 100) ** 2 + .38 * plant.quality) *
      (.38 + .62 * plant.health / 100) * (1 + plant.pheno * .09)));
  }

  function careNeeds(plant, now) {
    const species = SPECIES[plant.species];
    return {
      dry: [35, 41, 47, 53][species.tier] + (species.shape === "succulent" ? -8 : species.shape === "fern" ? 5 : 0),
      wet: species.shape === "succulent" ? 76 : 86,
      humidity: Math.max(species.tier >= 2 ? [0, 0, 49, 61][species.tier] : 0, species.shape === "fern" ? 38 : 0),
      food: [12, 22, 31, 42][species.tier],
      light: lightTarget(species, now),
    };
  }

  function advance(state, now) {
    if (now <= state.updatedAt) return;
    let cursor = Math.max(state.updatedAt, now - 7 * 24 * HOUR);
    while (cursor < now) {
      const date = new Date(cursor);
      const nextQuarter = new Date(date);
      nextQuarter.setMinutes((Math.floor(date.getMinutes() / 15) + 1) * 15, 0, 0);
      const edge = nextQuarter.getTime() > cursor ? nextQuarter.getTime() : cursor + 15 * MINUTE;
      const next = Math.min(now, edge);
      const hours = (next - cursor) / HOUR;
      const phase = phaseAt(cursor);
      for (const plant of state.plants) {
        const species = SPECIES[plant.species];
        const tier = species.tier;
        const needs = careNeeds(plant, cursor);
        const waterLoss = [1.35, 1.85, 2.55, 3.35][tier] * phase.evaporation *
          (species.shape === "succulent" ? .57 : species.shape === "fern" ? 1.21 : 1) * (plant.location === 2 ? 1.17 : 1);
        const water = clamp(plant.water - waterLoss * hours / 2);
        const humidityLoss = [.6, 1.35, 2.3, 3.4][tier] * phase.evaporation;
        const humidity = clamp(plant.humidity - humidityLoss * hours / 2);
        const nutrientLoss = [.40, .66, .92, 1.29][tier];
        const nutrients = clamp(plant.nutrients - nutrientLoss * hours / 2);
        const stress = (water < needs.dry ? .64 + (needs.dry - water) * .047 : 0) +
          (water > needs.wet ? .43 + (water - needs.wet) * .07 : 0) +
          (humidity < needs.humidity ? .4 + (needs.humidity - humidity) * .03 : 0) +
          (nutrients < needs.food ? .22 + tier * .14 : 0) +
          (plant.location !== needs.light ? [.16, .42, .75, 1.18][tier] : 0);
        const change = stress ? -stress * (1 + tier * .14) : (plant.health < 90 ? 2.65 : .65);
        const health = clamp(plant.health + change * hours / 2, 10);
        if (plant.onDisplay) state.displayBank += displayRate({ ...plant, health }) * hours;
        const grow = health >= 60
          ? (stress ? .23 : 1) * phase.growth * (1 + nutrients / 160) * (1 + .10 * plant.quality) / (1 + .16 * tier)
          : 0;
        plant.water = clamp(plant.water - waterLoss * hours);
        plant.humidity = clamp(plant.humidity - humidityLoss * hours);
        plant.nutrients = clamp(plant.nutrients - nutrientLoss * hours);
        plant.health = clamp(plant.health + change * hours, 10);
        plant.size = clamp(plant.size + grow * hours);
        if (plant.id === 1 && plant.health >= 72) state.history.recovered = true;
      }
      cursor = next;
    }
    state.updatedAt = now;
  }

  function shelfCost(state) {
    return 28 + (state.capacity - 4) * 6;
  }

  function freeSlots(state) {
    return state.capacity - state.plants.length - state.seeds.length;
  }

  function speciesUnlocked(state, species) {
    return species.tier === 0 || state.discovered.some(key => key.startsWith(species.id + ":"));
  }

  function marketWindow(state, now) {
    return Math.max(state.marketPurchases.window, Math.floor(now / RESTOCK_INTERVAL));
  }

  function nextRestock(state, now) {
    return (marketWindow(state, now) + 1) * RESTOCK_INTERVAL;
  }

  function marketStock(state, species, now) {
    if (!speciesUnlocked(state, species)) return 0;
    if (species.tier === 0) return Infinity;
    const window = marketWindow(state, now);
    const cadence = [0, 2, 4, 8][species.tier];
    const offset = [0, 0, 1, 3][species.tier];
    const rotation = Math.floor(window / cadence);
    if (window % cadence !== offset || rotation % 5 !== species.position) return 0;
    const purchases = state.marketPurchases;
    const used = purchases.window === window ? (purchases.quantities[species.id] || 0) : 0;
    return Math.max(0, (species.tier === 1 ? 2 : 1) - used);
  }

  function buyPlant(state, species, now) {
    if (!marketStock(state, species, now) || freeSlots(state) <= 0 || state.coins < species.price) return null;
    if (species.tier > 0) {
      const window = marketWindow(state, now);
      if (state.marketPurchases.window !== window) state.marketPurchases = { window, quantities: {} };
      const stock = state.marketPurchases.quantities;
      stock[species.id] = (stock[species.id] || 0) + 1;
    }
    state.coins -= species.price;
    state.history.bought = true;
    return addPlant(state, species.id, 0, now, "market");
  }

  function localDay(now) {
    const date = new Date(now);
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / (24 * HOUR);
  }

  function nextOrderDay(now) {
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime();
  }

  function rotateOrders(state, now) {
    const day = localDay(now);
    const previous = state.orders;
    if (previous && day <= previous.day) return;
    const rotation = previous ? previous.rotation + day - previous.day : 0;
    const pinned = previous?.entries.find(order => order.pinned && !order.fulfilled);
    const specialty = CATALOG.filter(species => species.tier > 0 && speciesUnlocked(state, species));
    const phenotypeSpecies = specialty[rotation % Math.max(1, specialty.length)] || SPECIES.golden;
    const pheno = 1 + rotation % (phenotypeSpecies.phenotypes.length - 1);
    const pruningSpecies = [SPECIES.golden, SPECIES.jade, SPECIES.heart][rotation % 3];
    const entries = [
      { slot: "grow", tier: 0, size: [45, 55, 50][rotation % 3], bonus: [12, 15, 14][rotation % 3] },
      { slot: "prune", species: pruningSpecies.id, size: [70, 65, 75][rotation % 3], quality: 3, bonus: 23 },
      { slot: "phenotype", species: phenotypeSpecies.id, pheno, bonus: 24 + 9 * phenotypeSpecies.tier },
    ].map(order => pinned?.slot === order.slot ? pinned : { ...order, id: day + "-" + order.slot });
    state.orders = { day, rotation, entries };
  }

  function orderMatches(order, plant) {
    return (order.species === undefined || plant.species === order.species) &&
      (order.tier === undefined || SPECIES[plant.species].tier === order.tier) &&
      (order.pheno === undefined || plant.pheno === order.pheno) &&
      plant.size >= (order.size || 0) && plant.quality >= (order.quality || 0);
  }

  function toggleOrderPin(state, order) {
    if (!state.orders.entries.includes(order) || order.fulfilled) return false;
    const pin = !order.pinned;
    for (const entry of state.orders.entries) entry.pinned = pin && entry === order;
    return pin;
  }

  function deliverOrder(state, order, plant) {
    if (!state.orders.entries.includes(order) || order.fulfilled || !state.plants.includes(plant) ||
        !orderMatches(order, plant)) return 0;
    const payout = salePrice(plant) + order.bonus;
    state.coins += payout;
    state.plants = state.plants.filter(item => item !== plant);
    order.fulfilled = true;
    order.pinned = false;
    return payout;
  }

  function parentProblem(plant, now) {
    if (plant.size < 42) return "Needs 42% growth";
    if (plant.health < 72) return "Needs 72% health";
    if (plant.bredUntil > now) return "Recovering after breeding";
    return "";
  }

  function crossPreview(a, b) {
    const x = SPECIES[a.species];
    const y = SPECIES[b.species];
    if (x.id === y.id || x.tier !== y.tier || x.tier === 3) return null;
    const [low, high] = [x.position, y.position].sort((l, r) => l - r);
    return CATALOG[(x.tier + 1) * 5 + ((low + 2 * high - 1) % 5)];
  }

  function breed(state, a, b, now, random = Math.random) {
    if (!a || !b || a.id === b.id || freeSlots(state) < 1 || state.coins < CROSS_COST ||
        parentProblem(a, now) || parentProblem(b, now)) return null;
    const target = crossPreview(a, b);
    const chance = random();
    const inherited = random() < .5 ? a : b;
    const species = target && chance < .72 ? target : SPECIES[inherited.species];
    const matchingParents = [a, b].filter(plant => plant.species === species.id);
    const chosen = matchingParents.length === 2 ? inherited : matchingParents[0];
    const pheno = chosen && random() < .62
      ? chosen.pheno
      : Math.floor(random() * species.phenotypes.length);
    const duration = [4, 6, 10, 16][species.tier] * MINUTE;
    const parents = [a, b].map(({ id, species, pheno }) => ({ id, species, pheno }));
    const seed = { id: state.nextId++, species: species.id, pheno, readyAt: now + duration, parents };
    state.seeds.push(seed);
    state.coins -= CROSS_COST;
    a.bredUntil = b.bredUntil = now + duration + 3 * MINUTE;
    return seed;
  }

  function potSeed(state, seed, now) {
    if (!seed || seed.readyAt > now || !state.seeds.includes(seed)) return null;
    state.seeds = state.seeds.filter(item => item.id !== seed.id);
    const plant = addPlant(state, seed.species, seed.pheno, now, "seedling");
    state.journal.unshift({
      id: plant.id, species: plant.species, pheno: plant.pheno, parents: seed.parents || [], pottedAt: now,
    });
    state.history.harvested = true;
    if (SPECIES[seed.species].tier >= 2) state.history.rareCross = true;
    return plant;
  }

  const GOALS = [
    { name: "A second chance", description: "Water, move, and prune your pothos to reach 72% health.", reward: 14, test: s => s.history.recovered },
    { name: "Make room for company", description: "Buy a plant from the market.", reward: 8, test: s => s.history.bought },
    { name: "New roots", description: "Pot your first seedling in the breeding room.", reward: 18, test: s => s.history.harvested },
    { name: "A rare discovery", description: "Breed a Rare or Legendary plant.", reward: 40, test: s => s.history.rareCross },
    { name: "The complete collection", description: "Discover all 20 plant species.", reward: 150, test: s => new Set(s.discovered.map(key => key.split(":")[0])).size === CATALOG.length },
  ];

  return {
    MINUTE, HOUR, CROSS_COST, RARITIES, LOCATIONS, CATALOG, SPECIES, SUPPLIES, GOALS, clamp,
    phaseAt, careNeeds, fresh, addPlant, advance, displayRate, salePrice, shelfCost, freeSlots,
    speciesUnlocked, marketStock, nextRestock, buyPlant, rotateOrders, nextOrderDay, orderMatches,
    toggleOrderPin, deliverOrder, parentProblem, crossPreview, breed, potSeed,
  };
})();
