/* Scene library part 4 */
window.SCENES = window.SCENES || {};
(() => {
  const MD = window.MD;
  const {
    W, H, TAU, C, LOOKS, clamp, lerp, mod, smooth, easeOutCubic, easeOutBack,
    hash, rng, pathRR, fillRR, circle, drawStar, drawHeart, drawSparkle,
    drawSprinkle, fitSize, drawText, halftone, checker, radialBurst,
    lollipop, wrappedCandy, drawCookie, drawChocoBar, drawSticker
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

  // ---------------------------------------------------------------- daisuki flower

  function flower(cue, next, m, lt, t) {
    const look = LOOKS[cue.look] || LOOKS.cream;
    const v = cue.variant || 0;
    clear(look);

    radialBurst(W / 2, H / 2 + 170, 1600, [look.b, look.c, look.bg], t * 0.02, 0.16, 28);
    halftone(0, 0, W, 180, look.ink, 0.1);
    checker(0, H - 88, W, 88, 55, look.ink, look.a, t * 14, 0, 0.55);

    drawText('DAISUKI', W / 2, 192, 218, {
      color: look.a, stroke: C.ink, lw: 12, shadow: 10, rot: -0.03, tracking: -3
    });
    drawText('だいすき  /  SUGAR & LOVE', W / 2, 322, 20, {
      color: look.ink, stroke: null, lw: 0, shadow: 0, jp: true, tracking: 6, alpha: 0.68
    });

    const cx = W / 2;
    const cy = 780;
    const petalCols = v ? [C.cream, C.pink, C.yellow, C.cream, C.red] : [look.a, C.yellow, C.cream, C.pink, C.red];

    // back petals
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.08);
    for (let ring = 0; ring < 2; ring++) {
      const n = ring === 0 ? 12 : 9;
      const dist = ring === 0 ? 220 : 150;
      const rx = ring === 0 ? 105 : 80;
      const ry = ring === 0 ? 190 : 145;
      for (let i = 0; i < n; i++) {
        const a = i / n * TAU + (ring ? 0.28 : 0);
        ctx.save();
        ctx.rotate(a);
        const pul = 1 + m.pulse * (0.05 + ring * 0.02);
        ctx.scale(pul, pul);
        ctx.beginPath();
        ctx.ellipse(0, -dist, rx, ry, 0, 0, TAU);
        ctx.fillStyle = petalCols[(i + ring * 2) % petalCols.length];
        ctx.fill();
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 8;
        ctx.stroke();
        // petal vein
        ctx.beginPath();
        ctx.moveTo(0, -dist - ry * 0.55);
        ctx.lineTo(0, -dist + ry * 0.55);
        ctx.strokeStyle = 'rgba(11,10,15,.22)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();

    // face medallion
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1 + m.pulse * 0.04, 1 + m.pulse * 0.04);
    circle(0, 0, 166, C.cream, C.ink, 12);
    ctx.beginPath();
    ctx.arc(0, 0, 138, 0, TAU);
    ctx.setLineDash([5, 9]);
    ctx.strokeStyle = 'rgba(11,10,15,.25)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    // eyes
    ctx.beginPath();
    ctx.ellipse(-56, -18, 14, 25, -0.06, 0, TAU);
    ctx.fillStyle = C.ink;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(56, -18, 14, 25, 0.06, 0, TAU);
    ctx.fillStyle = C.ink;
    ctx.fill();
    circle(-62, -28, 5, C.white);
    circle(50, -28, 5, C.white);

    // blush
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(-98, 32, 30, 14, -0.15, 0, TAU);
    ctx.fillStyle = C.pink;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(98, 32, 30, 14, 0.15, 0, TAU);
    ctx.fillStyle = C.pink;
    ctx.fill();
    ctx.globalAlpha = 1;

    // smile
    ctx.beginPath();
    ctx.arc(0, 22, 52, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();

    drawText('SUGAR', 0, 104, 17, {
      color: C.pink, stroke: null, lw: 0, shadow: 0, tracking: 4
    });
    ctx.restore();

    // hearts + sparkles
    for (let i = 0; i < 16; i++) {
      const a = hash(i * 3.3) * TAU;
      const d = 320 + hash(i * 5.9) * 340;
      const x = cx + Math.cos(a) * d;
      const y = cy + Math.sin(a) * d * 0.6;
      const s = 8 + hash(i) * 16;
      if (i % 2) drawHeart(x, y, s, i % 4 ? C.pink : C.red, C.ink, 3, t * 0.2 + i);
      else drawSparkle(x, y, s, C.yellow, t + i, 0.85);
    }

    drawText('CANDY COOKIE CHOCOLATE  /  LOVE IS SWEET', W / 2, 1006, 12, {
      color: C.cream, stroke: C.ink, lw: 2, shadow: 0, tracking: 5, alpha: 0.9
    });

    lollipop(170, 884, 78, -0.25, t * 2, C.pink);
    wrappedCandy(1740, 882, 56, 0.3, C.cyan);
  }

  // ---------------------------------------------------------------- sugar dream

  function dream(cue, next, m, lt, t) {
    const look = LOOKS.lav;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#B78DFF');
    g.addColorStop(0.44, '#FFAED8');
    g.addColorStop(1, '#FFF2D7');
    ctx.fillStyle = g;
    ctx.fillRect(-80, -80, W + 160, H + 160);

    // soft rays
    ctx.save();
    ctx.globalAlpha = 0.08;
    radialBurst(W / 2, 520, 1500, [C.cream, C.pink, C.cream, C.lav], t * 0.01, 1, 20);
    ctx.restore();

    // moon
    const mx = 1550;
    const my = 260;
    ctx.save();
    ctx.shadowColor = 'rgba(255,242,215,.65)';
    ctx.shadowBlur = 50;
    circle(mx, my, 132, C.cream, null, 0);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.25;
    circle(mx - 44, my - 26, 18, C.lav, null, 0);
    circle(mx + 38, my + 34, 12, C.lav, null, 0);
    circle(mx - 8, my + 66, 8, C.lav, null, 0);
    ctx.restore();

    // clouds
    const cloud = (x, y, s, col) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(s, s);
      ctx.beginPath();
      ctx.arc(-90, 0, 60, 0, TAU);
      ctx.arc(-20, -24, 76, 0, TAU);
      ctx.arc(66, 4, 58, 0, TAU);
      ctx.arc(116, 24, 38, 0, TAU);
      ctx.fillStyle = col;
      ctx.fill();
      ctx.restore();
    };
    cloud(280, 760 + Math.sin(t * 0.6) * 8, 1.2, 'rgba(255,242,215,.5)');
    cloud(1600, 810 + Math.sin(t * 0.5 + 2) * 10, 1.4, 'rgba(255,242,215,.38)');
    cloud(760, 930, 0.9, 'rgba(255,242,215,.32)');

    // giant sugar text
    drawText('SUGAR', W / 2, 540, 460, {
      color: 'rgba(255,242,215,.44)', stroke: null, lw: 0, shadow: 0, rot: -0.04, tracking: -8
    });
    drawText('DREAM', W / 2, 828, 90, {
      color: C.pink, stroke: C.cream, lw: 8, shadow: 4, shadowColor: C.ink, tracking: 16
    });

    // floating sweets
    const bob = (i, sp) => Math.sin(t * sp + i * 1.7) * 18;
    lollipop(300, 430 + bob(1, 0.8), 92, -0.2, t * 1.4, C.pink);
    drawCookie(1600, 600 + bob(2, 0.7), 90, 0.12, m.pulse * 0.3, {
      body: C.cookie, dark: C.cookieDark
    });
    wrappedCandy(1520, 900 + bob(3, 0.9), 58, -0.25, C.cyan);
    drawChocoBar(390, 860 + bob(4, 0.6), 220, 110, 0.08, 0, { foil: C.yellow });
    lollipop(1700, 880 + bob(5, 0.75), 62, 0.2, -t * 1.6, C.cyan);

    // stars
    for (let i = 0; i < 34; i++) {
      const x = hash(i * 4.1) * W;
      const y = hash(i * 7.3) * (H - 120);
      const s = 2 + hash(i) * 7;
      const a = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.6 + i));
      drawSparkle(x, y, s, i % 3 === 0 ? C.cream : i % 3 === 1 ? C.pink : C.yellow, t * 0.2 + i, a);
    }

    // sleepy text
    drawText('ゆめ', 104, 610, 54, {
      color: C.cream, stroke: C.pink, lw: 3, jp: true, rot: -Math.PI / 2, shadow: 0, alpha: 0.85
    });
    drawText('SUGAR DREAM  /  SLOW MOTION', 104, 850, 10, {
      color: C.ink, stroke: null, lw: 0, shadow: 0, align: 'left', tracking: 4, alpha: 0.55
    });

    // beat halo
    ctx.beginPath();
    ctx.arc(W / 2, 540, 340 + m.pulse * 26, 0, TAU);
    ctx.strokeStyle = 'rgba(255,242,215,.28)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // ---------------------------------------------------------------- sunset

  function sunset(cue, next, m, lt, t) {
    const look = LOOKS.sunset;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#FFB347');
    g.addColorStop(0.42, '#FF7F6A');
    g.addColorStop(0.74, '#FF5D8F');
    g.addColorStop(1, '#5A2A45');
    ctx.fillStyle = g;
    ctx.fillRect(-80, -80, W + 160, H + 160);

    // sun rays
    ctx.save();
    ctx.translate(W / 2, 650);
    ctx.rotate(t * 0.04);
    for (let i = 0; i < 24; i++) {
      const a = i / 24 * TAU;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * 1500, Math.sin(a) * 1500);
      ctx.strokeStyle = 'rgba(255,242,215,.06)';
      ctx.lineWidth = 46;
      ctx.stroke();
    }
    ctx.restore();

    // sun
    const sy = 650;
    const sr = 332 + m.pulse * 12;
    ctx.save();
    ctx.beginPath();
    ctx.arc(W / 2, sy, sr, 0, TAU);
    ctx.clip();
    ctx.fillStyle = '#FFE27A';
    ctx.fillRect(W / 2 - sr, sy - sr, sr * 2, sr * 2);
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = i % 2 ? '#FF9A5A' : '#FFC95C';
      const yy = sy + 80 + i * 34;
      ctx.fillRect(W / 2 - sr, yy, sr * 2, 12 + i * 1.2);
    }
    ctx.restore();
    circle(W / 2, sy, sr, null, C.choco, 8);

    // clouds
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = C.cream;
    for (let i = 0; i < 4; i++) {
      const x = 200 + i * 500;
      const y = 260 + Math.sin(t * 0.3 + i) * 12;
      ctx.beginPath();
      ctx.ellipse(x, y, 150, 32, 0, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    // horizon checker
    checker(0, 862, W, H - 862, 74, C.choco, '#FFD07A', t * 12, 0, 0.85);
    ctx.fillStyle = C.choco;
    ctx.fillRect(-40, 848, W + 80, 18);

    drawText('THANK YOU', W / 2, 260, 232, {
      color: C.cream, stroke: C.choco, lw: 12, shadow: 9, rot: -0.03, tracking: -1
    });
    drawText('またね  /  SEE YOU NEXT TIME', W / 2, 382, 20, {
      color: C.cream, stroke: C.choco, lw: 2, shadow: 0, jp: true, tracking: 6
    });

    // hearts
    for (let i = 0; i < 12; i++) {
      const x = hash(i * 3.8) * W;
      const y = 470 + hash(i * 6.1) * 330;
      drawHeart(x, y + Math.sin(t + i) * 12, 7 + hash(i) * 12, i % 2 ? C.pink : C.cream, C.choco, 3, 0.1);
    }

    // silhouettes
    ctx.save();
    ctx.globalAlpha = 0.85;
    lollipop(190, 880, 92, -0.22, t * 1.2, C.choco);
    lollipop(1720, 900, 110, 0.2, -t * 1.1, C.choco);
    ctx.restore();

    drawText('CANDY COOKIE CHOCOLATE', W / 2, 966, 16, {
      color: C.cream, stroke: C.choco, lw: 3, shadow: 0, tracking: 8, alpha: 0.9
    });
    drawText('HALLO CEL  /  2026', W / 2, 1002, 10, {
      color: C.cream, stroke: C.choco, lw: 2, shadow: 0, tracking: 5, alpha: 0.75
    });

    confettiSunset(t);
  }

  function confettiSunset(t) {
    for (let i = 0; i < 20; i++) {
      const x = hash(i * 5.7) * W;
      const y = 500 + hash(i * 8.3) * 360;
      const s = 3 + hash(i) * 6;
      drawSparkle(x, y, s, C.cream, t * 0.4 + i, 0.3 + 0.5 * Math.abs(Math.sin(t * 2 + i)));
    }
  }

  // ---------------------------------------------------------------- end card

  function end(cue, next, m, lt, t) {
    const look = LOOKS.night;
    clear(look);

    const k = clamp(lt / 0.9, 0, 1);
    ctx.save();
    ctx.globalAlpha = k;
    ctx.translate(0, (1 - easeOutCubic(k)) * 28);

    // tiny candy row
    lollipop(760, 236, 38, -0.2, t, C.pink);
    drawCookie(960, 236, 38, 0, 0, { body: C.cookie, dark: C.cookieDark });
    wrappedCandy(1160, 236, 28, 0.1, C.cyan);

    drawText('FIN.', W / 2, 434, 254, {
      color: C.cream, stroke: C.pink, lw: 9, shadow: 8, tracking: 0
    });

    drawText('CANDY', W / 2, 600, 58, {
      color: C.yellow, stroke: null, lw: 0, shadow: 0, tracking: 2
    });
    drawText('COOKIE', W / 2, 660, 58, {
      color: C.pink, stroke: null, lw: 0, shadow: 0, tracking: 2
    });
    drawText('CHOCOLATE', W / 2, 720, 58, {
      color: C.cyan, stroke: null, lw: 0, shadow: 0, tracking: 2
    });

    drawText('キャンディークッキーチョコレート', W / 2, 800, 20, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, jp: true, tracking: 5, alpha: 0.7
    });
    drawText('初音ミク  ×  重音テトSV', W / 2, 836, 13, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, jp: true, tracking: 4, alpha: 0.45
    });

    ctx.strokeStyle = 'rgba(255,242,215,.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 260, 878);
    ctx.lineTo(W / 2 + 260, 878);
    ctx.stroke();

    drawText('MOTION DESIGN IN HTML  /  CANVAS + WEB AUDIO', W / 2, 912, 11, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, tracking: 4, alpha: 0.45
    });
    drawText('HALLO CEL  /  2026', W / 2, 940, 9, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, tracking: 4, alpha: 0.28
    });

    // sparkles
    for (let i = 0; i < 20; i++) {
      const x = hash(i * 4.4) * W;
      const y = hash(i * 6.2) * H;
      drawSparkle(x, y, 2 + hash(i) * 6, i % 2 ? C.pink : C.cyan, t * 0.3 + i, 0.25 + 0.4 * Math.abs(Math.sin(t * 2 + i)));
    }
    ctx.restore();
  }

  window.SCENES.flower = flower;
  window.SCENES.dream = dream;
  window.SCENES.sunset = sunset;
  window.SCENES.end = end;
})();
