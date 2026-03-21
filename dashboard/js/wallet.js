// Eggologic Dashboard — Screen 3 (wallet.html) Data Binding
// Loads: balance, transaction history, all holders

async function loadWallet() {
  if (!GuardianAPI.isLoggedIn()) return;

  const user = GuardianAPI.currentUser();
  UI.showLoading('hero-balance');
  UI.showLoading('hero-supply');
  UI.showSkeletonRows('tx-history', 4);
  UI.showSkeletonRows('all-holders', 2);

  try {
    const [balance, supply, txs, allBalances] = await Promise.all([
      HederaMirror.getEggocoinBalance(user.hedera),
      HederaMirror.getEggocoinSupply(),
      HederaMirror.getTransactions(user.hedera, 25),
      HederaMirror.getAllBalances(),
    ]);

    // Hero balance
    UI.setText('hero-balance', `${UI.fmt(balance)} EGO`);
    UI.setText('hero-hedera', user.hedera);
    UI.setText('hero-supply', `${UI.fmt(supply.totalSupply)} EGO`);

    // Transaction history
    renderTxHistory(txs);

    // All holders
    renderHolders(allBalances);

  } catch (e) {
    console.error('Wallet load error:', e);
    UI.setText('hero-balance', 'Error loading');
  }
}

function renderTxHistory(txs) {
  const container = document.getElementById('tx-history');
  if (!container) return;

  if (txs.length === 0) {
    container.innerHTML = '<p class="text-stone-400 text-sm text-center py-12">No EGGOCOIN transactions found</p>';
    return;
  }

  container.innerHTML = txs.map(tx => {
    const amount = tx.eggocoin.amount;
    const isCredit = amount > 0;
    const icon = isCredit ? 'add_circle' : 'remove_circle';
    const amountColor = isCredit ? 'text-secondary' : 'text-error';
    const label = tx.memo || (isCredit ? 'EGGOCOIN Received' : 'EGGOCOIN Sent');
    const shortTx = tx.txId.split('-')[0] + '...' + tx.txId.slice(-6);

    return `
      <div class="flex items-center justify-between py-4 px-4 hover:bg-stone-50 rounded-xl transition-all border border-transparent hover:border-stone-100">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full ${isCredit ? 'bg-[#C1EDC7]/30' : 'bg-stone-100'} flex items-center justify-center">
            <span class="material-symbols-outlined ${isCredit ? 'text-secondary' : 'text-stone-500'} text-xl">${icon}</span>
          </div>
          <div>
            <p class="text-sm font-bold text-primary">${label}</p>
            <p class="text-[10px] text-stone-400 font-mono">${shortTx} • ${UI.timeAgo(tx.date)}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-sm font-bold ${amountColor}">${isCredit ? '+' : ''}${UI.fmt(amount)} EGO</p>
          <span class="text-[8px] bg-[#C1EDC7]/40 text-[#10381E] px-2 py-0.5 rounded-full font-bold uppercase">completed</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderHolders(balances) {
  const container = document.getElementById('all-holders');
  if (!container) return;

  if (balances.length === 0) {
    container.innerHTML = '<p class="text-stone-400 text-sm text-center py-12">No holders found</p>';
    return;
  }

  // Map account IDs to known roles
  const knownAccounts = {};
  CONFIG.ACCOUNTS.forEach(a => { knownAccounts[a.hedera] = a.role; });

  container.innerHTML = balances
    .filter(b => b.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .map(b => {
      const role = knownAccounts[b.account] || 'Holder';
      const isKnown = !!knownAccounts[b.account];
      return `
        <div class="group flex items-center justify-between p-6 bg-white hover:bg-surface-container-highest transition-all rounded-2xl hover:shadow-xl hover:-translate-y-1 border border-stone-100 hover:border-primary/10 duration-300">
          <div class="flex items-center gap-6">
            <div class="w-14 h-14 rounded-full ${isKnown ? 'bg-secondary-container' : 'bg-stone-100'} flex items-center justify-center">
              <span class="material-symbols-outlined text-primary text-2xl">${isKnown ? 'verified_user' : 'account_balance_wallet'}</span>
            </div>
            <div>
              <h5 class="font-bold text-primary">${role}</h5>
              <p class="text-sm text-on-surface-variant font-mono">${b.account}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-headline text-xl text-primary">${UI.fmt(b.balance)} EGO</p>
          </div>
        </div>
      `;
    }).join('');
}

function onLogin() {
  loadWallet();
}

document.addEventListener('DOMContentLoaded', () => {
  if (GuardianAPI.isLoggedIn()) loadWallet();
});
