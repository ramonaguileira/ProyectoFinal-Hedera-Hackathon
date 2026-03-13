# Guardian — Schemas & Policy

## Schemas (6 files, ready to import)

| File | Type | Purpose |
|---|---|---|
| `entrega-schema.json` | MRV | Waste delivery → triggers EGGOCOINS |
| `supplier-schema.json` | VC | Supplier registration |
| `batch-schema.json` | VC | BSF/compost batch processing |
| `production-schema.json` | MRV | Daily egg/larvae/compost output |
| `points-schema.json` | VC | EGGOCOINS mint records |
| `carbon-credit-schema.json` | VC | CARBONCOIN NFT credit records |

## Import via Guardian API

```bash
for schema in schemas/*.json; do
  curl -X POST "${GUARDIAN_URL}/api/v1/schemas" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d @"$schema"
done
```

## Policy

The `policies/` directory will contain the exportable `.policy` file once built. Build in Guardian's visual editor following `docs/architecture.md`.

## Deployment Options

- **Docker Compose**: `git clone https://github.com/hashgraph/guardian && docker compose up -d`
- **Managed SaaS**: guardianservice.app (fastest start)
- **Cloud/K8s**: Use TYMLEZ Terraform modules
