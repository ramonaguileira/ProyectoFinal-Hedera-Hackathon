interface Props {
  kgAccumulated: number
  target: number
}

export default function CarbonCoinProgress({ kgAccumulated, target }: Props) {
  const progress = Math.min((kgAccumulated / target) * 100, 100)
  const circumference = 2 * Math.PI * 70
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Progreso CARBONCOIN NFT</h2>

      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Circular Progress */}
        <div className="relative w-48 h-48 flex-shrink-0">
          <svg className="w-48 h-48 -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="#f0fdf4" strokeWidth="12" />
            <circle
              cx="80" cy="80" r="70"
              fill="none"
              stroke="url(#carbonGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="carbonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">{progress.toFixed(0)}%</span>
            <span className="text-xs text-gray-400 mt-1">{kgAccumulated.toFixed(0)} kg</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Acumulado</p>
            <p className="text-2xl font-bold text-gray-900">{kgAccumulated.toFixed(1)} kg</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Objetivo</p>
            <p className="text-2xl font-bold text-eggo-green">{target.toLocaleString()} kg</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Restante</p>
            <p className="text-xl font-semibold text-eggo-earth">{(target - kgAccumulated).toFixed(1)} kg</p>
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              Al ritmo actual, minteo estimado en ~3 semanas
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
