# Eggologic — Architecture

## Data Flow

```
Field Operators → Google Forms → Google Sheets
                                      ↓
                            Node.js Middleware (Express)
                           /          |           \
                    PostgreSQL    Guardian API    Hedera SDK (direct)
                    (sync state,  (MRV submit,   (HCS audit logs,
                     off-chain    verification,   supplementary
                     cache)       token mint)     token operations)
                                      ↓
                              Hedera Network
                         (HTS tokens + HCS topics + IPFS VPs)
```

## Guardian Policy Block Flow

```
PolicyRolesBlock → RegistroProveedor → Delivery MRV → Batch → Production → Carbon Credit → Report
```

Each stage uses `setRelationshipsBlock` to link documents for full traceability.

## Key Design Decisions

- **requestVcDocumentBlock** over externalDataBlock: accepts plain JSON, Guardian wraps into signed VC
- **Block tags** over block UUIDs: stable across policy republishes
- **switchBlock** for conditional routing: rejects deliveries with >20% contaminants
- **aggregateDocumentBlock** for linking deliveries into weekly batches
- **70% conservative factor** on carbon credits
