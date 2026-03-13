import Header from './components/Header'
import SummaryCards from './components/SummaryCards'
import DeliveriesTable from './components/DeliveriesTable'
import CarbonCoinProgress from './components/CarbonCoinProgress'
import { deliveries, summary } from './data'

export default function App() {
  return (
    <div className="min-h-screen bg-eggo-bg">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <SummaryCards
          eggocoinsBalance={summary.eggocoinsBalance}
          totalDeliveries={summary.totalDeliveries}
          kgAccumulated={summary.kgAccumulated}
          carbonCoinTarget={summary.carbonCoinTarget}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <DeliveriesTable deliveries={deliveries} />
          </div>
          <div>
            <CarbonCoinProgress
              kgAccumulated={summary.kgAccumulated}
              target={summary.carbonCoinTarget}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-green-100 bg-white/50 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-gray-400">
          EggoLogic &middot; Economía Circular en Hedera &middot; Hackathon 2026
        </div>
      </footer>
    </div>
  )
}
