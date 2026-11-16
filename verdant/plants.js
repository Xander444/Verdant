/* Seeded botanical illustrations respond to phenotype, growth, and health. */
"use strict";

window.PlantArt = (() => {
  const { SPECIES } = window.Garden;
  const ink = {
    dark: [26, 58, 35], light: [165, 184, 116], dry: [166, 137, 63],
    variants: [[237, 202, 113], [224, 233, 195], [234, 164, 163], [190, 221, 125],
      [228, 221, 207], [122, 185, 171], [231, 153, 104], [172, 160, 202]],
  };
  const mix = (a, b, weight) => a.map((value, i) => Math.round(value + (b[i] - value) * weight));
  const rgb = color => "rgb(" + color.join(",") + ")";
  const hex = color => color.slice(1).match(/../g).map(component => parseInt(component, 16));

  function generator(seed) {
    return () => {
      seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  function ellipse(ctx, x, y, w, h, fill) {
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, 0, 0, 2 * Math.PI);
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function leaf(ctx, x, y, angle, length, width, style, colors, random, pale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 1);
    if (style === "maple") {
      ctx.lineTo(-width * .67, -length * .25);
      ctx.lineTo(-width, -length * .54);
      ctx.lineTo(-width * .44, -length * .49);
      ctx.lineTo(-width * .63, -length * .81);
      ctx.lineTo(-width * .23, -length * .7);
      ctx.lineTo(0, -length);
      ctx.lineTo(width * .24, -length * .71);
      ctx.lineTo(width * .66, -length * .82);
      ctx.lineTo(width * .46, -length * .49);
      ctx.lineTo(width, -length * .52);
      ctx.lineTo(width * .64, -length * .25);
    } else if (["heart", "trailing", "monstera", "shield"].includes(style)) {
      ctx.bezierCurveTo(-width * .42, -length * .23, -width, length * .02, -width, -length * .38);
      ctx.bezierCurveTo(-width, -length * .61, -width * .31, -length * .79, 0, -length);
      ctx.bezierCurveTo(width * .31, -length * .82, width * 1.08, -length * .58, width, -length * .36);
      ctx.bezierCurveTo(width * .93, length * .02, width * .35, -length * .22, 0, 1);
    } else if (style === "flower") {
      ctx.bezierCurveTo(-width * .44, -length * .33, -width, -length * .4, -width, -length * .86);
      ctx.quadraticCurveTo(0, -length * 1.08, width, -length * .86);
      ctx.bezierCurveTo(width, -length * .5, width * .4, -length * .26, 0, 1);
    } else {
      ctx.bezierCurveTo(-width, -length * .26, -width * 1.16, -length * .74, -width * .16, -length);
      ctx.bezierCurveTo(width * .85, -length * .95, width * 1.2, -length * .48, 0, 1);
    }
    ctx.closePath();
    const gradient = ctx.createLinearGradient(-width, -length * .72, width, -length * .17);
    gradient.addColorStop(0, rgb(colors[1]));
    gradient.addColorStop(.45, rgb(colors[0]));
    gradient.addColorStop(1, rgb(colors[2]));
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.save();
    ctx.clip();
    const marks = style === "fern" ? 3 : pale ? 13 : 7;
    for (let i = 0; i < marks; i++) {
      ctx.globalAlpha = .09 + random() * (pale ? .5 : .16);
      const radius = (.035 + random() * (pale ? .2 : .11)) * width;
      ellipse(ctx, (random() - .5) * width * 1.85, -random() * length, radius * 1.2, radius * 2.3, rgb(colors[3]));
    }
    ctx.globalAlpha = .34;
    ctx.strokeStyle = rgb(colors[3]);
    ctx.lineWidth = .65;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-width * .09, -length * .44, 0, -length * .98);
    for (let i = 1; i <= 5; i++) {
      const height = length * (.2 + i * .116);
      ctx.moveTo(-width * .045, -height);
      ctx.quadraticCurveTo(-width * .48, -height - length * .045, -width * .8, -height - length * .13);
      ctx.moveTo(-width * .045, -height);
      ctx.quadraticCurveTo(width * .46, -height - length * .06, width * .76, -height - length * .16);
    }
    ctx.stroke();
    ctx.restore();
    if (style === "monstera") {
      ctx.globalCompositeOperation = "destination-out";
      for (let i = 0; i < 3; i++) {
        const h = -length * (.35 + i * .157);
        ellipse(ctx, -width * (.95 - i * .16), h, width * .48, 1.4 + width * .05, "#000");
        ellipse(ctx, width * (.95 - i * .16), h - 2, width * .48, 1.4 + width * .05, "#000");
      }
    }
    ctx.restore();
  }

  function stem(ctx, x, y, endX, endY, bend, color, width) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + bend, (y + endY) / 2 - 11, endX, endY);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.lineWidth = width * .32;
    ctx.strokeStyle = "rgba(220,216,136,.34)";
    ctx.stroke();
  }

  const treeForms = {
    ficus: { spread: .96, height: .94, lean: 9, length: 35, width: .32, leaves: 8, style: "bush" },
    umbrella: { spread: .82, height: 1.06, lean: -8, length: 40, width: .28, leaves: 6, style: "succulent" },
    elm: { spread: .94, height: .99, lean: 16, length: 27, width: .31, leaves: 11, style: "bush" },
    pomegranate: { spread: 1.04, height: .89, lean: -9, length: 32, width: .28, leaves: 9, style: "bush" },
    maple: { spread: 1.16, height: 1, lean: -15, length: 36, width: .43, leaves: 9, style: "maple" },
    olive: { spread: 1.03, height: .91, lean: 8, length: 37, width: .2, leaves: 10, style: "spear" },
    wisteria: { spread: 1.14, height: 1.07, lean: 11, length: 37, width: .29, leaves: 10, style: "flower" },
    juniper: { spread: 1.02, height: .87, lean: 25, length: 25, width: .15, leaves: 14, style: "spear" },
  };

  function drawTree(ctx, species, plant, colors, random, drawLeaf) {
    const form = treeForms[species.id];
    const trunk = ctx.createLinearGradient(-10, 0, 12, -4);
    trunk.addColorStop(0, "#503d30");
    trunk.addColorStop(.45, "#a17c55");
    trunk.addColorStop(1, "#67472f");
    const top = form.height * 126;
    ctx.beginPath();
    ctx.moveTo(-12, 5);
    ctx.bezierCurveTo(-8, -19, -15, -48, form.lean * .32, -66);
    ctx.bezierCurveTo(form.lean * .77, -93, form.lean - 4, -top + 13, form.lean, -top);
    ctx.bezierCurveTo(form.lean + 5, -top + 9, form.lean + 5, -96, form.lean * .38 + 9, -66);
    ctx.bezierCurveTo(-1, -43, 3, -18, 13, 5);
    ctx.closePath();
    ctx.fillStyle = trunk;
    ctx.fill();
    stem(ctx, -9, 1, -25, 7, -10, "#896346", 3.6);
    stem(ctx, 9, 0, 22, 6, 9, "#775436", 3.4);
    const crowns = [[-77, -64], [65, -77], [-51, -100], [43, -117], [-4, -143]];
    const spread = form.spread * (1 - .033 * plant.quality);
    const tips = crowns.map(([x, y]) => [x * spread + form.lean * .64, y * form.height]);
    tips.forEach(([x, y], i) => stem(ctx, (i + 1) * form.lean / 8, y + 20, x, y, x * .32, "#765138", 5 - i * .53));
    const count = form.leaves + Math.floor(plant.quality / 2);
    for (const [x, y] of tips) {
      for (let i = 0; i < count; i++) {
        const offset = (i / (count - 1) - .5) * 44;
        const sway = (random() - .5) * 14;
        const pendant = species.id === "wisteria" && i % 2 === 0;
        const angle = (pendant ? Math.PI : 0) + offset * .037 + sway * .012;
        const length = form.length * (.72 + random() * .40);
        const leafY = y + sway + (pendant ? 6 : 0);
        const texture = generator(Math.floor(random() * 4294967296));
        drawLeaf(ctx, x + offset, leafY, angle, length, length * form.width, form.style, colors, texture, plant.pheno > 0);
        if (species.id === "pomegranate" && i % 4 === 0) {
          ellipse(ctx, x + offset * .85, leafY - 16, 4, 4, rgb(mix([199, 89, 68], colors[3], plant.pheno * .12)));
        }
      }
    }
  }

  function drawCanopy(ctx, species, plant, drawLeaf) {
    const random = generator(species.position * 183 + species.tier * 41 + 17 + plant.pheno * 43);
    const base = hex(species.color);
    const variant = ink.variants[plant.pheno % ink.variants.length];
    const pale = plant.pheno > 0 || ["golden", "polka", "prayer", "constellation", "pink"].includes(species.id);
    const wilt = Math.max(0, (75 - plant.health) / 85);
    const variantTint = plant.pheno ? .12 + plant.pheno * .043 : 0;
    const foliage = mix(mix(base, variant, variantTint), ink.dry, wilt * .46);
    const colors = [foliage, mix(foliage, ink.light, .4 + wilt * .11), mix(foliage, ink.dark, .56), variant];
    const shape = species.shape;
    if (shape === "tree") {
      drawTree(ctx, species, plant, colors, random, drawLeaf);
      return;
    }
    if (species.id === "echeveria") {
      const rings = [[0, 11, 79], [1.5, 9, 59], [2.2, 7, 42], [2.4, 5, 28]];
      for (const [turn, leaves, length] of rings) {
        const angles = Array.from({ length: leaves }, (_, i) => turn + i / leaves * Math.PI * 2);
        angles.sort((a, b) => Math.cos(b) - Math.cos(a));
        for (const angle of angles) {
          const x = Math.sin(angle);
          const y = Math.cos(angle);
          const tilt = Math.atan2(x, y * .54);
          drawLeaf(ctx, x * 7, -14 - y * 7, tilt, length * (1 - Math.abs(y) * .36 - plant.quality * .022), length * .24,
            "succulent", colors, random, pale);
        }
      }
      return;
    }
    const number = Math.round(8 + plant.size * .085 + plant.quality * .5);
    const stems = Array.from({ length: number }, (_, i) => {
      const along = (i / Math.max(1, number - 1)) * 2 - 1;
      const scale = .75 + random() * .3;
      return { along, scale, reach: 91 + random() * 34, rise: 74 + random() * 39, tilt: random() * .62 - .31 };
    });
    stems.sort((a, b) => Math.abs(a.along) - Math.abs(b.along));
    const stemColor = rgb(mix(foliage, ink.dark, .24));
    for (const { along, scale, reach, rise, tilt } of stems) {
      const drape = shape === "trailing" ? 1.31 : shape === "fern" ? 1.02 : .68;
      const endX = along * reach * (1 - plant.quality * .031) * (shape === "spear" ? .65 : 1);
      const endY = -rise + Math.abs(along) * (55 + wilt * 53) * drape;
      stem(ctx, along * 17, 0, endX, endY, endX * .34, stemColor, 2.2 * scale);
      if (shape === "fern") {
        for (let i = 2; i < 9; i++) {
          const position = i / 9;
          const x = (1 - position) ** 2 * along * 17 + 2 * position * (1 - position) * (along * 17 + endX * .34) + position ** 2 * endX;
          const y = 2 * position * (1 - position) * (endY / 2 - 11) + position ** 2 * endY;
          const length = (31 - i * 2.4) * scale;
          drawLeaf(ctx, x, y, along * .75 - 1.05, length, length * .25, shape, colors, random, false);
          drawLeaf(ctx, x, y, along * .75 + 1.05, length, length * .25, shape, colors, random, false);
        }
      } else if (shape === "grass" || shape === "spear") {
        drawLeaf(ctx, endX * .19, -4, along * (shape === "spear" ? .69 : 1.28) + tilt, (132 + (rise - 77) * .75) * scale,
          shape === "spear" ? 13 : 6, shape, colors, random, true);
      } else {
        const length = (shape === "monstera" ? 82 : shape === "shield" ? 74 : shape === "succulent" ? 36 : 58) * scale;
        drawLeaf(ctx, endX, endY, along * (shape === "trailing" ? 1.65 : 1.01) + tilt, length, length * .38, shape, colors, random, pale);
        if (shape === "flower" || shape === "succulent") {
          drawLeaf(ctx, endX, endY, -1.12 + tilt, length * .78, length * .34, shape, colors, random, pale);
          drawLeaf(ctx, endX, endY, 1.12 + tilt, length * .76, length * .32, shape, colors, random, pale);
        } else {
          drawLeaf(ctx, endX * .64, endY * .68, along * 1.78 - tilt, length * .76, length * .29, shape, colors, random, pale);
        }
      }
    }
  }

  function pot(ctx, tier) {
    const colors = [
      ["#d89a6a", "#ab6546", "#794935", "#edb993"], ["#a7a87b", "#797c53", "#50563c", "#d4d1a2"],
      ["#ad9b91", "#846960", "#584d50", "#c8b6a6"], ["#a2aa9b", "#64796f", "#344c46", "#c1cabc"],
    ][tier];
    ctx.save();
    const shadow = ctx.createRadialGradient(0, 63, 4, 0, 63, 86);
    shadow.addColorStop(0, "rgba(47,40,19,.31)");
    shadow.addColorStop(1, "rgba(47,40,19,0)");
    ellipse(ctx, 0, 62, 84, 15, shadow);
    const clay = ctx.createLinearGradient(-54, 22, 62, 42);
    clay.addColorStop(0, colors[1]);
    clay.addColorStop(.28, colors[0]);
    clay.addColorStop(.62, colors[1]);
    clay.addColorStop(1, colors[2]);
    ctx.beginPath();
    ctx.moveTo(-53, 7);
    ctx.bezierCurveTo(-51, 25, -46, 49, -36, 59);
    ctx.bezierCurveTo(-25, 67, 25, 67, 36, 59);
    ctx.bezierCurveTo(46, 49, 51, 24, 53, 7);
    ctx.closePath();
    ctx.fillStyle = clay;
    ctx.fill();
    ctx.save();
    ctx.clip();
    const grain = generator(441);
    for (let i = 0; i < 270; i++) {
      ctx.globalAlpha = grain() * .27;
      ellipse(ctx, (grain() - .5) * 111, grain() * 66, .25 + grain() * .8, .2 + grain() * .45, i % 2 ? colors[2] : colors[3]);
    }
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(-53, 4);
    ctx.lineTo(-53, 14);
    ctx.bezierCurveTo(-49, 30, 49, 30, 53, 14);
    ctx.lineTo(53, 4);
    ctx.fillStyle = clay;
    ctx.fill();
    ellipse(ctx, 0, 4, 53, 16, colors[3]);
    ellipse(ctx, 0, 3.5, 47, 12, "#503727");
    ellipse(ctx, 0, 6, 44, 8, "#6b4c34");
    for (let i = 0; i < 52; i++) {
      const x = (grain() - .5) * 82, y = (grain() - .5) * 15;
      if ((x / 44) ** 2 + (y / 8) ** 2 < .92) ellipse(ctx, x, 6 + y, grain() * 2 + .3, .55, i % 2 ? "#a47854" : "#432d24");
    }
    ctx.restore();
  }

  function pruningTargets(leaves, scale) {
    const candidates = leaves.map(({ x, y, angle, length }, id) => ({
      id,
      x: 170 + (x + Math.sin(angle) * length * .58) * scale,
      y: 232 + (y - Math.cos(angle) * length * .58) * scale,
    })).filter(point => point.x >= 21 && point.x <= 319 && point.y >= 24 && point.y <= 231);
    const targets = [];
    for (const direction of [1, -1]) {
      const next = candidates.filter(point => targets.every(target => Math.hypot(point.x - target.x, point.y - target.y) >= 40))
        .sort((a, b) => direction * (a.x - b.x))[0];
      if (next) targets.push(next);
    }
    const center = candidates.filter(point => targets.every(target => Math.hypot(point.x - target.x, point.y - target.y) >= 40))
      .sort((a, b) => a.y - b.y)[0];
    if (center) targets.push(center);
    return targets;
  }

  function draw(canvas, removedLeaves) {
    const plant = {
      species: canvas.dataset.species, pheno: Number(canvas.dataset.pheno || 0),
      size: Number(canvas.dataset.size || 65), health: Number(canvas.dataset.health || 95),
      quality: Number(canvas.dataset.quality || 0),
    };
    const species = SPECIES[plant.species];
    if (!species) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const unit = canvas.width / 340;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(unit, unit);
    ctx.translate(170, 229);
    ctx.save();
    if (species.shape === "tree") ctx.scale(1.17, .58);
    pot(ctx, species.tier);
    ctx.restore();
    const scale = .65 + plant.size * .0047;
    ctx.translate(0, 3);
    ctx.scale(scale, scale);
    if (!removedLeaves) {
      drawCanopy(ctx, species, plant, leaf);
      return;
    }

    const leaves = [];
    drawCanopy(ctx, species, plant, (_, x, y, angle, length, width, style, colors, random, pale) => {
      const textureSeed = Math.floor(random() * 4294967296);
      leaves.push({ x, y, angle, length, width, style, colors, textureSeed, pale });
    });
    const targets = pruningTargets(leaves, scale);
    const marked = new Set(targets.map(point => point.id));
    const dryColors = [[165, 125, 59], [213, 182, 103], [109, 76, 32], [237, 212, 132]];
    // Draw dry leaves on top so the trim targets stay visible in dense crowns.
    for (const isDry of [false, true]) {
      leaves.forEach(({ x, y, angle, length, width, style, colors, textureSeed, pale }, id) => {
        if (marked.has(id) !== isDry || removedLeaves.has(id)) return;
        leaf(ctx, x, y, angle, length, width, style, isDry ? dryColors : colors, generator(textureSeed), pale || isDry);
      });
    }
    return targets;
  }

  return { draw };
})();
