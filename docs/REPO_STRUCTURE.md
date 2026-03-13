# Eggologic — Estructura del Repositorio para Hedera Apex Hackathon 2026

## Árbol de directorios recomendado

```
eggologic-hedera/
│
├── README.md                          # README principal del hackathon (incluido)
├── LICENSE                            # MIT o Apache 2.0
├── .env.example                       # Variables de entorno template
├── .gitignore
├── package.json                       # Monorepo root (workspaces)
│
├── docs/
│   ├── architecture.md                # Diagrama de arquitectura técnica
│   ├── carbon-methodology.md          # Explicación CDM AMS-III.F adaptada
│   ├── token-economics.md             # Diseño de EGGOCOINS + CARBONCOIN
│   └── images/
│       ├── architecture-diagram.png
│       ├── flow-diagram.png
│       ├── demo-screenshot-1.png
│       └── demo-screenshot-2.png
│
├── guardian/
│   ├── README.md                      # Instrucciones de setup Guardian
│   ├── schemas/
│   │   ├── entrega-schema.json        # EntregaSchema (MRV)
│   │   ├── supplier-schema.json       # RegistroProveedorSchema (VC)
│   │   ├── batch-schema.json          # LoteBatchSchema (VC)
│   │   ├── production-schema.json     # ProduccionSchema (MRV)
│   │   ├── points-schema.json         # PuntosProveedorSchema (VC)
│   │   └── carbon-credit-schema.json  # CreditoAmbientalSchema (VC)
│   └── policies/
│       └── eggologic-policy.policy    # Archivo de política exportable
│
├── middleware/
│   ├── README.md
│   ├── package.json
│   ├── src/
│   │   ├── index.js                   # Entry point Express server
│   │   ├── config/
│   │   │   ├── env.js                 # Carga de variables de entorno
│   │   │   └── hedera.js              # Configuración del cliente Hedera
│   │   ├── services/
│   │   │   ├── sheets.service.js      # Polling de Google Sheets
│   │   │   ├── guardian.service.js     # Interacción con API REST de Guardian
│   │   │   ├── hedera.service.js      # Operaciones HTS/HCS directas
│   │   │   └── points.service.js      # Cálculo de EGGOCOINS
│   │   ├── jobs/
│   │   │   ├── poll-deliveries.js     # Cron job: poll entregas nuevas
│   │   │   ├── process-batches.js     # Cron job: cierre de lotes
│   │   │   └── carbon-accumulator.js  # Acumulador de kg para CARBONCOIN
│   │   ├── routes/
│   │   │   ├── webhook.routes.js      # Endpoint para Apps Script webhook
│   │   │   ├── supplier.routes.js     # API de proveedores
│   │   │   └── dashboard.routes.js    # API para el dashboard
│   │   └── utils/
│   │       ├── logger.js
│   │       └── validators.js
│   ├── tests/
│   │   ├── sheets.test.js
│   │   ├── guardian.test.js
│   │   └── hedera.test.js
│   └── docker-compose.yml             # PostgreSQL + Redis para dev local
│
├── contracts/                          # (Opcional) Smart contracts si se usan
│   └── README.md
│
├── dashboard/
│   ├── README.md
│   ├── package.json
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── DeliveryTable.jsx       # Tabla de entregas recientes
│   │   │   ├── PointsBalance.jsx       # Saldo EGGOCOINS del proveedor
│   │   │   ├── CarbonTracker.jsx       # Progreso hacia próximo CARBONCOIN
│   │   │   ├── TrustchainViewer.jsx    # Visualizador de cadena de confianza
│   │   │   └── WalletConnect.jsx       # Integración HashPack/Blade
│   │   ├── hooks/
│   │   │   ├── useHedera.js            # Hook para Hedera SDK
│   │   │   └── useWallet.js            # Hook para wallet connection
│   │   ├── services/
│   │   │   └── api.js                  # Cliente HTTP al middleware
│   │   └── assets/
│   │       └── eggologic-logo.svg
│   └── tailwind.config.js
│
├── scripts/
│   ├── setup-testnet.js                # Script de setup inicial en testnet
│   ├── create-tokens.js                # Crear EGGOCOINS + CARBONCOIN en HTS
│   ├── create-topics.js                # Crear topics HCS
│   ├── seed-demo-data.js               # Datos demo para presentación
│   └── demo-flow.js                    # Script que ejecuta el flujo completo
│
└── pitch/
    ├── pitch-script.md                 # Guión del video pitch
    ├── slides/                         # Slides de apoyo (si aplica)
    └── demo-recording-notes.md         # Notas para grabar el demo
```

## Notas para el hackathon

- **Commits durante el período**: Todo commit debe ser entre 17 Feb y 23 Mar 2026
- **GitHub público**: El repo debe ser público para la submission
- **Video pitch**: Requerido, máximo 3-5 minutos típicamente
- **Demo funcional**: Priorizar testnet sobre mainnet para el hackathon
