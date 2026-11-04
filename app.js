// Epochia live board. Contracts are announced at launch; until CONFIG.key is
// set, the board renders the genesis schedule (Epoch 1, nothing minted).
const CONFIG = { key: "", harvest: "", rpc: ["https://bsc-dataseed1.binance.org", "https://bsc-dataseed-public.bnbchain.org", "https://bsc-rpc.publicnode.com"] };
const PER_EPOCH = 150000, FIRST = 42000;
function fmt(n) { return n.toLocaleString("en-US"); }
async function call(to, data) {
  const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to, data }, "latest"] });
  const tries = CONFIG.rpc.map((u) => fetch(u, { method: "POST", headers: { "Content-Type": "application/json" }, body, signal: AbortSignal.timeout(5000) }).then((r) => r.json()).then((j) => { if (!j.result) throw 0; return j.result; }));
  return Promise.any(tries);
}
function word(hex) { return BigInt(hex); }
async function board() {
  let claims = 0n, keys = 0n;
  try {
    if (CONFIG.harvest) claims = word(await call(CONFIG.harvest, "0xd54ad2a1"));
    if (CONFIG.key) keys = word(await call(CONFIG.key, "0x18160ddd"));
  } catch (e) { /* genesis render stays */ }
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
board();
setInterval(board, 30000);
