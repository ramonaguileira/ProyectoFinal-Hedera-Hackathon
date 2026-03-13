interface Props {
  eggocoinsBalance: number
  totalDeliveries: number
  kgAccumulated: number
  carbonCoinTarget: number
}

export default function SummaryCards({ eggocoinsBalance, totalDeliveries, kgAccumulated, carbonCoinTarget }: Props) {
  const progress = Math.min((kgAccumulated / carbonCoinTarget) * 100, 100)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* EGGOCOINS Balance */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-500">Saldo EGGOCOINS</span>
          <div className="w-9 h-9 rounded-lg bg-eggo-green/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-eggo-green" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
              <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">E</text>
            </svg>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">{eggocoinsBalance.toLocaleString()}</p>
        <p className="text-xs text-eggo-green mt-1 font-medium">+354 esta semana</p>
      </div>

      {/* Total Deliveries */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-500">Total Entregas</span>
          <div className="w-9 h-9 rounded-lg bg-eggo-earth/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-eggo-earth" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4" />
              <path d="M12 15l-3 3 3 3" />
              <path d="M12 21V15" />
            </svg>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">{totalDeliveries}</p>
        <p className="text-xs text-gray-400 mt-1">8 este mes</p>
      </div>

      {/* CarbonCoin Progress */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-500">Próximo CARBONCOIN</span>
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
        </div>
        <p className="text-lg font-bold text-gray-900">
          {kgAccumulated.toFixed(0)} <span className="text-sm font-normal text-gray-400">/ {carbonCoinTarget} kg</span>
        </p>
        <div className="mt-3 w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-eggo-green to-emerald-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">{(carbonCoinTarget - kgAccumulated).toFixed(0)} kg restantes para NFT</p>
      </div>
    </div>
  )
}
