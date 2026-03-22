// Eggologic Dashboard — Screen 3 (wallet.html) Data Binding
// Global data (supply, holders) loads for everyone; user data (balance, txs) needs login

/**
 * Load public wallet data — supply + all holders from Hedera Mirror Node (public API).
 */
async function loadGlobalWallet() {
  UI.showLoading('hero-supply');
  UI.showSkeletonRows('all-holders', 2);

  try {
    const [supply, allBalances, citSupply] = await Promise.all([
      HederaMirror.getEggocoinSupply(),
      HederaMirror.getAllBalances(),
      HederaMirror.getCITSupply(),
    ]);

    // Compute monthly growth %: average tokens minted per month vs prior base
    const monthsLive = Math.max(1, (Date.now() - supply.createdTimestamp) / (30.44 * 24 * 60 * 60 * 1000));
    const monthlyMint = supply.totalSupply / monthsLive;
    const prevSupply = supply.totalSupply - monthlyMint;
    const growthPct = prevSupply > 0
      ? (monthlyMint / prevSupply * 100).toFixed(1)
      : supply.totalSupply.toFixed(1);
    UI.setText('hero-supply', `+${growthPct}%`);
    renderHolders(allBalances);

    // CIT card — global view
    UI.setText('cit-row1-value', `${UI.fmt(supply.totalSupply)} $EGGO`);
    UI.setText('cit-row2-value', String(citSupply));

    // CIT mint log
    const citNfts = await HederaMirror.getAllCITNfts();
    renderCITLog(citNfts);
  } catch (e) {
    console.error('Global wallet error:', e);
  }
}

/**
 * Load user-specific data — personal balance + transaction history (needs login).
 */
async function loadUserWallet() {
  if (!GuardianAPI.isLoggedIn()) return;

  const user = GuardianAPI.currentUser();
  UI.showLoading('hero-balance');
  UI.showSkeletonRows('tx-history', 4);

  try {
    const [balance, txs, userCIT] = await Promise.all([
      HederaMirror.getEggocoinBalance(user.hedera),
      HederaMirror.getTransactions(user.hedera, 25),
      HederaMirror.getUserCIT(user.hedera),
    ]);

    UI.setText('hero-balance', `${UI.fmt(balance)} $EGGO`);
    const heroHedera = document.getElementById('hero-hedera');
    if (heroHedera) heroHedera.innerHTML = `<a href="${CONFIG.HASHSCAN_URL}/account/${user.hedera}" target="_blank" rel="noopener" class="hover:text-[#C1EDC7] transition-colors no-underline text-inherit">${user.hedera} <span class="material-symbols-outlined text-[10px]">open_in_new</span></a>`;
    renderTxHistory(txs);

    // CIT card — switch to user view
    UI.setText('cit-row1-label', 'Your Composted');
    UI.setText('cit-row1-value', `${UI.fmt(balance)} $EGGO`);
    UI.setText('cit-row2-label', 'Your CIT');
    UI.setText('cit-row2-value', String(userCIT));
  } catch (e) {
    console.error('User wallet error:', e);
    UI.setText('hero-balance', 'Error loading');
  }
}

function renderCITLog(nfts) {
  const container = document.getElementById('cit-log');
  if (!container) return;

  if (nfts.length === 0) {
    container.innerHTML = '<p class="text-stone-400 text-sm text-center py-4">No CIT minted yet</p>';
    return;
  }

  // Map known accounts
  const knownAccounts = {};
  CONFIG.ACCOUNTS.forEach(a => { knownAccounts[a.hedera] = a.role; });

  container.innerHTML = nfts.map(nft => {
    const role = knownAccounts[nft.account] || nft.account;
    const date = new Date(nft.timestamp);
    const accountUrl = `${CONFIG.HASHSCAN_URL}/account/${nft.account}`;

    return `
      <a href="${accountUrl}" target="_blank" rel="noopener" class="flex items-center justify-between py-3 px-4 hover:bg-stone-50 rounded-xl transition-all border border-transparent hover:border-stone-100 no-underline text-inherit group">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#C1EDC7]/30 flex items-center justify-center">
            <span class="material-symbols-outlined text-secondary text-lg">verified</span>
          </div>
          <div>
            <p class="text-sm font-bold text-primary">CIT #${nft.serial}</p>
            <p class="text-[10px] text-stone-400">${role} &bull; ${UI.timeAgo(date)}</p>
          </div>
        </div>
        <div class="text-right flex items-center gap-2">
          <div>
            <p class="text-xs font-bold text-secondary">1 tonne CO&#8322;</p>
            <span class="text-[8px] bg-[#C1EDC7]/40 text-[#10381E] px-2 py-0.5 rounded-full font-bold uppercase">minted</span>
          </div>
          <span class="material-symbols-outlined text-stone-300 group-hover:text-primary text-sm transition-colors">open_in_new</span>
        </div>
      </a>
    `;
  }).join('');
}

