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
    if (["heart", "trailing", "monstera", "shield"].includes(style)) {
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

  function drawCanopy(ctx, species, plant) {
    const random = generator(species.position * 183 + species.tier * 41 + 17 + plant.pheno * 43);
    const base = hex(species.color);
    const variant = ink.variants[plant.pheno % ink.variants.length];
    const pale = plant.pheno > 0 || ["golden", "polka", "prayer", "constellation", "pink"].includes(species.id);
    const wilt = Math.max(0, (75 - plant.health) / 85);
    const variantTint = plant.pheno ? .12 + plant.pheno * .043 : 0;
    const foliage = mix(mix(base, variant, variantTint), ink.dry, wilt * .46);
    const colors = [foliage, mix(foliage, ink.light, .4 + wilt * .11), mix(foliage, ink.dark, .56), variant];
    const shape = species.shape;
    if (species.id === "echeveria") {
      const rings = [[0, 11, 79], [1.5, 9, 59], [2.2, 7, 42], [2.4, 5, 28]];
      for (const [turn, leaves, length] of rings) {
        const angles = Array.from({ length: leaves }, (_, i) => turn + i / leaves * Math.PI * 2);
        angles.sort((a, b) => Math.cos(b) - Math.cos(a));
        for (const angle of angles) {
          const x = Math.sin(angle);
          const y = Math.cos(angle);
          const tilt = Math.atan2(x, y * .54);
          leaf(ctx, x * 7, -14 - y * 7, tilt, length * (1 - Math.abs(y) * .36), length * .24,
            "succulent", colors, random, pale);
        }
      }
      return;
    }
    const number = Math.round(8 + plant.size * .085);
    const stems = Array.from({ length: number }, (_, i) => {
      const along = (i / Math.max(1, number - 1)) * 2 - 1;
      const scale = .75 + random() * .3;
      return { along, scale, reach: 91 + random() * 34, rise: 74 + random() * 39, tilt: random() * .62 - .31 };
    });
    stems.sort((a, b) => Math.abs(a.along) - Math.abs(b.along));
    const stemColor = rgb(mix(foliage, ink.dark, .24));
    for (const { along, scale, reach, rise, tilt } of stems) {
      const drape = shape === "trailing" ? 1.31 : shape === "fern" ? 1.02 : .68;
      const endX = along * reach * (shape === "spear" ? .65 : 1);
      const endY = -rise + Math.abs(along) * (55 + wilt * 53) * drape;
      stem(ctx, along * 17, 0, endX, endY, endX * .34, stemColor, 2.2 * scale);
      if (shape === "fern") {
        for (let i = 2; i < 9; i++) {
          const position = i / 9;
          const x = (1 - position) ** 2 * along * 17 + 2 * position * (1 - position) * (along * 17 + endX * .34) + position ** 2 * endX;
          const y = 2 * position * (1 - position) * (endY / 2 - 11) + position ** 2 * endY;
          const length = (31 - i * 2.4) * scale;
          leaf(ctx, x, y, along * .75 - 1.05, length, length * .25, shape, colors, random, false);
          leaf(ctx, x, y, along * .75 + 1.05, length, length * .25, shape, colors, random, false);
        }
      } else if (shape === "grass" || shape === "spear") {
        leaf(ctx, endX * .19, -4, along * (shape === "spear" ? .69 : 1.28) + tilt, (132 + (rise - 77) * .75) * scale,
          shape === "spear" ? 13 : 6, shape, colors, random, true);
      } else {
        const length = (shape === "monstera" ? 82 : shape === "shield" ? 74 : shape === "succulent" ? 36 : 58) * scale;
        leaf(ctx, endX, endY, along * (shape === "trailing" ? 1.65 : 1.01) + tilt, length, length * .38, shape, colors, random, pale);
        if (shape === "flower" || shape === "succulent") {
          leaf(ctx, endX, endY, -1.12 + tilt, length * .78, length * .34, shape, colors, random, pale);
          leaf(ctx, endX, endY, 1.12 + tilt, length * .76, length * .32, shape, colors, random, pale);
        } else {
          leaf(ctx, endX * .64, endY * .68, along * 1.78 - tilt, length * .76, length * .29, shape, colors, random, pale);
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

  function draw(canvas) {
    const plant = {
      species: canvas.dataset.species, pheno: Number(canvas.dataset.pheno || 0),
      size: Number(canvas.dataset.size || 65), health: Number(canvas.dataset.health || 95),
    };
    const species = SPECIES[plant.species];
    if (!species) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const unit = canvas.width / 340;
    ctx.scale(unit, unit);
    ctx.translate(170, 229);
    pot(ctx, species.tier);
    const scale = .65 + plant.size * .0047;
    ctx.translate(0, 3);
    ctx.scale(scale, scale);
    drawCanopy(ctx, species, plant);
  }

  return { draw };
})();
