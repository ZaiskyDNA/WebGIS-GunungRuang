# Deployment Guide — CeloPay Agent Smart Contracts

Quick reference for deploying smart contracts to Celo networks.

## Prerequisites

```bash
# Check Foundry installation
forge --version

# Check you have a funded wallet
cast balance 0xYOUR_ADDRESS --rpc-url https://forno.celo.org
```

## 1. Configure Environment

```bash
# Copy template
cp .env.example .env

# Edit .env and add:
PRIVATE_KEY=0x...your_private_key...
CELOSCAN_API_KEY=...get_from_celoscan.io...
```

⚠️ **Never commit .env to git!** It's in .gitignore.

## 2. Deploy to Alfajores Testnet (Recommended First)

```bash
# Load environment
source .env

# Run deployment script
forge script script/Deploy.s.sol \
  --rpc-url https://alfajores-forno.celo-testnet.org \
  --broadcast \
  --private-key $PRIVATE_KEY

# Example output:
# CeloPayAgent deployed to: 0x1234567...
# GroupPayment deployed to: 0x2345678...
# PaymentScheduler deployed to: 0x3456789...
```

## 3. Save Deployment Addresses

Create `deployments.json`:

```json
{
  "alfajores": {
    "chainId": 44787,
    "cUSD": "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
    "CeloPayAgent": "0x...",
    "GroupPayment": "0x...",
    "PaymentScheduler": "0x..."
  }
}
```

## 4. Test on Testnet

```bash
# Get testnet cUSD
# Visit: https://faucet.celo.org

# Check balance
cast call 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1 \
  "balanceOf(address)" 0xYOUR_ADDRESS \
  --rpc-url https://alfajores-forno.celo-testnet.org

# Approve CeloPayAgent to spend cUSD
cast send 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1 \
  "approve(address,uint256)" 0xCELOPAY_AGENT_ADDRESS 1000000000000000000 \
  --rpc-url https://alfajores-forno.celo-testnet.org \
  --private-key $PRIVATE_KEY

# Send test payment
cast send 0xCELOPAY_AGENT_ADDRESS \
  "sendPayment(address,uint256,string)" 0xRECIPIENT_ADDRESS 100000000000000000 "test" \
  --rpc-url https://alfajores-forno.celo-testnet.org \
  --private-key $PRIVATE_KEY
```

## 5. Verify Contracts on Celoscan (Optional but Recommended)

```bash
# Verify CeloPayAgent
forge verify-contract \
  --chain-id 44787 \
  0xCELOPAY_AGENT_ADDRESS \
  src/CeloPayAgent.sol:CeloPayAgent \
  --etherscan-api-key $CELOSCAN_API_KEY \
  --verifier-url https://api-alfajores.celoscan.io/api

# View on Celoscan Alfajores
# https://alfajores.celoscan.io/address/0xCELOPAY_AGENT_ADDRESS
```

## 6. Deploy to Mainnet

⚠️ **ONLY AFTER TESTNET SUCCESS**

```bash
# Verify deployment once more
forge script script/Deploy.s.sol --dry-run \
  --rpc-url https://forno.celo.org \
  --private-key $PRIVATE_KEY

# Deploy to mainnet
forge script script/Deploy.s.sol \
  --rpc-url https://forno.celo.org \
  --broadcast \
  --verify \
  --etherscan-api-key $CELOSCAN_API_KEY \
  --private-key $PRIVATE_KEY
```

## 7. Update Frontend

Update `.env.local` in frontend:

```bash
NEXT_PUBLIC_CELOPAY_AGENT=0x...
NEXT_PUBLIC_GROUP_PAYMENT=0x...
NEXT_PUBLIC_PAYMENT_SCHEDULER=0x...
```

## Troubleshooting

### "Insufficient balance"
You need CELO to pay for gas. Get some from:
- Alfajores: https://faucet.celo.org
- Mainnet: Buy from exchange

### "Transaction reverted: constructor"
cUSD address is wrong. Check:
- Alfajores: `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1`
- Mainnet: `0x765DE816845861e75A25fCA122bb6898B8B1282a`

### "Private key error"
Format must be `0x` + 64 hex chars. Check:
```bash
echo $PRIVATE_KEY  # Should be 0x123abc...
```

### Verification fails
Wait 30+ seconds after deployment before verifying. Then:
```bash
forge verify-contract --watch 0xADDRESS src/Contract.sol:Contract
```

## Quick Reference

| Network | Chain ID | RPC URL |
|---------|----------|---------|
| Alfajores | 44787 | https://alfajores-forno.celo-testnet.org |
| Mainnet | 42220 | https://forno.celo.org |

| Explorer | URL |
|----------|-----|
| Celoscan Alfajores | https://alfajores.celoscan.io |
| Celoscan Mainnet | https://celoscan.io |

## Gas Costs (Approximate)

| Operation | Gas | Cost (CELO @ 0.5) |
|-----------|-----|-------------------|
| Deploy CeloPayAgent | 450,000 | 0.225 CELO |
| Deploy GroupPayment | 850,000 | 0.425 CELO |
| Deploy PaymentScheduler | 750,000 | 0.375 CELO |
| **Total** | **2,050,000** | **~1.0 CELO** |

---

**Next:** Integrate with frontend & test full MiniApp flow.
