/* scenes 1 — overture, questions, party, chants */
(() => {
  'use strict';
  const M = window.MD;
  const K = window.SK;
  const {
    ctx, W, H, TAU, C, LOOKS, clamp, lerp, mod, smooth, easeOutCubic, easeOutBack,
    hash, rng, pathRR, fillRR, circle, drawStar, drawHeart, drawSparkle,
    drawText, measure, fitSize, halftone, radialBurst, speedLines, confetti,
    drawMoon, drawBat, drawPumpkin, drawZombieHand, drawCallingCard, drawWaxSeal,
    drawFrame, drawSpotlight, drawSticker, drawTeto, drawUi
  } = M;
  const S = window.SCENES = window.SCENES || {};

  // ─────────────────────────────────────────────────────────────── overture
  S.overture = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(4,3,9,1)', 'rgba(22,14,38,1)');
    // stars
    for (let i = 0; i < 110; i++) {
      const x = hash(i * 3.7) * W;
      const y = hash(i * 8.3 + 2) * 760;
      const a = 0.2 + hash(i + 7) * 0.7;
      ctx.globalAlpha = a * (0.5 + 0.5 * Math.sin(t * 1.7 + i));
      circle(x, y, 1 + hash(i * 2.2) * 2.4, C.cream, null, 0);
    }
    ctx.globalAlpha = 1;

    drawMoon(1450, 292, 188, { glow: true });
    for (let i = 0; i < 6; i++) {
      const bx = 220 + hash(i * 5.3) * 1500;
      const by = 150 + hash(i * 2.1) * 360 + Math.sin(t * 0.8 + i) * 22;
      drawBat(bx, by, 17 + hash(i) * 24, Math.sin(t * 0.6 + i) * 0.2, C.ink, 0.82);
    }

    // museum silhouette
    ctx.fillStyle = '#05040B';
    ctx.fillRect(0, 820, W, 260);
    ctx.fillRect(230, 690, 1460, 150);
    // pediment
    ctx.beginPath();
    ctx.moveTo(330, 690);
    ctx.lineTo(960, 560);
    ctx.lineTo(1590, 690);
    ctx.closePath();
    ctx.fill();
    // columns
    for (let i = 0; i < 7; i++) {
      const x = 410 + i * 182;
      ctx.fillStyle = '#0B0914';
      ctx.fillRect(x, 700, 46, 140);
      ctx.fillStyle = 'rgba(255,122,24,.22)';
      ctx.fillRect(x + 8, 714, 30, 8);
    }
    // lit windows
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = 'rgba(255,122,24,.32)';
      ctx.fillRect(548 + i * 208, 760, 76, 58);
      ctx.fillStyle = 'rgba(255,233,168,.18)';
      ctx.fillRect(560 + i * 208, 772, 52, 34);
    }
    // steps
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i % 2 ? '#0B0914' : '#080610';
      ctx.fillRect(180 - i * 26, 850 + i * 26, 1560 + i * 52, 28);
    }

    // spotlights sweeping
    drawSpotlight(380 + Math.sin(t * 0.55) * 150, 690, 620, 'rgba(255,122,24,.2)', 0.55);
    drawSpotlight(1540 + Math.sin(t * 0.43 + 2) * 160, 690, 640, 'rgba(177,140,255,.18)', 0.55);

    // giant type
    drawText('目撃！', 250, 208, 132, {
      color: C.cream, stroke: C.ink, lw: 9, shadow: 7, jp: true, align: 'left', tracking: 2
    });
    drawText('TETO', 246, 424, 300, {
      color: C.red, stroke: C.ink, lw: 15, shadow: 12, align: 'left', tracking: -8
    });
    drawText('XXXI', 252, 654, 238, {
      color: C.gold, stroke: C.ink, lw: 12, shadow: 10, align: 'left', tracking: 4
    });
    K.tag('THE 31st', 286, 790, C.green, C.ink, -0.04, 20);

    // case tag
    K.tag('CASE #031', 1718, 152, C.cream, C.ink, 0.08, 15);
    drawText('MIDNIGHT MUSEUM', 1718, 194, 12, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, tracking: 4, alpha: 0.55, align: 'right'
    });

    // calling card drops in
    const cardIn = smooth(clamp((lt - 1.05) / 0.7, 0, 1));
    if (cardIn > 0.01) {
      ctx.save();
      ctx.globalAlpha = cardIn;
      ctx.translate(0, (1 - cardIn) * -60);
      drawCallingCard(1382, 626, 450, 288, -0.095 + Math.sin(t * 0.6) * 0.008, {
        top: 'PHANTOM THIEF',
        big: 'TETO',
        sub: 'THE 31st'
      });
      ctx.restore();
    }

    // countdown sticker
    if (lt > 4.2) {
      const k = easeOutBack(clamp((lt - 4.2) / 0.5, 0, 1));
      ctx.save();
      ctx.translate(1680, 726);
      ctx.scale(k, k);
      ctx.rotate(0.13);
      drawSticker('31\nDAYS?', 0, 0, 72, C.orange, 0, { ink: C.ink, color: C.ink, size: 19 });
      ctx.restore();
    }

    // floor glow
    ctx.save();
    const g = ctx.createRadialGradient(960, 860, 20, 960, 860, 620);
    g.addColorStop(0, 'rgba(255,122,24,.16)');
    g.addColorStop(1, 'rgba(255,122,24,0)');
    ctx.fillStyle = g;
    ctx.fillRect(200, 740, 1520, 340);
    ctx.restore();
  };

  // ─────────────────────────────────────────────────────────────── qboard
  S.qboard = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(0,0,0,.18)', 'rgba(0,0,0,.32)');
    const pop = look.pop;
    const punch = 1 + m.pulse * 0.02;

    // evidence board texture
    ctx.save();
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 17; i++) {
      const x = hash(i * 4.1) * W;
      const y = hash(i * 7.4 + 1) * 780;
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 120 + hash(i) * 260, y + 40 + hash(i + 2) * 120);
      ctx.stroke();
    }
    ctx.restore();

    // Q number
    ctx.save();
    ctx.translate(318, 448);
    ctx.scale(punch, punch);
    ctx.rotate(-0.03);
    drawText('Q', 0, -140, 210, { color: look.a, stroke: C.ink, lw: 12, shadow: 12 });
    drawText(cue.num || '01', 0, 115, 330, { color: look.ink, stroke: look.a, lw: 10, shadow: 12 });
    ctx.restore();

    // label tab
    K.tag('QUESTION ' + (cue.num || '01'), 320, 168, look.ink === C.ink ? C.gold : C.cream, C.ink, -0.02, 17);

    // icon spotlight
    ctx.save();
    const cx = 1372, cy = 446;
    ctx.globalAlpha = 0.25;
    circle(cx, cy, 286, look.ink, null, 0);
    ctx.globalAlpha = 1;
    circle(cx, cy, 250, 'rgba(255,244,220,.1)', look.ink, 6);
    circle(cx, cy, 226, null, look.ink, 2);
    K.questionIcon(cue.icon || 'heel', cx, cy + 8, 160, look.a, C.ink, 1);
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * TAU + t * 0.15;
      drawSparkle(cx + Math.cos(a) * 278, cy + Math.sin(a) * 278, 7 + hash(i) * 8, look.ink, a, 0.4);
    }
    ctx.restore();

    // label plate
    ctx.save();
    const plateY = 770;
    fillRR(682, plateY - 32, 556, 64, 32, look.ink, C.ink, 4);
    drawText(cue.label || 'WHO?', 960, plateY, 22, {
      color: look.bg, stroke: null, lw: 0, shadow: 0, tracking: 2
    });
    // arrow to icon
    ctx.strokeStyle = look.ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(1240, plateY);
    ctx.lineTo(1100, plateY - 6);
    ctx.lineTo(1110, plateY - 24);
    ctx.moveTo(1100, plateY - 6);
    ctx.lineTo(1110, plateY + 12);
    ctx.stroke();
    ctx.restore();

    // polaroids
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.translate(1210 + i * 230, 154 + (i % 2) * 18);
      ctx.rotate(-0.12 + i * 0.1);
      fillRR(-86, -56, 172, 132, 3, C.paper, C.ink, 3);
      ctx.fillStyle = 'rgba(7,6,13,.1)';
      ctx.fillRect(-72, -42, 144, 82);
      ctx.fillStyle = look.ink;
      ctx.globalAlpha = 0.35;
      ctx.fillRect(-62, -30, 124, 60);
      ctx.globalAlpha = 1;
      drawText(['??', '31', '♥'][i], 0, -2, 34, {
        color: look.a, stroke: null, lw: 0, shadow: 0
      });
      ctx.restore();
    }

    // Teto peeking
    const bob = Math.sin(t * 2.2) * 8;
    ctx.save();
    ctx.translate(1746, 800 + bob);
    ctx.rotate(0.08);
    ctx.scale(0.62, 0.62);
    drawTeto(0, 0, 115, { pose: 'idle', wink: true, hat: false, mask: true });
    ctx.restore();

    K.sparkles(t, 12, look.a, 4, 700);
  };

  // ─────────────────────────────────────────────────────────────── answer
  S.answer = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(0,0,0,.12)', 'rgba(0,0,0,.32)');
    radialBurst(960, 470, 1500, [look.bg, look.a, look.bg, look.b], t * 0.05, 0.12, 36);
    const k = easeOutBack(clamp(lt / 0.4, 0, 1));

    drawText('ANSWER', 260, 168, 15, {
      color: look.ink, stroke: null, lw: 0, shadow: 0, tracking: 6, alpha: 0.55, align: 'left'
    });

    ctx.save();
    ctx.translate(960, 424);
    ctx.scale(k, k);
    ctx.rotate(-0.025);
    const word = cue.label || '?';
    const fs = K.giant(word, 0, -60, 1480, 300, {
      color: look.a, stroke: C.ink, lw: 14, shadow: 14, tracking: -2
    });
    K.questionIcon(cue.icon || 'heel', 0, 300, 150, look.ink === C.ink ? C.cream : look.ink, C.ink, 1);
    ctx.restore();

    // reveal shards
    for (let i = 0; i < 8; i++) {
      ctx.save();
      const a = hash(i * 2.3) * TAU;
      const d = 360 + hash(i + 1) * 420;
      ctx.translate(960 + Math.cos(a) * d, 400 + Math.sin(a) * d);
      ctx.rotate(a);
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = look.b;
      ctx.fillRect(-8, -80, 16, 160);
      ctx.restore();
    }

    // Teto reaction
    ctx.save();
    ctx.translate(1700, 760);
    ctx.rotate(-0.06);
    drawTeto(0, 0, 86, { pose: 'point', wink: cue.icon === 'heart', mask: true });
    ctx.restore();

    K.sparkles(t, 20, look.a, 8, 800);
  };

  // ─────────────────────────────────────────────────────────────── reveal
  S.reveal = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(0,0,0,.05)', 'rgba(0,0,0,.3)');
    radialBurst(760, 440, 1500, [look.bg, look.a, look.bg, C.gold], t * 0.03, 0.18, 44);
    drawSpotlight(1380, 120, 760, 'rgba(255,244,220,.28)', 0.8);
    drawMoon(1730, 220, 110, { glow: true });

    const k = easeOutBack(clamp(lt / 0.45, 0, 1));
    ctx.save();
    ctx.translate(590, 430);
    ctx.scale(k, k);
    ctx.rotate(-0.05);
    drawText('ME?!', 0, 0, 330, {
      color: C.cream, stroke: C.ink, lw: 16, shadow: 14, tracking: -4
    });
    ctx.restore();

    K.tag('IT’S ME, RIGHT?', 590, 700, C.green, C.ink, -0.04, 22);

    // Teto huge, pointing at herself
    ctx.save();
    ctx.translate(1380, 438);
    ctx.rotate(0.04);
    drawTeto(0, 0, 176, { pose: 'point', wink: true, hat: true, mask: true });
    ctx.restore();

    // arrow
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(950, 640);
    ctx.quadraticCurveTo(1110, 660, 1190, 560);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(1190, 560);
    ctx.lineTo(1120, 566);
    ctx.lineTo(1160, 620);
    ctx.closePath();
    ctx.fillStyle = C.ink;
    ctx.fill();

    // hearts
    for (let i = 0; i < 9; i++) {
      const a = hash(i * 5.3) * TAU;
      drawHeart(1380 + Math.cos(a) * (260 + hash(i) * 260), 450 + Math.sin(a) * (220 + hash(i) * 180), 16 + hash(i) * 22, C.red, C.ink, 4, a);
    }
    K.sparkles(t, 24, C.gold, 3, 780);
  };

  // ─────────────────────────────────────────────────────────────── stamp
  S.stamp = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(0,0,0,.1)', 'rgba(0,0,0,.34)');
    radialBurst(960, 470, 1500, [C.red, '#C41E3A', C.red, C.ink], t * 0.02, 0.22, 40);

    // impact rings
    for (let i = 0; i < 3; i++) {
      const rr = 160 + ((lt * 420 + i * 200) % 860);
      ctx.globalAlpha = clamp(1 - rr / 1000, 0, 0.4);
      circle(960, 450, rr, null, C.cream, 4);
    }
    ctx.globalAlpha = 1;

    // giant stamp
    const k = easeOutBack(clamp(lt / 0.28, 0, 1));
    ctx.save();
    ctx.translate(960, 438);
    ctx.rotate(-0.13);
    ctx.scale(k, k);
    fillRR(-720, -210, 1440, 420, 20, 'rgba(0,0,0,.06)', C.cream, 12);
    fillRR(-690, -180, 1380, 360, 10, null, C.cream, 3);
    drawText(cue.word || 'WRONG!', 0, -6, 250, {
      color: C.cream, stroke: C.ink, lw: 14, shadow: 14, tracking: -4
    });
    ctx.restore();

    // jp vertical
    ctx.save();
    ctx.translate(1766, 470);
    ctx.rotate(0.02);
    ctx.fillStyle = C.ink;
    ctx.fillRect(-34, -220, 68, 440);
    drawText(cue.jp || '違うがー？', 0, 0, 28, {
      color: C.gold, stroke: null, lw: 0, shadow: 0, jp: true, rot: Math.PI / 2
    });
    ctx.restore();

    // shocked Teto
    ctx.save();
    ctx.translate(208, 640);
    ctx.rotate(-0.1);
    drawTeto(0, 0, 118, { pose: 'shock', mask: true, hat: false });
    ctx.restore();

    // ink splats
    for (let i = 0; i < 16; i++) {
      const a = hash(i * 3.3) * TAU;
      const d = 500 + hash(i + 2) * 460;
      circle(960 + Math.cos(a) * d, 430 + Math.sin(a) * d * 0.7, 4 + hash(i) * 16, C.ink, null, 0);
    }
    K.tag('OBJECTION!', 520, 174, C.cream, C.ink, 0.06, 17);
  };

  // ─────────────────────────────────────────────────────────────── party
  S.party = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(0,0,0,.06)', 'rgba(0,0,0,.3)');
    radialBurst(960, 480, 1500, [look.bg, look.a, look.bg, look.b], t * 0.08, 0.24, 34);
    confetti(t, look.pop, 90, 0.9);

    // disco ball
    const bx = 960, by = 130, br = 82;
    ctx.save();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx, 0);
    ctx.lineTo(bx, by - br);
    ctx.stroke();
    circle(bx, by, br, C.cream, C.ink, 5);
    ctx.save();
    circle(bx, by, br, null, null, 0);
    ctx.clip();
    for (let r = -5; r <= 5; r++) {
      for (let c = -5; c <= 5; c++) {
        const xx = bx + c * 26 + (r % 2) * 13;
        const yy = by + r * 20;
        ctx.fillStyle = ['#FFF4DC', '#B18CFF', '#FFD24A', '#FF7A18'][(r + c + 10) % 4];
        ctx.globalAlpha = 0.55 + hash(r * 9 + c) * 0.4;
        ctx.fillRect(xx - 10, yy - 7, 20, 14);
      }
    }
    ctx.restore();
    circle(bx, by, br, null, C.ink, 5);
    ctx.restore();
    // light rays
    ctx.save();
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * TAU + t * 0.2;
      ctx.fillStyle = look.a;
      ctx.beginPath();
      ctx.moveTo(bx + Math.cos(a) * br, by + Math.sin(a) * br);
      ctx.lineTo(bx + Math.cos(a - 0.1) * 900, by + Math.sin(a - 0.1) * 900);
      ctx.lineTo(bx + Math.cos(a + 0.1) * 900, by + Math.sin(a + 0.1) * 900);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    K.bunting(196, look.pop, 0.9);

    const n = Math.min(4, Math.floor(lt / 0.36) + 1);
    for (let i = 0; i < n; i++) {
      const age = lt - i * 0.36;
      const k = easeOutBack(clamp(age / 0.2, 0, 1));
      const col = look.pop[i % look.pop.length];
      ctx.save();
      ctx.translate(960 + (i % 2 ? 42 : -38), 350 + i * 142);
      ctx.scale(k, k);
      ctx.rotate((i % 2 ? 1 : -1) * (0.025 + i * 0.006));
      K.giant('PARTY', 0, 0, 1480, 160, {
        color: col, stroke: C.ink, lw: 10, shadow: 8, tracking: -2
      });
      ctx.restore();
    }
    drawText('× ' + n, 1710, 320, 24, {
      color: C.cream, stroke: C.ink, lw: 5, shadow: 0, alpha: 0.85, align: 'right'
    });

    // jack-o-lanterns
    drawPumpkin(150, 825, 82, -0.12, { glow: false });
    drawPumpkin(1770, 848, 68, 0.16, { glow: false });
    drawPumpkin(1718, 248, 48, 0.1, { glow: false });

    // dancing Teto
    ctx.save();
    ctx.translate(254, 650);
    ctx.rotate(-0.08 + Math.sin(t * 3) * 0.03);
    drawTeto(0, 0, 92, { pose: 'point', wink: true, hat: true, mask: true });
    ctx.restore();

    K.tag('HALLOWEEN 31', 300, 190, C.cream, C.ink, -0.03, 16);
    drawText('31', 1640, 640, 220, {
      color: 'rgba(255,244,220,.12)', stroke: null, lw: 0, shadow: 0, rot: 0.1
    });
  };

  // ─────────────────────────────────────────────────────────────── midnight
  S.midnight = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(0,0,0,.05)', 'rgba(0,0,0,.3)');
    drawMoon(1470, 300, 210, { glow: true });
    ctx.save();
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < 26; i++) {
      const x = hash(i * 4.3) * W, y = hash(i * 9.1) * 700;
      if (i % 3 === 0) drawStar(x, y, 4 + hash(i) * 6, C.gold, null, 0, t * 0.2 + i);
      else circle(x, y, 1.5 + hash(i) * 2, C.cream, null, 0);
    }
    ctx.restore();

    // clock face
    const cx = 1410, cy = 470, cr = 238;
    circle(cx, cy, cr + 18, C.ink, null, 0);
    circle(cx, cy, cr, C.cream, C.ink, 10);
    circle(cx, cy, cr - 18, null, C.ink, 2);
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU - Math.PI / 2;
      const r0 = cr - 42, r1 = cr - 22;
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = i % 3 === 0 ? 9 : 4;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.stroke();
    }
    drawText('31', cx, cy - 18, 150, {
      color: C.red, stroke: C.ink, lw: 7, shadow: 0
    });
    drawText('OCT', cx, cy + 92, 26, {
      color: C.ink, stroke: null, lw: 0, shadow: 0, tracking: 5, alpha: 0.6
    });
    // hands
    const settle = clamp(lt / 1.1, 0, 1);
    const hourA = -Math.PI / 2 + lerp(-0.6, 0, settle);
    const minA = -Math.PI / 2 + lerp(-2.1, 0, settle);
    const secA = -Math.PI / 2 + lt * 7.5;
    ctx.strokeStyle = C.ink;
    ctx.lineCap = 'round';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(hourA) * cr * 0.46, cy + Math.sin(hourA) * cr * 0.46);
    ctx.stroke();
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(minA) * cr * 0.69, cy + Math.sin(minA) * cr * 0.69);
    ctx.stroke();
    ctx.strokeStyle = C.red;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(secA) * cr * 0.8, cy + Math.sin(secA) * cr * 0.8);
    ctx.stroke();
    circle(cx, cy, 16, C.red, C.ink, 5);

    // giant 31
    drawText('31', 430, 458, 520, {
      color: look.a, stroke: C.ink, lw: 18, shadow: 16, tracking: -10
    });
    drawText('ST', 760, 612, 120, {
      color: look.ink, stroke: C.ink, lw: 10, shadow: 0, rot: -0.06
    });
    K.tag(cue.label || 'TODAY IS', 432, 188, look.ink, C.ink, -0.03, 24);
    K.tag('OCTOBER 31', 430, 748, C.green, C.ink, 0.02, 17);

    // bats
    for (let i = 0; i < 4; i++) {
      const x = 300 + hash(i * 5.1) * 1300;
      const y = 160 + hash(i * 2.2) * 240 + Math.sin(t * 0.9 + i) * 18;
      drawBat(x, y, 12 + hash(i) * 12, Math.sin(t + i) * 0.2, C.ink, 0.65);
    }

    // pendulum / gears
    ctx.save();
    ctx.translate(cx, cy + cr + 30);
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.sin(t * 1.8) * 56, 118);
    ctx.stroke();
    circle(Math.sin(t * 1.8) * 56, 126, 26, C.gold, C.ink, 5);
    ctx.restore();
  };

  // ─────────────────────────────────────────────────────────────── chant
  S.chant = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(0,0,0,.06)', 'rgba(0,0,0,.34)');
    radialBurst(960, 470, 1500, [look.bg, look.a, look.bg, look.b], t * 0.06, 0.16, 30);

    // icons behind
    if (cue.icon === 'pumpkin') {
      drawPumpkin(110, 850, 110, -0.2, { glow: false });
      drawPumpkin(1820, 820, 92, 0.2, { glow: false });
      drawPumpkin(1710, 210, 54, 0.12, { glow: false });
      drawPumpkin(180, 230, 46, -0.1, { glow: false });
    } else {
      drawZombieHand(142, 1000, 100, -0.1, { sleeve: C.purple });
      drawZombieHand(1790, 1020, 92, 0.14, { sleeve: C.wine });
      drawZombieHand(1700, 720, 62, 0.08, { sleeve: C.wine });
      drawZombieHand(220, 710, 56, -0.08, { sleeve: C.purple });
    }

    const n = Math.min(cue.count || 4, Math.floor(lt / 0.36) + 1);
    const rows = [252, 420, 588, 756];
    for (let i = 0; i < n; i++) {
      const age = lt - i * 0.36;
      const k = easeOutBack(clamp(age / 0.18, 0, 1));
      const col = look.pop[i % look.pop.length];
      const y = rows[i] != null ? rows[i] : 756;
      ctx.save();
      ctx.translate(960 + (i % 2 ? 44 : -30), y);
      ctx.scale(k, k);
      ctx.rotate((i % 2 ? 1 : -1) * (0.02 + i * 0.004));
      K.giant(cue.word || 'CHANT', 0, 0, 1500, 152, {
        color: col, stroke: C.ink, lw: 10, shadow: 9, tracking: -3
      });
      ctx.restore();
    }

    K.tag('CHANT 0' + n, 960, 850, C.cream, C.ink, -0.02, 14);
    for (let i = 0; i < 14; i++) {
      const a = hash(i * 7.1) * TAU;
      const d = 380 + hash(i + 1) * 520;
      drawSparkle(960 + Math.cos(a) * d, 500 + Math.sin(a) * d * 0.6, 5 + hash(i) * 12, look.ink, a, 0.4);
    }
  };

  // ─────────────────────────────────────────────────────────────── teto31
  S.teto31 = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(0,0,0,.04)', 'rgba(0,0,0,.3)');
    radialBurst(960, 470, 1500, [look.bg, look.a, look.bg, look.b], t * 0.04, 0.2, 36);

    // ghost 31
    ctx.save();
    ctx.globalAlpha = 0.14;
    drawText('31', 960, 510, 760, {
      color: look.ink, stroke: null, lw: 0, shadow: 0, tracking: -30
    });
    ctx.restore();

    drawSpotlight(900, 100, 760, 'rgba(255,244,220,.3)', 0.9);

    // Teto
    ctx.save();
    ctx.translate(760, 430);
    ctx.rotate(-0.04 + Math.sin(t * 1.2) * 0.01);
    drawTeto(0, 0, 178, { pose: 'point', wink: true, hat: true, mask: true });
    ctx.restore();

    // side type
    drawText('TETO', 1480, 252, 178, {
      color: look.a, stroke: C.ink, lw: 12, shadow: 10, tracking: -3
    });
    drawText('IS', 1480, 380, 74, {
      color: look.ink, stroke: C.ink, lw: 8, shadow: 0, tracking: 8
    });
    drawText('31', 1480, 610, 290, {
      color: look.ink, stroke: C.ink, lw: 12, shadow: 12, tracking: -8
    });
    K.tag('サーティーワン', 1480, 762, C.green, C.ink, -0.03, 24);

    // birthday / halloween bits
    K.tag('HAPPY HALLOWEEN', 400, 178, C.cream, C.ink, -0.04, 17);
    for (let i = 0; i < 7; i++) {
      const a = hash(i * 3.3) * TAU;
      const d = 300 + hash(i) * 440;
      drawBat(960 + Math.cos(a) * d, 430 + Math.sin(a) * d * 0.58, 9 + hash(i) * 12, Math.sin(t + i) * 0.25, C.ink, 0.65);
    }
    K.sparkles(t, 26, C.gold, 5, 820);

    // cake
    ctx.save();
    ctx.translate(1640, 890);
    ctx.rotate(0.06);
    fillRR(-76, -40, 152, 80, 8, C.cream, C.ink, 5);
    fillRR(-76, -58, 152, 22, 8, C.pink, C.ink, 5);
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = C.red;
      ctx.fillRect(-42 + i * 40, -84, 5, 28);
      circle(-40 + i * 40, -88, 7, C.gold, C.ink, 2);
    }
    ctx.restore();
  };
})();
