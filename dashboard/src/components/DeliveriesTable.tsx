import type { Delivery } from '../data'

const gradeColors: Record<string, string> = {
  A: 'bg-green-100 text-green-800',
  B: 'bg-blue-100 text-blue-800',
  C: 'bg-amber-100 text-amber-800',
  D: 'bg-red-100 text-red-800',
}

interface Props {
  deliveries: Delivery[]
}

export default function DeliveriesTable({ deliveries }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-green-50">
        <h2 className="text-lg font-semibold text-gray-900">Entregas Recientes</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-green-50/50">
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Proveedor</th>
              <th className="text-right px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kg Brutos</th>
              <th className="text-right px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">% Imp.</th>
              <th className="text-right px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kg Netos</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Calidad</th>
              <th className="text-right px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Eggocoins</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {deliveries.map((d) => (
              <tr key={d.id} className="hover:bg-green-50/30 transition-colors">
                <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{d.fecha}</td>
                <td className="px-3 py-3 font-medium text-gray-900 whitespace-nowrap">{d.proveedor}</td>
                <td className="px-3 py-3 text-right text-gray-700 tabular-nums">{d.kg_brutos.toFixed(1)}</td>
                <td className="px-3 py-3 text-right text-gray-700 tabular-nums">{d.pct_impropios.toFixed(1)}%</td>
                <td className="px-3 py-3 text-right font-medium text-gray-900 tabular-nums">{d.kg_netos.toFixed(1)}</td>
                <td className="px-3 py-3 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${gradeColors[d.quality_grade]}`}>
                    {d.quality_grade}
                  </span>
                </td>
                <td className="px-3 py-3 text-right font-semibold text-eggo-green tabular-nums">+{d.eggocoins}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
