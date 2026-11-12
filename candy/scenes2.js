/* Scene library part 2 */
window.SCENES = window.SCENES || {};
(() => {
  const MD = window.MD;
  const {
    W, H, TAU, C, LOOKS, clamp, lerp, mod, smooth, easeOutCubic, easeOutBack,
    hash, rng, pathRR, fillRR, circle, drawStar, drawHeart, drawSparkle,
    drawSprinkle, fitSize, drawText, halftone, checker, radialBurst,
    speedLines, checkerTunnel, lollipop, wrappedCandy, drawCookie,
    drawChocoBar, drawBarcode, drawSticker, circularText
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

  // ---------------------------------------------------------------- sweet loop

  function ring(cue, next, m, lt, t) {
    const look = LOOKS[cue.look] || LOOKS.pink;
    const v = cue.variant || 0;
    clear(look);

    // diagonal colour field
    ctx.save();
    ctx.globalAlpha = 0.32;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W, 0);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = look.b;
    ctx.fill();
    ctx.restore();

    halftone(0, 0, W, 190, look.ink, 0.12);
    halftone(0, H - 190, W, 190, look.ink, 0.12);

    const cx = W / 2;
    const cy = H / 2 + 10;
    const pulse = m.pulse;

    // radial tick ring
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.1);
    for (let i = 0; i < 48; i++) {
      const a = i / 48 * TAU;
      const r0 = 552;
      const r1 = i % 4 === 0 ? 584 : 568;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
      ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
      ctx.strokeStyle = look.ink;
      ctx.globalAlpha = i % 4 === 0 ? 0.42 : 0.18;
      ctx.lineWidth = i % 4 === 0 ? 5 : 2;
      ctx.stroke();
    }
    ctx.restore();

    // concentric rings
    const radii = [224, 306, 390, 474, 542];
    for (let i = 0; i < radii.length; i++) {
      circle(cx, cy, radii[i] + pulse * (8 + i * 4), null, i % 2 ? look.ink : look.a, 8 - i * 0.7);
    }

    circularText('CANDY · COOKIE · CHOCOLATE · SWEET · ', cx, cy, 342, 27, look.ink, null, 0, -t * 0.09, 2);

    // orbiting sweets
    for (let i = 0; i < 10; i++) {
      const a = t * 0.25 + i / 10 * TAU + v * 0.3;
      const r = 490 + Math.sin(t * 1.2 + i * 1.7) * 22;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      const k = 0.86 + Math.sin(t * 2 + i) * 0.12;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a + Math.PI / 2);
      ctx.scale(k, k);
      if (i % 3 === 0) drawStar(0, 0, 28, look.a, C.ink, 4, t + i, 5, 0.45);
      else if (i % 3 === 1) drawHeart(0, 0, 30, C.pink, C.ink, 4, 0.1);
      else wrappedCandy(0, 0, 36, 0.2, i % 2 ? C.yellow : C.cyan);
      ctx.restore();
    }

    // centre medallion
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1 + pulse * 0.045, 1 + pulse * 0.045);
    circle(0, 0, 158, C.cream, C.ink, 13);
    ctx.beginPath();
    ctx.arc(0, 0, 132, 0, TAU);
    ctx.setLineDash([6, 9]);
    ctx.strokeStyle = look.ink;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.45;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    drawText('CANDY', 0, -24, 60, {
      color: look.a, stroke: C.ink, lw: 5, shadow: 4, tracking: -2
    });
    drawText('SWEET', 0, 34, 29, {
      color: look.ink, stroke: null, lw: 0, shadow: 0, tracking: 4
    });
    drawText('LOOP', 0, 66, 11, {
      color: look.ink, stroke: null, lw: 0, shadow: 0, tracking: 3, alpha: 0.5
    });
    ctx.restore();

    fillRR(W / 2 - 196, 40, 392, 44, 22, C.cream, C.ink, 4);
    drawText('CANDY COOKIE CHOCOLATE', W / 2, 63, 16, {
      color: look.ink, stroke: null, lw: 0, shadow: 0, tracking: 7
    });
    fillRR(W / 2 - 118, H - 88, 236, 38, 19, C.cream, C.ink, 4);
    drawText('SWEET LOOP  /  ' + (v + 1) + '03', W / 2, H - 68, 12, {
      color: look.ink, stroke: null, lw: 0, shadow: 0, tracking: 5
    });

    if (cue.sale) {
      drawSticker('SALE!', 338, 306, 78, C.yellow, -0.14 + Math.sin(t * 1.6) * 0.04, {
        color: C.ink, size: 26, textStroke: false
      });
      const tag = (x, y, rot, label, col) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(-36, -58);
        ctx.stroke();
        fillRR(-82, -100, 180, 78, 14, C.cream, C.ink, 5);
        circle(-56, -62, 7, col, C.ink, 3);
        drawText(label, 10, -60, 30, {
          color: col, stroke: C.ink, lw: 3, shadow: 2
        });
        ctx.restore();
      };
      tag(1602, 742, 0.16, '¥100', C.pink);
      tag(318, 790, -0.18, '-50%', C.cyan);
    }

    lollipop(170, 864, 84, -0.26, t * 2.2, C.pink);
    lollipop(1750, 232, 70, 0.2, -t * 2.6, C.cyan);
  }

  // ---------------------------------------------------------------- sprinkle storm

  function storm(cue, next, m, lt, t) {
    const look = LOOKS[cue.look] || LOOKS.pink;
    clear(look);

    radialBurst(W / 2, H / 2, 1900, [look.a, look.b, look.c, look.bg, look.b], t * 0.09, 0.5, 40);
    speedLines(W / 2, H / 2, t, 26, look.ink, 0.28);

    // shockwaves on every beat
    for (let k = 0; k < 3; k++) {
      const z = mod(m.phase + k * 0.34, 1);
      const r = 80 + z * 1000;
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, r, 0, TAU);
      ctx.strokeStyle = look.ink;
      ctx.globalAlpha = (1 - z) * 0.22;
      ctx.lineWidth = 22 * (1 - z) + 3;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // flying candy
    const count = 130;
    for (let i = 0; i < count; i++) {
      const a = hash(i * 3.71 + 2) * TAU + t * (0.18 + hash(i) * 0.22);
      const speed = 190 + hash(i + 9) * 760;
      const d = mod(hash(i + 4) * 1900 + lt * speed, 2100);
      const x = W / 2 + Math.cos(a) * d;
      const y = H / 2 + Math.sin(a) * d * 0.78;
      if (x < -80 || x > W + 80 || y < -80 || y > H + 80) continue;
      const col = [look.a, look.b, look.c, C.cream, C.pink, C.yellow, C.cyan][i % 7];
      const rot = a + Math.PI / 2 + t * (1 + hash(i) * 2);
      if (i % 17 === 0) {
        drawStar(x, y, 14 + hash(i) * 14, col, C.ink, 3, rot, 5, 0.45);
      } else if (i % 23 === 0) {
        drawHeart(x, y, 13 + hash(i) * 12, col, C.ink, 3, rot);
      } else if (i % 29 === 0) {
        drawCookie(x, y, 20 + hash(i) * 12, rot, 0, { body: C.cookie, dark: C.cookieDark });
      } else {
        drawSprinkle(x, y, 14 + hash(i) * 26, 5 + hash(i + 1) * 7, rot, col, C.ink, 2);
      }
    }

    // giant word with chromatic split
    const word = cue.word || 'CANDY!';
    const size = fitSize(word, 430, 1620, false, -6);
    const sc = 1 + m.pulse * 0.05;
    const rot = -0.025 + Math.sin(t * 1.1) * 0.012;

    ctx.save();
    ctx.globalAlpha = 0.65;
    drawText(word, W / 2 - 20, H / 2, size, {
      color: C.cyan, stroke: null, lw: 0, shadow: 0, rot, sx: sc, sy: sc
    });
    drawText(word, W / 2 + 20, H / 2, size, {
      color: C.pink, stroke: null, lw: 0, shadow: 0, rot, sx: sc, sy: sc
    });
    ctx.restore();

    drawText(word, W / 2, H / 2, size, {
      color: look.pop.length > 2 ? [look.a, C.cream, look.b] : C.cream,
      stroke: C.ink,
      lw: size * 0.06,
      shadow: size * 0.04,
      rot,
      sx: sc,
      sy: sc,
      tracking: -size * 0.015
    });

    drawText('CANDY COOKIE CHOCOLATE', W / 2, 84, 20, {
      color: C.cream, stroke: C.ink, lw: 3, shadow: 0, tracking: 8, alpha: 0.9
    });

    // checker strips
    checker(0, 0, W, 54, 54, C.ink, C.cream, t * 50, 0, 0.9);
    checker(0, H - 54, W, 54, 54, C.ink, C.cream, -t * 50, 0, 0.9);

    drawSticker('100%\nSUGAR', 1646, 214, 98, look.c, -0.12 + Math.sin(t) * 0.03, {
      color: onColor(look.c), size: 28, textStroke: false
    });
    drawSticker('!!', 266, 832, 82, C.cream, 0.16, {
      color: C.pink, size: 50, textStroke: false
    });

    drawText('SWEET EXPLOSION  /  TURN IT UP', W / 2, H - 92, 13, {
      color: C.cream, stroke: C.ink, lw: 2, shadow: 0, tracking: 5, alpha: 0.85
    });
  }

  // ---------------------------------------------------------------- checker wall

  function wall(cue, next, m, lt, t) {
    const look = LOOKS[cue.look] || LOOKS.cyan;
    const v = cue.variant || 0;
    clear(look);

    checkerTunnel(W / 2, H / 2, t * (0.55 + m.smoothEnergy * 0.8), [look.a, look.b, look.c, look.bg], look.ink, 0.3);
    halftone(0, 0, W, 160, look.ink, 0.1);

    const lines = [
      { word: 'CANDY', y: 306, size: 244, color: look.a },
      { word: 'COOKIE', y: 512, size: 244, color: look.b },
      { word: 'CHOCOLATE', y: 700, size: 144, color: look.c }
    ];

    // backdrop plate
    ctx.save();
    ctx.translate(W / 2, 510);
    ctx.rotate(v % 2 ? 0.035 : -0.035);
    ctx.globalAlpha = 0.18;
    fillRR(-810, -330, 1620, 740, 46, C.ink, null, 0);
    ctx.restore();

    lines.forEach((line, i) => {
      const k = clamp((lt - i * 0.05) / 0.32, 0, 1);
      const sc = (0.74 + 0.26 * easeOutBack(k)) * (1 + m.pulse * 0.022);
      drawText(line.word, W / 2, line.y, line.size, {
        color: line.color,
        stroke: C.ink,
        lw: line.size * 0.05,
        shadow: line.size * 0.038,
        rot: (i % 2 ? 0.025 : -0.03) + (1 - k) * (i % 2 ? 0.1 : -0.1),
        sx: sc,
        sy: sc,
        tracking: -line.size * 0.016
      });
    });

    drawText('CANDY  COOKIE  CHOCOLATE  CANDY  COOKIE  CHOCOLATE', W / 2, 838, 17, {
      color: look.ink, stroke: null, lw: 0, shadow: 0, tracking: 5, alpha: 0.55
    });

    drawSticker('NEW!\nFLAVOR', 1602, 262, 104, C.green, 0.15, {
      color: C.ink, size: 29, textStroke: false
    });
    drawSticker('100%', 312, 824, 82, C.cream, -0.16, {
      color: C.pink, size: 28, textStroke: false
    });

    // side vertical marquee
    ctx.save();
    ctx.translate(66, H / 2);
    ctx.rotate(-Math.PI / 2);
    drawText('CANDY · COOKIE · CHOCOLATE · SWEET · ', 0, 0, 16, {
      color: look.ink, stroke: null, lw: 0, shadow: 0, tracking: 6, alpha: 0.55
    });
    ctx.restore();

    lollipop(152, 226, 78, -0.2, t * 2.2, C.pink);
    wrappedCandy(1782, 856, 66, 0.25, C.yellow);

    // top / bottom checker
    checker(0, 0, W, 44, 44, C.ink, C.cream, t * 40, 0, 0.75);
    checker(0, H - 44, W, 44, 44, C.ink, C.cream, -t * 40, 0, 0.75);
  }

  // ---------------------------------------------------------------- packaging

  function miniPackCandy(x, y, s) {
    wrappedCandy(x - s * 1.5, y, s * 0.62, -0.2, C.pink);
    drawCookie(x, y + s * 0.05, s * 0.75, -0.08, 0, { body: C.cookie, dark: C.cookieDark });
    drawChocoBar(x + s * 1.55, y, s * 1.15, s * 0.55, 0.12, 0, { foil: C.yellow });
  }

  function packPanel(cx, cy, sc, rot, accent, front) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.scale(sc, sc);

    // shadow
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.translate(24, 30);
    fillRR(-380, -450, 760, 900, 38, C.ink, null, 0);
    ctx.restore();

    // pack base
    fillRR(-380, -450, 760, 900, 38, front ? C.paper : accent, C.ink, 12);

    if (front) {
      ctx.save();
      pathRR(-380, -450, 760, 900, 38);
      ctx.clip();

      // top band
      ctx.fillStyle = accent;
      ctx.fillRect(-380, -450, 760, 215);
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(-380, -235);
      ctx.lineTo(380, -235);
      ctx.stroke();

      drawText('CANDY', 0, -360, 112, {
        color: C.cream, stroke: C.ink, lw: 9, shadow: 7, tracking: -3
      });
      drawText('COOKIE CHOCOLATE', 0, -276, 27, {
        color: C.ink, stroke: null, lw: 0, shadow: 0, tracking: 5
      });

      // flavour window
      fillRR(-290, -180, 580, 390, 28, C.cream, C.ink, 8);
      ctx.save();
      pathRR(-274, -164, 548, 358, 20);
      ctx.clip();
      ctx.fillStyle = C.cream;
      ctx.fillRect(-280, -170, 560, 370);
      halftone(-280, -170, 560, 370, accent, 0.12);
      miniPackCandy(0, 40, 100);
      ctx.restore();

      // copy
      drawText('3 FLAVORS', -300, 258, 24, {
        color: C.ink, stroke: null, lw: 0, shadow: 0, align: 'left', tracking: 4
      });
      drawText('CANDY · COOKIE · CHOCO', -300, 290, 11, {
        color: C.ink, stroke: null, lw: 0, shadow: 0, align: 'left', tracking: 3, alpha: 0.62
      });
      drawText('NET WT. 180 g', 300, 258, 15, {
        color: C.ink, stroke: null, lw: 0, shadow: 0, align: 'right', tracking: 2
      });

      // ingredients
      const copy = 'INGREDIENTS: SUGAR, CACAO, FLOUR, LOVE, SPRINKLES,';
      const copy2 = 'VANILLA, STRAWBERRY, HAPPINESS. MADE IN TOKYO.';
      drawText(copy, -300, 344, 10, {
        color: C.ink, stroke: null, lw: 0, shadow: 0, align: 'left', tracking: 1.5, alpha: 0.62
      });
      drawText(copy2, -300, 366, 10, {
        color: C.ink, stroke: null, lw: 0, shadow: 0, align: 'left', tracking: 1.5, alpha: 0.62
      });

      // barcode
      drawBarcode(-300, 376, 210, 56, C.ink);
      drawText('4 904123 456789', -300, 440, 9, {
        color: C.ink, stroke: null, lw: 0, shadow: 0, align: 'left', tracking: 2, alpha: 0.7
      });

      // round badge
      circle(240, 400, 52, accent, C.ink, 6);
      drawText('100%', 240, 390, 19, {
        color: onColor(accent), stroke: null, lw: 0, shadow: 0, tracking: 0
      });
      drawText('SUGAR', 240, 414, 11, {
        color: onColor(accent), stroke: null, lw: 0, shadow: 0, tracking: 1
      });

      ctx.restore();
    } else {
      // back pack graphics
      drawText('CANDY', 0, -250, 180, {
        color: C.ink, stroke: null, lw: 0, shadow: 0, alpha: 0.2, rot: -0.05
      });
    }

    ctx.restore();
  }

  function pack(cue, next, m, lt, t) {
    const look = LOOKS[cue.look] || LOOKS.yellow;
    const v = cue.variant || 0;
    clear(look);

    radialBurst(W / 2, H / 2, 1700, [look.a, look.b, look.c, look.bg], t * 0.02, 0.25, 32);
    halftone(0, 0, W, H, look.ink, 0.08);
    checker(0, H - 108, W, 108, 66, look.ink, look.a, t * 18, 0, 0.7);

    const bob = Math.sin(t * 1.5) * 8;
    const accent = v === 1 ? C.cyan : C.pink;

    // back pack
    packPanel(W * 0.3, H * 0.54 + bob * 0.6, 0.62, -0.13, look.b, false);
    // front pack
    ctx.save();
    ctx.translate(0, bob + m.pulse * 6);
    packPanel(W * 0.57, H * 0.51, 0.9, -0.045, accent, true);
    ctx.restore();

    // price tag
    ctx.save();
    ctx.translate(W * 0.9, H * 0.44);
    ctx.rotate(0.16);
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(8, -8);
    ctx.lineTo(-66, -96);
    ctx.stroke();
    fillRR(-90, -126, 190, 96, 16, C.cream, C.ink, 6);
    circle(-58, -78, 9, look.bg, C.ink, 3);
    drawText('¥100', 22, -78, 36, {
      color: C.pink, stroke: C.ink, lw: 3, shadow: 2
    });
    ctx.restore();

    drawSticker('NEW!\nFLAVOR', 1580, 246, 98, C.green, 0.14, {
      color: C.ink, size: 28, textStroke: false
    });
    drawSticker('LIMITED\nEDITION', 332, 824, 92, C.cream, -0.12, {
      color: C.pink, size: 20, textStroke: false
    });

    drawText('CANDY COOKIE CHOCOLATE', W / 2, 68, 16, {
      color: look.ink, stroke: null, lw: 0, shadow: 0, tracking: 7, alpha: 0.55
    });
    drawText('NEW FLAVOR  /  LIMITED EDITION  /  100% SUGAR', W / 2, H - 68, 12, {
      color: C.cream, stroke: C.ink, lw: 2, shadow: 0, tracking: 4, alpha: 0.95
    });

    lollipop(146, 862, 78, -0.25, t * 2.1, C.cyan);
  }

  window.SCENES.ring = ring;
  window.SCENES.storm = storm;
  window.SCENES.wall = wall;
  window.SCENES.pack = pack;
})();
