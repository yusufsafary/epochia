// Agent Browser live board. Contracts are announced at launch; until
// CONFIG.key is set, the board renders the genesis schedule (Epoch 1).
const CONFIG = { key: "0x6F61c7467eABe2139598CE49B6Fd2022880478f9", harvest: "0x397a913A3EaD02018bCBb82b67b1b70B1d9EB0A3", rpc: ["https://bsc-dataseed1.binance.org", "https://bsc-dataseed-public.bnbchain.org", "https://bsc-rpc.publicnode.com"] };
const PER_EPOCH = 150000, FIRST = 42000;
function fmt(n) { return n.toLocaleString("en-US"); }
function tweenNum(id, to) {
  const el = document.getElementById(id);
  if (!el) return;
  const from = parseInt((el.dataset.v || "0").replace(/[^0-9]/g, ""), 10) || 0;
  el.dataset.v = String(to);
  if (from === to || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = fmt(to); return; }
  const t0 = performance.now(), dur = 650;
  (function step(t) {
    const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(Math.round(from + (to - from) * e));
    if (p < 1 && parseInt(el.dataset.v, 10) === to) requestAnimationFrame(step);
  })(t0);
}
async function call(to, data) {
  const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to, data }, "latest"] });
  const tries = CONFIG.rpc.map((u) => fetch(u, { method: "POST", headers: { "Content-Type": "application/json" }, body, signal: AbortSignal.timeout(5000) }).then((r) => r.json()).then((j) => { if (!j.result) throw 0; return j.result; }));
  return Promise.any(tries);
}
async function board() {
  let claims = 0n, keys = 0n;
  try {
    if (CONFIG.harvest) claims = BigInt(await call(CONFIG.harvest, "0xd54ad2a1"));
    if (CONFIG.key) keys = BigInt(await call(CONFIG.key, "0x18160ddd"));
  } catch (e) {}
  const epoch = Number(claims / BigInt(PER_EPOCH)) + 1;
  const per = FIRST / Math.pow(2, epoch - 1);
  const inEpoch = Number(claims % BigInt(PER_EPOCH));
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.innerHTML = v; };
  set("bEpoch", epoch + ' <span style="font-size:.45em">of 11</span>');
  set("bPer", fmt(Math.floor(per)));
  tweenNum("bClaims", Number(claims));
  tweenNum("bKeys", Number(keys));
  const bar = document.getElementById("bBar");
  if (bar) bar.style.width = (inEpoch / PER_EPOCH * 100).toFixed(2) + "%";
  window.AB = { epoch: epoch, per: Math.floor(per) };
  document.dispatchEvent(new Event("ab:board"));
}
if (document.getElementById("bEpoch")) { board(); setInterval(board, 30000); }
// Countdown peluncuran $BROWSE: 12 Nov 2026 00:00 UTC.
(function () {
  const box = document.getElementById("cd");
  if (!box) return;
  const target = Date.UTC(2026, 10, 12, 0, 0, 0);
  const el = (id) => document.getElementById(id);
  function tick() {
    let ms = target - Date.now();
    if (ms < 0) ms = 0;
    const s = Math.floor(ms / 1000);
    el("cdD").textContent = Math.floor(s / 86400);
    el("cdH").textContent = Math.floor(s % 86400 / 3600);
    el("cdM").textContent = Math.floor(s % 3600 / 60);
    el("cdS").textContent = s % 60;
  }
  tick();
  setInterval(tick, 1000);
})();

