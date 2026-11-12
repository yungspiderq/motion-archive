/* shared scene kit — 目撃！テト３１世 */
(() => {
  'use strict';
  const M = window.MD;
  const {
    ctx, W, H, TAU, C, LOOKS, clamp, lerp, mod, smooth, easeOutCubic, easeOutBack,
    hash, rng, pathRR, fillRR, circle, drawStar, drawHeart, drawSparkle,
    drawText, measure, fitSize, halftone, dotPattern, checker, radialBurst,
    speedLines, confetti, drawMoon, drawBat, drawPumpkin, drawZombieHand,
    drawCandy, drawCookie, drawChocolate, drawWaxSeal, drawCallingCard,
    drawFrame, drawSpotlight, drawJailBars, drawSticker, drawEvidenceTag,
    drawTeto, drawUi
  } = M;

  function bg(cue, top, bottom) {
    const look = LOOKS[cue.look] || LOOKS.night;
    ctx.fillStyle = look.bg;
    ctx.fillRect(-100, -100, W + 200, H + 200);
    if (top || bottom) {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, top || 'rgba(0,0,0,0)');
      g.addColorStop(1, bottom || 'rgba(0,0,0,.35)');
      ctx.fillStyle = g;
      ctx.fillRect(-100, -100, W + 200, H + 200);
    }
    return look;
  }

  function tag(text, x, y, fill, color, rot = 0, size = 15) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    const w = measure(text, size) + size * 2.1;
    fillRR(-w / 2, -size * 0.9, w, size * 1.8, size, fill || C.gold, C.ink, 3);
    drawText(text, 0, 0, size, {
      color: color || C.ink, stroke: null, lw: 0, shadow: 0, tracking: 1.2
    });
    ctx.restore();
  }

  function giant(text, x, y, maxW, size, opt = {}) {
    const s = Math.min(size, fitSize(text, size, maxW, !!opt.jp, opt.tracking || 0));
    drawText(text, x, y, s, opt);
    return s;
  }

  function panel(x, y, w, h, r, fill, stroke = C.ink, lw = 4) {
    fillRR(x, y, w, h, r, fill, stroke, lw);
  }

  function stageFloor(y, c1, c2, ink = C.ink) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(-100, y, W + 200, H - y + 100);
    ctx.clip();
    const horizon = y;
    const vpx = W / 2;
    for (let i = -12; i <= 12; i++) {
      ctx.beginPath();
      ctx.moveTo(vpx + i * 26, horizon);
      ctx.lineTo(vpx + i * 180, H + 80);
      ctx.strokeStyle = ink;
      ctx.globalAlpha = 0.16;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    const rows = 9;
    for (let j = 0; j < rows; j++) {
      const p = Math.pow(j / rows, 1.8);
      const yy = horizon + p * (H - horizon + 120);
      ctx.beginPath();
      ctx.moveTo(-100, yy);
      ctx.lineTo(W + 100, yy);
      ctx.globalAlpha = 0.16;
      ctx.strokeStyle = ink;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.globalAlpha = 0.22;
    checker(0, horizon, W, H - horizon, 90, c1, c2, 0, 0, 0.4);
    ctx.restore();
  }

  function sparkles(t, count, color, seed = 0, maxR = 900) {
    for (let i = 0; i < count; i++) {
      const a = hash(i * 3.1 + seed) * TAU + t * (0.1 + hash(i + seed) * 0.3);
      const rad = 120 + hash(i * 7.7 + seed) * maxR;
      const x = W / 2 + Math.cos(a) * rad;
      const y = H / 2 + Math.sin(a) * rad * 0.62;
      drawSparkle(x, y, 4 + hash(i + 4.2) * 14, color, a, 0.4 + hash(i + 9) * 0.6);
    }
  }

  function questionIcon(kind, x, y, s, color, ink = C.ink, alpha = 1) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.strokeStyle = ink;
    ctx.lineWidth = Math.max(4, s * 0.045);
    ctx.lineJoin = 'round';
    if (kind === 'heel') {
      ctx.rotate(-0.14);
      ctx.beginPath();
      ctx.moveTo(-s * 0.58, s * 0.22);
      ctx.quadraticCurveTo(-s * 0.5, s * 0.46, -s * 0.28, s * 0.46);
      ctx.lineTo(s * 0.32, s * 0.46);
      ctx.quadraticCurveTo(s * 0.6, s * 0.4, s * 0.62, s * 0.12);
      ctx.quadraticCurveTo(s * 0.62, -s * 0.18, s * 0.42, -s * 0.3);
      ctx.lineTo(s * 0.34, s * 0.02);
      ctx.lineTo(s * 0.04, s * 0.06);
      ctx.quadraticCurveTo(-s * 0.1, -s * 0.2, -s * 0.2, -s * 0.46);
      ctx.lineTo(-s * 0.46, -s * 0.46);
      ctx.lineTo(-s * 0.58, s * 0.22);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s * 0.42, s * 0.42);
      ctx.lineTo(s * 0.32, s * 0.42);
      ctx.strokeStyle = 'rgba(7,6,13,.3)';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (kind === 'heart') {
      drawHeart(0, 0, s * 0.62, color, ink, Math.max(4, s * 0.045));
      circle(s * 0.18, -s * 0.18, s * 0.11, ink, null, 0);
      circle(s * 0.18, -s * 0.18, s * 0.06, C.cream, null, 0);
      ctx.strokeStyle = ink;
      ctx.lineWidth = s * 0.025;
      ctx.beginPath();
      ctx.moveTo(-s * 0.12, -s * 0.24);
      ctx.lineTo(-s * 0.3, -s * 0.02);
      ctx.lineTo(-s * 0.12, s * 0.08);
      ctx.stroke();
    } else if (kind === 'grow') {
      // diamond + growth arrow
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.3);
      ctx.lineTo(s * 0.36, -s * 0.02);
      ctx.lineTo(0, s * 0.42);
      ctx.lineTo(-s * 0.36, -s * 0.02);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s * 0.16, s * 0.04);
      ctx.lineTo(0, s * 0.18);
      ctx.lineTo(s * 0.16, s * 0.02);
      ctx.strokeStyle = 'rgba(7,6,13,.3)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.strokeStyle = ink;
      ctx.lineWidth = s * 0.05;
      ctx.beginPath();
      ctx.moveTo(-s * 0.44, s * 0.3);
      ctx.lineTo(-s * 0.1, -s * 0.06);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s * 0.16, -s * 0.08);
      ctx.lineTo(-s * 0.08, -s * 0.06);
      ctx.lineTo(-s * 0.1, s * 0.02);
      ctx.stroke();
      drawText('?', s * 0.42, -s * 0.45, s * 0.42, { color: ink, stroke: null, lw: 0, shadow: 0 });
    } else if (kind === 'beat') {
      drawHeart(-s * 0.28, 0, s * 0.34, color, ink, Math.max(3, s * 0.04));
      ctx.strokeStyle = color;
      ctx.lineWidth = s * 0.055;
      ctx.beginPath();
      ctx.moveTo(-s * 0.66, s * 0.06);
      ctx.lineTo(-s * 0.38, s * 0.06);
      ctx.lineTo(-s * 0.26, -s * 0.2);
      ctx.lineTo(-s * 0.1, s * 0.34);
      ctx.lineTo(s * 0.06, -s * 0.06);
      ctx.lineTo(s * 0.24, s * 0.06);
      ctx.lineTo(s * 0.62, s * 0.06);
      ctx.stroke();
      ctx.strokeStyle = ink;
      ctx.lineWidth = s * 0.018;
      ctx.stroke();
    } else {
      // uh...
      for (let i = 0; i < 3; i++) circle((i - 1) * s * 0.3, s * 0.08, s * 0.09, color, ink, Math.max(2, s * 0.025));
      ctx.beginPath();
      ctx.moveTo(-s * 0.4, -s * 0.34);
      ctx.quadraticCurveTo(-s * 0.5, -s * 0.05, -s * 0.34, -s * 0.02);
      ctx.quadraticCurveTo(-s * 0.2, -s * 0.05, -s * 0.3, -s * 0.34);
      ctx.closePath();
      ctx.fillStyle = C.cyan;
      ctx.fill();
      ctx.strokeStyle = ink;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.restore();
  }

  function citySkyline(baseY, color, litColor, alpha = 1) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    let x = -80;
    let i = 0;
    while (x < W + 80) {
      const w = 70 + hash(i * 5.1) * 130;
      const h = 90 + hash(i * 2.7 + 1) * 260;
      ctx.fillStyle = color;
      ctx.fillRect(x, baseY - h, w, h + 200);
      // windows
      ctx.fillStyle = litColor;
      for (let row = 0; row < Math.floor(h / 46); row++) {
        for (let col = 0; col < Math.floor(w / 34); col++) {
          if (hash(i * 31 + row * 7 + col * 3) > 0.58) {
            ctx.globalAlpha = alpha * (0.25 + hash(i + row + col) * 0.5);
            ctx.fillRect(x + 14 + col * 34, baseY - h + 18 + row * 46, 10, 16);
          }
        }
      }
      ctx.globalAlpha = alpha;
      // roof
      if (hash(i * 9.3) > 0.55) {
        ctx.fillStyle = color;
        ctx.fillRect(x + w * 0.3, baseY - h - 34, w * 0.4, 34);
      }
      x += w + 12;
      i++;
    }
    ctx.restore();
  }

  function bunting(y, colors, alpha = 1) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-40, y);
    ctx.quadraticCurveTo(W / 2, y + 80, W + 40, y);
    ctx.stroke();
    for (let i = 0; i < 16; i++) {
      const p = i / 15;
      const x = lerp(-40, W + 40, p);
      const yy = y + Math.sin(p * Math.PI) * 80;
      ctx.beginPath();
      ctx.moveTo(x - 32, yy);
      ctx.lineTo(x + 32, yy);
      ctx.lineTo(x, yy + 62);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.restore();
  }

  function lightBeam(x, y, width, color, alpha = 0.22) {
    drawSpotlight(x, y, width, color, alpha);
  }

  function rain(t, color = 'rgba(180,200,255,.35)', count = 90) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    for (let i = 0; i < count; i++) {
      const x = mod(hash(i * 4.7) * W + t * 80, W + 100) - 50;
      const y = mod(hash(i * 8.1) * H + t * 900, H + 100) - 50;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 10, y + 42);
      ctx.stroke();
    }
    ctx.restore();
  }

  window.SK = {
    bg, tag, giant, panel, stageFloor, sparkles, questionIcon, citySkyline,
    bunting, lightBeam, rain
  };
})();
