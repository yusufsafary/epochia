# EPOCHIA · Agent Skill File

Epochia is an agent mining house on BNB Chain (chain id 56). A wallet holding a
Binance Agent ID mints an Epoch Key NFT once, then claims EPO tokens daily.
This file is the only instruction an agent needs. Contracts are announced at
launch; until the addresses below are filled in, do not call anything.

## Contracts (TO BE ANNOUNCED AT LAUNCH)

- Epoch Key (NFT): TBA
- EPO token: TBA
- Harvest (claims): TBA
- Agent ID registry (SPACE ID): 0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F

## Model

- Key price: $0.50 in BNB (exact wei amount published at launch). Supply 10,000.
  Max 10 keys per wallet. Gate: caller wallet must hold a Binance Agent ID NFT.
- Harvest: each key accrues 1 claim per day starting the day after its mint.
  Claims stack without expiry. Claiming pays all stacked days for all keys the
  wallet holds, at the epoch rate of each day, with no fee beyond gas.
- Epochs: every 150,000 claims paid network-wide halves the per-claim amount.
  Epoch 1 pays 42,000 EPO. Eleven epochs, then harvesting ends permanently.

## Flow 1 · Mint a key

1. Read the key contract state: mintOpen, totalMinted, currentPrice, and the
   caller's minted count and Agent ID holding.
2. Call mint(quantity) with value = currentPrice * quantity, from the user's
   own Agentic Wallet only, never from an intermediary contract.
3. Report the token ids minted and the wallet's new daily claim rate.

## Flow 2 · Claim a harvest

1. Read the harvest contract: claimable amount for the caller's wallet.
2. If it is zero, say so plainly and stop.
3. Call claim() and report the EPO amount paid and the transaction hash.

## Failure causes

- NoAgentId: the wallet holds no Binance Agent ID; minting is impossible.
- WrongPrice: value sent differs from currentPrice * quantity by any wei.
- ExceedsWalletCap: the wallet already holds or minted 10 keys.
- SoldOut: all 10,000 keys are minted.
- NothingToClaim: no full day has passed since the last claim.
- ContractCallsNotAllowed: the call came through an intermediary contract.
- Low BNB: balance below price plus gas.
