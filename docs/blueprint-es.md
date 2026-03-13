# Blueprint de implementación de Hedera Guardian para Eggologic

**Eggologic puede tokenizar toda su economía circular de residuos-a-huevos en Hedera por aproximadamente $0.20/mes en costos de transacción, usando el motor de políticas de Guardian para verificación MRV y HTS tanto para tokens de incentivo a proveedores como para créditos ambientales.** La arquitectura conecta el MVP actual en Google Sheets con la verificación on-chain a través de una capa middleware en Node.js que consulta los datos de Sheets y los envía a la API REST de Guardian. La metodología existente de compostaje CDM AMS-III.F de Guardian proporciona una plantilla lista para la cuantificación de créditos de carbono. No existe aún un despliegue en producción de un ciclo residuo-orgánico-a-BSF-a-huevos en Guardian, lo que convierte a Eggologic en un caso de uso novedoso de economía circular — pero los patrones de DOVU (créditos de carbono agrícolas) y TYMLEZ (MRV de IoT a Guardian) aplican directamente.

---

## La arquitectura de políticas de Guardian mapea directamente al modelo de datos de Eggologic

Las políticas de Guardian se construyen a partir de **bloques configurables** organizados en una estructura de árbol. Cada bloque tiene un `blockType`, un `tag` único, `permissions` y un flag `defaultActive`. Los documentos (Credenciales Verificables) fluyen a través de los bloques, siendo validados, calculados, aprobados y eventualmente activando la emisión de tokens. Los tres roles principales para Eggologic son **Standard Registry** (administrador de Eggologic), **Operator** (personal de campo ingresando datos) y **Verifier** (auditor de calidad o verificación automatizada).

El flujo de trabajo recomendado para la política de Eggologic utiliza estos tipos de bloques en secuencia:

```
PolicyRolesBlock (roles: "Proveedor", "Operador", "Verificador", "Registro")
├── InterfaceStepBlock [Registro de Proveedor]
│   ├── requestVcDocumentBlock (schema: RegistroProveedorSchema)
│   ├── sendToGuardianBlock (dataType: "approve")
│   └── [Registro aprueba] → sendToGuardianBlock (dataType: "vc-documents")
│
├── InterfaceStepBlock [Flujo MRV de Entregas]
│   ├── requestVcDocumentBlock (schema: EntregaSchema)
│   ├── documentValidatorBlock (validar datos de entrega)
│   ├── sendToGuardianBlock (dataType: "approve")
│   ├── [Aprobación del Verificador via InterfaceActionBlock]
│   ├── calculateContainerBlock
│   │     └── calculateMathAddOnBlock (kg_netos, factor_calidad, puntos)
│   ├── sendToGuardianBlock (dataType: "hedera") → publicar en topic HCS
│   └── mintDocumentBlock (token: PUNTOS token fungible)
│
├── InterfaceStepBlock [Procesamiento de Lotes]
│   ├── requestVcDocumentBlock (schema: LoteBatchSchema)
│   ├── aggregateDocumentBlock (vincular entregas → lote)
│   ├── setRelationshipsBlock (vincular lote → entregas)
│   ├── calculateContainerBlock (ratio_conversion, producción de compost)
│   └── sendToGuardianBlock (dataType: "hedera")
│
├── InterfaceStepBlock [Registro de Producción]
│   ├── requestVcDocumentBlock (schema: ProduccionSchema)
│   ├── setRelationshipsBlock (vincular producción → lote)
│   └── sendToGuardianBlock
│
├── InterfaceStepBlock [Emisión de Créditos Ambientales]
│   ├── aggregateDocumentBlock (agregar datos MRV del lote)
│   ├── calculateContainerBlock (CO2e evitado por compostaje)
│   ├── [Aprobación del Verificador]
│   └── mintDocumentBlock (token: ECOCRDT NFT)
│
└── reportBlock (cadena de confianza completa para auditoría)
```

**Decisiones clave de bloques para Eggologic:**

