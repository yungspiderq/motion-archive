/* Scene library part 1 */
window.SCENES = window.SCENES || {};
(() => {
  const MD = window.MD;
  const {
    W, H, TAU, C, LOOKS, clamp, lerp, mod, smooth, easeOutCubic, easeOutBack,
    hash, rng, pathRR, fillRR, circle, drawStar, drawHeart, drawSparkle,
    drawSprinkle, fitSize, drawText, halftone, checker, radialBurst,
    speedLines, lollipop, wrappedCandy, drawCookie, drawChocoBar,
    drawSticker, circularText
  } = MD;
  const ctx = MD.ctx;

  function clear(look) {
    ctx.fillStyle = look.bg;
    ctx.fillRect(-100, -100, W + 200, H + 200);
  }

  function isLight(hex) {
    const h = hex.replace('#', '');
    const n = h.length === 3
      ? h.split('').map(x => parseInt(x + x, 16))
      : [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    return n[0] * 0.299 + n[1] * 0.587 + n[2] * 0.114 > 150;
  }

  function onColor(hex) {
    return isLight(hex) ? C.ink : C.cream;
  }

  function confetti(t, count, colors, seed = 1, alpha = 1) {
    for (let i = 0; i < count; i++) {
      const a = hash(i * 3.7 + seed) * TAU;
      const d = 200 + hash(i * 7.1 + seed) * 1100;
      const x = W / 2 + Math.cos(a) * d;
      const y = H / 2 + Math.sin(a) * d * 0.62;
      const s = 8 + hash(i + seed * 2) * 24;
      ctx.save();
      ctx.globalAlpha = alpha * (0.35 + hash(i * 2.2) * 0.65);
      ctx.translate(x, y);
      ctx.rotate(a + t * (0.7 + hash(i) * 1.5));
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(-s / 2, -s / 5, s, s / 2.5);
      ctx.restore();
    }
  }

  // ---------------------------------------------------------------- overture

  function overture(cue, next, m, lt, t) {
    const look = LOOKS.night;
    clear(look);

    const g = ctx.createRadialGradient(W / 2, H * 0.48, 0, W / 2, H * 0.48, 720);
    g.addColorStop(0, 'rgba(255,61,139,.26)');
    g.addColorStop(0.45, 'rgba(255,61,139,.08)');
    g.addColorStop(1, 'rgba(255,61,139,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 7; i++) {
      circle(W / 2, H / 2, 220 + i * 78, null, 'rgba(255,242,215,.075)', 1.5);
    }

    const step = Math.min(3, Math.floor(t / Math.max(0.1, m.beatDur)));
    const countdown = ['3', '2', '1', '!'][step];
    drawText(countdown, W / 2, H / 2 + 26, 760, {
      color: look.a, stroke: null, lw: 0, shadow: 0, alpha: 0.075
    });

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(t * 0.55);
    ctx.beginPath();
    ctx.arc(0, 0, 355, 0, TAU);
    ctx.setLineDash([6, 27]);
    ctx.strokeStyle = 'rgba(255,242,215,.34)';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    speedLines(W / 2, H / 2, t, 12, 'rgba(255,242,215,.12)', 0.8);

    lollipop(W / 2, H / 2 - 20, 148 + m.pulse * 8, -0.1, t * 3.4, C.pink);

    drawText('HALLO CEL', W / 2, 108, 22, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, tracking: 6
    });
    drawText('MOTION DESIGN CLIP', W / 2, 146, 11, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, tracking: 4, alpha: 0.45
    });

    drawText('キャンディークッキーチョコレート', W / 2, 968, 25, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, jp: true, tracking: 4, alpha: 0.85
    });
    drawText('初音ミク × 重音テトSV', W / 2, 1006, 13, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, jp: true, alpha: 0.42
    });

    for (let i = 0; i < 4; i++) {
      const on = i === Math.min(3, step);
      circle(W / 2 - 60 + i * 40, 860, on ? 8 : 5, on ? C.pink : 'rgba(255,242,215,.25)');
    }

    for (let i = 0; i < 16; i++) {
      const x = hash(i * 3.1) * W;
      const y = hash(i * 5.7) * H;
      const s = 3 + hash(i) * 7;
      drawSparkle(x, y, s, i % 2 ? C.yellow : C.cyan, t * 0.4 + i, 0.3 + 0.7 * Math.abs(Math.sin(t * 2 + i)));
    }

    if (lt > 1.15) {
      ctx.fillStyle = 'rgba(255,242,215,' + (0.05 + (lt - 1.15) * 0.55) + ')';
      ctx.fillRect(0, 0, W, H);
    }
  }

  // ---------------------------------------------------------------- title

  function title(cue, next, m, lt, t) {
    const look = LOOKS[cue.look] || LOOKS.night;
    clear(look);

    radialBurst(W / 2, H / 2, 1500, [look.a, look.b, look.c, look.bg], t * 0.02, 0.22, 28);
    halftone(0, 0, W, 220, look.ink, 0.1);
    halftone(0, H - 210, W, 210, look.ink, 0.1);
    checker(0, H - 96, W, 96, 64, look.ink, look.a, t * 22, 0, 0.9);

    const k = clamp(lt / 0.34, 0, 1);
    const e = easeOutBack(k);
    const word = cue.word || 'CANDY';
    const size = fitSize(word, 340, 1540, false, -8);
    const scale = lerp(0.58, 1, e) * (1 + m.pulse * 0.026);

    // ghost ring
    ctx.save();
    ctx.translate(W / 2, 548);
    ctx.rotate(-0.05);
    ctx.globalAlpha = 0.18;
    circle(0, 0, size * 1.22 + m.pulse * 30, null, look.ink, 9);
    circle(0, 0, size * 1.36 + m.pulse * 30, null, look.ink, 2);
    ctx.restore();

    drawText(cue.jp || '', W / 2, 238, 46, {
      color: look.ink, stroke: null, lw: 0, shadow: 0, jp: true, tracking: 10, alpha: 0.8
    });

    drawText(word, W / 2, 540, size, {
      color: look.pop,
      stroke: C.ink,
      lw: size * 0.055,
      shadow: size * 0.035,
      rot: -0.052 + (1 - k) * 0.14,
      sx: scale,
      sy: scale,
      tracking: -size * 0.018
    });

    drawText('CANDY  ·  COOKIE  ·  CHOCOLATE', W / 2, 792, 24, {
      color: look.ink, stroke: null, lw: 0, shadow: 0, tracking: 8, alpha: 0.78
    });
    drawText('SWEET MOTION PICTURE', W / 2, 828, 12, {
      color: look.ink, stroke: null, lw: 0, shadow: 0, tracking: 5, alpha: 0.42
    });

    drawSticker('SWEET!\n100%', 1646, 288, 104, look.c, 0.13, {
      color: onColor(look.c), size: 27, textStroke: false
    });
    drawSticker(cue.num || '01', 274, 306, 74, C.cream, -0.14, {
      color: C.pink, size: 38, textStroke: false
    });

    lollipop(238, 862, 112, -0.25, t * 1.8, C.cyan);
    wrappedCandy(1696, 856, 76, 0.35, C.pink);
    drawSparkle(1480, 760, 18, C.cream, t, 0.8);
    drawSparkle(390, 700, 12, C.yellow, -t * 0.8, 0.9);

    confetti(t, 20, [look.a, look.b, look.c, C.cream], 4, 0.55);

    ctx.fillStyle = 'rgba(11,10,15,.14)';
    ctx.fillRect(0, 0, W, H);
  }

  // ---------------------------------------------------------------- stacked title

  function stack(cue, next, m, lt, t) {
    const look = LOOKS[cue.look] || LOOKS.night;
    clear(look);
    radialBurst(W / 2, H / 2, 1600, [look.a, look.b, look.c, look.bg], -t * 0.025, 0.2, 32);
    halftone(0, 0, W, 260, look.ink, 0.11);
    checker(0, H - 110, W, 110, 70, look.ink, look.a, t * 18, 0, 0.85);

    const lines = [
      { word: 'CANDY', color: look.a, y: 292, size: 238, rot: -0.04 },
      { word: 'COOKIE', color: look.b, y: 500, size: 238, rot: 0.03 },
      { word: 'CHOCOLATE', color: look.c, y: 702, size: 148, rot: -0.02 }
    ];

    ctx.save();
    ctx.translate(W / 2, 520);
    ctx.rotate(-0.035);
    ctx.globalAlpha = 0.16;
    fillRR(-820, -340, 1640, 750, 58, null, look.ink, 10);
    ctx.restore();

    lines.forEach((line, i) => {
      const delay = i * 0.07;
      const k = clamp((lt - delay) / 0.3, 0, 1);
      const dir = i % 2 ? -1 : 1;
      const x = W / 2 + (1 - easeOutCubic(k)) * dir * 900;
      const sc = 0.88 + 0.12 * easeOutBack(k);
      drawText(line.word, x, line.y, line.size, {
        color: line.color,
        stroke: C.ink,
        lw: line.size * 0.045,
        shadow: line.size * 0.035,
        rot: line.rot,
        sx: sc,
        sy: sc,
        tracking: -line.size * 0.016
      });
    });

    drawText('キャンディー・クッキー・チョコレート', W / 2, 795, 25, {
      color: look.ink, stroke: null, lw: 0, shadow: 0, jp: true, tracking: 8, alpha: 0.7
    });
    drawText('ALL MIXED UP  /  100% SUGAR', W / 2, 842, 13, {
      color: look.ink, stroke: null, lw: 0, shadow: 0, tracking: 5, alpha: 0.45
    });

    drawSticker('NEW!\nFLAVOR', 1632, 258, 105, C.green, 0.15, {
      color: C.ink, size: 29, textStroke: false
    });
    drawSticker('♡', 300, 870, 76, C.cream, -0.13, {
      color: C.pink, size: 58, textStroke: false
    });

    lollipop(238, 300, 118, 0.2, t * 2.2, C.pink);
    wrappedCandy(1690, 850, 84, -0.3, C.yellow);

    if (cue.variant > 0) {
      drawText('だいすき', 111, 640, 46, {
        color: C.cream, stroke: C.ink, lw: 3, jp: true, rot: -Math.PI / 2, shadow: 2
      });
      drawText('CANDY', 1820, 640, 42, {
        color: C.cream, stroke: C.ink, lw: 3, rot: Math.PI / 2, shadow: 2
      });
    }
  }

  // ---------------------------------------------------------------- marquee

  function marquee(cue, next, m, lt, t) {
    const look = LOOKS.night;
    clear(look);
    halftone(0, 0, W, H, C.cream, 0.05);

    const variant = cue.variant || 0;
    const tilt = variant === 1 ? 0.105 : variant === 2 ? -0.09 : -0.115;
    const bandH = 146;
    const gap = 18;
    const bands = 6;
    const totalH = bands * bandH + (bands - 1) * gap;
    const cols = [C.pink, C.cyan, C.yellow, C.cream, C.green, C.pink];

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(tilt);
    let y = -totalH / 2;
    const text = 'CANDY  /  COOKIE  /  CHOCOLATE  /  ';
    const tw = MD.measure(text, 108, false, 0);

    for (let i = 0; i < bands; i++) {
      const col = cols[(i + variant) % cols.length];
      const speed = (i % 2 ? -1 : 1) * (115 + i * 24 + variant * 35);
      const dirOffset = mod(t * speed + i * 340, tw);

      fillRR(-W * 0.8, y, W * 1.6, bandH, 0, col, C.ink, 9);

      ctx.save();
      ctx.beginPath();
      ctx.rect(-W * 0.8, y, W * 1.6, bandH);
      ctx.clip();
      const txtCol = onColor(col);
      for (let k = -1; k < 9; k++) {
        drawText(text, -W * 0.8 + k * tw + dirOffset, y + bandH / 2 + 4, 108, {
          color: txtCol, stroke: null, lw: 0, shadow: 0, align: 'left', tracking: 1
        });
      }
      ctx.restore();

      y += bandH + gap;
    }
    ctx.restore();

    // central badge
    const scale = 1 + m.pulse * 0.07;
    drawSticker('SWEET\nCANDY', W / 2, H / 2 - 6, 172, look.a, -0.08 + Math.sin(t * 0.7) * 0.03, {
      color: C.ink, size: 60, textStroke: false, scale
    });

    drawText('MOTION DESIGN  /  172 BPM', W / 2, 110, 13, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, tracking: 6, alpha: 0.55
    });
    drawText('CANDY COOKIE CHOCOLATE', W / 2, 968, 20, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, tracking: 8, alpha: 0.6
    });

    lollipop(160, 900, 92, -0.3, t * 2.1, C.cyan);
    lollipop(1770, 190, 78, 0.24, -t * 2.4, C.pink);
    wrappedCandy(1780, 910, 62, 0.4, C.yellow);
    wrappedCandy(150, 180, 58, -0.35, C.green);

    confetti(t, 22, [C.pink, C.cyan, C.yellow, C.cream], 8 + variant, 0.65);
  }

  // ---------------------------------------------------------------- eyes

  function macroEye(x, y, w, h, blink, glance, irisColor) {
    ctx.save();
    ctx.translate(x, y);

    // eyebrow
    ctx.beginPath();
    ctx.moveTo(-w * 0.48, -h * 0.88);
    ctx.quadraticCurveTo(0, -h * 1.18, w * 0.46, -h * 0.82);
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = h * 0.075;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.save();
    ctx.scale(1, 1 - blink * 0.93);

    // sclera
    ctx.beginPath();
    ctx.moveTo(-w / 2, h * 0.02);
    ctx.bezierCurveTo(-w * 0.31, -h * 0.56, w * 0.31, -h * 0.56, w / 2, -h * 0.02);
    ctx.bezierCurveTo(w * 0.34, h * 0.5, -w * 0.31, h * 0.5, -w / 2, h * 0.02);
    ctx.closePath();
    ctx.fillStyle = C.cream;
    ctx.fill();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = h * 0.045;
    ctx.stroke();

    ctx.save();
    ctx.clip();

    const ix = glance * w * 0.055;
    const iy = Math.sin(glance * 2.3) * h * 0.035;

    circle(ix, iy, h * 0.37, irisColor, C.ink, h * 0.025);
    circle(ix, iy, h * 0.27, null, 'rgba(11,10,15,.55)', h * 0.035);
    circle(ix, iy + h * 0.02, h * 0.16, C.ink);
    circle(ix - h * 0.14, iy - h * 0.16, h * 0.09, C.white);
    circle(ix + h * 0.12, iy + h * 0.11, h * 0.038, 'rgba(255,255,255,.9)');
    drawHeart(ix + h * 0.02, iy + h * 0.15, h * 0.06, C.pink, null, 0, 0.1);

    // iris shading
    ctx.beginPath();
    ctx.arc(ix, iy, h * 0.33, 0.25, 1.2);
    ctx.strokeStyle = 'rgba(11,10,15,.2)';
    ctx.lineWidth = h * 0.08;
    ctx.stroke();

    // eyelid shadow
    ctx.beginPath();
    ctx.moveTo(-w * 0.52, -h * 0.1);
    ctx.quadraticCurveTo(0, -h * 0.55, w * 0.52, -h * 0.12);
    ctx.strokeStyle = 'rgba(11,10,15,.12)';
    ctx.lineWidth = h * 0.16;
    ctx.stroke();
    ctx.restore();

    // thick upper lash line
    ctx.beginPath();
    ctx.moveTo(-w * 0.52, h * 0.02);
    ctx.bezierCurveTo(-w * 0.31, -h * 0.59, w * 0.31, -h * 0.59, w * 0.52, -h * 0.02);
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = h * 0.085;
    ctx.lineCap = 'round';
    ctx.stroke();

    // lashes
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      const bx = w * (0.4 + i * 0.035);
      const by = -h * (0.12 + i * 0.04);
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + w * (0.075 + i * 0.012), by - h * (0.14 - i * 0.015));
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = h * (0.04 - i * 0.006);
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    ctx.restore();

    if (blink > 0.55) {
      ctx.beginPath();
      ctx.moveTo(-w * 0.48, 0);
      ctx.quadraticCurveTo(0, h * 0.18, w * 0.48, 0);
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = h * 0.07;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    ctx.restore();
  }

  function idolPanel(cx, cy, scale, hair, hairDark, mirror, blink, glance, t, variant) {
    ctx.save();
    ctx.translate(cx, cy);
    if (mirror) ctx.scale(-1, 1);
    ctx.scale(scale, scale);

    // back twin tail
    ctx.beginPath();
    ctx.moveTo(-330, -470);
    ctx.bezierCurveTo(-640, -430, -690, 130, -575, 500);
    ctx.bezierCurveTo(-520, 560, -450, 430, -470, 270);
    ctx.bezierCurveTo(-500, 20, -430, -260, -330, -470);
    ctx.closePath();
    ctx.fillStyle = hair;
    ctx.fill();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 15;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // face
    ctx.beginPath();
    ctx.ellipse(0, 120, 396, 520, 0, 0, TAU);
    ctx.fillStyle = C.skin;
    ctx.fill();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 13;
    ctx.stroke();

    // blush
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = C.pink;
    ctx.beginPath();
    ctx.ellipse(-248, 246, 94, 44, -0.12, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(246, 246, 94, 44, 0.12, 0, TAU);
    ctx.fill();
    ctx.restore();

    // mouth
    ctx.beginPath();
    ctx.ellipse(0, 404, 58, 31, 0, 0, TAU);
    ctx.fillStyle = '#8E1D32';
    ctx.fill();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 416, 30, 13, 0, 0, TAU);
    ctx.fillStyle = C.pink;
    ctx.fill();

    // nose hint
    ctx.beginPath();
    ctx.moveTo(118, 292);
    ctx.quadraticCurveTo(138, 306, 116, 316);
    ctx.strokeStyle = 'rgba(11,10,15,.35)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();

    macroEye(0, -66, 544, 300, blink, glance, hairDark);

    // hair fringe
    ctx.beginPath();
    ctx.moveTo(-505, -570);
    ctx.lineTo(505, -570);
    ctx.lineTo(505, -310);
    const spikes = [
      [450, -190], [402, -306], [342, -186], [282, -300], [222, -170],
      [160, -286], [92, -158], [24, -270], [-46, -152], [-118, -268],
      [-186, -178], [-256, -300], [-318, -192], [-390, -312], [-448, -212],
      [-505, -300]
    ];
    spikes.forEach(p => ctx.lineTo(p[0], p[1]));
    ctx.closePath();
    ctx.fillStyle = hair;
    ctx.fill();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 14;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // side locks
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 335, -300);
      ctx.bezierCurveTo(side * 430, -110, side * 430, 230, side * 350, 520);
      ctx.lineTo(side * 405, 505);
      ctx.bezierCurveTo(side * 492, 180, side * 485, -110, side * 390, -320);
      ctx.closePath();
      ctx.fillStyle = hair;
      ctx.fill();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 11;
      ctx.stroke();
    }

    // hair highlights
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = C.cream;
    ctx.lineWidth = 13;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-300 + i * 90, -470 - i * 8);
      ctx.quadraticCurveTo(-250 + i * 90, -300, -300 + i * 90, -200 - i * 20);
      ctx.stroke();
    }
    ctx.restore();

    // hair clip
    if (!mirror) {
      drawStar(292, -292, 54, C.yellow, C.ink, 8, t * 0.5, 5, 0.46);
      circle(292, -292, 16, C.pink, C.ink, 5);
    } else {
      drawHeart(292, -292, 55, C.cyan, C.ink, 8, 0.1);
      circle(292, -292, 14, C.yellow, C.ink, 5);
    }

    // cheek highlight
    ctx.beginPath();
    ctx.ellipse(-265, 178, 58, 18, -0.25, 0, TAU);
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    ctx.fill();

    ctx.restore();
  }

  function eyes(cue, next, m, lt, t) {
    const v = cue.variant || 0;
    const slide = m.downbeat ? m.pulse * 12 : 0;
    const blink = (m.idx % 8 === 0) ? Math.sin(clamp(m.phase / 0.16, 0, 1) * Math.PI) : 0;
    const glance = Math.sin(t * 0.85 + v * 1.7) * 0.8;
    const faceY = H * 0.50;

    ctx.fillStyle = C.miku;
    ctx.fillRect(-80, -80, W / 2 + 80, H + 160);
    ctx.fillStyle = C.red;
    ctx.fillRect(W / 2, -80, W / 2 + 80, H + 160);

    halftone(0, 0, W / 2, 330, C.ink, 0.12);
    halftone(0, H - 300, W / 2, 300, C.ink, 0.09);
    halftone(W / 2, 0, W / 2, 330, C.ink, 0.1);
    halftone(W / 2, H - 300, W / 2, 300, C.ink, 0.12);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W / 2, H);
    ctx.clip();
    idolPanel(W * 0.25 - slide, faceY, 1.03, C.miku, '#0E9AA4', false, blink, glance, t, v);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(W / 2, 0, W / 2, H);
    ctx.clip();
    idolPanel(W * 0.75 + slide, faceY, 1.03, C.red, '#A50F28', true, blink, -glance, t, v);
    ctx.restore();

    // divider
    ctx.fillStyle = C.cream;
    ctx.fillRect(W / 2 - 9 - slide, -20, 18 + slide * 2, H + 40);
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 20 - slide, -20);
    ctx.lineTo(W / 2 - 20 - slide, H + 20);
    ctx.moveTo(W / 2 + 20 + slide, -20);
    ctx.lineTo(W / 2 + 20 + slide, H + 20);
    ctx.stroke();

    // checker corners
    checker(0, 0, 300, 84, 56, C.ink, C.cream, 0, 0, 0.85);
    checker(W - 300, 0, 300, 84, 56, C.ink, C.cream, 0, 0, 0.85);
    checker(0, H - 84, W, 84, 56, C.ink, C.cream, t * 16, 0, 0.85);

    drawText('CANDY COOKIE CHOCOLATE', W / 2, 134, 21, {
      color: C.cream, stroke: C.ink, lw: 4, shadow: 3, tracking: 5
    });

    drawSticker('×', W / 2, 186, 54, C.cream, 0.12 + Math.sin(t) * 0.04, {
      color: C.pink, size: 46, textStroke: false, ring: false
    });

    drawText('MIKU', 54, 900, 132, {
      color: C.cream, stroke: C.ink, lw: 9, shadow: 9, align: 'left', rot: -0.045
    });
    drawText('初音ミク', 60, 980, 27, {
      color: C.cream, stroke: C.ink, lw: 4, shadow: 0, jp: true, align: 'left', tracking: 3
    });
    drawText('CV / HATSUNE MIKU', 62, 1018, 10, {
      color: C.cream, stroke: C.ink, lw: 2, shadow: 0, align: 'left', tracking: 3, alpha: 0.8
    });

    drawText('TETO', W - 54, 900, 132, {
      color: C.cream, stroke: C.ink, lw: 9, shadow: 9, align: 'right', rot: 0.045
    });
    drawText('重音テトSV', W - 60, 980, 27, {
      color: C.cream, stroke: C.ink, lw: 3, shadow: 0, jp: true, align: 'right', tracking: 3
    });
    drawText('CV / KASANE TETO SV', W - 62, 1018, 10, {
      color: C.cream, stroke: C.ink, lw: 2, shadow: 0, align: 'right', tracking: 3, alpha: 0.8
    });

    for (let i = 0; i < 7; i++) {
      const x = W / 2 + (i - 3) * 34;
      drawHeart(x, 1040, 8 + Math.sin(t * 4 + i) * 2, i % 2 ? C.pink : C.yellow, C.ink, 2, 0.1);
    }

    if (v > 0) {
      drawText('CANDY', W / 2, 1020, 18, {
        color: C.cream, stroke: null, lw: 0, shadow: 0, tracking: 8, alpha: 0.5
      });
    }
  }

  // ---------------------------------------------------------------- cookie

  function cookie(cue, next, m, lt, t) {
    const look = LOOKS[cue.look] || LOOKS.cream;
    const variant = cue.variant || 0;
    clear(look);

    radialBurst(W / 2, H / 2, 1600, [look.b, look.c, look.bg], -0.1 + t * 0.02, 0.22, 30);
    halftone(0, 0, W, 210, look.ink, 0.11);
    checker(0, H - 130, W, 130, 72, look.ink, look.a, t * 16, 0, 0.75);

    drawText('COOKIE', W / 2, 175, 252, {
      color: look.a, stroke: C.ink, lw: 13, shadow: 10, rot: -0.025, tracking: -4
    });

    // milk plate
    circle(W / 2 + 34, H / 2 + 110, 365, C.paper, 'rgba(11,10,15,.14)', 5);
    circle(W / 2 + 34, H / 2 + 110, 330, null, 'rgba(11,10,15,.1)', 3);

    // cookies orbiting
    drawCookie(250, 330, 74, -0.3 + Math.sin(t) * 0.06, m.pulse * 0.5, {
      body: C.cookie, dark: C.cookieDark
    });
    drawCookie(1660, 760, 92, 0.25 - Math.sin(t * 0.9) * 0.05, m.pulse * 0.4, {
      body: C.cookie, dark: C.cookieDark
    });

    // crumb burst
    for (let i = 0; i < 16; i++) {
      const a = hash(i * 6.3) * TAU;
      const d = 330 + m.phase * (80 + hash(i) * 260);
      const x = W / 2 + Math.cos(a) * d;
      const y = H / 2 + 100 + Math.sin(a) * d * 0.66;
      ctx.save();
      ctx.globalAlpha = 1 - m.phase;
      ctx.translate(x, y);
      ctx.rotate(a + t * 2);
      ctx.fillStyle = C.cookieDark;
      ctx.fillRect(-8, -5, 16, 10);
      ctx.restore();
    }

    drawCookie(W / 2, H / 2 + 64, 318, -0.09 + Math.sin(t * 1.1) * 0.025, m.pulse, {
      body: C.cookie,
      dark: C.cookieDark
    });

    drawSticker('サクサク\nCRUNCH!', 1608, 292, 108, look.b, 0.16, {
      color: onColor(look.b), size: 30, textStroke: false
    });
    drawSticker('100%\nBUTTER', 320, 852, 86, look.c, -0.14, {
      color: onColor(look.c), size: 23, textStroke: false
    });

    drawText('SWEET  ·  CRUNCHY  ·  HAPPY', W / 2, 974, 21, {
      color: look.ink, stroke: null, lw: 0, shadow: 0, tracking: 6, alpha: 0.65
    });
    drawText('サクサク クッキー', W / 2, 1012, 14, {
      color: look.ink, stroke: null, lw: 0, shadow: 0, jp: true, tracking: 6, alpha: 0.45
    });

    if (variant > 0) {
      drawText('CHOCO CHIP', 86, 610, 24, {
        color: look.ink, stroke: null, lw: 0, shadow: 0, align: 'left', tracking: 5, alpha: 0.4
      });
    }
  }

  // ---------------------------------------------------------------- chocolate

  function diagonalBand(y, h, base, stripe, alpha = 1) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.beginPath();
    ctx.rect(0, y, W, h);
    ctx.clip();
    ctx.fillStyle = base;
    ctx.fillRect(0, y, W, h);
    ctx.translate(0, y);
    ctx.rotate(-0.22);
    for (let x = -W; x < W * 2; x += 150) {
      ctx.fillStyle = stripe;
      ctx.fillRect(x, -180, 54, h + 360);
    }
    ctx.restore();
  }

  function choco(cue, next, m, lt, t) {
    const look = LOOKS.choco;
    clear(look);

    diagonalBand(0, 145, C.yellow, C.ink, 0.95);
    diagonalBand(H - 135, 135, C.pink, C.ink, 0.92);
    halftone(0, 145, W, H - 280, C.cream, 0.06);

    const g = ctx.createRadialGradient(W / 2, 610, 0, W / 2, 610, 740);
    g.addColorStop(0, 'rgba(239,181,44,.2)');
    g.addColorStop(1, 'rgba(239,181,44,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 130, W, H - 260);

    drawText('CHOCOLATE', W / 2, 220, 218, {
      color: C.cream, stroke: C.ink, lw: 12, shadow: 10, rot: -0.025, tracking: -3
    });
    drawText('ビター  /  DARK 72%', W / 2, 318, 22, {
      color: C.pink, stroke: null, lw: 0, shadow: 0, jp: true, tracking: 6
    });

    drawChocoBar(W / 2, 610, 890, 430, -0.065, m.pulse, {
      foil: C.yellow,
      body: C.choco2,
      seg: C.choco
    });

    drawSticker('72%\nCACAO', 1630, 780, 108, C.pink, -0.1, {
      color: C.cream, size: 34, textStroke: false
    });
    drawSticker('BITTER', 296, 815, 82, C.yellow, 0.12, {
      color: C.ink, size: 24, textStroke: false
    });

    drawText('MELT IN YOUR MOUTH', W / 2, 992, 18, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, tracking: 8, alpha: 0.55
    });

    for (let i = 0; i < 18; i++) {
      const x = hash(i * 4.2) * W;
      const y = 370 + hash(i * 6.8) * 540;
      const s = 3 + hash(i) * 8;
      drawSparkle(x, y, s, i % 2 ? C.yellow : C.pink, t * 0.7 + i, 0.35 + 0.5 * Math.abs(Math.sin(t * 2 + i)));
    }

    // crumbs
    for (let i = 0; i < 10; i++) {
      const x = W / 2 + (hash(i + 4) - 0.5) * 860;
      const y = 790 + m.phase * (30 + hash(i) * 90);
      ctx.save();
      ctx.globalAlpha = 1 - m.phase;
      ctx.fillStyle = C.choco;
      ctx.translate(x, y);
      ctx.rotate(hash(i) * TAU);
      ctx.fillRect(-9, -6, 18, 12);
      ctx.restore();
    }
  }

  // ---------------------------------------------------------------- type grid

  function grid(cue, next, m, lt, t) {
    const look = LOOKS.night;
    clear(look);
    halftone(0, 0, W, H, C.cream, 0.055);

    const marginX = 64;
    const top = 112;
    const bottom = 150;
    const gap = 14;
    const cols = 5;
    const rows = 3;
    const cw = (W - marginX * 2 - gap * (cols - 1)) / cols;
    const ch = (H - top - bottom - gap * (rows - 1)) / rows;

    const items = [
      { text: 'CANDY' }, { text: 'キャンディー', jp: true }, { text: 'COOKIE' },
      { text: 'クッキー', jp: true }, { text: 'CHOCO' },
      { text: 'チョコ', jp: true }, { text: 'SWEET' }, { text: 'あまい', jp: true },
      { text: 'LOVE' }, { text: 'だいすき', jp: true },
      { icon: 'star' }, { icon: 'heart' }, { icon: 'lolli' }, { icon: 'cookie' }, { text: '!' }
    ];
    const fills = [C.pink, C.cyan, C.yellow, C.cream, C.green, C.lav, C.blue, C.orange];

    // giant ghost word
    drawText('CANDY', W / 2, H / 2 + 40, 400, {
      color: 'rgba(255,242,215,.055)', stroke: null, lw: 0, shadow: 0, rot: -0.05
    });

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const x = marginX + c * (cw + gap);
        const y = top + r * (ch + gap);
        const fill = fills[(i + (cue.variant || 0)) % fills.length];
        const txt = onColor(fill);
        const intro = easeOutCubic(clamp((lt - i * 0.014) / 0.26, 0, 1));
        const wave = clamp(1 - Math.abs(mod(m.phase - (c + r) * 0.09, 1) - 0.15) * 3, 0, 1);
        const sc = (0.72 + 0.28 * intro) * (1 + wave * 0.05 * m.smoothEnergy);
        const rot = (hash(i * 3.1) - 0.5) * 0.025;

        ctx.save();
        ctx.translate(x + cw / 2, y + ch / 2);
        ctx.rotate(rot);
        ctx.scale(sc, sc);
        ctx.translate(-cw / 2, -ch / 2);

        fillRR(0, 0, cw, ch, 22, fill, C.ink, 7);
        ctx.globalAlpha = 0.18;
        fillRR(10, 10, cw - 20, ch - 20, 15, null, C.ink, 2);
        ctx.globalAlpha = 1;

        const item = items[i];
        if (item.text) {
          const size = fitSize(item.text, 64, cw * 0.78, item.jp, 0);
          drawText(item.text, cw / 2, ch / 2 + 4, size, {
            color: txt, stroke: null, lw: 0, shadow: 0, jp: item.jp,
            tracking: item.jp ? 1 : -1
          });
        } else if (item.icon === 'star') {
          drawStar(cw / 2, ch / 2, ch * 0.27, txt, C.ink, 6, t * 0.9, 5, 0.44);
        } else if (item.icon === 'heart') {
          drawHeart(cw / 2, ch / 2, ch * 0.3, txt, C.ink, 6, 0.1);
        } else if (item.icon === 'lolli') {
          const scale = ch * 0.3;
          ctx.save();
          ctx.translate(cw / 2, ch / 2);
          ctx.scale(0.38, 0.38);
          lollipop(0, -scale * 1.4, scale * 2.2, -0.1, t * 2.4, C.pink);
          ctx.restore();
        } else if (item.icon === 'cookie') {
          drawCookie(cw / 2, ch / 2, ch * 0.27, -0.1 + Math.sin(t) * 0.03, m.pulse * 0.5, {
            body: C.cookie, dark: C.cookieDark
          });
        }

        ctx.restore();
      }
    }

    // moving shine
    ctx.save();
    ctx.beginPath();
    ctx.rect(marginX, top, W - marginX * 2, H - top - bottom);
    ctx.clip();
    ctx.globalAlpha = 0.16;
    ctx.translate(W / 2, H / 2);
    ctx.rotate(0.35);
    const shx = mod(t * 620, 2600) - 1300;
    ctx.fillStyle = C.cream;
    ctx.fillRect(shx, -900, 150, 1800);
    ctx.restore();

    drawText('CANDY COOKIE CHOCOLATE', W / 2, 54, 18, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, tracking: 7
    });
    drawText('15 FLAVORS  /  100% SUGAR  /  NO RULES', W / 2, H - 94, 14, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, tracking: 5, alpha: 0.55
    });

    // corner stickers
    drawSticker('MIX\nIT!', W - 108, H - 96, 66, C.pink, 0.1, {
      color: C.cream, size: 22, textStroke: false
    });
  }

  window.SCENES.overture = overture;
  window.SCENES.title = title;
  window.SCENES.stack = stack;
  window.SCENES.marquee = marquee;
  window.SCENES.eyes = eyes;
  window.SCENES.cookie = cookie;
  window.SCENES.choco = choco;
  window.SCENES.grid = grid;
})();
