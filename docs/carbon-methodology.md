# Eggologic — Carbon Credit Methodology

## CDM AMS-III.F: Avoidance of Methane Emissions Through Composting

Eggologic adapts the CDM AMS-III.F methodology from the UNFCCC for quantifying carbon credits from organic waste diversion.

### How It Applies

AMS-III.F covers controlled aerobic treatment of organic waste via composting. It applies to municipal solid waste and biomass waste from agricultural/agro-industrial activities. The methodology uses CDM Tool 04 (emissions from solid waste disposal), Tool 05 (electricity emissions), and Tool 13 (project and leakage emissions from composting).

Credits are issued at 1 CER = 1 tonne CO₂e avoided.

### Conservative Factor: 70%

Eggologic applies a 70% discount on gross input kg before accumulating toward carbon credits:

```
kg_adjusted = kg_ingreso × 0.70
```

This conservative factor covers three variables:
- **Moisture content**: Restaurant organic waste is typically 60-80% water (water does not generate methane)
- **DOC variability**: The degradable organic carbon fraction varies by waste composition
- **MCF correction**: Methane Correction Factor depends on local landfill conditions in Uruguay

### Threshold

```
When Σ kg_adjusted ≥ 1,000 kg → mint 1 CARBONCOIN NFT (= 1 tCO₂e avoided)
```

At current volumes (300-600 kg/week gross), this generates approximately 1 CARBONCOIN every 3-6 weeks.

### Why Conservative?

It is preferable to issue fewer credits that are unimpeachable than more credits that are questionable. The equivalence can be refined with real waste composition data and local landfill condition measurements once sufficient operational history exists.

## Other Reference Methodologies

- **Verra VM0044** — Biochar/waste biomass management
- **MCER01** — Circular economy methodology for recycling
- **IWCSH** — Improved waste collection and handling
- **SSFLWGRP001** — GHG reduction from food loss and waste
