/* scenes 3 — proposal, rejection, scream, court, chase, caught, end */
(() => {
  'use strict';
  const M = window.MD;
  const K = window.SK;
  const {
    ctx, W, H, TAU, C, LOOKS, clamp, lerp, mod, smooth, easeOutCubic, easeOutBack,
    hash, rng, pathRR, fillRR, circle, drawStar, drawHeart, drawSparkle,
    drawText, measure, fitSize, halftone, radialBurst, speedLines, confetti,
    drawMoon, drawBat, drawPumpkin, drawZombieHand, drawCallingCard, drawWaxSeal,
    drawFrame, drawSpotlight, drawSticker, drawTeto, drawUi, drawJailBars,
    drawCandy, drawCookie, drawChocolate
  } = M;
  const S = window.SCENES = window.SCENES || {};

  // ─────────────────────────────────────────────────────────────── proposal
  S.proposal = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(0,0,0,.08)', 'rgba(0,0,0,.3)');
    radialBurst(960, 470, 1500, [look.bg, look.a, look.bg, look.b], t * 0.04, 0.2, 36);
    drawMoon(1560, 240, 160, { glow: true });
    drawSpotlight(1280, 100, 640, 'rgba(255,244,220,.3)', 0.9);

    // wedding arch
    ctx.save();
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(1280, 540, 300, Math.PI, TAU);
    ctx.stroke();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 4;
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = Math.PI + i / 7 * Math.PI;
      const x = 1280 + Math.cos(a) * 300;
      const y = 540 + Math.sin(a) * 300;
      circle(x, y, 12, C.cream, C.ink, 3);
      drawHeart(x, y - 18, 10, C.red, C.ink, 2, a);
    }
    ctx.restore();

    // giant ring box
    const open = smooth(clamp(lt / 0.7, 0, 1));
    ctx.save();
    ctx.translate(1290, 690);
    ctx.rotate(0.04);
    // box base
    fillRR(-170, -80, 340, 220, 16, C.purple, C.ink, 6);
    fillRR(-156, -66, 312, 190, 10, C.violet, C.ink, 2);
    // lid
    ctx.save();
    ctx.translate(-170, -80);
    ctx.rotate(-1.05 * open);
    fillRR(0, -150, 340, 150, 16, C.purple, C.ink, 6);
    fillRR(16, -136, 308, 120, 10, C.violet, C.ink, 2);
    ctx.restore();
    // ring
    ctx.save();
    ctx.translate(0, -150);
    ctx.scale(1 + m.pulse * 0.03, 1 + m.pulse * 0.03);
    ctx.beginPath();
    ctx.arc(0, 50, 64, 0, TAU);
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 18;
    ctx.stroke();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 5;
    ctx.stroke();
    // diamond
    ctx.beginPath();
    ctx.moveTo(-48, -10);
    ctx.lineTo(0, -118);
    ctx.lineTo(48, -10);
    ctx.lineTo(0, 34);
    ctx.closePath();
    ctx.fillStyle = C.cream;
    ctx.fill();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-48, -10);
    ctx.lineTo(48, -10);
    ctx.moveTo(0, -118);
    ctx.lineTo(0, 34);
    ctx.strokeStyle = 'rgba(7,6,13,.28)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
    ctx.restore();

    // Teto kneeling
    ctx.save();
    ctx.translate(560, 570);
    ctx.rotate(-0.02);
    drawTeto(0, 0, 152, { pose: 'kneel', wink: true, hat: true, mask: true });
    ctx.restore();

    K.giant(cue.word || 'MARRY ME?', 900, 174, 1500, 168, {
      color: C.red, stroke: C.ink, lw: 12, shadow: 10, tracking: -2
    });
    K.tag(cue.variant === 2 ? 'ONE MORE TIME!' : 'UI-CHAN, WILL YOU…?', 620, 300, C.cream, C.ink, -0.03, 18);

    for (let i = 0; i < 14; i++) {
      const a = hash(i * 4.7) * TAU;
      drawHeart(960 + Math.cos(a) * (400 + hash(i) * 420), 470 + Math.sin(a) * (280 + hash(i) * 160), 10 + hash(i) * 16, C.pink, C.ink, 3, a);
    }
    K.sparkles(t, 24, C.gold, 3, 860);
  };

  // ─────────────────────────────────────────────────────────────── reject
  S.reject = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(0,0,0,.1)', 'rgba(0,0,0,.32)');
    radialBurst(960, 470, 1500, [look.bg, look.a, look.bg, look.b], t * 0.08, 0.22, 36);

    // split background for 結婚?
    if (cue.word === '結婚?') {
      ctx.save();
      ctx.fillStyle = C.green;
      ctx.fillRect(0, 0, W / 2, H);
      ctx.fillStyle = C.purple;
      ctx.fillRect(W / 2, 0, W / 2, H);
      ctx.restore();
    }

    const k = easeOutBack(clamp(lt / 0.18, 0, 1));
    ctx.save();
    ctx.translate(820, 438);
    ctx.rotate(-0.06);
    ctx.scale(k, k);
    K.giant(cue.word || 'NO.', 0, 0, 1450, 330, {
      color: C.cream, stroke: C.ink, lw: 16, shadow: 14, jp: cue.word === '結婚?'
    });
    ctx.restore();

    // giant X
    ctx.save();
    ctx.strokeStyle = C.red;
    ctx.lineWidth = 26;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.moveTo(260, 230);
    ctx.lineTo(620, 640);
    ctx.moveTo(620, 230);
    ctx.lineTo(260, 640);
    ctx.stroke();
    ctx.restore();

    // broken heart
    ctx.save();
    ctx.translate(1540, 620);
    ctx.rotate(0.1);
    drawHeart(0, 0, 150, C.red, C.ink, 7);
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, -130);
    ctx.lineTo(-34, -50);
    ctx.lineTo(30, -8);
    ctx.lineTo(-16, 100);
    ctx.stroke();
    ctx.restore();

    // Ui, arms crossed
    ctx.save();
    ctx.translate(1650, 590);
    ctx.scale(0.8, 0.8);
    drawUi(0, 0, 120, { coat: C.gold });
    // crossed arms
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.moveTo(-100, 220);
    ctx.lineTo(100, 300);
    ctx.moveTo(100, 220);
    ctx.lineTo(-100, 300);
    ctx.stroke();
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 12;
    ctx.stroke();
    ctx.restore();

    // Teto reaction
    ctx.save();
    ctx.translate(240, 680);
    ctx.rotate(-0.08);
    drawTeto(0, 0, 106, { pose: 'shock', mask: true, hat: false });
    ctx.restore();

    K.tag(cue.word === '結婚?' ? 'する訳ないんだがー？' : 'REJECTED', 960, 780, C.ink, C.cream, -0.02, 18);
    K.sparkles(t, 8, C.ink, 1, 700);
  };

  // ─────────────────────────────────────────────────────────────── scream
  S.scream = (cue, next, m, lt, t) => {
    const flash = Math.pow(1 - m.phase, 3);
    const lightBg = flash > 0.6;
    const look = LOOKS[cue.look] || LOOKS.red;
    ctx.fillStyle = lightBg ? C.cream : (Math.floor(lt * 7) % 2 ? C.red : C.night);
    ctx.fillRect(-100, -100, W + 200, H + 200);

    // radial cracks
    ctx.save();
    ctx.translate(960, 450);
    ctx.strokeStyle = lightBg ? C.ink : C.cream;
    ctx.lineWidth = 6;
    for (let i = 0; i < 26; i++) {
      const a = hash(i * 3.7) * TAU;
      const r0 = 120 + hash(i) * 160;
      const r1 = 700 + hash(i + 4) * 500;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
      ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
      ctx.lineTo(Math.cos(a + 0.12) * (r1 * 0.7), Math.sin(a + 0.12) * (r1 * 0.7));
      ctx.stroke();
      ctx.lineWidth = 6;
    }
    ctx.restore();

    // giant scream
    const shake = Math.sin(t * 40) * 12 * (1 - clamp(lt / 2.4, 0, 1));
    ctx.save();
    ctx.translate(960 + shake, 430);
    ctx.rotate(-0.035);
    const fs = Math.min(300, fitSize(cue.word || 'НЕЕЕЕЕЕТ!', 300, 1680, false, 0));
    drawText(cue.word || 'НЕЕЕЕЕЕТ!', -14, 0, fs, {
      color: C.ink, stroke: null, lw: 0, shadow: 0, alpha: 0.55
    });
    drawText(cue.word || 'НЕЕЕЕЕЕТ!', 16, 6, fs, {
      color: C.cream, stroke: C.ink, lw: 12, shadow: 0, alpha: 0.55
    });
    drawText(cue.word || 'НЕЕЕЕЕЕТ!', 0, 0, fs, {
      color: C.cream, stroke: C.ink, lw: 14, shadow: 12
    });
    ctx.restore();

    // Teto screaming
    ctx.save();
    ctx.translate(240, 650);
    ctx.rotate(-0.07 + Math.sin(t * 8) * 0.02);
    drawTeto(0, 0, 120, { pose: 'shock', mask: true, hat: false });
    ctx.restore();

    // rejected stamp
    ctx.save();
    ctx.translate(1500, 690);
    ctx.rotate(0.14);
    fillRR(-250, -72, 500, 144, 8, 'rgba(255,46,77,.9)', C.cream, 6);
    drawText('REJECTED', 0, 0, 74, { color: C.cream, stroke: C.ink, lw: 6, shadow: 0, tracking: 3 });
    ctx.restore();

    // glitch slices
    for (let i = 0; i < 12; i++) {
      ctx.globalAlpha = 0.15 + hash(i) * 0.3;
      ctx.fillStyle = i % 2 ? C.cream : C.ink;
      ctx.fillRect(0, hash(i * 4.1) * H, W, 2 + hash(i) * 10);
    }
    ctx.globalAlpha = 1;

    // heartbeat at the tail
    if (lt > 2.2) {
      ctx.save();
      ctx.globalAlpha = smooth(clamp((lt - 2.2) / 0.3, 0, 1));
      ctx.strokeStyle = C.cream;
      ctx.lineWidth = 5;
      ctx.beginPath();
      const y = 780;
      ctx.moveTo(560, y);
      ctx.lineTo(760, y);
      ctx.lineTo(800, y - 70);
      ctx.lineTo(850, y + 60);
      ctx.lineTo(890, y);
      ctx.lineTo(1360, y);
      ctx.stroke();
      drawText('…', 960, 710, 90, { color: C.cream, stroke: C.ink, lw: 5, shadow: 0 });
      ctx.restore();
    }

    K.sparkles(t, 8, C.cream, 3, 760);
  };

  // ─────────────────────────────────────────────────────────────── court
  S.court = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(0,0,0,.35)', 'rgba(0,0,0,.5)');
    const verdict = cue.verdict || 'GUILTY';

    // courtroom columns / jury
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = 'rgba(7,6,13,.42)';
      ctx.fillRect(60 + i * 340, 0, 70, 680);
    }
    ctx.fillStyle = 'rgba(7,6,13,.55)';
    ctx.fillRect(0, 650, W, 430);
    // judge bench
    fillRR(590, 600, 740, 210, 12, '#3B2414', C.ink, 7);
    fillRR(640, 570, 640, 50, 8, C.gold, C.ink, 5);

    // gavel
    ctx.save();
    ctx.translate(360, 620);
    ctx.rotate(-0.5 + Math.sin(t * 12) * 0.05);
    fillRR(-26, -170, 52, 300, 18, C.brown, C.ink, 6);
    fillRR(-110, -190, 220, 90, 14, C.brown, C.ink, 6);
    ctx.restore();

    // giant verdict
    const k = easeOutBack(clamp(lt / 0.35, 0, 1));
    ctx.save();
    ctx.translate(960, 385);
    ctx.rotate(-0.045);
    ctx.scale(k, k);
    fillRR(-760, -200, 1520, 400, 16, 'rgba(0,0,0,.08)', C.cream, 8);
    fillRR(-730, -170, 1460, 340, 8, null, C.cream, 2);
    K.giant(verdict, 0, -4, 1420, 220, {
      color: look.a, stroke: C.ink, lw: 14, shadow: 12, tracking: -2
    });
    ctx.restore();

    // case tag
    K.tag('THE PEOPLE vs. TETO XXXI', 960, 146, C.cream, C.ink, -0.02, 16);
    K.tag('CASE #031', 1700, 160, C.red, C.cream, 0.03, 14);

    // Teto in the stand
    ctx.save();
    ctx.translate(1510, 700);
    ctx.rotate(0.05);
    drawTeto(0, 0, 116, { pose: verdict === 'GUILTY' ? 'caught' : 'point', wink: verdict !== 'GUILTY', hat: true, mask: true });
    ctx.restore();
    // witness stand
    fillRR(1310, 770, 400, 170, 8, '#3B2414', C.ink, 6);
    drawText('DEFENDANT', 1510, 810, 18, { color: C.gold, stroke: null, lw: 0, shadow: 0, tracking: 4 });

    // jury silhouettes
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = C.ink;
      circle(260 + i * 240, 742, 30, C.ink, null, 0);
      ctx.fillRect(230 + i * 240, 766, 60, 90);
    }

    // jail bars or freedom
    if (verdict === 'GUILTY') {
      drawJailBars(0, 0, W, H, 'rgba(7,6,13,.78)', 0.85, 120);
    } else if (verdict === 'NOT GUILTY') {
      confetti(t, [C.green, C.gold, C.cream, C.purple], 100, 1);
      // open cell door
      ctx.save();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 16;
      ctx.strokeRect(0, 60, 230, 720);
      ctx.restore();
    } else {
      drawSpotlight(960, 100, 760, 'rgba(255,244,220,.35)', 0.9);
      confetti(t, [C.gold, C.cream, C.green], 70, 0.8);
      if (lt > 1.4) {
        const run = easeOutCubic(clamp((lt - 1.4) / 1.1, 0, 1));
        ctx.save();
        ctx.translate(960 + run * 760, 760);
        ctx.rotate(-0.1);
        drawTeto(0, 0, 108, { pose: 'run', wink: true, hat: true, mask: true });
        ctx.restore();
        K.tag('BUT WAIT…', 960, 660, C.red, C.cream, -0.05, 22);
      }
    }

    K.sparkles(t, 10, C.gold, 4, 700);
  };

  // ─────────────────────────────────────────────────────────────── spotlight
  S.spotlight = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(0,0,0,.55)', 'rgba(0,0,0,.65)');
    // audience silhouettes
    for (let i = 0; i < 14; i++) {
      const x = 40 + i * 142;
      const y = 900 + hash(i) * 30;
      ctx.fillStyle = C.ink;
      circle(x, y, 34, C.ink, null, 0);
      ctx.fillRect(x - 32, y + 22, 64, 180);
    }
    // spotlights
    drawSpotlight(960, 40, 520, 'rgba(255,244,220,.4)', 1);
    drawSpotlight(320, 0, 380, 'rgba(177,140,255,.18)', 0.7);
    drawSpotlight(1600, 0, 380, 'rgba(255,122,24,.18)', 0.7);
    circle(960, 600, 290, 'rgba(255,244,220,.1)', C.cream, 4);

    ctx.save();
    ctx.translate(960, 540);
    ctx.rotate(-0.02);
    drawTeto(0, 0, 160, { pose: 'point', wink: true, hat: true, mask: true });
    ctx.restore();

    K.giant(cue.word || 'YOU GUYS~?', 960, 168, 1420, 160, {
      color: C.cream, stroke: C.ink, lw: 10, shadow: 8, tracking: 0
    });
    K.tag('ALL OF YOU', 960, 286, C.gold, C.ink, -0.03, 18);
    K.tag('WHO, ME?', 330, 700, C.cream, C.ink, -0.1, 16);
    K.tag('ME TOO?', 1630, 680, C.cream, C.ink, 0.1, 16);

    // hearts in the crowd
    for (let i = 0; i < 10; i++) {
      drawHeart(120 + hash(i * 4.1) * 1680, 760 + hash(i * 2.3) * 120, 10 + hash(i) * 14, C.pink, C.ink, 3, hash(i) * TAU);
    }
    K.sparkles(t, 18, C.gold, 5, 780);
  };

  // ─────────────────────────────────────────────────────────────── chase
  S.chase = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(0,0,0,.5)', 'rgba(0,0,0,.6)');
    const variant = cue.variant || 1;
    drawMoon(1540, 220, 180, { glow: true });
    K.citySkyline(760, '#05040B', C.gold, 0.9);

    // rooftops
    ctx.fillStyle = C.ink;
    ctx.beginPath();
    ctx.moveTo(0, 760);
    ctx.lineTo(520, 700);
    ctx.lineTo(820, 790);
    ctx.lineTo(1160, 680);
    ctx.lineTo(1500, 780);
    ctx.lineTo(1920, 700);
    ctx.lineTo(1920, 1080);
    ctx.lineTo(0, 1080);
    ctx.closePath();
    ctx.fill();

    // speed lines
    speedLines(960, 470, t * 2, 60, C.cream, 0.22);

    // searchlights
    drawSpotlight(500 + Math.sin(t * 1.3) * 300, 100, 500, 'rgba(255,244,220,.22)', 0.8);
    drawSpotlight(1500 + Math.sin(t * 1.1 + 2) * 260, 100, 500, 'rgba(255,122,24,.18)', 0.8);

    // Teto running
    const runBob = Math.abs(Math.sin(t * 8)) * 16;
    ctx.save();
    ctx.translate(700 + Math.sin(t * 1.1) * 40, 620 - runBob);
    ctx.rotate(-0.12);
    drawTeto(0, 0, 132, { pose: 'run', wink: true, hat: true, mask: true });
    ctx.restore();

    // Ui chasing
    ctx.save();
    ctx.translate(1180 + Math.sin(t * 1.1 + 0.5) * 30, 700 - Math.abs(Math.sin(t * 7)) * 10);
    ctx.rotate(0.03);
    ctx.scale(0.82, 0.82);
    drawUi(0, 0, 112, { coat: C.gold });
    // flashlight
    ctx.save();
    ctx.translate(70, -20);
    ctx.rotate(-0.18);
    ctx.fillStyle = C.cream;
    ctx.fillRect(0, 0, 90, 34);
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 90, 34);
    ctx.restore();
    ctx.restore();

    // big labels
    const labels = ['CATCH ME!', 'CAN’T CATCH ME!', 'IF YOU CAN…', 'ALMOST!'];
    K.giant(labels[(variant - 1) % labels.length], 960, 186, 1400, 130, {
      color: C.cream, stroke: C.ink, lw: 9, shadow: 7, tracking: 0
    });
    K.tag('ROOFTOP CHASE — 31st NIGHT', 960, 278, C.gold, C.ink, -0.02, 14);

    // searchlight beams / net
    if (variant === 3) {
      ctx.save();
      ctx.globalAlpha = 0.2;
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = C.cream;
        ctx.beginPath();
        ctx.moveTo(1540 + i * 20, 160);
        ctx.lineTo(700 + i * 180, 800);
        ctx.lineTo(780 + i * 180, 800);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
    if (variant === 4) {
      // net closing
      ctx.save();
      ctx.strokeStyle = C.cream;
      ctx.lineWidth = 3;
      for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.moveTo(180 + i * 140, 90);
        ctx.quadraticCurveTo(960, 500, 180 + i * 140, 880);
        ctx.stroke();
      }
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.moveTo(120, 140 + i * 110);
        ctx.quadraticCurveTo(960, 420 + i * 40, 1800, 140 + i * 110);
        ctx.stroke();
      }
      ctx.restore();
      K.tag('GOTCHA?', 960, 780, C.red, C.cream, -0.04, 22);
    }

    // bats
    for (let i = 0; i < 4; i++) {
      drawBat(300 + hash(i * 4.1) * 1300, 300 + hash(i * 2.2) * 260, 10 + hash(i) * 10, Math.sin(t + i) * 0.2, C.ink, 0.6);
    }
  };

  // ─────────────────────────────────────────────────────────────── caught
  S.caught = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(0,0,0,.06)', 'rgba(0,0,0,.3)');
    radialBurst(960, 480, 1500, [look.bg, look.a, look.bg, C.cream], t * 0.05, 0.24, 38);
    confetti(t, [C.green, C.gold, C.cream, C.purple], 90, 0.9);

    // giant net
    const drop = easeOutCubic(clamp(lt / 0.6, 0, 1));
    ctx.save();
    ctx.translate(0, (1 - drop) * -420);
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 4;
    for (let i = 0; i < 14; i++) {
      ctx.beginPath();
      ctx.moveTo(360 + i * 90, 300);
      ctx.quadraticCurveTo(960, 560, 360 + i * 90, 900);
      ctx.stroke();
    }
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      ctx.moveTo(300, 330 + i * 70);
      ctx.quadraticCurveTo(960, 400 + i * 50, 1620, 330 + i * 70);
      ctx.stroke();
    }
    // weights
    for (let i = 0; i < 5; i++) circle(360 + i * 300, 900, 16, C.gold, C.ink, 4);
    ctx.restore();

    // Teto caught
    ctx.save();
    ctx.translate(720, 600);
    ctx.rotate(0.05);
    drawTeto(0, 0, 150, { pose: 'caught', mask: true, hat: true });
    ctx.restore();

    // Ui triumphant
    ctx.save();
    ctx.translate(1390, 570);
    ctx.rotate(-0.04);
    ctx.scale(1.05, 1.05);
    drawUi(0, 0, 150, { coat: C.gold });
    // net handle
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(60, 280);
    ctx.lineTo(-120, 520);
    ctx.stroke();
    ctx.restore();

    // front net — only once it has fallen, and only over the bodies
    const front = smooth(clamp((drop - 0.65) / 0.35, 0, 1));
    if (front > 0.01) {
      ctx.save();
      ctx.globalAlpha = front * 0.42;
      ctx.translate(0, (1 - drop) * -420);
      ctx.beginPath();
      ctx.rect(0, 700, W, H - 700);
      ctx.clip();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 3;
      for (let i = 0; i < 14; i += 2) {
        ctx.beginPath();
        ctx.moveTo(360 + i * 90, 300);
        ctx.quadraticCurveTo(960, 560, 360 + i * 90, 900);
        ctx.stroke();
      }
      for (let i = 0; i < 9; i += 2) {
        ctx.beginPath();
        ctx.moveTo(300, 330 + i * 70);
        ctx.quadraticCurveTo(960, 400 + i * 50, 1620, 330 + i * 70);
        ctx.stroke();
      }
      ctx.restore();
    }

    K.giant(cue.word || 'CAUGHT!', 960, 190, 1500, 220, {
      color: C.cream, stroke: C.ink, lw: 14, shadow: 12, tracking: -3
    });
    K.tag('捕まえた！', 960, 318, C.red, C.cream, -0.04, 26);

    // case closed stamp
    const stampK = easeOutBack(clamp((lt - 0.9) / 0.3, 0, 1));
    if (stampK > 0.01) {
      ctx.save();
      ctx.translate(1560, 760);
      ctx.rotate(-0.16);
      ctx.scale(stampK, stampK);
      fillRR(-250, -76, 500, 152, 10, 'rgba(255,46,77,.92)', C.cream, 6);
      drawText('CASE CLOSED', 0, 0, 58, { color: C.cream, stroke: C.ink, lw: 6, shadow: 0, tracking: 1 });
      ctx.restore();
    }

    // little hearts
    for (let i = 0; i < 8; i++) {
      drawHeart(260 + hash(i * 4.1) * 1400, 400 + hash(i * 2.3) * 420, 9 + hash(i) * 12, C.red, C.ink, 3, hash(i) * TAU);
    }
    K.sparkles(t, 26, C.gold, 4, 860);
  };

  // ─────────────────────────────────────────────────────────────── end
  S.end = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(0,0,0,.55)', 'rgba(0,0,0,.7)');
    const fadeIn = smooth(clamp(lt / 1.0, 0, 1));
    drawMoon(1480, 260, 170, { glow: true });
    for (let i = 0; i < 28; i++) {
      const x = hash(i * 4.3) * W, y = hash(i * 9.1) * 700;
      if (i % 3 === 0) drawStar(x, y, 3 + hash(i) * 5, C.gold, null, 0, t * 0.1 + i);
      else circle(x, y, 1.2 + hash(i) * 2, C.cream, null, 0);
    }
    K.citySkyline(820, '#05040B', C.gold, 0.6);
    ctx.fillStyle = C.ink;
    ctx.fillRect(0, 860, W, 220);
    drawSpotlight(960, 100, 620, 'rgba(255,244,220,.2)', 0.8);

    ctx.save();
    ctx.globalAlpha = fadeIn;
    // giant title
    drawText('目撃！', 960, 250, 92, {
      color: C.cream, stroke: C.ink, lw: 7, shadow: 5, jp: true, tracking: 4
    });
    drawText('テト31世', 960, 390, 210, {
      color: C.red, stroke: C.ink, lw: 12, shadow: 10, jp: true, tracking: 6
    });
    drawText('TETO THE 31st', 960, 522, 74, {
      color: C.gold, stroke: C.ink, lw: 7, shadow: 5, tracking: 4
    });
    K.tag('HAPPY HALLOWEEN', 960, 606, C.green, C.ink, -0.02, 22);

    // calling card
    ctx.save();
    ctx.translate(1540, 650);
    ctx.rotate(-0.08);
    ctx.scale(0.62, 0.62);
    drawCallingCard(0, 0, 450, 288, 0, { top: 'PHANTOM THIEF', big: 'TETO', sub: 'THE 31st' });
    ctx.restore();

    // credits
    drawText('MUSIC & MOVIE / HALLO CEL', 960, 742, 20, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, tracking: 3, alpha: 0.85
    });
    drawText('MOTION CLIP / 2026', 960, 776, 15, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, tracking: 4, alpha: 0.5
    });
    drawText('SEE YOU NEXT HALLOWEEN', 960, 840, 18, {
      color: C.red, stroke: null, lw: 0, shadow: 0, tracking: 5, alpha: 0.9
    });

    // big 31
    ctx.save();
    ctx.globalAlpha = fadeIn * 0.16;
    drawText('31', 250, 760, 400, {
      color: C.cream, stroke: null, lw: 0, shadow: 0, tracking: -20
    });
    ctx.restore();
    ctx.restore();

    if (lt > 2.4) {
      drawText('🎃', 960, 930, 26, { color: C.gold, stroke: null, lw: 0, shadow: 0, alpha: 0.5 });
    }
    K.sparkles(t, 10, C.gold, 7, 700);
  };
})();