- Usar **`requestVcDocumentBlock`** (no `externalDataBlock`) para el pipeline del middleware. Acepta JSON plano y Guardian lo envuelve automáticamente en una VC firmada. El `externalDataBlock` requiere VCs pre-firmadas y es más adecuado para sensores IoT en el futuro.
- El **`calculateContainerBlock`** con **`calculateMathAddOnBlock`** ejecuta la fórmula de PUNTOS on-chain: `kg_netos × factor_calidad × factor_alianza`. Se configura el addon matemático para referenciar directamente los nombres de campos de la VC.
- El **`switchBlock`** permite enrutamiento condicional — por ejemplo, dirigir entregas con `pct_impropios > 20%` a un flujo de rechazo versus aprobación automática para entregas limpias.
- El **`aggregateDocumentBlock`** es crítico para vincular entregas individuales en lotes semanales, habilitando los cálculos de créditos de carbono a nivel de lote.

---

## Seis schemas de Guardian cubren el modelo de datos completo de Eggologic

Los schemas de Guardian siguen el formato **JSON-LD + JSON Schema** y definen el contenido de las Credenciales Verificables. Cada schema tiene un tipo de entidad: **VC** (credencial estándar), **MRV** (datos de medición que activan cálculos), o **None** (sub-schema para embeber). Los tipos de campo disponibles incluyen String, Number, Integer, Boolean, Date, Enum, GeoJSON, URI, Image, Account (referencia a cuenta Hedera) y Auto-Calculate.

### Schema 1: EntregaSchema (tipo MRV)

Este es el schema principal de entregas, mapeando directamente a la tabla ENTREGAS:

```json
{
  "$id": "#eggologic-entrega-v1",
  "title": "Entrega de Residuos Orgánicos",
  "description": "Registro de entrega de residuo orgánico del proveedor",
  "type": "object",
  "properties": {
    "@context": { "type": "array" },
    "type": { "type": "string" },
    "delivery_id": {
      "title": "ID de Entrega",
      "type": "string",
      "$comment": "{\"term\":\"delivery_id\",\"@id\":\"https://schema.org/identifier\"}"
    },
    "supplier_id": {
      "title": "ID de Proveedor",
      "type": "string",
      "$comment": "{\"term\":\"supplier_id\",\"@id\":\"https://schema.org/identifier\"}"
    },
    "kg_brutos": {
      "title": "Peso Bruto (kg)",
      "type": "number",
      "$comment": "{\"term\":\"kg_brutos\",\"@id\":\"https://schema.org/weight\"}"
    },
    "pct_impropios": {
      "title": "Porcentaje de Impropios (%)",
      "type": "number"
    },
    "kg_netos": {
      "title": "Peso Neto (kg)",
      "type": "number",
      "$comment": "{\"term\":\"kg_netos\",\"@id\":\"https://schema.org/weight\"}"
    },
    "fecha": {
      "title": "Fecha de Entrega",
      "type": "string",
      "format": "date"
    },
    "quality_grade": {
      "title": "Grado de Calidad",
      "type": "string",
      "enum": ["A", "B", "C", "D"]
    },
    "factor_calidad": {
      "title": "Factor de Calidad",
      "type": "number"
    },
    "factor_alianza": {
      "title": "Factor de Alianza",
      "type": "number"
    }
  },
  "required": ["delivery_id", "supplier_id", "kg_brutos", "fecha"]
}
```

### Resumen de Schemas 2–6

| Schema | Tipo de Entidad | Campos Clave | Mapea A |
|---|---|---|---|
| **RegistroProveedorSchema** | VC | supplier_id, nombre, contacto, nivel_alianza, hedera_account_id, ubicación | PROVEEDORES |
| **EntregaSchema** | MRV | delivery_id, supplier_id, kg_brutos, pct_impropios, kg_netos, fecha, quality_grade, factor_calidad, factor_alianza | ENTREGAS |
| **LoteBatchSchema** | VC | batch_id, delivery_ids (array), kg_ingreso, kg_larva_salida, kg_compost_salida, ratio_conversion, fecha_inicio, fecha_fin | BATCHES |
| **ProduccionSchema** | MRV | production_id, batch_id, huevos_dia, kg_larva, kg_compost, fecha | PRODUCCIÓN |
| **PuntosProveedorSchema** | VC | supplier_id, delivery_id, puntos_generados, inputs_formula, periodo | Referencia de emisión de token |
| **CreditoAmbientalSchema** | VC | credit_id, metodología, batch_ids, reduccion_emisiones_tCO2e, año_vintage, estado_verificación, did_verificador | Referencia de emisión de NFT |

