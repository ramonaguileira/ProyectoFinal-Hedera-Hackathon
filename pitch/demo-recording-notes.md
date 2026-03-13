# Eggologic — Notas de Grabación del Demo

## Guía técnica para grabar el demo del hackathon

---

## ANTES DE GRABAR: Setup técnico

### 1. Tener corriendo en testnet:

```bash
# Verificar que los tokens existen en HashScan
# https://hashscan.io/testnet/token/{EGGOCOINS_TOKEN_ID}
# https://hashscan.io/testnet/token/{CARBONCOIN_TOKEN_ID}

# Verificar que los topics HCS tienen mensajes
# https://hashscan.io/testnet/topic/{HCS_TOPIC_DELIVERIES}
```

### 2. Tener abierto en pestañas del navegador:

- **Pestaña 1:** Google Form de entregas (listo para llenar)
- **Pestaña 2:** Google Sheet ENTREGAS (mostrando filas existentes)
- **Pestaña 3:** Dashboard React (http://localhost:3000)
- **Pestaña 4:** HashScan — página del token EGGOCOINS
- **Pestaña 5:** HashScan — página del topic HCS de entregas
- **Pestaña 6:** Terminal con el middleware corriendo (logs visibles)

### 3. Datos pre-cargados:

Antes de grabar, tener al menos 3-4 entregas previas ya procesadas para que el dashboard muestre datos reales y el progreso del acumulador de CARBONCOIN no esté en cero.

---

## SECUENCIA DEL DEMO (screencast)

### Toma 1: Llenar el Google Form (10 seg)

**Qué mostrar:**
- Abrir Google Form
- Llenar: Proveedor → "Restaurante La Esquina", kg_brutos → 80, pct_impropios → 5%, destino → BSF
- Click enviar

**Tip:** Tener los datos ya pensados para no dudar. Usá un proveedor con nombre real y creíble.

### Toma 2: Ver la fila en Google Sheets (5 seg)

**Qué mostrar:**
- Cambiar a la pestaña del Sheet
- La nueva fila aparece con delivery_id auto-generado
- kg_netos ya calculado (80 × 0.95 = 76 kg)

**Tip:** Si el Form no actualiza el Sheet instantáneamente, pre-cargá la fila antes y simplemente mostrala como si acabara de llegar.

### Toma 3: El middleware detecta la nueva fila (10 seg)

**Qué mostrar:**
- Terminal con logs del middleware
- Línea tipo: `[INFO] New delivery detected: E-20260315-04`
- Línea tipo: `[INFO] Submitting to Guardian: 76 kg netos, factor_calidad=1.2`
- Línea tipo: `[INFO] EGGOCOINS minted: 100.32 tokens → Restaurante La Esquina`

**Tip:** Si el polling tarda 5 min, podés triggerearlo manualmente para el demo o usar logs pre-grabados. Nadie espera 5 minutos en un video de hackathon.

### Toma 4: Dashboard actualizado (10 seg)

**Qué mostrar:**
- Abrir el dashboard React
- Saldo de EGGOCOINS del proveedor actualizado
- Tabla de entregas recientes con la nueva entrada
- Barra de progreso del acumulador de CARBONCOIN (ej: 760/1000 kg)

**Tip:** Hacer refresh del dashboard en cámara para mostrar que es datos vivos, no estáticos.

### Toma 5: Verificación en HashScan (10 seg)

**Qué mostrar:**
- Abrir HashScan, página del token EGGOCOINS
- Mostrar la transacción más reciente de TokenMint
- Click en la transacción → ver el monto y el timestamp

**Tip:** Zoom in al navegador (Ctrl/Cmd + +) para que los IDs sean legibles en el video.

---

## DEMO ALTERNATIVO: Flujo completo con script

Si preferís un demo más controlado, usá el script `demo-flow.js`:

```bash
# Este script ejecuta todo el pipeline de una vez
node scripts/demo-flow.js --testnet --verbose

# Output esperado:
# ✅ Delivery E-20260315-04 created
# ✅ Guardian VC signed: did:hedera:testnet:...
# ✅ EGGOCOINS minted: 100.32 → 0.0.SUPPLIER_ID
# ✅ HCS message published to topic 0.0.TOPIC_ID
# ✅ Accumulator: 760/1000 kg toward next CARBONCOIN
```

Grabá la terminal mientras corre y narrá encima.

---

## TIPS DE EDICIÓN

1. **Cortar silencios y tiempos de carga** — Nadie quiere ver un spinner
2. **Agregar anotaciones/flechas** en pantalla señalando los datos importantes (token ID, montos, etc.)
3. **Transiciones simples** — Fade o cut directo, nada fancy
4. **Música de fondo** suave — Recomendación: buscar "lo-fi background music royalty free" en YouTube
5. **Subtítulos** — Muy importante si tu acento en inglés es fuerte. YouTube los genera automáticos, pero revisalos

---

## HERRAMIENTAS GRATUITAS RECOMENDADAS

| Necesidad | Herramienta | Link |
|---|---|---|
| Grabar pantalla + cámara | OBS Studio | obsproject.com |
| Grabar pantalla rápido | Loom (gratis 5min) | loom.com |
| Editar video | DaVinci Resolve (gratis) | blackmagicdesign.com |
| Editar video (simple) | CapCut (gratis) | capcut.com |
| Subtítulos automáticos | YouTube Studio | studio.youtube.com |
| Diagramas | Excalidraw | excalidraw.com |
| Thumbnails | Canva (gratis) | canva.com |
