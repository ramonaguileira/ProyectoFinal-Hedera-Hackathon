# Eggologic — Token Economics

## EGGOCOINS (Fungible Token)

| Parameter | Value |
|---|---|
| Name | Eggologic Puntos |
| Symbol | EGGOCOINS |
| Type | FungibleCommon |
| Decimals | 2 |
| Initial Supply | 0 (mint on demand) |
| Supply Type | Infinite |
| Creation Cost | $1.00 (one-time) |
| Mint Cost | $0.001 per operation |
| Transfer Cost | $0.001 per operation |

### Formula

```
EGGOCOINS = kg_netos × factor_calidad × factor_alianza

kg_netos = kg_brutos × (1 - pct_impropios / 100)

factor_calidad:
  A (≤5% contaminants)  = 1.2
  B (5-15%)             = 1.0
  C (15-30%)            = 0.8
  D (>30%)              = 0.5

factor_alianza:
  ≥4 deliveries/month   = 1.1
  Otherwise             = 1.0
```

### Example: Clean Delivery
- 80 kg brutos, 5% impropios → 76 kg netos
- Grade A → factor 1.2, 5th delivery → factor 1.1
- **EGGOCOINS: 76 × 1.2 × 1.1 = 100.32**

### Example: Dirty Delivery
- 60 kg brutos, 25% impropios → 45 kg netos
- Grade C → factor 0.8, 2nd delivery → factor 1.0
- **EGGOCOINS: 45 × 0.8 × 1.0 = 36.00**

Clean delivery earns ~3× more tokens, incentivizing waste quality.

### Redemption
100 EGGOCOINS ≈ 1 dozen eggs (equivalence to be defined per operational costs).

---

## CARBONCOIN (NFT)

| Parameter | Value |
|---|---|
| Name | Créditos Ambientales Eggologic |
| Symbol | CARBONCOIN |
| Type | NonFungibleUnique |
| Equivalence | 1 NFT = 1 tCO₂e avoided |
| Threshold | 1,000 kg adjusted (Σ kg_ingreso × 0.70) |
| Methodology | CDM AMS-III.F adapted |
| Metadata | HIP-412 v2.0.0 on IPFS |
| Mint Cost | $0.02 per NFT |
| Frequency | ~1 every 3-6 weeks at current volume |

### HIP-412 Metadata Structure

```json
{
  "name": "Eggologic Carbon Credit #001",
  "description": "Verified offset from BSF composting cycle",
  "format": "HIP412@2.0.0",
  "properties": {
    "methodology": "CDM_AMS-III.F_adapted",
    "batch_ids": ["BSF-20260301-01", "CMP-20260301-01"],
    "co2e_tonnes": 1.0,
    "conservative_factor": 0.70,
    "mrv_data_cid": "ipfs://QmMRVDataCID",
    "verifier_did": "did:hedera:testnet:...",
    "vintage_year": 2026,
    "location": "Melo, Cerro Largo, Uruguay"
  }
}
```