// ---- Interaktivitas: reveal, copy prompt, tooltip chart, tabel epoch, tilt kartu ----
(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Reveal saat scroll
  const targets = document.querySelectorAll("section.blk, .chartcard, .board");
  if (!reduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); } }), { threshold: 0.1 });
    targets.forEach((el) => { el.classList.add("rv"); io.observe(el); });
  }
  // Header shadow
  const hd = document.querySelector("header.site");
  if (hd) addEventListener("scroll", () => hd.classList.toggle("scrolled", scrollY > 8), { passive: true });
  // Salin kalimat prompt saat diklik
  document.querySelectorAll(".prompt").forEach((box) => {
    box.addEventListener("click", async () => {
      const p = box.querySelector("p");
      if (!p) return;
      try { await navigator.clipboard.writeText(p.textContent.replace(/[「」""]/g, "").trim()); } catch (e) {}
      box.classList.add("copied");
      setTimeout(() => box.classList.remove("copied"), 1600);
    });
  });
  // Tooltip chart halving
  document.querySelectorAll(".chartcard").forEach((card) => {
    const tip = card.querySelector(".tip");
    const svg = card.querySelector("svg");
    if (!tip || !svg) return;
    svg.querySelectorAll(".hz").forEach((r) => {
      const show = (ev) => {
        const zh = document.documentElement.dataset.lang === "zh";
        tip.textContent = (zh ? "週期 " : "Epoch ") + r.dataset.e + " · " + r.dataset.p + " BROWSE";
        const cr = card.getBoundingClientRect();
        const x = (ev.clientX || (ev.touches && ev.touches[0].clientX) || cr.left + 60) - cr.left;
        tip.style.left = Math.max(6, Math.min(x - 40, cr.width - 150)) + "px";
        tip.style.top = "54px";
        tip.classList.add("show");
        card.querySelectorAll(".sched tr.sel").forEach((t) => t.classList.remove("sel"));
      };
      r.addEventListener("pointermove", show);
      r.addEventListener("pointerdown", show);
      r.addEventListener("pointerleave", () => tip.classList.remove("show"));
    });
  });
  // Tabel epoch interaktif
  const info = document.getElementById("schedInfo");
  if (info) {
    const base = info.innerHTML;
    document.querySelectorAll("table.sched tr[data-e]").forEach((tr) => {
      const paint = () => {
        document.querySelectorAll("table.sched tr.sel").forEach((t) => t.classList.remove("sel"));
        tr.classList.add("sel");
        const zh = document.documentElement.dataset.lang === "zh";
        info.textContent = zh
          ? "週期 " + tr.dataset.e + "：每次領取 " + tr.dataset.p + " BROWSE · 領取編號 " + tr.dataset.f + " 至 " + tr.dataset.t
          : "Epoch " + tr.dataset.e + ": " + tr.dataset.p + " BROWSE per claim · claims " + tr.dataset.f + " to " + tr.dataset.t;
      };
      tr.addEventListener("pointerenter", paint);
      tr.addEventListener("click", paint);
    });
  }
  // Tilt halus kartu kunci (desktop)
  const kc = document.querySelector(".keycard");
  if (kc && !reduced && window.matchMedia("(pointer: fine)").matches) {
    kc.addEventListener("pointermove", (ev) => {
      const r = kc.getBoundingClientRect();
      const dx = (ev.clientX - r.left) / r.width - 0.5;
      const dy = (ev.clientY - r.top) / r.height - 0.5;
      kc.style.transform = "perspective(700px) rotateY(" + (dx * 10) + "deg) rotateX(" + (-dy * 10) + "deg)";
    });
    kc.addEventListener("pointerleave", () => { kc.style.transform = ""; });
  }
})();

// ---- Latar interaktif hero: percikan tambang, lampu pointer, paralaks strata ----
(function () {
  const hero = document.querySelector(".hero");
  const cvs = document.getElementById("fx");
  if (!hero || !cvs) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = cvs.getContext("2d");
  const COLORS = ["#FFB03A", "#FF6B4A", "#FFE3A3", "#FAF5EA"];
  let W = 0, H = 0, parts = [], running = true, visible = true;
  const DPR = Math.min(window.devicePixelRatio || 1, 1.75);
  function spawn(anywhere) {
    return { x: Math.random() * W, y: anywhere ? Math.random() * H : H + 6, r: 1 + Math.random() * 2.2, s: 0.18 + Math.random() * 0.5, drift: (Math.random() - 0.5) * 0.24, ph: Math.random() * Math.PI * 2, c: COLORS[(Math.random() * COLORS.length) | 0], burst: 0, vx: 0, vy: 0 };
  }
  function resize() {
    const r = hero.getBoundingClientRect();
    W = r.width; H = r.height;
    cvs.width = Math.round(W * DPR); cvs.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const target = Math.max(18, Math.min(46, Math.round(W / 26)));
    while (parts.length < target) parts.push(spawn(true));
    if (parts.length > target) parts.length = target;
  }
  function burst(x, y) {
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2, sp = 0.6 + Math.random() * 2.2;
      parts.push({ x: x, y: y, r: 1 + Math.random() * 2.4, s: 0, drift: 0, ph: Math.random() * Math.PI * 2, c: COLORS[(Math.random() * COLORS.length) | 0], burst: 1, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.6 });
    }
  }
  let t = 0;
  function frame() {
    requestAnimationFrame(frame);
    if (!running || !visible) return;
    t += 0.016;
    ctx.clearRect(0, 0, W, H);
    for (let i = parts.length - 1; i >= 0; i--) {
      const pt = parts[i];
      if (pt.burst) {
        pt.x += pt.vx; pt.y += pt.vy; pt.vx *= 0.96; pt.vy = pt.vy * 0.96 - 0.012; pt.r *= 0.985;
        if (pt.r < 0.4) { parts.splice(i, 1); continue; }
      } else {
        pt.y -= pt.s; pt.x += pt.drift + Math.sin(t * 1.4 + pt.ph) * 0.18;
        if (pt.y < -8 || pt.x < -8 || pt.x > W + 8) parts[i] = spawn(false);
      }
      ctx.globalAlpha = (0.45 + 0.55 * Math.abs(Math.sin(t * 1.8 + pt.ph))) * 0.85;
      ctx.fillStyle = pt.c;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  const strataEl = hero.querySelector(".strata");
  let mx = 0.72, my = 0.26, tx = mx, ty = my, par = 0, parT = 0;
  hero.addEventListener("pointermove", (ev) => {
    const r = hero.getBoundingClientRect();
    tx = (ev.clientX - r.left) / r.width; ty = (ev.clientY - r.top) / r.height;
  }, { passive: true });
  hero.addEventListener("pointerdown", (ev) => {
    const r = hero.getBoundingClientRect();
    burst(ev.clientX - r.left, ev.clientY - r.top);
  }, { passive: true });
  function glide() {
    requestAnimationFrame(glide);
    mx += (tx - mx) * 0.06; my += (ty - my) * 0.06;
    hero.style.setProperty("--mx", (mx * 100).toFixed(2) + "%");
    hero.style.setProperty("--my", (my * 100).toFixed(2) + "%");
    const r = hero.getBoundingClientRect();
    parT = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height))) * 16;
    par += (parT - par) * 0.08;
    if (strataEl) strataEl.style.transform = "translateY(" + par.toFixed(2) + "px)";
  }
  if ("IntersectionObserver" in window) new IntersectionObserver((es) => es.forEach((e) => { visible = e.isIntersecting; })).observe(hero);
  document.addEventListener("visibilitychange", () => { running = !document.hidden; });
  addEventListener("resize", resize, { passive: true });
  resize();
  requestAnimationFrame(frame);
  requestAnimationFrame(glide);
})();

