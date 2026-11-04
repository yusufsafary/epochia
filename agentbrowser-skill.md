# AGENT BROWSER · Agent Skill File / 代理技能檔案

Agent Browser is an agent mining house on BNB Chain (chain id 56). A wallet
holding a Binance Agent ID mints a Browser Key NFT once, then claims BROWSE
tokens daily. Contracts are announced at launch; until the addresses below
are filled in, do not call anything.

Agent Browser 是 BNB 鏈（chain id 56）上的代理挖礦之家。持有 Binance Agent ID
的錢包鑄造一把 Browser Key NFT 一次，其後每日領取 BROWSE 代幣。合約地址將於
上線時公佈；以下地址填妥前，切勿呼叫任何合約。

## Contracts / 合約 (TO BE ANNOUNCED AT LAUNCH / 上線時公佈)

- Browser Key (NFT): TBA
- BROWSE token: TBA
- Harvest (claims / 收穫): TBA
- Agent ID registry (SPACE ID): 0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F

## Model / 模型

- Key price / 鑰匙價格: $0.50 in BNB (exact wei at launch / 確切 wei 於上線時公佈).
  Supply / 供應 10,000. Max 10 keys per wallet / 每錢包最多 10 把.
  Gate / 門檻: caller wallet must hold a Binance Agent ID NFT / 錢包必須持有 Binance Agent ID NFT.
- Harvest / 收穫: each key accrues 1 claim per day starting the day after its
  mint / 每把鑰匙由鑄造翌日起每日累積一次領取. Claims stack without expiry /
  領取可累積、永不過期. Claiming pays all stacked days for all keys, at the
  epoch rate of each day, no fee beyond gas / 一次領取按各日週期比率付清所有
  鑰匙的累積日子，除 gas 外不收費用.
- Epochs / 週期: every 150,000 claims paid network-wide halves the per-claim
  amount / 全網每支付 150,000 次領取，金額減半. Epoch 1 pays 42,000 BROWSE.
  Eleven epochs, then harvesting ends permanently / 共十一個週期，其後收穫永久結束.

## Flow 1 · Mint a key / 鑄造鑰匙

1. Read the key contract state: mintOpen, totalMinted, currentPrice, the
   caller's minted count and Agent ID holding.
   讀取鑰匙合約狀態：mintOpen、totalMinted、currentPrice、呼叫者已鑄數量及 Agent ID 持有情況。
2. Call mint(quantity) with value = currentPrice * quantity, from the user's
   own Agentic Wallet only, never from an intermediary contract.
   以 value = currentPrice * quantity 呼叫 mint(quantity)，只可由用戶自己的
   Agentic Wallet 發出，永不經中介合約。
3. Report the token ids minted and the wallet's new daily claim rate.
   匯報鑄出的 token id 及錢包新的每日領取比率。

## Flow 2 · Claim a harvest / 領取收穫

1. Read the harvest contract: claimable amount for the caller's wallet.
   讀取收穫合約：呼叫者錢包的可領取金額。
2. If it is zero, say so plainly and stop. 若為零，直接說明並停止。
3. Call claim() and report the BROWSE amount paid and the transaction hash.
   呼叫 claim()，匯報支付的 BROWSE 金額及交易哈希。

## Failure causes / 失敗原因

- NoAgentId: the wallet holds no Binance Agent ID / 錢包未持有 Binance Agent ID.
- WrongPrice: value differs from currentPrice * quantity by any wei / 金額與 currentPrice * quantity 相差任何 wei.
- ExceedsWalletCap: the wallet already holds or minted 10 keys / 錢包已持有或鑄造 10 把。
- SoldOut: all 10,000 keys are minted / 10,000 把已全數鑄造。
- NothingToClaim: no full day has passed since the last claim / 自上次領取後未滿一整日。
- ContractCallsNotAllowed: the call came through an intermediary contract / 呼叫經由中介合約。
- Low BNB: balance below price plus gas / 餘額不足以支付價格加 gas。