Cuando un `requestVcDocumentBlock` recolecta datos usando cualquier schema, Guardian automáticamente lo envuelve en una VC con emisor basado en DID, fecha de emisión, prueba criptográfica y `credentialSubject` conteniendo los campos enviados. La VP (Presentación Verificable) que agrega estas VCs se sube a IPFS, con el CID registrado en un mensaje de topic HCS — creando la **cadena de confianza (trustchain)**.

---

## La API REST de Guardian conecta el middleware con la verificación on-chain

Guardian expone una API REST completa en `http://<guardian-host>:3000/api/v1/` con documentación Swagger en `/api-docs/v1/`. La autenticación es **basada en JWT** — todas las llamadas excepto login requieren un header `Authorization: Bearer <token>`.

### Flujo de autenticación

```javascript
// 1. Login para obtener tokens JWT
const loginRes = await fetch(`${GUARDIAN_URL}/api/v1/accounts/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'eggologic_operador',
    password: 'contraseña_segura'
  })
});
const { accessToken, refreshToken } = await loginRes.json();

// 2. Refrescar cuando expire
const refreshRes = await fetch(`${GUARDIAN_URL}/api/v1/accounts/access-token`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
});
```

### Endpoints principales de la API

| Endpoint | Método | Propósito |
|---|---|---|
| `/api/v1/accounts/login` | POST | Autenticar, obtener JWT |
| `/api/v1/policies` | GET/POST | Listar o crear políticas |
| `/api/v1/policies/{policyId}/publish` | PUT | Publicar política en Hedera |
| `/api/v1/policies/{policyId}/blocks/{blockId}` | GET/POST | Leer datos del bloque o enviar datos a un bloque |
| `/api/v1/policies/{policyId}/tag/{tag}` | POST | **Enviar datos por tag del bloque** (más estable que UUID del bloque) |
| `/api/v1/policies/{policyId}/dry-run` | PUT | Habilitar modo de prueba en seco |
| `/api/v1/policies/{policyId}/dry-run/user` | POST | Crear usuario virtual de prueba |
| `/api/v1/schemas` | GET/POST | Listar o crear schemas |
| `/api/v1/schemas/{schemaId}/publish` | PUT | Publicar schema |
| `/api/v1/tokens` | GET/POST | Listar o crear tokens |
| `/api/v1/policies/import/file` | POST | Importar política desde archivo .policy |

### Envío de datos MRV programáticamente

El punto de integración crítico — enviar una entrega desde el middleware a Guardian:

```javascript
// Enviar datos MRV de entrega a Guardian via tag del bloque (preferido sobre UUID)
async function enviarEntregaAGuardian(accessToken, datosEntrega) {
  const response = await fetch(
    `${GUARDIAN_URL}/api/v1/policies/${POLICY_ID}/tag/submit_entrega_mrv`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        document: {
          delivery_id: datosEntrega.delivery_id,
          supplier_id: datosEntrega.supplier_id,
          kg_brutos: datosEntrega.kg_brutos,
          pct_impropios: datosEntrega.pct_impropios,
          kg_netos: datosEntrega.kg_netos,
          fecha: datosEntrega.fecha,
          quality_grade: datosEntrega.quality_grade,
          factor_calidad: datosEntrega.factor_calidad,
          factor_alianza: datosEntrega.factor_alianza
        },
        ref: null
      })
    }
  );
  return response.json();
}
```

**Usar tags de bloque** (`/tag/submit_entrega_mrv`) en lugar de UUIDs de bloque es el patrón recomendado — los tags son estables entre versiones de la política mientras que los IDs de bloque cambian al republicar.

### Flujo de aprobación desde la API

```javascript
// El verificador obtiene aprobaciones pendientes
const pendientes = await fetch(
  `${GUARDIAN_URL}/api/v1/policies/${POLICY_ID}/tag/lista_aprobacion`,
  { headers: { 'Authorization': `Bearer ${tokenVerificador}` } }
);

