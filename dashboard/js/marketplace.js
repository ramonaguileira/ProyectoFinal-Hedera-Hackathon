// Eggologic Dashboard — Screen 1 (marketplace.html) Data Binding
// Mostly static — only the bottom stats are dynamic

async function loadMarketplace() {
  // These stats are derived from waste processing data
  // H2O saved ≈ waste_kg × 8.9 liters (composting water savings factor)
  // m² reforested is a placeholder / future metric

  try {
    if (GuardianAPI.isLoggedIn()) {
      const supply = await HederaMirror.getEggocoinSupply();
      // Estimate water savings from total EGGOCOIN minted (1 EGO ≈ 1 kg waste)
      const wasteKg = supply.totalSupply;
      const h2oLiters = wasteKg * 8.9;

      if (h2oLiters >= 1000) {
        UI.setText('stat-h2o', `${(h2oLiters / 1000).toFixed(1)}k`);
      } else {
        UI.setText('stat-h2o', UI.fmt(h2oLiters, 0));
      }
    } else {
      // Show estimated values even without login (public Hedera data)
      const supply = await HederaMirror.getEggocoinSupply();
      const h2oLiters = supply.totalSupply * 8.9;
      UI.setText('stat-h2o', `${UI.fmt(h2oLiters, 0)}`);
    }
  } catch (e) {
    console.error('Marketplace stats error:', e);
    UI.setText('stat-h2o', '1,202');
  }

  // m² reforested — static for hackathon
  UI.setText('stat-reforested', '450');
}

function onLogin() {
  loadMarketplace();
}

// Load stats on page load (uses public Hedera API, no auth needed)
document.addEventListener('DOMContentLoaded', () => {
  loadMarketplace();
});
