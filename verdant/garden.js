/* Catalog and real-time simulation. Each cross is a game mechanic. */
"use strict";

window.Garden = (() => {
  const MINUTE = 60_000;
  const HOUR = 60 * MINUTE;
  const RESTOCK_INTERVAL = 5 * MINUTE;
  const ROTATING_COMMONS = 4;
  const CROSS_COST = 5;
  const INHERITED_TRAIT_CHANCE = .62;
  const FAVOR_WEIGHT = .80;
  const STARTING_DISPLAY_SPOTS = 2;
  const STARTING_SHELF_SPACE = 4;
  const MAX_SHELF_UPGRADES = 50;
  const RARITIES = ["Common", "Uncommon", "Rare", "Legendary"];
  const PHASES = [
    { name: "Night", icon: "moon", until: 6, evaporation: .57, growth: .36 },
    { name: "Morning", icon: "sun", until: 11, evaporation: .9, growth: 1.18 },
    { name: "Afternoon", icon: "sun", until: 17, evaporation: 1.35, growth: 1.34 },
    { name: "Evening", icon: "sunset", until: 20, evaporation: .76, growth: .82 },
    { name: "Night", icon: "moon", until: 24, evaporation: .57, growth: .36 },
  ];
  const LOCATIONS = ["Shade", "Window", "Grow lamp"];
  const GROW_LAMP = 2;
  const GROW_LAMP_SLOTS = 2;
  const FULL_LAMP = { growth: 1.6, drying: 1.65 };
  const DIMMED_LAMP = { growth: 1.35, drying: 1.3 };
  const TREE_BRANCHES = ["Lower left", "Lower right", "Middle left", "Upper right", "Crown"];
  const BRANCH_LIMIT = 24;
  const STATION_UPGRADES = {
    tray: { name: "Humidity tray", cost: 24, stations: [0, 1, 2], description: "Plants here lose humidity 65% more slowly." },
    curtain: { name: "Shade curtain", cost: 38, stations: [1], description: "Filters afternoon sun for shade-loving plants and slows soil drying." },
    timer: { name: "Lamp timer", cost: 46, stations: [GROW_LAMP], description: "Dims the lamp during the day. Growth and drying are gentler, and afternoon shade-lovers can use it." },
  };
  const POT_STYLES = {
    original: { name: "Original pot", cost: 0 },
    terracotta: { name: "Terracotta", cost: 8 },
    ceramic: { name: "Blue glazed ceramic", cost: 12 },
    shallow: { name: "Shallow stoneware", cost: 10 },
  };
  const SOIL_MIXES = {
    standard: { name: "Standard mix", cost: 0, drying: 1 },
    retaining: { name: "Moisture-retaining mix", cost: 6, drying: .75 },
    draining: { name: "Fast-draining mix", cost: 6, drying: 1.3 },
  };
  const potStyle = plant => Object.hasOwn(POT_STYLES, plant.pot) ? plant.pot : "original";
  const soilMix = plant => Object.hasOwn(SOIL_MIXES, plant.soil) ? plant.soil : "standard";
  const CLASSIC_GROUP_SIZE = 5;
  const CLASSIC_SPECIES_COUNT = RARITIES.length * CLASSIC_GROUP_SIZE;
  const WOODY_GROUP_START = 8;
  const MARKET_PRICES = [
    [13, 16, 17, 19, 21, 17, 20, 22, 24, 21],
    [38, 43, 48, 53, 58, 46, 55, 62, 59, 66],
    [105, 118, 131, 144, 157, 123, 149, 164, 170, 155],
    [275, 305, 335, 365, 395, 345, 380, 425, 430, 450],
  ];
  const GROUPS = [
    [
      ["golden", "Golden Pothos", "trailing", "#55763e", ["Golden Speckle", "Jade", "Lemon Splash"], "A forgiving trailing vine with golden flecks."],
      ["jade", "Jade Plant", "succulent", "#66864e", ["Classic Green", "Crimson Edge"], "Rounded leaves stack up like little green coins."],
      ["spider", "Spider Plant", "grass", "#6a9046", ["Green Stripe", "Ivory Ribbon", "Lime Twist"], "Arching ribbons spill over the sides of its pot."],
      ["heart", "Heartleaf", "heart", "#3a784a", ["Emerald", "Copper Heart", "Lime Veins", "Snow Edge"], "A climber with soft, heart-shaped foliage."],
      ["boston", "Boston Fern", "fern", "#658436", ["Featherleaf", "Moss Lace"], "A cloud of finely divided fronds."],
      ["peperomia", "Coin Peperomia", "succulent", "#477e6b", ["Rain Coin", "Red Rim", "Lime Coin"], "Plump round leaves hold a glossy sheen."],
      ["wax", "Wax Begonia", "bush", "#856459", ["Bronze Leaf", "Green Wax", "Rose Wash"], "Small bronze leaves cluster into a tidy mound."],
      ["swedish", "Swedish Ivy", "trailing", "#3e8156", ["Bright Green", "White Ruffle", "Copper Margin", "Lemon Ruffle"], "Rounded scalloped leaves spill over the pot."],
      ["ficus", "Ficus Bonsai", "tree", "#588051", ["Glossy Green", "Lemon Tip", "Cream Edge", "Copper Leaf"], "Glossy little leaves sit above a thick, curved trunk."],
      ["umbrella", "Dwarf Umbrella Tree", "tree", "#4e805a", ["Emerald Fan", "Gold Fan", "Pearl Edge", "Jade Splash"], "Fans of rounded leaflets gather at the ends of its branches."],
    ],
    [
      ["polka", "Polka Dot Plant", "bush", "#9f5769", ["Blush", "White Confetti", "Berry Freckle", "Ruby Dots"], "Freckled leaves with a painterly finish."],
      ["velvet", "Velvet Alocasia", "shield", "#355857", ["Green Velvet", "Silver Vein", "Cinder", "Ghost Shield"], "Dark, velvety shields catch the light along their veins."],
      ["purple", "Purple Oxalis", "flower", "#805177", ["Plum", "Wine Star", "Pink Flutter", "Frost Plum", "Copper Wing"], "Triangular leaves fold into delicate clusters."],
      ["snake", "Moonshine Snake Plant", "spear", "#809c73", ["Moonshine", "Jade Edge", "Butter Stripe"], "Upright leaves show a soft, silvery sheen."],
      ["prayer", "Prayer Plant", "heart", "#4f754e", ["Red Vein", "Lemon Line", "Night Stripe", "Painted Pearl"], "Patterned foliage lifts toward evening."],
      ["nerve", "Nerve Plant", "bush", "#66846a", ["White Net", "Pink Net", "Crimson Net", "Lime Thread", "Snow Net"], "A fine mesh of bright veins covers the foliage."],
      ["rex", "Rex Begonia", "shield", "#765466", ["Silver Spiral", "Burgundy Swirl", "Mint Rim", "Rose Ring", "Mosaic"], "Broad leaves carry rings of purple and silver."],
      ["ponytail", "Ponytail Palm", "grass", "#718c56", ["Long Curl", "Gold Ribbon", "Seafoam", "Silver Curl"], "Long, narrow leaves arch out from the center."],
      ["elm", "Chinese Elm Bonsai", "tree", "#647d42", ["Silk Green", "Amber Tips", "Silver Tooth", "Sage Lace", "Spring Chartreuse"], "Small toothed leaves form a dense canopy over its zigzag trunk."],
      ["pomegranate", "Dwarf Pomegranate", "tree", "#647d4f", ["Scarlet Bloom", "Coral Bloom", "Ivory Bloom", "Copper Leaf", "Apricot Bloom"], "Warm-colored blooms stand out along the woody branches."],
    ],
    [
      ["pink", "Pink Princess", "shield", "#385e43", ["Rose Sector", "Dark Cherry", "Bubblegum", "Marble Rose", "Cream Flame"], "Rose-colored patches break up its deep green leaves."],
      ["jewel", "Jewel Orchid", "flower", "#68466a", ["Copper Net", "Gold Rain", "Ivory Vein", "Ruby Thread", "Obsidian", "Luminous Pink"], "Fine metallic lines trace the leaves beneath its blooms."],
      ["blue", "Blue Star Fern", "fern", "#45847a", ["Blue Star", "Mist Blue", "Jade Wave", "Sea Glass", "Silver Frond"], "Sculptural fronds carry a blue-green cast."],
      ["cotton", "Cotton Candy Caladium", "heart", "#b36178", ["Candy Floss", "Raspberry", "Pearl Heart", "Blush Vein", "White Flame", "Peach Halo"], "Color gathers along the broad leaves and branching veins."],
      ["string", "String of Rubies", "trailing", "#8f5369", ["Wine Beads", "Green Flame", "Rose Dew", "Garnet", "Plum Splash"], "Long trails of ruby-tinted leaves tumble from the pot."],
      ["satin", "Silver Satin Pothos", "trailing", "#729789", ["Silver Splash", "Moon Stripe", "Sea Glass", "Fine Dust", "Pearl Rim", "Ice Patch"], "Pale satin flecks shine against trailing green leaves."],
      ["strawberry", "Strawberry Begonia", "succulent", "#936870", ["Ruby Runner", "Blush Ring", "Ivory Edge", "Velvet Red", "Mint Fan"], "Rosy runners carry small rounded leaves."],
      ["painted", "Painted Lady Philodendron", "shield", "#88a452", ["Watercolor", "Lime Speckle", "Pink Stem", "Cream Splash", "Olive Brush", "Golden Brush"], "Yellow-green strokes mark its pointed leaves."],
      ["maple", "Japanese Maple Bonsai", "tree", "#94554f", ["Crimson Star", "Copper Flame", "Golden Star", "Rose Ember", "Wine Veil", "Spring Jade"], "Lobed leaves spread out over delicate branches."],
      ["olive", "Olive Bonsai", "tree", "#7d8b70", ["Silver Grove", "Sage Twist", "Gold Edge", "Deep Olive", "Winter Mist"], "A broad trunk supports narrow leaves with silvery undersides."],
    ],
    [
      ["constellation", "Thai Constellation", "monstera", "#4d783f", ["Star Map", "Milky Way", "Cream Sector", "Lime Galaxy", "White Nova", "Mint Orbit", "Sunspot", "Silver Comet"], "Split leaves carry constellations of pale speckles."],
      ["spirit", "Spirit Philodendron", "shield", "#8eae78", ["Mint Ghost", "Candlelight", "Silver Flame", "Moon Jade", "Pink Apparition", "Frost"], "New growth unfurls in unusually pale shades."],
      ["black", "Black Bat Flower", "flower", "#533a59", ["Ink Wing", "Violet Night", "Red Velvet", "White Bat", "Silver Whisker", "Black Pearl", "Ember"], "Spidery blooms hover above broad tropical leaves."],
      ["glass", "Glass Succulent", "succulent", "#75a899", ["Clear Mint", "Opal", "Rose Quartz", "Amber Glass", "Sea Crystal", "Blue Chalcedony", "Frosted Jade", "Lavender Ice"], "Translucent tips glow like polished stones."],
      ["fire", "Firefly Fern", "fern", "#829143", ["Golden Lantern", "Lime Spark", "Copper Glow", "Ivory Ember", "Mint Lantern", "Rose Flicker", "Sun Shower"], "Bright new fronds seem to catch stray rays of light."],
      ["queen", "Queen Anthurium", "shield", "#304f42", ["Silver Crown", "Night Vein", "Gold Thread", "Ivory Crown", "Black Velvet", "Pale Jade", "Rose Vein"], "Long velvety leaves carry a central vein like silver thread."],
      ["echeveria", "Ghost Echeveria", "succulent", "#a0a6a4", ["Moon Dust", "Lavender Frost", "Mint Glass", "Rose Tips", "Pearl Mist", "Ice Blue", "Sunset Rim"], "Powdery leaves form a pale, tightly layered rosette."],
      ["aurora", "Aurora Tradescantia", "trailing", "#785783", ["Borealis", "Pink Sky", "Violet Dawn", "Silver Ribbon", "Lime Haze", "Dusk Stripe", "Rose Aurora", "White Night"], "Stripes of lilac and green wind down its stems."],
      ["wisteria", "Wisteria Bonsai", "tree", "#8175a0", ["Lilac Cascade", "White Rain", "Violet Silk", "Blush Cascade", "Midnight Grape", "Blue Veil", "Pearl Lilac"], "Pendant clusters hang beneath a spreading crown."],
      ["juniper", "Moonlight Juniper", "tree", "#62877c", ["Moon Silver", "Blue Needle", "Winter Jade", "Silver Cloud", "Gold Mist", "Frost Tip", "Deep Pine", "Ghost Teal"], "Silvery needles gather in small clouds above an angled trunk."],
    ],
  ].map((entries, tier) => entries.map(([id, name, shape, color, phenotypes, note], position) => ({
    id, name, shape, color, phenotypes, note, tier, position, price: MARKET_PRICES[tier][position],
  })));
  const CATALOG = GROUPS.flat();
  const SPECIES = Object.fromEntries(CATALOG.map(species => [species.id, species]));
  const SUPPLIES = {
    fertilizer: { name: "Fertilizer", icon: "fertilizer", cost: 12, quantity: 3, description: "3 doses that support healthy growth." },
    tonic: { name: "Root tonic", icon: "heart", cost: 8, quantity: 2, description: "2 doses to help a struggling plant recover." },
  };
  const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));

  function traitsFor(plant) {
    if (plant.traits) return plant.traits;
    // Give specimens from older saves a stable appearance and value.
    let hash = 2166136261;
    for (const character of [plant.species, plant.pheno, plant.id].join(":")) {
      hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
    }
    return {
      stature: (hash >>> 0) % 101,
      leafSize: ((hash ^ (hash >>> 13)) >>> 0) % 101,
    };
  }

  function traitScales(plant) {
    const { stature, leafSize } = traitsFor(plant);
    return { form: .76 + stature * .0029, leaf: .73 + leafSize * .0053 };
  }

  function inheritTraits(a, b, random) {
    const first = traitsFor(a);
    const second = traitsFor(b);
    const blend = (left, right) => {
      const weight = .22 + random() * .56;
      const variation = (random() - .5) * 14;
      return clamp(Math.round(left * weight + right * (1 - weight) + variation));
    };
    return { stature: blend(first.stature, second.stature), leafSize: blend(first.leafSize, second.leafSize) };
  }

  function phaseAt(now) {
    const date = new Date(now);
    return PHASES.find(phase => date.getHours() < phase.until);
  }

  function lightTarget(species, now) {
    const phase = phaseAt(now).name;
    if (phase === "Night") return species.tier >= 2 ? GROW_LAMP : 0;
    if (phase === "Afternoon" && ["fern", "shield", "heart", "flower"].includes(species.shape)) return 0;
    return 1;
  }

  function lampPlantCount(state) {
    return state.plants.filter(plant => plant.location === GROW_LAMP).length;
  }

  function stationHasRoom(state, location) {
    return location !== GROW_LAMP || (state != null && lampPlantCount(state) < GROW_LAMP_SLOTS);
  }

  function enforceLampLimit(state) {
    let occupied = 0;
    for (const plant of state.plants) {
      if (plant.location !== GROW_LAMP) continue;
      occupied++;
      if (occupied > GROW_LAMP_SLOTS) plant.location = 1;
    }
  }

  function makePlant(state, speciesId, pheno, now, source, traits) {
    const species = SPECIES[speciesId];
    const starter = source === "starter";
    const seedling = source === "seedling";
    const target = starter
      ? LOCATIONS.findIndex((_, spot) => !lightWorks({ species: speciesId }, now, spot, state))
      : lightTarget(species, now);
    const location = stationHasRoom(state, target) ? target : 1;
    return {
      id: state.nextId++, species: speciesId, pheno,
      traits: traits ? { ...traits } : { stature: Math.round(Math.random() * 100), leafSize: Math.round(Math.random() * 100) },
      health: starter ? 38 : seedling ? 86 : 82,
      water: starter ? 19 : seedling ? 55 : 51,
      humidity: starter ? 50 : 68,
      nutrients: starter ? 31 : seedling ? 65 : 59,
      size: starter ? 37 : seedling ? 8 : 36,
      quality: 0, location,
      fedAt: null, mistedAt: null, tonicAt: null, prunedAt: null, bredUntil: 0, onDisplay: false,
    };
  }

  function discover(state, plant) {
    const key = plant.species + ":" + plant.pheno;
    if (!state.discovered.includes(key)) state.discovered.push(key);
  }

  function initializeProgression(state) {
    state.automation ??= {};
    state.promotionLevel ??= 0;
    state.quests ??= { claimed: [] };
    state.exhibitions ??= {};
    state.stats ??= {};
    state.stats.ordersCompleted ??= state.orders?.refills ?? 0;
    state.stats.displayEarned ??= Math.max(0, state.displayBank || 0);
    return state;
  }

  function fresh(now) {
    const state = {
      version: 1, updatedAt: now, coins: 36, displayBank: 0, displaySpots: STARTING_DISPLAY_SPOTS, capacity: STARTING_SHELF_SPACE, shelfUpgrades: 0,
      nextId: 1, inventory: { fertilizer: 2, tonic: 0 }, plants: [], seeds: [], discovered: [],
      history: { recovered: false, bought: false, harvested: false, rareCross: false },
      claimed: [], selected: 1, journal: [],
      marketPurchases: { window: -1, quantities: {} }, orders: null, stationUpgrades: [[], [], []],
    };
    const plant = makePlant(state, "golden", 0, now, "starter");
    state.plants.push(plant);
    discover(state, plant);
    return initializeProgression(state);
  }

  function addPlant(state, species, pheno, now, source, traits) {
    const plant = makePlant(state, species, pheno, now, source, traits);
    state.plants.push(plant);
    discover(state, plant);
    state.selected = plant.id;
    return plant;
  }

  function updatePortraits(state, plant, changes) {
    Object.assign(plant, changes);
    const record = state.journal.find(entry => entry.id === plant.id);
    if (record) Object.assign(record, changes);
    for (const entry of [...state.journal, ...state.seeds]) {
      for (const parent of entry.parents ?? []) {
        if (parent.id === plant.id) Object.assign(parent, changes);
      }
    }
  }

  function renamePlant(state, plant, name) {
    if (!state.plants.includes(plant) || typeof name !== "string") return false;
    const nickname = [...name.trim().replace(/\s+/g, " ")].slice(0, 24).join("");
    updatePortraits(state, plant, { nickname });
    return true;
  }

  function repotCost(plant, pot, soil) {
    if (!Object.hasOwn(POT_STYLES, pot) || !Object.hasOwn(SOIL_MIXES, soil)) return null;
    if (pot === potStyle(plant) && soil === soilMix(plant)) return null;
    const potCost = pot === potStyle(plant) ? 0 : POT_STYLES[pot].cost;
    const soilCost = soil === soilMix(plant) ? 0 : SOIL_MIXES[soil].cost;
    return potCost + soilCost;
  }

  function repotPlant(state, plant, pot, soil) {
    if (!state.plants.includes(plant)) return false;
    const cost = repotCost(plant, pot, soil);
    if (cost === null || state.coins < cost) return false;
    state.coins -= cost;
    updatePortraits(state, plant, { pot, soil });
    return true;
  }

  function displayMultiplier(state) {
    const ribbons = Object.keys(EXHIBITIONS).filter(id => state?.exhibitions?.[id]?.wins > 0).length;
    return 1 + (state?.promotionLevel ?? 0) * .1 + ribbons * .05;
  }

  function displayRate(plant, state) {
    const tier = SPECIES[plant.species].tier;
    return [.38, .86, 1.84, 3.5][tier] *
      (1 + (plant.size / 60) ** 2 + plant.quality * .52) *
      (.38 + .62 * plant.health / 100) * (1 + plant.pheno * .055) * displayMultiplier(state);
  }

  function displayedPlants(state) {
    return state.plants.filter(plant => plant.onDisplay);
  }

  function displayCapacity(state) {
    return state.displaySpots ?? STARTING_DISPLAY_SPOTS;
  }

  function displaySpotCost(state) {
    return 50 + (displayCapacity(state) - STARTING_DISPLAY_SPOTS) * 30;
  }

  function buyDisplaySpot(state) {
    const cost = displaySpotCost(state);
    if (state.coins < cost) return false;
    state.coins -= cost;
    state.displaySpots = displayCapacity(state) + 1;
    return true;
  }

  function enforceDisplayLimit(state) {
    const displayed = displayedPlants(state);
    const limit = displayCapacity(state);
    if (displayed.length <= limit) return;
    displayed.sort((a, b) => displayRate(b) - displayRate(a));
    for (const plant of displayed.slice(limit)) plant.onDisplay = false;
  }

  function setDisplay(state, plant, replace) {
    if (!state.plants.includes(plant)) return false;
    if (plant.onDisplay && !replace) {
      plant.onDisplay = false;
      pauseCurator(state);
      return true;
    }
    if (plant.onDisplay) return false;
    if (replace) {
      if (!state.plants.includes(replace) || !replace.onDisplay) return false;
      replace.onDisplay = false;
    } else if (displayedPlants(state).length >= displayCapacity(state)) {
      return false;
    }
    plant.onDisplay = true;
    pauseCurator(state);
    return true;
  }

  function salePrice(plant) {
    const tier = SPECIES[plant.species].tier;
    const { stature, leafSize } = traitsFor(plant);
    const specimenValue = 1 + stature * .0045 + leafSize * .003;
    return Math.max(2, Math.round([7, 18, 44, 105][tier] *
      (.5 + 3.1 * (plant.size / 100) ** 2 + .38 * plant.quality) *
      (.38 + .62 * plant.health / 100) * (1 + plant.pheno * .09) * specimenValue));
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

  function hasUpgrade(state, location, upgrade) {
    return state?.stationUpgrades?.[location]?.includes(upgrade) ?? false;
  }

  function buyUpgrade(state, location, id) {
    const upgrade = STATION_UPGRADES[id];
    if (!upgrade?.stations?.includes(location) || hasUpgrade(state, location, id) || state.coins < upgrade.cost) return false;
    state.stationUpgrades[location].push(id);
    state.coins -= upgrade.cost;
    return true;
  }

  function curtainClosed(now, location, state) {
    return location === 1 && hasUpgrade(state, location, "curtain") && phaseAt(now).name === "Afternoon";
  }

  function lampDimmed(now, state) {
    return hasUpgrade(state, GROW_LAMP, "timer") && phaseAt(now).name !== "Night";
  }

  function growLampEffects(now, state) {
    return lampDimmed(now, state) ? DIMMED_LAMP : FULL_LAMP;
  }

  function lightWorks(plant, now, location = plant.location, state) {
    const ideal = lightTarget(SPECIES[plant.species], now);
    return location === ideal ||
      (ideal === 0 && curtainClosed(now, location, state)) ||
      (location === GROW_LAMP && (ideal === 1 || lampDimmed(now, state)));
  }

  function dryingRate(plant, now, location = plant.location, state) {
    const species = SPECIES[plant.species];
    const shapeFactor = species.shape === "succulent" ? .57 : species.shape === "fern" ? 1.21 : 1;
    const locationFactor = location === GROW_LAMP ? growLampEffects(now, state).drying :
      location === 0 || curtainClosed(now, location, state) ? .84 : 1;
    return [1.35, 1.85, 2.55, 3.35][species.tier] * phaseAt(now).evaporation * shapeFactor * locationFactor * SOIL_MIXES[soilMix(plant)].drying;
  }

  function movePlant(plant, location, now, state) {
    if (!LOCATIONS[location] || plant.location === location || !stationHasRoom(state, location)) return false;
    const correctLight = lightWorks(plant, now, location, state);
    const wasCorrect = lightWorks(plant, now, plant.location, state);
    plant.location = location;
    if (!correctLight || !wasCorrect) plant.health = clamp(plant.health + (correctLight ? 10 : -10), 10);
    return true;
  }

  function branchAngles(plant) {
    return TREE_BRANCHES.map((_, i) => {
      const angle = plant.training?.[i];
      return Number.isFinite(angle) ? clamp(Math.round(angle), -BRANCH_LIMIT, BRANCH_LIMIT) : 0;
    });
  }

  function trainBranches(plant, angles) {
    if (SPECIES[plant.species].shape !== "tree" || !Array.isArray(angles) || angles.length !== TREE_BRANCHES.length) return false;
    plant.training = branchAngles({ training: angles });
    return true;
  }

  function waterRange(plant, now) {
    const { dry, wet } = careNeeds(plant, now);
    return { min: dry + 10, max: wet - 8 };
  }

  function waterPlant(plant, amount, now) {
    if (amount <= 0 || plant.water >= 100) return;
    const previous = plant.water;
    const { dry, wet } = careNeeds(plant, now);
    plant.water = clamp(previous + amount);
    if (plant.water > wet) {
      plant.health = clamp(plant.health - Math.min(10, 3 + (plant.water - wet) * .35), 10);
    } else if (previous < dry && plant.water >= dry) {
      const range = waterRange(plant, now);
      const bonus = plant.water >= range.min && plant.water <= range.max ? 3 : 0;
      plant.health = clamp(plant.health + 17 + bonus);
    }
  }

  function pruningReadyAt(plant) {
    return plant.prunedAt === null ? 0 : plant.prunedAt + 12 * HOUR;
  }

  function canPrune(plant, now) {
    return pruningReadyAt(plant) <= now && (plant.quality < 5 || plant.health < 85);
  }

  function pruningCutCount(plant) {
    return 2 + Math.floor(clamp(plant.size) / 19);
  }

  function prunePlant(plant, now) {
    if (!canPrune(plant, now)) return false;
    plant.health = clamp(plant.health + (plant.health < 72 ? 10 : 3));
    plant.quality = Math.min(5, plant.quality + 1);
    plant.size -= Math.min(1, Math.max(0, plant.size - 8));
    plant.prunedAt = now;
    return true;
  }

  function advance(state, now) {
    initializeProgression(state);
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
      curateDisplays(state);
      for (const plant of state.plants) {
        const species = SPECIES[plant.species];
        const tier = species.tier;
        const needs = careNeeds(plant, cursor);
        const waterLoss = dryingRate(plant, cursor, plant.location, state);
        const water = clamp(plant.water - waterLoss * hours / 2);
        const humidityLoss = [.6, 1.35, 2.3, 3.4][tier] * phase.evaporation *
          (hasUpgrade(state, plant.location, "tray") ? .35 : 1);
        const humidity = clamp(plant.humidity - humidityLoss * hours / 2);
        const nutrientLoss = [.40, .66, .92, 1.29][tier];
        const nutrients = clamp(plant.nutrients - nutrientLoss * hours / 2);
        const stress = (water < needs.dry ? .64 + (needs.dry - water) * .047 : 0) +
          (water > needs.wet ? .43 + (water - needs.wet) * .07 : 0) +
          (humidity < needs.humidity ? .4 + (needs.humidity - humidity) * .03 : 0) +
          (nutrients < needs.food ? .22 + tier * .14 : 0) +
          (lightWorks(plant, cursor, plant.location, state) ? 0 : [.16, .42, .75, 1.18][tier]);
        const change = stress ? -stress * (1 + tier * .14) : (plant.health < 90 ? 2.65 : .65);
        const health = clamp(plant.health + change * hours / 2, 10);
        if (plant.onDisplay) {
          const income = displayRate({ ...plant, health }, state) * hours;
          state.displayBank += income;
          state.stats.displayEarned += income;
        }
        const growthFactor = stress ? .23 : plant.location === GROW_LAMP ? growLampEffects(cursor, state).growth : 1;
        const grow = health >= 60
          ? growthFactor * phase.growth * (1 + nutrients / 160) * (1 + .10 * plant.quality) / (1 + .16 * tier)
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
    curateDisplays(state);
    if (state.automation.collector?.enabled) collectDisplayCoins(state);
    state.updatedAt = now;
  }

  function upgradeSavedShelves(state) {
    if (Number.isInteger(state.shelfUpgrades)) return;
    // Before doubling, every purchase added two spaces.
    const capacity = Number.isSafeInteger(state.capacity) ? state.capacity : STARTING_SHELF_SPACE;
    const upgrades = Math.floor((capacity - STARTING_SHELF_SPACE) / 2);
    state.shelfUpgrades = clamp(upgrades, 0, MAX_SHELF_UPGRADES);
    state.capacity = STARTING_SHELF_SPACE * 2 ** state.shelfUpgrades;
  }

  function shelfCost(state) {
    return state.shelfUpgrades >= MAX_SHELF_UPGRADES ? null : 28 * 2 ** state.shelfUpgrades;
  }

  function buyShelfUpgrade(state) {
    const cost = shelfCost(state);
    if (cost === null || state.coins < cost) return false;
    state.coins -= cost;
    state.shelfUpgrades++;
    state.capacity *= 2;
    return true;
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
    const window = marketWindow(state, now);
    if (species.tier === 0) {
      if (species.id === "golden") return Infinity;
      const alternatives = GROUPS[0].length - 1;
      const first = (window * ROTATING_COMMONS) % alternatives;
      const offset = (species.position - 1 - first + alternatives) % alternatives;
      return offset < ROTATING_COMMONS ? Infinity : 0;
    }
    const cadence = [0, 2, 4, 8][species.tier];
    const offset = [0, 0, 1, 3][species.tier];
    const rotation = Math.floor(window / cadence);
    const group = GROUPS[species.tier];
    if (window % cadence !== offset || rotation % group.length !== species.position) return 0;
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

  const orderRequests = {
    grow: (_, i) => ({ tier: 0, size: [45, 55, 50][i % 3], bonus: [12, 15, 14][i % 3] }),
    prune: (_, i) => ({
      species: ["golden", "jade", "heart"][i % 3], size: [70, 65, 75][i % 3], quality: 3, bonus: 23,
    }),
    phenotype: (state, i) => {
      const specialty = CATALOG.filter(species => species.tier > 0 && speciesUnlocked(state, species));
      const candidates = [SPECIES.golden, ...specialty];
      const species = candidates[i % candidates.length];
      const variant = Math.floor(i / candidates.length);
      return { species: species.id, pheno: 1 + variant % (species.phenotypes.length - 1), bonus: 24 + 9 * species.tier };
    },
    healthy: (_, i) => ({ tier: 0, health: [88, 92, 95][i % 3], bonus: [10, 13, 16][i % 3] }),
    bonsai: (_, i) => ({
      shape: "tree", size: [45, 55, 65][i % 3], quality: [1, 2, 2][i % 3], bonus: [18, 22, 26][i % 3],
    }),
    windowsill: (_, i) => ({
      species: ["spider", "boston", "peperomia", "wax", "swedish"][i % 5], size: [40, 46, 43][i % 3], bonus: 14,
    }),
  };

  function makeOrder(state, slot, previous) {
    const board = state.orders;
    let variant = previous ? (previous.variant ?? board.rotation) + 1 : board.rotation;
    let request = orderRequests[slot](state, variant);
    if (previous && Object.entries(request).every(([key, value]) => previous[key] === value)) {
      request = orderRequests[slot](state, ++variant);
    }
    const baseId = board.day + "-" + slot;
    if (previous) board.refills++;
    const id = previous ? baseId + "-" + board.refills : baseId;
    return { ...request, slot, id, variant };
  }

  function rotateOrders(state, now) {
    const day = localDay(now);
    const previous = state.orders;
    const slots = Object.keys(orderRequests);
    if (previous && day <= previous.day) {
      if (previous.refills !== undefined) return;
      previous.refills = 0;
      // Keep any open requests in an earlier save, including its pin.
      previous.entries = slots.map(slot => {
        const order = previous.entries.find(item => item.slot === slot);
        return order && !order.fulfilled ? order : makeOrder(state, slot, order);
      });
      return;
    }

    const rotation = previous ? previous.rotation + day - previous.day : 0;
    const pinned = previous?.entries.find(order => order.pinned && !order.fulfilled);
    state.orders = { day, rotation, refills: 0, entries: [] };
    state.orders.entries = slots.map(slot => pinned?.slot === slot ? pinned : makeOrder(state, slot));
  }

  function orderMatches(order, plant) {
    const species = SPECIES[plant.species];
    return (order.species === undefined || plant.species === order.species) &&
      (order.tier === undefined || species.tier === order.tier) &&
      (order.shape === undefined || species.shape === order.shape) &&
      (order.pheno === undefined || plant.pheno === order.pheno) &&
      plant.size >= (order.size || 0) && plant.quality >= (order.quality || 0) && plant.health >= (order.health || 0);
  }

  function toggleOrderPin(state, order) {
    if (!state.orders.entries.includes(order) || order.fulfilled) return false;
    const pin = !order.pinned;
    for (const entry of state.orders.entries) entry.pinned = pin && entry === order;
    return pin;
  }

  function deliverOrder(state, order, plant) {
    const index = state.orders.entries.indexOf(order);
    if (index < 0 || order.fulfilled || !state.plants.includes(plant) || !orderMatches(order, plant)) return 0;
    initializeProgression(state);
    const replacement = makeOrder(state, order.slot, order);
    const payout = salePrice(plant) + order.bonus;
    state.coins += payout;
    state.plants = state.plants.filter(item => item !== plant);
    order.fulfilled = true;
    order.pinned = false;
    state.orders.entries[index] = replacement;
    state.stats.ordersCompleted++;
    return payout;
  }

  function parentProblem(plant, now) {
    if (plant.size < 42) return "Needs 42% maturity";
    if (plant.health < 72) return "Needs 72% health";
    if (plant.bredUntil > now) return "Recovering after breeding";
    return "";
  }

  function crossPreview(a, b) {
    const x = SPECIES[a.species];
    const y = SPECIES[b.species];
    if (x.id === y.id || x.tier !== y.tier || x.tier === 3) return null;
    const [low, high] = [x.position, y.position].sort((l, r) => l - r);
    const group = GROUPS[x.tier + 1];
    const variety = low + 2 * high - 1;
    // Keep prior recipes within their original set of possible offspring.
    const start = high < CLASSIC_GROUP_SIZE ? 0 : high < WOODY_GROUP_START ? CLASSIC_GROUP_SIZE : WOODY_GROUP_START;
    const end = start === 0 ? CLASSIC_GROUP_SIZE : start === CLASSIC_GROUP_SIZE ? WOODY_GROUP_START : group.length;
    return group[start + variety % (end - start)];
  }

  function favoredTraitParent(a, b, requestedId) {
    if (a.species !== b.species || a.pheno === b.pheno) return null;
    return requestedId === a.id || requestedId === b.id ? requestedId : null;
  }

  function firstParentWeight(a, favoredId) {
    return favoredId === null ? .5 : favoredId === a.id ? FAVOR_WEIGHT : 1 - FAVOR_WEIGHT;
  }

  function portrait(plant) {
    const { id, species, pheno, nickname, pot, soil } = plant;
    return { id, species, pheno, nickname, pot, soil, traits: { ...traitsFor(plant) } };
  }

  function crossHasParents(entry, firstId, secondId) {
    if (entry.source === "cutting" || entry.parents?.length !== 2) return false;
    const [first, second] = entry.parents;
    return (first.id === firstId && second.id === secondId) || (first.id === secondId && second.id === firstId);
  }

  function lastCrossResult(state, firstId, secondId) {
    return state.journal.find(entry => crossHasParents(entry, firstId, secondId));
  }

  function familyFor(state, id) {
    const owned = new Map(state.plants.map(plant => [plant.id, plant]));
    const recorded = new Map(state.journal.map(plant => [plant.id, plant]));
    const entry = recorded.get(id);
    const latest = record => owned.get(record.id) ?? recorded.get(record.id) ?? record;
    const offspring = state.journal.filter(item => (item.parents ?? []).some(parent => parent.id === id));
    const snapshot = offspring[0]?.parents.find(parent => parent.id === id);
    const specimen = owned.get(id) ?? entry ?? snapshot;
    if (!specimen) return null;

    const parents = (entry?.parents ?? []).map(latest);
    const siblings = parents.length === 2 ? state.journal.filter(item =>
      item.id !== id && crossHasParents(item, parents[0].id, parents[1].id)
    ) : [];
    return {
      specimen, parents, siblings: siblings.map(latest),
      offspring: offspring.map(record => ({ plant: latest(record), cutting: record.source === "cutting" })),
      cutting: entry?.source === "cutting",
    };
  }

  function breed(state, a, b, now, random = Math.random, requestedId = null) {
    if (!a || !b || a.id === b.id || freeSlots(state) < 1 || state.coins < CROSS_COST ||
        parentProblem(a, now) || parentProblem(b, now)) return null;
    const target = crossPreview(a, b);
    const chance = random();
    const favoredParentId = favoredTraitParent(a, b, requestedId);
    const inherited = random() < firstParentWeight(a, favoredParentId) ? a : b;
    const species = target && chance < .72 ? target : SPECIES[inherited.species];
    const matchingParents = [a, b].filter(plant => plant.species === species.id);
    const chosen = matchingParents.length === 2 ? inherited : matchingParents[0];
    const pheno = chosen && random() < INHERITED_TRAIT_CHANCE
      ? chosen.pheno
      : Math.floor(random() * species.phenotypes.length);
    const duration = [4, 6, 10, 16][species.tier] * MINUTE;
    const parents = [a, b].map(portrait);
    const traits = inheritTraits(a, b, random);
    const seed = { id: state.nextId++, species: species.id, pheno, readyAt: now + duration, parents, favoredParentId, traits };
    state.seeds.push(seed);
    state.coins -= CROSS_COST;
    a.bredUntil = b.bredUntil = now + duration + 3 * MINUTE;
    return seed;
  }

  function cuttingProblem(plant, now) {
    if (plant.size < 83) return "Needs 83% maturity";
    if (plant.health < 75) return "Needs 75% health";
    if ((plant.cutUntil || 0) > now) return "Recovering from its last cutting";
    return "";
  }

  function rootingTime(plant) {
    return [20, 35, 55, 75][SPECIES[plant.species].tier] * MINUTE;
  }

  function takeCutting(state, plant, now) {
    if (!state.plants.includes(plant) || freeSlots(state) < 1 || cuttingProblem(plant, now)) return null;
    const { species, pheno } = plant;
    const cutting = {
      id: state.nextId++, species, pheno, readyAt: now + rootingTime(plant),
      source: "cutting", parents: [portrait(plant)], traits: { ...traitsFor(plant) },
    };
    state.seeds.push(cutting);
    plant.size -= 8;
    plant.cutUntil = now + 12 * HOUR;
    return cutting;
  }

  function potSeed(state, seed, now) {
    if (!seed || seed.readyAt > now || !state.seeds.includes(seed)) return null;
    state.seeds = state.seeds.filter(item => item.id !== seed.id);
    const parents = (seed.parents ?? []).map(parent => state.plants.find(item => item.id === parent.id) || parent);
    const traits = seed.traits ?? (parents.length === 2
      ? inheritTraits(parents[0], parents[1], () => .5) : traitsFor(parents[0] ?? seed));
    const plant = addPlant(state, seed.species, seed.pheno, now, "seedling", traits);
    state.journal.unshift({
      id: plant.id, species: plant.species, pheno: plant.pheno, parents: parents.map(portrait), pottedAt: now,
      favoredParentId: seed.favoredParentId ?? null,
      source: seed.source, traits: { ...traits },
    });
    if (seed.source === "cutting") return plant;
    state.history.harvested = true;
    if (SPECIES[seed.species].tier >= 2) state.history.rareCross = true;
    return plant;
  }

  const discoveredCount = state => new Set(state.discovered.map(key => key.split(":")[0])).size;
  const AUTOMATIONS = {
    collector: {
      name: "Coin collector", cost: 120, species: 4, icon: "coin",
      description: "Transfers whole display coins into your wallet automatically, including while you are away.",
    },
    curator: {
      name: "Display curator", cost: 360, species: 10, icon: "display",
      description: "Keeps your highest-earning plants on display. Manual display changes pause the curator.",
    },
  };

  function collectDisplayCoins(state) {
    const amount = Math.floor(state.displayBank + .0000001);
    if (amount < 1) return 0;
    state.displayBank = Math.max(0, state.displayBank - amount);
    state.coins += amount;
    return amount;
  }

  function pauseCurator(state) {
    if (state.automation?.curator) state.automation.curator.enabled = false;
  }

  function curateDisplays(state) {
    if (!state.automation?.curator?.enabled) return;
    const ranked = [...state.plants].sort((a, b) => displayRate(b, state) - displayRate(a, state) || a.id - b.id);
    const selected = new Set(ranked.slice(0, displayCapacity(state)).map(plant => plant.id));
    for (const plant of state.plants) plant.onDisplay = selected.has(plant.id);
  }

  function buyAutomation(state, id) {
    initializeProgression(state);
    const upgrade = Object.hasOwn(AUTOMATIONS, id) && AUTOMATIONS[id];
    if (!upgrade || state.automation[id] || discoveredCount(state) < upgrade.species || state.coins < upgrade.cost) return false;
    state.coins -= upgrade.cost;
    state.automation[id] = { enabled: true };
    curateDisplays(state);
    if (state.automation.collector?.enabled) collectDisplayCoins(state);
    return true;
  }

  function toggleAutomation(state, id) {
    const upgrade = state.automation?.[id];
    if (!Object.hasOwn(AUTOMATIONS, id) || !upgrade) return false;
    upgrade.enabled = !upgrade.enabled;
    curateDisplays(state);
    if (state.automation.collector?.enabled) collectDisplayCoins(state);
    return true;
  }

  function promotionCost(state) {
    const level = state.promotionLevel ?? 0;
    return level >= 3 ? null : 600 * 2 ** level;
  }

  function buyPromotion(state) {
    initializeProgression(state);
    const cost = promotionCost(state);
    if (cost === null || discoveredCount(state) < 20 || state.coins < cost) return false;
    state.coins -= cost;
    state.promotionLevel++;
    return true;
  }

  const QUEST_TRACKS = [
    {
      id: "collection", name: "Botanical explorer", icon: "book",
      steps: [
        { name: "First discoveries", description: "Discover 5 species.", metric: "species", target: 5, reward: 35 },
        { name: "A growing field guide", description: "Discover 12 species.", metric: "species", target: 12, reward: 90 },
        { name: "A living library", description: "Discover 24 species.", metric: "species", target: 24, reward: 220 },
        { name: "Every silhouette revealed", description: "Discover all 40 species.", metric: "species", target: 40, reward: 500 },
        { name: "A complete botanical record", description: "Discover all 204 phenotypes.", metric: "phenotypes", target: 204, reward: 1200 },
      ],
    },
    {
      id: "breeding", name: "Patient breeder", icon: "dna",
      steps: [
        { name: "First generation", description: "Pot your first cross-bred seedling.", metric: "crosses", target: 1, reward: 25 },
        { name: "Family nursery", description: "Pot 5 cross-bred seedlings.", metric: "crosses", target: 5, reward: 65 },
        { name: "Branching families", description: "Pot 15 cross-bred seedlings.", metric: "crosses", target: 15, reward: 150 },
        { name: "Generations of growth", description: "Pot 30 cross-bred seedlings.", metric: "crosses", target: 30, reward: 330 },
        { name: "A breeder’s legacy", description: "Pot 60 cross-bred seedlings.", metric: "crosses", target: 60, reward: 700 },
      ],
    },
    {
      id: "craft", name: "Plant sculptor", icon: "prune",
      steps: [
        { name: "A practiced hand", description: "Keep a plant pruned to Shape 2.", metric: "shape", target: 2, reward: 30 },
        { name: "Perfect form", description: "Keep a plant pruned to Shape 5.", metric: "shape", target: 5, reward: 90 },
        { name: "A pair of living sculptures", description: "Own 2 mature trees with 80% health and Shape 3.", metric: "trainedTrees", target: 2, reward: 180 },
        { name: "Master bonsai collection", description: "Own 3 mature trees with 85% health and Shape 5.", metric: "masterTrees", target: 3, reward: 400 },
        { name: "The miniature forest", description: "Discover all 8 tree species.", metric: "treeSpecies", target: 8, reward: 650 },
      ],
    },
    {
      id: "orders", name: "Nursery enterprise", icon: "clipboard",
      steps: [
        { name: "First commissions", description: "Complete 3 collector orders.", metric: "orders", target: 3, reward: 35 },
        { name: "A trusted grower", description: "Complete 12 collector orders.", metric: "orders", target: 12, reward: 100 },
        { name: "A busy nursery", description: "Complete 30 collector orders.", metric: "orders", target: 30, reward: 250 },
        { name: "A flourishing display", description: "Earn 1,000 coins from plant displays.", metric: "displayIncome", target: 1000, reward: 500 },
        { name: "A garden of renown", description: "Earn 5,000 coins from plant displays.", metric: "displayIncome", target: 5000, reward: 1000 },
      ],
    },
  ];

  function questProgress(state, quest) {
    switch (quest.metric) {
      case "species": return discoveredCount(state);
      case "phenotypes": return state.discovered.length;
      case "crosses": return state.journal.filter(entry => entry.source !== "cutting" && entry.parents?.length === 2).length;
      case "shape": return state.plants.reduce((best, plant) => Math.max(best, plant.quality), 0);
      case "trainedTrees": return state.plants.filter(plant =>
        SPECIES[plant.species].shape === "tree" && plant.size >= 83 && plant.health >= 80 && plant.quality >= 3).length;
      case "masterTrees": return state.plants.filter(plant =>
        SPECIES[plant.species].shape === "tree" && plant.size >= 83 && plant.health >= 85 && plant.quality === 5).length;
      case "treeSpecies": return CATALOG.filter(species =>
        species.shape === "tree" && state.discovered.some(key => key.startsWith(species.id + ":"))).length;
      case "orders": return state.stats?.ordersCompleted ?? 0;
      case "displayIncome": return Math.floor(state.stats?.displayEarned ?? 0);
    }
  }

  function activeQuest(state, track) {
    const index = track.steps.findIndex((_, i) => !state.quests.claimed.includes(track.id + "-" + i));
    return index < 0 ? null : { ...track.steps[index], id: track.id + "-" + index, index };
  }

  function claimQuest(state, id) {
    initializeProgression(state);
    const quest = QUEST_TRACKS.map(track => activeQuest(state, track)).find(item => item?.id === id);
    if (!quest || questProgress(state, quest) < quest.target) return 0;
    state.quests.claimed.push(id);
    state.coins += quest.reward;
    return quest.reward;
  }

  const EXHIBITIONS = {
    common: {
      name: "Common masterpieces", icon: "leaf", reward: 120,
      description: "Common plants at 90% maturity, 85% health, and Shape 5.",
      test: plant => SPECIES[plant.species].tier === 0 && plant.size >= 90 && plant.health >= 85 && plant.quality === 5,
    },
    bonsai: {
      name: "The miniature forest", icon: "branch", reward: 240,
      description: "Trees at 83% maturity, 80% health, and Shape 4.",
      test: plant => SPECIES[plant.species].shape === "tree" && plant.size >= 83 && plant.health >= 80 && plant.quality >= 4,
    },
    rare: {
      name: "Rare canopy", icon: "star", reward: 360,
      description: "Rare or Legendary plants at 75% maturity, 80% health, and Shape 2.",
      test: plant => SPECIES[plant.species].tier >= 2 && plant.size >= 75 && plant.health >= 80 && plant.quality >= 2,
    },
  };

  function exhibitionStatus(state, id, now) {
    const exhibition = Object.hasOwn(EXHIBITIONS, id) && EXHIBITIONS[id];
    if (!exhibition) return null;
    const record = state.exhibitions?.[id];
    const wins = record?.wins ?? 0;
    const target = Math.min(5, 3 + Math.floor(wins / 2));
    const ranked = state.plants.filter(exhibition.test).sort((a, b) => displayRate(b, state) - displayRate(a, state));
    const unique = new Map();
    for (const plant of ranked) if (!unique.has(plant.species)) unique.set(plant.species, plant);
    const participants = [...unique.values()].slice(0, target);
    const unlocked = discoveredCount(state) >= 12;
    const enteredToday = record && localDay(now) <= record.lastDay;
    return {
      participants, target, wins, unlocked, enteredToday,
      ready: unlocked && !enteredToday && participants.length === target,
      reward: exhibition.reward + 20 * Math.min(wins, 10),
    };
  }

  function enterExhibition(state, id, now) {
    initializeProgression(state);
    const status = exhibitionStatus(state, id, now);
    if (!status?.ready) return 0;
    state.coins += status.reward;
    state.exhibitions[id] = {
      wins: status.wins + 1, lastDay: localDay(now), participants: status.participants.map(portrait),
    };
    return status.reward;
  }

  const GOALS = [
    { name: "A second chance", description: "Water, move, and prune your pothos to reach 72% health.", reward: 14, test: s => s.history.recovered },
    { name: "Make room for company", description: "Buy a plant from the market.", reward: 8, test: s => s.history.bought },
    { name: "New roots", description: "Pot your first seedling in the breeding room.", reward: 18, test: s => s.history.harvested },
    { name: "A rare discovery", description: "Breed a Rare or Legendary plant.", reward: 40, test: s => s.history.rareCross },
    { name: "An established collection", description: "Discover 20 plant species.", reward: 150, test: s => discoveredCount(s) >= CLASSIC_SPECIES_COUNT },
    { name: "An expanded collection", description: "Discover 32 plant species.", reward: 200, test: s => discoveredCount(s) >= RARITIES.length * WOODY_GROUP_START },
    { name: "The complete collection", description: "Discover all " + CATALOG.length + " plant species.", reward: 250, test: s => discoveredCount(s) === CATALOG.length },
  ];

  return {
    MINUTE, HOUR, CROSS_COST, RARITIES, LOCATIONS, TREE_BRANCHES, BRANCH_LIMIT, STATION_UPGRADES, GROW_LAMP, GROW_LAMP_SLOTS,
    CATALOG, SPECIES, SUPPLIES, GOALS, POT_STYLES, SOIL_MIXES, clamp, traitsFor, traitScales,
    initializeProgression, AUTOMATIONS, buyAutomation, toggleAutomation, curateDisplays, collectDisplayCoins,
    displayMultiplier, promotionCost, buyPromotion, QUEST_TRACKS, activeQuest, questProgress, claimQuest,
    EXHIBITIONS, exhibitionStatus, enterExhibition, discoveredCount,
    potStyle, soilMix, repotCost, repotPlant, renamePlant, familyFor, lastCrossResult,
    phaseAt, careNeeds, dryingRate, movePlant, waterRange, waterPlant, fresh, addPlant, advance, displayRate, salePrice, upgradeSavedShelves, shelfCost, buyShelfUpgrade, freeSlots,
    hasUpgrade, buyUpgrade, lightWorks, branchAngles, trainBranches, displayedPlants, displayCapacity, displaySpotCost, buyDisplaySpot,
    enforceDisplayLimit, setDisplay, lampPlantCount, stationHasRoom, enforceLampLimit, growLampEffects,
    pruningReadyAt, canPrune, pruningCutCount, prunePlant,
    speciesUnlocked, marketStock, nextRestock, buyPlant, rotateOrders, nextOrderDay, orderMatches,
    toggleOrderPin, deliverOrder, parentProblem, crossPreview, breed, cuttingProblem, rootingTime, takeCutting, potSeed,
  };
})();