// El verificador aprueba una entrega específica
await fetch(
  `${GUARDIAN_URL}/api/v1/policies/${POLICY_ID}/tag/aprobar_entrega`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenVerificador}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      document: { /* VC original */ },
      option: { status: 'approved' }
    })
  }
);
```

---

## Diseño de tokens HTS para PUNTOS y créditos ambientales

### Token fungible: PUNTOS (incentivos para proveedores)

```javascript
import {
  Client, PrivateKey, AccountId, Hbar,
  TokenCreateTransaction, TokenType, TokenSupplyType,
  TokenMintTransaction, TokenAssociateTransaction, TransferTransaction
} from "@hashgraph/sdk";

// === CREAR TOKEN PUNTOS (única vez, cuesta $1.00) ===
const tokenCreateTx = await new TokenCreateTransaction()
  .setTokenName("Eggologic Puntos")
  .setTokenSymbol("PUNTOS")
  .setTokenType(TokenType.FungibleCommon)
  .setDecimals(2)                            // soporta puntos fraccionarios (152.75)
  .setInitialSupply(0)                       // emitir bajo demanda por entrega
  .setTreasuryAccountId(treasuryAccountId)
  .setSupplyType(TokenSupplyType.Infinite)   // sin tope en el total de puntos
  .setAdminKey(adminKey.publicKey)
  .setSupplyKey(supplyKey.publicKey)          // REQUERIDO para emisión
  .setTokenMemo("Puntos de incentivo para proveedores de Eggologic")
  .freezeWith(client);

const signed = await (await tokenCreateTx.sign(treasuryKey)).sign(adminKey);
const receipt = await (await signed.execute(client)).getReceipt(client);
const puntosTokenId = receipt.tokenId; // ej., 0.0.456789
```

**Justificación del diseño:** **Supply infinito** porque los puntos se emiten continuamente por entrega. **Dos decimales** porque la fórmula `kg_netos × factor_calidad × factor_alianza` puede producir resultados fraccionarios (ej., 138.16 × 0.95 × 1.2 = 157.40). Supply inicial de cero evita pre-asignación — los tokens existen solo cuando se ganan.

### Emisión de PUNTOS por entrega

```javascript
async function emitirPuntos(tokenId, kgNetos, factorCalidad, factorAlianza) {
  const puntos = kgNetos * factorCalidad * factorAlianza;
  const cantidadUnidadMinima = Math.round(puntos * 100); // 2 decimales → multiplicar por 100

  const mintTx = await new TokenMintTransaction()
    .setTokenId(tokenId)
    .setAmount(cantidadUnidadMinima)
    .freezeWith(client);

  const signed = await mintTx.sign(supplyKey);
  const response = await signed.execute(client);
  const receipt = await response.getReceipt(client);
  return { puntos, status: receipt.status.toString(), txId: response.transactionId.toString() };
}

// Ejemplo: 138.16 kg × 0.95 calidad × 1.2 alianza = 157.40 PUNTOS
await emitirPuntos(puntosTokenId, 138.16, 0.95, 1.2);
```

### Asociación de token y transferencia a proveedores

```javascript
// Cada proveedor debe asociarse una vez (cuesta $0.05)
const associateTx = await new TokenAssociateTransaction()
  .setAccountId(supplierAccountId)
  .setTokenIds([puntosTokenId])
  .freezeWith(client)
  .sign(supplierKey);
await associateTx.execute(client);

