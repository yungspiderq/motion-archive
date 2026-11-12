/* 目撃！テト３１世 — canvas motion clip engine */
(() => {
  'use strict';

  const A = window.TETO31_ANALYSIS;
  if (!A) { console.error('analysis.js is missing'); return; }
  const LYR = window.TETO31_LYRICS || null;

  const W = 1920;
  const H = 1080;
  const TAU = Math.PI * 2;

  const cv = document.getElementById('cv');
  const ctx = cv.getContext('2d', { alpha: false });
  const startEl = document.getElementById('start');
  const playBtn = document.getElementById('playBtn');
  const playLabel = document.getElementById('playLabel');
  const loadMsg = document.getElementById('loadMsg');
  const trackEl = document.getElementById('track');
  const fillEl = document.getElementById('fill');
  const headEl = document.getElementById('head');
  const markersEl = document.getElementById('markers');
  const waveEl = document.getElementById('wave');
  const curEl = document.getElementById('cur');
  const durEl = document.getElementById('dur');
  const replayEl = document.getElementById('replay');
  const centerIcon = document.getElementById('centerIcon');
  const ppIcon = document.getElementById('ppIcon');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const muteBtn = document.getElementById('muteBtn');
  const muteIcon = document.getElementById('muteIcon');
  const restartBtn = document.getElementById('restartBtn');
  const fsBtn = document.getElementById('fsBtn');
  const volumeEl = document.getElementById('volume');
  const volumeValEl = document.getElementById('volumeVal');

  // ---------------------------------------------------------------- palette

  const C = {
    ink: '#07060D',
    night: '#0B0A16',
    cream: '#FFF4DC',
    bone: '#F3E6C9',
    paper: '#FBF1D9',
    orange: '#FF7A18',
    amber: '#FFB020',
    gold: '#FFD24A',
    red: '#FF2E4D',
    teto: '#E72444',
    wine: '#8F1028',
    purple: '#7A4DFF',
    violet: '#B18CFF',
    green: '#B8FF3D',
    toxic: '#79FF5A',
    emerald: '#1FBF4A',
    moon: '#FFE9A8',
    blue: '#2F4BFF',
    cyan: '#35E3E8',
    pink: '#FF5FA2',
    brown: '#5C3317',
    chocolate: '#C98A55',
    skin: '#FFE3C8',
    gray: '#2A2733',
    smoke: '#171522'
  };

  const LOOKS = {
    night:  { bg: C.night,  ink: C.cream, a: C.orange, b: C.purple, c: C.green,  pop: [C.orange, C.green, C.purple] },
    orange: { bg: C.orange, ink: C.ink,   a: C.cream,  b: C.red,    c: C.purple, pop: [C.cream, C.red, C.purple] },
    cream:  { bg: C.cream,  ink: C.ink,   a: C.red,    b: C.orange, c: C.purple, pop: [C.red, C.orange, C.purple] },
    red:    { bg: C.red,    ink: C.ink,   a: C.cream,  b: C.gold,   c: C.ink,    pop: [C.cream, C.gold, C.night] },
    green:  { bg: C.green,  ink: C.ink,   a: C.red,    b: C.purple, c: C.cream,  pop: [C.red, C.purple, C.cream] },
    purple: { bg: C.purple, ink: C.cream, a: C.orange, b: C.green,  c: C.cream,  pop: [C.orange, C.green, C.cream] },
    moon:   { bg: C.moon,   ink: C.ink,   a: C.red,    b: C.purple, c: C.orange, pop: [C.red, C.purple, C.orange] },
    pink:   { bg: C.pink,   ink: C.ink,   a: C.cream,  b: C.cyan,   c: C.gold,   pop: [C.cream, C.cyan, C.gold] },
    brown:  { bg: C.brown,  ink: C.cream, a: C.gold,   b: C.orange, c: C.pink,   pop: [C.gold, C.orange, C.pink] },
    split:  { bg: C.purple, ink: C.cream, a: C.green,  b: C.orange, c: C.cream,  pop: [C.green, C.orange, C.cream] }
  };

  // ---------------------------------------------------------------- utilities

  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const mod = (n, m) => ((n % m) + m) % m;
  const smooth = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  const easeOutCubic = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const easeOutBack = t => {
    const c1 = 1.70158, c3 = c1 + 1;
    t = clamp(t, 0, 1);
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };
  const easeOutExpo = t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(t, 0, 1));

  function hash(n) {
    const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
  }

  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0;
      a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function formatTime(s) {
    s = Math.max(0, s);
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + String(sec).padStart(2, '0');
  }

  // ---------------------------------------------------------------- paths

  function pathRR(x, y, w, h, r) {
    r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function fillRR(x, y, w, h, r, fill, stroke, lw) {
    pathRR(x, y, w, h, r);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke && lw) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  }

  function circle(x, y, r, fill, stroke, lw) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke && lw) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  }

  function starPath(cx, cy, r, points = 5, inner = 0.45, rot = -Math.PI / 2) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const rr = i % 2 === 0 ? r : r * inner;
      const a = rot + i * Math.PI / points;
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  function drawStar(cx, cy, r, fill, stroke, lw, rot = -Math.PI / 2, points = 5, inner = 0.45) {
    starPath(cx, cy, r, points, inner, rot);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke && lw) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); }
  }

  function heartPath(cx, cy, s, rot = 0) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, s * 0.42);
    ctx.bezierCurveTo(-s * 1.05, -s * 0.24, -s * 0.58, -s * 0.98, 0, -s * 0.44);
    ctx.bezierCurveTo(s * 0.58, -s * 0.98, s * 1.05, -s * 0.24, 0, s * 0.42);
    ctx.closePath();
    ctx.restore();
  }

  function drawHeart(cx, cy, s, fill, stroke, lw, rot = 0) {
    heartPath(cx, cy, s, rot);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke && lw) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); }
  }

  function drawSparkle(cx, cy, s, fill, rot = 0, alpha = 1) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(s * 0.14, -s * 0.14, s, 0);
    ctx.quadraticCurveTo(s * 0.14, s * 0.14, 0, s);
    ctx.quadraticCurveTo(-s * 0.14, s * 0.14, -s, 0);
    ctx.quadraticCurveTo(-s * 0.14, -s * 0.14, 0, -s);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.restore();
  }

  function drawBarcode(x, y, w, h, color) {
    const r = rng(Math.round(x * 13 + y * 7 + w));
    ctx.save();
    ctx.fillStyle = color;
    let px = x;
    while (px < x + w - 2) {
      const bw = 1 + Math.floor(r() * 5);
      const gap = 1 + Math.floor(r() * 4);
      ctx.fillRect(px, y, bw, h);
      px += bw + gap;
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- type

  const FONT_EN = '"Arial Black","Impact","Franklin Gothic Heavy","Segoe UI",sans-serif';
  const FONT_JP = '"Yu Gothic UI","Yu Gothic","Meiryo","MS Gothic",sans-serif';

  function setFont(size, jp, weight = 900) {
    ctx.font = weight + ' ' + size + 'px ' + (jp ? FONT_JP : FONT_EN);
  }

  function measure(text, size, jp = false, tracking = 0) {
    setFont(size, jp);
    if (!tracking) return ctx.measureText(text).width;
    const chars = Array.from(text);
    let w = 0;
    for (const ch of chars) w += ctx.measureText(ch).width;
    return w + tracking * Math.max(0, chars.length - 1);
  }

  function fitSize(text, size, maxWidth, jp = false, tracking = 0) {
    const w = measure(text, size, jp, tracking);
    if (w <= maxWidth) return size;
    return Math.max(8, size * maxWidth / w);
  }

  function drawText(text, x, y, size, opt = {}) {
    const {
      color = C.cream,
      stroke = C.ink,
      lw = Math.max(2, size * 0.055),
      align = 'center',
      baseline = 'middle',
      jp = false,
      tracking = 0,
      shadow = size * 0.035,
      shadowColor = stroke,
      alpha = 1,
      rot = 0,
      sx = 1,
      sy = 1,
      weight = 900
    } = opt;

    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    if (sx !== 1 || sy !== 1) ctx.scale(sx, sy);
    setFont(size, jp, weight);
    ctx.textAlign = 'left';
    ctx.textBaseline = baseline;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;

    if (!Array.isArray(color)) {
      const start = align === 'center' ? -ctx.measureText(text).width / 2 : align === 'right' ? -ctx.measureText(text).width : 0;
      if (shadow) {
        ctx.fillStyle = shadowColor;
        ctx.fillText(text, start + shadow, shadow);
      }
      if (stroke && lw > 0) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lw;
        ctx.strokeText(text, start, 0);
      }
      ctx.fillStyle = color;
      ctx.fillText(text, start, 0);
    } else {
      const chars = Array.from(text);
      const widths = chars.map(ch => ctx.measureText(ch).width);
      const total = widths.reduce((a, b) => a + b, 0) + tracking * Math.max(0, chars.length - 1);
      let cx = align === 'center' ? -total / 2 : align === 'right' ? -total : 0;
      for (let i = 0; i < chars.length; i++) {
        if (shadow) {
          ctx.fillStyle = shadowColor;
          ctx.fillText(chars[i], cx + shadow, shadow);
        }
        if (stroke && lw > 0) {
          ctx.strokeStyle = stroke;
          ctx.lineWidth = lw;
          ctx.strokeText(chars[i], cx, 0);
        }
        ctx.fillStyle = color[i % color.length];
        ctx.fillText(chars[i], cx, 0);
        cx += widths[i] + tracking;
      }
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- patterns

  const dotCache = new Map();

  function dotPattern(color) {
    if (dotCache.has(color)) return dotCache.get(color);
    const c = document.createElement('canvas');
    c.width = 34;
    c.height = 34;
    const g = c.getContext('2d');
    g.fillStyle = color;
    g.beginPath();
    g.arc(17, 17, 4.4, 0, TAU);
    g.fill();
    const p = ctx.createPattern(c, 'repeat');
    dotCache.set(color, p);
    return p;
  }

  function halftone(x, y, w, h, color, alpha = 1) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = dotPattern(color);
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  function checker(x, y, w, h, size, c1, c2, ox = 0, oy = 0, alpha = 1) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.globalAlpha *= alpha;
    const nx = Math.ceil(w / size) + 2;
    const ny = Math.ceil(h / size) + 2;
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const px = x + i * size - mod(ox, size);
        const py = y + j * size - mod(oy, size);
        ctx.fillStyle = (i + j) % 2 ? c2 : c1;
        ctx.fillRect(px, py, size + 1, size + 1);
      }
    }
    ctx.restore();
  }

  function radialBurst(cx, cy, r, colors, rot = 0, alpha = 1, segments = 28) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    for (let i = 0; i < segments; i++) {
      const a0 = rot + i / segments * TAU;
      const a1 = rot + (i + 1) / segments * TAU;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, a0, a1);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
    }
    ctx.restore();
  }

  function speedLines(cx, cy, t, count, color, alpha = 1) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    for (let i = 0; i < count; i++) {
      const a = hash(i * 4.17) * TAU + t * (0.16 + hash(i) * 0.2);
      const r0 = 260 + hash(i + 9) * 620;
      const len = 90 + hash(i + 3) * 360;
      ctx.lineWidth = 3 + hash(i + 7) * 12;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      ctx.lineTo(cx + Math.cos(a) * (r0 + len), cy + Math.sin(a) * (r0 + len));
      ctx.stroke();
    }
    ctx.restore();
  }

  function confetti(t, colors, count = 70, alpha = 1) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    for (let i = 0; i < count; i++) {
      const seed = i * 9.37;
      const x = mod(hash(seed) * W + Math.sin(t * 0.7 + i) * 40, W);
      const y = mod(hash(seed + 1.7) * (H + 160) + t * (90 + hash(seed) * 160), H + 160) - 80;
      const s = 6 + hash(seed + 3.1) * 12;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t * (1 + hash(seed) * 3) + seed);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(-s * 0.5, -s * 0.25, s, s * 0.5);
      ctx.restore();
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- theme art

  function drawMoon(x, y, r, opt = {}) {
    const color = opt.color || C.moon;
    const alpha = opt.alpha == null ? 1 : opt.alpha;
    ctx.save();
    ctx.globalAlpha *= alpha;
    if (opt.glow !== false) {
      const g = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 2.1);
      g.addColorStop(0, 'rgba(255,233,168,.22)');
      g.addColorStop(1, 'rgba(255,233,168,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - r * 2.2, y - r * 2.2, r * 4.4, r * 4.4);
    }
    circle(x, y, r, color, opt.stroke || C.ink, opt.lw == null ? Math.max(3, r * 0.025) : opt.lw);
    const rr = rng(31);
    for (let i = 0; i < 9; i++) {
      const a = rr() * TAU;
      const d = Math.sqrt(rr()) * r * 0.78;
      const cr = r * (0.04 + rr() * 0.11);
      ctx.globalAlpha = alpha * (0.08 + rr() * 0.1);
      circle(x + Math.cos(a) * d, y + Math.sin(a) * d, cr, C.ink, null, 0);
    }
    ctx.restore();
  }

  function drawBat(x, y, s, rot, color, alpha = 1) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-0.28, -0.42, -1.1, -0.55, -1.52, -0.86);
    ctx.bezierCurveTo(-1.38, -0.32, -1.2, 0.02, -0.78, 0.25);
    ctx.bezierCurveTo(-0.58, -0.04, -0.38, 0.02, -0.2, 0.18);
    ctx.bezierCurveTo(-0.05, 0.06, 0.05, 0.06, 0.2, 0.18);
    ctx.bezierCurveTo(0.38, 0.02, 0.58, -0.04, 0.78, 0.25);
    ctx.bezierCurveTo(1.2, 0.02, 1.38, -0.32, 1.52, -0.86);
    ctx.bezierCurveTo(1.1, -0.55, 0.28, -0.42, 0, 0);
    ctx.closePath();
    ctx.fill();
    circle(0, 0.02, 0.17, color, null, 0);
    ctx.restore();
  }

  function drawPumpkin(x, y, r, rot = 0, opt = {}) {
    const body = opt.body || C.orange;
    const ink = opt.ink || C.ink;
    const lit = opt.lit !== false;
    const face = opt.face !== false;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    if (opt.glow !== false) {
      const g = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 2);
      g.addColorStop(0, 'rgba(255,122,24,.26)');
      g.addColorStop(1, 'rgba(255,122,24,0)');
      ctx.fillStyle = g;
      ctx.fillRect(-r * 2, -r * 2, r * 4, r * 4);
    }
    // stem
    ctx.beginPath();
    ctx.moveTo(-r * 0.1, -r * 0.72);
    ctx.quadraticCurveTo(-r * 0.02, -r * 1.08, r * 0.18, -r * 1.06);
    ctx.lineWidth = r * 0.16;
    ctx.strokeStyle = opt.stem || '#5C7A24';
    ctx.lineCap = 'round';
    ctx.stroke();
    // lobes
    const lobes = [-0.56, -0.28, 0, 0.28, 0.56];
    for (let i = 0; i < lobes.length; i++) {
      const off = lobes[i] * r;
      const rx = r * (i === 2 ? 0.58 : 0.46);
      const ry = r * (i === 2 ? 0.76 : 0.68);
      ctx.beginPath();
      ctx.ellipse(off, 0, rx, ry, 0, 0, TAU);
      ctx.fillStyle = i % 2 ? body : opt.body2 || '#F0640F';
      ctx.fill();
      ctx.lineWidth = Math.max(3, r * 0.035);
      ctx.strokeStyle = ink;
      ctx.stroke();
    }
    // face
    if (face) {
      ctx.fillStyle = lit ? C.gold : ink;
      ctx.beginPath();
      ctx.moveTo(-r * 0.42, -r * 0.18);
      ctx.lineTo(-r * 0.16, -r * 0.42);
      ctx.lineTo(-r * 0.1, -r * 0.06);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(r * 0.42, -r * 0.18);
      ctx.lineTo(r * 0.16, -r * 0.42);
      ctx.lineTo(r * 0.1, -r * 0.06);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-r * 0.44, r * 0.18);
      ctx.lineTo(-r * 0.28, r * 0.06);
      ctx.lineTo(-r * 0.1, r * 0.22);
      ctx.lineTo(r * 0.08, r * 0.06);
      ctx.lineTo(r * 0.28, r * 0.22);
      ctx.lineTo(r * 0.46, r * 0.08);
      ctx.lineTo(r * 0.36, r * 0.44);
      ctx.lineTo(-r * 0.34, r * 0.44);
      ctx.closePath();
      ctx.fill();
      if (lit) {
        ctx.globalAlpha *= 0.35;
        circle(0, 0, r * 0.7, C.gold, null, 0);
      }
    }
    // ribs
    ctx.globalAlpha *= 0.22;
    ctx.strokeStyle = ink;
    ctx.lineWidth = Math.max(2, r * 0.02);
    for (const k of [-0.68, -0.34, 0.34, 0.68]) {
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.abs(k) * r + r * 0.05, r * 0.66, 0, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawZombieHand(x, y, s, rot, opt = {}) {
    const skin = opt.skin || C.toxic;
    const ink = opt.ink || C.ink;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    // sleeve
    ctx.fillStyle = opt.sleeve || C.purple;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 0.05;
    pathRR(-0.52, 0.75, 1.04, 1.4, 0.18);
    ctx.fill();
    ctx.stroke();
    // wrist + palm
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.moveTo(-0.34, 0.82);
    ctx.lineTo(-0.42, 0.18);
    ctx.quadraticCurveTo(-0.38, -0.32, -0.1, -0.42);
    ctx.lineTo(0.36, -0.4);
    ctx.quadraticCurveTo(0.52, -0.05, 0.44, 0.4);
    ctx.lineTo(0.4, 0.82);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // fingers
    const fin = [
      [-0.3, -0.38, -0.46, -0.95, -0.34, -1.02],
      [-0.08, -0.44, -0.15, -1.1, -0.02, -1.12],
      [0.14, -0.42, 0.14, -1.05, 0.27, -1.0],
      [0.34, -0.32, 0.45, -0.85, 0.55, -0.72]
    ];
    for (const f of fin) {
      ctx.beginPath();
      ctx.moveTo(f[0], f[1]);
      ctx.quadraticCurveTo(f[2] * 0.7, f[3] * 0.7, f[2], f[3]);
      ctx.quadraticCurveTo(f[4], f[5], f[0] + 0.16, f[1] + 0.1);
      ctx.closePath();
      ctx.fillStyle = skin;
      ctx.fill();
      ctx.stroke();
    }
    // stitches
    ctx.strokeStyle = ink;
    ctx.lineWidth = 0.035;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-0.2 + i * 0.16, 0.25);
      ctx.lineTo(-0.12 + i * 0.16, 0.34);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawCandy(x, y, s, rot, color = C.pink, ink = C.ink) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.fillStyle = color;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 0.045;
    // wrapper wings
    ctx.beginPath();
    ctx.moveTo(-0.74, -0.3);
    ctx.lineTo(-1.32, -0.52);
    ctx.lineTo(-1.18, 0);
    ctx.lineTo(-1.32, 0.52);
    ctx.lineTo(-0.74, 0.3);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0.74, -0.3);
    ctx.lineTo(1.32, -0.52);
    ctx.lineTo(1.18, 0);
    ctx.lineTo(1.32, 0.52);
    ctx.lineTo(0.74, 0.3);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    // body
    ctx.beginPath();
    ctx.ellipse(0, 0, 0.78, 0.56, 0, 0, TAU);
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(7,6,13,.45)';
    ctx.lineWidth = 0.05;
    ctx.beginPath();
    ctx.arc(0, 0, 0.44, -1.2, 1.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 0.44, 1.95, 4.34);
    ctx.stroke();
    ctx.restore();
  }

  function drawCookie(x, y, s, rot, ink = C.ink) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.arc(0, 0, 0.9, 0, TAU);
    ctx.fillStyle = C.chocolate;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 0.05;
    ctx.stroke();
    const rr = rng(77);
    ctx.fillStyle = C.ink;
    for (let i = 0; i < 12; i++) {
      const a = rr() * TAU, d = Math.sqrt(rr()) * 0.62;
      circle(Math.cos(a) * d, Math.sin(a) * d, 0.06 + rr() * 0.04, C.ink, null, 0);
    }
    ctx.restore();
  }

  function drawChocolate(x, y, s, rot, ink = C.ink) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.fillStyle = C.brown;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 0.045;
    pathRR(-0.8, -1.0, 1.6, 2.0, 0.08);
    ctx.fill(); ctx.stroke();
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 2; c++) {
        fillRR(-0.68 + c * 0.76, -0.88 + r * 0.46, 0.62, 0.36, 0.05, C.chocolate, ink, 0.035);
      }
    }
    ctx.restore();
  }

  function drawWaxSeal(x, y, r, ink = C.ink) {
    ctx.save();
    ctx.translate(x, y);
    const n = 18;
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = i / (n * 2) * TAU;
      const rr = i % 2 ? r * 0.92 : r;
      const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = C.wine;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = Math.max(2, r * 0.06);
    ctx.stroke();
    circle(0, 0, r * 0.72, '#B21832', ink, Math.max(1.5, r * 0.035));
    drawText('31', 0, r * 0.02, r * 0.76, { color: C.cream, stroke: ink, lw: r * 0.035, shadow: 0, jp: false });
    ctx.restore();
  }

  function drawCallingCard(x, y, w, h, rot = 0, opt = {}) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.shadowColor = 'rgba(0,0,0,.45)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 14;
    fillRR(-w / 2, -h / 2, w, h, 10, opt.fill || C.paper, C.ink, 5);
    ctx.shadowColor = 'transparent';
    fillRR(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 6, null, opt.ink || C.ink, 2);
    ctx.globalAlpha *= 0.35;
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = C.ink;
      ctx.fillRect(-w * 0.34, h * 0.12 + i * 9, w * (0.2 + hash(i + 2) * 0.34), 2);
    }
    ctx.globalAlpha /= 0.35;
    drawText(opt.top || 'PHANTOM THIEF', 0, -h * 0.31, h * 0.055, {
      color: C.ink, stroke: null, lw: 0, shadow: 0, tracking: w * 0.002
    });
    drawText(opt.big || 'TETO', 0, -h * 0.04, h * 0.22, {
      color: C.wine, stroke: C.ink, lw: h * 0.008, shadow: 0
    });
    drawText(opt.sub || 'THE 31st', 0, h * 0.25, h * 0.085, {
      color: C.ink, stroke: null, lw: 0, shadow: 0, tracking: w * 0.006
    });
    drawWaxSeal(w * 0.34, h * 0.02, h * 0.14);
    ctx.restore();
  }

  function drawFrame(x, y, w, h, rot = 0, art = 0, ink = C.ink) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    // ornate outer
    ctx.fillStyle = C.gold;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 8;
    pathRR(-w / 2, -h / 2, w, h, 4);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#C58A1B';
    pathRR(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 2);
    ctx.fill();
    // art
    const aw = w - 46, ah = h - 46;
    ctx.save();
    pathRR(-aw / 2, -ah / 2, aw, ah, 1);
    ctx.clip();
    if (art === 0) {
      ctx.fillStyle = C.night;
      ctx.fillRect(-aw / 2, -ah / 2, aw, ah);
      drawMoon(aw * 0.15, -ah * 0.12, ah * 0.2, { glow: false, lw: 2 });
      ctx.fillStyle = C.purple;
      ctx.beginPath();
      ctx.moveTo(-aw / 2, ah / 2);
      ctx.lineTo(-aw * 0.1, -ah * 0.05);
      ctx.lineTo(aw * 0.2, ah / 2);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.ink;
      ctx.fillRect(-aw / 2, ah * 0.25, aw, ah * 0.25);
    } else if (art === 1) {
      ctx.fillStyle = C.orange;
      ctx.fillRect(-aw / 2, -ah / 2, aw, ah);
      drawPumpkin(0, ah * 0.08, ah * 0.3, 0, { glow: false, lw: 2 });
    } else if (art === 2) {
      ctx.fillStyle = C.cream;
      ctx.fillRect(-aw / 2, -ah / 2, aw, ah);
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = ah * 0.02;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(i * aw * 0.12, 0, ah * 0.3, -1.2, 1.2);
        ctx.stroke();
      }
      drawText('?', 0, 0, ah * 0.5, { color: C.wine, stroke: C.ink, lw: 5, shadow: 0 });
    } else {
      ctx.fillStyle = C.wine;
      ctx.fillRect(-aw / 2, -ah / 2, aw, ah);
      drawHeart(0, 0, ah * 0.3, C.cream, C.ink, 5);
    }
    ctx.restore();
    // plaque
    fillRR(-w * 0.18, h / 2 - 34, w * 0.36, 26, 3, C.paper, ink, 3);
    drawText(art === 1 ? 'PUMPKIN No.31' : art === 2 ? 'THE SCREAM' : art === 3 ? 'STOLEN HEART' : 'MOONLIGHT', 0, h / 2 - 20, 12, {
      color: C.ink, stroke: null, lw: 0, shadow: 0, tracking: 1.5
    });
    ctx.restore();
  }

  function drawSpotlight(x, y, width, color, alpha = 0.22) {
    ctx.save();
    const g = ctx.createLinearGradient(x, y, x, H);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - 30, y);
    ctx.lineTo(x + 30, y);
    ctx.lineTo(x + width / 2, H);
    ctx.lineTo(x - width / 2, H);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawJailBars(x, y, w, h, color, alpha = 1, gap = 92) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 14;
    for (let px = x; px <= x + w; px += gap) {
      ctx.beginPath();
      ctx.moveTo(px, y);
      ctx.lineTo(px, y + h);
      ctx.stroke();
    }
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.18);
    ctx.lineTo(x + w, y + h * 0.18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.82);
    ctx.lineTo(x + w, y + h * 0.82);
    ctx.stroke();
    ctx.restore();
  }

  function drawSticker(text, x, y, r, fill, rot = 0, opt = {}) {
    const ink = opt.ink || C.ink;
    const color = opt.color || ink;
    const lines = String(text).split('\n');
    const fs = opt.size || r * 0.3;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    const n = 26;
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU;
      const rr = i % 2 ? r * 0.95 : r;
      const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = ink;
    ctx.stroke();
    const lh = fs * 0.92;
    lines.forEach((line, i) => {
      drawText(line, 0, (i - (lines.length - 1) / 2) * lh, fs, {
        color, stroke: null, lw: 0, shadow: 0, tracking: 1
      });
    });
    ctx.restore();
  }

  function drawEvidenceTag(x, y, rot, text) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    fillRR(-130, -44, 260, 88, 8, C.paper, C.ink, 4);
    circle(-100, 0, 8, C.paper, C.ink, 3);
    drawBarcode(-60, 18, 110, 14, C.ink);
    drawText(text, 10, -10, 19, { color: C.ink, stroke: null, lw: 0, shadow: 0, tracking: 1 });
    ctx.restore();
  }

  // ---------------------------------------------------------------- Teto / Ui

  function drill(cx, cy, len, wid, rot, color = C.teto, ink = C.ink) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, -wid);
    for (let i = 0; i <= 8; i++) {
      const p = i / 8;
      const ripple = 1 + Math.sin(p * 9) * 0.08;
      ctx.lineTo(p * len, -wid * (1 - p * 0.84) * ripple);
    }
    for (let i = 8; i >= 0; i--) {
      const p = i / 8;
      const ripple = 1 + Math.sin(p * 9 + Math.PI) * 0.08;
      ctx.lineTo(p * len, wid * (1 - p * 0.84) * ripple);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 0.055;
    ctx.strokeStyle = ink;
    ctx.stroke();
    // spiral bands
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = 'rgba(7,6,13,.4)';
    ctx.lineWidth = 0.045;
    for (let i = 0; i < 4; i++) {
      const px = (0.18 + i * 0.2) * len;
      ctx.beginPath();
      ctx.moveTo(px - 0.1, -wid);
      ctx.quadraticCurveTo(px + 0.12, 0, px - 0.1, wid);
      ctx.stroke();
    }
    ctx.restore();
    ctx.restore();
  }

  function drawTeto(x, y, s, opt = {}) {
    const pose = opt.pose || 'idle';
    const ink = opt.ink || C.ink;
    const red = opt.hair || C.teto;
    const skin = opt.skin || C.skin;
    const cape = opt.cape || C.night;
    const suit = opt.suit || C.ink;
    const mask = opt.mask !== false;
    const hat = !!opt.hat;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(opt.rot || 0);
    ctx.scale(s, s);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // ---- cape behind
    ctx.beginPath();
    ctx.moveTo(-0.62, 0.72);
    ctx.quadraticCurveTo(-1.3, 1.4, -1.5, 2.55);
    ctx.quadraticCurveTo(0, 2.3, 1.5, 2.55);
    ctx.quadraticCurveTo(1.3, 1.4, 0.62, 0.72);
    ctx.closePath();
    ctx.fillStyle = cape;
    ctx.fill();
    ctx.lineWidth = 0.05;
    ctx.strokeStyle = ink;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-0.75, 0.85);
    ctx.quadraticCurveTo(-1.15, 1.6, -1.3, 2.4);
    ctx.strokeStyle = C.wine;
    ctx.lineWidth = 0.09;
    ctx.stroke();

    // ---- drills
    drill(-0.58, -0.16, 1.75, 0.34, Math.PI * 0.86, red, ink);
    drill(0.58, -0.16, 1.75, 0.34, Math.PI * 0.14, red, ink);

    // ---- legs
    const legSwing = pose === 'run' ? 0.5 : 0;
    const kneel = pose === 'kneel' || pose === 'caught';
    if (!kneel) {
      ctx.strokeStyle = ink;
      ctx.lineWidth = 0.16;
      ctx.beginPath();
      ctx.moveTo(-0.26, 1.48);
      ctx.lineTo(-0.34 - legSwing * 0.45, 2.35);
      ctx.lineTo(-0.6 - legSwing * 0.6, 2.85);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0.26, 1.48);
      ctx.lineTo(0.34 + legSwing * 0.45, 2.35);
      ctx.lineTo(0.62 + legSwing * 0.6, 2.85);
      ctx.stroke();
      // boots
      fillRR(-0.72 - legSwing * 0.6, 2.72, 0.36, 0.3, 0.1, suit, ink, 0.05);
      fillRR(0.4 + legSwing * 0.6, 2.72, 0.36, 0.3, 0.1, suit, ink, 0.05);
    } else {
      // folded legs for kneel
      ctx.strokeStyle = ink;
      ctx.lineWidth = 0.16;
      ctx.beginPath();
      ctx.moveTo(-0.24, 1.5);
      ctx.lineTo(-0.55, 2.25);
      ctx.lineTo(0.1, 2.65);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0.24, 1.5);
      ctx.lineTo(0.6, 2.2);
      ctx.lineTo(0.3, 2.75);
      ctx.stroke();
      fillRR(-0.68, 2.5, 0.42, 0.28, 0.1, suit, ink, 0.05);
      fillRR(0.26, 2.62, 0.42, 0.28, 0.1, suit, ink, 0.05);
    }

    // ---- torso
    ctx.beginPath();
    ctx.moveTo(-0.55, 0.78);
    ctx.lineTo(-0.4, 1.58);
    ctx.lineTo(0.4, 1.58);
    ctx.lineTo(0.55, 0.78);
    ctx.closePath();
    ctx.fillStyle = suit;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 0.055;
    ctx.stroke();
    // white shirt / collar
    ctx.beginPath();
    ctx.moveTo(-0.24, 0.8);
    ctx.lineTo(0, 1.16);
    ctx.lineTo(0.24, 0.8);
    ctx.lineTo(0.12, 1.5);
    ctx.lineTo(-0.12, 1.5);
    ctx.closePath();
    ctx.fillStyle = C.cream;
    ctx.fill();
    // ribbon
    ctx.fillStyle = C.red;
    ctx.beginPath();
    ctx.moveTo(0, 1.12);
    ctx.lineTo(-0.18, 1.0);
    ctx.lineTo(-0.18, 1.24);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 1.12);
    ctx.lineTo(0.18, 1.0);
    ctx.lineTo(0.18, 1.24);
    ctx.closePath(); ctx.fill();
    circle(0, 1.12, 0.065, C.red, ink, 0.03);

    // ---- arms
    let armL = [[-0.5, 0.88], [-0.86, 1.42], [-0.92, 1.72]];
    let armR = [[0.5, 0.88], [0.86, 1.42], [0.92, 1.72]];
    if (pose === 'point') armR = [[0.5, 0.86], [0.98, 0.58], [1.34, 0.28]];
    if (pose === 'run') {
      armL = [[-0.5, 0.88], [-0.94, 1.18], [-0.72, 1.48]];
      armR = [[0.5, 0.88], [0.92, 0.62], [1.18, 0.82]];
    }
    if (pose === 'shock') {
      armL = [[-0.5, 0.88], [-0.98, 0.7], [-1.12, 0.28]];
      armR = [[0.5, 0.88], [0.98, 0.7], [1.12, 0.28]];
    }
    if (pose === 'kneel') {
      armL = [[-0.5, 0.9], [-0.76, 1.22], [-0.62, 1.55]];
      armR = [[0.5, 0.9], [0.76, 1.22], [0.62, 1.55]];
    }
    if (pose === 'caught') {
      armL = [[-0.5, 0.88], [-0.82, 1.18], [-0.5, 1.42]];
      armR = [[0.5, 0.88], [0.82, 1.18], [0.5, 1.42]];
    }
    function arm(pts, sleeve) {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      ctx.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
      ctx.strokeStyle = ink;
      ctx.lineWidth = 0.2;
      ctx.stroke();
      ctx.strokeStyle = sleeve || ink;
      ctx.lineWidth = 0.12;
      ctx.stroke();
      circle(pts[2][0], pts[2][1], 0.11, C.cream, ink, 0.04);
    }
    arm(armL, suit);
    arm(armR, suit);

    // ---- head
    ctx.beginPath();
    ctx.ellipse(0, 0, 0.78, 0.73, 0, 0, TAU);
    ctx.fillStyle = skin;
    ctx.fill();
    ctx.lineWidth = 0.055;
    ctx.strokeStyle = ink;
    ctx.stroke();

    // side hair + fringe
    ctx.beginPath();
    ctx.moveTo(-0.78, -0.12);
    ctx.quadraticCurveTo(-0.9, -0.62, -0.34, -0.72);
    ctx.quadraticCurveTo(-0.12, -0.88, 0.12, -0.72);
    ctx.quadraticCurveTo(0.72, -0.78, 0.8, -0.22);
    ctx.quadraticCurveTo(0.6, -0.4, 0.42, -0.28);
    ctx.quadraticCurveTo(0.22, -0.52, 0.02, -0.3);
    ctx.quadraticCurveTo(-0.2, -0.52, -0.38, -0.28);
    ctx.quadraticCurveTo(-0.58, -0.38, -0.78, -0.12);
    ctx.closePath();
    ctx.fillStyle = red;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 0.045;
    ctx.stroke();

    // ahoge
    ctx.strokeStyle = red;
    ctx.lineWidth = 0.07;
    ctx.beginPath();
    ctx.moveTo(-0.1, -0.7);
    ctx.bezierCurveTo(-0.36, -1.16, 0.12, -1.3, 0.24, -1.0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0.08, -0.72);
    ctx.bezierCurveTo(0.3, -1.1, 0.52, -1.02, 0.54, -0.8);
    ctx.stroke();

    // mask
    if (mask) {
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.moveTo(-0.6, -0.16);
      ctx.lineTo(-0.06, -0.08);
      ctx.lineTo(-0.12, 0.1);
      ctx.lineTo(-0.62, 0.06);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0.6, -0.16);
      ctx.lineTo(0.06, -0.08);
      ctx.lineTo(0.12, 0.1);
      ctx.lineTo(0.62, 0.06);
      ctx.closePath();
      ctx.fill();
    }

    // eyes
    const eyeOpen = pose === 'shock' ? 1 : 1;
    const wink = opt.wink;
    for (const side of [-1, 1]) {
      if (wink && side === 1) {
        ctx.strokeStyle = ink;
        ctx.lineWidth = 0.055;
        ctx.beginPath();
        ctx.arc(side * 0.3, 0.01, 0.16, 0.15, Math.PI - 0.15);
        ctx.stroke();
        continue;
      }
      ctx.beginPath();
      ctx.ellipse(side * 0.3, 0.0, 0.145, 0.19 * eyeOpen, 0, 0, TAU);
      ctx.fillStyle = C.cream;
      ctx.fill();
      ctx.strokeStyle = ink;
      ctx.lineWidth = 0.04;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(side * 0.3, 0.02, 0.085, 0.13, 0, 0, TAU);
      ctx.fillStyle = C.red;
      ctx.fill();
      circle(side * 0.3 - 0.03, -0.03, 0.035, C.cream, null, 0);
    }
    // brows
    ctx.strokeStyle = ink;
    ctx.lineWidth = 0.05;
    ctx.beginPath();
    ctx.moveTo(-0.46, -0.27);
    ctx.lineTo(-0.18, -0.22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0.46, -0.27);
    ctx.lineTo(0.18, -0.22);
    ctx.stroke();

    // mouth
    if (pose === 'shock') {
      ctx.beginPath();
      ctx.ellipse(0, 0.34, 0.14, 0.2, 0, 0, TAU);
      ctx.fillStyle = C.wine;
      ctx.fill();
      ctx.strokeStyle = ink;
      ctx.lineWidth = 0.04;
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(-0.16, 0.32);
      ctx.quadraticCurveTo(0, 0.44, 0.18, 0.3);
      ctx.strokeStyle = ink;
      ctx.lineWidth = 0.045;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0.08, 0.34);
      ctx.lineTo(0.12, 0.44);
      ctx.lineTo(0.18, 0.34);
      ctx.closePath();
      ctx.fillStyle = C.cream;
      ctx.fill();
    }
    // blush
    ctx.globalAlpha *= 0.45;
    circle(-0.48, 0.24, 0.1, C.pink, null, 0);
    circle(0.48, 0.24, 0.1, C.pink, null, 0);
    ctx.globalAlpha /= 0.45;

    // top hat
    if (hat) {
      ctx.fillStyle = C.night;
      ctx.strokeStyle = ink;
      ctx.lineWidth = 0.05;
      fillRR(-0.44, -1.42, 0.88, 0.7, 0.06, C.night, ink, 0.05);
      fillRR(-0.68, -0.76, 1.36, 0.14, 0.06, C.night, ink, 0.05);
      ctx.fillStyle = C.red;
      ctx.fillRect(-0.44, -0.92, 0.88, 0.12);
    }

    ctx.restore();
  }

  function drawUi(x, y, s, opt = {}) {
    const ink = opt.ink || C.ink;
    const coat = opt.coat || C.gold;
    const coat2 = opt.coat2 || C.amber;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(opt.rot || 0);
    ctx.scale(s, s);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // boots
    ctx.strokeStyle = ink;
    ctx.lineWidth = 0.16;
    ctx.beginPath(); ctx.moveTo(-0.24, 1.42); ctx.lineTo(-0.3, 2.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0.24, 1.42); ctx.lineTo(0.3, 2.5); ctx.stroke();
    fillRR(-0.44, 2.4, 0.32, 0.26, 0.1, C.night, ink, 0.05);
    fillRR(0.14, 2.4, 0.32, 0.26, 0.1, C.night, ink, 0.05);

    // coat
    ctx.beginPath();
    ctx.moveTo(-0.58, 0.66);
    ctx.lineTo(-0.82, 2.16);
    ctx.lineTo(0.82, 2.16);
    ctx.lineTo(0.58, 0.66);
    ctx.closePath();
    ctx.fillStyle = coat;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 0.055;
    ctx.stroke();
    // coat front
    ctx.beginPath();
    ctx.moveTo(0, 0.72);
    ctx.lineTo(-0.2, 2.12);
    ctx.strokeStyle = coat2;
    ctx.lineWidth = 0.12;
    ctx.stroke();
    // buttons
    for (let i = 0; i < 3; i++) circle(-0.2, 1.0 + i * 0.34, 0.05, C.night, null, 0);

    // arms
    ctx.strokeStyle = ink;
    ctx.lineWidth = 0.18;
    ctx.beginPath(); ctx.moveTo(-0.58, 0.78); ctx.lineTo(-0.9, 1.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0.58, 0.78); ctx.lineTo(0.9, 1.5); ctx.stroke();
    ctx.strokeStyle = coat;
    ctx.lineWidth = 0.1;
    ctx.beginPath(); ctx.moveTo(-0.58, 0.78); ctx.lineTo(-0.9, 1.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0.58, 0.78); ctx.lineTo(0.9, 1.5); ctx.stroke();

    // hood
    ctx.beginPath();
    ctx.arc(0, 0, 0.82, Math.PI * 0.92, Math.PI * 2.08);
    ctx.lineTo(0.72, 0.54);
    ctx.lineTo(-0.72, 0.54);
    ctx.closePath();
    ctx.fillStyle = coat;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 0.055;
    ctx.stroke();
    // face shadow
    ctx.beginPath();
    ctx.ellipse(0, 0.04, 0.58, 0.56, 0, 0, TAU);
    ctx.fillStyle = C.skin;
    ctx.fill();
    // hood rim
    ctx.beginPath();
    ctx.arc(0, -0.02, 0.66, Math.PI * 1.05, Math.PI * 1.95);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 0.055;
    ctx.stroke();
    // blue fringe
    ctx.beginPath();
    ctx.moveTo(-0.5, -0.34);
    ctx.quadraticCurveTo(-0.28, -0.72, 0.02, -0.5);
    ctx.quadraticCurveTo(0.3, -0.72, 0.5, -0.3);
    ctx.quadraticCurveTo(0.28, -0.18, 0.2, 0.02);
    ctx.quadraticCurveTo(0.02, -0.18, -0.14, 0.02);
    ctx.quadraticCurveTo(-0.3, -0.2, -0.5, -0.34);
    ctx.closePath();
    ctx.fillStyle = '#5D7CFF';
    ctx.fill();
    // eyes
    circle(-0.21, 0.1, 0.055, C.ink, null, 0);
    circle(0.21, 0.1, 0.055, C.ink, null, 0);
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 0.035;
    ctx.beginPath();
    ctx.moveTo(-0.08, 0.27);
    ctx.lineTo(0.08, 0.27);
    ctx.stroke();
    // rain drops on hood
    ctx.strokeStyle = 'rgba(7,6,13,.3)';
    ctx.lineWidth = 0.03;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(-0.5 + i * 0.24, -0.46);
      ctx.lineTo(-0.54 + i * 0.24, -0.24);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- SCENES

  const SCENES = [
    { t: 0.00,  kind: 'overture',   look: 'night',  tag: 'INTRO' },

    { t: 6.82,  kind: 'qboard',     look: 'cream',  num: '01', icon: 'heel',  label: 'THE CUTEST PART' },
    { t: 11.36, kind: 'answer',     look: 'orange', icon: 'heel',  label: 'HEEL?' },
    { t: 12.65, kind: 'qboard',     look: 'red',    num: '02', icon: 'heart', label: 'WHAT POPS OUT?' },
    { t: 17.43, kind: 'answer',     look: 'cream',  icon: 'heart', label: 'HEART?' },
    { t: 18.65, kind: 'qboard',     look: 'green',  num: '03', icon: 'grow',  label: 'WHAT GETS HARD?' },
    { t: 23.77, kind: 'answer',     look: 'purple', icon: 'uh',    label: 'UH…' },
    { t: 24.68, kind: 'qboard',     look: 'purple', num: '04', icon: 'beat',  label: 'WHO MAKES IT RACE?' },
    { t: 30.46, kind: 'reveal',     look: 'orange', label: 'ME, RIGHT?' },
    { t: 32.32, kind: 'stamp',      look: 'red',    word: 'WRONG!', jp: '違うがー？' },

    { t: 33.49, kind: 'party',      look: 'orange', variant: 1 },
    { t: 35.18, kind: 'midnight',   look: 'moon',   label: 'TODAY IS' },
    { t: 36.53, kind: 'chant',      look: 'orange', word: 'PUMPKIN', icon: 'pumpkin', count: 4 },
    { t: 38.16, kind: 'teto31',     look: 'moon',   variant: 1 },
    { t: 39.49, kind: 'chant',      look: 'green',  word: 'ZOMBIE',  icon: 'hand', count: 4 },
    { t: 41.19, kind: 'midnight',   look: 'purple', label: 'TODAY IS' },
    { t: 42.48, kind: 'glitch',     look: 'night',  word: 'ENGLISH?', variant: 1 },
    { t: 44.95, kind: 'hit',        look: 'red',    word: 'わかんない!!', sub: 'I DON’T GET IT!', jp: true },

    { t: 45.48, kind: 'party',      look: 'red',    variant: 2 },
    { t: 47.19, kind: 'caution',    look: 'orange', word: 'RECKLESS', jp: '無責任' },
    { t: 48.53, kind: 'chant',      look: 'green',  word: 'PUMPKIN', icon: 'pumpkin', count: 4 },
    { t: 50.18, kind: 'steal',      look: 'purple', word: '奪ったげるわ', sub: 'I’LL STEAL YOU', variant: 1 },
    { t: 51.49, kind: 'chant',      look: 'purple', word: 'ZOMBIE',  icon: 'hand', count: 4 },
    { t: 53.20, kind: 'tender',     look: 'cream',  word: 'NO PAIN', jp: '痛くしないから' },
    { t: 54.55, kind: 'steal',      look: 'moon',   word: '初めて', sub: 'FOR THE FIRST TIME', variant: 2 },

    { t: 59.49, kind: 'letter',     look: 'night',  stage: 'GOOD KIDS', variant: 1 },
    { t: 61.25, kind: 'letter',     look: 'cream',  stage: 'YOUR █████', variant: 2 },
    { t: 63.69, kind: 'redacted',   look: 'red',    word: '█████' },
    { t: 65.74, kind: 'signature',  look: 'moon',   word: 'from TETO XXXI' },
    { t: 68.60, kind: 'ps',         look: 'night',  word: 'P.S.', variant: 1 },
    { t: 69.51, kind: 'ps',         look: 'cream',  word: 'BY THE WAY…', variant: 2 },
    { t: 71.21, kind: 'museum',     look: 'night',  variant: 1 },
    { t: 72.75, kind: 'museum',     look: 'red',    variant: 2, stamp: 'ABSOLUTELY NOT' },
    { t: 75.44, kind: 'innocent',   look: 'cream',  word: 'I’M NOT LYING!' },
    { t: 77.02, kind: 'letter',     look: 'purple', stage: 'ONE LAST THING', variant: 3 },
    { t: 79.28, kind: 'ui',         look: 'night',  word: 'UI-CHAN…' },
    { t: 83.10, kind: 'proposal',   look: 'moon',   variant: 1, word: 'MARRY ME?' },
    { t: 84.64, kind: 'proposal',   look: 'purple', variant: 2, word: 'MARRY ME!' },
    { t: 85.96, kind: 'reject',     look: 'red',    word: 'NO.' },
    { t: 86.73, kind: 'reject',     look: 'split',  word: '結婚?' },
    { t: 87.50, kind: 'reject',     look: 'green',  word: 'AS IF!' },
    { t: 89.02, kind: 'scream',     look: 'red',    word: 'НЕЕЕЕЕЕТ!' },

    { t: 92.00, kind: 'party',      look: 'purple', variant: 3 },
    { t: 93.66, kind: 'midnight',   look: 'moon',   label: 'TODAY IS' },
    { t: 95.01, kind: 'chant',      look: 'orange', word: 'PUMPKIN', icon: 'pumpkin', count: 4 },
    { t: 96.67, kind: 'teto31',     look: 'red',    variant: 2 },
    { t: 98.01, kind: 'chant',      look: 'green',  word: 'ZOMBIE',  icon: 'hand', count: 4 },
    { t: 99.68, kind: 'midnight',   look: 'purple', label: 'TODAY IS' },
    { t: 101.04, kind: 'hit',       look: 'pink',   word: 'CANDY', sub: 'CANDY CANDY', variant: 1 },
    { t: 101.78, kind: 'hit',       look: 'moon',   word: 'COOKIE', sub: 'COOKIE COOKIE', variant: 2 },
    { t: 102.38, kind: 'hit',       look: 'brown',  word: 'CHOCOLATE', sub: 'チョコレート！', variant: 3 },
    { t: 103.91, kind: 'party',     look: 'green',  variant: 4 },

    { t: 105.69, kind: 'innocent',  look: 'green',  word: 'NOT ME!', variant: 2 },
    { t: 107.10, kind: 'chant',     look: 'orange', word: 'PUMPKIN', icon: 'pumpkin', count: 4 },
    { t: 108.70, kind: 'caution',   look: 'red',    word: 'DON’T CONFUSE', jp: '勘違いしないで', variant: 2 },
    { t: 110.07, kind: 'chant',     look: 'purple', word: 'ZOMBIE',  icon: 'hand', count: 4 },
    { t: 111.70, kind: 'glitch',    look: 'red',    word: 'DON’T GET IT WRONG', variant: 2 },
    { t: 113.06, kind: 'spotlight', look: 'purple', word: 'YOU GUYS~?' },
    { t: 114.76, kind: 'steal',     look: 'orange', word: '全員', sub: 'I’LL STEAL YOU ALL', variant: 3 },

    { t: 116.00, kind: 'court',     look: 'red',    verdict: 'GUILTY' },
    { t: 119.80, kind: 'court',     look: 'green',  verdict: 'NOT GUILTY' },
    { t: 122.00, kind: 'court',     look: 'moon',   verdict: 'ACQUITTED', instrumental: true },

    { t: 124.82, kind: 'chase',     look: 'night',  variant: 1 },
    { t: 126.70, kind: 'chase',     look: 'orange', variant: 2 },
    { t: 128.24, kind: 'chase',     look: 'purple', variant: 3 },
    { t: 129.70, kind: 'chase',     look: 'red',    variant: 4 },
    { t: 131.10, kind: 'caught',    look: 'green',  word: 'CAUGHT!' },
    { t: 134.50, kind: 'end',       look: 'night' }
  ];

  function sceneIndexAt(t) {
    let lo = 0, hi = SCENES.length - 1, ans = 0;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (SCENES[mid].t <= t) { ans = mid; lo = mid + 1; }
      else hi = mid - 1;
    }
    return ans;
  }

  function lastBeatIndex(t) {
    const b = A.beats;
    let lo = 0, hi = b.length - 1, ans = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (b[mid] <= t) { ans = mid; lo = mid + 1; }
      else hi = mid - 1;
    }
    return ans;
  }

  const beatDur = 60 / A.bpm;

  function musicState(t) {
    const beats = A.beats;
    let idx = lastBeatIndex(t);
    if (idx < 0) idx = 0;
    const b0 = beats[idx];
    const b1 = idx + 1 < beats.length ? beats[idx + 1] : b0 + beatDur;
    const phase = clamp((t - b0) / Math.max(0.05, b1 - b0), 0, 1);
    const e = A.energy[clamp(idx, 0, A.energy.length - 1)] || 0;
    const low = A.low[clamp(idx, 0, A.low.length - 1)] || 0;
    const onset = A.onset[clamp(idx, 0, A.onset.length - 1)] || 0;
    let smoothE = 0, count = 0;
    for (let k = idx - 2; k <= idx + 2; k++) {
      if (k < 0 || k >= A.energy.length) continue;
      smoothE += A.energy[k];
      count++;
    }
    smoothE = count ? smoothE / count : e;
    const beatInBar = mod(idx, 4);
    const bar = Math.floor((idx - A.barOffset) / 4);
    const pulse = Math.pow(1 - phase, 2.7);
    const downbeat = beatInBar === 0;
    const barPulse = downbeat ? Math.pow(1 - phase, 2.2) : 0;
    const impact = clamp(pulse * (0.28 + low * 0.72) + (downbeat ? pulse * 0.22 : 0), 0, 1.25);
    return { t, idx, phase, energy: e, smoothEnergy: smoothE, low, onset, beatInBar, bar, pulse, downbeat, barPulse, impact, beatDur };
  }

  // ---------------------------------------------------------------- render

  const grainCanvas = document.createElement('canvas');
  grainCanvas.width = 256;
  grainCanvas.height = 256;
  const gg = grainCanvas.getContext('2d');
  const gdata = gg.createImageData(256, 256);
  for (let i = 0; i < gdata.data.length; i += 4) {
    const v = Math.random() < 0.5 ? 255 : 0;
    gdata.data[i] = v;
    gdata.data[i + 1] = v;
    gdata.data[i + 2] = v;
    gdata.data[i + 3] = 16;
  }
  gg.putImageData(gdata, 0, 0);
  const grainPattern = ctx.createPattern(grainCanvas, 'repeat');

  const scanCanvas = document.createElement('canvas');
  scanCanvas.width = 4;
  scanCanvas.height = 4;
  const sg = scanCanvas.getContext('2d');
  sg.fillStyle = 'rgba(255,255,255,.04)';
  sg.fillRect(0, 0, 4, 1);
  const scanPattern = ctx.createPattern(scanCanvas, 'repeat');

  const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.34, W / 2, H / 2, H * 0.98);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(0.72, 'rgba(0,0,0,.08)');
  vignette.addColorStop(1, 'rgba(0,0,0,.5)');

  let frameNo = 0;
  let currentCue = -1;
  let cutStart = -99;

  function fallbackScene(cue, m) {
    const look = LOOKS[cue.look] || LOOKS.night;
    ctx.fillStyle = look.bg;
    ctx.fillRect(-80, -80, W + 160, H + 160);
    drawText('TETO 31', W / 2, H / 2, 280, { color: look.a, stroke: look.ink, lw: 16, shadow: 12 });
  }

  function drawCutFx(cue, age, m) {
    if (age < 0 || age > 0.16) return;
    const k = clamp(age / 0.16, 0, 1);
    const fade = Math.pow(1 - k, 2);
    const look = LOOKS[cue.look] || LOOKS.night;
    ctx.save();
    ctx.globalAlpha = fade * 0.3;
    ctx.fillStyle = C.cream;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = fade * 0.55;
    ctx.strokeStyle = look.a;
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 180 + k * 1300, 0, TAU);
    ctx.stroke();
    const shardCols = [look.a, look.b, look.c];
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.translate(i < 3 ? 0 : W, i % 2 ? 0 : H);
      ctx.rotate((i % 2 ? 1 : -1) * (0.5 + i * 0.08));
      ctx.globalAlpha = fade * 0.65;
      ctx.fillStyle = shardCols[i % 3];
      ctx.fillRect((i % 3) * 76 - 40, -180, 46, 560);
      ctx.restore();
    }
    ctx.restore();
  }

  function drawGlobalOverlay(t, m, now) {
    ctx.save();
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = grainPattern;
    ctx.translate((frameNo * 37) % 256, (frameNo * 53) % 256);
    ctx.fillRect(-256, -256, W + 512, H + 512);
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = scanPattern;
    ctx.fillRect(-256, -256, W + 512, H + 512);
    ctx.restore();
  }

  function drawLyrics(t) {
    if (!LYR) return;
    const e = LYR.at(t);
    if (!e || e.hide) return;

    const next = LYR.next(e.end);
    const hasNext = next && next.t - e.end < 0.18;
    const inK = smooth(clamp((t - e.t) / 0.16, 0, 1));
    const outK = hasNext ? 1 : clamp((e.end - t) / 0.2, 0, 1);
    const a = inK * outK;
    if (a <= 0.001) return;

    const x = 286;
    const w = 1348;
    const h = 128;
    const y = 842 + (1 - inK) * 18;
    const prog = clamp((t - e.t) / Math.max(0.12, e.end - e.t), 0, 1);
    const accent = e.color || C.gold;

    ctx.save();
    ctx.globalAlpha = a;

    // evidence-card lower third
    ctx.fillStyle = 'rgba(0,0,0,.34)';
    pathRR(x + 8, y + 10, w, h, 14);
    ctx.fill();
    fillRR(x, y, w, h, 14, 'rgba(8,7,15,.92)', C.cream, 3);
    ctx.globalAlpha = a * 0.14;
    fillRR(x + 10, y + 10, w - 20, h - 20, 8, null, C.cream, 2);
    ctx.globalAlpha = a;

    // file tab
    fillRR(x + 20, y + 24, 8, h - 48, 4, accent, null, 0);
    drawText('歌詞', x + 50, y + 30, 12, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, jp: true, tracking: 3, alpha: 0.55
    });
    drawText('EVIDENCE', x + 88, y + 30, 9, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, tracking: 3, alpha: 0.35
    });

    const jpText = e.jp;
    const jpSize = fitSize(jpText, 42, w - 150, true, 0);
    const jpY = y + 70;
    drawText(jpText, W / 2, jpY, jpSize, {
      color: 'rgba(255,244,220,.42)', stroke: null, lw: 0, shadow: 0, jp: true
    });
    const tw = measure(jpText, jpSize, true, 0);
    const left = W / 2 - tw / 2;
    ctx.save();
    ctx.beginPath();
    ctx.rect(left - 8, jpY - 44, (tw + 16) * prog, 88);
    ctx.clip();
    drawText(jpText, W / 2, jpY, jpSize, {
      color: accent, stroke: null, lw: 0, shadow: 0, jp: true
    });
    ctx.restore();

    if (e.ru) {
      const ruSize = fitSize(e.ru, 19, w - 150, false, 0);
      drawText(e.ru, W / 2, y + 106, ruSize, {
        color: C.cream, stroke: null, lw: 0, shadow: 0, alpha: 0.82
      });
    }

    ctx.globalAlpha = a * 0.28;
    ctx.fillStyle = C.cream;
    ctx.fillRect(x + 20, y + h - 11, w - 40, 2);
    ctx.globalAlpha = a;
    ctx.fillStyle = accent;
    ctx.fillRect(x + 20, y + h - 12, (w - 40) * prog, 3);
    ctx.restore();
  }

  function renderFrame(t, now, isPreview = false) {
    t = clamp(t, 0, duration);
    const si = sceneIndexAt(t);
    const cue = SCENES[si];
    const next = SCENES[si + 1] || { t: duration };
    const m = musicState(t);
    const lt = t - cue.t;

    if (isPreview) {
      currentCue = si;
      cutStart = -99;
    } else if (si !== currentCue) {
      currentCue = si;
      cutStart = t;
    }

    ctx.save();
    const impact = m.impact;
    const heavy = /scream|caught|court|chase/.test(cue.kind);
    const shakeAmp = impact * (heavy ? 10 : 4.2);
    const seed = Math.floor(t * 30);
    const z = 1 + impact * 0.012;
    ctx.translate(W / 2 + (hash(seed + 1.3) - 0.5) * shakeAmp, H / 2 + (hash(seed + 7.1) - 0.5) * shakeAmp);
    ctx.rotate((hash(seed + 4.7) - 0.5) * 0.004 * impact);
    ctx.scale(z, z);
    ctx.translate(-W / 2, -H / 2);

    const fn = window.SCENES && window.SCENES[cue.kind];
    if (fn) fn(cue, next, m, lt, t);
    else fallbackScene(cue, m);
    ctx.restore();

    if (!isPreview) drawCutFx(cue, t - cutStart, m);
    drawGlobalOverlay(t, m, now);
    drawLyrics(t);
  }

  // ---------------------------------------------------------------- audio

  let audioCtx = null;
  let buffer = null;
  let gainNode = null;
  let srcNode = null;
  let startedAt = 0;
  let offset = 0;
  let duration = A.duration;
  let started = false;
  let playing = false;
  let ended = false;
  let muted = false;
  let volume = 0.9;
  try {
    const savedVolume = parseFloat(localStorage.getItem('halloCelVolume'));
    if (Number.isFinite(savedVolume)) volume = clamp(savedVolume / 100, 0, 1);
  } catch (e) { /* storage may be unavailable on file:// */ }
  muted = volume === 0;
  let sourceToken = 0;
  let previewMode = false;
  let previewT = 0;
  let loading = false;

  function setPlayIcon(isPlaying) {
    ppIcon.innerHTML = isPlaying
      ? '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>'
      : '<path d="M8 5v14l11-7z"/>';
    playPauseBtn.setAttribute('aria-label', isPlaying ? 'Пауза' : 'Играть');
  }

  function updateVolumeUI() {
    const pct = Math.round(volume * 100);
    volumeEl.value = String(pct);
    volumeEl.style.setProperty('--fill', pct + '%');
    volumeEl.setAttribute('aria-valuetext', pct + '%');
    volumeValEl.textContent = muted ? 'MUTED' : pct + '%';
    document.body.classList.toggle('muted', muted || volume === 0);
  }

  function setMuteIcon() {
    muteIcon.innerHTML = muted
      ? '<path d="M3 9v6h4l5 4V5L7 9H3zm13.8 3 3.2 3.2-1.4 1.4L15.4 13.4 12.2 16.6 10.8 15.2 14 12l-3.2-3.2 1.4-1.4L15.4 10.6l3.2-3.2 1.4 1.4L16.8 12z"/>'
      : '<path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/>';
    muteBtn.setAttribute('aria-label', muted ? 'Включить звук' : 'Выключить звук');
    muteBtn.title = muted ? 'Включить звук (M)' : 'Выключить звук (M)';
    updateVolumeUI();
  }

  function currentTime() {
    if (!started || !buffer) return offset;
    if (!playing) return offset;
    return clamp(audioCtx.currentTime - startedAt, 0, duration);
  }

  function stopSource() {
    sourceToken++;
    if (srcNode) {
      try { srcNode.stop(); } catch (e) { /* already stopped */ }
      try { srcNode.disconnect(); } catch (e) { /* noop */ }
      srcNode = null;
    }
  }

  async function ensureAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC({ latencyHint: 'interactive' });
      gainNode = audioCtx.createGain();
      gainNode.gain.value = muted ? 0 : volume;
      gainNode.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') await audioCtx.resume();
    if (buffer) return;

    const b64 = window.TETO31_TRACK_B64;
    if (!b64) throw new Error('audio data is missing');
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    buffer = await audioCtx.decodeAudioData(bytes.buffer);
    duration = buffer.duration;
    durEl.textContent = formatTime(duration);
  }

  function finish() {
    playing = false;
    ended = true;
    offset = duration;
    stopSource();
    document.body.classList.remove('playing');
    document.body.classList.remove('idle');
    setPlayIcon(false);
    replayEl.classList.add('show');
    updateProgress(1);
  }

  function playFrom(t) {
    if (!buffer) return;
    stopSource();
    ended = false;
    replayEl.classList.remove('show');
    const at = clamp(t, 0, Math.max(0, duration - 0.02));
    const when = audioCtx.currentTime + 0.03;
    const token = ++sourceToken;
    srcNode = audioCtx.createBufferSource();
    srcNode.buffer = buffer;
    srcNode.connect(gainNode);
    srcNode.onended = () => {
      if (token !== sourceToken) return;
      if (playing) finish();
    };
    srcNode.start(when, at);
    startedAt = when - at;
    offset = at;
    playing = true;
    document.body.classList.add('playing');
    document.body.classList.remove('idle');
    setPlayIcon(true);
    bumpIdle();
  }

  function pause() {
    if (!playing) return;
    offset = currentTime();
    playing = false;
    stopSource();
    document.body.classList.remove('playing');
    document.body.classList.remove('idle');
    setPlayIcon(false);
    updateProgress(offset / duration);
  }

  function resume() {
    if (!started) return;
    if (ended || offset >= duration - 0.03) playFrom(0);
    else playFrom(offset);
  }

  function togglePlay() {
    if (playing) pause();
    else resume();
  }

  function seekTo(t, keepPlay = playing) {
    offset = clamp(t, 0, duration);
    ended = false;
    replayEl.classList.remove('show');
    if (!started || !buffer) {
      previewT = offset;
      renderFrame(offset, performance.now(), true);
      return;
    }
    if (keepPlay && offset < duration - 0.03) {
      playFrom(offset);
    } else {
      stopSource();
      playing = false;
      document.body.classList.remove('playing');
      setPlayIcon(false);
      updateProgress(offset / duration);
      if (offset >= duration - 0.03) finish();
    }
  }

  // ---------------------------------------------------------------- hud

  let lastSec = -1;
  let idleTimer = 0;

  function bumpIdle() {
    document.body.classList.remove('idle');
    clearTimeout(idleTimer);
    if (playing) {
      idleTimer = setTimeout(() => {
        if (playing) document.body.classList.add('idle');
      }, 2800);
    }
  }

  function updateProgress(p) {
    const pct = clamp(p, 0, 1) * 100;
    fillEl.style.width = pct + '%';
    headEl.style.left = pct + '%';
    trackEl.setAttribute('aria-valuenow', String(Math.round(p * duration)));
    const sec = Math.floor(p * duration);
    if (sec !== lastSec) {
      lastSec = sec;
      curEl.textContent = formatTime(sec);
    }
  }

  function buildWave() {
    const peaks = A.peaks || [];
    const bw = 880 / peaks.length;
    const rects = peaks.map((p, i) => {
      const h = Math.max(1.2, p * 19);
      return '<rect x="' + (i * bw).toFixed(2) + '" y="' + (22 - h).toFixed(2) + '" width="' + Math.max(1, bw - 1.1).toFixed(2) + '" height="' + h.toFixed(2) + '" rx="1" fill="rgba(255,244,220,0.62)"/>';
    }).join('');
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 22" preserveAspectRatio="none">' + rects + '</svg>';
    waveEl.style.backgroundImage = 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }

  function buildMarkers() {
    markersEl.innerHTML = '';
    A.acts.forEach(a => {
      if (a.t <= 0 || a.t >= duration) return;
      const i = document.createElement('i');
      i.style.left = (a.t / duration * 100) + '%';
      markersEl.appendChild(i);
    });
  }

  // ---------------------------------------------------------------- start

  async function startExperience() {
    if (loading || playing) return;
    loading = true;
    playBtn.classList.add('loading');
    playLabel.textContent = 'OPENING THE VAULT…';
    const loadTimer = setTimeout(() => loadMsg.classList.add('show'), 260);
    let failed = false;
    try {
      await ensureAudio();
      previewMode = false;
      started = true;
      startEl.classList.add('hidden');
      playFrom(0);
      bumpIdle();
    } catch (err) {
      failed = true;
      console.error(err);
      loadMsg.textContent = 'AUDIO ERROR — TRY A LOCAL SERVER';
      loadMsg.classList.add('show');
      playLabel.textContent = 'TRY AGAIN';
    } finally {
      clearTimeout(loadTimer);
      loading = false;
      playBtn.classList.remove('loading');
      if (started) {
        playLabel.textContent = 'PLAY CLIP';
        loadMsg.classList.remove('show');
      } else if (!failed) {
        playLabel.textContent = 'PLAY CLIP';
        loadMsg.classList.remove('show');
      }
    }
  }

  function saveVolume() {
    try {
      localStorage.setItem('halloCelVolume', String(Math.round(volume * 100)));
    } catch (e) { /* storage may be unavailable on file:// */ }
  }

  function onVolumeInput() {
    const next = parseFloat(volumeEl.value);
    volume = clamp(Number.isFinite(next) ? next / 100 : 0, 0, 1);
    if (volume > 0 && muted) muted = false;
    if (volume === 0) muted = true;
    setVolume();
  }

  function setVolume() {
    if (gainNode && audioCtx) {
      gainNode.gain.setTargetAtTime(muted ? 0 : volume, audioCtx.currentTime, 0.015);
    }
    setMuteIcon();
  }

  function toggleMute() {
    if (!muted && volume > 0) {
      muted = true;
    } else {
      muted = false;
      if (volume === 0) volume = 0.9;
    }
    setVolume();
    saveVolume();
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      const el = document.getElementById('frame');
      if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }

  let scrubbing = false;
  let scrubWasPlaying = false;

  function scrubFromEvent(e) {
    const rect = trackEl.getBoundingClientRect();
    const p = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    offset = p * duration;
    ended = false;
    replayEl.classList.remove('show');
    updateProgress(p);
    if (started) renderFrame(offset, performance.now(), true);
  }

  function initInteractions() {
    playBtn.addEventListener('click', startExperience);
    replayEl.addEventListener('click', () => {
      if (!started) startExperience();
      else playFrom(0);
    });
    playPauseBtn.addEventListener('click', togglePlay);
    restartBtn.addEventListener('click', () => {
      if (!started) startExperience();
      else playFrom(0);
    });
    muteBtn.addEventListener('click', toggleMute);
    volumeEl.addEventListener('input', onVolumeInput);
    volumeEl.addEventListener('change', saveVolume);
    fsBtn.addEventListener('click', toggleFullscreen);

    cv.addEventListener('click', () => {
      if (!started || previewMode) return;
      togglePlay();
      centerIcon.classList.add('show');
      setTimeout(() => centerIcon.classList.remove('show'), 420);
    });

    document.addEventListener('mousemove', () => { if (started) bumpIdle(); });
    document.addEventListener('touchstart', () => { if (started) bumpIdle(); }, { passive: true });

    trackEl.addEventListener('pointerdown', e => {
      if (!started) return;
      scrubbing = true;
      scrubWasPlaying = playing;
      if (playing) {
        offset = currentTime();
        playing = false;
        stopSource();
        setPlayIcon(false);
        document.body.classList.remove('playing');
      }
      trackEl.setPointerCapture(e.pointerId);
      scrubFromEvent(e);
      bumpIdle();
    });
    trackEl.addEventListener('pointermove', e => { if (scrubbing) scrubFromEvent(e); });
    const endScrub = e => {
      if (!scrubbing) return;
      scrubbing = false;
      try { trackEl.releasePointerCapture(e.pointerId); } catch (err) { /* noop */ }
      if (scrubWasPlaying) playFrom(offset);
      else if (started) renderFrame(offset, performance.now(), true);
    };
    trackEl.addEventListener('pointerup', endScrub);
    trackEl.addEventListener('pointercancel', endScrub);

    window.addEventListener('keydown', e => {
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (!started) startExperience(); else togglePlay();
      } else if (e.key === 'r' || e.key === 'R') {
        if (!started) startExperience(); else playFrom(0);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        seekTo(Math.max(0, currentTime() - 5), playing);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        seekTo(Math.min(duration, currentTime() + 5), playing);
      }
    });
  }

  // ---------------------------------------------------------------- boot

  function preview(t, opts = {}) {
    started = true;
    previewMode = true;
    playing = false;
    stopSource();
    offset = clamp(Number(t) || 0, 0, duration);
    previewT = offset;
    startEl.classList.add('hidden');
    document.body.classList.add('playing');
    if (opts.hud === false) document.body.classList.add('idle');
    updateProgress(offset / duration);
    renderFrame(offset, performance.now(), true);
  }

  window.MD = {
    ctx, W, H, TAU, C, LOOKS, SCENES, LYRICS: LYR,
    clamp, lerp, mod, smooth, easeOutCubic, easeOutBack, easeOutExpo,
    hash, rng, formatTime,
    pathRR, fillRR, circle, starPath, drawStar, heartPath, drawHeart,
    drawSparkle, drawBarcode, setFont, measure, fitSize, drawText,
    dotPattern, halftone, checker, radialBurst, speedLines, confetti,
    drawMoon, drawBat, drawPumpkin, drawZombieHand, drawCandy, drawCookie,
    drawChocolate, drawWaxSeal, drawCallingCard, drawFrame, drawSpotlight,
    drawJailBars, drawSticker, drawEvidenceTag, drawTeto, drawUi
  };

  window.TETO31 = {
    preview,
    cues: SCENES,
    lyrics: LYR,
    duration: () => duration,
    time: () => currentTime(),
    seek: t => seekTo(t, playing),
    pause,
    play: resume,
    toggle: togglePlay
  };

  function boot() {
    buildWave();
    buildMarkers();
    durEl.textContent = formatTime(duration);
    initInteractions();
    setPlayIcon(false);
    setMuteIcon();
    renderFrame(1.2, performance.now(), true);

    const params = new URLSearchParams(location.search);
    if (params.has('t')) {
      const t = parseFloat(params.get('t'));
      if (Number.isFinite(t)) preview(t, { hud: params.get('hud') !== '0' });
    }

    function loop(now) {
      frameNo++;
      if (previewMode) {
        renderFrame(previewT, now, true);
      } else if (started) {
        const t = currentTime();
        renderFrame(t, now, false);
        updateProgress(t / duration);
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot);
})();
