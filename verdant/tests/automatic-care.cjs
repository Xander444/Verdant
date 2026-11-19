const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "garden.js"), "utf8"), context);
const G = context.window.Garden;
const now = new Date(2026, 10, 19, 13, 3).getTime();
const copy = value => JSON.parse(JSON.stringify(value));

function greenhouse() {
  const state = G.fresh(now);
  state.capacity = 64;
  state.shelfUpgrades = 4;
  state.coins = 1000000;
  state.discovered = G.CATALOG.slice(0, 12).map(species => species.id + ":0");
  assert.ok(G.buyAutomation(state, "watering"));
  assert.ok(G.buyAutomation(state, "fertigation"));
  return state;
}

function checkFed(plant, label) {
  assert.ok(plant, label + " exists");
  assert.equal(plant.nutrients, 85, label + " receives nutrients immediately");
}

test("every stocked species is fed as soon as it is bought", () => {
  for (const species of G.STANDARD_CATALOG) {
    const state = greenhouse();
    const stockTime = Array.from({ length: 80 }, (_, i) => now + i * 5 * G.MINUTE)
      .find(time => G.marketStock(state, species, time) > 0);
    assert.notEqual(stockTime, undefined, species.id + " comes into stock");
    G.advance(state, stockTime);
    const inventory = copy(state.inventory);
    const coins = state.coins;
    const plant = G.buyPlant(state, species, stockTime);
    checkFed(plant, species.id);
    assert.equal(state.coins, coins - species.price, "only the plant price is charged");
    assert.deepEqual(copy(state.inventory), inventory, "stored fertilizer stays untouched");
  }
});

test("crosses and rooted cuttings of all 46 species are fed at potting", () => {
  for (const species of G.CATALOG) {
    for (const source of ["cross", "cutting"]) {
      const state = greenhouse();
      const first = G.addPlant(state, species.id, 0, now, "market");
      Object.assign(first, { health: 98, size: 98 });
      let seed;
      if (source === "cutting") {
        seed = G.takeCutting(state, first, now);
      } else {
        const second = G.addPlant(state, species.id, 0, now, "market");
        Object.assign(second, { health: 98, size: 98 });
        seed = G.breed(state, first, second, now, () => .1);
      }
      assert.ok(seed, species.id + " " + source + " starts");
      assert.equal(G.potSeed(state, seed, seed.readyAt - 1), null, "germination is still required");
      G.advance(state, seed.readyAt);
      const inventory = copy(state.inventory), coins = state.coins;
      const child = G.potSeed(state, seed, seed.readyAt);
      checkFed(child, species.id + " " + source);
      assert.equal(child.size, 8, "feeding does not skip growth stages");
      assert.equal(state.coins, coins);
      assert.deepEqual(copy(state.inventory), inventory);
      assert.equal(state.journal[0].id, child.id);
      assert.equal(state.journal[0].source === "cutting", source === "cutting");
    }
  }
});

test("all Mythic research seeds receive fertilizer when potted", () => {
  const state = greenhouse();
  state.discovered = G.CATALOG.flatMap(species => species.phenotypes.map((_, i) => species.id + ":" + i));
  for (const species of G.CATALOG) {
    const plant = G.addPlant(state, species.id, 0, now, "market");
    Object.assign(plant, { health: 98, size: 98, quality: 5 });
  }
  state.stats.ordersCompleted = 100;
  state.stats.displayEarned = 30000;
  state.exhibitions = { bonsai: { wins: 12 }, rare: { wins: 12 } };
  state.journal = Array.from({ length: 60 }, (_, i) => ({
    id: 1000 + i, species: "golden", pheno: 0,
    source: i < 10 ? "cutting" : undefined,
    parents: i < 10 ? [{ id: 1 }] : [{ id: 1 }, { id: 2 }],
  }));
  for (const research of G.MYTHIC_RESEARCH) {
    const seed = G.claimMythic(state, research.id, now);
    assert.ok(seed, research.id + " research qualifies");
    const plant = G.potSeed(state, seed, seed.readyAt);
    checkFed(plant, research.id + " research plant");
    assert.equal(state.journal[0].source, "mythic");
  }
});