// Transferir PUNTOS emitidos del tesoro al proveedor
const transferTx = await new TransferTransaction()
  .addTokenTransfer(puntosTokenId, treasuryAccountId, -cantidadUnidadMinima)
  .addTokenTransfer(puntosTokenId, supplierAccountId, cantidadUnidadMinima)
  .freezeWith(client)
  .sign(treasuryKey);
await transferTx.execute(client);
```

### Créditos ambientales NFT: ECOCRDT

Para créditos de carbono/ambientales, cada ciclo de lote verificado emite un NFT con metadatos inmutables vinculados a la cadena de confianza MRV completa:

```javascript
// Crear colección NFT (única vez, $1.00)
const nftCreateTx = await new TokenCreateTransaction()
  .setTokenName("Créditos Ambientales Eggologic")
  .setTokenSymbol("ECOCRDT")
  .setTokenType(TokenType.NonFungibleUnique)
  .setDecimals(0)                         // debe ser 0 para NFTs
  .setInitialSupply(0)                    // debe ser 0 para NFTs
  .setSupplyType(TokenSupplyType.Infinite)
  .setTreasuryAccountId(treasuryAccountId)
  .setAdminKey(adminKey.publicKey)
  .setSupplyKey(supplyKey.publicKey)
  .freezeWith(client);

// Emitir NFT con CID de metadatos IPFS (máximo 100 bytes en campo metadata)
const creditMetadata = {
  name: "Crédito de Carbono Eggologic #001",
  description: "Offset verificado de lote de compostaje BSF B-2026-W09",
  format: "HIP412@2.0.0",
  properties: {
    methodology: "CDM_AMS-III.F_adaptada",
    batch_id: "B-2026-W09",
    co2e_toneladas: 1.5,
    mrv_data_cid: "ipfs://QmMRVDataCID",
    did_verificador: "did:hedera:testnet:...",
    año_vintage: 2026
  }
};
// Subir creditMetadata JSON a IPFS → obtener CID
const metadataCID = "ipfs://bafkrei..."; // máximo 100 bytes

const mintNftTx = await new TokenMintTransaction()
  .setTokenId(creditTokenId)
  .addMetadata(Buffer.from(metadataCID))
  .freezeWith(client);
```

**Cuando el mintDocumentBlock de Guardian se activa**, maneja todo esto automáticamente — incluyendo subir la VP a IPFS y registrar el CID en el campo memo del token. El código HTS manual anterior es útil para emisión directa fuera del flujo de políticas de Guardian.

---

## Los topics HCS crean un registro de auditoría inmutable por centavos

Crear **topics HCS separados** para cada flujo de eventos permite consultas dirigidas y separación limpia de auditoría:

```javascript
import { TopicCreateTransaction, TopicMessageSubmitTransaction } from "@hashgraph/sdk";

// Crear topics ($0.01 cada uno, única vez)
const topicEntregas = await crearTopic("Eggologic:Entregas");
const topicLotes    = await crearTopic("Eggologic:CierreLotes");
const topicProduccion = await crearTopic("Eggologic:ProduccionHuevos");

// Registrar un evento de entrega ($0.0008 por mensaje)
await new TopicMessageSubmitTransaction()
  .setTopicId(topicEntregas)
  .setMessage(JSON.stringify({
    v: "1.0",
    tipo_evento: "ENTREGA_RECIBIDA",
    delivery_id: "ENT-2026-0301-001",
    supplier_id: "SUP-042",
    kg_brutos: 150.5,
    kg_netos: 138.16,
    puntos_emitidos: 157.40,
    token_mint_tx: "0.0.12345@1709312400.123456789",
    ts: new Date().toISOString()
  }))
  .execute(client);
