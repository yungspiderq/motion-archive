/* PLACHU — drawing library: paper, watercolour washes, ink, splatter, rain, type.
   Everything is deterministic: same (seed, t) always paints the same frame. */
(function (global) {
  "use strict";

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const R = (seed) => mulberry32(seed);
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const smooth = (t) => t * t * (3 - 2 * t);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeIn = (t) => t * t * t;
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // ---------------------------------------------------------------- canvas
  function make(w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }

  // ---------------------------------------------------------------- palette
  const PAL = {
    paper: "#cdc6c1",
    paperDark: "#a9a29e",
    ink: "#1b1a1c",
    inkSoft: "#3a3739",
    graphite: "#4a4648",
    grey: "#7d7a7c",
    red: "#a81f26",
    redDeep: "#6d1218",
    redBright: "#c62b30",
    amber: "#c08a3e",
    skin: "#d8c0b6",
    blue: "#8b98a8",
    smoke: "#b9b2ad",
  };

  // ---------------------------------------------------------------- noise
  function valueNoise(size, seed, cells) {
    const r = R(seed);
    const g = [];
    for (let y = 0; y <= cells; y++) {
      g[y] = [];
      for (let x = 0; x <= cells; x++) g[y][x] = r();
    }
    const out = new Float32Array(size * size);
    const step = size / cells;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const fx = x / step,
          fy = y / step;
        const x0 = Math.floor(fx),
          y0 = Math.floor(fy);
        const tx = smooth(fx - x0),
          ty = smooth(fy - y0);
        const a = g[y0][x0],
          b = g[y0][x0 + 1],
          c = g[y0 + 1][x0],
          d = g[y0 + 1][x0 + 1];
        out[y * size + x] = lerp(lerp(a, b, tx), lerp(c, d, tx), ty);
      }
    }
    return out;
  }

  function fbm(size, seed, octaves) {
    const out = new Float32Array(size * size);
    let amp = 0.5,
      total = 0;
    for (let o = 0; o < octaves; o++) {
      const cells = 4 << o;
      const n = valueNoise(size, seed + o * 977, cells);
      for (let i = 0; i < out.length; i++) out[i] += n[i] * amp;
      total += amp;
      amp *= 0.5;
    }
    for (let i = 0; i < out.length; i++) out[i] /= total;
    return out;
  }

  /** soft paper fibre texture tile */
  function paperTile(size, seed) {
    const c = make(size, size);
    const ctx = c.getContext("2d");
    const n = fbm(size, seed, 4);
    const img = ctx.createImageData(size, size);
    for (let i = 0; i < n.length; i++) {
      const v = n[i];
      const shade = 226 + (v - 0.5) * 26;
      img.data[i * 4] = shade + 2;
      img.data[i * 4 + 1] = shade;
      img.data[i * 4 + 2] = shade - 2;
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    // fibres
    const r = R(seed + 31);
    ctx.globalAlpha = 0.07;
    ctx.strokeStyle = "#4a423d";
    for (let i = 0; i < size * 1.6; i++) {
      const x = r() * size,
        y = r() * size;
      const a = r() * Math.PI * 2,
        len = 2 + r() * 14;
      ctx.lineWidth = 0.5 + r() * 0.7;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    return c;
  }

  function grainTile(size, seed) {
    const c = make(size, size);
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(size, size);
    const r = R(seed);
    for (let i = 0; i < size * size; i++) {
      const v = 110 + r() * 90;
      img.data[i * 4] = v;
      img.data[i * 4 + 1] = v;
      img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return c;
  }

  // ---------------------------------------------------------------- paper
  function paintPaper(ctx, w, h, seed) {
    const r = R(seed);
    const g = ctx.createLinearGradient(0, 0, w * 0.4, h);
    g.addColorStop(0, "#d6cfc8");
    g.addColorStop(0.45, "#c6bfb9");
    g.addColorStop(1, "#b3aca8");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // broad damp stains
    for (let i = 0; i < 12; i++) {
      const x = r() * w,
        y = r() * h,
        rad = 120 + r() * 420;
      const rg = ctx.createRadialGradient(x, y, 0, x, y, rad);
      const dark = r() < 0.6;
      rg.addColorStop(0, dark ? "rgba(104,94,90,0.13)" : "rgba(226,218,210,0.12)");
      rg.addColorStop(1, "rgba(120,110,104,0)");
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    // fibre speckle
    ctx.save();
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < w * 1.4; i++) {
      const x = r() * w,
        y = r() * h;
      ctx.fillStyle = r() < 0.5 ? "rgba(90,80,76,0.14)" : "rgba(240,234,228,0.16)";
      ctx.fillRect(x, y, 1 + r() * 2, 1);
    }
    ctx.restore();
    // tooth of the paper
    const tex = paperTexture();
    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = 0.3;
    for (let y = 0; y < h; y += tex.height) for (let x = 0; x < w; x += tex.width) ctx.drawImage(tex, x, y);
    ctx.restore();
    return r;
  }

  let __paperTex = null;
  function paperTexture() {
    if (__paperTex) return __paperTex;
    const size = 256;
    const c = make(size, size);
    const x = c.getContext("2d");
    const n = fbm(size, 8123, 5);
    const img = x.createImageData(size, size);
    for (let i = 0; i < n.length; i++) {
      const v = 128 + (n[i] - 0.5) * 120;
      img.data[i * 4] = v;
      img.data[i * 4 + 1] = v;
      img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    __paperTex = c;
    return c;
  }

  // ---------------------------------------------------------------- watercolour
  /** irregular wet wash: many soft overlapping blobs + darker drying edge */
  function wash(ctx, cx, cy, rx, ry, color, seed, opts) {
    const o = opts || {};
    const r = R(seed);
    const alpha = o.alpha == null ? 0.62 : o.alpha;
    const layers = o.layers || 22;
    const rot = o.rot || 0;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.globalCompositeOperation = o.mode || "multiply";
    for (let i = 0; i < layers; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.pow(r(), 0.7);
      const ox = Math.cos(a) * rx * 0.44 * d;
      const oy = Math.sin(a) * ry * 0.44 * d;
      const sx = rx * (0.6 + r() * 0.55);
      const sy = ry * (0.6 + r() * 0.55);
      const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, Math.max(sx, sy));
      g.addColorStop(0, color);
      g.addColorStop(0.6, color);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = (alpha / layers) * (1.8 + r());
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(ox, oy, sx, sy, r() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    // pigment granulation
    if (o.grain !== false) {
      const dots = Math.min(900, Math.round((rx * ry) / 620));
      for (let i = 0; i < dots; i++) {
        const a = r() * Math.PI * 2;
        const d = Math.sqrt(r());
        const x = Math.cos(a) * rx * d * 0.92;
        const y = Math.sin(a) * ry * d * 0.92;
        ctx.globalAlpha = 0.02 + r() * 0.07;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 0.7 + r() * 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // wet bloom highlight
    if (o.bloom !== false) {
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.1;
      const bg = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(rx, ry) * 0.7);
      bg.addColorStop(0, "rgba(255,252,246,0.9)");
      bg.addColorStop(1, "rgba(255,252,246,0)");
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx * 0.62, ry * 0.62, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "multiply";
    }
    // drying edge (opt-in: only for small detail washes)
    if (o.edge === true) {
      ctx.save();
      ctx.filter = "blur(5px)";
      ctx.globalAlpha = alpha * 0.22;
      ctx.strokeStyle = o.edgeColor || "rgba(56,44,42,0.55)";
      ctx.lineWidth = o.edgeWidth || 2.2;
      ctx.beginPath();
      const N = 52;
      for (let i = 0; i <= N; i++) {
        const a = (i / N) * Math.PI * 2;
        const wob = 0.82 + 0.22 * Math.sin(a * 3 + seed) + 0.1 * Math.sin(a * 7 + seed * 0.3);
        const x = Math.cos(a) * rx * wob;
        const y = Math.sin(a) * ry * wob;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- ink
  /** jittered, tapered ink stroke through points */
  function inkStroke(ctx, pts, width, color, seed, opts) {
    const o = opts || {};
    const r = R(seed);
    const passes = o.passes || 2;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    for (let p = 0; p < passes; p++) {
      const w = width * (1 - p * 0.35);
      ctx.globalAlpha = (o.alpha == null ? 0.9 : o.alpha) * (p === 0 ? 0.5 : 1);
      ctx.lineWidth = Math.max(0.4, w);
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        const jx = (r() - 0.5) * w * 0.55;
        const jy = (r() - 0.5) * w * 0.55;
        const x = pts[i][0] + jx,
          y = pts[i][1] + jy;
        if (i === 0) ctx.moveTo(x, y);
        else {
          const px = pts[i - 1][0],
            py = pts[i - 1][1];
          ctx.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
        }
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  /** sketchy outline of a polyline with double pass and overshoot */
  function sketchPath(ctx, pts, seed, opts) {
    const o = opts || {};
    const r = R(seed);
    const passes = o.passes || 3;
    for (let p = 0; p < passes; p++) {
      ctx.save();
      ctx.globalAlpha = (o.alpha == null ? 0.6 : o.alpha) * (0.5 + 0.5 / (p + 1));
      ctx.strokeStyle = o.color || PAL.ink;
      ctx.lineWidth = (o.width || 2) * (1 - p * 0.22);
      ctx.lineCap = "round";
      ctx.beginPath();
      const ox = (r() - 0.5) * (o.jitter || 5);
      const oy = (r() - 0.5) * (o.jitter || 5);
      for (let i = 0; i < pts.length; i++) {
        const x = pts[i][0] + ox + (r() - 0.5) * (o.jitter || 5) * 0.5;
        const y = pts[i][1] + oy + (r() - 0.5) * (o.jitter || 5) * 0.5;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      if (o.close) ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }

  // ---------------------------------------------------------------- splatter
  function splatter(ctx, cx, cy, radius, color, seed, opts) {
    const o = opts || {};
    const r = R(seed);
    const scale = o.scale || 1;
    ctx.save();
    ctx.globalCompositeOperation = o.mode || "multiply";
    // organic core blob: smooth radial wobble, no hard steps
    const core = o.core == null ? 1 : o.core;
    if (core > 0) {
      ctx.globalAlpha = 0.88 * core;
      ctx.fillStyle = color;
      const N = 64;
      const p1 = r() * 6.28,
        p2 = r() * 6.28,
        p3 = r() * 6.28;
      const pts = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const wob = 0.78 + 0.16 * Math.sin(a * 3 + p1) + 0.09 * Math.sin(a * 5 + p2) + 0.05 * Math.sin(a * 9 + p3);
        const rr = radius * wob * scale;
        pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.94]);
      }
      ctx.beginPath();
      ctx.moveTo((pts[0][0] + pts[N - 1][0]) / 2, (pts[0][1] + pts[N - 1][1]) / 2);
      for (let i = 0; i < N; i++) {
        const p = pts[i];
        const n = pts[(i + 1) % N];
        ctx.quadraticCurveTo(p[0], p[1], (p[0] + n[0]) / 2, (p[1] + n[1]) / 2);
      }
      ctx.closePath();
      ctx.fill();
      // darker wet centre
      ctx.globalAlpha = 0.22 * core;
      ctx.fillStyle = o.deep || "rgba(96,14,20,1)";
      ctx.beginPath();
      ctx.ellipse(cx + (r() - 0.5) * radius * 0.2, cy + (r() - 0.5) * radius * 0.2, radius * 0.34, radius * 0.27, r(), 0, Math.PI * 2);
      ctx.fill();
    }
    // droplets
    const drops = o.drops == null ? 34 : o.drops;
    for (let i = 0; i < drops; i++) {
      const a = r() * Math.PI * 2;
      const d = radius * (0.5 + Math.pow(r(), 0.5) * (o.spread || 2.6)) * scale;
      const x = cx + Math.cos(a) * d;
      const y = cy + Math.sin(a) * d * 0.95;
      const rad = (0.6 + Math.pow(r(), 2.4) * radius * 0.16) * scale;
      ctx.globalAlpha = 0.45 + r() * 0.5;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(x, y, rad, rad * (0.7 + r() * 0.6), a, 0, Math.PI * 2);
      ctx.fill();
      if (r() < 0.3) {
        ctx.globalAlpha *= 0.45;
        ctx.beginPath();
        ctx.ellipse(x - Math.cos(a) * rad * 3.2, y - Math.sin(a) * rad * 3.2, rad * 2.4, rad * 0.5, a, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- figures
  /** stylised ink figure: hair, head, coat, tapered arms, legs */
  function figure(ctx, x, top, h, opts) {
    const o = opts || {};
    const col = o.color || "rgba(28,24,26,0.88)";
    const hr = h * 0.056;
    const hy = top + hr * 1.16; // head centre
    const shY = top + h * 0.175;
    const shW = h * (o.shoulder || 0.142);
    const waistY = top + h * 0.43;
    const wW = h * 0.096;
    const hipY = top + h * 0.53;
    const hW = h * 0.118;
    const hemY = top + h * 0.72;
    const footY = top + h * 0.985;

    ctx.save();
    ctx.globalCompositeOperation = o.mode || "multiply";
    ctx.fillStyle = col;

    // ---- hair: short bob that hugs the skull and ends at the jaw
    if (o.hair !== false) {
      const hw = hr * (o.hairW || 1.14);
      const len = h * (o.hairLen || 0.055);
      ctx.beginPath();
      ctx.moveTo(x - hw, hy - hr * 0.35);
      ctx.bezierCurveTo(x - hw * 1.2, hy + len * 0.5, x - hw * 1.05, hy + len * 0.92, x - hw * 0.62, hy + len);
      ctx.quadraticCurveTo(x - hw * 0.42, hy + len * 0.72, x - hw * 0.24, hy + len * 0.62);
      ctx.lineTo(x + hw * 0.24, hy + len * 0.62);
      ctx.quadraticCurveTo(x + hw * 0.42, hy + len * 0.72, x + hw * 0.62, hy + len);
      ctx.bezierCurveTo(x + hw * 1.05, hy + len * 0.92, x + hw * 1.2, hy + len * 0.5, x + hw, hy - hr * 0.35);
      ctx.arc(x, hy - hr * 0.3, hw, 0, Math.PI, true);
      ctx.closePath();
      ctx.fill();
    }

    // ---- arms first: the coat covers their tops, so no double-inked seams
    const arm = (sx, sy, ex, ey, w0, w1) => {
      const dx = ex - sx,
        dy = ey - sy;
      const L = Math.hypot(dx, dy) || 1;
      const nx = -dy / L,
        ny = dx / L;
      const mx = (sx + ex) / 2,
        my = (sy + ey) / 2;
      const bend = o.armBow || 0;
      ctx.beginPath();
      ctx.moveTo(sx + nx * w0, sy + ny * w0);
      ctx.quadraticCurveTo(mx + nx * (w0 + w1) * 0.6 + bend, my + ny * (w0 + w1) * 0.6, ex + nx * w1, ey + ny * w1);
      ctx.lineTo(ex - nx * w1, ey - ny * w1);
      ctx.quadraticCurveTo(mx - nx * (w0 + w1) * 0.6 + bend, my - ny * (w0 + w1) * 0.6, sx - nx * w0, sy - ny * w0);
      ctx.closePath();
      ctx.fill();
    };
    const ends = o.arms || [
      [x - hW * 1.02, top + h * 0.68],
      [x + hW * 1.02, top + h * 0.68],
    ];
    arm(x - shW * 0.9, shY + h * 0.05, ends[0][0], ends[0][1], h * 0.026, h * 0.015);
    arm(x + shW * 0.9, shY + h * 0.05, ends[1][0], ends[1][1], h * 0.026, h * 0.015);

    // ---- body: shoulders -> waist -> hips -> coat hem -> legs
    ctx.beginPath();
    ctx.moveTo(x - shW, shY);
    ctx.bezierCurveTo(x - shW * 1.04, shY + h * 0.11, x - wW * 1.16, waistY - h * 0.07, x - wW, waistY);
    ctx.bezierCurveTo(x - wW * 1.04, hipY - h * 0.03, x - hW * 1.02, hipY - h * 0.02, x - hW, hipY + h * 0.015);
    ctx.lineTo(x - hW * 1.02, hemY);
    ctx.lineTo(x - hW * 0.6, footY);
    ctx.lineTo(x - hW * 0.22, footY);
    ctx.lineTo(x - hW * 0.13, hipY + h * 0.15);
    ctx.lineTo(x + hW * 0.13, hipY + h * 0.15);
    ctx.lineTo(x + hW * 0.22, footY);
    ctx.lineTo(x + hW * 0.6, footY);
    ctx.lineTo(x + hW * 1.02, hemY);
    ctx.lineTo(x + hW, hipY + h * 0.015);
    ctx.bezierCurveTo(x + hW * 1.02, hipY - h * 0.02, x + wW * 1.04, hipY - h * 0.03, x + wW, waistY);
    ctx.bezierCurveTo(x + wW * 1.16, waistY - h * 0.07, x + shW * 1.04, shY + h * 0.11, x + shW, shY);
    ctx.quadraticCurveTo(x + shW * 0.62, shY - h * 0.038, x + hr * 0.82, shY - h * 0.05);
    ctx.lineTo(x + hr * 0.82, hy + hr * 0.86);
    ctx.lineTo(x - hr * 0.82, hy + hr * 0.86);
    ctx.lineTo(x - hr * 0.82, shY - h * 0.05);
    ctx.quadraticCurveTo(x - shW * 0.62, shY - h * 0.038, x - shW, shY);
    ctx.closePath();
    ctx.fill();

    // ---- head
    ctx.beginPath();
    ctx.ellipse(x, hy, hr, hr * 1.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /** thin gravity drip */
  function drip(ctx, x, y, len, color, seed, w) {
    const r = R(seed);
    const g = ctx.createLinearGradient(x, y, x, y + len);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = g;
    ctx.lineWidth = w || 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    const seg = 6;
    for (let i = 1; i <= seg; i++) {
      const yy = y + (len * i) / seg;
      ctx.lineTo(x + (r() - 0.5) * 2.2, yy);
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.ellipse(x, y + len, (w || 2) * 0.9, (w || 2) * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ---------------------------------------------------------------- patterns
  function halftoneTile(size, dotColor) {
    const c = make(size, size);
    const ctx = c.getContext("2d");
    ctx.fillStyle = dotColor;
    const step = size / 4;
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const cx = x * step + step / 2 + (y % 2 ? step / 2 : 0);
        const cy = y * step + step / 2;
        ctx.beginPath();
        ctx.arc(cx % size, cy, step * 0.22, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    return c;
  }

  function hatchTile(size, color, seed) {
    const c = make(size, size);
    const ctx = c.getContext("2d");
    const r = R(seed);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    for (let i = -size; i < size * 2; i += 5) {
      ctx.globalAlpha = 0.25 + r() * 0.3;
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + size * 0.5, size);
      ctx.stroke();
    }
    return c;
  }

  // ---------------------------------------------------------------- overlays
  function grain(ctx, w, h, tile, alpha, t, offset) {
    const o = offset || 0;
    const ox = ((t * 37 + o * 13) % tile.width) - tile.width;
    const oy = ((t * 61 + o * 29) % tile.height) - tile.height;
    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = alpha;
    for (let y = oy; y < h; y += tile.height) {
      for (let x = ox; x < w; x += tile.width) ctx.drawImage(tile, x, y);
    }
    ctx.restore();
  }

  function vignette(ctx, w, h, strength) {
    const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.32, w / 2, h / 2, h * 0.92);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, `rgba(20,14,16,${strength == null ? 0.55 : strength})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  /** vertical rain streaks; deterministic by t */
  function rain(ctx, w, h, t, seed, intensity, opts) {
    const o = opts || {};
    const r = R(seed);
    const n = Math.round((o.count || 150) * intensity);
    ctx.save();
    ctx.lineCap = "round";
    const ang = o.angle == null ? 0.13 : o.angle;
    for (let i = 0; i < n; i++) {
      const x0 = r() * (w + 400) - 200;
      const speed = 900 + r() * 1400;
      const len = 40 + r() * 150;
      const y = ((r() * (h + 300) + t * speed) % (h + 300)) - 150;
      ctx.globalAlpha = (0.08 + r() * 0.3) * (o.alpha == null ? 1 : o.alpha);
      ctx.strokeStyle = o.color || "#f4f2f0";
      ctx.lineWidth = 0.7 + r() * 1.8;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x0 + Math.sin(ang) * len, y + Math.cos(ang) * len);
      ctx.stroke();
    }
    ctx.restore();
  }

  function dust(ctx, w, h, t, seed, count, alpha) {
    const r = R(seed);
    ctx.save();
    for (let i = 0; i < (count || 60); i++) {
      const x = (r() * w + t * (8 + r() * 24)) % w;
      const y = (r() * h - t * (5 + r() * 16) + h) % h;
      const s = 0.6 + r() * 2.2;
      ctx.globalAlpha = (alpha == null ? 0.35 : alpha) * (0.3 + r() * 0.7);
      ctx.fillStyle = "#fdfbf7";
      ctx.beginPath();
      ctx.arc(x, y, s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- type
  const FONT_DISPLAY = "'Impact','Haettenschweiler','Arial Black','Arial Narrow',sans-serif";
  const FONT_SERIF = "Georgia,'Times New Roman',serif";
  const FONT_MONO = "'Courier New',monospace";

  /** hand-inked display type with paper knockout */
  function inkType(ctx, text, x, y, size, opts) {
    const o = opts || {};
    const r = R(o.seed || 7);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(o.rot || 0);
    ctx.font = `${o.weight || 900} ${size}px ${o.font || FONT_DISPLAY}`;
    ctx.textAlign = o.align || "center";
    ctx.textBaseline = "middle";
    const jitter = o.jitter == null ? size * 0.012 : o.jitter;
    const chars = [...text];
    // measure total width for letter-spacing / per-char jitter
    const spacing = o.tracking || 0;
    const widths = chars.map((c) => ctx.measureText(c).width);
    const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
    let cx = o.align === "left" ? 0 : o.align === "right" ? -total : -total / 2;
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      const cw = widths[i];
      if (ch.trim()) {
        const dx = cx + cw / 2 + (r() - 0.5) * jitter * 2;
        const dy = (r() - 0.5) * jitter * 2;
        const rot = (r() - 0.5) * (o.charRot == null ? 0.04 : o.charRot);
        ctx.save();
        ctx.translate(dx, dy);
        ctx.rotate(rot);
        if (o.knockout) {
          ctx.globalCompositeOperation = "destination-out";
          ctx.globalAlpha = 1;
          ctx.fillText(ch, 0, 0);
          ctx.globalCompositeOperation = "source-over";
        }
        if (o.shadow) {
          ctx.globalAlpha = 0.28;
          ctx.fillStyle = o.shadow;
          ctx.fillText(ch, 2.5, 3.5);
        }
        ctx.globalAlpha = o.alpha == null ? 1 : o.alpha;
        ctx.fillStyle = o.color || PAL.ink;
        ctx.fillText(ch, 0, 0);
        if (o.stroke) {
          ctx.globalAlpha = (o.alpha == null ? 1 : o.alpha) * 0.5;
          ctx.lineWidth = Math.max(1, size * 0.012);
          ctx.strokeStyle = o.stroke;
          ctx.strokeText(ch, 0, 0);
        }
        ctx.restore();
      }
      cx += cw + spacing;
    }
    ctx.restore();
  }

  /** soft blurred ink type — used for motion-blurred cuts */
  function inkTypeBlur(ctx, text, x, y, size, blur, opts) {
    ctx.save();
    ctx.filter = `blur(${blur}px)`;
    inkType(ctx, text, x, y, size, opts);
    ctx.restore();
  }

  global.LIB = {
    R,
    lerp,
    clamp,
    smooth,
    easeOut,
    easeIn,
    easeInOut,
    make,
    PAL,
    fbm,
    paperTile,
    grainTile,
    paintPaper,
    wash,
    inkStroke,
    sketchPath,
    splatter,
    figure,
    drip,
    halftoneTile,
    hatchTile,
    grain,
    vignette,
    rain,
    dust,
    inkType,
    inkTypeBlur,
    FONT_DISPLAY,
    FONT_SERIF,
    FONT_MONO,
  };
})(window);
