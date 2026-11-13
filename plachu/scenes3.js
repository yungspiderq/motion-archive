/* PLACHU — scenes, part 3.
   Literal shots: each lyric that names a thing gets that thing on screen. */
(function () {
  "use strict";
  const L = window.LIB;
  const W = 1920,
    H = 1080;
  const S = (window.SCENES = window.SCENES || {});
  const INK = "rgba(24,20,22,0.9)";
  const RED = "rgba(158,26,33,0.86)";

  function plate(key, seed, fn) {
    return PLATE(key, () => {
      const c = L.make(W, H);
      const x = c.getContext("2d");
      L.paintPaper(x, W, H, seed);
      fn(x);
      return c;
    });
  }

  function ink(x, pts, w, seed, alpha) {
    L.inkStroke(x, pts, w, alpha == null ? INK : "rgba(24,20,22," + alpha + ")", seed, { passes: 1, jitter: 1.6 });
  }

  function coldWash(x, seed) {
    L.wash(x, W * 0.5, H * 0.22, 1080, 470, "rgba(146,156,168,0.4)", seed, { alpha: 0.6, layers: 18 });
    L.wash(x, W * 0.8, H * 0.5, 520, 360, "rgba(120,130,146,0.24)", seed + 1, { alpha: 0.5 });
  }

  // ------------------------------------------------------------------ WINTER
  S.winter = function (st) {
    const { ctx, lt, seed, p } = st;
    const art = plate("winter:" + (p.variant || 0), 3301, (x) => {
      coldWash(x, 3302);
      L.wash(x, W * 0.5, H * 0.9, 1300, 300, "rgba(240,242,244,0.92)", 3304, { alpha: 0.95 });
      x.strokeStyle = "rgba(108,114,124,0.5)";
      x.lineWidth = 3;
      x.beginPath();
      x.moveTo(0, H * 0.795);
      x.bezierCurveTo(W * 0.32, H * 0.755, W * 0.66, H * 0.82, W, H * 0.775);
      x.stroke();
      // bare tree, drawn as tapered brush strokes
      const r = L.R(3310);
      x.save();
      x.lineCap = "round";
      const branch = (x0, y0, ang, len, w, d) => {
        const x1 = x0 + Math.cos(ang) * len;
        const y1 = y0 + Math.sin(ang) * len;
        x.strokeStyle = "rgba(26,22,24,0.92)";
        x.lineWidth = w;
        x.beginPath();
        x.moveTo(x0, y0);
        x.quadraticCurveTo((x0 + x1) / 2 + (r() - 0.5) * 8, (y0 + y1) / 2, x1, y1);
        x.stroke();
        if (d <= 0) return;
        const n = 2 + (r() > 0.5 ? 1 : 0);
        for (let i = 0; i < n; i++)
          branch(x1, y1, ang + (r() - 0.5) * 1.05, len * (0.62 + r() * 0.16), Math.max(2, w * 0.56), d - 1);
      };
      branch(W * 0.163, H * 0.83, -Math.PI / 2 - 0.03, H * 0.33, 26, 4);
      x.restore();
      // lamp post
      x.save();
      x.fillStyle = "rgba(34,30,32,0.9)";
      x.fillRect(W * 0.84, H * 0.36, 10, H * 0.45);
      x.beginPath();
      x.moveTo(W * 0.84 - 26, H * 0.36);
      x.lineTo(W * 0.84 + 36, H * 0.36);
      x.lineTo(W * 0.84 + 20, H * 0.31);
      x.lineTo(W * 0.84 - 10, H * 0.31);
      x.closePath();
      x.fill();
      x.restore();
      const lg = x.createRadialGradient(W * 0.845, H * 0.38, 4, W * 0.845, H * 0.38, 260);
      lg.addColorStop(0, "rgba(250,238,206,0.5)");
      lg.addColorStop(1, "rgba(250,238,206,0)");
      x.fillStyle = lg;
      x.fillRect(W * 0.845 - 270, H * 0.38 - 270, 540, 540);
      // figure in a coat, red scarf
      const fx = W * 0.6;
      L.figure(x, fx, H * 0.47, H * 0.33, {
        color: "rgba(22,19,22,0.9)",
        hair: true,
        hairW: 1.25,
        arms: [
          [fx - 34, H * 0.72],
          [fx + 34, H * 0.72],
        ],
      });
      x.strokeStyle = RED;
      x.lineWidth = 11;
      x.lineCap = "round";
      x.beginPath();
      x.moveTo(fx - 26, H * 0.505);
      x.quadraticCurveTo(fx + 6, H * 0.53, fx + 34, H * 0.5);
      x.stroke();
      x.beginPath();
      x.moveTo(fx + 30, H * 0.5);
      x.quadraticCurveTo(fx + 44, H * 0.6, fx + 30, H * 0.66);
      x.stroke();
      // long shadow
      x.save();
      x.globalAlpha = 0.18;
      x.fillStyle = "rgba(60,58,70,1)";
      x.beginPath();
      x.moveTo(fx - 40, H * 0.8);
      x.lineTo(fx + 46, H * 0.8);
      x.lineTo(fx + 210, H * 0.9);
      x.lineTo(fx + 60, H * 0.9);
      x.closePath();
      x.fill();
      x.restore();
    });
    ctx.drawImage(art, 0, 0);
    // snow
    const r = L.R(seed + 11);
    ctx.save();
    ctx.fillStyle = "rgba(250,250,252,0.85)";
    for (let i = 0; i < 130; i++) {
      const sp = 40 + r() * 90;
      const x0 = (r() * W + Math.sin(lt * 0.7 + i) * 40) % W;
      const y0 = (r() * H + lt * sp) % H;
      const rr = 1.4 + r() * 3.4;
      ctx.globalAlpha = 0.35 + r() * 0.5;
      ctx.beginPath();
      ctx.arc(x0, y0, rr, 0, 6.283);
      ctx.fill();
    }
    ctx.restore();
    return true;
  };

  // ------------------------------------------------------------------ SUMMER
  S.summer = function (st) {
    const { ctx, lt, seed } = st;
    const art = plate("summer", 3401, (x) => {
      L.wash(x, W * 0.5, H * 0.3, 1150, 560, "rgba(226,206,168,0.42)", 3402, { alpha: 0.6, layers: 20 });
      L.wash(x, W * 0.5, H * 0.88, 1250, 300, "rgba(196,190,160,0.5)", 3403, { alpha: 0.7 });
      // sun
      const sx = W * 0.76,
        sy = H * 0.2;
      const sg = x.createRadialGradient(sx, sy, 20, sx, sy, 420);
      sg.addColorStop(0, "rgba(252,238,196,0.95)");
      sg.addColorStop(0.45, "rgba(246,220,160,0.55)");
      sg.addColorStop(1, "rgba(246,220,160,0)");
      x.fillStyle = sg;
      x.fillRect(sx - 440, sy - 440, 880, 880);
      x.strokeStyle = "rgba(150,110,60,0.35)";
      x.lineWidth = 4;
      x.beginPath();
      x.arc(sx, sy, 150, 0, 6.283);
      x.stroke();
      // foliage mass at the left
      const r = L.R(3410);
      x.save();
      x.globalCompositeOperation = "multiply";
      for (let i = 0; i < 46; i++) {
        const bx = W * (0.02 + r() * 0.36);
        const by = H * (0.02 + r() * 0.42);
        const rr = 60 + r() * 120;
        x.globalAlpha = 0.22 + r() * 0.3;
        x.fillStyle = "rgba(46,54,40,1)";
        x.beginPath();
        x.ellipse(bx, by, rr, rr * 0.78, r() * 3, 0, 6.283);
        x.fill();
      }
      x.restore();
      // trunk
      ink(x, [[W * 0.2, H * 0.48], [W * 0.205, H * 0.62], [W * 0.19, H * 0.8]], 26, 3411, 0.8);
      // ground shadow + figure
      const fx = W * 0.56;
      L.figure(x, fx, H * 0.45, H * 0.35, {
        color: "rgba(24,21,22,0.9)",
        hair: true,
        hairW: 1.3,
        arms: [
          [fx - 40, H * 0.66],
          [fx + 40, H * 0.66],
        ],
      });
      x.save();
      x.globalAlpha = 0.22;
      x.fillStyle = "rgba(60,54,40,1)";
      x.beginPath();
      x.moveTo(fx - 40, H * 0.8);
      x.lineTo(fx + 44, H * 0.8);
      x.lineTo(fx + 240, H * 0.93);
      x.lineTo(fx + 90, H * 0.93);
      x.closePath();
      x.fill();
      x.restore();
      // grass ticks
      const gr = L.R(3420);
      x.strokeStyle = "rgba(48,52,36,0.45)";
      for (let i = 0; i < 120; i++) {
        const gx = gr() * W;
        const gy = H * (0.82 + gr() * 0.17);
        x.lineWidth = 1 + gr() * 2;
        x.beginPath();
        x.moveTo(gx, gy);
        x.lineTo(gx + (gr() - 0.5) * 12, gy - 12 - gr() * 26);
        x.stroke();
      }
    });
    ctx.drawImage(art, 0, 0);
    // heat shimmer
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = "rgba(250,240,214,0.9)";
    for (let i = 0; i < 12; i++) {
      const y = H * (0.55 + i * 0.03);
      ctx.lineWidth = 2 + (i % 3);
      ctx.beginPath();
      for (let k = 0; k <= 40; k++) {
        const x = (k / 40) * W;
        const yy = y + Math.sin(k * 0.5 + lt * 2.2 + i) * 6;
        k ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy);
      }
      ctx.stroke();
    }
    ctx.restore();
    L.dust(ctx, W, H, lt, seed + 3, 40, 0.3);
    return true;
  };

  // ------------------------------------------------------------------ FALL
  S.fall = function (st) {
    const { ctx, lt, seed } = st;
    const art = plate("fall", 3501, (x) => {
      coldWash(x, 3502);
      // torn hole in the paper sky
      const r = L.R(3505);
      x.save();
      x.globalCompositeOperation = "multiply";
      x.fillStyle = "rgba(38,34,38,0.9)";
      x.beginPath();
      for (let i = 0; i <= 40; i++) {
        const a = (i / 40) * 6.283;
        const rr = 150 + Math.sin(a * 5) * 22 + Math.sin(a * 9) * 12 + r() * 12;
        const px = W * 0.5 + Math.cos(a) * rr;
        const py = H * 0.16 + Math.sin(a) * rr * 0.62;
        i ? x.lineTo(px, py) : x.moveTo(px, py);
      }
      x.closePath();
      x.fill();
      x.restore();
      // motion streaks
      const sr = L.R(3510);
      x.strokeStyle = "rgba(70,66,72,0.28)";
      for (let i = 0; i < 26; i++) {
        const x0 = sr() * W;
        const y0 = H * (0.2 + sr() * 0.6);
        const len = 90 + sr() * 260;
        x.lineWidth = 2 + sr() * 5;
        x.beginPath();
        x.moveTo(x0, y0);
        x.lineTo(x0 + 30, y0 + len);
        x.stroke();
      }
      // falling figure, tilted
      x.save();
      x.translate(W * 0.52, H * 0.56);
      x.rotate(0.42);
      L.figure(x, 0, -H * 0.24, H * 0.46, {
        color: "rgba(22,19,21,0.92)",
        hair: true,
        hairW: 1.35,
        arms: [
          [-110, H * 0.06],
          [96, H * 0.02],
        ],
      });
      x.restore();
      // dropped things
      x.save();
      x.strokeStyle = "rgba(30,26,28,0.8)";
      x.lineWidth = 5;
      x.strokeRect(W * 0.7, H * 0.34, 46, 78);
      x.beginPath();
      x.arc(W * 0.33, H * 0.7, 20, 0, 6.283);
      x.stroke();
      x.restore();
    });
    ctx.drawImage(art, 0, 0);
    // streaks moving with the fall
    ctx.save();
    ctx.strokeStyle = "rgba(240,238,236,0.35)";
    for (let i = 0; i < 16; i++) {
      const x0 = (i * 137 + lt * 40) % W;
      const y0 = (i * 211 + lt * 900) % H;
      ctx.lineWidth = 2 + (i % 3);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 + 14, y0 + 150);
      ctx.stroke();
    }
    ctx.restore();
    return true;
  };

  // ------------------------------------------------------------------ WINGS
  S.wings = function (st) {
    const { ctx, lt, seed } = st;
    const art = plate("wings", 3601, (x) => {
      coldWash(x, 3602);
      const wing = (cx, cy, dir, sd) => {
        const r = L.R(sd);
        x.save();
        x.translate(cx, cy);
        x.scale(dir, 1);
        // feather fan
        for (let i = 0; i < 9; i++) {
          const a = -0.9 + i * 0.18;
          const len = 250 + r() * 120;
          const w = 26 + r() * 14;
          x.save();
          x.rotate(a);
          x.fillStyle = "rgba(30,26,28," + (0.5 + r() * 0.35) + ")";
          x.beginPath();
          x.moveTo(0, 0);
          x.quadraticCurveTo(len * 0.55, -w, len, 0);
          x.quadraticCurveTo(len * 0.55, w * 1.2, 0, 0);
          x.closePath();
          x.fill();
          x.restore();
        }
        // broken shaft, snapped bones
        ink(x, [[0, 0], [90, -30], [150, -96]], 16, sd + 3, 0.9);
        ink(x, [[150, -96], [196, -60], [236, -104]], 11, sd + 4, 0.75);
        x.restore();
      };
      wing(W * 0.36, H * 0.5, -1, 3610);
      wing(W * 0.64, H * 0.5, 1, 3620);
      // stitches holding them together
      x.strokeStyle = RED;
      x.lineWidth = 4;
      x.setLineDash([14, 12]);
      x.beginPath();
      x.moveTo(W * 0.44, H * 0.42);
      x.quadraticCurveTo(W * 0.5, H * 0.5, W * 0.56, H * 0.42);
      x.stroke();
      x.setLineDash([]);
    });
    ctx.drawImage(art, 0, 0);
    // feathers drifting down
    const r = L.R(seed + 9);
    ctx.save();
    for (let i = 0; i < 22; i++) {
      const sp = 30 + r() * 60;
      const x0 = (r() * W + Math.sin(lt * 0.8 + i) * 60) % W;
      const y0 = (r() * H + lt * sp) % H;
      ctx.globalAlpha = 0.25 + r() * 0.4;
      ctx.fillStyle = "rgba(30,26,28,0.9)";
      ctx.save();
      ctx.translate(x0, y0);
      ctx.rotate(Math.sin(lt * 1.4 + i) * 0.7);
      ctx.beginPath();
      ctx.ellipse(0, 0, 26, 7, 0, 0, 6.283);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    return true;
  };

  // ------------------------------------------------------------------ HAPPINESS
  S.happiness = function (st) {
    const { ctx, lt, seed, bass } = st;
    const art = plate("happiness", 3701, (x) => {
      L.wash(x, W * 0.5, H * 0.72, 1200, 400, "rgba(126,118,120,0.35)", 3702, { alpha: 0.6 });
      // floorboards
      x.save();
      x.strokeStyle = "rgba(70,62,60,0.22)";
      x.lineWidth = 3;
      for (let i = 0; i < 9; i++) {
        const y = H * (0.6 + i * 0.05);
        x.beginPath();
        x.moveTo(0, y);
        x.lineTo(W, y);
        x.stroke();
      }
      x.restore();
      // window on the back wall
      x.save();
      x.fillStyle = "rgba(240,234,222,0.55)";
      x.fillRect(W * 0.6, H * 0.14, W * 0.26, H * 0.3);
      x.strokeStyle = "rgba(56,50,52,0.6)";
      x.lineWidth = 10;
      x.strokeRect(W * 0.6, H * 0.14, W * 0.26, H * 0.3);
      x.beginPath();
      x.moveTo(W * 0.73, H * 0.14);
      x.lineTo(W * 0.73, H * 0.44);
      x.moveTo(W * 0.6, H * 0.29);
      x.lineTo(W * 0.86, H * 0.29);
      x.stroke();
      x.restore();
      // the figure standing over it
      L.figure(x, W * 0.22, H * 0.28, H * 0.48, {
        color: "rgba(24,21,24,0.9)",
        hair: true,
        hairW: 1.3,
        arms: [
          [W * 0.22 - 56, H * 0.6],
          [W * 0.22 + 56, H * 0.6],
        ],
      });
      // small heart lying on the floor, seen at an angle
      x.save();
      x.translate(W * 0.5, H * 0.74);
      x.rotate(-0.1);
      x.scale(1, 0.62);
      x.fillStyle = "rgba(158,26,33,0.9)";
      x.beginPath();
      x.moveTo(0, 70);
      x.bezierCurveTo(-120, -10, -96, -110, -30, -96);
      x.bezierCurveTo(-8, -92, 0, -70, 0, -60);
      x.bezierCurveTo(0, -70, 8, -92, 30, -96);
      x.bezierCurveTo(96, -110, 120, -10, 0, 70);
      x.closePath();
      x.fill();
      x.restore();
      // long shadow
      x.save();
      x.globalAlpha = 0.2;
      x.fillStyle = "rgba(40,34,38,1)";
      x.beginPath();
      x.ellipse(W * 0.56, H * 0.79, 190, 34, 0.05, 0, 6.283);
      x.fill();
      x.restore();
      // dust and a fallen chair leg
      x.save();
      x.globalAlpha = 0.5;
      x.fillStyle = "rgba(40,34,36,0.5)";
      for (let i = 0; i < 40; i++) {
        const dx = (i * 173) % W;
        const dy = H * (0.6 + ((i * 71) % 100) / 260);
        x.beginPath();
        x.arc(dx, dy, 1 + (i % 3), 0, 6.283);
        x.fill();
      }
      x.restore();
    });
    ctx.drawImage(art, 0, 0);
    // slow pulse of red light on the heart
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.filter = "blur(40px)";
    const g = ctx.createRadialGradient(W * 0.5, H * 0.74, 0, W * 0.5, H * 0.74, 300);
    g.addColorStop(0, "rgba(168,31,38," + (0.08 + bass * 0.16) + ")");
    g.addColorStop(1, "rgba(168,31,38,0)");
    ctx.fillStyle = g;
    ctx.fillRect(W * 0.5 - 320, H * 0.74 - 320, 640, 640);
    ctx.restore();
    L.dust(ctx, W, H, lt, seed + 5, 26, 0.28);
    return true;
  };

  // ------------------------------------------------------------------ GUITAR
  S.guitar = function (st) {
    const { ctx, lt, seed } = st;
    const art = plate("guitar", 3801, (x) => {
      L.wash(x, W * 0.5, H * 0.5, 1000, 620, "rgba(150,126,104,0.28)", 3802, { alpha: 0.55 });
      x.save();
      x.translate(W * 0.5, H * 0.52);
      x.rotate(-0.38);
      // neck
      x.fillStyle = "rgba(52,38,30,0.92)";
      x.fillRect(-70, -700, 140, 900);
      // fretboard
      x.fillStyle = "rgba(34,26,22,0.95)";
      x.fillRect(-64, -690, 128, 880);
      // frets
      x.strokeStyle = "rgba(196,188,176,0.55)";
      x.lineWidth = 3;
      for (let i = 0; i < 16; i++) {
        const y = -660 + i * 58;
        x.beginPath();
        x.moveTo(-62, y);
        x.lineTo(62, y);
        x.stroke();
      }
      // inlay dots
      x.fillStyle = "rgba(232,226,214,0.6)";
      for (let i = 0; i < 4; i++) {
        x.beginPath();
        x.arc(0, -560 + i * 232, 7, 0, 6.283);
        x.fill();
      }
      // strings
      x.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        x.strokeStyle = "rgba(238,234,226,0.6)";
        x.beginPath();
        x.moveTo(-52 + i * 20, -700);
        x.lineTo(-52 + i * 20, 220);
        x.stroke();
      }
      // body edge
      x.fillStyle = "rgba(96,52,32,0.9)";
      x.beginPath();
      x.ellipse(0, 330, 300, 230, 0, 0, 6.283);
      x.fill();
      x.fillStyle = "rgba(40,26,22,0.9)";
      x.beginPath();
      x.ellipse(0, 330, 260, 196, 0, 0, 6.283);
      x.fill();
      // barre hand: four fingers laid across the strings
      x.save();
      x.translate(0, -170);
      x.fillStyle = "rgba(26,21,22,0.96)";
      for (let i = 0; i < 4; i++) {
        const fy = -84 + i * 46;
        x.save();
        x.translate(0, fy);
        x.rotate(0.03);
        x.beginPath();
        x.roundRect(-118, -19, 246, 38, 19);
        x.fill();
        x.restore();
      }
      // thumb hooked over the left edge of the neck
      x.beginPath();
      x.ellipse(-86, -136, 30, 58, -0.3, 0, 6.283);
      x.fill();
      // knuckle highlights
      x.fillStyle = "rgba(64,56,54,0.55)";
      for (let i = 0; i < 4; i++) {
        x.beginPath();
        x.arc(118, -75 + i * 46, 10, 0, 6.283);
        x.fill();
      }
      x.restore();
      x.restore();
      // red pick
      x.save();
      x.translate(W * 0.68, H * 0.72);
      x.rotate(0.5);
      x.fillStyle = "rgba(168,31,38,0.9)";
      x.beginPath();
      x.moveTo(0, -26);
      x.lineTo(22, 16);
      x.lineTo(-22, 16);
      x.closePath();
      x.fill();
      x.restore();
    });
    ctx.drawImage(art, 0, 0);
    // vibrating strings overlay
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = "rgba(250,246,238,0.8)";
    ctx.translate(W * 0.5, H * 0.52);
    ctx.rotate(-0.38);
    for (let i = 0; i < 6; i++) {
      const x0 = -52 + i * 20;
      const amp = 3 + i * 0.8 + Math.sin(lt * 26 + i) * 2;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let k = 0; k <= 20; k++) {
        const y = -690 + (k / 20) * 900;
        const xx = x0 + Math.sin((k / 20) * Math.PI * 6 + lt * 30 + i) * amp;
        k ? ctx.lineTo(xx, y) : ctx.moveTo(xx, y);
      }
      ctx.stroke();
    }
    ctx.restore();
    return true;
  };

  // ------------------------------------------------------------------ PAINT
  S.paint = function (st) {
    const { ctx, lt, seed, bass } = st;
    const art = plate("paint", 3901, (x) => {
      L.wash(x, W * 0.5, H * 0.5, 1100, 640, "rgba(140,130,126,0.3)", 3902, { alpha: 0.55 });
      // easel
      x.save();
      x.strokeStyle = "rgba(48,38,32,0.9)";
      x.lineWidth = 18;
      x.beginPath();
      x.moveTo(W * 0.26, H * 0.9);
      x.lineTo(W * 0.4, H * 0.24);
      x.moveTo(W * 0.74, H * 0.9);
      x.lineTo(W * 0.6, H * 0.24);
      x.moveTo(W * 0.5, H * 0.9);
      x.lineTo(W * 0.5, H * 0.3);
      x.stroke();
      x.restore();
      // canvas
      x.save();
      x.shadowColor = "rgba(20,16,18,0.4)";
      x.shadowBlur = 40;
      x.shadowOffsetY = 14;
      x.fillStyle = "rgba(242,238,230,0.98)";
      x.fillRect(W * 0.28, H * 0.26, W * 0.44, H * 0.46);
      x.restore();
      x.strokeStyle = "rgba(30,26,28,0.85)";
      x.lineWidth = 6;
      x.strokeRect(W * 0.28, H * 0.26, W * 0.44, H * 0.46);
      // the painting: red and black gestural strokes
      const r = L.R(3910);
      x.save();
      x.beginPath();
      x.rect(W * 0.28, H * 0.26, W * 0.44, H * 0.46);
      x.clip();
      for (let i = 0; i < 9; i++) {
        const cx = W * (0.32 + r() * 0.36);
        const cy = H * (0.3 + r() * 0.38);
        L.wash(x, cx, cy, 90 + r() * 150, 60 + r() * 110, i % 2 ? "rgba(158,26,33,0.5)" : "rgba(30,26,30,0.4)", 3911 + i, { alpha: 0.7 });
      }
      L.splatter(x, W * 0.5, H * 0.46, 150, "rgba(150,26,33,0.75)", 3930, { drops: 40, spread: 2.6 });
      // a figure in the paint
      L.figure(x, W * 0.5, H * 0.32, H * 0.3, { color: "rgba(26,22,24,0.55)", hair: true, hairW: 1.4 });
      x.restore();
      // brush
      x.save();
      x.translate(W * 0.78, H * 0.72);
      x.rotate(-0.7);
      x.fillStyle = "rgba(40,32,28,0.92)";
      x.fillRect(-8, -10, 260, 20);
      x.fillStyle = "rgba(196,192,186,0.95)";
      x.fillRect(-40, -12, 40, 24);
      x.fillStyle = RED;
      x.beginPath();
      x.moveTo(-40, -12);
      x.quadraticCurveTo(-90, 0, -46, 12);
      x.closePath();
      x.fill();
      x.restore();
      // palette with blobs
      x.save();
      x.translate(W * 0.16, H * 0.78);
      x.rotate(0.2);
      x.fillStyle = "rgba(210,190,160,0.9)";
      x.beginPath();
      x.ellipse(0, 0, 190, 120, 0, 0, 6.283);
      x.fill();
      x.fillStyle = "rgba(150,26,33,0.9)";
      x.beginPath();
      x.arc(-70, -20, 26, 0, 6.283);
      x.arc(30, -44, 20, 0, 6.283);
      x.fill();
      x.fillStyle = "rgba(30,26,30,0.9)";
      x.beginPath();
      x.arc(80, 20, 24, 0, 6.283);
      x.fill();
      x.restore();
    });
    ctx.drawImage(art, 0, 0);
    // paint dripping off the canvas
    const r = L.R(seed + 7);
    for (let i = 0; i < 5; i++) {
      const x0 = W * (0.32 + r() * 0.36);
      const y0 = H * 0.71;
      const len = 60 + ((lt * 40 + r() * 200) % 200);
      ctx.save();
      ctx.globalAlpha = 0.6;
      L.drip(ctx, x0, y0, len, "rgba(150,26,33,0.7)", 3941 + i, 5 + r() * 4);
      ctx.restore();
    }
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.filter = "blur(50px)";
    const g = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, 420);
    g.addColorStop(0, "rgba(168,31,38," + (0.06 + bass * 0.12) + ")");
    g.addColorStop(1, "rgba(168,31,38,0)");
    ctx.fillStyle = g;
    ctx.fillRect(W * 0.5 - 440, H * 0.5 - 440, 880, 880);
    ctx.restore();
    return true;
  };

  // ------------------------------------------------------------------ DANCE
  S.dance = function (st) {
    const { ctx, lt, seed, kick } = st;
    const art = plate("dance", 4001, (x) => {
      L.wash(x, W * 0.5, H * 0.55, 1200, 600, "rgba(96,88,96,0.4)", 4002, { alpha: 0.6, layers: 20 });
      // tilted floor
      x.save();
      x.translate(W * 0.5, H * 0.82);
      x.rotate(-0.06);
      x.fillStyle = "rgba(60,54,60,0.5)";
      x.fillRect(-W, 0, W * 2, H);
      x.strokeStyle = "rgba(230,226,220,0.25)";
      x.lineWidth = 3;
      for (let i = -6; i <= 6; i++) {
        x.beginPath();
        x.moveTo(i * 160, 0);
        x.lineTo(i * 260, H);
        x.stroke();
      }
      x.restore();
      // two dancers, motion echoes behind
      const pair = (cx, cy, h, rot, sd, col) => {
        x.save();
        x.translate(cx, cy);
        x.rotate(rot);
        L.figure(x, 0, -h * 0.5, h, {
          color: col,
          hair: true,
          hairW: 1.3,
          arms: [
            [-h * 0.34, -h * 0.12],
            [h * 0.3, -h * 0.3],
          ],
        });
        x.restore();
      };
      for (let i = 3; i >= 0; i--) {
        const a = 0.1 + i * 0.1;
        pair(W * 0.4 - i * 26, H * 0.52, H * 0.44, -0.2 - i * 0.07, 4010 + i, "rgba(30,26,30," + a + ")");
      }
      pair(W * 0.56, H * 0.5, H * 0.46, 0.12, 4019, "rgba(22,19,22,0.92)");
      pair(W * 0.62, H * 0.54, H * 0.42, -0.3, 4020, "rgba(158,26,33,0.35)");
      // spotlights
      x.save();
      x.globalCompositeOperation = "lighter";
      [[0.3, "rgba(250,236,200,0.14)"], [0.7, "rgba(240,180,170,0.12)"]].forEach(([k, col], i) => {
        const g = x.createLinearGradient(W * k, 0, W * (0.45 + i * 0.2), H);
        g.addColorStop(0, col);
        g.addColorStop(1, "rgba(0,0,0,0)");
        x.fillStyle = g;
        x.beginPath();
        x.moveTo(W * k - 60, 0);
        x.lineTo(W * k + 60, 0);
        x.lineTo(W * (0.45 + i * 0.2) + 240, H);
        x.lineTo(W * (0.45 + i * 0.2) - 240, H);
        x.closePath();
        x.fill();
      });
      x.restore();
    });
    ctx.drawImage(art, 0, 0);
    // strobe bars
    ctx.save();
    ctx.globalAlpha = 0.1 + kick * 0.16;
    ctx.fillStyle = "rgba(244,240,234,1)";
    for (let i = 0; i < 3; i++) {
      const y = ((lt * 120 + i * 300) % (H + 300)) - 150;
      ctx.fillRect(0, y, W, 26);
    }
    ctx.restore();
    return true;
  };

  // ------------------------------------------------------------------ UPSIDEDOWN
  S.upsidedown = function (st) {
    const { ctx, lt, seed, kick } = st;
    const art = plate("upsidedown", 4101, (x) => {
      L.wash(x, W * 0.5, H * 0.4, 1200, 620, "rgba(90,82,92,0.42)", 4102, { alpha: 0.6, layers: 20 });
      x.save();
      // the whole room is flipped: the floor is now at the top
      x.translate(W * 0.5, H * 0.5);
      x.rotate(Math.PI);
      x.translate(-W * 0.5, -H * 0.5);
      // floor slab, flipped to the top of the frame
      x.fillStyle = "rgba(112,104,112,0.55)";
      x.fillRect(0, H * 0.7, W, H * 0.3);
      x.strokeStyle = "rgba(232,228,222,0.18)";
      x.lineWidth = 3;
      for (let i = 0; i < 9; i++) {
        x.beginPath();
        x.moveTo(i * 240, H * 0.7);
        x.lineTo(i * 240 - 170, H);
        x.stroke();
      }
      x.strokeStyle = "rgba(26,22,26,0.6)";
      x.lineWidth = 7;
      x.beginPath();
      x.moveTo(0, H * 0.7);
      x.lineTo(W, H * 0.7);
      x.stroke();
      // bottles and glasses hanging off the floor
      const bb = L.R(4114);
      for (let i = 0; i < 7; i++) {
        const bx0 = W * (0.06 + i * 0.14) + bb() * 50;
        const bh = 84 + bb() * 80;
        x.fillStyle = "rgba(34,30,36,0.9)";
        x.fillRect(bx0, H * 0.7 - bh, 24, bh);
        x.fillRect(bx0 + 6, H * 0.7 - bh - 30, 12, 34);
      }
      // hanging dancers, heads down
      const r = L.R(4110);
      for (let i = 0; i < 5; i++) {
        const cx = W * (0.12 + i * 0.19) + r() * 40;
        const h = H * (0.32 + r() * 0.05);
        L.figure(x, cx, H * 0.7 - h, h, {
          color: "rgba(24,20,24," + (0.62 + r() * 0.28) + ")",
          hair: i % 2 === 0,
          arms: [
            [cx - h * 0.36, H * 0.7 - h * 0.78],
            [cx + h * 0.38, H * 0.7 - h * 0.86],
          ],
        });
      }
      x.restore();
      // disco ball hanging up from the ceiling, which is now the bottom
      x.save();
      x.translate(W * 0.84, H * 0.8);
      x.strokeStyle = "rgba(40,36,40,0.85)";
      x.lineWidth = 5;
      x.beginPath();
      x.moveTo(0, 60);
      x.lineTo(0, 220);
      x.stroke();
      const g = x.createRadialGradient(-20, -20, 6, 0, 0, 70);
      g.addColorStop(0, "rgba(240,236,228,0.95)");
      g.addColorStop(1, "rgba(120,116,120,0.9)");
      x.fillStyle = g;
      x.beginPath();
      x.arc(0, 0, 64, 0, 6.283);
      x.fill();
      x.strokeStyle = "rgba(60,54,60,0.5)";
      x.lineWidth = 2;
      for (let i = -3; i <= 3; i++) {
        x.beginPath();
        x.arc(0, 0, 64, 0, 6.283);
        x.stroke();
        x.beginPath();
        x.ellipse(0, 0, Math.abs(i) * 18 + 8, 64, 0, 0, 6.283);
        x.stroke();
      }
      x.restore();
    });
    ctx.drawImage(art, 0, 0);
    // light specks spinning
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 26; i++) {
      const a = lt * 0.6 + i * 0.9;
      const rad = 120 + ((i * 97) % 420);
      const x0 = W * 0.84 + Math.cos(a) * rad * 0.6;
      const y0 = H * 0.8 + Math.sin(a) * rad * 0.32;
      ctx.globalAlpha = 0.12 + kick * 0.2;
      ctx.fillStyle = "rgba(250,236,210,1)";
      ctx.beginPath();
      ctx.arc(x0, y0, 3 + (i % 3), 0, 6.283);
      ctx.fill();
    }
    ctx.restore();
    return true;
  };

  // ------------------------------------------------------------------ REPAIR
  S.repair = function (st) {
    const { ctx, lt, seed, bass } = st;
    const art = plate("repair", 4201, (x) => {
      L.wash(x, W * 0.5, H * 0.55, 1100, 620, "rgba(130,120,120,0.32)", 4202, { alpha: 0.55 });
      // broken heart, cracked and stitched
      x.save();
      x.translate(W * 0.52, H * 0.5);
      x.scale(1.5, 1.5);
      x.fillStyle = "rgba(34,28,30,0.9)";
      x.beginPath();
      x.moveTo(0, 86);
      x.bezierCurveTo(-140, -10, -110, -120, -34, -104);
      x.bezierCurveTo(-10, -100, 0, -76, 0, -64);
      x.bezierCurveTo(0, -76, 10, -100, 34, -104);
      x.bezierCurveTo(110, -120, 140, -10, 0, 86);
      x.closePath();
      x.fill();
      // crack
      x.strokeStyle = "rgba(238,232,226,0.9)";
      x.lineWidth = 5;
      x.beginPath();
      x.moveTo(4, -58);
      x.lineTo(-14, -18);
      x.lineTo(10, 8);
      x.lineTo(-6, 40);
      x.lineTo(2, 74);
      x.stroke();
      // stitches
      x.strokeStyle = RED;
      x.lineWidth = 4;
      for (let i = 0; i < 6; i++) {
        const y = -48 + i * 22;
        x.beginPath();
        x.moveTo(-24, y);
        x.lineTo(24, y + 10);
        x.stroke();
      }
      x.restore();
      // tools
      x.save();
      x.translate(W * 0.22, H * 0.72);
      x.rotate(-0.5);
      x.fillStyle = "rgba(196,192,186,0.95)";
      x.fillRect(-6, -90, 12, 150);
      x.beginPath();
      x.moveTo(-6, -90);
      x.lineTo(0, -122);
      x.lineTo(6, -90);
      x.closePath();
      x.fill();
      x.fillStyle = "rgba(150,26,33,0.85)";
      x.fillRect(-14, 40, 28, 60);
      x.restore();
      // needle + thread
      x.save();
      x.translate(W * 0.8, H * 0.36);
      x.rotate(0.8);
      x.strokeStyle = "rgba(210,206,200,0.95)";
      x.lineWidth = 5;
      x.beginPath();
      x.moveTo(0, -70);
      x.lineTo(0, 70);
      x.stroke();
      x.restore();
      x.strokeStyle = RED;
      x.lineWidth = 3;
      x.beginPath();
      x.moveTo(W * 0.8, H * 0.36);
      x.bezierCurveTo(W * 0.86, H * 0.5, W * 0.72, H * 0.62, W * 0.62, H * 0.56);
      x.stroke();
      // tape strips
      x.save();
      x.globalAlpha = 0.55;
      x.fillStyle = "rgba(220,206,170,0.9)";
      x.translate(W * 0.44, H * 0.36);
      x.rotate(-0.3);
      x.fillRect(-70, -16, 140, 32);
      x.restore();
    });
    ctx.drawImage(art, 0, 0);
    // heartbeat glow
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.filter = "blur(46px)";
    const g = ctx.createRadialGradient(W * 0.52, H * 0.5, 0, W * 0.52, H * 0.5, 380);
    g.addColorStop(0, "rgba(168,31,38," + (0.08 + bass * 0.18) + ")");
    g.addColorStop(1, "rgba(168,31,38,0)");
    ctx.fillStyle = g;
    ctx.fillRect(W * 0.52 - 400, H * 0.5 - 400, 800, 800);
    ctx.restore();
    return true;
  };

  // ------------------------------------------------------------------ HARLEQUIN
  S.harlequin = function (st) {
    const { ctx, lt, seed } = st;
    const art = plate("harlequin", 4301, (x) => {
      // diamond suit pattern
      x.save();
      x.globalAlpha = 0.72;
      const d = 120;
      for (let row = -1; row < H / d + 2; row++) {
        for (let col = -1; col < W / d + 2; col++) {
          const cx = col * d + (row % 2 ? d / 2 : 0);
          const cy = row * d * 0.62;
          const on = (row + col) % 2 === 0;
          x.fillStyle = on ? "rgba(28,24,28,0.6)" : "rgba(158,26,33,0.5)";
          x.beginPath();
          x.moveTo(cx, cy - d * 0.5);
          x.lineTo(cx + d * 0.5, cy);
          x.lineTo(cx, cy + d * 0.5);
          x.lineTo(cx - d * 0.5, cy);
          x.closePath();
          x.fill();
        }
      }
      x.restore();
      // vignette the pattern to the middle
      const vg = x.createRadialGradient(W * 0.5, H * 0.5, 200, W * 0.5, H * 0.5, 900);
      vg.addColorStop(0, "rgba(205,198,193,0)");
      vg.addColorStop(1, "rgba(205,198,193,0.92)");
      x.fillStyle = vg;
      x.fillRect(0, 0, W, H);
      // jester hat: three horns with bells
      const horn = (x0, y0, c1x, c1y, x1, y1, w0, col) => {
        x.beginPath();
        x.moveTo(x0 - w0, y0);
        x.quadraticCurveTo(c1x - w0 * 0.4, c1y, x1, y1);
        x.quadraticCurveTo(c1x + w0 * 0.4, c1y, x0 + w0, y0);
        x.closePath();
        x.fillStyle = col;
        x.fill();
        x.beginPath();
        x.arc(x1, y1, 24, 0, 6.283);
        x.fillStyle = "rgba(196,152,62,0.95)";
        x.fill();
        x.beginPath();
        x.arc(x1, y1 + 8, 8, 0, 6.283);
        x.fillStyle = "rgba(112,84,26,0.9)";
        x.fill();
      };
      x.save();
      x.translate(W * 0.5, H * 0.5);
      horn(-96, -128, -230, -270, -336, -300, 74, "rgba(158,26,33,0.92)");
      horn(0, -158, 34, -330, 44, -404, 84, "rgba(30,26,30,0.92)");
      horn(96, -128, 230, -270, 336, -300, 74, "rgba(158,26,33,0.92)");
      // half mask
      x.fillStyle = "rgba(244,240,232,0.98)";
      x.beginPath();
      x.moveTo(-336, -66);
      x.quadraticCurveTo(-336, -196, -120, -202);
      x.quadraticCurveTo(0, -206, 0, -150);
      x.quadraticCurveTo(0, -206, 120, -202);
      x.quadraticCurveTo(336, -196, 336, -66);
      x.quadraticCurveTo(336, 74, 120, 92);
      x.quadraticCurveTo(0, 106, -120, 92);
      x.quadraticCurveTo(-336, 74, -336, -66);
      x.closePath();
      x.fill();
      x.strokeStyle = "rgba(28,24,28,0.9)";
      x.lineWidth = 7;
      x.stroke();
      // almond eye holes
      [-1, 1].forEach((d) => {
        x.save();
        x.translate(d * 152, -62);
        x.rotate(d * -0.16);
        x.fillStyle = "rgba(24,20,22,0.95)";
        x.beginPath();
        x.moveTo(-112, 0);
        x.quadraticCurveTo(0, -60, 112, 0);
        x.quadraticCurveTo(0, 48, -112, 0);
        x.closePath();
        x.fill();
        x.restore();
      });
      // red tear from the left eye
      x.fillStyle = RED;
      x.beginPath();
      x.moveTo(-152, -14);
      x.lineTo(-136, 78);
      x.lineTo(-168, 78);
      x.closePath();
      x.fill();
      // small sad mouth below the mask
      x.strokeStyle = "rgba(28,24,28,0.85)";
      x.lineWidth = 7;
      x.beginPath();
      x.moveTo(-92, 196);
      x.quadraticCurveTo(0, 152, 92, 196);
      x.stroke();
      x.restore();
    });
    ctx.drawImage(art, 0, 0);
    // mask sways with the beat
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = "rgba(158,26,33,0.9)";
    ctx.lineWidth = 4;
    for (let i = 0; i < 3; i++) {
      const off = Math.sin(lt * 2 + i) * 10;
      ctx.beginPath();
      ctx.ellipse(W * 0.5 + off, H * 0.5 + off * 0.5, 300, 250, 0, 0, 6.283);
      ctx.stroke();
    }
    ctx.restore();
    return true;
  };

  // ------------------------------------------------------------------ DOOR
  S.door = function (st) {
    const { ctx, lt, seed, p } = st;
    const variant = p.variant || 0;
    const art = plate("door:" + variant, 4401, (x) => {
      L.wash(x, W * 0.5, H * 0.5, 1200, 700, "rgba(80,72,80,0.42)", 4402, { alpha: 0.6, layers: 20 });
      // corridor wall
      x.fillStyle = "rgba(120,112,116,0.5)";
      x.fillRect(0, 0, W, H * 0.9);
      x.strokeStyle = "rgba(50,44,48,0.35)";
      x.lineWidth = 3;
      for (let i = 0; i < 7; i++) {
        x.beginPath();
        x.moveTo(0, H * (0.12 + i * 0.12));
        x.lineTo(W, H * (0.12 + i * 0.12));
        x.stroke();
      }
      // door frame + light
      const dx = W * 0.42,
        dy = H * 0.16,
        dw = W * 0.3,
        dh = H * 0.72;
      const lg = x.createLinearGradient(dx, dy, dx + dw, dy + dh);
      lg.addColorStop(0, "rgba(252,242,214,0.95)");
      lg.addColorStop(1, "rgba(248,228,186,0.6)");
      x.fillStyle = lg;
      x.fillRect(dx, dy, dw, dh);
      // light spill on the floor
      x.save();
      x.globalCompositeOperation = "lighter";
      const sp = x.createLinearGradient(dx, H * 0.88, dx + dw, H);
      sp.addColorStop(0, "rgba(250,238,206,0.4)");
      sp.addColorStop(1, "rgba(250,238,206,0)");
      x.fillStyle = sp;
      x.beginPath();
      x.moveTo(dx, H * 0.88);
      x.lineTo(dx + dw, H * 0.88);
      x.lineTo(dx + dw + 320, H);
      x.lineTo(dx - 260, H);
      x.closePath();
      x.fill();
      x.restore();
      // door leaf, ajar
      x.save();
      x.fillStyle = "rgba(52,42,38,0.95)";
      x.beginPath();
      x.moveTo(dx, dy);
      x.lineTo(dx + 40, dy + 10);
      x.lineTo(dx + 40, dy + dh - 6);
      x.lineTo(dx, dy + dh);
      x.closePath();
      x.fill();
      x.restore();
      // frame
      x.strokeStyle = "rgba(28,24,26,0.9)";
      x.lineWidth = 14;
      x.strokeRect(dx, dy, dw, dh);
      // figure leaving, back to us
      const fx = variant ? W * 0.24 : W * 0.2;
      L.figure(x, fx, H * 0.42, H * 0.42, {
        color: "rgba(20,17,20,0.94)",
        hair: true,
        hairW: 1.3,
        arms: [
          [fx - 40, H * 0.74],
          [fx + 40, H * 0.72],
        ],
      });
      // confetti on the floor
      const r = L.R(4410);
      for (let i = 0; i < 40; i++) {
        const cx = r() * W;
        const cy = H * (0.86 + r() * 0.12);
        x.save();
        x.translate(cx, cy);
        x.rotate(r() * 3);
        x.fillStyle = r() > 0.5 ? "rgba(196,152,62,0.7)" : "rgba(158,26,33,0.65)";
        x.fillRect(-5, -3, 10 + r() * 6, 6);
        x.restore();
      }
    });
    ctx.drawImage(art, 0, 0);
    // light flicker
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.05 + Math.abs(Math.sin(lt * 3.1)) * 0.05;
    ctx.fillStyle = "rgba(250,236,200,1)";
    ctx.fillRect(W * 0.4, H * 0.16, W * 0.34, H * 0.74);
    ctx.restore();
    // confetti drifting
    const r = L.R(seed + 13);
    for (let i = 0; i < 18; i++) {
      const x0 = (r() * W + Math.sin(lt + i) * 40) % W;
      const y0 = (r() * H * 0.8 + lt * (30 + r() * 50)) % (H * 0.9);
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.translate(x0, y0);
      ctx.rotate(lt * 2 + i);
      ctx.fillStyle = i % 2 ? "rgba(196,152,62,0.9)" : "rgba(158,26,33,0.85)";
      ctx.fillRect(-4, -2, 9, 5);
      ctx.restore();
    }
    return true;
  };

  // ------------------------------------------------------------------ PLANET
  S.planet = function (st) {
    const { ctx, lt, seed, bass } = st;
    const art = plate("planet", 4501, (x) => {
      // deep paper night
      L.wash(x, W * 0.5, H * 0.5, 1300, 800, "rgba(58,56,68,0.6)", 4502, { alpha: 0.7, layers: 22 });
      // stars
      const r = L.R(4505);
      x.fillStyle = "rgba(246,242,236,0.9)";
      for (let i = 0; i < 190; i++) {
        const sx = r() * W;
        const sy = r() * H;
        const rr = 1 + r() * 2.6;
        x.globalAlpha = 0.25 + r() * 0.6;
        x.beginPath();
        x.arc(sx, sy, rr, 0, 6.283);
        x.fill();
      }
      x.globalAlpha = 1;
      // the planet is drawn on its own layer so the bite can be cut out of it
      const cx = W * 0.5,
        cy = H * 0.52,
        R0 = 300;
      const pc = L.make(W, H);
      const p = pc.getContext("2d");
      const g = p.createRadialGradient(cx - 100, cy - 120, 20, cx, cy, R0);
      g.addColorStop(0, "rgba(212,198,178,0.98)");
      g.addColorStop(0.55, "rgba(160,148,132,0.98)");
      g.addColorStop(1, "rgba(86,80,76,0.98)");
      p.fillStyle = g;
      p.beginPath();
      p.arc(cx, cy, R0, 0, 6.283);
      p.fill();
      // continents
      p.save();
      p.beginPath();
      p.arc(cx, cy, R0, 0, 6.283);
      p.clip();
      const cr = L.R(4510);
      p.globalCompositeOperation = "multiply";
      for (let i = 0; i < 12; i++) {
        p.globalAlpha = 0.3 + cr() * 0.3;
        p.fillStyle = "rgba(96,88,80,1)";
        p.beginPath();
        p.ellipse(cx + (cr() - 0.5) * 460, cy + (cr() - 0.5) * 460, 30 + cr() * 90, 20 + cr() * 60, cr() * 3, 0, 6.283);
        p.fill();
      }
      p.restore();
      // a huge bite out of it: a scalloped chunk gone
      const bx = cx + R0 * 0.62,
        by = cy - R0 * 0.7;
      const biteR = 150;
      const scallops = [];
      p.save();
      p.globalCompositeOperation = "destination-out";
      p.beginPath();
      p.arc(bx, by, biteR, 0, 6.283);
      for (let i = 0; i < 5; i++) {
        const a = 1.84 + i * 0.25;
        const sx = bx + Math.cos(a) * biteR;
        const sy = by + Math.sin(a) * biteR;
        scallops.push([sx, sy, a]);
        p.moveTo(sx + 42, sy);
        p.arc(sx, sy, 42, 0, 6.283);
      }
      p.fill();
      p.restore();
      x.drawImage(pc, 0, 0);
      // teeth marks bitten into the rim
      x.save();
      x.strokeStyle = "rgba(30,26,30,0.72)";
      x.lineWidth = 7;
      scallops.forEach(([sx, sy, a]) => {
        x.beginPath();
        x.moveTo(sx + Math.cos(a) * 34, sy + Math.sin(a) * 34);
        x.lineTo(sx + Math.cos(a) * 76, sy + Math.sin(a) * 76);
        x.stroke();
      });
      x.restore();
      // crumbs floating away
      const br = L.R(4520);
      for (let i = 0; i < 26; i++) {
        const a = -2.6 + br() * 1.6;
        const rad = 240 + br() * 260;
        x.globalAlpha = 0.3 + br() * 0.5;
        x.fillStyle = "rgba(170,158,140,0.9)";
        x.beginPath();
        x.arc(bx + Math.cos(a) * rad, by + Math.sin(a) * rad, 2 + br() * 7, 0, 6.283);
        x.fill();
      }
      x.globalAlpha = 1;
    });
    ctx.drawImage(art, 0, 0);
    // slow orbit of crumbs
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "rgba(170,158,140,0.8)";
    for (let i = 0; i < 10; i++) {
      const a = lt * 0.35 + i * 0.6;
      const rad = 380 + i * 22;
      ctx.beginPath();
      ctx.arc(W * 0.5 + Math.cos(a) * rad * 0.5 + 200, H * 0.42 + Math.sin(a) * rad * 0.3, 3 + (i % 3), 0, 6.283);
      ctx.fill();
    }
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.filter = "blur(60px)";
    const pg = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, 460);
    pg.addColorStop(0, "rgba(120,20,26," + (0.04 + bass * 0.1) + ")");
    pg.addColorStop(1, "rgba(120,20,26,0)");
    ctx.fillStyle = pg;
    ctx.fillRect(W * 0.5 - 480, H * 0.5 - 480, 960, 960);
    ctx.restore();
    return true;
  };

  // ------------------------------------------------------------------ THOUGHTS
  S.thoughts = function (st) {
    const { ctx, lt, seed } = st;
    const art = plate("thoughts", 4601, (x) => {
      coldWash(x, 4602);
      // head in profile, looking right
      const cx = W * 0.34,
        cy = H * 0.5,
        R0 = 250;
      x.fillStyle = "rgba(24,20,22,0.92)";
      x.beginPath();
      x.moveTo(cx - R0 * 0.9, cy + R0 * 0.55);
      x.bezierCurveTo(cx - R0 * 1.15, cy - R0 * 0.2, cx - R0 * 0.75, cy - R0 * 1.05, cx, cy - R0 * 1.02);
      x.bezierCurveTo(cx + R0 * 0.72, cy - R0 * 1.0, cx + R0 * 1.0, cy - R0 * 0.35, cx + R0 * 0.92, cy + R0 * 0.1);
      x.lineTo(cx + R0 * 0.62, cy + R0 * 0.12);
      x.lineTo(cx + R0 * 0.74, cy + R0 * 0.34);
      x.lineTo(cx + R0 * 0.5, cy + R0 * 0.42);
      x.lineTo(cx + R0 * 0.56, cy + R0 * 0.72);
      x.lineTo(cx - R0 * 0.1, cy + R0 * 0.8);
      x.lineTo(cx - R0 * 0.35, cy + R0 * 1.0);
      x.lineTo(cx - R0 * 0.55, cy + R0 * 0.8);
      x.closePath();
      x.fill();
      // eye socket
      x.fillStyle = "rgba(205,198,193,0.9)";
      x.beginPath();
      x.ellipse(cx + R0 * 0.46, cy - R0 * 0.24, 44, 26, -0.2, 0, 6.283);
      x.fill();
      x.fillStyle = "rgba(24,20,22,0.95)";
      x.beginPath();
      x.arc(cx + R0 * 0.5, cy - R0 * 0.23, 14, 0, 6.283);
      x.fill();
      // threads pouring out of the skull
      const r = L.R(4610);
      x.save();
      x.lineCap = "round";
      for (let i = 0; i < 16; i++) {
        const y0 = cy - R0 * (0.9 - i * 0.1);
        const x0 = cx - R0 * 0.2 + r() * 80;
        x.strokeStyle = i % 3 === 0 ? "rgba(158,26,33,0.75)" : "rgba(30,26,30,0.6)";
        x.lineWidth = 1.5 + r() * 3;
        x.beginPath();
        x.moveTo(x0, y0);
        x.bezierCurveTo(x0 + 200 + r() * 200, y0 - 120 + r() * 200, W * 0.7 + r() * 200, y0 + r() * 300, W * 0.92 + r() * 80, H * (0.2 + r() * 0.6));
        x.stroke();
      }
      x.restore();
      // tangled knot on the right
      x.save();
      x.strokeStyle = "rgba(30,26,30,0.5)";
      x.lineWidth = 2;
      for (let i = 0; i < 26; i++) {
        const a = r() * 6.283;
        const rad = 60 + r() * 160;
        x.beginPath();
        x.arc(W * 0.82, H * 0.5, rad, a, a + 1.6);
        x.stroke();
      }
      x.restore();
    });
    ctx.drawImage(art, 0, 0);
    // threads shimmer
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = "rgba(158,26,33,0.9)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      const y = H * (0.3 + i * 0.1) + Math.sin(lt * 1.6 + i) * 20;
      ctx.moveTo(W * 0.4, y);
      ctx.bezierCurveTo(W * 0.6, y - 60, W * 0.8, y + 80, W * 0.95, y - 20);
      ctx.stroke();
    }
    ctx.restore();
    return true;
  };

  // ------------------------------------------------------------------ DEAL
  S.deal = function (st) {
    const { ctx, lt, seed } = st;
    const art = plate("deal", 4701, (x) => {
      L.wash(x, W * 0.5, H * 0.5, 1150, 680, "rgba(120,110,106,0.32)", 4702, { alpha: 0.55 });
      // contract sheet, slightly rotated
      x.save();
      x.translate(W * 0.5, H * 0.52);
      x.rotate(-0.035);
      x.shadowColor = "rgba(24,18,20,0.4)";
      x.shadowBlur = 46;
      x.shadowOffsetY = 14;
      x.fillStyle = "rgba(246,242,235,0.99)";
      x.fillRect(-420, -470, 840, 940);
      x.restore();
      // text lines, in the same sheet transform
      x.save();
      x.translate(W * 0.5, H * 0.52);
      x.rotate(-0.035);
      const r = L.R(4710);
      x.fillStyle = "rgba(40,34,36,0.55)";
      for (let i = 0; i < 10; i++) {
        const y = -320 + i * 54;
        const w = i % 4 === 0 ? 700 : 300 + r() * 360;
        x.fillRect(-360, y, w, 10);
      }
      x.restore();
      // heading
      L.inkType(x, "СДЕЛКА", 0 + W * 0.5, H * 0.5 - 392, 74, {
        color: "rgba(30,26,28,0.9)",
        seed: 4711,
        charRot: 0.03,
        jitter: 1.4,
      });
      // signature
      x.save();
      x.translate(W * 0.52, H * 0.72);
      x.strokeStyle = "rgba(30,26,30,0.85)";
      x.lineWidth = 4;
      x.beginPath();
      x.moveTo(-120, 0);
      x.bezierCurveTo(-60, -70, -20, 40, 20, -10);
      x.bezierCurveTo(60, -60, 90, 30, 150, -20);
      x.stroke();
      x.restore();
      // red thumbprint
      x.save();
      x.globalAlpha = 0.8;
      x.strokeStyle = RED;
      x.lineWidth = 6;
      for (let i = 0; i < 5; i++) {
        x.beginPath();
        x.ellipse(W * 0.345, H * 0.73, 30 + i * 9, 38 + i * 11, 0.2, 0, 6.283);
        x.stroke();
      }
      x.restore();
      // pen
      x.save();
      x.translate(W * 0.72, H * 0.6);
      x.rotate(0.6);
      x.fillStyle = "rgba(30,26,30,0.92)";
      x.fillRect(-9, -170, 18, 300);
      x.fillStyle = "rgba(196,192,186,0.95)";
      x.beginPath();
      x.moveTo(-9, 130);
      x.lineTo(0, 176);
      x.lineTo(9, 130);
      x.closePath();
      x.fill();
      x.restore();
    });
    ctx.drawImage(art, 0, 0);
    // ink bleed under the signature
    ctx.save();
    ctx.globalAlpha = 0.12 + Math.abs(Math.sin(lt * 0.7)) * 0.06;
    ctx.fillStyle = "rgba(158,26,33,1)";
    ctx.beginPath();
    ctx.ellipse(W * 0.52, H * 0.738, 96, 10, 0, 0, 6.283);
    ctx.fill();
    ctx.restore();
    return true;
  };

  // ------------------------------------------------------------------ POISON
  S.poison = function (st) {
    const { ctx, lt, seed, bass } = st;
    const art = plate("poison", 4801, (x) => {
      L.wash(x, W * 0.5, H * 0.55, 1100, 620, "rgba(110,120,110,0.3)", 4802, { alpha: 0.55 });
      // bottle
      x.save();
      x.translate(W * 0.5, H * 0.52);
      // body
      x.fillStyle = "rgba(46,54,48,0.92)";
      x.beginPath();
      x.roundRect(-150, -180, 300, 420, 34);
      x.fill();
      // neck
      x.fillRect(-56, -290, 112, 130);
      // cap
      x.fillStyle = "rgba(158,26,33,0.95)";
      x.beginPath();
      x.roundRect(-70, -330, 140, 56, 12);
      x.fill();
      // label
      x.fillStyle = "rgba(236,230,220,0.95)";
      x.fillRect(-128, -110, 256, 260);
      x.strokeStyle = "rgba(30,26,30,0.7)";
      x.lineWidth = 3;
      x.strokeRect(-128, -110, 256, 260);
      // skull on the label
      x.fillStyle = "rgba(30,26,30,0.9)";
      x.beginPath();
      x.arc(0, -20, 52, Math.PI, 0);
      x.lineTo(52, 8);
      x.lineTo(-52, 8);
      x.closePath();
      x.fill();
      x.fillRect(-40, 8, 80, 34);
      x.fillStyle = "rgba(236,230,220,0.95)";
      x.beginPath();
      x.arc(-20, -20, 14, 0, 6.283);
      x.arc(20, -20, 14, 0, 6.283);
      x.fill();
      // crossbones
      x.strokeStyle = "rgba(30,26,30,0.85)";
      x.lineWidth = 10;
      x.beginPath();
      x.moveTo(-70, 66);
      x.lineTo(70, 116);
      x.moveTo(70, 66);
      x.lineTo(-70, 116);
      x.stroke();
      // liquid line
      x.strokeStyle = "rgba(158,26,33,0.75)";
      x.lineWidth = 6;
      x.beginPath();
      x.moveTo(-146, 60);
      x.lineTo(146, 60);
      x.stroke();
      x.restore();
      // drips from the cap
      x.save();
      x.strokeStyle = "rgba(158,26,33,0.7)";
      x.lineWidth = 5;
      for (let i = 0; i < 3; i++) {
        x.beginPath();
        x.moveTo(W * 0.5 - 20 + i * 22, H * 0.22);
        x.lineTo(W * 0.5 - 18 + i * 22, H * 0.3 + i * 20);
        x.stroke();
      }
      x.restore();
    });
    ctx.drawImage(art, 0, 0);
    // a drop falling into a red puddle
    const phase = (lt * 0.9) % 1;
    const dy = H * 0.22 + phase * H * 0.5;
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "rgba(158,26,33,0.85)";
    ctx.beginPath();
    ctx.ellipse(W * 0.5 + 26, dy, 9, 14, 0, 0, 6.283);
    ctx.fill();
    ctx.restore();
    // puddle
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.5 + bass * 0.2;
    ctx.fillStyle = "rgba(158,26,33,0.9)";
    ctx.beginPath();
    ctx.ellipse(W * 0.5, H * 0.84, 150, 26, 0, 0, 6.283);
    ctx.fill();
    ctx.restore();
    return true;
  };

  // ------------------------------------------------------------------ CAR
  S.car = function (st) {
    const { ctx, lt, seed } = st;
    const art = plate("car", 4901, (x) => {
      // night street
      L.wash(x, W * 0.5, H * 0.4, 1300, 700, "rgba(60,62,74,0.55)", 4902, { alpha: 0.65, layers: 20 });
      // buildings
      const r = L.R(4905);
      x.save();
      x.globalCompositeOperation = "multiply";
      for (let i = 0; i < 7; i++) {
        const bw = 160 + r() * 220;
        const bh = 220 + r() * 420;
        const bx = i * 280 - 80;
        x.fillStyle = "rgba(52,50,60,0.55)";
        x.fillRect(bx, H * 0.62 - bh, bw, bh);
        // lit windows
        x.fillStyle = "rgba(246,230,190,0.5)";
        for (let wy = 0; wy < 5; wy++) {
          for (let wx = 0; wx < 3; wx++) {
            if (r() > 0.5) x.fillRect(bx + 20 + wx * 50, H * 0.62 - bh + 30 + wy * 66, 26, 34);
          }
        }
      }
      x.restore();
      // wet road
      x.fillStyle = "rgba(46,46,56,0.75)";
      x.fillRect(0, H * 0.62, W, H * 0.38);
      x.strokeStyle = "rgba(220,214,200,0.28)";
      x.lineWidth = 6;
      x.setLineDash([80, 60]);
      x.beginPath();
      x.moveTo(0, H * 0.86);
      x.lineTo(W, H * 0.86);
      x.stroke();
      x.setLineDash([]);
      // car rear
      x.save();
      x.translate(W * 0.5, H * 0.62);
      x.fillStyle = "rgba(26,24,30,0.95)";
      x.beginPath();
      x.roundRect(-330, -170, 660, 250, 30);
      x.fill();
      // roof
      x.beginPath();
      x.roundRect(-250, -260, 500, 120, 40);
      x.fill();
      // rear window
      x.fillStyle = "rgba(150,160,176,0.5)";
      x.beginPath();
      x.roundRect(-210, -244, 420, 86, 26);
      x.fill();
      // lights
      x.fillStyle = "rgba(158,26,33,0.95)";
      x.beginPath();
      x.roundRect(-320, -80, 150, 56, 16);
      x.fill();
      x.beginPath();
      x.roundRect(170, -80, 150, 56, 16);
      x.fill();
      // plate
      x.fillStyle = "rgba(236,232,222,0.95)";
      x.fillRect(-96, 8, 192, 56);
      x.fillStyle = "rgba(30,26,30,0.9)";
      x.font = "700 34px " + L.FONT_MONO;
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("UBER", 0, 38);
      x.restore();
      // headlight haze ahead
      x.save();
      x.globalCompositeOperation = "lighter";
      const hg = x.createLinearGradient(0, H * 0.6, 0, H);
      hg.addColorStop(0, "rgba(250,236,200,0.18)");
      hg.addColorStop(1, "rgba(250,236,200,0)");
      x.fillStyle = hg;
      x.fillRect(W * 0.2, H * 0.6, W * 0.6, H * 0.4);
      x.restore();
    });
    ctx.drawImage(art, 0, 0);
    // rain + tail light glow
    L.rain(ctx, W, H, lt, seed + 2, 0.9, { count: 190, alpha: 0.4 });
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const g = ctx.createRadialGradient(W * 0.5, H * 0.6, 40, W * 0.5, H * 0.62, 560);
    g.addColorStop(0, "rgba(158,26,33,0.16)");
    g.addColorStop(1, "rgba(158,26,33,0)");
    ctx.fillStyle = g;
    ctx.fillRect(W * 0.5 - 580, H * 0.6 - 580, 1160, 1160);
    ctx.restore();
    return true;
  };

  // ------------------------------------------------------------------ CAT
  S.cat = function (st) {
    const { ctx, lt, seed, bass } = st;
    const art = plate("cat", 5001, (x) => {
      L.wash(x, W * 0.5, H * 0.6, 1150, 640, "rgba(150,138,128,0.3)", 5002, { alpha: 0.55 });
      // window light behind
      x.fillStyle = "rgba(232,224,206,0.4)";
      x.fillRect(W * 0.18, H * 0.16, W * 0.64, H * 0.5);
      // cat, sitting, big
      x.save();
      x.translate(W * 0.5, H * 0.78);
      const S0 = 1.5;
      x.scale(S0, S0);
      x.fillStyle = "rgba(30,26,28,0.94)";
      // body
      x.beginPath();
      x.moveTo(-120, 0);
      x.bezierCurveTo(-150, -120, -110, -240, 0, -250);
      x.bezierCurveTo(110, -240, 150, -120, 120, 0);
      x.closePath();
      x.fill();
      // head
      x.beginPath();
      x.ellipse(0, -300, 96, 84, 0, 0, 6.283);
      x.fill();
      // ears
      x.beginPath();
      x.moveTo(-86, -350);
      x.lineTo(-108, -450);
      x.lineTo(-30, -380);
      x.closePath();
      x.fill();
      x.beginPath();
      x.moveTo(86, -350);
      x.lineTo(108, -450);
      x.lineTo(30, -380);
      x.closePath();
      x.fill();
      // tail
      x.strokeStyle = "rgba(30,26,28,0.94)";
      x.lineWidth = 26;
      x.lineCap = "round";
      x.beginPath();
      x.moveTo(112, -40);
      x.bezierCurveTo(230, -40, 250, -190, 160, -230);
      x.stroke();
      // eyes
      x.fillStyle = "rgba(198,150,62,0.95)";
      x.beginPath();
      x.ellipse(-38, -312, 26, 18, 0, 0, 6.283);
      x.ellipse(38, -312, 26, 18, 0, 0, 6.283);
      x.fill();
      x.fillStyle = "rgba(20,16,18,0.95)";
      x.beginPath();
      x.ellipse(-38, -312, 7, 16, 0, 0, 6.283);
      x.ellipse(38, -312, 7, 16, 0, 0, 6.283);
      x.fill();
      // nose + whiskers
      x.fillStyle = "rgba(158,26,33,0.9)";
      x.beginPath();
      x.moveTo(0, -286);
      x.lineTo(-11, -272);
      x.lineTo(11, -272);
      x.closePath();
      x.fill();
      x.strokeStyle = "rgba(232,226,214,0.6)";
      x.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        x.beginPath();
        x.moveTo(-20, -278 + i * 8);
        x.lineTo(-150, -300 + i * 26);
        x.moveTo(20, -278 + i * 8);
        x.lineTo(150, -300 + i * 26);
        x.stroke();
      }
      x.restore();
      // yarn ball
      x.save();
      x.translate(W * 0.22, H * 0.8);
      x.strokeStyle = "rgba(158,26,33,0.8)";
      x.lineWidth = 5;
      x.beginPath();
      x.arc(0, 0, 46, 0, 6.283);
      x.stroke();
      for (let i = 0; i < 5; i++) {
        x.beginPath();
        x.ellipse(0, 0, 46, 16, (i / 5) * Math.PI, 0, 6.283);
        x.stroke();
      }
      x.beginPath();
      x.moveTo(40, 20);
      x.bezierCurveTo(160, 80, 200, 40, 320, 110);
      x.stroke();
      x.restore();
    });
    ctx.drawImage(art, 0, 0);
    // tail sway + blink
    const blink = (lt % 5.2) < 0.16 ? 0.15 : 1;
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "rgba(30,26,28,0.94)";
    ctx.translate(W * 0.5, H * 0.78);
    ctx.scale(1.5, 1.5);
    ctx.beginPath();
    ctx.ellipse(-38, -312, 26, 18 * (1 - blink), 0, 0, 6.283);
    ctx.ellipse(38, -312, 26, 18 * (1 - blink), 0, 0, 6.283);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.strokeStyle = "rgba(158,26,33,0.9)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(W * 0.5, H * 0.78, 260 + i * 40 + bass * 20, 190 + i * 26, 0, 0, 6.283);
      ctx.stroke();
    }
    ctx.restore();
    return true;
  };

  // ------------------------------------------------------------------ BITE
  S.bite = function (st) {
    const { ctx, lt, seed, p } = st;
    const variant = p.variant || 0;
    const art = plate("bite:" + variant, 5101, (x) => {
      L.wash(x, W * 0.5, H * 0.55, 1150, 620, "rgba(206,168,158,0.45)", 5102, { alpha: 0.7, layers: 22 });
      // lips, close up
      x.save();
      x.translate(W * 0.5, H * 0.5);
      const open = variant ? 26 : 8;
      // upper lip
      x.fillStyle = "rgba(150,54,58,0.9)";
      x.beginPath();
      x.moveTo(-430, 0);
      x.bezierCurveTo(-300, -120, -160, -140, -60, -70);
      x.bezierCurveTo(-20, -46, 20, -46, 60, -70);
      x.bezierCurveTo(160, -140, 300, -120, 430, 0);
      x.bezierCurveTo(300, -40, 160, -20, 60, -8 - open);
      x.bezierCurveTo(20, -2 - open, -20, -2 - open, -60, -8 - open);
      x.bezierCurveTo(-160, -20, -300, -40, -430, 0);
      x.closePath();
      x.fill();
      // lower lip
      x.fillStyle = "rgba(168,64,66,0.9)";
      x.beginPath();
      x.moveTo(-430, 0);
      x.bezierCurveTo(-300, 150, -140, 190, 0, 190);
      x.bezierCurveTo(140, 190, 300, 150, 430, 0);
      x.bezierCurveTo(300, 60, 160, 40, 60, 8 + open);
      x.bezierCurveTo(20, 2 + open, -20, 2 + open, -60, 8 + open);
      x.bezierCurveTo(-160, 40, -300, 60, -430, 0);
      x.closePath();
      x.fill();
      // mouth opening with teeth
      x.fillStyle = "rgba(40,16,18,0.95)";
      x.beginPath();
      x.ellipse(0, 2, 300, 22 + open, 0, 0, 6.283);
      x.fill();
      // upper teeth biting into the lip
      x.fillStyle = "rgba(246,242,234,0.97)";
      for (let i = 0; i < 8; i++) {
        const tx = -217 + i * 62;
        x.beginPath();
        x.roundRect(tx - 22, -34 - open * 0.4, 44, 40, 9);
        x.fill();
      }
      // two canines, longer
      [-1, 1].forEach((d) => {
        x.beginPath();
        x.moveTo(d * 96 - 18, -30 - open * 0.3);
        x.lineTo(d * 96 + 18, -30 - open * 0.3);
        x.lineTo(d * 96, 30);
        x.closePath();
        x.fill();
      });
      // bite mark on the lower lip
      x.strokeStyle = "rgba(108,14,20,0.85)";
      x.lineWidth = 6;
      for (let i = 0; i < 6; i++) {
        x.beginPath();
        x.arc(-160 + i * 64, 116, 24, 0.3, 2.5);
        x.stroke();
      }
      // gloss
      x.fillStyle = "rgba(250,240,236,0.45)";
      x.beginPath();
      x.ellipse(-210, 100, 66, 10, -0.22, 0, 6.283);
      x.fill();
      x.restore();
      // blood drop
      x.save();
      x.translate(W * 0.62, H * 0.66);
      x.fillStyle = RED;
      x.beginPath();
      x.moveTo(0, -40);
      x.bezierCurveTo(24, 0, 18, 26, 0, 26);
      x.bezierCurveTo(-18, 26, -24, 0, 0, -40);
      x.closePath();
      x.fill();
      x.restore();
    });
    ctx.drawImage(art, 0, 0);
    // pulse
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.filter = "blur(50px)";
    const g = ctx.createRadialGradient(W * 0.5, H * 0.52, 0, W * 0.5, H * 0.52, 480);
    g.addColorStop(0, "rgba(168,31,38," + (0.1 + st.bass * 0.14) + ")");
    g.addColorStop(1, "rgba(168,31,38,0)");
    ctx.fillStyle = g;
    ctx.fillRect(W * 0.5 - 500, H * 0.52 - 500, 1000, 1000);
    ctx.restore();
    // drip
    const dy = (lt * 60) % 200;
    ctx.save();
    ctx.globalAlpha = 0.7;
    L.drip(ctx, W * 0.62, H * 0.68 + dy, 90, "rgba(150,20,28,0.8)", 5121, 5);
    ctx.restore();
    return true;
  };

  // ------------------------------------------------------------------ KEYS
  S.keys = function (st) {
    const { ctx, lt, seed } = st;
    const art = plate("keys", 5201, (x) => {
      L.wash(x, W * 0.5, H * 0.55, 1100, 620, "rgba(130,124,120,0.3)", 5202, { alpha: 0.55 });
      // door lock, large, right side
      x.save();
      x.translate(W * 0.74, H * 0.5);
      x.fillStyle = "rgba(52,50,56,0.97)";
      x.beginPath();
      x.roundRect(-130, -190, 260, 380, 30);
      x.fill();
      x.fillStyle = "rgba(22,20,24,0.98)";
      x.beginPath();
      x.arc(0, -56, 46, 0, 6.283);
      x.fill();
      x.fillRect(-14, -56, 28, 104);
      x.strokeStyle = "rgba(226,220,210,0.26)";
      x.lineWidth = 4;
      x.strokeRect(-100, -160, 200, 320);
      x.restore();
      // keyring, big
      x.save();
      x.translate(W * 0.34, H * 0.34);
      x.strokeStyle = "rgba(52,50,54,0.96)";
      x.lineWidth = 24;
      x.beginPath();
      x.arc(0, 0, 74, 0, 6.283);
      x.stroke();
      x.strokeStyle = "rgba(214,208,198,0.5)";
      x.lineWidth = 5;
      x.beginPath();
      x.arc(-14, -14, 74, -2.4, -0.6);
      x.stroke();
      // three keys hanging
      const keys = [
        [-86, 0.24, 1.0],
        [0, -0.05, 1.12],
        [86, 0.34, 0.92],
      ];
      keys.forEach(([kx, rot, sc]) => {
        x.save();
        x.translate(kx, 56);
        x.rotate(rot);
        x.scale(sc, sc);
        x.fillStyle = "rgba(58,56,62,0.96)";
        x.beginPath();
        x.roundRect(-14, 0, 28, 262, 10);
        x.fill();
        x.beginPath();
        x.arc(0, 12, 46, 0, 6.283);
        x.fill();
        x.fillStyle = "rgba(208,202,192,0.45)";
        x.beginPath();
        x.arc(0, 12, 21, 0, 6.283);
        x.fill();
        x.fillStyle = "rgba(58,56,62,0.96)";
        x.fillRect(-14, 190, 68, 24);
        x.fillRect(-14, 234, 46, 22);
        x.restore();
      });
      x.restore();
      // red thread tied to the ring, running to the lock
      x.strokeStyle = RED;
      x.lineWidth = 5;
      x.beginPath();
      x.moveTo(W * 0.34 + 74, H * 0.34);
      x.bezierCurveTo(W * 0.5, H * 0.4, W * 0.64, H * 0.44, W * 0.74 - 18, H * 0.5 - 56);
      x.stroke();
    });
    ctx.drawImage(art, 0, 0);
    // keys sway
    ctx.save();
    ctx.translate(W * 0.34, H * 0.34);
    ctx.rotate(Math.sin(lt * 1.6) * 0.05);
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = "rgba(30,26,30,0.9)";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(-86, 56);
    ctx.lineTo(-86, 340);
    ctx.moveTo(0, 56);
    ctx.lineTo(0, 360);
    ctx.moveTo(86, 56);
    ctx.lineTo(86, 320);
    ctx.stroke();
    ctx.restore();
    return true;
  };
})();