```

**Buenas prácticas para mensajes HCS:** Mantener bajo **1,024 bytes** para evitar fragmentación. Usar JSON estructurado con campos de versión para compatibilidad futura. Incluir referencias cruzadas (`delivery_id`, `batch_id`, `token_mint_tx`) para trazabilidad. Configurar un `submitKey` en los topics para prevenir inyección no autorizada de mensajes.

Guardian en sí publica VPs a topics HCS como parte de su flujo de trabajo — el `sendToGuardianBlock` con `dataType: "hedera"` maneja esto. Los topics anteriores son para **granularidad de auditoría adicional** más allá de lo que Guardian provee nativamente.

---

## Los costos de transacción son insignificantes a la escala de Eggologic

| Operación | Costo unitario | Volumen mensual | Costo mensual |
|---|---|---|---|
| Mensajes HCS (entregas) | $0.0008 | ~24 | $0.019 |
| Mensajes HCS (producción diaria) | $0.0008 | ~30 | $0.024 |
| Mensajes HCS (cierre de lotes) | $0.0008 | ~4 | $0.003 |
| Mensajes HCS (auditoría misc.) | $0.0008 | ~42 | $0.034 |
| Emisión de tokens fungibles (PUNTOS) | $0.001 | ~24 | $0.024 |
| Transferencias de tokens (a proveedores) | $0.001 | ~24 | $0.024 |
| Emisión de NFTs (créditos ambientales) | $0.02 | ~2–4 | $0.04–0.08 |
| **Total operaciones mensuales** | | | **~$0.17–$0.21** |

Costos de setup inicial: **~$2.53** (dos creaciones de token a $1 cada una, 3–4 creaciones de topic a $0.01 cada una, ~10 asociaciones de token de proveedores a $0.05 cada una). Incluso a **10× el volumen proyectado**, los costos mensuales se mantienen bajo $3. Las tarifas de Hedera denominadas en USD fijo (independientes del precio de HBAR) hacen que el presupuesto sea predecible.

---

## La arquitectura conecta Google Sheets con Guardian a través de middleware Node.js

El flujo de datos para Eggologic es:

```
Operadores de Campo → Google Forms → Google Sheets
                                          ↓
                                Middleware Node.js (Express)
                               /          |           \
                        PostgreSQL    API Guardian    Hedera SDK (directo)
                        (estado de    (envío MRV,    (logs de auditoría
                         sync,        verificación,   HCS, operaciones
                         caché        emisión de      suplementarias
                         off-chain)   tokens)         de tokens)
                                          ↓
                                  Red de Hedera
                             (Tokens HTS + Topics HCS + VPs en IPFS)
```

### Patrón de integración con Google Sheets

```javascript
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import cron from 'node-cron';

const auth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, auth);

async function consultarEntregas() {
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle['Entregas'];
  const rows = await sheet.getRows();

  // Obtener última fila procesada desde PostgreSQL
  const ultimaProcesada = await db.query(
    'SELECT last_row_count FROM sync_state WHERE sheet = $1', ['Entregas']
  );
  const filasNuevas = rows.slice(ultimaProcesada.rows[0]?.last_row_count || 0);

  for (const row of filasNuevas) {
    const datosEntrega = {
      delivery_id: row.get('delivery_id'),
      supplier_id: row.get('supplier_id'),
      kg_brutos: parseFloat(row.get('kg_brutos')),
      pct_impropios: parseFloat(row.get('pct_impropios')),
      kg_netos: parseFloat(row.get('kg_netos')),
      fecha: row.get('fecha'),
      quality_grade: row.get('quality_grade'),
      factor_calidad: parseFloat(row.get('factor_calidad')),
      factor_alianza: parseFloat(row.get('factor_alianza'))
    };

    // Enviar a Guardian
    await enviarEntregaAGuardian(guardianToken, datosEntrega);

    // Registrar en topic de auditoría HCS
    await registrarEventoAuditoria(topicEntregas, {
      tipo_evento: 'ENTREGA_RECIBIDA', ...datosEntrega
    });
  }

  // Actualizar estado de sincronización
  await db.query(
    'UPDATE sync_state SET last_row_count = $1 WHERE sheet = $2',
    [rows.length, 'Entregas']
  );
}