test("every phenotype and rescue plant joins the same feeding system", () => {
  const state = greenhouse();
  for (const species of G.CATALOG) {
    for (let pheno = 0; pheno < species.phenotypes.length; pheno++) {
      state.plants = [];
      const plant = G.addPlant(state, species.id, pheno, now, "seedling");
      checkFed(plant, species.id + ":" + pheno);
      assert.equal(plant.pheno, pheno);
    }
  }
  state.plants = [];
  checkFed(G.addPlant(state, "golden", 0, now, "starter"), "rescue plant");
});

test("reload refreshes feeding without requiring elapsed time or advancing growth", () => {
  for (const savedTime of [now, now + G.HOUR]) {
    const state = greenhouse();
    state.updatedAt = savedTime;
    const plant = state.plants[0];
    plant.nutrients = 20;
    const restored = copy(state);
    G.advance(restored, now);
    checkFed(restored.plants[0], "restored plant");
    assert.equal(restored.updatedAt, savedTime);
    assert.equal(restored.plants[0].size, plant.size);
    assert.equal(restored.plants[0].health, plant.health);
    assert.equal(restored.displayBank, state.displayBank);
    assert.equal(restored.coins, state.coins);
  }
});

test("fertilizer follows pause controls and resumes for all existing and new plants", () => {
  for (const paused of ["watering", "fertigation"]) {
    const state = greenhouse();
    assert.ok(G.toggleAutomation(state, paused));
    assert.equal(G.automationActive(state, "fertigation"), false);
    const plant = G.addPlant(state, "moonlotus", 0, now, "seedling");
    assert.equal(plant.nutrients, 65, "paused feeding preserves the seedling's initial nutrients");
    G.advance(state, now + G.HOUR);
    assert.ok(plant.nutrients < 65);
    assert.ok(G.toggleAutomation(state, paused));
    assert.ok(G.automationActive(state, "fertigation"));
    for (const existing of state.plants) checkFed(existing, "resumed " + existing.species);
  }
  const waterOnly = greenhouse();
  delete waterOnly.automation.fertigation;
  assert.equal(G.addPlant(waterOnly, "golden", 0, now, "market").nutrients, 59);
});

test("feeding supports real growth and keeps all species nourished through a week away", () => {
  const fed = greenhouse();
  fed.plants = [];
  for (const species of G.CATALOG) {
    const plant = G.addPlant(fed, species.id, 0, now, "seedling");
    Object.assign(plant, { health: 90, size: 20, nutrients: 0 });
  }
  const unfed = copy(fed);
  unfed.automation.fertigation.enabled = false;
  G.advance(fed, now + G.HOUR);
  G.advance(unfed, now + G.HOUR);
  for (const [i, plant] of fed.plants.entries()) {
    checkFed(plant, plant.species);
    assert.ok(plant.size > unfed.plants[i].size, plant.species + " gets the growth benefit");
  }
  const coins = fed.coins, inventory = copy(fed.inventory);
  G.advance(fed, now + 7 * 24 * G.HOUR);
  for (const plant of fed.plants) {
    checkFed(plant, plant.species + " after a week away");
    assert.equal(plant.health, 100);
    assert.equal(plant.size, 100);
    assert.equal(plant.quality, 0, "pruning remains manual");
  }
  assert.equal(fed.coins, coins);
  assert.deepEqual(copy(fed.inventory), inventory);
});

test("feeding preserves nutrient levels already above its target", () => {
  const state = greenhouse();
  state.plants[0].nutrients = 97;
  G.toggleAutomation(state, "fertigation");
  G.toggleAutomation(state, "fertigation");
  assert.equal(state.plants[0].nutrients, 97);
});
