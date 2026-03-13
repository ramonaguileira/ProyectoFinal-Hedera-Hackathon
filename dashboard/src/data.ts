export interface Delivery {
  id: number
  fecha: string
  proveedor: string
  kg_brutos: number
  pct_impropios: number
  kg_netos: number
  quality_grade: 'A' | 'B' | 'C' | 'D'
  eggocoins: number
}

export const deliveries: Delivery[] = [
  { id: 1, fecha: '2026-03-05', proveedor: 'Granja Los Álamos', kg_brutos: 120, pct_impropios: 2.1, kg_netos: 117.5, quality_grade: 'A', eggocoins: 235 },
  { id: 2, fecha: '2026-03-04', proveedor: 'Cooperativa San Martín', kg_brutos: 85, pct_impropios: 5.8, kg_netos: 80.1, quality_grade: 'B', eggocoins: 120 },
  { id: 3, fecha: '2026-03-03', proveedor: 'Avícola del Sur', kg_brutos: 200, pct_impropios: 1.5, kg_netos: 197.0, quality_grade: 'A', eggocoins: 394 },
  { id: 4, fecha: '2026-03-02', proveedor: 'Granja Los Álamos', kg_brutos: 95, pct_impropios: 8.2, kg_netos: 87.2, quality_grade: 'C', eggocoins: 87 },
  { id: 5, fecha: '2026-03-01', proveedor: 'BioRestos Patagonia', kg_brutos: 150, pct_impropios: 3.0, kg_netos: 145.5, quality_grade: 'A', eggocoins: 291 },
  { id: 6, fecha: '2026-02-28', proveedor: 'EcoGranja Mendoza', kg_brutos: 60, pct_impropios: 12.5, kg_netos: 52.5, quality_grade: 'D', eggocoins: 39 },
  { id: 7, fecha: '2026-02-27', proveedor: 'Cooperativa San Martín', kg_brutos: 110, pct_impropios: 4.0, kg_netos: 105.6, quality_grade: 'B', eggocoins: 158 },
  { id: 8, fecha: '2026-02-26', proveedor: 'Avícola del Sur', kg_brutos: 180, pct_impropios: 1.8, kg_netos: 176.8, quality_grade: 'A', eggocoins: 354 },
]

export const summary = {
  eggocoinsBalance: 1678,
  totalDeliveries: 42,
  kgAccumulated: 762.3,
  carbonCoinTarget: 1000,
}
