/* scenes 2 — glitch, theft, the letter, P.S., museum, innocent, Ui */
(() => {
  'use strict';
  const M = window.MD;
  const K = window.SK;
  const {
    ctx, W, H, TAU, C, LOOKS, clamp, lerp, mod, smooth, easeOutCubic, easeOutBack,
    hash, rng, pathRR, fillRR, circle, drawStar, drawHeart, drawSparkle,
    drawText, measure, fitSize, halftone, radialBurst, speedLines, confetti,
    drawMoon, drawBat, drawPumpkin, drawZombieHand, drawCallingCard, drawWaxSeal,
    drawFrame, drawSpotlight, drawSticker, drawTeto, drawUi, drawCandy,
    drawCookie, drawChocolate, drawEvidenceTag
  } = M;
  const S = window.SCENES = window.SCENES || {};

  // ─────────────────────────────────────────────────────────────── glitch
  S.glitch = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(0,0,0,.5)', 'rgba(0,0,0,.55)');
    // static blocks
    for (let i = 0; i < 26; i++) {
      const x = hash(i * 5.7) * W;
      const y = hash(i * 2.9 + 1) * 810;
      ctx.globalAlpha = 0.08 + hash(i) * 0.2;
      ctx.fillStyle = i % 2 ? C.cyan : C.red;
      ctx.fillRect(x, y, 40 + hash(i + 4) * 280, 2 + hash(i + 9) * 10);
    }
    ctx.globalAlpha = 1;

    // language bubbles
    const bubbles = [
      ['WHAT?', 960, 150, -0.06],
      ['¿QUÉ?', 270, 230, 0.1],
      ['什么?', 1660, 220, -0.08],
      ['뭐야?', 330, 620, 0.04],
      ['WAS?', 1580, 640, -0.05],
      ['ЧТО?', 960, 756, 0.02]
    ];
    for (let i = 0; i < bubbles.length; i++) {
      const b = bubbles[i];
      const bob = Math.sin(t * 1.4 + i) * 10;
      ctx.save();
      ctx.translate(b[1], b[2] + bob);
      ctx.rotate(b[3]);
      fillRR(-125, -40, 250, 80, 30, C.paper, C.ink, 4);
      drawText(b[0], 0, 0, 28, { color: C.ink, stroke: null, lw: 0, shadow: 0, jp: true });
      ctx.restore();
    }

    // RGB-split word
    const word = cue.word || 'ENGLISH?';
    const fs = Math.min(210, fitSize(word, 210, 1500, false, 0));
    const jitter = Math.sin(t * 23) * 9 + (hash(Math.floor(t * 30)) - 0.5) * 16;
    ctx.save();
    ctx.translate(960, 430);
    ctx.rotate(-0.02);
    drawText(word, -10 + jitter, 0, fs, {
      color: C.cyan, stroke: null, lw: 0, shadow: 0, alpha: 0.55
    });
    drawText(word, 12 - jitter, 4, fs, {
      color: C.red, stroke: null, lw: 0, shadow: 0, alpha: 0.55
    });
    drawText(word, 0, 0, fs, {
      color: C.cream, stroke: C.ink, lw: 10, shadow: 6
    });
    ctx.restore();

    // error labels
    K.tag('TRANSLATION ERROR', 280, 750, C.ink, C.cream, -0.03, 14);
    K.tag('ERROR 031', 1680, 750, C.red, C.cream, 0.03, 14);

    // pixel noise
    for (let i = 0; i < 16; i++) {
      ctx.globalAlpha = 0.15 + hash(i) * 0.4;
      ctx.fillStyle = i % 2 ? C.cream : C.red;
      ctx.fillRect(hash(i * 11) * W, 120 + hash(i * 3) * 650, 4 + hash(i) * 22, 4 + hash(i) * 8);
    }
    ctx.globalAlpha = 1;

    // distressed Teto
    ctx.save();
    ctx.translate(180, 610);
    ctx.rotate(-0.08);
    drawTeto(0, 0, 100, { pose: 'shock', mask: true, hat: false });
    ctx.restore();
    for (let i = 0; i < 4; i++) {
      drawText('?', 260 + i * 42, 360 + Math.sin(t * 2 + i) * 18, 40 + i * 8, {
        color: C.gold, stroke: C.ink, lw: 4, shadow: 0, alpha: 0.9
      });
    }
  };

  // ─────────────────────────────────────────────────────────────── hit
  S.hit = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(0,0,0,.04)', 'rgba(0,0,0,.3)');
    radialBurst(960, 470, 1500, [look.bg, look.a, look.bg, look.b], t * 0.1, 0.28, 40);
    speedLines(960, 460, t, 52, look.ink, 0.18);

    // shape flavour
    if (cue.word === 'CANDY') {
      for (let i = 0; i < 5; i++) {
        const a = hash(i * 4.7) * TAU;
        drawCandy(960 + Math.cos(a) * 610, 460 + Math.sin(a) * 330, 0.7 + hash(i) * 0.5, a, [C.cream, C.red, C.gold][i % 3]);
      }
    } else if (cue.word === 'COOKIE') {
      for (let i = 0; i < 5; i++) {
        const a = hash(i * 5.7) * TAU;
        drawCookie(960 + Math.cos(a) * 620, 460 + Math.sin(a) * 330, 60 + hash(i) * 40, a);
      }
    } else if (cue.word === 'CHOCOLATE') {
      for (let i = 0; i < 6; i++) {
        const a = hash(i * 3.7) * TAU;
        drawChocolate(960 + Math.cos(a) * 640, 460 + Math.sin(a) * 330, 0.55 + hash(i) * 0.4, a + 0.2);
      }
    } else {
      for (let i = 0; i < 8; i++) {
        drawText('?', 220 + hash(i * 5.1) * 1480, 220 + hash(i * 2.3) * 500, 50 + hash(i) * 70, {
          color: look.a, stroke: C.ink, lw: 5, shadow: 0, alpha: 0.35, rot: (hash(i) - 0.5) * 0.6
        });
      }
    }

    const k = easeOutBack(clamp(lt / 0.26, 0, 1));
    ctx.save();
    ctx.translate(960, 430);
    ctx.scale(k, k);
    ctx.rotate(-0.025);
    const fs = Math.min(cue.jp ? 320 : 290, fitSize(cue.word || 'HIT', cue.jp ? 320 : 290, 1600, !!cue.jp, 0));
    drawText(cue.word || 'HIT', 0, 0, fs, {
      color: look.a, stroke: C.ink, lw: 16, shadow: 14, jp: !!cue.jp, tracking: -4
    });
    ctx.restore();

    if (cue.sub) {
      K.tag(cue.sub, 960, 706, C.cream, C.ink, -0.02, 22);
    }

    // ring
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.strokeStyle = look.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(960, 458, 780, 290, -0.03, 0, TAU);
    ctx.stroke();
    ctx.restore();

    K.sparkles(t, 22, look.ink, 5, 820);
  };

  // ─────────────────────────────────────────────────────────────── caution
  S.caution = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(0,0,0,.1)', 'rgba(0,0,0,.32)');
    radialBurst(960, 470, 1500, [look.bg, C.ink, look.bg, look.a], t * 0.02, 0.22, 30);

    // tape bands
    function tape(y, rot, fill) {
      ctx.save();
      ctx.translate(960, y);
      ctx.rotate(rot);
      ctx.fillStyle = fill;
      ctx.fillRect(-1200, -46, 2400, 92);
      ctx.fillStyle = C.ink;
      for (let x = -1200; x < 1200; x += 92) {
        ctx.beginPath();
        ctx.moveTo(x, -46);
        ctx.lineTo(x + 46, -46);
        ctx.lineTo(x + 92, 46);
        ctx.lineTo(x + 46, 46);
        ctx.closePath();
        ctx.globalAlpha = 0.18;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      for (let x = -1000; x < 1100; x += 320) {
        drawText('CAUTION!!', x, 0, 22, { color: C.ink, stroke: null, lw: 0, shadow: 0, alpha: 0.75, tracking: 2 });
      }
      ctx.restore();
    }
    tape(184, -0.1, C.gold);
    tape(760, 0.09, C.gold);

    // warning triangle
    ctx.save();
    ctx.translate(1580, 430);
    ctx.rotate(0.08);
    ctx.beginPath();
    ctx.moveTo(0, -170);
    ctx.lineTo(160, 130);
    ctx.lineTo(-160, 130);
    ctx.closePath();
    ctx.fillStyle = C.gold;
    ctx.fill();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 12;
    ctx.stroke();
    drawText('!', 0, 18, 190, { color: C.ink, stroke: null, lw: 0, shadow: 0 });
    ctx.restore();

    // giant word
    const k = easeOutBack(clamp(lt / 0.3, 0, 1));
    ctx.save();
    ctx.translate(760, 438);
    ctx.rotate(-0.04);
    ctx.scale(k, k);
    K.giant(cue.word || 'RECKLESS', 0, 0, 1120, 180, {
      color: C.cream, stroke: C.ink, lw: 12, shadow: 10
    });
    ctx.restore();

    // Japanese vertical
    ctx.save();
    ctx.translate(250, 470);
    ctx.rotate(Math.PI / 2);
    drawText(cue.jp || '無責任', 0, 0, 34, {
      color: C.ink, stroke: C.cream, lw: 5, shadow: 0, jp: true, tracking: 3
    });
    ctx.restore();

    // Teto with megaphone
    ctx.save();
    ctx.translate(1360, 690);
    ctx.rotate(0.03);
    drawTeto(0, 0, 114, { pose: 'point', wink: true, hat: false, mask: true });
    // megaphone
    ctx.save();
    ctx.translate(94, -28);
    ctx.rotate(-0.35);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(160, -74);
    ctx.lineTo(160, 74);
    ctx.closePath();
    ctx.fillStyle = C.red;
    ctx.fill();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.fillStyle = C.ink;
    ctx.fillRect(-26, -22, 36, 44);
    ctx.restore();
    ctx.restore();

    for (let i = 0; i < 8; i++) {
      ctx.save();
      ctx.translate(1210 + hash(i * 4.1) * 600, 200 + hash(i * 2.3) * 500);
      ctx.rotate(hash(i) * TAU);
      ctx.fillStyle = C.ink;
      ctx.globalAlpha = 0.18;
      ctx.fillRect(-16, -4, 32, 8);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  };

  // ─────────────────────────────────────────────────────────────── steal
  S.steal = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(0,0,0,.18)', 'rgba(0,0,0,.38)');
    const variant = cue.variant || 1;
    const pulse = 1 + m.pulse * 0.04;

    if (variant === 1) {
      drawSpotlight(1360, 120, 700, 'rgba(255,244,220,.3)', 0.9);
      // pedestal
      ctx.fillStyle = C.ink;
      ctx.fillRect(1220, 690, 320, 200);
      fillRR(1190, 660, 380, 46, 6, C.cream, C.ink, 5);
      // glass dome
      ctx.beginPath();
      ctx.arc(1380, 630, 150, Math.PI, TAU);
      ctx.lineTo(1530, 650);
      ctx.lineTo(1230, 650);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,244,220,.12)';
      ctx.fill();
      ctx.strokeStyle = C.cream;
      ctx.lineWidth = 4;
      ctx.stroke();
      // heart
      ctx.save();
      ctx.translate(1380, 590);
      ctx.scale(pulse, pulse);
      drawHeart(0, 0, 92, C.red, C.ink, 6);
      ctx.globalAlpha = 0.35;
      circle(0, 0, 120, C.red, null, 0);
      ctx.restore();
      // lasers
      ctx.save();
      ctx.strokeStyle = 'rgba(255,46,77,.65)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(1080, 760 - i * 34);
        ctx.lineTo(1660, 610 + i * 12);
        ctx.stroke();
      }
      ctx.restore();

      // Teto thief
      ctx.save();
      ctx.translate(530, 534);
      ctx.rotate(-0.03);
      drawTeto(0, 0, 152, { pose: 'point', wink: true, hat: true, mask: true });
      ctx.restore();

      K.giant(cue.word || '奪ったげるわ', 960, 246, 1220, 150, {
        color: C.gold, stroke: C.ink, lw: 10, shadow: 8, jp: true, tracking: 2
      });
      K.tag(cue.sub || 'I’LL STEAL YOU', 960, 358, C.cream, C.ink, -0.02, 20);

      // sack
      ctx.save();
      ctx.translate(730, 790);
      ctx.rotate(-0.1);
      ctx.beginPath();
      ctx.arc(0, 0, 100, 0, TAU);
      ctx.fillStyle = C.cream;
      ctx.fill();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.fillStyle = C.ink;
      drawText('$', 0, -4, 74, { color: C.ink, stroke: null, lw: 0, shadow: 0 });
      ctx.restore();
    } else if (variant === 2) {
      drawMoon(1500, 300, 250, { glow: true });
      // wings on heart
      drawHeart(1240, 500, 210 * pulse, C.red, C.ink, 8);
      ctx.save();
      ctx.translate(1240, 500);
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(side * 120, -40);
        ctx.quadraticCurveTo(side * 360, -220, side * 420, -90);
        ctx.quadraticCurveTo(side * 330, -40, side * 390, 40);
        ctx.quadraticCurveTo(side * 280, 20, side * 310, 120);
        ctx.quadraticCurveTo(side * 180, 40, side * 120, 40);
        ctx.closePath();
        ctx.fillStyle = C.cream;
        ctx.fill();
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 5;
        ctx.stroke();
      }
      ctx.restore();

      K.giant(cue.word || '初めて', 540, 300, 780, 260, {
        color: C.red, stroke: C.ink, lw: 14, shadow: 12, jp: true
      });
      K.tag(cue.sub || 'FOR THE FIRST TIME', 540, 456, C.purple, C.cream, -0.02, 19);

      ctx.save();
      ctx.translate(470, 650);
      ctx.rotate(-0.05);
      drawTeto(0, 0, 144, { pose: 'kneel', wink: true, hat: false, mask: true });
      ctx.restore();

      for (let i = 0; i < 8; i++) {
        drawHeart(900 + hash(i * 3.1) * 700, 300 + hash(i * 7.3) * 450, 12 + hash(i) * 20, C.pink, C.ink, 3, hash(i) * TAU);
      }
      K.sparkles(t, 22, C.gold, 4, 820);
    } else {
      // steal the whole audience
      ctx.save();
      ctx.fillStyle = C.ink;
      for (let i = 0; i < 18; i++) {
        const x = 40 + i * 108;
        const y = 840 + hash(i) * 40;
        circle(x, y, 34, C.ink, null, 0);
        ctx.fillRect(x - 30, y + 24, 60, 160);
      }
      ctx.restore();
      K.giant(cue.word || '全員', 500, 330, 700, 300, {
        color: C.cream, stroke: C.ink, lw: 14, shadow: 12, jp: true
      });
      K.tag(cue.sub || 'I’LL STEAL YOU ALL', 500, 490, C.ink, C.green, -0.02, 20);

      // net of hearts
      ctx.save();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 3;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(900, 120 + i * 80);
        ctx.quadraticCurveTo(1300, 300 + i * 60, 1820, 160 + i * 80);
        ctx.stroke();
      }
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.moveTo(980 + i * 120, 120);
        ctx.lineTo(980 + i * 120, 840);
        ctx.stroke();
      }
      ctx.restore();
      for (let i = 0; i < 12; i++) {
        drawHeart(980 + hash(i * 4.2) * 780, 200 + hash(i * 2.8) * 620, 14 + hash(i) * 16, C.red, C.ink, 3, hash(i) * TAU);
      }

      ctx.save();
      ctx.translate(1440, 610);
      ctx.rotate(0.06);
      drawTeto(0, 0, 140, { pose: 'point', wink: true, hat: true, mask: true });
      ctx.restore();
    }

    // sparkles and security tags
    K.sparkles(t, 14, C.gold, 8, 860);
    K.tag('SECURITY: 0%', 250, 760, C.ink, C.cream, -0.03, 13);
  };

  // ─────────────────────────────────────────────────────────────── tender
  S.tender = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(255,255,255,.18)', 'rgba(0,0,0,.14)');
    halftone(0, 0, W, H, C.pink, 0.1);
    for (let i = 0; i < 26; i++) {
      const x = hash(i * 3.9) * W;
      const y = mod(hash(i * 7.1) * H + t * 40, H);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(hash(i) * TAU + t * 0.2);
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = i % 3 ? C.pink : C.gold;
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 5, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    drawHeart(780, 480, 245 * (1 + m.pulse * 0.03), C.red, C.ink, 8);
    // bandage
    ctx.save();
    ctx.translate(820, 430);
    ctx.rotate(-0.5);
    fillRR(-140, -34, 280, 68, 30, C.cream, C.ink, 4);
    for (let i = 0; i < 5; i++) circle(-70 + i * 36, 0, 6, C.pink, null, 0);
    ctx.restore();

    drawText('NO PAIN', 760, 176, 160, {
      color: C.red, stroke: C.ink, lw: 10, shadow: 8, tracking: -2
    });
    K.tag(cue.jp || '痛くしないから', 760, 282, C.cream, C.ink, -0.03, 20);

    ctx.save();
    ctx.translate(1460, 610);
    ctx.rotate(0.03);
    drawTeto(0, 0, 148, { pose: 'idle', wink: true, hat: false, mask: true });
    ctx.restore();
    ctx.save();
    ctx.translate(1290, 380);
    ctx.rotate(-0.2);
    drawText('♡', 0, 0, 64, { color: C.pink, stroke: C.ink, lw: 4, shadow: 0 });
    ctx.restore();
    K.sparkles(t, 18, C.pink, 3, 780);
  };

  // ─────────────────────────────────────────────────────────────── letter
  S.letter = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(0,0,0,.35)', 'rgba(0,0,0,.5)');
    const dark = cue.look === 'cream' || cue.look === 'moon';
    const paper = dark ? C.night : C.paper;
    const ink = dark ? C.cream : C.ink;
    const accent = dark ? C.gold : C.red;

    // desk lines / red string
    ctx.save();
    ctx.strokeStyle = C.red;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.moveTo(0, 710);
    ctx.quadraticCurveTo(420, 620, 760, 680);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();

    // paper
    const inK = easeOutCubic(clamp(lt / 0.5, 0, 1));
    ctx.save();
    ctx.translate(910, 462 + (1 - inK) * 40);
    ctx.rotate(-0.045);
    ctx.shadowColor = 'rgba(0,0,0,.55)';
    ctx.shadowBlur = 34;
    ctx.shadowOffsetY = 18;
    fillRR(-515, -315, 1030, 630, 8, paper, C.ink, 6);
    ctx.shadowColor = 'transparent';
    fillRR(-490, -290, 980, 580, 4, null, ink, 2);
    // top lines
    ctx.globalAlpha = 0.45;
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = ink;
      ctx.fillRect(-430, 184 + i * 18, 860 - hash(i + 1) * 210, 3);
    }
    ctx.globalAlpha = 1;
    // header
    drawText('TO: EVERY GOOD KID', -430, -254, 18, {
      color: accent, stroke: null, lw: 0, shadow: 0, align: 'left', tracking: 2
    });
    drawText('FROM: TETO XXXI', 430, -254, 18, {
      color: accent, stroke: null, lw: 0, shadow: 0, align: 'right', tracking: 2
    });
    // stage text
    const stage = cue.stage || 'GOOD KIDS';
    const fs = Math.min(130, fitSize(stage, 130, 900, false, 0));
    drawText(stage, 0, -52, fs, {
      color: ink, stroke: null, lw: 0, shadow: 0, tracking: -2
    });
    drawText(cue.variant === 2 ? '█████' : 'WITH LOVE,', 0, 86, 28, {
      color: accent, stroke: null, lw: 0, shadow: 0, tracking: 4
    });
    // signature
    ctx.save();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 5;
    ctx.beginPath();
    const prog = clamp((lt - 0.5) / 1.3, 0, 1);
    ctx.moveTo(-360, 230);
    for (let i = 1; i <= 24; i++) {
      const p = i / 24;
      if (p > prog) break;
      ctx.lineTo(-360 + p * 520, 230 + Math.sin(p * 18) * 18);
    }
    ctx.stroke();
    ctx.restore();
    drawWaxSeal(390, 210, 66);
    ctx.restore();

    // typewriter foreground
    ctx.save();
    ctx.translate(340, 842);
    ctx.rotate(-0.08);
    fillRR(-230, -50, 460, 150, 24, C.night, C.ink, 6);
    fillRR(-180, -10, 360, 50, 12, C.cream, C.ink, 4);
    for (let i = 0; i < 10; i++) {
      circle(-150 + i * 34, 76, 13, C.cream, C.ink, 3);
    }
    ctx.restore();

    // Teto at the side
    ctx.save();
    ctx.translate(1730, 590);
    ctx.rotate(0.06);
    ctx.scale(0.8, 0.8);
    drawTeto(0, 0, 120, { pose: 'point', wink: true, hat: false, mask: true });
    ctx.restore();

    K.tag('SPECIAL DELIVERY', 960, 126, C.gold, C.ink, -0.03, 16);
    K.sparkles(t, 12, C.gold, 6, 760);
  };

  // ─────────────────────────────────────────────────────────────── redacted
  S.redacted = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(0,0,0,.22)', 'rgba(0,0,0,.36)');
    for (let i = 0; i < 10; i++) {
      ctx.save();
      ctx.translate(960 + Math.cos(t * 0.15 + i) * (240 + i * 34), 460 + Math.sin(t * 0.2 + i) * (160 + i * 18));
      ctx.rotate(hash(i) * TAU);
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = C.cream;
      ctx.fillRect(-140, -90, 280, 180);
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    // folder
    ctx.save();
    ctx.translate(960, 470);
    ctx.rotate(-0.025);
    fillRR(-560, -300, 1120, 620, 10, '#D6B36A', C.ink, 7);
    fillRR(-560, -340, 370, 90, 12, '#E5C47B', C.ink, 7);
    fillRR(-510, -255, 1020, 540, 4, C.paper, C.ink, 4);
    ctx.restore();

    // classified stamps
    ctx.save();
    ctx.translate(960, 480);
    ctx.rotate(-0.1);
    ctx.globalAlpha = 0.9;
    drawText('CLASSIFIED', 0, -176, 92, {
      color: C.red, stroke: C.ink, lw: 7, shadow: 0, tracking: 4
    });
    ctx.restore();

    // censor bars animated
    const bars = [240, 372, 504, 636];
    for (let i = 0; i < bars.length; i++) {
      const slide = smooth(clamp((lt - i * 0.08) / 0.35, 0, 1));
      const w = 780 * slide;
      fillRR(960 - w / 2, bars[i] - 26, w, 52, 4, C.ink, null, 0);
    }

    // eyes peeking above a bar
    ctx.save();
    ctx.translate(960, 438);
    ctx.globalAlpha = 0.9;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(side * 84, 0, 58, 34, 0, 0, TAU);
      ctx.fillStyle = C.cream;
      ctx.fill();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 4;
      ctx.stroke();
      circle(side * 84 + 8, 0, 15, C.teto, null, 0);
      circle(side * 84 + 3, -4, 5, C.cream, null, 0);
    }
    ctx.restore();

    // giant word
    ctx.save();
    ctx.translate(960, 322);
    drawText(cue.word || '█████', 0, 0, 190, {
      color: C.ink, stroke: C.cream, lw: 6, shadow: 0, tracking: 4
    });
    ctx.restore();

    K.tag('TOP SECRET', 300, 180, C.ink, C.cream, -0.04, 17);
    K.tag('CASE #031', 1620, 180, C.ink, C.cream, 0.04, 17);
    drawEvidenceTag(280, 760, -0.08, 'EVIDENCE');
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.translate(1500 + hash(i * 3.3) * 300, 690 + hash(i * 2.1) * 100);
      ctx.rotate(hash(i) * TAU);
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = C.ink;
      ctx.fillRect(-60, -20, 120, 40);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  };

  // ─────────────────────────────────────────────────────────────── signature
  S.signature = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(0,0,0,.1)', 'rgba(0,0,0,.3)');
    drawMoon(1540, 260, 160, { glow: true });
    K.sparkles(t, 20, C.gold, 5, 800);

    const k = easeOutCubic(clamp(lt / 0.5, 0, 1));
    ctx.save();
    ctx.translate(960, 480);
    ctx.rotate(-0.055 + (1 - k) * 0.08);
    ctx.scale(0.9 + k * 0.1, 0.9 + k * 0.1);
    ctx.shadowColor = 'rgba(0,0,0,.5)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 16;
    fillRR(-590, -340, 1180, 680, 12, C.paper, C.ink, 7);
    ctx.shadowColor = 'transparent';
    fillRR(-556, -306, 1112, 612, 5, null, C.ink, 2);

    drawText('CALLING CARD', 0, -252, 22, {
      color: C.red, stroke: null, lw: 0, shadow: 0, tracking: 7
    });
    drawText('TETO', 0, -106, 160, {
      color: C.red, stroke: C.ink, lw: 9, shadow: 0, tracking: -2
    });
    drawText('THE 31st', 0, -12, 64, {
      color: C.ink, stroke: null, lw: 0, shadow: 0, tracking: 5
    });
    drawText('WILL STEAL YOUR HEART', 0, 58, 24, {
      color: C.ink, stroke: null, lw: 0, shadow: 0, tracking: 3
    });

    // signature
    const prog = clamp((lt - 0.6) / 1.4, 0, 1);
    ctx.save();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-300, 190);
    for (let i = 1; i <= 40; i++) {
      const p = i / 40;
      if (p > prog) break;
      ctx.lineTo(-300 + p * 610, 190 + Math.sin(p * 22) * 24 - Math.sin(p * 7) * 10);
    }
    ctx.stroke();
    ctx.restore();

    drawWaxSeal(430, 186, 70);
    ctx.restore();

    K.giant(cue.word || 'from TETO XXXI', 960, 126, 1300, 54, {
      color: C.cream, stroke: C.ink, lw: 5, shadow: 0, tracking: 4
    });

    // fountain pen
    ctx.save();
    ctx.translate(1500, 700 + Math.sin(t * 1.4) * 8);
    ctx.rotate(-0.7);
    fillRR(-26, -150, 52, 300, 18, C.night, C.ink, 5);
    ctx.fillStyle = C.gold;
    ctx.fillRect(-20, -70, 40, 16);
    ctx.beginPath();
    ctx.moveTo(-26, 150);
    ctx.lineTo(26, 150);
    ctx.lineTo(0, 196);
    ctx.closePath();
    ctx.fillStyle = C.cream;
    ctx.fill();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  };

  // ─────────────────────────────────────────────────────────────── P.S.
  S.ps = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(0,0,0,.35)', 'rgba(0,0,0,.45)');
    const dark = cue.variant === 2;
    const paper = dark ? C.night : C.paper;
    const ink = dark ? C.cream : C.ink;

    drawSpotlight(960, 100, 900, 'rgba(255,244,220,.22)', 0.8);

    // paper roll
    ctx.save();
    ctx.translate(960, 420 - Math.min(20, lt * 18));
    ctx.rotate(-0.02);
    ctx.shadowColor = 'rgba(0,0,0,.5)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 16;
    fillRR(-420, -300, 840, 640, 6, paper, C.ink, 6);
    ctx.shadowColor = 'transparent';
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = ink;
      ctx.fillRect(-350, 110 + i * 20, 700 - hash(i) * 180, 3);
    }
    ctx.globalAlpha = 1;

    const psWord = cue.word || 'P.S.';
    const psSize = Math.min(210, fitSize(psWord, 210, 720, false, -1));
    drawText(psWord, 0, -122, psSize, {
      color: dark ? C.gold : C.red, stroke: C.ink, lw: 9, shadow: 0, tracking: -1
    });
    drawText(cue.variant === 2 ? 'ちなみに 僕は～' : 'ひとことだけ…', 0, 62, 34, {
      color: ink, stroke: null, lw: 0, shadow: 0, jp: true, tracking: 2
    });
    drawText('P.S. — I HAVE ONE MORE THING TO SAY', 0, 246, 15, {
      color: dark ? C.green : C.ink, stroke: null, lw: 0, shadow: 0, tracking: 2, alpha: 0.7
    });
    ctx.restore();

    // typewriter
    ctx.save();
    ctx.translate(960, 866);
    fillRR(-330, -66, 660, 190, 28, C.night, C.ink, 7);
    fillRR(-260, -20, 520, 56, 14, C.cream, C.ink, 4);
    for (let row = 0; row < 3; row++) {
      for (let i = 0; i < 11; i++) {
        circle(-230 + i * 46 + (row % 2) * 22, 54 + row * 30, 12, C.cream, C.ink, 3);
      }
    }
    ctx.fillStyle = C.red;
    ctx.fillRect(-330, -66, 660, 12);
    ctx.restore();

    // flying sheets
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.translate(260 + hash(i * 3.7) * 1400, 210 + hash(i * 5.1) * 460);
      ctx.rotate(hash(i) * TAU + t * 0.2);
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = C.paper;
      ctx.fillRect(-56, -72, 112, 144);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    K.tag('DEAR UI-CHAN', 350, 160, C.gold, C.ink, -0.04, 15);
  };

  // ─────────────────────────────────────────────────────────────── museum
  S.museum = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(0,0,0,.3)', 'rgba(0,0,0,.45)');
    // columns
    for (let i = 0; i < 4; i++) {
      const x = 30 + i * 500;
      ctx.fillStyle = 'rgba(7,6,13,.55)';
      ctx.fillRect(x, 0, 90, 760);
      ctx.fillStyle = 'rgba(255,244,220,.08)';
      for (let j = 0; j < 6; j++) ctx.fillRect(x + 16, 80 + j * 110, 58, 8);
    }
    // floor
    K.stageFloor(760, C.cream, C.ink, C.ink);

    // frames
    drawFrame(560, 420, 300, 380, -0.02, 0, C.ink);
    drawFrame(960, 400, 340, 420, 0.015, 1, C.ink);
    drawFrame(1360, 420, 300, 380, 0.03, 2, C.ink);

    // spotlights
    drawSpotlight(560, 100, 360, 'rgba(255,244,220,.2)', 0.7);
    drawSpotlight(960, 80, 400, 'rgba(255,210,74,.22)', 0.8);
    drawSpotlight(1360, 100, 360, 'rgba(255,122,24,.16)', 0.7);

    // velvet rope
    ctx.save();
    ctx.strokeStyle = C.red;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(320, 830);
    ctx.quadraticCurveTo(960, 900, 1600, 830);
    ctx.stroke();
    for (const x of [320, 1600]) {
      circle(x, 810, 22, C.gold, C.ink, 4);
      ctx.fillStyle = C.ink;
      ctx.fillRect(x - 8, 810, 16, 120);
    }
    ctx.restore();

    // Teto sneaking
    ctx.save();
    ctx.translate(960 + Math.sin(t * 2) * 18, 690);
    ctx.rotate(-0.03);
    drawTeto(0, 0, 100, { pose: 'run', wink: true, hat: true, mask: true });
    ctx.restore();

    // red laser grid
    ctx.save();
    ctx.strokeStyle = 'rgba(255,46,77,.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(380, 690 + i * 26);
      ctx.lineTo(1540, 620 + i * 34);
      ctx.stroke();
    }
    ctx.restore();

    K.tag('I WOULD NEVER…', 960, 154, C.cream, C.ink, -0.02, 18);
    K.tag('MUSEUM OF FINE HEARTS', 960, 196, C.ink, C.gold, 0.01, 12);

    if (cue.stamp) {
      ctx.save();
      ctx.translate(960, 480);
      ctx.rotate(-0.12);
      const k = easeOutBack(clamp(lt / 0.25, 0, 1));
      ctx.scale(k, k);
      fillRR(-600, -110, 1200, 220, 12, 'rgba(255,46,77,.9)', C.cream, 7);
      drawText(cue.stamp, 0, 0, 124, {
        color: C.cream, stroke: C.ink, lw: 9, shadow: 0, tracking: 2
      });
      ctx.restore();
      K.sparkles(t, 10, C.gold, 2, 700);
    }
  };

  // ─────────────────────────────────────────────────────────────── innocent
  S.innocent = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(255,255,255,.2)', 'rgba(0,0,0,.18)');
    halftone(0, 0, W, H, C.green, 0.08);
    radialBurst(960, 430, 1400, [look.bg, look.a, look.bg, C.cream], t * 0.03, 0.13, 32);

    // halo
    ctx.save();
    ctx.translate(960, 270);
    ctx.rotate(-0.12);
    ctx.beginPath();
    ctx.ellipse(0, 0, 230, 54, 0, 0, TAU);
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 22;
    ctx.stroke();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();

    // wings
    ctx.save();
    ctx.translate(960, 500);
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 120, -60);
      ctx.quadraticCurveTo(side * 420, -220, side * 520, -80);
      ctx.quadraticCurveTo(side * 390, -40, side * 470, 40);
      ctx.quadraticCurveTo(side * 320, 20, side * 360, 120);
      ctx.quadraticCurveTo(side * 200, 50, side * 120, 40);
      ctx.closePath();
      ctx.fillStyle = C.cream;
      ctx.fill();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 5;
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.translate(960, 520);
    ctx.rotate(0.02);
    drawTeto(0, 0, 156, { pose: 'idle', wink: true, hat: false, mask: false });
    ctx.restore();

    // clasped hands
    ctx.save();
    ctx.translate(960, 718);
    ctx.rotate(-0.03);
    circle(-22, 0, 30, C.skin, C.ink, 4);
    circle(22, 0, 30, C.skin, C.ink, 4);
    ctx.restore();

    K.giant(cue.word || 'I’M NOT LYING!', 960, 168, 1500, 170, {
      color: look.a, stroke: C.ink, lw: 11, shadow: 9, tracking: -1
    });
    K.tag(cue.variant === 2 ? 'ボクじゃないわ' : 'ほ、本当だよ？', 960, 780, C.cream, C.ink, -0.02, 19);

    // Ui, unimpressed
    ctx.save();
    ctx.translate(1660, 590);
    ctx.scale(0.72, 0.72);
    drawUi(0, 0, 110, { coat: C.gold });
    ctx.restore();
    drawText('…', 1700, 400, 80, { color: C.ink, stroke: null, lw: 0, shadow: 0, alpha: 0.8 });

    K.sparkles(t, 20, C.gold, 4, 760);
  };

  // ─────────────────────────────────────────────────────────────── ui
  S.ui = (cue, next, m, lt, t) => {
    const look = K.bg(cue, 'rgba(0,0,0,.45)', 'rgba(0,0,0,.55)');
    drawMoon(1520, 250, 170, { glow: true });
    K.rain(t, 'rgba(180,200,255,.28)', 110);
    drawSpotlight(1280, 100, 620, 'rgba(255,244,220,.3)', 0.9);

    // wet floor
    ctx.save();
    ctx.globalAlpha = 0.16;
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 ? C.gold : C.cream;
      ctx.fillRect(780 + i * 80, 760 + i * 14, 60, 5);
    }
    ctx.restore();

    // umbrella
    ctx.save();
    ctx.translate(1280, 340);
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, 230, Math.PI, TAU);
    ctx.stroke();
    ctx.fillStyle = C.cream;
    ctx.beginPath();
    ctx.arc(0, 0, 230, Math.PI, TAU);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 4;
    ctx.stroke();
    for (let i = 0; i <= 4; i++) {
      const a = Math.PI + i / 4 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * 230, Math.sin(a) * 230);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 260);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-30, 260, 30, 0, Math.PI);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(1280, 570);
    ctx.rotate(0.02);
    drawUi(0, 0, 160, { coat: C.gold });
    ctx.restore();

    // Teto offering heart
    const slide = easeOutCubic(clamp(lt / 0.7, 0, 1));
    ctx.save();
    ctx.translate(560 + (1 - slide) * -300, 620);
    ctx.rotate(-0.03);
    drawTeto(0, 0, 130, { pose: 'point', wink: true, hat: false, mask: true });
    ctx.restore();
    drawHeart(760 + (1 - slide) * -300, 632, 62 * (1 + m.pulse * 0.04), C.red, C.ink, 5, -0.12);

    const uiWord = cue.word || 'UI-CHAN…';
    const uiSize = Math.min(150, fitSize(uiWord, 150, 720, false, 1));
    drawText(uiWord, 232, 170, uiSize, {
      color: C.cream, stroke: C.ink, lw: 9, shadow: 7, tracking: 1, align: 'left'
    });
    K.tag('PLEASE LISTEN TO ME', 430, 286, C.purple, C.cream, -0.02, 17);
    K.sparkles(t, 14, C.gold, 7, 800);
  };
})();
