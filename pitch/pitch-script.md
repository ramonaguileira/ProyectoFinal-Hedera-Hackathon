# Eggologic — Pitch Script & Video Production Guide

## Hedera Hello Future: Apex Hackathon 2026
### Track: Sustainability | Bounty: Hiero

---

## FORMATO DEL VIDEO

| Parámetro | Recomendación |
|---|---|
| Duración | **3:00–4:30 minutos** (sweet spot para hackathons) |
| Formato | Pantalla compartida + cámara frontal (picture-in-picture) |
| Idioma | **Inglés** (audiencia global, jueces internacionales) |
| Resolución | 1080p mínimo |
| Subtítulos | Sí — agrega subtítulos en inglés (YouTube auto-captions o manual) |
| Música | Suave de fondo, que no distraiga (royalty-free) |
| Herramientas | OBS Studio (gratis) o Loom para grabar |

---

## ESTRUCTURA DEL VIDEO (4 minutos)

### APERTURA — El Gancho (0:00 – 0:30)

**[PANTALLA: Foto real del hub de Eggologic con residuos llegando]**

> "Every day, restaurants throw away organic waste that ends up in landfills, producing methane — a greenhouse gas 80 times more potent than CO₂. But what if that waste could become eggs, compost, and verified carbon credits?
>
> I'm [Tu Nombre] from Melo, Uruguay, and this is Eggologic — a real, operating circular economy hub where we turn restaurant waste into protein, eggs, and auditable environmental credits on Hedera."

**NOTA DE DIRECCIÓN:** Hablá directo a la cámara. Mostrá energía y convicción. La palabra clave acá es **"real"** — repetila. Los jueces ven muchos conceptos teóricos; vos tenés algo funcionando.

---

### SECCIÓN 1 — El Problema + La Operación Real (0:30 – 1:15)

**[PANTALLA: Diagrama simple del ciclo: Residuo → BSF → Huevos → Compost]**

> "1.3 billion tonnes of food are wasted globally every year. In Latin America, there's no incentive for restaurants to separate waste, and no way to verify what happens after collection.
>
> Eggologic solves both problems. We collect organic waste from restaurants, feed it to Black Soldier Fly larvae — which become high-protein feed for our laying hens — and the remaining organic matter becomes compost for local agriculture."

**[PANTALLA: Fotos reales — baldes de residuo, larvas BSF, gallinas, huevos, compost]**

> "We process 300 to 600 kilograms per week. This is not a concept — it's running today in Uruguay."

**NOTA DE DIRECCIÓN:** Mostrá 3-4 fotos reales rápidas de la operación. Cada foto 2-3 segundos. El impacto visual de ver la operación real es enorme frente a jueces que ven mockups todo el día.

---

### SECCIÓN 2 — La Solución Blockchain (1:15 – 2:15)

**[PANTALLA: Diagrama de arquitectura — Google Sheets → Middleware → Guardian → Hedera]**

> "The challenge is: how do you prove this cycle actually happened? How does a restaurant know their waste didn't end up in a landfill? And how do you generate credible carbon credits from composting?
>
> That's where Hedera comes in."

**[PANTALLA: Demo en vivo del dashboard — o screencast preparado]**

> "Our field operator fills a simple Google Form — just weight and contamination percentage. Takes 60 seconds.
>
> Behind the scenes, our Node.js middleware picks up that data, sends it to a Guardian MRV policy, which creates a cryptographically signed Verifiable Credential and calculates the supplier's reward."

**[PANTALLA: HashScan mostrando la transacción de mint de EGGOCOINS en testnet]**

> "The supplier receives EGGOCOINS — a fungible token on Hedera Token Service. Clean deliveries earn more tokens. Frequent suppliers get a bonus multiplier. The formula runs on-chain inside Guardian's calculate block."

**[PANTALLA: HashScan mostrando el NFT CARBONCOIN]**

> "When we accumulate 1,000 kilograms of verified diverted waste — adjusted by a conservative 70% factor — the system mints a CARBONCOIN NFT. One NFT equals one tonne of CO₂ equivalent avoided, following the CDM AMS-III.F composting methodology from the United Nations."

**NOTA DE DIRECCIÓN:** Esta es la sección más técnica. Mantené el ritmo — no te detengas en detalles de código. Los jueces quieren ver que funciona, no cómo funciona internamente. Si podés, mostrá una transacción real en HashScan con el token ID visible.

---

### SECCIÓN 3 — Por Qué Hedera (2:15 – 2:50)

**[PANTALLA: Tabla de costos con los $0.20/mes resaltados]**

> "Why Hedera? Three reasons.
>
> First: cost. Our entire monthly blockchain operation costs 20 cents. Not 20 dollars — 20 cents. At ten times our current volume, it's still under 3 dollars.
>
> Second: Guardian. It's the only open-source MRV policy engine that handles Verifiable Credentials, IPFS storage, and token minting in a single workflow. We didn't have to build any of that from scratch.
>
> Third: credibility. HCS gives us an immutable audit trail. Any verifier can reconstruct exactly how every EGGOCOINS reward and every CARBONCOIN credit was calculated. The trustchain is transparent and permanent."

**NOTA DE DIRECCIÓN:** Hacé una pausa dramática después de "20 cents." Dejá que el número impacte. Este es uno de tus datos más fuertes.

---

### SECCIÓN 4 — Demo Rápida (2:50 – 3:40)

**[PANTALLA: Screencast del flujo completo]**

> "Let me show you the pipeline in action."