// Consultar cada 5 minutos
cron.schedule('*/5 * * * *', consultarEntregas);
```

**Empezar con polling** (lo más simple). Migrar a un **webhook de Google Apps Script `onFormSubmit`** para tiempo casi-real cuando sea necesario — el trigger de Apps Script envía un HTTP POST a tu endpoint del middleware cada vez que se envía un formulario.

### Stack tecnológico recomendado

| Capa | Tecnología | Notas |
|---|---|---|
| Frontend | **React/Next.js** | Hedera provee un template oficial de dApp CRA con integración de wallets HashPack + Blade |
| Wallet | **HashPack** o **Blade** | Para que los proveedores vean y transfieran tokens |
| Backend | **Node.js + Express** | Cliente API Guardian, lector de Google Sheets, orquestación de tareas |
| Base de datos | **PostgreSQL** | Estado de sync off-chain, caché de auditoría, perfiles de proveedores |
| Cola de tareas | **BullMQ (Redis)** | Procesamiento asíncrono de datos de Sheets, lógica de reintentos para envíos a Guardian |
| Guardian | **Docker auto-hospedado** o **Managed Guardian Service** (SaaS via guardianservice.app) |
| SDK Hedera | **@hashgraph/sdk** | Operaciones directas HCS/HTS complementando a Guardian |
| IPFS | **Web3.Storage** o **Filebase** | Gestionado por Guardian para almacenamiento de VPs |

### Opciones de despliegue de Guardian

Guardian corre como una **plataforma de microservicios basada en Docker** (API Gateway, Guardian Service, Auth Service, Worker Service, MongoDB, NATS, Redis). Existen tres rutas de despliegue:

- **Docker Compose (desarrollo):** `git clone https://github.com/hashgraph/guardian && docker compose up -d`. Configurar `OPERATOR_ID`, `OPERATOR_KEY`, `HEDERA_NET=testnet` en `.env`.
- **Cloud/Kubernetes (producción):** Usar los módulos Terraform de código abierto de TYMLEZ (`github.com/Tymlez/guardian-terraform`) para AWS/GCP.
- **Managed Guardian Service (inicio más rápido):** SaaS en `guardianservice.app` por Envision Blockchain — gestiona infraestructura, actualizaciones, monitoreo. Disponible en Azure Marketplace.

---

## La metodología de compostaje CDM AMS-III.F es la plantilla principal a adaptar

La **Biblioteca de Metodologías** de código abierto de Guardian (50+ políticas pre-construidas en `github.com/hashgraph/guardian/tree/main/Methodology Library`) incluye varias directamente relevantes para Eggologic:

**CDM AMS-III.F: "Evitación de Emisiones de Metano Mediante Compostaje"** es la metodología más directamente aplicable. Cubre el tratamiento aeróbico controlado de residuos orgánicos mediante compostaje, aplica a residuos sólidos municipales y residuos de biomasa de actividades agrícolas/agroindustriales incluyendo estiércol, usa CDM Tool 04 (emisiones por disposición de residuos sólidos), Tool 05 (emisiones de electricidad) y Tool 13 (emisiones del proyecto y fugas por compostaje), y emite créditos CER a razón de 1 CER = 1 tonelada de CO2e.

El enfoque recomendado es **importar el archivo `.policy` de AMS-III.F**, estudiar su estructura de bloques y lógica de cálculo, y luego crear una política personalizada de Eggologic que extienda el MRV de compostaje con seguimiento de conversión de larvas BSF, agregue la capa de cálculo de puntos de incentivo para proveedores, incluya el registro de producción de huevos como documentación de co-beneficios, y use los cálculos de emisiones de compostaje de Tool 13 como base para la cuantificación de créditos de carbono.

Otras políticas de referencia útiles incluyen **Verra VM0044** (gestión de biochar/biomasa residual), **MCER01** (metodología de economía circular para reciclaje), **IWCSH** (mejora de recolección y manejo de residuos) y **SSFLWGRP001** (reducción de GEI por pérdida y desperdicio de alimentos).

---

## Implementaciones reales de Guardian validan la arquitectura

