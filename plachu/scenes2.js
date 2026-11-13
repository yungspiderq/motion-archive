/* PLACHU — scenes, part 2. */
(function () {
  "use strict";
  const L = window.LIB;
  const P = L.PAL;
  const W = 1920,
    H = 1080;
  window.SCENES = window.SCENES || {};

  function silhouette(ctx, parts, color) {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = color || "rgba(24,21,24,0.92)";
    parts.forEach((p) => {
      ctx.beginPath();
      ctx.ellipse(p[0], p[1], p[2], p[3], p[4] || 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // ------------------------------------------------------------------ 7. TEDDY
  window.SCENES.teddy = function (st) {
    const { ctx, lt, seed, p } = st;
    const art = PLATE("teddy:art:" + (p.variant || 0), () => {
      const c = L.make(W, H);
      const x = c.getContext("2d");
      L.paintPaper(x, W, H, 1201);
      // ---- bathroom wall: big tiles above the horizon, damp plaster
      L.wash(x, W * 0.5, H * 0.2, 900, 280, "rgba(150,142,136,0.4)", 1221, { alpha: 0.55 });
      x.save();
      x.globalCompositeOperation = "multiply";
      x.strokeStyle = "rgba(54,48,52,0.34)";
      x.lineWidth = 2.5;
      for (let i = 0; i <= 6; i++) {
        const xx = (i / 6) * W;
        x.beginPath();
        x.moveTo(xx, 0);
        x.lineTo(xx, H * 0.6);
        x.stroke();
      }
      for (let j = 0; j <= 4; j++) {
        const yy = (j / 4) * H * 0.6;
        x.beginPath();
        x.moveTo(0, yy);
        x.lineTo(W, yy);
        x.stroke();
      }
      // skirting board
      x.fillStyle = "rgba(46,42,46,0.5)";
      x.fillRect(0, H * 0.585, W, H * 0.018);
      x.restore();
      // pendant lamp
      x.save();
      x.strokeStyle = "rgba(30,27,30,0.8)";
      x.lineWidth = 4;
      x.beginPath();
      x.moveTo(W * 0.5, 0);
      x.lineTo(W * 0.5, H * 0.16);
      x.stroke();
      x.fillStyle = "rgba(38,34,38,0.92)";
      x.beginPath();
      x.moveTo(W * 0.5 - 74, H * 0.245);
      x.lineTo(W * 0.5 - 20, H * 0.155);
      x.lineTo(W * 0.5 + 20, H * 0.155);
      x.lineTo(W * 0.5 + 74, H * 0.245);
      x.closePath();
      x.fill();
      x.fillStyle = "rgba(248,236,214,0.85)";
      x.beginPath();
      x.ellipse(W * 0.5, H * 0.247, 74, 12, 0, 0, Math.PI * 2);
      x.fill();
      x.restore();
      const lampGlow = x.createRadialGradient(W * 0.5, H * 0.26, 0, W * 0.5, H * 0.26, 560);
      lampGlow.addColorStop(0, "rgba(250,236,210,0.3)");
      lampGlow.addColorStop(0.45, "rgba(250,236,210,0.1)");
      lampGlow.addColorStop(1, "rgba(250,236,210,0)");
      x.save();
      x.globalCompositeOperation = "lighter";
      x.fillStyle = lampGlow;
      x.fillRect(W * 0.5 - 580, 0, 1160, H * 0.9);
      x.restore();
      // grime running down the tiles
      const gr = L.R(1225);
      for (let i = 0; i < 16; i++) {
        L.drip(x, gr() * W, H * (0.02 + gr() * 0.2), 60 + gr() * 200, "rgba(96,86,80,0.22)", 1226 + i, 3 + gr() * 4);
      }
      // ---- wet floor: perspective grid to a vanishing point
      L.wash(x, W * 0.5, H * 0.8, 950, 330, "rgba(104,108,118,0.55)", 1211, { alpha: 0.8 });
      x.save();
      x.globalCompositeOperation = "multiply";
      x.strokeStyle = "rgba(44,40,44,0.28)";
      x.lineWidth = 2;
      const vpx = W * 0.5,
        vpy = H * 0.6;
      for (let i = -6; i <= 6; i++) {
        x.beginPath();
        x.moveTo(vpx + i * 26, vpy);
        x.lineTo(vpx + i * 420, H);
        x.stroke();
      }
      for (let i = 0; i < 9; i++) {
        const k = Math.pow(i / 9, 1.9);
        const yy = vpy + k * (H - vpy);
        x.lineWidth = 1 + k * 3;
        x.beginPath();
        x.moveTo(0, yy);
        x.lineTo(W, yy);
        x.stroke();
      }
      x.restore();
      // reflection of the light on the wet floor
      const fl = x.createRadialGradient(W * 0.5, H * 0.86, 0, W * 0.5, H * 0.86, 420);
      fl.addColorStop(0, "rgba(240,232,220,0.16)");
      fl.addColorStop(1, "rgba(240,232,220,0)");
      x.fillStyle = fl;
      x.fillRect(0, H * 0.6, W, H * 0.4);
      // bears
      const bear = (bx, by, s, flip, col) => {
        x.save();
        x.translate(bx, by);
        x.scale(flip ? -s : s, s);
        silhouette(
          x,
          [
            [0, 60, 78, 92],
            [0, -60, 62, 60],
            [-52, -108, 24, 24],
            [52, -108, 24, 24],
            [-72, 70, 26, 40],
            [72, 70, 26, 40],
            [-20, 132, 34, 24],
            [24, 132, 34, 24],
          ],
          col
        );
        // stitched eyes
        x.globalCompositeOperation = "source-over";
        x.fillStyle = "rgba(230,220,210,0.75)";
        x.beginPath();
        x.arc(-22, -70, 7, 0, Math.PI * 2);
        x.arc(22, -70, 7, 0, Math.PI * 2);
        x.fill();
        x.fillStyle = "rgba(40,34,34,0.9)";
        x.beginPath();
        x.arc(-22, -70, 3, 0, Math.PI * 2);
        x.arc(22, -70, 3, 0, Math.PI * 2);
        x.fill();
        // muzzle
        x.fillStyle = "rgba(210,198,188,0.55)";
        x.beginPath();
        x.ellipse(0, -34, 26, 20, 0, 0, Math.PI * 2);
        x.fill();
        // nose + mouth stitch
        x.fillStyle = "rgba(36,30,30,0.85)";
        x.beginPath();
        x.ellipse(0, -42, 9, 7, 0, 0, Math.PI * 2);
        x.fill();
        x.strokeStyle = "rgba(40,34,34,0.7)";
        x.lineWidth = 2;
        x.beginPath();
        x.moveTo(0, -36);
        x.lineTo(0, -26);
        x.moveTo(0, -26);
        x.quadraticCurveTo(-8, -22, -12, -26);
        x.moveTo(0, -26);
        x.quadraticCurveTo(8, -22, 12, -26);
        x.stroke();
        // belly seam
        x.strokeStyle = "rgba(226,216,206,0.34)";
        x.lineWidth = 2;
        x.setLineDash([5, 8]);
        x.beginPath();
        x.moveTo(0, -8);
        x.lineTo(0, 108);
        x.stroke();
        x.setLineDash([]);
        // fur fringe around the body
        const fr = L.R(1210 + Math.round(bx));
        x.strokeStyle = col;
        x.globalAlpha = 0.55;
        for (let i = 0; i < 70; i++) {
          const a = fr() * Math.PI * 2;
          const rr = 0.94 + fr() * 0.06;
          const px = Math.cos(a) * 78 * rr;
          const py = 60 + Math.sin(a) * 92 * rr;
          const len = 4 + fr() * 9;
          x.lineWidth = 1.4 + fr() * 1.2;
          x.beginPath();
          x.moveTo(px, py);
          x.lineTo(px + Math.cos(a) * len, py + Math.sin(a) * len);
          x.stroke();
        }
        x.globalAlpha = 1;
        x.restore();
      };
      bear(W * 0.32, H * 0.62, 1.25, false, "rgba(120,104,96,0.88)");
      bear(W * 0.56, H * 0.68, 0.95, true, "rgba(96,84,82,0.9)");
      // contact shadows
      x.save();
      x.globalCompositeOperation = "multiply";
      x.fillStyle = "rgba(58,52,54,0.3)";
      x.beginPath();
      x.ellipse(W * 0.32, H * 0.805, 190, 26, 0, 0, Math.PI * 2);
      x.fill();
      x.beginPath();
      x.ellipse(W * 0.56, H * 0.845, 140, 20, 0, 0, Math.PI * 2);
      x.fill();
      x.restore();
      // red thread between them
      x.save();
      x.strokeStyle = "rgba(160,30,36,0.75)";
      x.lineWidth = 3.5;
      x.beginPath();
      x.moveTo(W * 0.38, H * 0.72);
      x.bezierCurveTo(W * 0.44, H * 0.82, W * 0.5, H * 0.58, W * 0.56, H * 0.74);
      x.stroke();
      x.restore();
      // reflection
      x.save();
      x.globalAlpha = 0.18;
      x.translate(0, H * 1.28);
      x.scale(1, -0.28);
      bear(W * 0.32, H * 0.62, 1.25, false, "rgba(80,70,70,0.9)");
      bear(W * 0.56, H * 0.68, 0.95, true, "rgba(80,70,70,0.9)");
      x.restore();
      // scattered red drops
      L.splatter(x, W * 0.72, H * 0.86, 40, "rgba(150,28,34,0.4)", 1231, { drops: 14, spread: 2 });
      return c;
    });
    ctx.drawImage(art, 0, 0);
    L.dust(ctx, W, H, lt, seed + 4, 30, 0.2);
    // slow camera breathing handled by engine
    return true;
  };

  // ------------------------------------------------------------------ 8. CANVAS
  window.SCENES.canvas = function (st) {
    const { ctx, lt, seed, p, bass } = st;
    const art = PLATE("canvas:art:" + (p.variant || 0), () => {
      const c = L.make(W, H);
      const x = c.getContext("2d");
      L.paintPaper(x, W, H, 1301);
      // studio wall
      L.wash(x, W * 0.5, H * 0.4, 900, 520, "rgba(126,120,118,0.45)", 1311, { alpha: 0.6 });
      // easel legs
      x.save();
      x.strokeStyle = "rgba(46,40,42,0.8)";
      x.lineWidth = 14;
      x.lineCap = "round";
      x.beginPath();
      x.moveTo(W * 0.36, H * 0.92);
      x.lineTo(W * 0.46, H * 0.18);
      x.moveTo(W * 0.68, H * 0.92);
      x.lineTo(W * 0.56, H * 0.18);
      x.stroke();
      x.restore();
      // canvas
      const cw = W * 0.46,
        ch = H * 0.56;
      const cx = W * 0.51,
        cy = H * 0.46;
      x.save();
      x.translate(cx, cy);
      x.fillStyle = "rgba(232,226,218,0.95)";
      x.fillRect(-cw / 2, -ch / 2, cw, ch);
      x.strokeStyle = "rgba(50,44,46,0.65)";
      x.lineWidth = 3;
      x.strokeRect(-cw / 2, -ch / 2, cw, ch);
      // paint inside
      x.save();
      x.beginPath();
      x.rect(-cw / 2 + 3, -ch / 2 + 3, cw - 6, ch - 6);
      x.clip();
      L.wash(x, -cw * 0.1, -ch * 0.05, cw * 0.42, ch * 0.4, "rgba(120,110,116,0.55)", 1321, { alpha: 0.7 });
      L.splatter(x, cw * 0.1, ch * 0.02, 90, "rgba(150,26,32,0.75)", 1331, { drops: 26, spread: 2.4, core: 1.1 });
      L.drip(x, cw * 0.02, ch * 0.06, 130, "rgba(140,24,30,0.6)", 1341, 5);
      // brush strokes
      x.strokeStyle = "rgba(26,22,24,0.5)";
      for (let i = 0; i < 7; i++) {
        x.lineWidth = 2 + i;
        x.beginPath();
        x.moveTo(-cw * 0.34 + i * 18, -ch * 0.36);
        x.lineTo(-cw * 0.3 + i * 22, ch * 0.3);
        x.stroke();
      }
      x.restore();
      x.restore();
      // floor
      L.wash(x, W * 0.5, H * 0.95, 900, 140, "rgba(90,84,86,0.5)", 1351, { alpha: 0.6 });
      return c;
    });
    ctx.drawImage(art, 0, 0);

    // animated wet splatter bleeding down the canvas
    const r = L.R(seed + 8);
    for (let i = 0; i < 5; i++) {
      const x0 = W * (0.4 + r() * 0.24);
      const y0 = H * (0.3 + r() * 0.2);
      const len = 60 + ((lt * (30 + r() * 60) + r() * 200) % 320);
      ctx.save();
      ctx.globalAlpha = 0.4;
      L.drip(ctx, x0, y0, len, "rgba(140,24,30,0.55)", 1361 + i, 3 + r() * 3);
      ctx.restore();
    }
    return true;
  };

  // ------------------------------------------------------------------ 9. TEARS
  window.SCENES.tears = function (st) {
    const { ctx, lt, seed, bass } = st;
    const art = PLATE("tears:art", () => {
      const c = L.make(W, H);
      const x = c.getContext("2d");
      L.paintPaper(x, W, H, 1401);

      // ---- skin: whole frame is a cheek
      L.wash(x, W * 0.5, H * 0.7, 1150, 620, "rgba(206,172,160,0.5)", 1411, { alpha: 0.8, layers: 26 });
      L.wash(x, W * 0.2, H * 0.85, 620, 360, "rgba(196,150,140,0.35)", 1413, { alpha: 0.6 });
      L.wash(x, W * 0.82, H * 0.3, 420, 300, "rgba(150,124,120,0.3)", 1415, { alpha: 0.5 });

      // ---- the lid line, bowing up in the middle
      const lidY = (t) => H * 0.36 - Math.sin(t * Math.PI) * H * 0.155;
      const lidPts = [];
      for (let i = 0; i <= 40; i++) lidPts.push([-60 + (i / 40) * (W + 120), lidY(i / 40)]);

      // ---- eye interior above the lid
      x.save();
      x.beginPath();
      x.moveTo(-60, -40);
      x.lineTo(W + 60, -40);
      x.lineTo(W + 60, lidY(1));
      for (let i = 40; i >= 0; i--) x.lineTo(-60 + (i / 40) * (W + 120), lidY(i / 40));
      x.closePath();
      x.clip();
      x.fillStyle = "rgba(220,212,206,0.97)";
      x.fillRect(0, 0, W, H * 0.4);
      // shadow where the lid meets the eyeball
      const eg = x.createLinearGradient(0, 0, 0, H * 0.34);
      eg.addColorStop(0, "rgba(120,96,94,0.28)");
      eg.addColorStop(1, "rgba(120,96,94,0)");
      x.fillStyle = eg;
      x.fillRect(0, 0, W, H * 0.36);
      // iris, partly hidden by the lid
      const ix = W * 0.46,
        iy = H * 0.06,
        ir = W * 0.17;
      const ig = x.createRadialGradient(ix - ir * 0.2, iy - ir * 0.2, 10, ix, iy, ir);
      ig.addColorStop(0, "#c98a48");
      ig.addColorStop(0.38, "#a4572a");
      ig.addColorStop(0.74, "#7c2019");
      ig.addColorStop(1, "#2b1514");
      x.fillStyle = ig;
      x.beginPath();
      x.arc(ix, iy, ir, 0, Math.PI * 2);
      x.fill();
      // fibres
      const fr = L.R(1421);
      x.strokeStyle = "rgba(58,22,18,0.35)";
      for (let i = 0; i < 90; i++) {
        const a = fr() * Math.PI * 2;
        const r0 = ir * (0.3 + fr() * 0.2);
        x.lineWidth = 0.7 + fr() * 1.5;
        x.beginPath();
        x.moveTo(ix + Math.cos(a) * r0, iy + Math.sin(a) * r0);
        x.lineTo(ix + Math.cos(a) * ir * (0.85 + fr() * 0.14), iy + Math.sin(a) * ir * (0.85 + fr() * 0.14));
        x.stroke();
      }
      x.fillStyle = "#151011";
      x.beginPath();
      x.ellipse(ix, iy, ir * 0.36, ir * 0.4, 0, 0, Math.PI * 2);
      x.fill();
      x.fillStyle = "rgba(252,248,242,0.85)";
      x.beginPath();
      x.ellipse(ix - ir * 0.34, iy - ir * 0.36, ir * 0.2, ir * 0.12, -0.5, 0, Math.PI * 2);
      x.fill();
      // bloodshot veins in the sclera
      x.strokeStyle = "rgba(160,60,60,0.22)";
      const vr = L.R(1423);
      for (let i = 0; i < 10; i++) {
        const sx = vr() * W,
          sy = vr() * H * 0.12;
        x.lineWidth = 0.8 + vr() * 1.6;
        x.beginPath();
        x.moveTo(sx, sy);
        x.quadraticCurveTo(sx + 40, sy + 40, sx + (vr() - 0.2) * 120, sy + 80 + vr() * 60);
        x.stroke();
      }
      x.restore();

      // ---- shadow cast by the lid onto the cheek
      x.save();
      x.beginPath();
      x.moveTo(-60, lidY(0));
      for (let i = 1; i <= 40; i++) x.lineTo(-60 + (i / 40) * (W + 120), lidY(i / 40));
      x.lineTo(W + 60, H * 0.62);
      x.lineTo(-60, H * 0.62);
      x.closePath();
      const sg = x.createLinearGradient(0, H * 0.2, 0, H * 0.6);
      sg.addColorStop(0, "rgba(104,70,70,0.34)");
      sg.addColorStop(0.35, "rgba(104,70,70,0.12)");
      sg.addColorStop(1, "rgba(104,70,70,0)");
      x.fillStyle = sg;
      x.fill();
      x.restore();

      // ---- lid edge: heavy ink line with a wet highlight
      L.sketchPath(x, lidPts, 1431, { width: 12, color: "rgba(24,19,21,0.92)", passes: 3, jitter: 3.5 });
      L.sketchPath(x, lidPts.map((p) => [p[0], p[1] + 9]), 1433, { width: 3, color: "rgba(120,40,38,0.5)", passes: 2, jitter: 2 });
      // lower lashes
      const lr = L.R(1441);
      for (let i = 0; i < 34; i++) {
        const t = i / 34;
        const bx = -60 + t * (W + 120);
        const by = lidY(t);
        const len = 16 + lr() * 34;
        L.inkStroke(
          x,
          [
            [bx, by],
            [bx + (lr() - 0.5) * 12, by + len * 0.6],
            [bx + (lr() - 0.5) * 26, by + len],
          ],
          3 + lr() * 2,
          "rgba(28,22,24,0.8)",
          1451 + i,
          { passes: 1 }
        );
      }

      // ---- tear tracks: wet grooves down the cheek
      const tr = L.R(1461);
      for (let i = 0; i < 5; i++) {
        const t = 0.2 + tr() * 0.5;
        const x0 = -60 + t * (W + 120);
        const y0 = lidY(t) + 6;
        const len = 240 + tr() * 420;
        x.save();
        x.globalAlpha = 0.5;
        x.strokeStyle = "rgba(150,164,172,0.5)";
        x.lineWidth = 12 + tr() * 16;
        x.lineCap = "round";
        x.beginPath();
        x.moveTo(x0, y0);
        x.bezierCurveTo(x0 + 8, y0 + len * 0.4, x0 - 10, y0 + len * 0.7, x0 + 4, y0 + len);
        x.stroke();
        x.globalAlpha = 0.4;
        x.strokeStyle = "rgba(252,250,246,0.7)";
        x.lineWidth = 3;
        x.beginPath();
        x.moveTo(x0 - 4, y0);
        x.bezierCurveTo(x0 + 4, y0 + len * 0.4, x0 - 14, y0 + len * 0.7, x0, y0 + len);
        x.stroke();
        x.restore();
      }
      // red under-eye blush
      L.wash(x, W * 0.46, H * 0.44, 420, 150, "rgba(178,74,74,0.4)", 1471, { alpha: 0.5, layers: 14 });
      return c;
    });
    ctx.drawImage(art, 0, 0);

    // ---- falling tears, animated
    const r = L.R(seed + 2);
    for (let i = 0; i < 7; i++) {
      const x0 = W * (0.26 + r() * 0.46);
      const speed = 150 + r() * 260;
      const start = H * 0.36;
      const y = start + ((lt * speed + r() * 900) % 780);
      const len = 26 + (y - start) * 0.22;
      ctx.save();
      ctx.globalAlpha = 0.6 * Math.min(1, (y - start) / 120);
      // water: cool shadow + white glint
      L.drip(ctx, x0, y - len, len, "rgba(128,150,164,0.55)", 1481 + i, 4 + r() * 4);
      ctx.globalAlpha = 0.5;
      L.drip(ctx, x0 - 2, y - len, len * 0.8, "rgba(250,250,246,0.6)", 1491 + i, 2);
      ctx.restore();
    }
    // red pulse on the bass
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.filter = "blur(50px)";
    const pg = ctx.createRadialGradient(W * 0.46, H * 0.16, 0, W * 0.46, H * 0.16, 420);
    pg.addColorStop(0, `rgba(168,31,38,${0.1 + bass * 0.16})`);
    pg.addColorStop(1, "rgba(168,31,38,0)");
    ctx.fillStyle = pg;
    ctx.fillRect(0, 0, W, H * 0.6);
    ctx.restore();
    return true;
  };

  // ------------------------------------------------------------------ 10. TYPE
  window.SCENES.type = function (st) {
    const { ctx, lt, p, seed, bass } = st;
    const text = (p.text || "ПЛАЧУ КАК СУКА").toUpperCase();
    const art = PLATE("type:art:" + (p.variant || 0), () => {
      const c = L.make(W, H);
      const x = c.getContext("2d");
      L.paintPaper(x, W, H, 1501 + (p.variant || 0));
      L.wash(x, W * (p.variant ? 0.68 : 0.3), H * 0.5, 520, 420, "rgba(120,112,116,0.4)", 1511 + (p.variant || 0), { alpha: 0.55 });
      L.splatter(x, W * (p.variant ? 0.2 : 0.8), H * 0.72, 90, "rgba(150,26,32,0.4)", 1521 + (p.variant || 0), { drops: 20, spread: 2.2 });
      return c;
    });
    ctx.drawImage(art, 0, 0);

    // fit type to width
    const words = text.split(/\s+/);
    let size = 210;
    ctx.font = `900 ${size}px ${L.FONT_DISPLAY}`;
    let widest = Math.max(...words.map((w) => ctx.measureText(w).width));
    const maxW = W * 0.86;
    if (widest > maxW) size *= maxW / widest;
    const lines = words.length > 3 ? [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")] : [text];
    const lineH = size * 1.02;
    const startY = H * 0.5 - ((lines.length - 1) * lineH) / 2;

    for (let i = 0; i < lines.length; i++) {
      const k = L.clamp((lt - i * 0.16) / 0.3, 0, 1);
      const e = L.easeOut(k);
      const jitterX = (1 - e) * (i % 2 ? -140 : 140);
      ctx.save();
      ctx.globalAlpha = e;
      ctx.translate(jitterX, 0);
      L.inkType(ctx, lines[i], W / 2, startY + i * lineH, size, {
        color: "#171518",
        seed: seed + i * 17,
        jitter: size * 0.012,
        tracking: size * 0.02,
        rot: (i % 2 ? 1 : -1) * 0.012,
        shadow: "rgba(168,31,38,0.55)",
      });
      ctx.restore();
    }
    // red rule
    const k2 = L.clamp((lt - 0.3) / 0.5, 0, 1);
    if (k2 > 0) {
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = "rgba(168,31,38,0.85)";
      ctx.fillRect(W * 0.5 - (W * 0.34 * L.easeOut(k2)) / 2, startY + (lines.length - 1) * lineH + size * 0.66, W * 0.34 * L.easeOut(k2), 7 + bass * 6);
      ctx.restore();
    }
    return true;
  };

  // ------------------------------------------------------------------ 11. MIRROR
  window.SCENES.mirror = function (st) {
    const { ctx, lt, seed, p } = st;
    const art = PLATE("mirror:art", () => {
      const c = L.make(W, H);
      const x = c.getContext("2d");
      L.paintPaper(x, W, H, 1601);
      // two halves
      x.save();
      x.beginPath();
      x.rect(0, 0, W / 2, H);
      x.clip();
      L.wash(x, W * 0.26, H * 0.55, 520, 460, "rgba(110,108,120,0.55)", 1611, { alpha: 0.7 });
      L.figure(x, W * 0.28, H * 0.2, H * 0.72, {
        color: "rgba(24,22,26,0.9)",
        hair: true,
        hairW: 1.6,
        arms: [
          [W * 0.24, H * 0.68],
          [W * 0.32, H * 0.68],
        ],
      });
      x.restore();
      // right half — reflection, washed out, red
      x.save();
      x.beginPath();
      x.rect(W / 2, 0, W / 2, H);
      x.clip();
      L.wash(x, W * 0.74, H * 0.55, 520, 460, "rgba(150,120,120,0.4)", 1621, { alpha: 0.6 });
      x.globalAlpha = 0.55;
      L.figure(x, W * 0.72, H * 0.22, H * 0.7, {
        color: "rgba(70,40,44,0.9)",
        hair: true,
        arms: [
          [W * 0.68, H * 0.68],
          [W * 0.76, H * 0.68],
        ],
      });
      x.globalAlpha = 1;
      L.splatter(x, W * 0.78, H * 0.34, 80, "rgba(150,26,32,0.5)", 1631, { drops: 22, spread: 2.4 });
      x.restore();
      // seam
      x.save();
      x.globalCompositeOperation = "multiply";
      const g = x.createLinearGradient(W / 2 - 30, 0, W / 2 + 30, 0);
      g.addColorStop(0, "rgba(30,26,28,0)");
      g.addColorStop(0.5, "rgba(30,26,28,0.55)");
      g.addColorStop(1, "rgba(30,26,28,0)");
      x.fillStyle = g;
      x.fillRect(W / 2 - 30, 0, 60, H);
      x.restore();
      return c;
    });
    ctx.drawImage(art, 0, 0);

    // mirrored shimmer on the right half: thin displaced slices only
    const off = Math.sin(lt * 2.2) * 12;
    ctx.save();
    ctx.beginPath();
    ctx.rect(W / 2, 0, W / 2, H);
    ctx.clip();
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 4; i++) {
      const y = H * (0.16 + i * 0.21) + Math.sin(lt * 1.4 + i) * 18;
      ctx.drawImage(art, W / 2, y, W / 2, 26, W / 2 + off * (i % 2 ? 1 : -1), y, W / 2, 26);
    }
    ctx.restore();

    // vertical tear
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = "rgba(168,31,38,0.55)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(W / 2 + off, 0);
    for (let i = 0; i <= 20; i++) ctx.lineTo(W / 2 + off + Math.sin(i * 1.7 + lt) * 6, (i / 20) * H);
    ctx.stroke();
    ctx.restore();
    return true;
  };

  // ------------------------------------------------------------------ 12. STATIC (screams)
  window.SCENES.static = function (st) {
    const { ctx, lt, seed, bass, rms } = st;
    const art = PLATE("static:art", () => {
      const c = L.make(W, H);
      const x = c.getContext("2d");
      L.paintPaper(x, W, H, 1701);
      L.wash(x, W * 0.5, H * 0.5, 900, 520, "rgba(70,66,72,0.75)", 1711, { alpha: 0.8 });
      L.splatter(x, W * 0.5, H * 0.5, 200, "rgba(150,26,32,0.5)", 1721, { drops: 40, spread: 2.6 });
      return c;
    });
    ctx.drawImage(art, 0, 0);

    // scanlines
    const r = L.R(seed + Math.floor(lt * 18));
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "rgba(10,8,10,0.5)";
    for (let y = 0; y < H; y += 6) {
      if (r() < 0.35) ctx.fillRect(0, y, W, 2 + r() * 3);
    }
    ctx.restore();

    // displaced bands
    for (let i = 0; i < 5; i++) {
      const y = r() * H;
      const h = 20 + r() * 90;
      const dx = (r() - 0.5) * (60 + bass * 120);
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.drawImage(art, 0, y, W, h, dx, y, W, h);
      ctx.restore();
    }

    // halftone dots
    const ht = PLATE("static:dots", () => L.halftoneTile(64, "rgba(24,20,22,0.55)"));
    ctx.save();
    ctx.globalAlpha = 0.18 + rms * 0.12;
    const pat = ctx.createPattern(ht, "repeat");
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // big scream type, fitted to the frame
    const word = (st.p.text || "А-А-А").toUpperCase();
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.font = `900 300px ${L.FONT_DISPLAY}`;
    let size = 300;
    const widest = ctx.measureText(word).width;
    const maxW = W * 0.84;
    if (widest > maxW) size *= maxW / widest;
    const lines = word.length > 16 ? [word.slice(0, Math.ceil(word.length / 2)), word.slice(Math.ceil(word.length / 2))] : [word];
    const lineH = size * 1.0;
    const startY = H * 0.5 - ((lines.length - 1) * lineH) / 2;
    lines.forEach((ln, i) => {
      L.inkType(ctx, ln, W / 2 + (r() - 0.5) * 30, startY + i * lineH, size, {
        color: "#f2ece6",
        seed: seed + 3 + i * 7,
        jitter: size * 0.02,
        charRot: 0.08,
        shadow: "rgba(168,31,38,0.95)",
      });
    });
    ctx.restore();
    return true;
  };

  // ------------------------------------------------------------------ 13. END
  window.SCENES.end = function (st) {
    const { ctx, lt, seed } = st;
    const art = PLATE("end:art", () => {
      const c = L.make(W, H);
      const x = c.getContext("2d");
      L.paintPaper(x, W, H, 1801);
      L.wash(x, W * 0.5, H * 0.5, 800, 480, "rgba(120,112,116,0.35)", 1811, { alpha: 0.5 });
      L.splatter(x, W * 0.5, H * 0.42, 130, "rgba(150,26,32,0.45)", 1821, { drops: 30, spread: 2.4 });
      return c;
    });
    ctx.drawImage(art, 0, 0);
    const k = L.clamp(lt / 0.6, 0, 1);
    ctx.save();
    ctx.globalAlpha = k;
    L.inkType(ctx, "ПЛАЧУ КАК СУКА", W / 2, H * 0.42, 150, {
      color: "#171518",
      seed: 1831,
      tracking: 4,
      jitter: 2,
    });
    L.inkType(ctx, "MIDIX", W / 2, H * 0.55, 46, {
      color: "rgba(168,31,38,0.95)",
      font: L.FONT_SERIF,
      weight: 400,
      tracking: 22,
      seed: 1841,
    });
    L.inkType(ctx, "неофициальный фанатский motion clip · 2026", W / 2, H * 0.66, 26, {
      color: "rgba(40,36,38,0.7)",
      font: L.FONT_SERIF,
      weight: 400,
      tracking: 6,
      seed: 1851,
    });
    ctx.restore();
    return true;
  };
})();
