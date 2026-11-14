/* PLACHU — engine: timeline, camera, scene cache, karaoke, HUD. */
(function () {
  "use strict";

  const L = window.LIB;
  const A = window.ANALYSIS;
  const LYR = window.CLIP_LYRICS || [];
  const W = 1920,
    H = 1080;
  const FPS = A.fps || 60;
  const DUR = A.duration;

  const canvas = document.getElementById("cv");
  const ctx = canvas.getContext("2d", { alpha: false });
  const startEl = document.getElementById("start");
  const loadMsg = document.getElementById("loadMsg");
  const playBtn = document.getElementById("playBtn");
  const playLabel = document.getElementById("playLabel");
  const replayBtn = document.getElementById("replay");
  const centerIcon = document.getElementById("centerIcon");
  const waveEl = document.getElementById("wave");
  const fillEl = document.getElementById("fill");
  const headEl = document.getElementById("head");
  const trackEl = document.getElementById("track");
  const markersEl = document.getElementById("markers");
  const curEl = document.getElementById("cur");
  const durEl = document.getElementById("dur");
  const volEl = document.getElementById("volume");
  const volVal = document.getElementById("volumeVal");
  const ppIcon = document.getElementById("ppIcon");
  const muteIcon = document.getElementById("muteIcon");

  // ------------------------------------------------------------------ plates
  const plateCache = new Map();
  const PLATE_MAX = 14;
  window.PLATE = function (key, builder) {
    let c = plateCache.get(key);
    if (c) {
      // refresh LRU order
      plateCache.delete(key);
      plateCache.set(key, c);
      return c;
    }
    c = builder();
    plateCache.set(key, c);
    if (plateCache.size > PLATE_MAX) {
      const oldest = plateCache.keys().next().value;
      plateCache.delete(oldest);
    }
    return c;
  };

  // ------------------------------------------------------------------ audio
  const audio = new Audio();
  audio.preload = "auto";
  audio.src = window.TRACK_AUDIO || "";
  audio.volume = 0.9;

  // ------------------------------------------------------------------ timeline
  function camFor(seed) {
    const rr = L.R(seed);
    const dir = rr() < 0.5 ? -1 : 1;
    return {
      z0: 1.0 + rr() * 0.06,
      z1: 1.03 + rr() * 0.1,
      x0: (rr() - 0.5) * 40,
      y0: (rr() - 0.5) * 26,
      x1: (rr() - 0.5) * 70,
      y1: (rr() - 0.5) * 40,
      rot: (rr() - 0.5) * 0.012 * dir,
    };
  }

  function buildCuts() {
    const cuts = [];
    const first = LYR.length ? LYR[0].t : 8;
    cuts.push({ t: 0, scene: "title", p: {}, cam: { z0: 1.0, z1: 1.045, x0: 0, y0: 0, x1: -20, y1: -8, rot: 0 } });

    LYR.forEach((line, i) => {
      const start = Math.max(0.1, line.t - 0.05);
      const cut = {
        t: start,
        scene: line.scene,
        p: line.p || {},
        line,
        cam: camFor(1000 + i * 37),
      };
      cuts.push(cut);
    });

    // end card
    cuts.push({ t: Math.max(DUR - 7.5, LYR.length ? LYR[LYR.length - 1].end + 0.4 : DUR - 7.5), scene: "end", p: {}, cam: { z0: 1.03, z1: 1.0, x0: 0, y0: 0, x1: 0, y1: 0, rot: 0 } });

    cuts.sort((a, b) => a.t - b.t);
    // dedupe close cuts
    const out = [];
    for (const c of cuts) {
      if (out.length && c.t - out[out.length - 1].t < 0.45) {
        // keep the lyric cut, drop the previous filler
        out[out.length - 1] = c;
      } else out.push(c);
    }
    for (let i = 0; i < out.length; i++) out[i].dur = (i + 1 < out.length ? out[i + 1].t : DUR) - out[i].t;
    return out;
  }

  const CUTS = (function () {
    let list = buildCuts();
    if (window.CLIP_CUTS && window.CLIP_CUTS.length) {
      list = window.CLIP_CUTS.map((c, i) => ({ ...c, cam: c.cam || camFor(1000 + i * 37) }));
      for (let i = 0; i < list.length; i++) {
        if (!list[i].dur) list[i].dur = (i + 1 < list.length ? list[i + 1].t : DUR) - list[i].t;
      }
    }
    return list;
  })();

  function cutIndexAt(t) {
    let lo = 0,
      hi = CUTS.length - 1,
      ans = 0;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (CUTS[mid].t <= t) {
        ans = mid;
        lo = mid + 1;
      } else hi = mid - 1;
    }
    return ans;
  }

  // ------------------------------------------------------------------ analysis sampling
  function sample(arr, t) {
    if (!arr || !arr.length) return 0;
    const i = Math.floor(t * FPS);
    return arr[i < 0 ? 0 : i >= arr.length ? arr.length - 1 : i];
  }

  function energyAt(t) {
    const e = A.energyPerSecond || [];
    const i = Math.floor(t);
    return e.length ? e[Math.min(i, e.length - 1)] : 0.6;
  }

  const BEAT = A.beatPeriod || 0.418;
  const FIRST_BEAT = A.firstBeat || 0;

  // ------------------------------------------------------------------ render
  let lastT = 0;
  let impact = 0;

  function camera(cut, lt) {
    const c = cut.cam;
    const k = L.clamp(lt / Math.max(0.2, cut.dur), 0, 1);
    const e = L.easeInOut(k);
    return {
      z: L.lerp(c.z0, c.z1, e),
      x: L.lerp(c.x0, c.x1, e),
      y: L.lerp(c.y0, c.y1, e),
      rot: c.rot * e,
    };
  }

  function drawScene(cut, t, lt, extra) {
    const scene = window.SCENES[cut.scene] || window.SCENES.page;
    const bass = sample(A.frames.bass, t);
    const rms = sample(A.frames.rms, t);
    const beatPhase = ((t - FIRST_BEAT) / BEAT) % 1;
    const beatIdx = Math.floor((t - FIRST_BEAT) / BEAT);
    const st = {
      ctx,
      W,
      H,
      t,
      lt,
      dur: cut.dur,
      p: cut.p || {},
      seed: 100 + (cut.t * 17) | 0,
      key: cut.scene + ":" + JSON.stringify(cut.p || {}),
      bass,
      rms,
      mid: sample(A.frames.mid, t),
      high: sample(A.frames.high, t),
      energy: energyAt(t),
      beat: beatPhase,
      beatIdx,
      kick: Math.max(0, 1 - beatPhase * 2.6),
      extra: extra || null,
    };
    scene(st);
  }

  function render(t) {
    const ci = cutIndexAt(t);
    const cut = CUTS[ci];
    const lt = t - cut.t;
    const cam = camera(cut, lt);

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#cdc6c1";
    ctx.fillRect(0, 0, W, H);

    // camera
    const punch = impact > 0 ? 1 + impact * 0.055 : 1;
    ctx.translate(W / 2 + cam.x, H / 2 + cam.y);
    ctx.rotate(cam.rot + (impact > 0 ? (Math.sin(t * 90) * 0.004 * impact) : 0));
    ctx.scale(cam.z * punch, cam.z * punch);
    ctx.translate(-W / 2, -H / 2);

    drawScene(cut, t, lt);
    ctx.restore();

    // ---- overlays
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const grainTile = PLATE("grain", () => L.grainTile(256, 4711));
    L.grain(ctx, W, H, grainTile, 0.07, t, 3);
    L.vignette(ctx, W, H, 0.5);

    // cut flash
    if (impact > 0.01) {
      ctx.globalAlpha = impact * 0.5;
      ctx.fillStyle = cut.scene === "static" ? "#e8e0d8" : "#a81f26";
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    drawSubtitles(t, cut);
    return ci;
  }

  // ------------------------------------------------------------------ subtitles
  const SUBS = LYR.map((l) => {
    const words = l.words && l.words.length ? l.words : splitWords(l.text, l.t, l.end);
    return { ...l, words };
  });

  function splitWords(text, t0, t1) {
    const parts = String(text).split(/\s+/).filter(Boolean);
    const n = parts.length || 1;
    return parts.map((w, i) => ({ w, t: t0 + ((t1 - t0) * i) / n }));
  }

  function activeLine(t) {
    for (let i = SUBS.length - 1; i >= 0; i--) {
      if (t >= SUBS[i].t - 0.1) return i;
    }
    return -1;
  }

  function drawSubtitles(t, cut) {
    const i = activeLine(t);
    if (i < 0) return;
    const line = SUBS[i];
    if (t > line.end + 0.35) return;
    if (cut && (cut.scene === "title" || cut.scene === "type" || cut.scene === "static" || cut.scene === "end")) return;

    const big = !!line.big;
    const appear = L.clamp((t - (line.t - 0.08)) / 0.22, 0, 1);
    const e = L.easeOut(appear);
    const fs = big ? 74 : 48;
    const maxW = W * 0.78;

    ctx.save();
    ctx.font = `${big ? 900 : 400} ${fs}px ${big ? L.FONT_DISPLAY : L.FONT_SERIF}`;
    let text = line.text;
    let w = ctx.measureText(text).width;
    if (w > maxW) {
      const lines = wrap(ctx, text, maxW);
      text = lines.join("\n");
      w = Math.max(...lines.map((l) => ctx.measureText(l).width));
    }
    const lines = text.split("\n");
    const lineH = fs * 1.24;
    const padX = 46,
      padY = 26;
    const boxW = Math.min(w + padX * 2, maxW + padX * 2);
    const boxH = lines.length * lineH + padY * 2 - fs * 0.22;
    const cx = W / 2;
    const cy = H - 150 - (lines.length - 1) * lineH * 0.5;

    ctx.translate(cx, cy);
    ctx.rotate(-0.008);
    ctx.scale(0.96 + e * 0.04, 0.96 + e * 0.04);
    ctx.globalAlpha = e;

    // paper card
    ctx.save();
    ctx.shadowColor = "rgba(20,16,18,0.35)";
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = "rgba(236,230,223,0.95)";
    ctx.beginPath();
    const r = 3;
    const x0 = -boxW / 2,
      y0 = -boxH / 2;
    ctx.moveTo(x0 + r, y0);
    ctx.lineTo(x0 + boxW - r, y0);
    ctx.quadraticCurveTo(x0 + boxW, y0, x0 + boxW, y0 + r);
    ctx.lineTo(x0 + boxW, y0 + boxH - r);
    ctx.quadraticCurveTo(x0 + boxW, y0 + boxH, x0 + boxW - r, y0 + boxH);
    ctx.lineTo(x0 + r, y0 + boxH);
    ctx.quadraticCurveTo(x0, y0 + boxH, x0, y0 + boxH - r);
    ctx.lineTo(x0, y0 + r);
    ctx.quadraticCurveTo(x0, y0, x0 + r, y0);
    ctx.fill();
    ctx.restore();

    // progress rule
    const prog = L.clamp((t - line.t) / Math.max(0.3, line.end - line.t), 0, 1);
    ctx.save();
    ctx.fillStyle = "rgba(168,31,38,0.92)";
    ctx.fillRect(x0 + 18, y0 + boxH - 9, (boxW - 36) * prog, 3.5);
    ctx.restore();

    // text: word by word
    const wordTimes = line.words.map((wd) => wd.t);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    for (let li = 0; li < lines.length; li++) {
      const row = lines[li];
      const rowW = ctx.measureText(row).width;
      let x = -rowW / 2;
      const y = -boxH / 2 + padY + lineH * li + fs * 0.42;
      const words = row.split(/\s+/);
      for (const wd of words) {
        const ww = ctx.measureText(wd).width;
        const idx = line.words.findIndex((q) => q.w.replace(/[^\p{L}\p{N}]/gu, "") === wd.replace(/[^\p{L}\p{N}]/gu, "") && q.t <= t + 0.4);
        const spoken = wordTimes.some((wt) => t >= wt - 0.06) && (idx < 0 ? true : t >= wordTimes[idx] - 0.06);
        ctx.fillStyle = spoken ? "#171518" : "rgba(60,54,56,0.45)";
        ctx.fillText(wd, x, y);
        x += ww + ctx.measureText(" ").width;
      }
    }
    ctx.restore();
  }

  function wrap(c, text, maxW) {
    const words = String(text).split(/\s+/);
    const lines = [];
    let cur = "";
    for (const w of words) {
      const test = cur ? cur + " " + w : w;
      if (c.measureText(test).width > maxW && cur) {
        lines.push(cur);
        cur = w;
      } else cur = test;
    }
    if (cur) lines.push(cur);
    return lines;
  }

  // ------------------------------------------------------------------ HUD
  function fmt(s) {
    s = Math.max(0, s || 0);
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return m + ":" + String(r).padStart(2, "0");
  }

  function buildWave() {
    const data = A.wave || [];
    const bars = 150;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < bars; i++) {
      const v = data[Math.floor((i / bars) * data.length)] || 0.1;
      const b = document.createElement("i");
      b.style.height = Math.max(2, Math.round(v * 32)) + "px";
      b.dataset.i = i;
      frag.appendChild(b);
    }
    waveEl.appendChild(frag);
  }

  function buildMarkers() {
    const seen = new Set();
    LYR.forEach((l) => {
      if (l.section && !seen.has(l.section)) {
        seen.add(l.section);
        const i = document.createElement("i");
        i.style.left = (l.t / DUR) * 100 + "%";
        markersEl.appendChild(i);
      }
    });
  }

  let waveBars = [];
  function updateHud(t) {
    const p = L.clamp(t / DUR, 0, 1);
    fillEl.style.width = p * 100 + "%";
    headEl.style.left = p * 100 + "%";
    curEl.textContent = fmt(t);
    trackEl.setAttribute("aria-valuenow", String(Math.round(t)));
    if (!waveBars.length) waveBars = [...waveEl.children];
    const played = Math.floor(p * waveBars.length);
    for (let i = 0; i < waveBars.length; i++) waveBars[i].classList.toggle("played", i < played);
  }

  function setPlayIcon(playing) {
    ppIcon.innerHTML = playing ? '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>' : '<path d="M7 4v16l13-8z"/>';
    document.body.classList.toggle("paused", !playing);
  }

  function flashCenter() {
    centerIcon.classList.add("show");
    setTimeout(() => centerIcon.classList.remove("show"), 420);
  }

  // ------------------------------------------------------------------ loop
  let started = false;
  let lastFrameT = -1;
  let rafId = 0;

  function tick() {
    rafId = requestAnimationFrame(tick);
    if (!started) return;
    const t = audio.paused ? lastT : audio.currentTime;
    if (Math.abs(t - lastFrameT) < 1 / 240) return;
    lastFrameT = t;
    lastT = t;
    impact = Math.max(0, impact - 0.055);
    const ci = render(t);
    updateHud(t);
    const nextCut = CUTS[ci + 1];
    if (nextCut && t > nextCut.t - 0.12) impact = 1;
    if (t >= DUR - 0.06) {
      replayBtn.classList.add("show");
      if (!audio.paused) audio.pause();
      setPlayIcon(false);
    }
  }

  // ------------------------------------------------------------------ controls
  function play() {
    if (audio.currentTime >= DUR - 0.2) audio.currentTime = 0;
    audio.play().then(
      () => {
        started = true;
        setPlayIcon(true);
        startEl.classList.add("hidden");
        replayBtn.classList.remove("show");
        flashCenter();
        idleTimer();
      },
      () => {
        playLabel.textContent = "НАЖМИ ЕЩЁ РАЗ";
      }
    );
  }

  function togglePlay() {
    if (!started) return play();
    if (audio.paused) {
      audio.play();
      setPlayIcon(true);
    } else {
      audio.pause();
      lastT = audio.currentTime;
      setPlayIcon(false);
    }
    flashCenter();
  }

  function seek(t) {
    t = L.clamp(t, 0, DUR - 0.05);
    audio.currentTime = t;
    lastT = t;
    lastFrameT = -1;
    replayBtn.classList.remove("show");
    render(t);
    updateHud(t);
  }

  playBtn.addEventListener("click", play);
  canvas.addEventListener("click", () => started && togglePlay());
  replayBtn.addEventListener("click", () => {
    seek(0);
    play();
  });

  trackEl.addEventListener("pointerdown", (e) => {
    const rect = trackEl.getBoundingClientRect();
    const move = (ev) => {
      const k = L.clamp((ev.clientX - rect.left) / rect.width, 0, 1);
      seek(k * DUR);
    };
    move(e);
    trackEl.setPointerCapture(e.pointerId);
    const up = () => {
      trackEl.removeEventListener("pointermove", move);
      trackEl.removeEventListener("pointerup", up);
    };
    trackEl.addEventListener("pointermove", move);
    trackEl.addEventListener("pointerup", up);
  });

  trackEl.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") seek(lastT - 5);
    if (e.key === "ArrowRight") seek(lastT + 5);
  });

  document.getElementById("playPauseBtn").addEventListener("click", togglePlay);
  document.getElementById("restartBtn").addEventListener("click", () => seek(0));

  const muteBtn = document.getElementById("muteBtn");
  muteBtn.addEventListener("click", () => {
    audio.muted = !audio.muted;
    muteIcon.innerHTML = audio.muted
      ? '<path d="M3 9v6h4l5 4V5L7 9H3zm18.4-1.9-1.4-1.4-2.4 2.4-2.4-2.4-1.4 1.4L16.2 12l-2.4 2.4 1.4 1.4 2.4-2.4 2.4 2.4 1.4-1.4L19 12z"/>'
      : '<path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/>';
  });

  volEl.addEventListener("input", () => {
    audio.volume = volEl.value / 100;
    volVal.textContent = volEl.value + "%";
  });

  document.getElementById("fsBtn").addEventListener("click", () => {
    const f = document.getElementById("frame");
    if (!document.fullscreenElement) f.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.();
  });

  document.addEventListener("keydown", (e) => {
    const el = document.activeElement;
    const isRange = el && el.tagName === "INPUT" && el.type === "range";
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(el?.tagName || "") && !isRange) return;
    if (e.code === "Space" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      togglePlay();
    } else if (e.key === "ArrowLeft") {
      if (isRange) return;
      seek(lastT - 5);
    } else if (e.key === "ArrowRight") {
      if (isRange) return;
      seek(lastT + 5);
    } else if (e.key === "f" || e.key === "F" || e.key === "а" || e.key === "А") {
      document.getElementById("fsBtn").click();
    } else if (e.key === "m" || e.key === "M" || e.key === "ь" || e.key === "Ь") {
      muteBtn.click();
    } else if (e.key === "r" || e.key === "R" || e.key === "к" || e.key === "К") {
      seek(0);
    }
  });

  // idle hide
  let idle = 0;
  function idleTimer() {
    clearTimeout(idle);
    document.body.classList.remove("idle");
    idle = setTimeout(() => {
      if (!audio.paused) document.body.classList.add("idle");
    }, 3200);
  }
  ["pointermove", "pointerdown", "keydown"].forEach((ev) => document.addEventListener(ev, idleTimer, { passive: true }));

  // ------------------------------------------------------------------ boot
  buildWave();
  buildMarkers();
  durEl.textContent = fmt(DUR);
  setPlayIcon(false);
  ctx.fillStyle = "#cdc6c1";
  ctx.fillRect(0, 0, W, H);

  // screenshot / still mode: ?t=42&still=1
  const qs = new URLSearchParams(location.search);
  const stillT = qs.has("t") ? parseFloat(qs.get("t")) : null;
  const still = qs.get("still") === "1";

  if (stillT != null && still) {
    document.body.classList.add("idle");
    document.getElementById("hud-bottom").style.display = "none";
    document.getElementById("hud-top").style.display = "none";
    document.querySelector(".backlink").style.display = "none";
    startEl.classList.add("hidden");
    startEl.style.display = "none";
    const paint = () => {
      render(stillT);
      window.__stillReady = true;
    };
    if (document.readyState === "complete") setTimeout(paint, 0);
    else window.addEventListener("load", () => setTimeout(paint, 0));
    return;
  }

  audio.addEventListener("canplaythrough", () => {
    playBtn.disabled = false;
    loadMsg.textContent = "";
    if (stillT != null) {
      started = true;
      startEl.classList.add("hidden");
      if (still) {
        document.body.classList.add("idle");
        document.getElementById("hud-bottom").style.display = "none";
        document.getElementById("hud-top").style.display = "none";
        document.querySelector(".backlink").style.display = "none";
      }
      seek(stillT);
    }
  });

  audio.addEventListener("error", () => {
    loadMsg.textContent = "ЗВУК НЕ ЗАГРУЗИЛСЯ — ОТКРОЙ ЧЕРЕЗ HTTP-СЕРВЕР";
  });

  // warm up plates in the background so the first cut does not hitch
  function warmUp() {
    const seen = new Set();
    const jobs = [];
    CUTS.forEach((c) => {
      const k = c.scene + ":" + JSON.stringify(c.p || {});
      if (seen.has(k)) return;
      seen.add(k);
      jobs.push(c);
    });
    const scratch = document.createElement("canvas");
    scratch.width = W;
    scratch.height = H;
    let i = 0;
    const step = () => {
      if (i >= jobs.length) return;
      const cut = jobs[i++];
      const scene = window.SCENES[cut.scene];
      if (!scene) return step();
      const saveCtx = ctx;
      try {
        // build plates through the real ctx (they are cached, not drawn)
        const st = {
          ctx: scratch.getContext("2d"),
          W,
          H,
          t: cut.t + 0.5,
          lt: 0.5,
          dur: cut.dur,
          p: cut.p || {},
          seed: 100 + ((cut.t * 17) | 0),
          key: cut.scene + ":" + JSON.stringify(cut.p || {}),
          bass: 0.5,
          rms: 0.5,
          mid: 0.3,
          high: 0.3,
          energy: 0.6,
          beat: 0.2,
          beatIdx: 1,
          kick: 0.5,
        };
        scene(st);
      } catch (err) {
        console.warn("warmup", cut.scene, err);
      }
      setTimeout(step, 0);
    };
    step();
  }

  if (audio.readyState >= 3) {
    playBtn.disabled = false;
    loadMsg.textContent = "";
  }
  if (!still) {
    setTimeout(() => {
      loadMsg.textContent = "";
    }, 4000);
    setTimeout(warmUp, 800);
  }

  tick();
})();