**DOVU** (`dovu.earth`) es el precedente más relevante. Construyeron una plataforma ReFi completa para créditos de carbono agrícolas en Hedera usando Guardian. Su arquitectura — fuentes de datos externas (Typeform, datos de granja) → middleware ("Nova") → política Guardian → emisión de tokens — refleja directamente lo que Eggologic necesita. Los archivos de políticas de código abierto de DOVU en `github.com/dovuofficial/guardian-policies` proporcionan ejemplos concretos de implementación. Están potenciando la infraestructura de auditoría para una **iniciativa de agricultura regenerativa de $1 mil millones** en EE.UU.

**TYMLEZ** fue la primera empresa en lanzar un proyecto basado en Guardian en Hedera Mainnet (julio 2022), trabajando con el Gobierno de Queensland para reporte verificado de emisiones. Sus módulos Terraform de código abierto (`github.com/Tymlez/guardian-terraform`) y archivos de políticas Guardian (`github.com/Tymlez/guardian-policies`) son referencias de grado producción. Su patrón de arquitectura — IoT/sensores → ingesta de datos → validación → MRV Guardian → emisión de tokens — mapea al camino de integración IoT eventual de Eggologic.

**EcoGuard** (por The Hashgraph Group + PwC) cubre reporte ESG empresarial incluyendo iniciativas de economía circular, seguimiento del ciclo de vida de productos y reducción de residuos — validando el caso de uso de economía circular en Guardian.

---

## Hoja de ruta de implementación por fases

**Fase 1 (Semanas 1–3): Fundación.** Desplegar Guardian en testnet (Docker o MGS SaaS). Diseñar EntregaSchema y RegistroProveedorSchema en el constructor visual de políticas de Guardian. Construir el middleware Node.js con polling de Google Sheets. Probar el pipeline completo usando la API de dry-run de Guardian (`PUT /api/v1/policies/{id}/dry-run`), que simula todo el flujo de trabajo sin tocar Hedera.

**Fase 2 (Semanas 4–6): Integración.** Implementar el pipeline completo — Sheets → middleware → Guardian → emisión de tokens PUNTOS. Agregar LoteBatchSchema y ProduccionSchema. Construir el dashboard React con integración de wallet HashPack para que los proveedores vean su saldo de PUNTOS. Configurar PostgreSQL para estado de sync y caché de auditoría off-chain.

**Fase 3 (Semanas 7–9): Créditos ambientales.** Importar y adaptar la política CDM AMS-III.F para créditos de compostaje. Implementar el CreditoAmbientalSchema y el flujo de emisión de NFTs. Agregar el flujo de aprobación del verificador. Realizar pruebas de extremo a extremo del pipeline residuo-a-crédito.

**Fase 4 (Semanas 10+): Producción.** Migrar a mainnet. Implementar webhooks de Apps Script para flujo de datos en tiempo casi-real. Desplegar Guardian en la nube via Terraform si es auto-hospedado. Explorar sensores IoT (balanzas, sondas de temperatura) alimentando directamente al `externalDataBlock` de Guardian para dMRV automatizado.

## Conclusión

El modelo de economía circular de Eggologic mapea limpiamente a la arquitectura de políticas de Guardian, con cada etapa (entrega → lote → producción → crédito) convirtiéndose en un schema y paso de flujo de trabajo distinto conectado por vínculos `setRelationshipsBlock`. La **perspectiva arquitectónica crítica** es que Guardian maneja las partes difíciles — creación de VCs, firma criptográfica, almacenamiento IPFS, cadenas de procedencia HCS y emisión de tokens HTS — mientras que el middleware Node.js solo necesita transformar filas de Google Sheets en JSON y enviarlas mediante POST a un único endpoint REST. Con **$0.20/mes en costos de transacción**, la capa blockchain agrega un costo marginal cercano a cero. La existencia de CDM AMS-III.F como metodología de compostaje lista para usar significa que Eggologic no necesita inventar su propio marco de cuantificación de carbono — adapta un estándar reconocido, lo cual fortalece significativamente la credibilidad de cualquier crédito ambiental emitido. Comenzar con el modo dry-run de Guardian en testnet significa que toda la política puede ser validada de extremo a extremo antes de que una sola transacción toque mainnet.
