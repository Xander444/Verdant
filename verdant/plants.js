/* Seeded botanical illustrations respond to phenotype, growth, and health. */
"use strict";

window.PlantArt = (() => {
  const { SPECIES, branchAngles, pruningCutCount } = window.Garden;
  const ink = { dark: [26, 58, 35], dry: [174, 139, 72] };
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

  const accentColors = [
    [/gold|amber|honey|sun|lemon|butter/, [239, 208, 97]],
    [/cream|ivory|pearl|milky|white|snow|candle/, [240, 232, 187]],
    [/rose|pink|blush|candy|apricot/, [238, 151, 166]],
    [/red|ruby|wine|crimson|raspberry|cherry|garnet/, [192, 82, 106]],
    [/lavender|lilac|violet|plum|grape/, [174, 155, 218]],
    [/blue|sea|ice|glass|mint|teal|frost/, [157, 209, 193]],
    [/silver|moon|ghost|opal|mist/, [214, 225, 201]],
    [/lime|chartreuse/, [204, 226, 112]],
    [/copper|bronze|ember/, [219, 146, 90]],
    [/ink|night|black|obsidian|cinder/, [144, 145, 171]],
  ];
  const patternNames = [
    [/vein|thread|net|lace/, "veins"],
    [/stripe|line|ribbon/, "stripe"],
    [/edge|rim|margin|tip/, "edge"],
    [/sector|marble|patch|flame/, "sector"],
    [/star|speckle|dot|freckle|confetti|dust/, "spots"],
    [/splash|brush|map|mosaic|painted/, "mottle"],
  ];
  const speciesPatterns = {
    golden: "mottle", velvet: "veins", polka: "spots", prayer: "veins", constellation: "spots",
    pink: "sector", satin: "mottle", snake: "bands", nerve: "veins", jewel: "veins",
  };

  function leafPalette(species, plant) {
    const name = species.phenotypes[plant.pheno].toLowerCase();
    const base = hex(species.color);
    const variant = accentColors.find(([words]) => words.test(name))?.[1] ?? [177, 197, 138];
    const defaults = speciesPatterns[species.id] || "plain";
    const namedPattern = patternNames.find(([words]) => words.test(name))?.[1];
    const pattern = plant.pheno === 0 && defaults !== "plain" ? defaults : namedPattern || (plant.pheno === 0 ? "plain" : "wash");
    const wilt = Math.max(0, (76 - plant.health) / 94);
    const pigment = mix(mix(base, variant, pattern === "wash" ? .36 : .09 + plant.pheno * .014), ink.dry, wilt * .58);
    return {
      base: pigment,
      light: mix(pigment, [238, 231, 169], .5),
      dark: mix(pigment, [20, 44, 32], .63),
      tone: mix(pigment, [108, 148, 100], .36),
      accent: variant,
      vein: mix(pigment, namedPattern === "veins" || defaults === "veins" ? variant : [227, 233, 179], .65),
      pattern,
    };
  }

  function leafShape(ctx, style, width, length, bow) {
    ctx.beginPath();
    ctx.moveTo(0, 1);
    if (style === "maple") {
      for (const [x, y] of [[-.64, -.24], [-1, -.52], [-.45, -.47], [-.76, -.78], [-.23, -.67], [0, -1],
        [.24, -.7], [.7, -.8], [.49, -.47], [1, -.52], [.64, -.24]]) ctx.lineTo(x * width + bow * -y, y * length);
    } else if (style === "grass" || style === "spear") {
      ctx.bezierCurveTo(-width * .63, -length * .3, bow - width * .88, -length * .68, bow * 2.3, -length);
      ctx.bezierCurveTo(bow + width * 1.57, -length * .65, width * .74, -length * .22, 0, 0);
    } else if (style === "succulent") {
      ctx.bezierCurveTo(-width * 1.37, -length * .31, -width * 1.08, -length * .93, bow, -length);
      ctx.bezierCurveTo(width * 1.43, -length * .97, width * 1.12, -length * .29, 0, 0);
    } else if (style === "flower" || style === "triangle") {
      ctx.bezierCurveTo(-width * .19, -length * .52, -width * .88, -length * .6, -width, -length * .88);
      ctx.quadraticCurveTo(bow - width * .53, -length * 1.08, bow, -length * .89);
      ctx.quadraticCurveTo(bow + width * .55, -length * 1.05, width, -length * .88);
      ctx.bezierCurveTo(width * .83, -length * .59, width * .31, -length * .47, 0, 0);
    } else if (["heart", "trailing", "monstera", "shield"].includes(style)) {
      ctx.bezierCurveTo(-width * .43, -length * .11, -width * 1.18, length * .04, -width, -length * .35);
      ctx.bezierCurveTo(-width * .93, -length * .62, -width * .29, -length * .77, bow, -length);
      ctx.bezierCurveTo(width * .39, -length * .83, width * 1.12, -length * .58, width, -length * .32);
      ctx.bezierCurveTo(width * .91, length * .02, width * .3, -length * .12, 0, 0);
    } else {
      ctx.bezierCurveTo(-width * .58, -length * .15, -width * 1.39, -length * .61, bow, -length);
      ctx.bezierCurveTo(width * 1.24, -length * .8, width * .97, -length * .39, 0, 0);
    }
    ctx.closePath();

    if (style === "monstera") {
      for (let i = 0; i < 3; i++) {
        const y = -length * (.31 + i * .15);
        const x = width * (.68 - i * .15);
        for (const side of [-1, 1]) {
          ctx.moveTo(side * x + width * .21, y);
          ctx.ellipse(side * x, y + side * 1.2, width * .24, length * .034, side * -.32, 0, 2 * Math.PI);
          ctx.closePath();
        }
      }
    }
  }

  function leafMarkings(ctx, width, length, bow, palette, random) {
    const { pattern, accent } = palette;
    ctx.fillStyle = rgb(accent);
    ctx.strokeStyle = rgb(accent);
    if (pattern === "edge") {
      ctx.globalAlpha = .62;
      ctx.lineWidth = Math.max(1.8, width * .38);
      ctx.stroke();
    } else if (pattern === "stripe") {
      ctx.globalAlpha = .65;
      ctx.lineWidth = Math.max(1, width * .56);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-width * .2, -length * .29, bow * .7, -length * .73, bow * 1.38, -length);
      ctx.stroke();
    } else if (pattern === "bands") {
      ctx.globalAlpha = .33;
      ctx.lineWidth = Math.max(1, length * .027);
      ctx.beginPath();
      for (let i = 1; i <= 7; i++) {
        const y = -length * i / 8;
        ctx.moveTo(-width * 1.2, y);
        ctx.quadraticCurveTo(0, y + length * .09, width * 1.3, y - 2);
      }
      ctx.stroke();
    } else if (["mottle", "spots", "sector"].includes(pattern)) {
      const count = pattern === "spots" ? 15 : pattern === "sector" ? 2 : 7;
      for (let i = 0; i < count; i++) {
        const x = (random() - .5) * 1.6 * width;
        const y = -length * (.16 + random() * .77);
        const radius = width * (pattern === "sector" ? .55 : pattern === "spots" ? .065 + random() * .095 : .17 + random() * .23);
        ctx.globalAlpha = pattern === "mottle" ? .44 + random() * .36 : .62 + random() * .22;
        if (pattern === "spots") {
          ellipse(ctx, x, y, Math.max(.35, radius), Math.max(.65, radius * 1.35), rgb(accent));
        } else {
          ctx.beginPath();
          ctx.moveTo(x - radius, y - radius * .25);
          ctx.bezierCurveTo(x - radius * .78, y - radius * 1.25, x + radius * .4, y - radius * 1.84, x + radius, y - radius);
          ctx.bezierCurveTo(x + radius * .66, y - radius * .11, x + radius * 1.2, y + radius * .87, x + radius * .23, y + radius * 1.23);
          ctx.bezierCurveTo(x - radius * .28, y + radius * 1.04, x - radius * .72, y + radius * .58, x - radius, y - radius * .25);
          ctx.fill();
        }
      }
    }
  }

  function leaf(ctx, x, y, angle, length, width, style, palette, random) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
  const bow = (random() - .43) * width * .38 + (style === "grass" ? Math.sin(angle) * length * .075 : 0);
    leafShape(ctx, style, width, length, bow);
    const gradient = ctx.createLinearGradient(-width, -length * .68, width * .9, -length * .34);
    gradient.addColorStop(0, rgb(palette.tone));
    gradient.addColorStop(.27, rgb(palette.light));
    gradient.addColorStop(.51, rgb(palette.base));
    gradient.addColorStop(1, rgb(palette.dark));
    ctx.fillStyle = gradient;
    ctx.fill("evenodd");
    ctx.lineWidth = width > 9 ? .64 : .34;
    ctx.strokeStyle = rgb(mix(palette.dark, palette.base, .28));
    ctx.stroke();
    ctx.clip("evenodd");
    leafMarkings(ctx, width, length, bow, palette, random);

    ctx.globalAlpha = palette.pattern === "veins" ? .84 : .52;
    ctx.strokeStyle = rgb(palette.vein);
    ctx.lineWidth = Math.min(1.16, Math.max(.35, width * .066));
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-width * .07, -length * .34, bow * .24, -length * .63, bow, -length);
    ctx.stroke();
    ctx.globalAlpha *= .64;
    ctx.lineWidth *= .64;
    ctx.beginPath();
    for (let i = 1; i <= 5; i++) {
      const height = length * (.14 + i * .115);
      for (const side of [-1, 1]) {
        ctx.moveTo(bow * .42, -height);
        ctx.quadraticCurveTo(width * .33 * side, -height - length * .05, width * .94 * side, -height - length * .15);
      }
    }
    ctx.stroke();

    ctx.globalAlpha = .11;
    for (let i = 0; i < 7; i++) {
      ellipse(ctx, (random() - .5) * width * 1.9, -random() * length, width * .055 + .25, width * .09 + .35,
        rgb(i % 2 ? palette.light : palette.dark));
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

  function drawTree(ctx, species, plant, palette, random, drawLeaf) {
    const form = treeForms[species.id];
    const trunk = ctx.createLinearGradient(-10, 0, 12, -4);
    trunk.addColorStop(0, "#4a382b");
    trunk.addColorStop(.33, "#b0936d");
    trunk.addColorStop(.56, "#805b3d");
    trunk.addColorStop(1, "#412f25");
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
    ctx.save();
    ctx.clip();
    for (let i = 0; i < 13; i++) {
      const offset = i * 1.55 - 10;
      ctx.lineWidth = i % 3 === 0 ? .95 : .42;
      ctx.strokeStyle = i % 2 ? "#3d2b235f" : "#d9b88d58";
      ctx.beginPath();
      ctx.moveTo(offset, 7);
      ctx.bezierCurveTo(offset * .9 - 4, -42, form.lean * .46 + offset * .47, -85, form.lean + offset * .22, -top);
      ctx.stroke();
    }
    ctx.restore();
    stem(ctx, -9, 1, -25, 7, -10, "#896346", 3.6);
    stem(ctx, 9, 0, 22, 6, 9, "#775436", 3.4);
    const crowns = [[-77, -64], [65, -77], [-51, -100], [43, -117], [-4, -143]];
    const spread = form.spread * (1 - .033 * plant.quality);
    const angles = branchAngles(plant);
    const tips = crowns.map(([x, y], i) => {
      const branchX = (i + 1) * form.lean / 8;
      const branchY = y * form.height + 20;
      const dx = x * spread + form.lean * .64 - branchX;
      const dy = -20;
      const angle = angles[i] * Math.PI / 180;
      const tipX = branchX + dx * Math.cos(angle) - dy * Math.sin(angle);
      const tipY = branchY + dx * Math.sin(angle) + dy * Math.cos(angle);
      stem(ctx, branchX, branchY, tipX, tipY, tipX * .32, "#765138", 5 - i * .53);
      return [tipX, tipY];
    });
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
        drawLeaf(ctx, x + offset, leafY, angle, length, length * form.width, form.style, palette, texture);
        if (species.id === "pomegranate" && i % 4 === 0) {
          flowerHead(ctx, x + offset * .85, leafY - 17, 5.7, mix([199, 89, 68], palette.accent, plant.pheno * .12), 5, texture);
        } else if (pendant && i % 4 === 0) {
          for (let bloom = 0; bloom < 3; bloom++) {
            flowerHead(ctx, x + offset * 1.08 - bloom, leafY + 12 + bloom * 5, 4.9 - bloom * .58,
              mix(palette.base, [228, 191, 235], .6), 4, texture);
          }
        }
      }
    }
    return tips;
  }

  const habits = {
    trailing: { count: 7, fullness: .058, width: 96, height: 68, lift: 45, drape: 78, length: 55, angle: 1.62, blade: .35, stem: 2.2, sides: [[.49, -.57, .64], [.74, .43, .76]] },
    heart: { count: 6, fullness: .05, width: 80, height: 83, lift: 43, drape: 44, length: 72, angle: 1.07, blade: .38, stem: 2.6, sides: [[.62, .46, .67]] },
    shield: { count: 6, fullness: .041, width: 80, height: 76, lift: 42, drape: 38, length: 83, angle: 1.06, blade: .38, stem: 3, sides: [[.63, -.51, .63]] },
    monstera: { count: 6, fullness: .033, width: 77, height: 74, lift: 37, drape: 34, length: 86, angle: 1.06, blade: .43, stem: 3.3, sides: [[.6, .55, .65]] },
    fern: { count: 7, fullness: .07, width: 98, height: 119, lift: 53, drape: 80, length: 0, angle: 0, blade: 0, stem: 1.5, sides: [] },
    bush: { count: 8, fullness: .075, width: 85, height: 65, lift: 53, drape: 48, length: 52, angle: 1.05, blade: .32, stem: 1.9, sides: [[.63, .59, .77], [.78, -.83, .7]] },
    flower: { count: 7, fullness: .045, width: 73, height: 55, lift: 42, drape: 35, length: 50, angle: .9, blade: .36, stem: 1.7, sides: [[.88, 1.05, .76], [.9, -1, .81]] },
    succulent: { count: 7, fullness: .061, width: 66, height: 73, lift: 46, drape: 55, length: 39, angle: 1.03, blade: .35, stem: 3.2, sides: [[.69, -.86, .77], [.78, .88, .82]] },
    grass: { count: 11, fullness: .09, width: 0, height: 75, lift: 50, drape: 12, length: 145, angle: 1.34, blade: 7.1, sides: [] },
    spear: { count: 7, fullness: .043, width: 0, height: 62, lift: 57, drape: 10, length: 150, angle: .61, blade: 15, sides: [] },
  };
  const blossomForms = {
    purple: [4, [230, 183, 210], 123, 10],
    jewel: [8, [239, 224, 192], 137, 7.6],
    black: [3, [84, 49, 65], 130, 15],
    wax: [5, [226, 128, 146], 111, 10],
    strawberry: [4, [235, 222, 194], 107, 8],
  };
  const speciesHabits = {
    jade: { width: 49, height: 84, lift: 42, length: 34, angle: .8 },
    peperomia: { count: 6, width: 78, height: 60, lift: 35, length: 44, blade: .41 },
    swedish: { height: 57, drape: 69, width: 108, length: 47, angle: 1.68 },
    satin: { height: 94, drape: 108, length: 52 },
    cotton: { height: 87, length: 83, blade: .47, count: 5 },
    spirit: { height: 100, length: 94, blade: .33, count: 5 },
    ponytail: { count: 14, blade: 4.8, angle: 1.66, length: 144 },
  };

  function flowerHead(ctx, x, y, radius, shade, count, random) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(random() * Math.PI);
    const petals = ctx.createLinearGradient(-radius, -radius, radius, radius);
    petals.addColorStop(0, rgb(mix(shade, [255, 247, 214], .48)));
    petals.addColorStop(.57, rgb(shade));
    petals.addColorStop(1, rgb(mix(shade, [80, 44, 72], .34)));
    for (let i = 0; i < count; i++) {
      ctx.rotate(Math.PI * 2 / count);
      ellipse(ctx, 0, -radius * .52, radius * .33, radius * .61, petals);
    }
    ellipse(ctx, 0, 0, radius * .25, radius * .24, "#dabe73");
    ctx.restore();
  }

  function drawCanopy(ctx, species, plant, drawLeaf) {
    const random = generator(species.position * 183 + species.tier * 41 + 17 + plant.pheno * 43);
    const palette = leafPalette(species, plant);
    const shape = species.shape;
    if (shape === "tree") return drawTree(ctx, species, plant, palette, random, drawLeaf);

    if (species.id === "echeveria" || species.id === "glass") {
      const rings = species.id === "glass" ? [[0, 9, 58], [1.3, 8, 48], [2.4, 6, 40], [2.8, 5, 30]]
        : [[0, 11, 78], [1.5, 9, 64], [2.2, 7, 47], [2.4, 5, 29]];
      for (const [turn, leaves, length] of rings) {
        const angles = Array.from({ length: leaves }, (_, i) => turn + i / leaves * Math.PI * 2);
        angles.sort((a, b) => Math.cos(b) - Math.cos(a));
        for (const angle of angles) {
          const x = Math.sin(angle);
          const y = Math.cos(angle);
          const tilt = Math.atan2(x, y * .58);
          drawLeaf(ctx, x * 11, -13 - y * 9, tilt, length * (1 - Math.abs(y) * .28 - plant.quality * .022), length * .24,
            "succulent", palette, generator(Math.floor(random() * 4294967296)));
        }
      }
      return;
    }

    const habit = speciesHabits[species.id] ? { ...habits[shape], ...speciesHabits[species.id] } : habits[shape];
    const count = Math.round(habit.count + plant.size * habit.fullness + plant.quality * .55);
    const wilt = Math.max(0, (76 - plant.health) / 85);
    const vigor = 1 - plant.quality * .025;
    const stems = Array.from({ length: count }, (_, i) => {
      const spread = (i / (count - 1)) * 2 - 1;
      const along = spread + (random() - .5) * .2;
      const reach = along * (habit.width + random() * 28) * vigor;
      const rise = habit.height + random() * habit.lift - Math.abs(along) * (habit.drape + wilt * 24);
      return { along, reach, rise, scale: .78 + random() * .36, turn: (random() - .5) * .65 };
    }).sort((a, b) => b.rise - a.rise);
    const stemInk = rgb(mix(palette.base, ink.dark, .53));
    const leafBrush = () => generator(Math.floor(random() * 4294967296));

    for (const { along, reach, rise, scale, turn } of stems) {
      const startX = along * 15;
      const endY = -rise;
      if (shape === "grass" || shape === "spear") {
        const length = (habit.length + rise * .25) * scale;
        drawLeaf(ctx, startX, 2, along * habit.angle + turn * .46, length, habit.blade * scale, shape, palette, leafBrush());
        continue;
      }

      const bend = reach * (shape === "fern" ? .57 : .36);
      stem(ctx, startX, 0, reach, endY, bend, stemInk, habit.stem * scale);
      const stemAt = t => [
        (1 - t) ** 2 * startX + 2 * t * (1 - t) * (startX + bend) + t ** 2 * reach,
        2 * t * (1 - t) * (endY / 2 - 11) + t ** 2 * endY,
      ];

      if (shape === "fern") {
        const broad = species.id === "blue" ? .32 : .22;
        for (let i = 2; i < 13; i++) {
          const [x, y] = stemAt(i / 13);
          const length = (37 - i * 2.08) * scale;
          for (const side of [-1, 1]) {
            drawLeaf(ctx, x, y, along * .9 + side * (1.28 - i * .043), length, length * broad, "fern", palette, leafBrush());
          }
        }
        drawLeaf(ctx, reach, endY, along * .7, 13 * scale, 4.2 * scale, "fern", palette, leafBrush());
        continue;
      }

      const length = habit.length * scale;
      const leafStyle = species.id === "purple" ? "triangle" : shape;
      const tilt = along * habit.angle + turn;
      drawLeaf(ctx, reach, endY, tilt, length, length * habit.blade, leafStyle, palette, leafBrush());
      for (let i = 0; i < habit.sides.length; i++) {
        const [t, sway, fullness] = habit.sides[i];
        const [x, y] = stemAt(t);
        drawLeaf(ctx, x, y, tilt + sway, length * fullness, length * habit.blade * fullness, leafStyle, palette, leafBrush());
      }
    }

    const flowers = blossomForms[species.id];
    if (flowers && plant.health >= 54) {
      const [count, color, height, size] = flowers;
      for (let i = 0; i < count; i++) {
        const spread = (i / Math.max(1, count - 1)) - .5;
        const x = spread * 108 + (random() - .5) * 18;
        const y = -(height + random() * 18 - Math.abs(spread) * 26);
        stem(ctx, spread * 13, 0, x, y, x * .19, stemInk, 1.2);
        flowerHead(ctx, x, y, size * (.75 + random() * .42), mix(color, palette.accent, plant.pheno * .045), species.id === "black" ? 4 : 5, random);
      }
    }
  }

  const potteryGlazes = [
    { light: "#dc9b72", color: "#bb704d", rimShadow: "#95543a", shadow: "#6f3e2a", rim: "#ebad88" },
    { light: "#cfccad", color: "#a2a184", rimShadow: "#797b5d", shadow: "#4f5844", rim: "#e2ddbc" },
    { light: "#bcb4c8", color: "#95889e", rimShadow: "#766879", shadow: "#4c3f51", rim: "#d8ccd7" },
    { light: "#a1c2b5", color: "#618e84", rimShadow: "#416b63", shadow: "#244d48", rim: "#b7cfc1" },
  ];

  function pot(ctx, tier) {
    const glaze = potteryGlazes[tier];
    ctx.save();
    const shadow = ctx.createRadialGradient(0, 62, 6, 0, 62, 86);
    shadow.addColorStop(0, "rgba(46,35,22,.37)");
    shadow.addColorStop(.46, "rgba(46,35,22,.15)");
    shadow.addColorStop(1, "rgba(46,35,22,0)");
    ellipse(ctx, 1, 64, 84, 13, shadow);
    ellipse(ctx, 0, 62, 37, 4, glaze.shadow);

    const body = ctx.createLinearGradient(-55, 6, 58, 37);
    body.addColorStop(0, glaze.rimShadow);
    body.addColorStop(.21, glaze.light);
    body.addColorStop(.43, glaze.color);
    body.addColorStop(.71, glaze.rimShadow);
    body.addColorStop(1, glaze.shadow);
    ctx.beginPath();
    ctx.moveTo(-54, 8);
    ctx.bezierCurveTo(-50, 29, -47, 49, -37, 59);
    ctx.bezierCurveTo(-24, 66, 24, 66, 37, 59);
    ctx.bezierCurveTo(47, 49, 50, 29, 54, 8);
    ctx.closePath();
    ctx.fillStyle = body;
    ctx.fill();

    ctx.save();
    ctx.clip();
    const grain = generator(441 + tier * 13);
    for (let line = 0; line < 6; line++) {
      const y = 20 + line * 6.3;
      ctx.beginPath();
      ctx.moveTo(-55, y - 7);
      ctx.bezierCurveTo(-28, y + 3, 28, y + 5, 55, y - 6);
      ctx.strokeStyle = line % 2 ? glaze.light : glaze.shadow;
      ctx.globalAlpha = tier ? .22 : .16;
      ctx.lineWidth = line % 2 ? .95 : 1.2;
      ctx.stroke();
    }
    for (let i = 0; i < 316; i++) {
      ctx.globalAlpha = grain() * .4;
      ellipse(ctx, (grain() - .5) * 115, grain() * 66, .2 + grain() * .8, .17 + grain() * .47,
        i % 2 ? glaze.shadow : glaze.rim);
    }
    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(-54, 4);
    ctx.lineTo(-54, 13);
    ctx.bezierCurveTo(-50, 29, 50, 29, 54, 13);
    ctx.lineTo(54, 4);
    ctx.closePath();
    ctx.fillStyle = body;
    ctx.fill();
    ellipse(ctx, 0, 4, 54, 16, glaze.rim);
    ellipse(ctx, 0, 3.5, 48.5, 12.2, glaze.rimShadow);
    ellipse(ctx, 0, 5.5, 46.5, 9, "#513e2b");
    ellipse(ctx, 0, 7, 42.5, 7.2, "#645039");
    for (let i = 0; i < 77; i++) {
      const x = (grain() - .5) * 91;
      const y = (grain() - .5) * 16;
      if ((x / 46) ** 2 + (y / 8) ** 2 < .95) {
        ellipse(ctx, x, 6.7 + y, grain() * 1.6 + .18, grain() * .6 + .25, i % 4 === 0 ? "#b6996b" : i % 3 ? "#423425" : "#7e6246");
      }
    }
    ctx.beginPath();
    ctx.ellipse(-2, 3, 52, 15.8, 0, Math.PI * .13, Math.PI * .82);
    ctx.strokeStyle = glaze.light;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }

  function pruningTargets(leaves, scale, count) {
    const candidates = leaves.map(({ x, y, angle, length }, id) => ({
      id,
      x: 170 + (x + Math.sin(angle) * length * .58) * scale,
      y: 232 + (y - Math.cos(angle) * length * .58) * scale,
    })).filter(point => point.x >= 21 && point.x <= 319 && point.y >= 24 && point.y <= 231);
    candidates.sort((a, b) => a.x - b.x);
    const targets = candidates.splice(0, 1);
    while (targets.length < count && candidates.length) {
      // Spread successive snips across the canopy, even for compact plants.
      let nextIndex = 0;
      let bestDistance = -1;
      candidates.forEach((point, i) => {
        const clearance = targets.reduce((closest, target) =>
          Math.min(closest, (point.x - target.x) ** 2 + (point.y - target.y) ** 2), Infinity);
        if (clearance > bestDistance) {
          nextIndex = i;
          bestDistance = clearance;
        }
      });
      targets.push(candidates.splice(nextIndex, 1)[0]);
    }
    return targets;
  }

  function draw(canvas, { removedLeaves, highlightBranch } = {}) {
    const plant = {
      species: canvas.dataset.species, pheno: Number(canvas.dataset.pheno || 0),
      size: Number(canvas.dataset.size || 65), health: Number(canvas.dataset.health || 95),
      quality: Number(canvas.dataset.quality || 0),
      training: canvas.dataset.training?.split(",").map(Number),
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
    const scale = .72 + plant.size * .004;
    ctx.translate(0, 3);
    ctx.scale(scale, scale);
    if (!removedLeaves) {
      const tip = drawCanopy(ctx, species, plant, leaf)?.[highlightBranch];
      if (tip) {
        ctx.beginPath();
        ctx.arc(tip[0], tip[1] - 5, 13, 0, 2 * Math.PI);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#fff9df";
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(tip[0], tip[1] - 5, 11, 0, 2 * Math.PI);
        ctx.strokeStyle = "#8c5935";
        ctx.stroke();
      }
      return;
    }

    const leaves = [];
    drawCanopy(ctx, species, plant, (_, x, y, angle, length, width, style, palette, random) => {
      const textureSeed = Math.floor(random() * 4294967296);
      leaves.push({ x, y, angle, length, width, style, palette, textureSeed });
    });
    const targets = pruningTargets(leaves, scale, pruningCutCount(plant));
    const marked = new Set(targets.map(point => point.id));
    const dryLeaf = {
      base: [173, 125, 55], light: [232, 186, 99], dark: [112, 69, 37],
      tone: [156, 111, 63], accent: [157, 91, 45], vein: [246, 213, 139], pattern: "mottle",
    };
    // Draw dry leaves on top so the trim targets stay visible in dense crowns.
    for (const isDry of [false, true]) {
      leaves.forEach(({ x, y, angle, length, width, style, palette, textureSeed }, id) => {
        if (marked.has(id) !== isDry || removedLeaves.has(id)) return;
        leaf(ctx, x, y, angle, length, width, style, isDry ? dryLeaf : palette, generator(textureSeed));
      });
    }
    return targets;
  }

  return { draw };
})();
