/* PLACHU — scenes, part 1.
   Each scene: draw(st). Heavy static art is cached through PLATE(key, builder). */
(function () {
  "use strict";
  const L = window.LIB;
  const P = L.PAL;
  const W = 1920,
    H = 1080;
  window.SCENES = window.SCENES || {};

  // ------------------------------------------------------------------ helpers
  function paperBase(key, seed) {
    return PLATE(key + ":paper", () => {
      const c = L.make(W, H);
      const x = c.getContext("2d");
      L.paintPaper(x, W, H, seed);
      const tile = L.paperTile(256, seed + 3);
      x.globalAlpha = 0.5;
      x.globalCompositeOperation = "overlay";
      for (let y = 0; y < H; y += 256) for (let xx = 0; xx < W; xx += 256) x.drawImage(tile, xx, y);
      x.globalAlpha = 1;
      x.globalCompositeOperation = "source-over";
      return c;
    });
  }

  function platePaper(st, seed) {
    const c = paperBase(st.key, seed || st.seed);
    st.ctx.drawImage(c, 0, 0);
  }

  /** soft dark silhouette blob from a list of ellipse parts */
  function silhouette(ctx, parts, color, seed) {
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

  function bokeh(ctx, spots, alpha) {
    spots.forEach((s) => {
      const [x, y, r, col] = s;
      const a = alpha == null ? 0.9 : alpha;
      const base = col.replace(/[\d.]+\)$/, "");
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, base + 0.5 * a + ")");
      g.addColorStop(0.45, base + 0.3 * a + ")");
      g.addColorStop(0.78, base + 0.09 * a + ")");
      g.addColorStop(1, base + "0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      // faint ring, like an out-of-focus highlight
      ctx.globalAlpha = 0.18 * a;
      ctx.strokeStyle = base + "0.5)";
      ctx.lineWidth = Math.max(1, r * 0.03);
      ctx.beginPath();
      ctx.arc(x, y, r * 0.92, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
    ctx.globalAlpha = 1;
  }

  function inkFrame(ctx, x, y, w, h, seed, weight) {
    L.sketchPath(
      ctx,
      [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
        [x, y],
      ],
      seed,
      { width: weight || 5, color: "rgba(26,24,26,0.85)", passes: 3, jitter: 3.5 }
    );
  }

  // ------------------------------------------------------------------ 1. TITLE
  window.SCENES.title = function (st) {
    const { ctx, lt, bass } = st;
    const seed = 101;

    const art = PLATE("title:art", () => {
      const c = L.make(W, H);
      const x = c.getContext("2d");
      L.paintPaper(x, W, H, seed);
      // cold wash on the left, warm grey on the right
      L.wash(x, W * 0.22, H * 0.55, 620, 520, "rgba(96,98,110,0.55)", 111, { alpha: 0.75, layers: 26 });
      L.wash(x, W * 0.82, H * 0.42, 420, 480, "rgba(126,112,110,0.4)", 121, { alpha: 0.6 });
      // red ink blot
      L.splatter(x, W * 0.78, H * 0.34, 120, "rgba(150,26,32,0.55)", 131, { drops: 34, spread: 2.6, core: 1 });
      L.drip(x, W * 0.75, H * 0.4, 300, "rgba(140,24,30,0.5)", 141, 5);
      L.drip(x, W * 0.81, H * 0.36, 190, "rgba(140,24,30,0.45)", 151, 3);

      // three tilted frames on the right — like proof prints
      const frames = [
        { x: W * 0.66, y: H * 0.14, w: 330, h: 400, r: -0.05, motif: "eye", s: 201 },
        { x: W * 0.82, y: H * 0.2, w: 300, h: 350, r: 0.06, motif: "knife", s: 211 },
        { x: W * 0.75, y: H * 0.62, w: 340, h: 300, r: -0.02, motif: "window", s: 221 },
      ];
      frames.forEach((f) => {
        x.save();
        x.translate(f.x, f.y);
        x.rotate(f.r);
        x.fillStyle = "rgba(238,232,226,0.9)";
        x.fillRect(0, 0, f.w, f.h);
        x.save();
        x.beginPath();
        x.rect(8, 8, f.w - 16, f.h - 16);
        x.clip();
        drawMotif(x, f.motif, 0, 0, f.w, f.h, f.s);
        x.restore();
        inkFrame(x, 0, 0, f.w, f.h, f.s + 5, 3);
        x.restore();
      });
      return c;
    });
    ctx.drawImage(art, 0, 0);

    // red bar
    const kb = L.clamp(lt / 0.6, 0, 1);
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.9 * kb;
    ctx.fillStyle = "rgba(168,31,38,0.9)";
    ctx.fillRect(120, H * 0.19, 6, H * 0.56 * L.easeOut(kb));
    ctx.restore();

    // stacked title
    const words = [
      { t: "ПЛАЧУ", y: 0.3, size: 190, color: "#171518", font: L.FONT_DISPLAY, weight: 900, tr: 8, d: 0.05 },
      { t: "КАК", y: 0.47, size: 70, color: P.red, font: L.FONT_SERIF, weight: 400, tr: 30, d: 0.45 },
      { t: "СУКА", y: 0.66, size: 190, color: "#171518", font: L.FONT_DISPLAY, weight: 900, tr: 8, d: 0.8 },
    ];
    words.forEach((w, i) => {
      const k = L.clamp((lt - w.d) / 0.4, 0, 1);
      if (k <= 0) return;
      const e = L.easeOut(k);
      ctx.save();
      ctx.globalAlpha = e;
      ctx.translate(170 + (1 - e) * -90, H * w.y);
      L.inkType(ctx, w.t, 0, 0, w.size, {
        color: w.color,
        font: w.font,
        weight: w.weight,
        tracking: w.tr,
        align: "left",
        rot: (i === 1 ? -0.02 : 0.006) * (i ? 1 : -1),
        seed: seed + i * 11,
        jitter: 2.6,
        shadow: i === 1 ? null : "rgba(168,31,38,0.35)",
      });
      ctx.restore();
    });

    // meta line
    const km = L.clamp((lt - 1.5) / 0.5, 0, 1);
    if (km > 0) {
      ctx.globalAlpha = km;
      L.inkType(ctx, "MIDIX  ·  ТЫ ЛЮБИШЬ ЗАПАХ КРОВИ  ·  2026", 170, H * 0.84, 24, {
        font: L.FONT_SERIF,
        weight: 400,
        tracking: 8,
        align: "left",
        color: "rgba(38,34,36,0.8)",
        seed: 191,
      });
      ctx.globalAlpha = 1;
    }

    // subtle red pulse over the blot
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.06 + bass * 0.1;
    ctx.fillStyle = "rgba(168,31,38,1)";
    ctx.beginPath();
    ctx.ellipse(W * 0.78, H * 0.34, 260, 200, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return true;
  };

  function drawMotif(x, kind, px, py, w, h, seed) {
    const cx = px + w / 2,
      cy = py + h / 2;
    x.save();
    x.beginPath();
    x.rect(px + 3, py + 3, w - 6, h - 6);
    x.clip();
    if (kind === "eye") {
      L.wash(x, cx, cy, w * 0.42, h * 0.2, "rgba(120,110,106,0.5)", seed, { alpha: 0.5 });
      x.strokeStyle = "rgba(26,24,26,0.8)";
      x.lineWidth = 3;
      x.beginPath();
      x.ellipse(cx, cy, w * 0.3, h * 0.19, 0, 0, Math.PI * 2);
      x.stroke();
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, h * 0.15);
      g.addColorStop(0, "#c08a3e");
      g.addColorStop(0.55, "#8e2a24");
      g.addColorStop(1, "#2a1a1a");
      x.fillStyle = g;
      x.beginPath();
      x.arc(cx, cy, h * 0.15, 0, Math.PI * 2);
      x.fill();
      x.fillStyle = "#161314";
      x.beginPath();
      x.arc(cx, cy, h * 0.06, 0, Math.PI * 2);
      x.fill();
    } else if (kind === "train") {
      L.wash(x, cx, cy, w * 0.45, h * 0.3, "rgba(110,120,135,0.55)", seed, { alpha: 0.6 });
      x.fillStyle = "rgba(30,28,32,0.85)";
      x.fillRect(px + w * 0.12, py + h * 0.42, w * 0.76, h * 0.4);
      x.fillStyle = "rgba(235,225,210,0.55)";
      for (let i = 0; i < 5; i++) x.fillRect(px + w * (0.16 + i * 0.14), py + h * 0.5, w * 0.09, h * 0.14);
      silhouette(x, [[cx - w * 0.18, py + h * 0.72, w * 0.03, h * 0.16], [cx + w * 0.1, py + h * 0.74, w * 0.035, h * 0.18]], "rgba(24,21,24,0.9)");
    } else if (kind === "cat") {
      L.wash(x, cx, cy, w * 0.4, h * 0.36, "rgba(70,66,70,0.55)", seed, { alpha: 0.6 });
      silhouette(x, [
        [cx, cy + h * 0.06, w * 0.26, h * 0.26],
        [cx - w * 0.16, cy - h * 0.2, w * 0.09, h * 0.12],
        [cx + w * 0.16, cy - h * 0.2, w * 0.09, h * 0.12],
      ], "rgba(38,34,38,0.92)");
      x.fillStyle = "#d09a45";
      x.beginPath();
      x.ellipse(cx - w * 0.09, cy, w * 0.035, h * 0.028, 0, 0, Math.PI * 2);
      x.ellipse(cx + w * 0.09, cy, w * 0.035, h * 0.028, 0, 0, Math.PI * 2);
      x.fill();
    } else if (kind === "knife") {
      L.wash(x, cx, cy, w * 0.42, h * 0.34, "rgba(130,120,118,0.4)", seed, { alpha: 0.5 });
      const hand = [cx + w * 0.16, py + h * 0.24];
      L.figure(x, cx - w * 0.08, py + h * 0.1, h * 0.82, {
        color: "rgba(26,23,26,0.9)",
        hair: true,
        arms: [
          [cx - w * 0.2, py + h * 0.62],
          hand,
        ],
      });
      x.save();
      x.translate(hand[0], hand[1]);
      x.rotate(-0.9);
      x.fillStyle = "rgba(230,226,220,0.96)";
      x.beginPath();
      x.moveTo(0, -8);
      x.lineTo(w * 0.26, -16);
      x.lineTo(w * 0.27, 4);
      x.lineTo(2, 10);
      x.closePath();
      x.fill();
      x.strokeStyle = "rgba(26,24,26,0.8)";
      x.lineWidth = 1.6;
      x.stroke();
      x.strokeStyle = "rgba(168,31,38,0.9)";
      x.lineWidth = 3;
      x.beginPath();
      x.moveTo(6, -5);
      x.lineTo(w * 0.26, -14);
      x.stroke();
      x.restore();
    } else if (kind === "window") {
      L.wash(x, cx, cy, w * 0.44, h * 0.4, "rgba(112,120,136,0.5)", seed, { alpha: 0.6 });
      // skyline
      const sr = L.R(seed + 3);
      x.save();
      x.globalCompositeOperation = "multiply";
      x.fillStyle = "rgba(46,46,56,0.55)";
      for (let i = 0; i < 7; i++) {
        const bw = w * (0.06 + sr() * 0.1);
        const bh = h * (0.12 + sr() * 0.28);
        x.fillRect(px + (i / 7) * w, py + h * 0.52 - bh, bw, bh);
      }
      x.restore();
      // window lights
      x.fillStyle = "rgba(238,214,176,0.7)";
      for (let i = 0; i < 18; i++) {
        x.globalAlpha = 0.3 + sr() * 0.6;
        x.fillRect(px + sr() * w, py + h * (0.28 + sr() * 0.24), 3, 4);
      }
      x.globalAlpha = 1;
      bokeh(x, [
        [cx - w * 0.2, cy - h * 0.06, h * 0.1, "rgba(226,206,176,0.6)"],
        [cx + w * 0.2, cy + h * 0.1, h * 0.08, "rgba(200,180,160,0.45)"],
      ]);
      // rain on the glass
      x.strokeStyle = "rgba(240,236,230,0.45)";
      x.lineWidth = 1.6;
      for (let i = 0; i < 34; i++) {
        const rx = px + ((seed * 7 + i * 53) % w);
        const ry = py + ((seed * 11 + i * 37) % h);
        x.beginPath();
        x.moveTo(rx, ry);
        x.lineTo(rx - 5, ry + 34 + (i % 5) * 8);
        x.stroke();
      }
    } else {
      // teddy
      L.wash(x, cx, cy, w * 0.4, h * 0.34, "rgba(140,128,118,0.45)", seed, { alpha: 0.5 });
      const parts = [
        [cx - w * 0.14, cy + h * 0.08, w * 0.1, h * 0.13],
        [cx - w * 0.14, cy - h * 0.09, w * 0.09, h * 0.09],
        [cx - w * 0.22, cy - h * 0.17, w * 0.04, h * 0.04],
        [cx - w * 0.06, cy - h * 0.17, w * 0.04, h * 0.04],
        [cx + w * 0.16, cy + h * 0.1, w * 0.09, h * 0.12],
        [cx + w * 0.16, cy - h * 0.06, w * 0.08, h * 0.08],
        [cx + w * 0.09, cy - h * 0.14, w * 0.035, h * 0.035],
        [cx + w * 0.23, cy - h * 0.14, w * 0.035, h * 0.035],
      ];
      silhouette(x, parts, "rgba(96,84,78,0.85)");
    }
    x.restore();
  }

  // ------------------------------------------------------------------ 2. PAGE
  // A whole comic page: hand-drawn panels, screentone, ink miniatures.
  window.SCENES.page = function (st) {
    const { ctx, lt, seed, p } = st;
    const v = p.variant || 0;

    const art = PLATE("page:art:" + v, () => {
      const c = L.make(W, H);
      const x = c.getContext("2d");
      L.paintPaper(x, W, H, 211 + v * 13);
      // the table under the page
      L.wash(x, W * 0.5, H * 0.5, 1200, 700, "rgba(120,112,116,0.3)", 271 + v, { alpha: 0.5 });

      // ---------------- miniatures -------------------------------------
      const miniEye = (cx, cy, r) => {
        x.save();
        x.beginPath();
        x.moveTo(cx - r, cy);
        x.quadraticCurveTo(cx, cy - r * 0.92, cx + r, cy);
        x.quadraticCurveTo(cx, cy + r * 0.72, cx - r, cy);
        x.closePath();
        x.fillStyle = "rgba(240,236,230,0.98)";
        x.fill();
        x.strokeStyle = "rgba(24,20,22,0.9)";
        x.lineWidth = Math.max(2, r * 0.035);
        x.stroke();
        x.save();
        x.clip();
        const ig = x.createRadialGradient(cx - r * 0.12, cy - r * 0.14, 1, cx, cy, r * 0.46);
        ig.addColorStop(0, "#c4813f");
        ig.addColorStop(0.5, "#8e2a21");
        ig.addColorStop(1, "#2a1414");
        x.fillStyle = ig;
        x.beginPath();
        x.arc(cx, cy, r * 0.46, 0, Math.PI * 2);
        x.fill();
        x.fillStyle = "#141011";
        x.beginPath();
        x.arc(cx, cy, r * 0.19, 0, Math.PI * 2);
        x.fill();
        x.fillStyle = "rgba(250,246,240,0.8)";
        x.beginPath();
        x.ellipse(cx - r * 0.16, cy - r * 0.18, r * 0.09, r * 0.05, -0.5, 0, Math.PI * 2);
        x.fill();
        x.restore();
        // lashes
        x.strokeStyle = "rgba(26,21,23,0.85)";
        for (let i = 0; i < 13; i++) {
          const t = i / 12;
          const bx = cx - r + t * r * 2;
          const by = cy - Math.sin(t * Math.PI) * r * 0.62;
          x.lineWidth = Math.max(1.6, r * 0.022);
          x.beginPath();
          x.moveTo(bx, by);
          x.lineTo(bx + (t - 0.5) * r * 0.1, by - r * (0.12 + Math.sin(t * Math.PI) * 0.1));
          x.stroke();
        }
        x.restore();
      };

      const miniWindow = (px, py, pw, ph, sd) => {
        const r = L.R(sd);
        // night outside
        const g = x.createLinearGradient(0, py, 0, py + ph);
        g.addColorStop(0, "rgba(150,150,158,0.5)");
        g.addColorStop(1, "rgba(104,106,116,0.55)");
        x.fillStyle = g;
        x.fillRect(px, py, pw, ph);
        // far building
        x.fillStyle = "rgba(84,82,90,0.55)";
        for (let i = 0; i < 5; i++) {
          const bw = pw * (0.14 + r() * 0.2);
          const bh = ph * (0.25 + r() * 0.45);
          const bx = px + r() * (pw - bw);
          x.fillRect(bx, py + ph - bh, bw, bh);
        }
        // rain
        x.strokeStyle = "rgba(236,236,240,0.55)";
        for (let i = 0; i < 90; i++) {
          const rx = px + r() * pw;
          const ry = py + r() * ph;
          const len = 8 + r() * 26;
          x.lineWidth = 1 + r() * 1.6;
          x.beginPath();
          x.moveTo(rx, ry);
          x.lineTo(rx - len * 0.22, ry + len);
          x.stroke();
        }
        // frame + mullions
        x.strokeStyle = "rgba(26,22,24,0.9)";
        x.lineWidth = 9;
        x.strokeRect(px, py, pw, ph);
        x.lineWidth = 7;
        x.beginPath();
        x.moveTo(px + pw / 2, py);
        x.lineTo(px + pw / 2, py + ph);
        x.moveTo(px, py + ph * 0.46);
        x.lineTo(px + pw, py + ph * 0.46);
        x.stroke();
        // fogged glass
        x.fillStyle = "rgba(232,230,226,0.16)";
        x.fillRect(px, py, pw, ph);
      };

      const miniPlatform = (px, py, pw, ph, sd) => {
        const r = L.R(sd);
        // sky
        const sky = x.createLinearGradient(0, py, 0, py + ph * 0.6);
        sky.addColorStop(0, "rgba(210,206,202,0.6)");
        sky.addColorStop(1, "rgba(170,168,166,0.55)");
        x.fillStyle = sky;
        x.fillRect(px, py, pw, ph);

        // train body
        const ty = py + ph * 0.1,
          th = ph * 0.4;
        x.fillStyle = "rgba(56,52,58,0.92)";
        x.fillRect(px - 60, ty, pw + 120, th);
        x.fillStyle = "rgba(34,31,36,0.9)";
        x.fillRect(px - 60, ty, pw + 120, th * 0.07);
        x.fillRect(px - 60, ty + th * 0.87, pw + 120, th * 0.13);
        // lit windows
        const nWin = 7,
          wgap = (pw + 120) / nWin;
        for (let i = 0; i < nWin; i++) {
          const wx = px - 60 + i * wgap + wgap * 0.15;
          const ww = wgap * 0.7,
            wh = th * 0.52,
            wy = ty + th * 0.2;
          const lg = x.createLinearGradient(0, wy, 0, wy + wh);
          lg.addColorStop(0, "rgba(250,241,216,0.94)");
          lg.addColorStop(1, "rgba(226,203,162,0.82)");
          x.fillStyle = lg;
          x.fillRect(wx, wy, ww, wh);
          x.strokeStyle = "rgba(30,27,30,0.85)";
          x.lineWidth = 3;
          x.strokeRect(wx, wy, ww, wh);
          if (i === 2 || i === 5) {
            x.fillStyle = "rgba(44,40,44,0.45)";
            x.beginPath();
            x.arc(wx + ww * 0.5, wy + wh * 0.42, ww * 0.15, 0, Math.PI * 2);
            x.fill();
            x.fillRect(wx + ww * 0.34, wy + wh * 0.54, ww * 0.32, wh * 0.46);
          }
        }
        // platform + edge
        x.fillStyle = "rgba(126,122,124,0.8)";
        x.fillRect(px, py + ph * 0.56, pw, ph * 0.44);
        x.strokeStyle = "rgba(28,24,26,0.75)";
        x.lineWidth = 4;
        x.beginPath();
        x.moveTo(px, py + ph * 0.56);
        x.lineTo(px + pw, py + ph * 0.56);
        x.stroke();
        x.fillStyle = "rgba(198,154,62,0.6)";
        x.fillRect(px, py + ph * 0.6, pw, ph * 0.025);
        // perspective seams on the platform
        x.strokeStyle = "rgba(48,44,48,0.25)";
        x.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
          const sx2 = px + (i / 5) * pw;
          x.beginPath();
          x.moveTo(px + pw / 2 + (sx2 - px - pw / 2) * 0.35, py + ph * 0.56);
          x.lineTo(sx2, py + ph);
          x.stroke();
        }
        // waiting figures
        for (let i = 0; i < 3; i++) {
          const fx = px + pw * (0.16 + i * 0.3) + r() * 24;
          const fh = ph * (0.3 + r() * 0.08);
          L.figure(x, fx, py + ph * 0.98 - fh, fh, {
            color: "rgba(24,21,24,0.85)",
            hair: i !== 1,
          });
        }
        // rain haze
        x.fillStyle = "rgba(238,236,232,0.09)";
        x.fillRect(px, py, pw, ph);
      };

      const miniTeddy = (cx, cy, r, sd) => {
        const fr = L.R(sd);
        x.save();
        x.globalCompositeOperation = "multiply";
        x.fillStyle = "rgba(150,120,104,0.9)";
        // ears
        x.beginPath();
        x.arc(cx - r * 0.62, cy - r * 0.72, r * 0.3, 0, Math.PI * 2);
        x.arc(cx + r * 0.62, cy - r * 0.72, r * 0.3, 0, Math.PI * 2);
        x.fill();
        // head
        x.beginPath();
        x.ellipse(cx, cy, r * 0.66, r * 0.6, 0, 0, Math.PI * 2);
        x.fill();
        // body
        x.beginPath();
        x.ellipse(cx, cy + r * 0.95, r * 0.62, r * 0.55, 0, 0, Math.PI * 2);
        x.fill();
        // muzzle
        x.fillStyle = "rgba(224,210,198,0.75)";
        x.beginPath();
        x.ellipse(cx, cy + r * 0.2, r * 0.3, r * 0.22, 0, 0, Math.PI * 2);
        x.fill();
        // eyes
        x.fillStyle = "rgba(24,20,20,0.9)";
        x.beginPath();
        x.arc(cx - r * 0.24, cy - r * 0.1, r * 0.07, 0, Math.PI * 2);
        x.arc(cx + r * 0.24, cy - r * 0.1, r * 0.07, 0, Math.PI * 2);
        x.fill();
        x.beginPath();
        x.ellipse(cx, cy + r * 0.16, r * 0.08, r * 0.06, 0, 0, Math.PI * 2);
        x.fill();
        // stitches
        x.strokeStyle = "rgba(48,38,34,0.55)";
        x.lineWidth = 2;
        x.beginPath();
        x.moveTo(cx, cy + r * 0.26);
        x.lineTo(cx, cy + r * 1.5);
        x.stroke();
        // red thread
        x.strokeStyle = "rgba(168,31,38,0.85)";
        x.lineWidth = 3;
        x.beginPath();
        x.moveTo(cx - r * 0.5, cy + r * 0.7);
        x.quadraticCurveTo(cx, cy + r * 0.95, cx + r * 0.52, cy + r * 0.68);
        x.stroke();
        x.restore();
      };

      // ---------------- the sheet --------------------------------------
      const mx = 108,
        my = 62;
      const sx = mx,
        sy = my,
        sw = W - mx * 2,
        sh = H - my * 2;
      x.save();
      x.shadowColor = "rgba(28,22,24,0.42)";
      x.shadowBlur = 60;
      x.shadowOffsetY = 18;
      x.fillStyle = "rgba(246,242,235,0.99)";
      x.fillRect(sx, sy, sw, sh);
      x.restore();
      // subtle sheet edge

      const G = 22;
      const panel = (px, py, pw, ph, sd, draw) => {
        x.save();
        x.beginPath();
        x.rect(px, py, pw, ph);
        x.clip();
        x.fillStyle = "rgba(243,239,233,0.99)";
        x.fillRect(px, py, pw, ph);
        // screentone
        x.fillStyle = "rgba(58,50,52,0.085)";
        for (let yy = py + 12, row = 0; yy < py + ph; yy += 13, row++) {
          for (let xx = px + 12 + (row % 2) * 6.5; xx < px + pw; xx += 13) {
            x.beginPath();
            x.arc(xx, yy, 1.6, 0, 6.283);
            x.fill();
          }
        }
        draw(px, py, pw, ph);
        x.restore();
        // hand-drawn border
        const b = (x1, y1, x2, y2) =>
          L.sketchPath(x, [[x1, y1], [x2, y2]], sd, { width: 8, color: "rgba(22,19,21,0.94)", passes: 2, jitter: 2.6 });
        b(px, py, px + pw, py);
        b(px + pw, py, px + pw, py + ph);
        b(px + pw, py + ph, px, py + ph);
        b(px, py + ph, px, py);
      };

      if (v === 0) {
        const cw = (sw - G) / 2;
        const ch = (sh - G) / 2;
        panel(sx, sy, cw, ch * 0.62, 301, (px, py, pw, ph) => {
          miniEye(px + pw * 0.5, py + ph * 0.52, pw * 0.34);
        });
        panel(sx, sy + ch * 0.62 + G, cw, sh - ch * 0.62 - G, 311, (px, py, pw, ph) => {
          const fh = ph * 0.82;
          L.figure(x, px + pw * 0.5, py + ph * 0.06, fh, {
            color: "rgba(24,21,24,0.9)",
            hair: true,
            hairW: 1.35,
            arms: [
              [px + pw * 0.42, py + ph * 0.72],
              [px + pw * 0.6, py + ph * 0.62],
            ],
          });
        });
        panel(sx + cw + G, sy, cw, ch, 321, (px, py, pw, ph) => {
          miniWindow(px + 26, py + 24, pw - 52, ph - 48, 331);
        });
        panel(sx + cw + G, sy + ch + G, cw, sh - ch - G, 341, (px, py, pw, ph) => {
          miniPlatform(px, py, pw, ph, 351);
        });
      } else {
        const cw = (sw - G) / 2;
        const topH = sh * 0.36;
        const restH = sh - topH - G;
        panel(sx, sy, sw, topH, 361, (px, py, pw, ph) => {
          miniWindow(px + 30, py + 22, pw - 60, ph - 44, 371);
        });
        panel(sx, sy + topH + G, cw, restH, 381, (px, py, pw, ph) => {
          miniEye(px + pw * 0.5, py + ph * 0.5, pw * 0.42);
        });
        panel(sx + cw + G, sy + topH + G, cw, restH * 0.52, 391, (px, py, pw, ph) => {
          miniTeddy(px + pw * 0.5, py + ph * 0.5, ph * 0.56, 401);
        });
        panel(sx + cw + G, sy + topH + G + restH * 0.52 + G, cw, restH - restH * 0.52 - G, 411, (px, py, pw, ph) => {
          const word = "ПЛАЧУ";
          x.save();
          x.font = `900 100px ${L.FONT_DISPLAY}`;
          const w100 = x.measureText(word).width || 1;
          x.restore();
          const size = Math.min((pw * 0.7 / w100) * 100, ph * 0.42);
          x.save();
          x.translate(px + pw / 2, py + ph * 0.52);
          L.inkType(x, word, 0, 0, size, {
            color: "rgba(26,21,23,0.95)",
            seed: 421,
            jitter: size * 0.012,
            charRot: 0.05,
            align: "center",
          });
          x.restore();
        });
      }

      // ---------------- red ink over the page --------------------------
      x.save();
      x.globalCompositeOperation = "multiply";
      L.splatter(x, sx + sw * (v ? 0.3 : 0.62), sy + sh * (v ? 0.74 : 0.2), 90, "rgba(150,26,33,0.55)", 431 + v, {
        drops: 26,
        spread: 2.6,
      });
      L.splatter(x, sx + sw * (v ? 0.78 : 0.16), sy + sh * 0.5, 40, "rgba(150,26,33,0.4)", 441 + v, {
        drops: 14,
        spread: 2.2,
      });
      x.restore();
      return c;
    });

    // page drifts a touch under the camera
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-0.006 + Math.sin(lt * 0.4) * 0.004);
    ctx.translate(-W / 2, -H / 2);
    ctx.drawImage(art, 0, 0);
    ctx.restore();

    // torn scraps floating past
    const r = L.R(seed + 5);
    for (let i = 0; i < 5; i++) {
      const sp = 16 + r() * 34;
      const x = ((r() * W + lt * sp) % (W + 320)) - 160;
      const y = r() * H + Math.sin(lt * 0.6 + i) * 12;
      const w = 46 + r() * 90,
        h = 34 + r() * 66;
      ctx.save();
      ctx.globalAlpha = 0.14 + r() * 0.16;
      ctx.translate(x, y);
      ctx.rotate((r() - 0.5) * 0.6 + lt * 0.05);
      ctx.fillStyle = "rgba(240,235,228,0.9)";
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = "rgba(30,26,28,0.4)";
      ctx.lineWidth = 1.4;
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      ctx.restore();
    }
    return true;
  };

  // ------------------------------------------------------------------ 3. EYE
  window.SCENES.eye = function (st) {
    const { ctx, lt, bass, seed, p } = st;
    const cx = W * 0.5,
      cy = H * 0.48;
    const open = p.open == null ? 1 : p.open;

    const art = PLATE("eye:art:" + (p.open || 1), () => {
      const c = L.make(W, H);
      const x = c.getContext("2d");
      L.paintPaper(x, W, H, 601);
      // skin wash
      L.wash(x, W * 0.5, H * 0.5, 760, 430, "rgba(206,176,166,0.55)", 611, { alpha: 0.75, layers: 22 });
      L.wash(x, W * 0.3, H * 0.2, 420, 300, "rgba(150,130,128,0.3)", 621, { alpha: 0.5 });

      // eye socket shadow
      L.wash(x, cx, cy - 30, 620, 300, "rgba(96,80,80,0.35)", 631, { alpha: 0.55 });

      // sclera
      x.save();
      x.beginPath();
      x.moveTo(cx - 620, cy + 20);
      x.quadraticCurveTo(cx - 300, cy - 250 * open, cx, cy - 210 * open);
      x.quadraticCurveTo(cx + 330, cy - 250 * open, cx + 640, cy + 10);
      x.quadraticCurveTo(cx + 300, cy + 260 * open, cx, cy + 240 * open);
      x.quadraticCurveTo(cx - 320, cy + 250 * open, cx - 620, cy + 20);
      x.closePath();
      x.fillStyle = "rgba(238,232,226,0.95)";
      x.fill();
      x.clip();
      // iris
      const ir = 200;
      const g = x.createRadialGradient(cx + 20, cy - 10, 10, cx + 20, cy - 10, ir);
      g.addColorStop(0, "#e0b070");
      g.addColorStop(0.35, "#b4702f");
      g.addColorStop(0.72, "#7e241f");
      g.addColorStop(1, "#2a1616");
      x.fillStyle = g;
      x.beginPath();
      x.arc(cx + 20, cy - 10, ir, 0, Math.PI * 2);
      x.fill();
      // iris fibres
      const rr = L.R(641);
      x.strokeStyle = "rgba(60,24,20,0.35)";
      for (let i = 0; i < 130; i++) {
        const a = rr() * Math.PI * 2;
        const r0 = ir * (0.34 + rr() * 0.2);
        x.lineWidth = 0.7 + rr() * 1.6;
        x.beginPath();
        x.moveTo(cx + 20 + Math.cos(a) * r0, cy - 10 + Math.sin(a) * r0);
        x.lineTo(cx + 20 + Math.cos(a) * (ir * (0.86 + rr() * 0.13)), cy - 10 + Math.sin(a) * (ir * (0.86 + rr() * 0.13)));
        x.stroke();
      }
      // pupil
      x.fillStyle = "#141011";
      x.beginPath();
      x.ellipse(cx + 20, cy - 10, 74, 82, 0, 0, Math.PI * 2);
      x.fill();
      // highlight
      x.fillStyle = "rgba(250,246,240,0.9)";
      x.beginPath();
      x.ellipse(cx - 40, cy - 90, 46, 30, -0.5, 0, Math.PI * 2);
      x.fill();
      x.globalAlpha = 0.5;
      x.beginPath();
      x.ellipse(cx + 96, cy + 44, 20, 14, 0.4, 0, Math.PI * 2);
      x.fill();
      x.globalAlpha = 1;
      // wet edge
      x.strokeStyle = "rgba(150,40,40,0.35)";
      x.lineWidth = 6;
      x.beginPath();
      x.ellipse(cx, cy + 40, 600, 250 * open, 0, 0.15, Math.PI - 0.15);
      x.stroke();
      // corner redness + veins
      x.globalAlpha = 0.35;
      x.fillStyle = "rgba(176,96,92,0.5)";
      x.beginPath();
      x.ellipse(cx - 560, cy + 30, 150, 120, 0.2, 0, Math.PI * 2);
      x.fill();
      x.beginPath();
      x.ellipse(cx + 580, cy + 20, 140, 110, -0.2, 0, Math.PI * 2);
      x.fill();
      x.globalAlpha = 0.3;
      x.strokeStyle = "rgba(160,60,60,0.6)";
      const vr = L.R(699);
      for (let i = 0; i < 12; i++) {
        const sx = cx + (vr() - 0.5) * 1000;
        const sy = cy + (vr() - 0.5) * 260;
        x.lineWidth = 0.8 + vr() * 1.4;
        x.beginPath();
        x.moveTo(sx, sy);
        x.quadraticCurveTo(sx + (vr() - 0.5) * 90, sy + 30, sx + (vr() - 0.5) * 150, sy + 70);
        x.stroke();
      }
      x.globalAlpha = 1;
      x.restore();

      // brow
      const brow = [];
      for (let i = 0; i <= 24; i++) {
        const t = i / 24;
        brow.push([cx - 580 + t * 1160, cy - 300 - Math.sin(t * Math.PI) * 70]);
      }
      L.sketchPath(x, brow, 691, { width: 16, color: "rgba(34,28,30,0.8)", passes: 3, jitter: 6 });
      L.sketchPath(x, brow.map((p) => [p[0], p[1] - 9]), 692, { width: 9, color: "rgba(40,34,36,0.55)", passes: 2, jitter: 5 });

      // lids / lashes
      const lid = [];
      for (let i = 0; i <= 26; i++) {
        const a = Math.PI * (0.02 + (i / 26) * 0.96);
        lid.push([cx + Math.cos(a) * -620, cy + 20 - Math.sin(a) * 250 * open]);
      }
      L.sketchPath(x, lid, 651, { width: 8, color: "rgba(24,20,22,0.92)", passes: 3, jitter: 4 });
      const lower = [];
      for (let i = 0; i <= 22; i++) {
        const a = Math.PI * (0.06 + (i / 22) * 0.88);
        lower.push([cx - Math.cos(a) * 600, cy + 30 + Math.sin(a) * 235 * open]);
      }
      L.sketchPath(x, lower, 661, { width: 3.5, color: "rgba(40,34,36,0.7)", passes: 2, jitter: 3 });
      // lashes — attached, curved, varied
      const lr = L.R(671);
      for (let i = 0; i < 52; i++) {
        const t = i / 52;
        const a = Math.PI * (0.03 + t * 0.94);
        const bx = cx + Math.cos(a) * -620;
        const by = cy + 20 - Math.sin(a) * 250 * open;
        const len = 16 + lr() * 42 + Math.sin(t * Math.PI) * 18;
        const lean = (t - 0.5) * 30 + (lr() - 0.5) * 10;
        L.inkStroke(
          x,
          [
            [bx, by],
            [bx + lean * 0.4, by - len * 0.6],
            [bx + lean, by - len],
          ],
          3.6 + lr() * 2.6,
          "rgba(22,18,20,0.9)",
          681 + i,
          { passes: 1 }
        );
      }
      return c;
    });
    ctx.drawImage(art, 0, 0);

    // tears — animated
    const r = L.R(seed + 3);
    for (let i = 0; i < 6; i++) {
      const x0 = cx + (r() - 0.5) * 420;
      const phase = (lt * (0.35 + r() * 0.35) + r()) % 1;
      const y = cy + 150 + phase * 520;
      const len = 40 + phase * 190;
      ctx.save();
      ctx.globalAlpha = 0.5 * (1 - phase * 0.55);
      L.drip(ctx, x0, y, len, "rgba(120,140,150,0.55)", 700 + i, 3 + r() * 3);
      ctx.restore();
    }
    // red pulse in the iris on bass
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.12 + bass * 0.2;
    ctx.fillStyle = "rgba(168,31,38,1)";
    ctx.beginPath();
    ctx.arc(cx + 20, cy - 10, 190, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return true;
  };

  // ------------------------------------------------------------------ 4. RAIN WINDOW
  window.SCENES.rainwindow = function (st) {
    const { ctx, lt, p, seed } = st;
    const art = PLATE("rain:art:" + (p.variant || 0), () => {
      const c = L.make(W, H);
      const x = c.getContext("2d");
      L.paintPaper(x, W, H, 801);
      const v = p.variant || 0;
      // night glass
      L.wash(x, W * 0.5, H * 0.46, 900, 520, "rgba(92,100,116,0.75)", 811 + v, { alpha: 0.85, layers: 24 });
      L.wash(x, W * 0.2, H * 0.7, 480, 320, "rgba(60,64,76,0.6)", 821 + v, { alpha: 0.7 });
      // city bokeh
      bokeh(x, [
        [W * 0.18, H * 0.32, 120, "rgba(230,196,150,0.55)"],
        [W * 0.3, H * 0.24, 80, "rgba(220,180,150,0.4)"],
        [W * 0.72, H * 0.28, 150, "rgba(200,170,150,0.45)"],
        [W * 0.86, H * 0.42, 100, "rgba(230,210,180,0.35)"],
        [W * 0.55, H * 0.18, 60, "rgba(240,220,190,0.3)"],
      ]);
      // window frame
      x.fillStyle = "rgba(28,26,30,0.9)";
      x.fillRect(0, 0, W, H * 0.055);
      x.fillRect(0, H * 0.94, W, H * 0.06);
      x.fillRect(W * 0.48, 0, W * 0.028, H);
      x.fillRect(0, 0, W * 0.03, H);
      x.fillRect(W * 0.97, 0, W * 0.03, H);
      // static droplets on glass
      const r = L.R(831);
      for (let i = 0; i < 150; i++) {
        const dx = r() * W,
          dy = r() * H;
        const rad = 1 + r() * 4;
        x.globalAlpha = 0.18 + r() * 0.3;
        x.fillStyle = "rgba(240,244,248,0.9)";
        x.beginPath();
        x.ellipse(dx, dy, rad, rad * 1.5, 0, 0, Math.PI * 2);
        x.fill();
      }
      x.globalAlpha = 1;
      return c;
    });
    ctx.drawImage(art, 0, 0);

    L.rain(ctx, W, H, lt, seed + 7, 1.1, { count: 130, color: "#eef2f4", alpha: 0.55, angle: 0.06 });

    // moving rivulets
    const r = L.R(seed + 11);
    for (let i = 0; i < 14; i++) {
      const x0 = r() * W;
      const sp = 90 + r() * 260;
      const y0 = ((r() * H + lt * sp) % (H + 200)) - 100;
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = "rgba(235,242,246,0.8)";
      ctx.lineWidth = 2 + r() * 2;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      for (let k = 1; k <= 8; k++) ctx.lineTo(x0 + Math.sin(k * 0.7 + i) * 7, y0 + k * 26);
      ctx.stroke();
      ctx.restore();
    }

    // silhouette in the glass
    if (p.figure !== false) {
      ctx.save();
      ctx.globalAlpha = 0.42;
      L.figure(ctx, W * 0.64, H * 0.34, H * 0.66, {
        color: "rgba(22,20,24,0.9)",
        hair: true,
        hairW: 1.7,
        arms: [
          [W * 0.59, H * 0.74],
          [W * 0.69, H * 0.74],
        ],
      });
      ctx.restore();
    }
    return true;
  };

  // ------------------------------------------------------------------ 5. PLATFORM
  window.SCENES.platform = function (st) {
    const { ctx, lt, seed, p } = st;
    const art = PLATE("platform:art:" + (p.variant || 0), () => {
      const c = L.make(W, H);
      const x = c.getContext("2d");
      L.paintPaper(x, W, H, 901);
      L.wash(x, W * 0.5, H * 0.62, 900, 460, "rgba(96,100,112,0.6)", 911, { alpha: 0.75, layers: 20 });
      // ceiling
      L.wash(x, W * 0.5, H * 0.05, 900, 200, "rgba(50,50,58,0.7)", 921, { alpha: 0.8 });
      // perspective floor lines
      x.save();
      x.strokeStyle = "rgba(40,36,40,0.35)";
      for (let i = 0; i < 12; i++) {
        x.lineWidth = 1 + i * 0.2;
        x.beginPath();
        x.moveTo(W * 0.5 + (i - 5.5) * 40, H * 0.52);
        x.lineTo(W * 0.5 + (i - 5.5) * 300, H);
        x.stroke();
      }
      for (let i = 0; i < 8; i++) {
        const y = H * 0.55 + Math.pow(i / 8, 1.8) * H * 0.45;
        x.beginPath();
        x.moveTo(0, y);
        x.lineTo(W, y);
        x.stroke();
      }
      x.restore();
      // train
      x.fillStyle = "rgba(34,32,38,0.92)";
      x.fillRect(W * 0.5, H * 0.2, W * 0.52, H * 0.38);
      x.fillStyle = "rgba(232,222,206,0.5)";
      for (let i = 0; i < 5; i++) x.fillRect(W * (0.55 + i * 0.095), H * 0.27, W * 0.06, H * 0.14);
      // headlight
      const g = x.createRadialGradient(W * 0.62, H * 0.4, 0, W * 0.62, H * 0.4, 380);
      g.addColorStop(0, "rgba(255,244,220,0.55)");
      g.addColorStop(1, "rgba(255,244,220,0)");
      x.fillStyle = g;
      x.fillRect(W * 0.2, 0, W * 0.9, H);
      // train doors + seams
      x.save();
      x.globalCompositeOperation = "multiply";
      x.fillStyle = "rgba(22,20,26,0.55)";
      x.fillRect(W * 0.62, H * 0.2, 6, H * 0.38);
      x.fillRect(W * 0.79, H * 0.2, 6, H * 0.38);
      x.restore();
      // platform edge + safety line
      x.save();
      x.globalCompositeOperation = "multiply";
      x.fillStyle = "rgba(40,36,40,0.5)";
      x.fillRect(0, H * 0.545, W, 10);
      x.fillStyle = "rgba(198,168,84,0.55)";
      x.fillRect(0, H * 0.565, W, 6);
      x.restore();
      // wet reflection of the train
      x.save();
      x.globalAlpha = 0.12;
      x.translate(0, H * 1.24);
      x.scale(1, -0.3);
      x.fillStyle = "rgba(34,32,38,1)";
      x.fillRect(W * 0.5, H * 0.2, W * 0.52, H * 0.38);
      x.restore();
      // waiting figures
      const r = L.R(931);
      for (let i = 0; i < 3; i++) {
        const fx = W * (0.08 + i * 0.085) + r() * 24;
        L.figure(x, fx, H * 0.52, H * 0.42, {
          color: "rgba(26,24,28,0.72)",
          hair: i % 2 === 0,
          arms: [
            [fx - 22, H * 0.8],
            [fx + 22, H * 0.8],
          ],
        });
      }
      // a lone figure, centre, facing the train
      L.figure(x, W * 0.57, H * 0.44, H * 0.52, {
        color: "rgba(20,18,22,0.92)",
        hair: true,
        hairW: 1.6,
        arms: [
          [W * 0.54, H * 0.79],
          [W * 0.6, H * 0.79],
        ],
      });
      return c;
    });
    ctx.drawImage(art, 0, 0);
    L.rain(ctx, W, H, lt, seed + 3, 0.7, { count: 90, alpha: 0.4 });
    L.dust(ctx, W, H, lt, seed + 9, 40, 0.25);
    return true;
  };

  // ------------------------------------------------------------------ 6. KNIFE
  window.SCENES.knife = function (st) {
    const { ctx, lt, seed, p, bass } = st;
    const art = PLATE("knife:art:" + (p.variant || 0), () => {
      const c = L.make(W, H);
      const x = c.getContext("2d");
      L.paintPaper(x, W, H, 1001);
      L.wash(x, W * 0.5, H * 0.58, 860, 520, "rgba(104,98,108,0.5)", 1011, { alpha: 0.7, layers: 24 });
      L.wash(x, W * 0.18, H * 0.3, 420, 340, "rgba(126,116,112,0.35)", 1015, { alpha: 0.55 });
      // red wall splash behind
      L.splatter(x, W * 0.74, H * 0.3, 150, "rgba(150,26,32,0.5)", 1021, { drops: 34, spread: 2.8 });
      L.drip(x, W * 0.7, H * 0.34, 300, "rgba(140,24,30,0.45)", 1025, 5);

      const fx = W * 0.4;
      const top = H * 0.14;
      const h = H * 0.76;
      const hand = [fx + W * 0.135, top + h * 0.16];
      L.figure(x, fx, top, h, {
        color: "rgba(30,26,28,0.9)",
        arms: [
          [fx - W * 0.07, top + h * 0.62],
          hand,
        ],
        hairW: 1.7,
      });

      // blade in that hand: chef knife, spine straight, curved edge to the point
      x.save();
      x.translate(hand[0], hand[1]);
      x.rotate(-1.0);
      // handle
      x.fillStyle = "rgba(32,28,32,0.97)";
      x.beginPath();
      x.moveTo(-128, -12);
      x.lineTo(-8, -14);
      x.lineTo(-8, 14);
      x.lineTo(-128, 12);
      x.closePath();
      x.fill();
      // rivets
      x.fillStyle = "rgba(196,188,180,0.6)";
      for (let i = 0; i < 2; i++) {
        x.beginPath();
        x.arc(-104 + i * 52, 0, 4, 0, Math.PI * 2);
        x.fill();
      }
      // bolster
      x.fillStyle = "rgba(150,146,142,0.95)";
      x.fillRect(-12, -17, 20, 34);
      // blade
      const bg = x.createLinearGradient(0, -22, 0, 30);
      bg.addColorStop(0, "rgba(244,241,235,0.98)");
      bg.addColorStop(0.45, "rgba(214,210,204,0.97)");
      bg.addColorStop(1, "rgba(150,146,142,0.95)");
      x.fillStyle = bg;
      x.beginPath();
      x.moveTo(8, -21);
      x.lineTo(214, -21);
      x.quadraticCurveTo(272, -14, 284, 4);
      x.quadraticCurveTo(210, 26, 96, 27);
      x.quadraticCurveTo(30, 27, 8, 18);
      x.closePath();
      x.fill();
      x.strokeStyle = "rgba(30,26,28,0.75)";
      x.lineWidth = 2;
      x.stroke();
      // blood on the cutting edge
      x.strokeStyle = "rgba(168,31,38,0.9)";
      x.lineWidth = 5;
      x.beginPath();
      x.moveTo(12, 15);
      x.quadraticCurveTo(120, 24, 262, 0);
      x.stroke();
      // highlight along the spine
      x.strokeStyle = "rgba(255,253,248,0.7)";
      x.lineWidth = 3;
      x.beginPath();
      x.moveTo(14, -15);
      x.lineTo(206, -15);
      x.stroke();
      x.restore();

      // blood on the floor
      L.splatter(x, W * 0.58, H * 0.9, 70, "rgba(140,24,30,0.45)", 1031, { drops: 22, spread: 2.2 });
      return c;
    });
    ctx.drawImage(art, 0, 0);

    // blade drip animation
    const r = L.R(seed + 3);
    for (let i = 0; i < 3; i++) {
      const x0 = W * 0.5 + i * 26 + r() * 20;
      const y0 = H * 0.3;
      const len = 40 + ((lt * (60 + r() * 40) + r() * 160) % 240);
      ctx.save();
      ctx.globalAlpha = 0.5;
      L.drip(ctx, x0, y0, len, "rgba(150,26,32,0.6)", 1041 + i, 3 + r() * 3);
      ctx.restore();
    }

    // red pulse — soft, never a hard disc
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.filter = "blur(60px)";
    const pg = ctx.createRadialGradient(W * 0.74, H * 0.3, 0, W * 0.74, H * 0.3, 340);
    pg.addColorStop(0, `rgba(168,31,38,${0.1 + bass * 0.16})`);
    pg.addColorStop(1, "rgba(168,31,38,0)");
    ctx.fillStyle = pg;
    ctx.fillRect(W * 0.74 - 360, H * 0.3 - 360, 720, 720);
    ctx.restore();
    return true;
  };
})();
