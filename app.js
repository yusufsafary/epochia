// Agent Browser live board. Contracts are announced at launch; until
// CONFIG.key is set, the board renders the genesis schedule (Epoch 1).
const CONFIG = { key: "0x6F61c7467eABe2139598CE49B6Fd2022880478f9", harvest: "0x397a913A3EaD02018bCBb82b67b1b70B1d9EB0A3", rpc: ["https://bsc-dataseed1.binance.org", "https://bsc-dataseed-public.bnbchain.org", "https://bsc-rpc.publicnode.com"] };
const PER_EPOCH = 150000, FIRST = 42000;
function fmt(n) { return n.toLocaleString("en-US"); }
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
  set("bClaims", fmt(Number(claims)));
  set("bKeys", fmt(Number(keys)));
  const bar = document.getElementById("bBar");
  if (bar) bar.style.width = (inEpoch / PER_EPOCH * 100).toFixed(2) + "%";
}
if (document.getElementById("bEpoch")) { board(); setInterval(board, 30000); }

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
