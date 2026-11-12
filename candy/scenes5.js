/* Scene library part 5 — lyric-driven scenes */
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
  const LYR = window.CANDY_LYRICS;

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

  function poly(points, fill, stroke, lw) {
    ctx.beginPath();
    points.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke && lw) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); }
  }

  // ---------------------------------------------------------------- dango tower

  function dangoBall(x, y, r, fill, face, active, t) {
    const pop = 1 + active * 0.06;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(pop, pop);

    // aura
    if (active > 0.02) {
      ctx.globalAlpha = 0.2 * active;
      circle(0, 0, r + 34 + Math.sin(t * 3) * 8, null, fill, 14);
      ctx.globalAlpha = 1;
    }

    // body
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.015, r * 0.935, 0, 0, TAU);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 10;
    ctx.stroke();

    // shine / shade
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.0, r * 0.92, 0, 0, TAU);
    ctx.clip();
    ctx.globalAlpha = 0.28;
    circle(-r * 0.34, -r * 0.38, r * 0.46, C.white);
    ctx.globalAlpha = 0.12;
    circle(r * 0.34, r * 0.36, r * 0.62, C.ink);
    ctx.restore();

    if (face) {
      // eyes
      const ex = r * 0.27;
      const ey = -r * 0.04;
      ctx.beginPath();
      ctx.ellipse(-ex, ey, r * 0.055, r * 0.085, -0.05, 0, TAU);
      ctx.ellipse(ex, ey, r * 0.055, r * 0.085, 0.05, 0, TAU);
      ctx.fillStyle = C.ink;
      ctx.fill();
      circle(-ex - r * 0.012, ey - r * 0.028, r * 0.018, C.white);
      circle(ex - r * 0.012, ey - r * 0.028, r * 0.018, C.white);

      // blush
      ctx.globalAlpha = 0.38;
      ctx.beginPath();
      ctx.ellipse(-r * 0.42, r * 0.15, r * 0.12, r * 0.055, -0.1, 0, TAU);
      ctx.ellipse(r * 0.42, r * 0.15, r * 0.12, r * 0.055, 0.1, 0, TAU);
      ctx.fillStyle = C.pink;
      ctx.fill();
      ctx.globalAlpha = 1;

      // mouth
      ctx.beginPath();
      if (active > 0.5) {
        ctx.arc(0, r * 0.12, r * 0.13, 0.08 * Math.PI, 0.92 * Math.PI);
      } else {
        ctx.moveTo(-r * 0.09, r * 0.17);
        ctx.quadraticCurveTo(0, r * 0.23, r * 0.09, r * 0.17);
      }
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    ctx.restore();
  }

  function layer(cue, next, m, lt, t) {
    const look = LOOKS.cream;
    clear(look);

    radialBurst(W / 2, 480, 1700, [C.pink, C.yellow, C.cyan, C.cream], -t * 0.015, 0.2, 30);
    halftone(0, 0, W, 150, C.ink, 0.1);
    checker(0, H - 78, W, 78, 52, C.ink, C.pink, t * 16, 0, 0.6);

    const cx = W / 2 + 40;
    const ys = [270, 490, 710];
    const r = 126;
    const phase = t < 26.51 ? 0 : t < 29.29 ? 1 : t < 31.92 ? 2 : 3;
    const focus = [0, 1, 2, 0][phase];
    const bits = [
      { jp: '上', en: 'TOP', note: '困難', color: C.pink, face: true },
      { jp: '中', en: 'MIDDLE', note: 'ジーザス', color: C.cream, face: true },
      { jp: '下', en: 'BOTTOM', note: '散々', color: C.mint, face: true }
    ];

    // skewer
    fillRR(cx - 11, 112, 22, 792, 11, C.paper, C.ink, 6);
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 2;
    for (let y = 170; y < 880; y += 96) {
      ctx.beginPath();
      ctx.moveTo(cx - 8, y);
      ctx.lineTo(cx + 8, y);
      ctx.stroke();
    }
    ctx.restore();

    // the three dango
    for (let i = 0; i < 3; i++) {
      const act = smooth(clamp(1 - Math.abs(focus - i) * 0.9, 0, 1));
      dangoBall(cx, ys[i], r, bits[i].color, bits[i].face, act, t);
    }

    // active-ball effects
    if (phase === 0) {
      // top is trouble: sweat + warning
      for (let i = 0; i < 3; i++) {
        const k = mod(lt * 1.4 + i * 0.33, 1);
        ctx.globalAlpha = 1 - k;
        drawSparkle(cx + 108 + i * 18, ys[0] - 54 + k * 54, 7, C.cyan, 0, 0.9);
      }
      ctx.globalAlpha = 1;
      drawSticker('!!', cx + 188, ys[0] - 82, 58, C.red, 0.12, {
        color: C.cream, size: 34, textStroke: false
      });
    } else if (phase === 1) {
      // bottom is scattered: cracks + crumbs
      ctx.save();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        const a = -0.8 + i * 0.55;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 70, ys[2] + Math.sin(a) * 56);
        ctx.lineTo(cx + Math.cos(a + 0.18) * 108, ys[2] + Math.sin(a + 0.18) * 90);
        ctx.stroke();
      }
      ctx.restore();
      for (let i = 0; i < 9; i++) {
        const k = mod(lt * 0.7 + hash(i) * 0.9, 1);
        ctx.globalAlpha = 1 - k;
        ctx.fillStyle = i % 2 ? C.mint : C.pink;
        ctx.save();
        ctx.translate(cx - 80 + hash(i * 3.1) * 160, ys[2] + 80 + k * 100);
        ctx.rotate(k * 4 + i);
        ctx.fillRect(-7, -5, 14, 10);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    } else if (phase === 2) {
      // middle is holy: halo + rays
      const halo = 210 + Math.sin(t * 2.4) * 10;
      ctx.save();
      ctx.globalAlpha = 0.3;
      for (let i = 0; i < 18; i++) {
        const a = i / 18 * TAU + t * 0.18;
        ctx.beginPath();
        ctx.moveTo(W / 2 + Math.cos(a) * 168, ys[1] + Math.sin(a) * 150);
        ctx.lineTo(W / 2 + Math.cos(a) * halo, ys[1] + Math.sin(a) * (halo * 0.86));
        ctx.strokeStyle = C.yellow;
        ctx.lineWidth = 8;
        ctx.stroke();
      }
      ctx.restore();
      circle(W / 2, ys[1], r + 34, null, C.yellow, 10);
    } else {
      // someone took a bite
      ctx.save();
      ctx.translate(cx + 96, ys[0] - 44);
      ctx.rotate(-0.5);
      ctx.beginPath();
      ctx.arc(0, 0, 58, 0, TAU);
      ctx.fillStyle = C.cream;
      ctx.fill();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 5;
      ctx.setLineDash([7, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      for (let i = 0; i < 7; i++) {
        const k = mod(lt * 0.55 + i * 0.18, 1);
        ctx.globalAlpha = 1 - k;
        ctx.fillStyle = i % 2 ? C.pink : C.cookie;
        ctx.save();
        ctx.translate(cx + 108 + hash(i) * 80, ys[0] - 100 + k * 120);
        ctx.rotate(k * 3 + i);
        ctx.fillRect(-6, -4, 12, 8);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      drawText('BITE!', cx + 196, ys[0] - 128, 24, {
        color: C.red, stroke: C.cream, lw: 3, shadow: 2, rot: 0.15
      });
    }

    // left number tabs
    for (let i = 0; i < 3; i++) {
      const act = smooth(clamp(1 - Math.abs(focus - i) * 0.9, 0, 1));
      const y = ys[i];
      drawText('0' + (i + 1), 180, y - 48, 15, {
        color: C.ink, stroke: null, lw: 0, shadow: 0, alpha: 0.38
      });
      fillRR(150, y - 26, 110, 62, 18, act > 0.5 ? C.pink : C.paper, C.ink, 5);
      drawText(bits[i].jp, 205, y + 4, 36, {
        color: act > 0.5 ? C.cream : C.ink, stroke: null, lw: 0, shadow: 0, jp: true
      });
      drawText(bits[i].en, 150, y + 58, 11, {
        color: C.ink, stroke: null, lw: 0, shadow: 0, align: 'left', tracking: 3,
        alpha: 0.35 + act * 0.5
      });
    }

    // right-hand note for the active layer
    const note = ['困難', '散々', 'ジーザス', '団子'][phase];
    const noteEn = ['TROUBLE', 'TERRIBLE', 'JESUS', 'DANGO'][phase];
    drawText(note, 1658, 480, 72, {
      color: C.cream, stroke: C.ink, lw: 7, shadow: 6, jp: true, rot: Math.PI / 2
    });
    drawText(noteEn, 1736, 480, 14, {
      color: C.ink, stroke: null, lw: 0, shadow: 0, rot: Math.PI / 2, tracking: 5, alpha: 0.55
    });

    // header / footer
    drawText('DANGO CAM', 78, 86, 17, {
      color: C.ink, stroke: null, lw: 0, shadow: 0, align: 'left', tracking: 6, alpha: 0.55
    });
    drawText('3 LAYERS  /  SWEET LOGIC', W - 78, 86, 13, {
      color: C.ink, stroke: null, lw: 0, shadow: 0, align: 'right', tracking: 4, alpha: 0.45
    });

    for (let i = 0; i < 12; i++) {
      const x = hash(i * 3.7) * W;
      const y = 100 + hash(i * 6.1) * 740;
      if (x > 700 && x < 1220) continue;
      drawSparkle(x, y, 3 + hash(i) * 6, i % 2 ? C.pink : C.cyan, t * 0.5 + i, 0.25 + 0.35 * Math.abs(Math.sin(t * 2 + i)));
    }
  }

  // ---------------------------------------------------------------- inside the pack

  function inside(cue, next, m, lt, t) {
    const look = LOOKS.yellow;
    clear(look);

    radialBurst(W / 2, 560, 1700, [C.cream, C.pink, C.yellow, C.orange], t * 0.02, 0.22, 32);
    halftone(0, 0, W, 150, C.ink, 0.1);
    halftone(0, H - 160, W, 160, C.ink, 0.08);

    // floor shadow
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.ellipse(W / 2, 928, 520, 58, 0, 0, TAU);
    ctx.fillStyle = C.ink;
    ctx.fill();
    ctx.restore();

    // open lid
    ctx.save();
    ctx.translate(0, Math.sin(t * 1.2) * 4);
    poly([[552, 468], [1368, 468], [1472, 322], [628, 322]], C.pink, C.ink, 10);
    poly([[612, 456], [1338, 456], [1420, 348], [660, 348]], C.cream, C.ink, 3);
    drawText('CANDY', 1040, 398, 74, {
      color: C.pink, stroke: C.ink, lw: 6, shadow: 4, rot: -0.06, tracking: -2
    });
    drawText('COOKIE  ·  CHOCOLATE', 1040, 446, 15, {
      color: C.ink, stroke: null, lw: 0, shadow: 0, rot: -0.06, tracking: 4
    });
    ctx.restore();

    // box body
    poly([[552, 468], [1368, 468], [1452, 918], [468, 918]], C.paper, C.ink, 11);
    poly([[620, 500], [1300, 500], [1342, 762], [558, 762]], C.cocoa, C.ink, 7);

    // mystery interior
    ctx.save();
    poly([[620, 500], [1300, 500], [1342, 762], [558, 762]], null, null, 0);
    ctx.clip();
    for (let i = 0; i < 11; i++) {
      const qx = 610 + hash(i * 3.1) * 700;
      const qy = 530 + mod(hash(i * 5.7) * 260 + lt * (16 + hash(i) * 22), 240);
      const qs = 44 + hash(i) * 70;
      ctx.save();
      ctx.globalAlpha = 0.55 + 0.35 * hash(i);
      drawText('?', qx, qy, qs, {
        color: [C.pink, C.cyan, C.yellow, C.cream][i % 4],
        stroke: C.ink, lw: 5, shadow: 3, rot: (hash(i * 4.3) - 0.5) * 0.35
      });
      ctx.restore();
    }
    // a giant question mark rising out
    const rise = clamp((lt - 2.6) / 1.5, 0, 1);
    if (rise > 0) {
      ctx.globalAlpha = rise;
      drawText('?', W / 2, lerp(690, 560, easeOutCubic(rise)), 250, {
        color: C.cream, stroke: C.ink, lw: 10, shadow: 7, rot: -0.1
      });
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    // front panel
    poly([[558, 762], [1342, 762], [1452, 918], [468, 918]], C.paper, C.ink, 10);
    ctx.save();
    ctx.beginPath();
    ctx.rect(490, 786, 940, 118);
    ctx.clip();
    halftone(490, 786, 940, 118, C.pink, 0.1);
    ctx.restore();
    drawText("WHAT'S INSIDE?", 950, 814, 42, {
      color: C.ink, stroke: null, lw: 0, shadow: 0, tracking: 2
    });

    // side seams
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(620, 500);
    ctx.lineTo(558, 762);
    ctx.lineTo(468, 918);
    ctx.moveTo(1300, 500);
    ctx.lineTo(1342, 762);
    ctx.lineTo(1452, 918);
    ctx.stroke();
    ctx.restore();

    // floating sweets escaping
    const bits = [
      [380, 690, -0.2, 'lolli'], [1540, 700, 0.2, 'cookie'], [1600, 550, -0.1, 'choco'],
      [320, 520, 0.25, 'wrapped']
    ];
    bits.forEach((b, i) => {
      const y = b[1] + Math.sin(t * 1.4 + i * 1.7) * 12;
      ctx.save();
      ctx.translate(b[0], y);
      ctx.rotate(b[2] + Math.sin(t + i) * 0.05);
      if (b[3] === 'lolli') lollipop(0, 0, 64, 0, t * 2, C.pink);
      else if (b[3] === 'cookie') drawCookie(0, 0, 58, 0, 0, { body: C.cookie, dark: C.cookieDark });
      else if (b[3] === 'choco') drawChocoBar(0, 0, 180, 90, 0, 0, { foil: C.cyan });
      else wrappedCandy(0, 0, 52, 0, C.cyan);
      ctx.restore();
    });

    // flashlight cone
    ctx.save();
    ctx.globalAlpha = 0.1 + m.pulse * 0.04;
    poly([[236, 96], [520, 96], [1040, 780], [470, 780]], C.cream, null, 0);
    ctx.restore();

    drawText('OPEN IT?', 78, 86, 17, {
      color: C.ink, stroke: null, lw: 0, shadow: 0, align: 'left', tracking: 6, alpha: 0.55
    });
    drawText('DO NOT SHAKE', W - 78, 86, 13, {
      color: C.ink, stroke: null, lw: 0, shadow: 0, align: 'right', tracking: 4, alpha: 0.45
    });
  }

  // ---------------------------------------------------------------- binary / vitality

  function binary(cue, next, m, lt, t) {
    const look = LOOKS.night;
    clear(look);

    // split field
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(W * 0.54, 0);
    ctx.lineTo(W, 0);
    ctx.lineTo(W, H);
    ctx.lineTo(W * 0.46, H);
    ctx.closePath();
    ctx.fillStyle = C.cream;
    ctx.fill();
    ctx.restore();

    halftone(0, 0, W * 0.55, H, C.cream, 0.05);
    halftone(W * 0.45, 0, W * 0.55, H, C.ink, 0.06);

    // digital rain
    const r = rng(31);
    for (let col = 0; col < 12; col++) {
      const left = col < 6;
      const x = left ? 80 + col * 118 : W - 80 - (col - 6) * 118;
      const speed = 60 + r() * 120;
      const offset = r() * H;
      ctx.save();
      ctx.globalAlpha = 0.22;
      for (let k = 0; k < 9; k++) {
        const y = mod(offset + k * 66 + lt * speed, H + 120) - 60;
        const ch = r() < 0.5 ? '0' : '1';
        drawText(ch, x, y, 24 + (k % 3) * 5, {
          color: left ? C.cyan : C.pink,
          stroke: null, lw: 0, shadow: 0, alpha: 0.7
        });
      }
      ctx.restore();
    }

    // heartbeat trace
    ctx.save();
    ctx.strokeStyle = C.pink;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let x = 120; x <= W - 120; x += 12) {
      const k = (x - 120) / (W - 240);
      const beat = Math.pow(Math.max(0, Math.sin(k * TAU * 5 - t * 5)), 12);
      const y = 540 + Math.sin(k * TAU * 2) * 8 - beat * 48;
      if (x === 120) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();

    // main words
    drawText('BINARY', W / 2, 218, 190, {
      color: C.cyan, stroke: C.ink, lw: 11, shadow: 9, rot: -0.035, tracking: -4
    });
    drawText('VITALITY', W / 2, 748, 180, {
      color: C.pink, stroke: C.ink, lw: 11, shadow: 9, rot: 0.025, tracking: -4
    });

    // greater-than sign
    const sc = 1 + m.pulse * 0.06;
    drawText('>', W / 2, 520, 300, {
      color: [C.yellow, C.cream, C.cyan],
      stroke: C.ink, lw: 12, shadow: 8, rot: -0.02, sx: sc, sy: sc
    });

    // candy heart on the right side
    drawHeart(1590, 520, 62 + m.pulse * 8, C.pink, C.ink, 6, 0.08);

    // labels
    drawText('01000011 01000011 01000011', 78, 118, 12, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, align: 'left', tracking: 4, alpha: 0.6
    });
    drawText('SYSTEM: SWEET  /  LIMIT: NONE', 78, 86, 14, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, align: 'left', tracking: 5, alpha: 0.55
    });
    drawText('0 1 0 1 0 1 0 1', W - 78, 86, 13, {
      color: C.ink, stroke: null, lw: 0, shadow: 0, align: 'right', tracking: 3, alpha: 0.45
    });

    // floating candy
    lollipop(210, 330, 64, -0.2, t * 2, C.pink);
    wrappedCandy(1700, 300, 44, 0.2, C.cyan);
    drawCookie(1730, 780, 54, 0.1, 0, { body: C.cookie, dark: C.cookieDark });
  }

  // ---------------------------------------------------------------- secret C

  function secret(cue, next, m, lt, t) {
    const look = LOOKS.night;
    clear(look);

    // soft stage light
    const g = ctx.createRadialGradient(W / 2, 470, 0, W / 2, 470, 850);
    g.addColorStop(0, 'rgba(255,61,139,.18)');
    g.addColorStop(0.55, 'rgba(255,61,139,.05)');
    g.addColorStop(1, 'rgba(255,61,139,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    halftone(0, 0, W, H, C.cream, 0.045);

    // floating letter field
    const letters = 'CANDYCOOKIECHOCOLATE';
    for (let i = 0; i < 34; i++) {
      const x = hash(i * 4.7) * W;
      const y = 120 + hash(i * 6.9) * 760;
      const s = 22 + hash(i * 2.3) * 54;
      const a = 0.08 + hash(i * 3.1) * 0.12;
      drawText(letters[i % letters.length], x, y + Math.sin(t * 0.5 + i) * 10, s, {
        color: C.cream, stroke: null, lw: 0, shadow: 0, alpha: a, rot: (hash(i) - 0.5) * 0.4
      });
    }

    // sweets
    lollipop(280, 750, 76, -0.2, t * 1.8, C.pink);
    drawCookie(420, 300, 62, 0.1, 0, { body: C.cookie, dark: C.cookieDark });
    wrappedCandy(1650, 760, 54, 0.2, C.cyan);
    drawChocoBar(1580, 300, 190, 92, -0.1, 0, { foil: C.yellow });

    // spotlight sweep
    const sx = W / 2 + Math.cos(t * 0.62) * 560;
    const sy = 500 + Math.sin(t * 0.83 + 1.2) * 210;
    const ctxD = Math.hypot(sx - 1360, sy - 470);
    const lit = clamp(1 - ctxD / 420, 0, 1);
    const found = clamp((lt - 2.2) / 0.5, 0, 1);

    // the hidden C
    ctx.save();
    ctx.globalAlpha = 0.18 + lit * 0.82 + found * 0.2;
    drawText('C', 1360, 470, 430, {
      color: C.cream, stroke: C.pink, lw: 16, shadow: 10, rot: -0.05
    });
    ctx.restore();

    // glow ring around C
    ctx.save();
    ctx.globalAlpha = 0.2 + lit * 0.5 + found * 0.3;
    circle(1360, 470, 250 + Math.sin(t * 2) * 10, null, C.pink, 5);
    circle(1360, 470, 292, null, C.pink, 2);
    ctx.restore();

    // magnifier
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(-0.35);
    ctx.globalAlpha = 0.32;
    circle(0, 0, 170, 'rgba(255,242,215,.08)', C.cream, 12);
    ctx.globalAlpha = 0.85;
    circle(0, 0, 170, null, C.cream, 7);
    fillRR(104, -15, 160, 30, 15, C.pink, C.ink, 5);
    ctx.restore();

    // reveal sticker
    if (found > 0) {
      ctx.save();
      ctx.globalAlpha = found;
      drawSticker('FOUND\nIT!', 1600, 800, 96 + Math.sin(t * 4) * 5, C.yellow, 0.14, {
        color: C.ink, size: 30, textStroke: false
      });
      ctx.restore();
    }

    // captions
    drawText('SECRET C', 78, 86, 17, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, align: 'left', tracking: 6, alpha: 0.55
    });
    drawText('もうひとつのC', W - 78, 86, 15, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, align: 'right', tracking: 4, jp: true, alpha: 0.55
    });
    drawText('LOOK CLOSER  /  FIND THE C', W / 2, 960, 13, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, tracking: 6, alpha: 0.45
    });

    for (let i = 0; i < 14; i++) {
      const x = hash(i * 2.9) * W;
      const y = hash(i * 5.3) * H;
      drawSparkle(x, y, 3 + hash(i) * 7, i % 2 ? C.pink : C.cyan, t * 0.4 + i, 0.25 + 0.35 * Math.abs(Math.sin(t * 2 + i)));
    }
  }

  // ---------------------------------------------------------------- giant lyric hits

  function hit(cue, next, m, lt, t) {
    const look = LOOKS[cue.look] || LOOKS.pink;
    clear(look);

    const soon = LYR ? LYR.next(t + 0.02) : null;
    let e = LYR ? LYR.at(t) : null;
    if (soon && soon.t - t < 0.1) e = soon;
    if (!e && LYR) e = LYR.last(t);

    const word = e ? (e.big || e.jp || 'CANDY!') : 'CANDY!';
    const sub = e && e.sub ? e.sub : '';
    const ru = e && e.ru ? e.ru : '';
    const jp = /[ぁ-んァ-ヶ一-龠]/.test(word);
    const age = e ? Math.max(0, t - e.t) : 1;
    const k = easeOutCubic(clamp(age / 0.22, 0, 1));
    const size = fitSize(word, 430, 1580, jp, -6);
    const sc = lerp(1.32, 1, k) * (1 + m.pulse * 0.045);
    const rot = -0.025 + Math.sin(t * 1.2) * 0.012 + (1 - k) * 0.11;

    radialBurst(W / 2, H / 2, 1900, [look.a, look.b, look.c, look.bg, look.b], t * 0.08, 0.42, 40);
    speedLines(W / 2, H / 2, t, 26, look.ink, 0.28);

    // beat shockwaves
    for (let i = 0; i < 2; i++) {
      const z = mod(m.phase + i * 0.36, 1);
      const rr = 90 + z * 960;
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, rr, 0, TAU);
      ctx.strokeStyle = look.ink;
      ctx.globalAlpha = (1 - z) * 0.18;
      ctx.lineWidth = 18 * (1 - z) + 2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // entry impact rings
    if (age < 0.34) {
      const z = age / 0.34;
      for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, 160 + z * (720 + i * 180), 0, TAU);
        ctx.strokeStyle = i ? C.cream : look.a;
        ctx.globalAlpha = (1 - z) * 0.5;
        ctx.lineWidth = 10 * (1 - z) + 2;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    // small Japanese reading above
    if (sub) {
      drawText(sub, W / 2, 190, 30, {
        color: C.cream, stroke: C.ink, lw: 4, shadow: 3, jp: true, tracking: 4, alpha: 0.9
      });
    }

    // chromatic ghosts
    const split = 14 + m.impact * 26;
    ctx.save();
    ctx.globalAlpha = 0.6;
    drawText(word, W / 2 - split, H / 2, size, {
      color: C.cyan, stroke: null, lw: 0, shadow: 0, rot, sx: sc, sy: sc, jp
    });
    drawText(word, W / 2 + split, H / 2, size, {
      color: C.pink, stroke: null, lw: 0, shadow: 0, rot, sx: sc, sy: sc, jp
    });
    ctx.restore();

    // main word
    drawText(word, W / 2, H / 2, size, {
      color: [look.a, C.cream, look.b],
      stroke: C.ink,
      lw: size * 0.06,
      shadow: size * 0.04,
      rot,
      sx: sc,
      sy: sc,
      tracking: -size * 0.015,
      jp
    });

    // Russian meaning under the giant word
    if (ru) {
      const rs = fitSize(ru, 24, 1280, false, 0);
      drawText(ru, W / 2, 852, rs, {
        color: C.cream, stroke: C.ink, lw: 4, shadow: 3, tracking: 2, alpha: 0.95
      });
    }

    // checker strips
    checker(0, 0, W, 54, 54, C.ink, C.cream, t * 50, 0, 0.9);
    checker(0, H - 54, W, 54, 54, C.ink, C.cream, -t * 50, 0, 0.9);

    // flying sprinkles
    for (let i = 0; i < 54; i++) {
      const a = hash(i * 3.7 + 2) * TAU + t * (0.15 + hash(i) * 0.2);
      const d = mod(hash(i + 4) * 1800 + lt * (180 + hash(i) * 420), 1900);
      const x = W / 2 + Math.cos(a) * d;
      const y = H / 2 + Math.sin(a) * d * 0.72;
      if (x < -60 || x > W + 60 || y < -60 || y > H + 60) continue;
      const col = [look.a, look.b, look.c, C.cream, C.pink, C.yellow, C.cyan][i % 7];
      drawSprinkle(x, y, 12 + hash(i) * 22, 4 + hash(i + 1) * 6, a + t * (1 + hash(i) * 2), col, C.ink, 2);
    }

    // side labels
    drawText('CANDY COOKIE CHOCOLATE', 76, 132, 15, {
      color: C.cream, stroke: C.ink, lw: 3, shadow: 2, align: 'left', tracking: 5, alpha: 0.75
    });
    drawText((cue.label || 'HOOK') + '  /  ' + String((cue.variant || 0) + 1).padStart(2, '0'), W - 76, 132, 12, {
      color: C.cream, stroke: C.ink, lw: 2, shadow: 0, align: 'right', tracking: 4, alpha: 0.65
    });
  }

  window.SCENES.layer = layer;
  window.SCENES.inside = inside;
  window.SCENES.binary = binary;
  window.SCENES.secret = secret;
  window.SCENES.hit = hit;
})();
