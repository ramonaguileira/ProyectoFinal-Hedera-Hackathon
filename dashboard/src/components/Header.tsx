import { useState } from 'react'

export default function Header() {
  const [connected, setConnected] = useState(false)

  return (
    <header className="bg-white border-b border-green-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-eggo-green flex items-center justify-center">
            <svg viewBox="0 0 32 32" className="w-6 h-6 text-white" fill="currentColor">
              <ellipse cx="16" cy="18" rx="10" ry="13" />
              <circle cx="13" cy="15" r="1.5" fill="white" />
              <circle cx="19" cy="15" r="1.5" fill="white" />
              <path d="M12 20 Q16 23 20 20" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Eggo<span className="text-eggo-green">Logic</span>
            </h1>
            <p className="text-xs text-gray-500">Portal Proveedores</p>
          </div>
        </div>

        <button
          onClick={() => setConnected(!connected)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            connected
              ? 'bg-eggo-green/10 text-eggo-green-dark border border-eggo-green/30'
              : 'bg-eggo-green text-white hover:bg-eggo-green-dark shadow-md shadow-green-200'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="6" width="20" height="12" rx="3" />
            <path d="M6 10h4M14 10h4M6 14h12" />
          </svg>
          {connected ? '0x7a3f...c821' : 'Connect Wallet'}
        </button>
      </div>
    </header>
  )
}
