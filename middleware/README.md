# Eggologic Middleware

Node.js bridge between Google Sheets and Hedera (via Guardian + direct SDK).

## Setup

```bash
npm install
cp ../.env.example ../.env  # Edit with your credentials
npm run dev
```

## Architecture

- **Polling**: Reads new rows from Google Sheets every 5 minutes
- **Guardian**: Submits delivery MRV data as Verifiable Credentials
- **HTS**: Mints EGGOCOINS tokens per delivery, CARBONCOIN NFTs at threshold
- **HCS**: Publishes audit trail messages to immutable topics

## API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/health` | GET | Health check |
| `/api/webhook/form-submit` | POST | Google Apps Script webhook |
| `/api/suppliers` | GET | List suppliers |
| `/api/suppliers/:id/balance` | GET | EGGOCOINS balance |
| `/api/dashboard/stats` | GET | Aggregated statistics |
| `/api/dashboard/recent-deliveries` | GET | Recent delivery list |