**Mostrar en secuencia rápida (10 segundos cada paso):**

1. **Google Form** → Llenar una entrega: proveedor, 80kg brutos, 5% impropios, destino BSF
2. **Google Sheet** → Mostrar que la fila apareció con kg_netos calculados automáticamente
3. **Terminal/Logs** → El middleware detectó la nueva fila y la envió a Guardian
4. **Dashboard React** → El proveedor ve su saldo de EGGOCOINS actualizado
5. **HashScan** → La transacción de mint visible en el explorador de Hedera testnet

> "From Google Form to verified token in under 5 minutes. The field operator's workflow doesn't change — they still fill the same form they've been using. But now every kilogram is verified, every reward is traceable, and every carbon credit is auditable."

**NOTA DE DIRECCIÓN:** Practicá este demo varias veces antes de grabar. Si algo falla en vivo, usá un screencast pre-grabado. Es mejor un demo grabado que funciona que uno en vivo que se traba.

---

### CIERRE — Impacto + Llamada a Acción (3:40 – 4:10)

**[PANTALLA: Volvé a la cámara frontal, con el diagrama del ciclo de fondo]**

> "Eggologic is the first waste-to-BSF-to-eggs circular economy tokenized on Hedera Guardian. It's running today in Uruguay, and the architecture scales to any organic waste hub in Latin America — or anywhere in the world.
>
> We're building a future where every kilogram of waste diverted from a landfill is verified, rewarded, and counted toward real climate action.
>
> Thank you — and let's build the circular economy on Hedera."

**[PANTALLA: Logo Eggologic + links al repo GitHub y HashScan]**

---

## CHECKLIST PRE-GRABACIÓN

### Assets que necesitás tener listos ANTES de grabar:

- [ ] **Fotos reales de la operación** (mínimo 4-5): residuos llegando, larvas BSF, gallinas, huevos, compost
- [ ] **Tokens creados en testnet**: EGGOCOINS y CARBONCOIN con IDs reales en HashScan
- [ ] **HCS Topics creados**: al menos 1 topic con mensajes de ejemplo visibles en HashScan
- [ ] **Dashboard React funcionando**: aunque sea básico, mostrando saldo de EGGOCOINS
- [ ] **Demo pre-grabado de backup**: screencast del flujo completo por si el demo en vivo falla
- [ ] **Diagrama de arquitectura**: versión limpia del diagrama ASCII del README (o Excalidraw)
- [ ] **Diagrama del ciclo circular**: Residuo → BSF → Huevos → Compost (visual, colorido)

### Tips de grabación:

- [ ] Fondo limpio y buena iluminación si mostrás la cámara
- [ ] Micrófono externo o auriculares con mic (el audio es MÁS importante que el video)
- [ ] Practicar el script 3 veces completo antes de grabar
- [ ] Grabar en secciones — no intentar todo de una toma
- [ ] Velocidad de habla: más lento de lo que creés necesario (especialmente si el inglés no es tu lengua nativa)

---

## NOTAS PARA LA SUBMISSION EN STACKUP

Además del video, la submission en StackUp probablemente requiera:

| Campo | Qué poner |
|---|---|
| **Project Name** | Eggologic — Tokenizing the Circular Economy |
| **Track** | Sustainability |
| **Bounty** | Hiero |
| **Short Description** | A real circular economy hub in Uruguay that tokenizes organic waste-to-BSF-to-eggs operations on Hedera, using Guardian MRV for verifiable supplier rewards (EGGOCOINS) and carbon credits (CARBONCOIN NFTs) at $0.20/month |
| **GitHub Repo** | https://github.com/YOUR_USERNAME/eggologic-hedera |
| **Demo Video** | YouTube link |
| **Hedera Services Used** | HTS (Fungible + NFT), HCS, Guardian, IPFS |
| **Testnet References** | Token IDs + Topic IDs en HashScan |

### Criterios de evaluación típicos en hackathons Hedera:

1. **Innovation** — ¿Es un caso de uso nuevo? ✅ Primer residuo-BSF-huevos en Guardian
2. **Technical Implementation** — ¿Funciona? ¿Usa bien los servicios de Hedera? ✅ HTS + HCS + Guardian
3. **Real-World Impact** — ¿Resuelve un problema real? ✅ Operación funcionando en Uruguay
4. **Presentation** — ¿El video y repo están bien hechos? ← Esto estamos preparando
5. **Scalability** — ¿Puede crecer? ✅ Arquitectura replicable a cualquier hub de residuos

---

## VERSIÓN COMPACTA DEL PITCH (2 minutos — por si necesitás una versión corta)

> "Eggologic is a real circular economy hub in Uruguay. We take organic waste from restaurants, feed it to Black Soldier Fly larvae, those larvae feed our hens which produce eggs, and the remaining matter becomes compost.
>
> The problem: no one can verify this cycle happened, and restaurants have no incentive to separate waste properly.
>
> Our solution uses Hedera. Every delivery triggers EGGOCOINS — fungible tokens that reward clean, frequent waste deliveries. The formula runs inside a Guardian MRV policy that creates Verifiable Credentials for every step. When we accumulate enough verified waste, the system mints a CARBONCOIN NFT — one tonne of CO₂ avoided, following the UN's CDM AMS-III.F composting methodology.
>
> Total blockchain cost: 20 cents per month. The entire audit trail lives on HCS topics. Any verifier can trace any credit back to the original delivery.
>
> This is running today. Not a concept — a real operation processing 300 to 600 kilos per week. Thank you."