// ---- Interaktif v6: titik epoch, kalkulator panen, tap kunci ----
(function () {
  const RATES = [42000, 21000, 10500, 5250, 2625, 1312, 656, 328, 164, 82, 41];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.AB = window.AB || { epoch: 1, per: 42000 };

  const dotsBox = document.getElementById("eDots");
  const eInfo = document.getElementById("eInfo");
  let selEpoch = 0;
  function paintDots() {
    if (!dotsBox) return;
    const cur = Math.min(11, Math.max(1, window.AB.epoch || 1));
    dotsBox.querySelectorAll("button").forEach((b) => {
      const e = parseInt(b.dataset.e, 10);
      b.classList.toggle("done", e < cur);
      b.classList.toggle("now", e === cur);
      b.classList.toggle("sel", e === selEpoch);
    });
  }
  function showEpoch(e) {
    selEpoch = e;
    const from = (e - 1) * 150000, to = e * 150000;
    if (eInfo) eInfo.innerHTML =
      '<span class="en">Epoch ' + e + " · " + fmt(RATES[e - 1]) + " BROWSE per claim · network claims " + fmt(from) + " to " + fmt(to) + "</span>" +
      '<span class="zh">Epoch ' + e + " · 每次領取 " + fmt(RATES[e - 1]) + " BROWSE · 全網絡領取 " + fmt(from) + " 至 " + fmt(to) + "</span>";
    paintDots();
  }
  if (dotsBox) {
    for (let e = 1; e <= 11; e++) {
      const b = document.createElement("button");
      b.type = "button"; b.dataset.e = e;
      b.setAttribute("aria-label", "Epoch " + e);
      b.addEventListener("click", () => { showEpoch(e); });
      dotsBox.appendChild(b);
    }
    paintDots();
  }

  const cK = document.getElementById("cKeys"), cD = document.getElementById("cDays");
  function calc() {
    if (!cK || !cD) return;
    const keys = parseInt(cK.value, 10), days = parseInt(cD.value, 10);
    const per = (window.AB && window.AB.per) || 42000;
    document.getElementById("cKeysV").textContent = keys;
    document.getElementById("cDaysV").textContent = days;
    document.getElementById("cTotal").textContent = fmt(keys * days * per);
    document.getElementById("cPerDay").innerHTML =
      '<span class="en">= ' + fmt(keys * per) + " per day across your keys</span>" +
      '<span class="zh">= 你的鑰匙每日共 ' + fmt(keys * per) + "</span>";
  }
  if (cK && cD) { cK.addEventListener("input", calc); cD.addEventListener("input", calc); calc(); }

  document.addEventListener("ab:board", () => { paintDots(); calc(); });

  const kc = document.getElementById("keyCard");
  if (kc && !reduced) {
    kc.addEventListener("pointerdown", (ev) => {
      const r = kc.getBoundingClientRect();
      for (let i = 0; i < 2; i++) {
        const chip = document.createElement("span");
        chip.className = "chip";
        chip.textContent = "+" + fmt((window.AB && window.AB.per) || 42000);
        chip.style.left = (ev.clientX - r.left + (i ? 26 : -12)) + "px";
        chip.style.top = (ev.clientY - r.top - 8 - i * 14) + "px";
        kc.appendChild(chip);
        setTimeout(() => chip.remove(), 1250);
      }
      kc.classList.remove("pulse"); void kc.offsetWidth; kc.classList.add("pulse");
    });
  }
})();