function _renderTxRow(tx) {
  const amount = tx.eggocoin.amount;
  const isCredit = amount > 0;
  const icon = isCredit ? 'add_circle' : 'remove_circle';
  const amountColor = isCredit ? 'text-secondary' : 'text-error';
  const label = tx.memo || (isCredit ? 'EGGOCOIN Received' : 'EGGOCOIN Sent');
  const shortTx = tx.txId.split('-')[0] + '...' + tx.txId.slice(-6);
  const txUrl = `${CONFIG.HASHSCAN_URL}/transaction/${tx.txId}`;

  return `
    <a href="${txUrl}" target="_blank" rel="noopener" class="flex items-center justify-between py-4 px-4 hover:bg-stone-50 rounded-xl transition-all border border-transparent hover:border-stone-100 no-underline text-inherit group">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-full ${isCredit ? 'bg-[#C1EDC7]/30' : 'bg-stone-100'} flex items-center justify-center">
          <span class="material-symbols-outlined ${isCredit ? 'text-secondary' : 'text-stone-500'} text-xl">${icon}</span>
        </div>
        <div>
          <p class="text-sm font-bold text-primary">${label}</p>
          <p class="text-[10px] text-stone-400 font-mono">${shortTx} • ${UI.timeAgo(tx.date)}</p>
        </div>
      </div>
      <div class="text-right flex items-center gap-2">
        <div>
          <p class="text-sm font-bold ${amountColor}">${isCredit ? '+' : ''}${UI.fmt(amount)} $EGGO</p>
          <span class="text-[8px] bg-[#C1EDC7]/40 text-[#10381E] px-2 py-0.5 rounded-full font-bold uppercase">completed</span>
        </div>
        <span class="material-symbols-outlined text-stone-300 group-hover:text-primary text-sm transition-colors">open_in_new</span>
      </div>
    </a>
  `;
}

const TX_PAGE_SIZE = 5;

function renderTxHistory(txs) {
  const container = document.getElementById('tx-history');
  if (!container) return;

  if (txs.length === 0) {
    container.innerHTML = '<p class="text-stone-400 text-sm text-center py-12">No EGGOCOIN transactions found</p>';
    return;
  }

  window._allTxs = txs;
  window._txPage = 0;
  _renderTxPage();
}

function _renderTxPage() {
  const container = document.getElementById('tx-history');
  if (!container || !window._allTxs) return;

  const txs = window._allTxs;
  const page = window._txPage;
  const totalPages = Math.ceil(txs.length / TX_PAGE_SIZE);
  const start = page * TX_PAGE_SIZE;
  const visible = txs.slice(start, start + TX_PAGE_SIZE);

  const prevDisabled = page === 0;
  const nextDisabled = page >= totalPages - 1;

  container.innerHTML = visible.map(_renderTxRow).join('') + `
    <div class="flex items-center justify-between pt-2">
      <button onclick="_txNav(-1)" ${prevDisabled ? 'disabled' : ''} class="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center transition-all ${prevDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-stone-100 hover:border-stone-300'}">
        <span class="material-symbols-outlined text-primary text-lg">chevron_left</span>
      </button>
      <span class="text-[10px] font-bold text-stone-400 uppercase tracking-widest">${start + 1}–${start + visible.length} of ${txs.length}</span>
      <button onclick="_txNav(1)" ${nextDisabled ? 'disabled' : ''} class="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center transition-all ${nextDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-stone-100 hover:border-stone-300'}">
        <span class="material-symbols-outlined text-primary text-lg">chevron_right</span>
      </button>
    </div>
  `;
}

function _txNav(dir) {
  const totalPages = Math.ceil(window._allTxs.length / TX_PAGE_SIZE);
  const next = window._txPage + dir;
  if (next < 0 || next >= totalPages) return;
  window._txPage = next;
  _renderTxPage();
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
      const accountUrl = `${CONFIG.HASHSCAN_URL}/account/${b.account}`;
      return `
        <a href="${accountUrl}" target="_blank" rel="noopener" class="group flex items-center justify-between p-6 bg-surface-container-lowest hover:bg-surface-container-highest transition-all rounded-2xl hover:shadow-xl hover:-translate-y-1 border border-stone-100 hover:border-primary/10 duration-300 no-underline text-inherit">
          <div class="flex items-center gap-6">
            <div class="w-14 h-14 rounded-full ${isKnown ? 'bg-secondary-container' : 'bg-stone-100'} flex items-center justify-center">
              <span class="material-symbols-outlined text-primary text-2xl">${isKnown ? 'verified_user' : 'account_balance_wallet'}</span>
            </div>
            <div>
              <h5 class="font-bold text-primary">${role}</h5>
              <p class="text-sm text-on-surface-variant font-mono">${b.account}</p>
            </div>
          </div>
          <div class="text-right flex items-center gap-2">
            <p class="font-headline text-xl text-primary">${UI.fmt(b.balance)} $EGGO</p>
            <span class="material-symbols-outlined text-stone-300 group-hover:text-primary text-sm transition-colors">open_in_new</span>
          </div>
        </a>
      `;
    }).join('');
}

function onLogin() {
  loadUserWallet();
}

// Always load global data; load user-specific data if already logged in
document.addEventListener('DOMContentLoaded', () => {
  loadGlobalWallet();
  if (GuardianAPI.isLoggedIn()) loadUserWallet();
});
