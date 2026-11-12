/* Scene library part 3 */
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

  function diagonalStripes(y, h, base, stripe, size = 46, speed = 0) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, y, W, h);
    ctx.clip();
    ctx.fillStyle = base;
    ctx.fillRect(0, y, W, h);
    ctx.translate(0, y);
    ctx.rotate(-0.2);
    for (let x = -W; x < W * 2; x += size * 2) {
      ctx.fillStyle = stripe;
      ctx.fillRect(x + mod(speed, size * 2), -h, size, h * 3);
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- factory

  function conveyor(cue, next, m, lt, t) {
    const look = LOOKS.mint;
    clear(look);

    // factory wall grid
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 2;
    for (let x = 0; x <= W; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y += 120) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.restore();

    dial(1460, 260, 74, t);
    dial(1680, 260, 52, -t);

    // top sign
    fillRR(270, 42, 1380, 148, 26, C.cream, C.ink, 9);
    drawText('SWEETS FACTORY', W / 2, 108, 74, {
      color: C.pink, stroke: C.ink, lw: 7, shadow: 5, tracking: -1
    });
    drawText('おかし工場  /  QUALITY CONTROL', W / 2, 160, 15, {
      color: C.ink, stroke: null, lw: 0, shadow: 0, jp: true, tracking: 4, alpha: 0.62
    });
    for (let i = 0; i < 8; i++) circle(310 + i * 184, 78, 6, C.ink);

    // overhead rail
    fillRR(W / 2 - 10, 190, 20, 230, 10, C.ink, null, 0);
    fillRR(W / 2 - 140, 196, 280, 30, 15, C.choco2, C.ink, 6);

    // stamp
    const stampPhase = m.downbeat ? m.phase : 1;
    const stamp = stampPhase < 0.22 ? Math.sin(stampPhase / 0.22 * Math.PI) * 128 : 0;
    ctx.save();
    ctx.translate(W / 2, stamp);
    fillRR(-105, 226, 210, 148, 20, C.pink, C.ink, 9);
    drawText('SWEET!', 0, 300, 42, {
      color: C.cream, stroke: C.ink, lw: 4, shadow: 3, tracking: 1
    });
    ctx.restore();

    // belt
    const beltY = 760;
    ctx.save();
    ctx.translate(0, Math.sin(t * 2) * 2);
    fillRR(100, beltY, 1720, 156, 52, C.ink, null, 0);
    fillRR(100, beltY, 1720, 86, 40, C.choco2, C.ink, 8);
    ctx.save();
    pathRR(108, beltY + 8, 1704, 78, 34);
    ctx.clip();
    for (let x = -200; x < W + 200; x += 92) {
      const xx = mod(x + t * 185, W + 300) - 150;
      ctx.fillStyle = 'rgba(255,242,215,.22)';
      ctx.save();
      ctx.translate(xx, beltY);
      ctx.rotate(0.4);
      ctx.fillRect(0, -40, 22, 160);
      ctx.restore();
    }
    ctx.restore();

    // rollers
    for (let i = 0; i < 12; i++) {
      const x = 156 + i * 148;
      circle(x, beltY + 128, 23, C.cream, C.ink, 5);
      ctx.save();
      ctx.translate(x, beltY + 128);
      ctx.rotate(t * 1.4 + i * 0.5);
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 4;
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.moveTo(-13, 0);
        ctx.lineTo(13, 0);
        ctx.stroke();
        ctx.rotate(TAU / 3);
      }
      ctx.restore();
    }
    ctx.restore();

    // products
    for (let i = 0; i < 9; i++) {
      const x = mod(i * 300 + t * 168, 2300) - 190;
      const y = beltY - 18 + Math.sin(t * 3 + i) * 3;
      const kind = i % 4;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(0.82, 0.82);
      if (kind === 0) lollipop(0, -42, 58, -0.06, t * 2.5 + i, C.pink);
      else if (kind === 1) drawCookie(0, 0, 58, -0.05 + Math.sin(t + i) * 0.04, 0, {
        body: C.cookie, dark: C.cookieDark
      });
      else if (kind === 2) drawChocoBar(0, 0, 170, 84, 0.04, 0, { foil: C.yellow });
      else wrappedCandy(0, 0, 46, -0.1, i % 2 ? C.cyan : C.pink);
      ctx.restore();
    }

    // impact burst
    if (stamp > 10) {
      for (let i = 0; i < 16; i++) {
        const a = i / 16 * TAU;
        const d = 90 + hash(i) * 210 + stamp;
        drawSparkle(W / 2 + Math.cos(a) * d, 500 + Math.sin(a) * d * 0.5, 8 + hash(i) * 8, C.yellow, a, 0.9);
      }
      drawText('SWEET!', W / 2, 600, 110, {
        color: C.cream, stroke: C.ink, lw: 10, shadow: 8, rot: -0.1 + stamp / 1400, alpha: clamp(stamp / 80, 0, 1)
      });
    }

    // side lights
    for (let i = 0; i < 4; i++) {
      const on = i === m.idx % 4;
      circle(110 + i * 38, 690, 10, on ? C.yellow : 'rgba(11,10,15,.15)', C.ink, 3);
      circle(W - 110 - i * 38, 690, 10, on ? C.cyan : 'rgba(11,10,15,.15)', C.ink, 3);
    }

    drawText('CANDY COOKIE CHOCOLATE  /  PRODUCTION LINE 03', W / 2, 982, 14, {
      color: C.ink, stroke: null, lw: 0, shadow: 0, tracking: 5, alpha: 0.55
    });
    drawSticker('MADE\nWITH ♡', 1660, 600, 68, C.yellow, 0.12, {
      color: C.ink, size: 19, textStroke: false
    });
  }

  function dial(x, y, r, t) {
    circle(x, y, r, C.cream, C.ink, 7);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 0.35);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -r * 0.65);
    ctx.strokeStyle = C.pink;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
    circle(x, y, 8, C.ink);
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU;
      circle(x + Math.cos(a) * r * 0.82, y + Math.sin(a) * r * 0.82, 3, C.ink);
    }
  }

  // ---------------------------------------------------------------- build up

  function build(cue, next, m, lt, t) {
    const look = LOOKS[cue.look] || LOOKS.red;
    const v = cue.variant || 0;
    clear(look);

    const speed = 0.7 + m.smoothEnergy * 1.6 + lt * 0.22;
    for (let k = 0; k < 18; k++) {
      const z = mod(k / 18 + lt * speed, 1);
      const r = 30 + Math.pow(z, 2.7) * 1750;
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, r, 0, TAU);
      ctx.strokeStyle = k % 2 ? look.a : look.ink;
      ctx.globalAlpha = (1 - z) * 0.85;
      ctx.lineWidth = 2 + z * 20;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(t * (0.35 + v * 0.1));
    for (let i = 0; i < 18; i++) {
      const a = i / 18 * TAU;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 160, Math.sin(a) * 160);
      ctx.lineTo(Math.cos(a) * 1250, Math.sin(a) * 1250);
      ctx.strokeStyle = look.ink;
      ctx.globalAlpha = 0.12;
      ctx.lineWidth = 9;
      ctx.stroke();
    }
    ctx.restore();

    speedLines(W / 2, H / 2, t * 1.4, 32, look.ink, 0.35);

    const remain = Math.max(0, (next.t || t + 4) - t);
    const beatsLeft = Math.ceil(remain / m.beatDur);
    let label = 'READY?';
    if (beatsLeft <= 3 && beatsLeft > 0) label = String(beatsLeft);
    if (remain < 0.12) label = 'GO!';
    const size = fitSize(label, 430, 1500, false, -4);
    const sc = 1 + m.pulse * 0.08;
    drawText(label, W / 2, H / 2 - 10, size, {
      color: [C.cream, look.a, look.b],
      stroke: C.ink,
      lw: size * 0.065,
      shadow: size * 0.045,
      rot: -0.03 + Math.sin(t * 2) * 0.025,
      sx: sc,
      sy: sc,
      tracking: -4
    });

    drawText('CANDY COOKIE CHOCOLATE', W / 2, 90, 20, {
      color: look.ink, stroke: null, lw: 0, shadow: 0, tracking: 8, alpha: 0.65
    });
    drawText('TURN IT UP  /  HERE IT COMES', W / 2, H - 88, 14, {
      color: look.ink, stroke: null, lw: 0, shadow: 0, tracking: 6, alpha: 0.58
    });

    // countdown ticks
    for (let i = 0; i < 4; i++) {
      const on = i >= 4 - Math.min(4, beatsLeft);
      circle(W / 2 - 90 + i * 60, H - 170, on ? 11 : 7, on ? C.cream : look.ink, C.ink, 3);
    }

    // final flash
    const flash = clamp(1 - remain / 0.32, 0, 0.85);
    if (flash > 0) {
      ctx.fillStyle = 'rgba(255,255,255,' + flash + ')';
      ctx.fillRect(0, 0, W, H);
    }

    // sparks
    for (let i = 0; i < 24; i++) {
      const a = hash(i * 4.4) * TAU;
      const d = mod(lt * (300 + hash(i) * 600) + hash(i + 2) * 900, 1000);
      drawSparkle(W / 2 + Math.cos(a) * d, H / 2 + Math.sin(a) * d, 4 + hash(i) * 10, i % 2 ? look.a : look.b, t + i, 0.65);
    }
  }

  // ---------------------------------------------------------------- melt

  function melt(cue, next, m, lt, t) {
    const look = LOOKS.choco;
    clear(look);

    const g = ctx.createRadialGradient(W / 2, 520, 0, W / 2, 520, 800);
    g.addColorStop(0, 'rgba(255,242,215,.12)');
    g.addColorStop(0.5, 'rgba(255,242,215,.03)');
    g.addColorStop(1, 'rgba(255,242,215,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // dark waves
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 40) {
        const y = H - 160 - k * 48 + Math.sin(x * 0.006 + t * 0.6 + k) * 26;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = k === 0 ? C.cocoa : k === 1 ? C.choco2 : C.choco;
      ctx.globalAlpha = 0.55;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // giant word
    const size = fitSize('MELT', 380, 1450, false, -8);
    drawText('MELT', W / 2, 456, size, {
      color: C.cream,
      stroke: C.ink,
      lw: size * 0.052,
      shadow: size * 0.04,
      rot: -0.035,
      tracking: -size * 0.02
    });

    drawText('とろける', 1640, 482, 52, {
      color: C.cream, stroke: C.ink, lw: 4, jp: true, rot: Math.PI / 2, shadow: 3
    });

    // drips from the word
    const dripRng = rng(77);
    for (let i = 0; i < 17; i++) {
      const x = W / 2 - 540 + i * 66 + (dripRng() - 0.5) * 24;
      const base = 690 + dripRng() * 40;
      const len = 36 + dripRng() * 170 + Math.sin(t * 1.7 + i) * 24 + m.pulse * 26;
      const w = 18 + dripRng() * 28;
      fillRR(x - w / 2, base, w, len, w / 2, C.cream, C.ink, 4);
      circle(x, base + len, w * 0.62, C.cream, C.ink, 4);
      if (i % 3 === 0) {
        const drop = mod(t * 90 + i * 37, 240);
        circle(x, base + len + 20 + drop, 7 + dripRng() * 7, C.cream, C.ink, 3);
      }
    }

    // puddle
    ctx.beginPath();
    ctx.moveTo(420, 1040);
    ctx.bezierCurveTo(520, 920, 760, 954, 900, 1000);
    ctx.bezierCurveTo(1080, 1060, 1320, 940, 1500, 1030);
    ctx.lineTo(1500, 1080);
    ctx.lineTo(420, 1080);
    ctx.closePath();
    ctx.fillStyle = C.cream;
    ctx.fill();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 7;
    ctx.stroke();

    drawText('WHITE CHOCOLATE  /  MELT DOWN', W / 2, 950, 15, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, tracking: 7, alpha: 0.48
    });

    // melting bar
    ctx.save();
    ctx.translate(280, 862);
    ctx.rotate(-0.1);
    drawChocoBar(0, 0, 240, 124, 0, m.pulse, { foil: C.pink });
    ctx.restore();

    // steam curls
    ctx.save();
    ctx.strokeStyle = 'rgba(255,242,215,.22)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      const x = 780 + i * 100;
      ctx.beginPath();
      for (let k = 0; k <= 16; k++) {
        const yy = 860 - k * 24;
        const xx = x + Math.sin(k * 0.6 + t * 1.2 + i) * 20;
        if (k === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
    }
    ctx.restore();

    drawText('CANDY COOKIE CHOCOLATE', W / 2, 72, 16, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, tracking: 7, alpha: 0.4
    });
  }

  // ---------------------------------------------------------------- glitch

  function glitch(cue, next, m, lt, t) {
    const look = LOOKS.glitch;
    const v = cue.variant || 0;
    clear(look);
    halftone(0, 0, W, H, C.cream, 0.04);

    const q = Math.floor(t * 18);
    const intensity = 0.5 + m.pulse * 0.9 + (v ? 0.25 : 0);
    const word = cue.word || (v ? 'CHOCO' : 'CANDY');
    const jp = /[ぁ-んァ-ヶ一-龠]/.test(word);
    const size = fitSize(word, 430, 1580, jp, -6);
    const baseY = H / 2 + 12;

    // ghost layers
    ctx.save();
    ctx.globalAlpha = 0.55;
    drawText(word, W / 2 - 20 * intensity, baseY, size, {
      color: C.cyan, stroke: null, lw: 0, shadow: 0, rot: -0.02, jp
    });
    drawText(word, W / 2 + 20 * intensity, baseY, size, {
      color: C.pink, stroke: null, lw: 0, shadow: 0, rot: -0.02, jp
    });
    ctx.restore();

    // sliced main word
    const top = baseY - size * 0.62;
    const bottom = baseY + size * 0.62;
    const bands = 14;
    for (let i = 0; i < bands; i++) {
      const y0 = top + i * (bottom - top) / bands;
      const y1 = y0 + (bottom - top) / bands + 1;
      const dx = (hash(i * 7.3 + q) - 0.5) * intensity * 70;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, y0, W, y1 - y0);
      ctx.clip();
      drawText(word, W / 2 + dx, baseY, size, {
        color: [C.cream, look.a, C.cream, look.b],
        stroke: C.ink,
        lw: size * 0.055,
        shadow: 0,
        rot: -0.02,
        jp
      });
      ctx.restore();
    }

    // tears
    for (let i = 0; i < 3; i++) {
      const y = H * 0.2 + hash(q + i * 3.1) * H * 0.6;
      const h = 4 + hash(q + i) * 18;
      ctx.fillStyle = i % 2 ? look.a : look.b;
      ctx.globalAlpha = 0.65;
      ctx.fillRect(0, y, W, h);
      ctx.globalAlpha = 1;
    }

    // pixels
    for (let i = 0; i < 26; i++) {
      const x = hash(q + i * 4.1) * W;
      const y = hash(q + i * 6.3 + 2) * H;
      const w = 10 + hash(i + q) * 90;
      const h = 4 + hash(i * 2 + q) * 26;
      ctx.fillStyle = [look.a, look.b, C.cream, C.ink][i % 4];
      ctx.globalAlpha = 0.25 + hash(i) * 0.45;
      ctx.fillRect(x, y, w, h);
      ctx.globalAlpha = 1;
    }

    // warning stripes
    diagonalStripes(0, 64, C.yellow, C.ink, 40, t * 80);
    diagonalStripes(H - 64, 64, C.yellow, C.ink, 40, -t * 80);

    drawText('SIGNAL LOST', 76, 140, 18, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, align: 'left', tracking: 6, alpha: 0.75
    });
    drawText('CANDY.EXE', W - 76, 140, 18, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, align: 'right', tracking: 6, alpha: 0.75
    });
    drawText('SWEET ERROR  /  PLEASE REBOOT YOUR SWEET TOOTH', W / 2, H - 104, 13, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, tracking: 5, alpha: 0.5
    });

    // crosshair
    ctx.save();
    ctx.strokeStyle = 'rgba(255,242,215,.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 40, H / 2);
    ctx.lineTo(W / 2 + 40, H / 2);
    ctx.moveTo(W / 2, H / 2 - 40);
    ctx.lineTo(W / 2, H / 2 + 40);
    ctx.stroke();
    ctx.restore();

    drawSticker('ERROR', 1650, 760, 82, C.pink, 0.1, {
      color: C.cream, size: 24, textStroke: false
    });
  }

  window.SCENES.conveyor = conveyor;
  window.SCENES.build = build;
  window.SCENES.melt = melt;
  window.SCENES.glitch = glitch;
})();
