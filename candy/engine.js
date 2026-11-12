/* CANDY COOKIE CHOCOLATE — canvas motion clip engine */
(() => {
  'use strict';

  const A = window.CANDY_ANALYSIS;
  if (!A) { console.error('analysis.js is missing'); return; }
  const LYR = window.CANDY_LYRICS || null;

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

  // ---------------------------------------------------------------- constants

  const C = {
    ink: '#0B0A0F',
    cream: '#FFF2D7',
    paper: '#FFF9EC',
    white: '#FFFFFF',
    pink: '#FF3D8B',
    magenta: '#FF2D9C',
    red: '#FF2E4D',
    cherry: '#D91F3C',
    cyan: '#35E3E8',
    miku: '#35E3E8',
    mint: '#A8F0CB',
    blue: '#2F5BFF',
    yellow: '#FFD52E',
    gold: '#EFB52C',
    green: '#36D96B',
    lime: '#BDF34A',
    lav: '#C9A6FF',
    purple: '#7B4DFF',
    orange: '#FF8A2E',
    cookie: '#D79A5B',
    cookieDark: '#A96932',
    choco: '#3A1C12',
    choco2: '#572B1C',
    cocoa: '#24100B',
    skin: '#FFE8D6'
  };

  const LOOKS = {
    night: { bg: C.ink, ink: C.cream, a: C.pink, b: C.cyan, c: C.yellow, pop: [C.pink, C.cyan, C.yellow] },
    pink: { bg: C.pink, ink: C.ink, a: C.cream, b: C.yellow, c: C.cyan, pop: [C.cream, C.yellow, C.cyan] },
    cyan: { bg: C.cyan, ink: C.ink, a: C.cream, b: C.pink, c: C.yellow, pop: [C.cream, C.pink, C.yellow] },
    yellow: { bg: C.yellow, ink: C.ink, a: C.cream, b: C.pink, c: C.cyan, pop: [C.cream, C.pink, C.cyan] },
    cream: { bg: C.cream, ink: C.ink, a: C.pink, b: C.cyan, c: C.yellow, pop: [C.pink, C.cyan, C.yellow] },
    mint: { bg: C.mint, ink: C.ink, a: C.pink, b: C.cream, c: C.blue, pop: [C.pink, C.cream, C.blue] },
    choco: { bg: C.choco, ink: C.cream, a: C.pink, b: C.yellow, c: C.cookie, pop: [C.pink, C.yellow, C.cookie] },
    lav: { bg: C.lav, ink: C.ink, a: C.cream, b: C.pink, c: C.cyan, pop: [C.cream, C.pink, C.cyan] },
    red: { bg: C.red, ink: C.cream, a: C.yellow, b: C.cyan, c: C.cream, pop: [C.yellow, C.cyan, C.cream] },
    split: { bg: C.cyan, ink: C.cream, a: C.pink, b: C.yellow, c: C.cream, pop: [C.pink, C.yellow, C.cream] },
    sunset: { bg: '#FF9A5A', ink: C.choco, a: C.cream, b: C.pink, c: C.yellow, pop: [C.cream, C.pink, C.yellow] },
    glitch: { bg: C.ink, ink: C.cream, a: C.cyan, b: C.pink, c: C.red, pop: [C.cyan, C.pink, C.red] }
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

  // ---------------------------------------------------------------- canvas helpers

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
    ctx.quadraticCurveTo(s * 0.12, -s * 0.12, s, 0);
    ctx.quadraticCurveTo(s * 0.12, s * 0.12, 0, s);
    ctx.quadraticCurveTo(-s * 0.12, s * 0.12, -s, 0);
    ctx.quadraticCurveTo(-s * 0.12, -s * 0.12, 0, -s);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.restore();
  }

  function drawSprinkle(x, y, len, thick, rot, fill, stroke = C.ink, lw = 3) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    pathRR(-len / 2, -thick / 2, len, thick, thick / 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke && lw) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
    ctx.restore();
  }

  function drawBarcode(x, y, w, h, color) {
    const r = rng(Math.round(x * 13 + y * 7 + w));
    ctx.fillStyle = C.white;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color || C.ink;
    let cx = x + 6;
    while (cx < x + w - 6) {
      const bw = 1 + Math.floor(r() * 5);
      const gap = 1 + Math.floor(r() * 4);
      ctx.fillRect(cx, y + 4, bw, h - 10);
      cx += bw + gap;
    }
  }

  // ---------------------------------------------------------------- typography

  const FONT_EN = '"Arial Black","Impact","Franklin Gothic Heavy",sans-serif';
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
    return Math.max(10, size * maxWidth / w);
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
      let start = align === 'center' ? -ctx.measureText(text).width / 2 : align === 'right' ? -ctx.measureText(text).width : 0;
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
      let total = widths.reduce((a, b) => a + b, 0) + tracking * Math.max(0, chars.length - 1);
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
    c.width = 40;
    c.height = 40;
    const g = c.getContext('2d');
    g.fillStyle = color;
    g.beginPath();
    g.arc(20, 20, 5.2, 0, TAU);
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

  function radialBurst(cx, cy, r, colors, rot = 0, alpha = 1, segments = 24) {
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
    for (let i = 0; i < count; i++) {
      const a = hash(i * 4.17) * TAU + t * (0.16 + hash(i) * 0.2);
      const r0 = 260 + hash(i + 9) * 600;
      const len = 90 + hash(i + 3) * 360;
      ctx.lineWidth = 3 + hash(i + 7) * 12;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      ctx.lineTo(cx + Math.cos(a) * (r0 + len), cy + Math.sin(a) * (r0 + len));
      ctx.stroke();
    }
    ctx.restore();
  }

  function checkerTunnel(cx, cy, t, cols, line, alpha = 1) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    const seg = 20;
    const rot = t * 0.08;
    for (let i = 0; i < seg; i++) {
      const a0 = rot + i / seg * TAU;
      const a1 = rot + (i + 1) / seg * TAU;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, 1900, a0, a1);
      ctx.closePath();
      ctx.fillStyle = cols[i % cols.length];
      ctx.fill();
    }
    for (let k = 0; k < 13; k++) {
      const z = mod(k / 13 + t * 0.34, 1);
      const r = 50 + Math.pow(z, 2.65) * 1800;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.strokeStyle = line;
      ctx.lineWidth = 2 + z * 13;
      ctx.globalAlpha = alpha * (0.18 + z * 0.7);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- candy art

  function lollipop(x, y, r, angle, spin, accent, opts = {}) {
    const stick = opts.stick || C.cream;
    const ink = opts.ink || C.ink;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // stick
    ctx.save();
    ctx.rotate(0.08);
    pathRR(-r * 0.09, r * 0.55, r * 0.18, r * 1.55, r * 0.09);
    ctx.fillStyle = stick;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = r * 0.045;
    ctx.stroke();
    ctx.restore();

    // candy disc
    circle(0, 0, r, C.cream, ink, r * 0.055);

    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.9, 0, TAU);
    ctx.clip();
    ctx.beginPath();
    const turns = 3.25;
    const steps = 150;
    for (let i = 0; i <= steps; i++) {
      const p = i / steps;
      const a = spin + p * turns * TAU;
      const rad = r * (0.05 + p * 0.83);
      const px = Math.cos(a) * rad;
      const py = Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = accent;
    ctx.lineWidth = r * 0.15;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();

    // shine
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.78, -2.55, -1.55);
    ctx.strokeStyle = 'rgba(255,255,255,.55)';
    ctx.lineWidth = r * 0.06;
    ctx.lineCap = 'round';
    ctx.stroke();

    circle(0, 0, r * 0.08, ink);
    ctx.restore();
  }

  function wrappedCandy(x, y, s, rot, color, ink = C.ink, cream = C.cream) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    // wrapper wings
    ctx.beginPath();
    ctx.moveTo(-s * 0.5, 0);
    ctx.lineTo(-s * 1.05, -s * 0.5);
    ctx.lineTo(-s * 0.93, 0);
    ctx.lineTo(-s * 1.05, s * 0.5);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = s * 0.07;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s * 0.5, 0);
    ctx.lineTo(s * 1.05, -s * 0.5);
    ctx.lineTo(s * 0.93, 0);
    ctx.lineTo(s * 1.05, s * 0.5);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = s * 0.07;
    ctx.stroke();
    // body
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.62, s * 0.5, 0, 0, TAU);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = s * 0.08;
    ctx.stroke();
    // stripes
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.58, s * 0.46, 0, 0, TAU);
    ctx.clip();
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * s * 0.3 - s * 0.12, -s * 0.55);
      ctx.lineTo(i * s * 0.3 + s * 0.12, s * 0.55);
      ctx.strokeStyle = cream;
      ctx.lineWidth = s * 0.11;
      ctx.stroke();
    }
    ctx.restore();
    // shine
    ctx.beginPath();
    ctx.ellipse(-s * 0.2, -s * 0.18, s * 0.2, s * 0.1, -0.5, 0, TAU);
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.fill();
    ctx.restore();
  }

  function drawCookie(x, y, r, rot, pulse = 0, opts = {}) {
    const ink = opts.ink || C.ink;
    const body = opts.body || C.cookie;
    const dark = opts.dark || C.cookieDark;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    const sy = 1 + pulse * 0.035;
    const sx = 1 - pulse * 0.02;
    ctx.scale(sx, sy);

    // shadow
    ctx.save();
    ctx.translate(r * 0.09, r * 0.12);
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.02, r * 1.02, 0, 0, TAU);
    ctx.fillStyle = 'rgba(11,10,15,.22)';
    ctx.fill();
    ctx.restore();

    // wobbly body
    ctx.beginPath();
    const n = 72;
    for (let i = 0; i <= n; i++) {
      const a = i / n * TAU;
      const rr = r * (1 + Math.sin(a * 5 + 1.2) * 0.012 + Math.sin(a * 9) * 0.008);
      const px = Math.cos(a) * rr;
      const py = Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = body;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = r * 0.045;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // baked rim
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.9, 0, TAU);
    ctx.strokeStyle = dark;
    ctx.lineWidth = r * 0.055;
    ctx.globalAlpha = 0.35;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // chocolate chips
    const rr = rng(42);
    for (let i = 0; i < 11; i++) {
      const a = rr() * TAU;
      const d = Math.sqrt(rr()) * r * 0.72;
      const cx = Math.cos(a) * d;
      const cy = Math.sin(a) * d;
      const s = r * (0.055 + rr() * 0.045);
      ctx.beginPath();
      const sides = 5;
      for (let k = 0; k < sides; k++) {
        const aa = k / sides * TAU + rr() * 0.3;
        const px = cx + Math.cos(aa) * s * (0.7 + rr() * 0.5);
        const py = cy + Math.sin(aa) * s * (0.7 + rr() * 0.5);
        if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = C.cocoa;
      ctx.fill();
      ctx.strokeStyle = ink;
      ctx.lineWidth = r * 0.012;
      ctx.stroke();
    }

    // face
    const eyeY = -r * 0.08;
    ctx.beginPath();
    ctx.ellipse(-r * 0.24, eyeY, r * 0.052, r * 0.085, 0, 0, TAU);
    ctx.fillStyle = ink;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(r * 0.18, eyeY, r * 0.052, r * 0.085, 0, 0, TAU);
    ctx.fillStyle = ink;
    ctx.fill();
    circle(-r * 0.255, eyeY - r * 0.025, r * 0.017, C.cream);
    circle(r * 0.165, eyeY - r * 0.025, r * 0.017, C.cream);

    ctx.beginPath();
    ctx.arc(0, r * 0.12, r * 0.16, 0.12 * Math.PI, 0.88 * Math.PI);
    ctx.strokeStyle = ink;
    ctx.lineWidth = r * 0.032;
    ctx.lineCap = 'round';
    ctx.stroke();

    // blush
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.ellipse(-r * 0.44, r * 0.13, r * 0.09, r * 0.045, -0.1, 0, TAU);
    ctx.fillStyle = C.pink;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(r * 0.38, r * 0.13, r * 0.09, r * 0.045, 0.1, 0, TAU);
    ctx.fillStyle = C.pink;
    ctx.fill();
    ctx.globalAlpha = 1;

    // little crumb dots
    const cr = rng(7);
    for (let i = 0; i < 18; i++) {
      const a = cr() * TAU;
      const d = cr() * r * 0.86;
      circle(Math.cos(a) * d, Math.sin(a) * d, r * 0.008, 'rgba(58,28,18,.35)');
    }
    ctx.restore();
  }

  function drawChocoBar(x, y, w, h, rot, pulse = 0, opts = {}) {
    const ink = opts.ink || C.ink;
    const cols = 4;
    const rows = 2;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    // foil wrapper behind
    ctx.save();
    ctx.translate(-w * 0.42, 0);
    ctx.rotate(-0.06);
    const fw = w * 0.28;
    const fh = h * 1.06;
    pathRR(-fw / 2, -fh / 2, fw, fh, 18);
    ctx.fillStyle = opts.foil || C.yellow;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(fw / 2, -fh / 2);
    for (let i = 0; i <= 6; i++) {
      ctx.lineTo(fw / 2 + (i % 2 ? 26 : 4), -fh / 2 + i * fh / 6);
    }
    ctx.strokeStyle = ink;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();

    // shadow
    ctx.save();
    ctx.translate(w * 0.035, h * 0.055);
    pathRR(-w / 2, -h / 2, w, h, 26);
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.fill();
    ctx.restore();

    // base
    pathRR(-w / 2, -h / 2, w, h, 26);
    ctx.fillStyle = opts.body || C.choco2;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 9;
    ctx.stroke();

    // segments
    const gap = 8;
    const cw = (w - gap * (cols + 1)) / cols;
    const ch = (h - gap * (rows + 1)) / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const bx = -w / 2 + gap + c * (cw + gap);
        const by = -h / 2 + gap + r * (ch + gap);
        const lift = idx === 2 ? pulse * 18 : 0;
        ctx.save();
        ctx.translate(0, -lift);
        if (idx === 2) ctx.rotate(pulse * 0.035);
        pathRR(bx, by, cw, ch, 10);
        ctx.fillStyle = opts.seg || C.choco;
        ctx.fill();
        ctx.strokeStyle = ink;
        ctx.lineWidth = 5;
        ctx.stroke();
        // bevel
        ctx.beginPath();
        ctx.moveTo(bx + 12, by + 10);
        ctx.lineTo(bx + cw - 12, by + 10);
        ctx.strokeStyle = 'rgba(255,242,215,.2)';
        ctx.lineWidth = 5;
        ctx.stroke();
        // embossed star
        ctx.globalAlpha = 0.25;
        drawStar(bx + cw / 2, by + ch / 2, Math.min(cw, ch) * 0.16, C.cream, null, 0, -Math.PI / 2, 5, 0.45);
        ctx.globalAlpha = 1;
        ctx.restore();
      }
    }

    // shine
    ctx.save();
    pathRR(-w / 2, -h / 2, w, h, 26);
    ctx.clip();
    ctx.globalAlpha = 0.16;
    ctx.rotate(-0.4);
    ctx.fillStyle = C.cream;
    ctx.fillRect(-w * 0.2, -h * 1.3, w * 0.18, h * 2.6);
    ctx.restore();

    ctx.restore();
  }

  function drawSticker(text, x, y, r, fill, rot = 0, opts = {}) {
    const ink = opts.ink || C.ink;
    const color = opts.color || ink;
    const lines = String(text).split('\n');
    const fs = opts.size || r * 0.34;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    const scale = opts.scale || 1;
    ctx.scale(scale, scale);
    ctx.beginPath();
    const n = 28;
    for (let i = 0; i <= n; i++) {
      const a = i / n * TAU;
      const rr = i % 2 ? r * 0.955 : r;
      const px = Math.cos(a) * rr;
      const py = Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = Math.max(3, r * 0.045);
    ctx.lineJoin = 'round';
    ctx.stroke();
    if (opts.ring !== false) {
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.82, 0, TAU);
      ctx.setLineDash([r * 0.06, r * 0.08]);
      ctx.lineWidth = Math.max(1.5, r * 0.018);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.55;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }
    const lh = fs * 0.94;
    lines.forEach((line, i) => {
      drawText(line, 0, (i - (lines.length - 1) / 2) * lh, fs, {
        color,
        stroke: opts.textStroke === false ? null : fill,
        lw: fs * 0.12,
        shadow: 0,
        jp: /[ぁ-んァ-ヶ一-龠]/.test(line)
      });
    });
    ctx.restore();
  }

  function circularText(str, cx, cy, r, size, color, stroke, lw, start = 0, repeat = 1) {
    const chars = Array.from(str);
    const total = chars.length * repeat;
    for (let i = 0; i < total; i++) {
      const ch = chars[i % chars.length];
      const a = start + i / total * TAU;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a + Math.PI / 2);
      drawText(ch, 0, 0, size, {
        color,
        stroke,
        lw,
        shadow: 0,
        jp: /[ぁ-んァ-ヶ一-龠]/.test(ch)
      });
      ctx.restore();
    }
  }

  // ---------------------------------------------------------------- timeline

  const SCENES = [
    { t: 0.00, kind: 'overture', look: 'night', tag: 'INTRO' },

    // intro hook — one cut per sung word, not per bar
    { t: 1.72, kind: 'title', look: 'pink', word: 'CANDY', jp: 'キャンディー', num: '01' },
    { t: 3.84, kind: 'title', look: 'cyan', word: 'COOKIE', jp: 'クッキー', num: '02' },
    { t: 4.57, kind: 'title', look: 'yellow', word: 'CANDY', jp: 'キャンディー', num: '03' },
    { t: 6.02, kind: 'title', look: 'red', word: 'CHOCOLATE', jp: 'チョコレート', num: '04' },
    { t: 7.34, kind: 'title', look: 'cyan', word: 'CANDY', jp: 'キャンディー', num: '05' },
    { t: 9.34, kind: 'title', look: 'pink', word: 'COOKIE', jp: 'クッキー', num: '06' },
    { t: 10.18, kind: 'title', look: 'yellow', word: 'CANDY', jp: 'キャンディー', num: '07' },
    { t: 11.59, kind: 'title', look: 'red', word: 'CHOCOLATE', jp: 'チョコレート', num: '08' },
    { t: 13.20, kind: 'marquee', look: 'night', variant: 0 },
    { t: 16.78, kind: 'choco', look: 'choco', variant: 0 },
    { t: 19.40, kind: 'grid', look: 'night', variant: 0 },
    { t: 20.55, kind: 'build', look: 'pink', variant: 0 },

    // verse 1 — top / bottom / middle / dango
    { t: 23.46, kind: 'layer', look: 'cream', variant: 0 },

    // verse 2 — packaging / shelf / inside
    { t: 34.58, kind: 'pack', look: 'yellow', variant: 0 },
    { t: 40.33, kind: 'inside', look: 'yellow', variant: 0 },

    // pre-chorus
    { t: 46.00, kind: 'grid', look: 'night', variant: 1 },
    { t: 49.02, kind: 'conveyor', look: 'mint', variant: 0 },
    { t: 51.44, kind: 'binary', look: 'night', variant: 0 },
    { t: 54.16, kind: 'hit', look: 'red', variant: 0, label: 'CHANT' },

    // chorus 1
    { t: 57.30, kind: 'ring', look: 'pink', variant: 0, sale: true },
    { t: 59.74, kind: 'pack', look: 'cyan', variant: 1 },
    { t: 61.06, kind: 'glitch', look: 'glitch', variant: 0, word: '真っ赤' },
    { t: 62.96, kind: 'eyes', look: 'split', variant: 1 },
    { t: 65.25, kind: 'flower', look: 'cream', variant: 0 },
    { t: 66.70, kind: 'storm', look: 'red', word: 'NO HELP!', variant: 2 },

    // instrumental interlude — the hidden C
    { t: 68.07, kind: 'secret', look: 'night', variant: 0 },
    { t: 72.20, kind: 'marquee', look: 'night', variant: 1 },
    { t: 76.20, kind: 'build', look: 'cyan', variant: 1 },

    // hook — giant word switches with every sung syllable
    { t: 80.60, kind: 'hit', look: 'pink', variant: 1 },
    { t: 86.08, kind: 'hit', look: 'cyan', variant: 2 },
    { t: 91.10, kind: 'hit', look: 'yellow', variant: 3 },
    { t: 97.17, kind: 'hit', look: 'red', variant: 4 },
    { t: 103.13, kind: 'hit', look: 'mint', variant: 5 },
    { t: 108.45, kind: 'hit', look: 'pink', variant: 6 },
    { t: 113.19, kind: 'choco', look: 'choco', variant: 1 },

    // breakdown
    { t: 117.20, kind: 'melt', look: 'choco', variant: 0 },
    { t: 120.20, kind: 'dream', look: 'lav', variant: 0 },

    // chorus 2
    { t: 125.05, kind: 'ring', look: 'yellow', variant: 2, sale: true },
    { t: 127.68, kind: 'wall', look: 'pink', variant: 2 },
    { t: 128.97, kind: 'glitch', look: 'glitch', variant: 1, word: '真っ赤' },
    { t: 130.39, kind: 'eyes', look: 'split', variant: 2 },
    { t: 133.30, kind: 'flower', look: 'cream', variant: 0 },
    { t: 134.46, kind: 'storm', look: 'red', word: 'NO HELP!', variant: 3 },
    { t: 136.09, kind: 'conveyor', look: 'mint', variant: 1 },
    { t: 139.96, kind: 'glitch', look: 'glitch', variant: 2, word: 'MAD!' },
    { t: 141.61, kind: 'pack', look: 'pink', variant: 1 },
    { t: 144.35, kind: 'eyes', look: 'split', variant: 3 },
    { t: 145.58, kind: 'storm', look: 'red', word: 'NO ONE!', variant: 4 },

    // outro
    { t: 147.30, kind: 'sunset', look: 'sunset', variant: 0 },
    { t: 151.50, kind: 'choco', look: 'choco', variant: 2 },
    { t: 155.40, kind: 'flower', look: 'sunset', variant: 1 },
    { t: 160.60, kind: 'end', look: 'night', variant: 0 }
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

    let smoothE = 0;
    let count = 0;
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

    return {
      t, idx, phase, energy: e, smoothEnergy: smoothE, low, onset,
      beatInBar, bar, pulse, downbeat, barPulse, impact, beatDur
    };
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
    gdata.data[i + 3] = 18;
  }
  gg.putImageData(gdata, 0, 0);
  const grainPattern = ctx.createPattern(grainCanvas, 'repeat');

  const scanCanvas = document.createElement('canvas');
  scanCanvas.width = 4;
  scanCanvas.height = 4;
  const sg = scanCanvas.getContext('2d');
  sg.fillStyle = 'rgba(255,255,255,.05)';
  sg.fillRect(0, 0, 4, 1);
  const scanPattern = ctx.createPattern(scanCanvas, 'repeat');

  const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.95);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(0.72, 'rgba(0,0,0,.08)');
  vignette.addColorStop(1, 'rgba(0,0,0,.42)');

  let frameNo = 0;
  let currentCue = -1;
  let cutStart = -99;

  function fallbackScene(cue, m) {
    const look = LOOKS[cue.look] || LOOKS.night;
    ctx.fillStyle = look.bg;
    ctx.fillRect(-80, -80, W + 160, H + 160);
    drawText('CANDY', W / 2, H / 2, 300, { color: look.a, stroke: look.ink, lw: 16, shadow: 12 });
  }

  function drawCutFx(cue, age, m) {
    if (age < 0 || age > 0.16) return;
    const k = clamp(age / 0.16, 0, 1);
    const fade = Math.pow(1 - k, 2);
    const look = LOOKS[cue.look] || LOOKS.night;

    ctx.save();
    ctx.globalAlpha = fade * 0.34;
    ctx.fillStyle = C.white;
    ctx.fillRect(0, 0, W, H);

    ctx.globalAlpha = fade * 0.5;
    ctx.strokeStyle = look.a;
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 200 + k * 1250, 0, TAU);
    ctx.stroke();

    const shardCols = [look.a, look.b, look.c];
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.translate(i < 3 ? 0 : W, i % 2 ? 0 : H);
      ctx.rotate((i % 2 ? 1 : -1) * (0.5 + i * 0.08));
      ctx.globalAlpha = fade * 0.7;
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

    ctx.globalAlpha = 0.055;
    ctx.fillStyle = grainPattern;
    ctx.translate((frameNo * 37) % 256, (frameNo * 53) % 256);
    ctx.fillRect(-256, -256, W + 512, H + 512);

    ctx.globalAlpha = 0.25;
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

    const x = 300;
    const w = 1320;
    const h = 126;
    const y = 846 + (1 - inK) * 18;
    const prog = clamp((t - e.t) / Math.max(0.12, e.end - e.t), 0, 1);
    const accent = e.color || C.yellow;

    ctx.save();
    ctx.globalAlpha = a;

    // shadow + ticket
    ctx.fillStyle = 'rgba(0,0,0,.3)';
    pathRR(x + 8, y + 10, w, h, 18);
    ctx.fill();
    fillRR(x, y, w, h, 18, 'rgba(11,10,15,.9)', C.cream, 3);
    ctx.globalAlpha = a * 0.16;
    fillRR(x + 10, y + 10, w - 20, h - 20, 12, null, C.cream, 2);
    ctx.globalAlpha = a;

    // label tab
    fillRR(x + 20, y + 24, 8, h - 48, 4, accent, null, 0);
    drawText('歌詞', x + 50, y + 30, 12, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, jp: true, tracking: 3, alpha: 0.55
    });
    drawText('LYRIC', x + 88, y + 30, 9, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, tracking: 4, alpha: 0.35
    });

    // japanese line + karaoke fill
    const jpText = e.jp;
    const jpSize = fitSize(jpText, 42, w - 120, true, 0);
    const jpY = y + 70;
    drawText(jpText, W / 2, jpY, jpSize, {
      color: 'rgba(255,242,215,.45)', stroke: null, lw: 0, shadow: 0, jp: true
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

    // russian translation
    if (e.ru) {
      const ruSize = fitSize(e.ru, 19, w - 120, false, 0);
      drawText(e.ru, W / 2, y + 105, ruSize, {
        color: C.cream, stroke: null, lw: 0, shadow: 0, alpha: 0.82
      });
    }

    // progress
    ctx.globalAlpha = a * 0.3;
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
    const shakeAmp = impact * (cue.kind === 'storm' || cue.kind === 'glitch' ? 11 : cue.kind === 'build' ? 7 : 4.5);
    const seed = Math.floor(t * 30);
    const z = 1 + impact * 0.013;
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

    const b64 = window.CANDY_TRACK_B64;
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
      }, 2600);
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
      return '<rect x="' + (i * bw).toFixed(2) + '" y="' + (22 - h).toFixed(2) + '" width="' + Math.max(1, bw - 1.1).toFixed(2) + '" height="' + h.toFixed(2) + '" rx="1" fill="rgba(255,242,215,0.65)"/>';
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

  // ---------------------------------------------------------------- start / interactions

  async function startExperience() {
    if (loading || playing) return;
    loading = true;
    playBtn.classList.add('loading');
    playLabel.textContent = 'UNWRAPPING…';
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
    drawSparkle, drawSprinkle, drawBarcode, setFont, measure, fitSize, drawText,
    dotPattern, halftone, checker, radialBurst, speedLines, checkerTunnel,
    lollipop, wrappedCandy, drawCookie, drawChocoBar, drawSticker, circularText
  };

  window.CANDY = {
    preview,
    cues: SCENES,
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
