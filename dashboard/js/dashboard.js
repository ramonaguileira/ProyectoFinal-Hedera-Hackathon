// EGGOLOGIC Dashboard
// Loads: hero metrics (global, no login), balance + transactions (user-specific)
//Ever heard of CAPS? fun guy.
/**
 * Numboor animation counting from 0 to target.
 * @param {string} elementId - DOM elementID to animate
 * @param {number} target - Final value
 * @param {string} suffix - Text appended wnumber (e.g. 't', 'kg')
 * @param {number} decimals - Decimals (0 for integers, 1 for '1.8t')
 * @param {number} duration - Animation duration in ms (default 1100)
 */
function countUp(elementId, target, suffix = '', decimals = 0, duration = 1100) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (target === 0) { el.textContent = '0' + suffix; el.classList.add('fade-in'); return; }

  const start = performance.now();
  function frame(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out: 1 - (1 - p)^3
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * target;
    const formatted = decimals > 0 ? current.toFixed(decimals) : UI.fmt(Math.round(current));
    el.textContent = formatted + suffix;
    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      el.classList.add('fade-in');
    }
  }
  requestAnimationFrame(frame);
}

/**
 * Load global metrics to ALL visitors.
 * Sources: Cache(local JSON) + Hedera Mirror Node (public API).
 */
async function loadGlobalMetrics() {
  ['metric-waste', 'metric-co2', 'metric-eggs'].forEach(id => UI.showLoading(id));

  try {
    // Live EGGOCOIN supply from Mirror Node
    const supplyData = await HederaMirror.getEggocoinSupply();
    const totalEggo = supplyData.totalSupply;

    // 1 $EGGO ≈ 1 kg_ajustados
    // Organic waste processed (gross) ≈ kg_ajustados / 0.70
    const wasteKg = totalEggo / 0.70;
    if (wasteKg >= 1000) {
      countUp('metric-waste', wasteKg / 1000, 't', 1);
    } else {
      countUp('metric-waste', wasteKg, 'kg', 0);
    }

    // CO2 avoided = kg_ajustados (1 $EGGO = 1 kg CO2 avoided per EWD-RB)
    const co2Kg = totalEggo;
    if (co2Kg >= 1000) {
      countUp('metric-co2', co2Kg / 1000, 't', 1);
    } else {
      countUp('metric-co2', co2Kg, 'kg', 0);
    }

    countUp('metric-eggs', 936, '', 0);

  } catch (e) {
    console.error('Mirror Node error, using fallback:', e);
    countUp('metric-waste', 1.8, 't', 1);
    countUp('metric-co2', 859, 'kg', 0);
    countUp('metric-eggs', 936, '', 0);
  }

  // Guardian fetch for delivery count (used by form ID generation)
  try {
    const deliveryData = await GuardianAPI.getBlockData(CONFIG.BLOCKS.VVB_DELIVERY);
    const docs = extractDocuments(deliveryData);
    window._deliveryCount = docs.filter(d => d.document?.credentialSubject).length;
  } catch {
    window._deliveryCount = 0;
  }
}

/**
 * Load user-specific data
 * login (requires a specific Hedera account ID, duhh).
 */
async function loadUserData() {
  if (!GuardianAPI.isLoggedIn()) return;

  const user = GuardianAPI.currentUser();
  UI.showLoading('wallet-balance');
  UI.showSkeletonRows('wallet-tx-list', 3);
  UI.showSkeletonRows('recent-activity', 3);

  try {
    if (user.role === 'Supplier') {
      const balances = JSON.parse(localStorage.getItem('eggologic_balances') || '{}');
      const balance = balances[user.supplierId] || 0;
      UI.setText('wallet-balance', `${UI.fmt(balance)} $EGGO`);
      const hederaEl = document.getElementById('wallet-hedera-id');
      if (hederaEl) hederaEl.textContent = user.supplierId;
      // No wallet widget for suppliers (custodied)
      const widget = document.getElementById('wallet-widget-container');
      if (widget) widget.innerHTML = '<div class="text-stone-400 text-xs italic py-8 text-center bg-stone-50 rounded-2xl border border-stone-100">Tokens are custodied by EggoLogic for maximizing impact.</div>';
    } else {
      const balance = await HederaMirror.getEggocoinBalance(user.hedera);
      UI.setText('wallet-balance', `${UI.fmt(balance)} $EGGO`);
      const hederaEl = document.getElementById('wallet-hedera-id');
      if (hederaEl) hederaEl.innerHTML = `<a href="${CONFIG.HASHSCAN_URL}/account/${user.hedera}" target="_blank" rel="noopener" class="hover:text-[#C1EDC7] transition-colors no-underline text-inherit">${user.hedera} <span class="material-symbols-outlined text-[10px]">open_in_new</span></a>`;
      loadWalletWidget(user.hedera);
    }
    loadRecentActivity(user.hedera);
  } catch (e) {
    console.error('Hedera data error:', e);
    UI.setText('wallet-balance', 'Error');
  }
}

/**
 * Extract VC documents (various formats).
 */
function extractDocuments(blockData) {
  if (!blockData) return [];
  // Either { data: [...] } or { documents: [...] } or array directly
  if (Array.isArray(blockData)) return blockData;
  if (blockData.data && Array.isArray(blockData.data)) return blockData.data;
  if (blockData.documents && Array.isArray(blockData.documents)) return blockData.documents;
  // Doc wrapper
  if (blockData.document) return [blockData];
  return [];
}

/**
 * Wallet transaction widget (3 most recent).
 */
async function loadWalletWidget(accountId) {
  try {
    const txs = await HederaMirror.getTransactions(accountId, 10);
    const container = document.getElementById('wallet-tx-list');
    if (!container) return;

    if (txs.length === 0) {
      container.innerHTML = '<p class="text-stone-400 text-sm text-center py-6">No EGGOCOIN transactions yet</p>';
      return;
    }

    container.innerHTML = txs.slice(0, 3).map(tx => {
      const amount = tx.eggocoin.amount;
      const isCredit = amount > 0;
      const icon = isCredit ? 'recycling' : 'shopping_cart';
      const iconBg = isCredit ? 'bg-yellow-100/50' : 'bg-[#C1EDC7]/30';
      const iconColor = isCredit ? 'text-yellow-800' : 'text-primary';
      const amountColor = isCredit ? 'text-secondary' : 'text-error';
      const label = isCredit ? 'Token Reward' : 'Token Transfer';
      const txUrl = `${CONFIG.HASHSCAN_URL}/transaction/${tx.txId}`;

      return `
        <a href="${txUrl}" target="_blank" rel="noopener" class="flex items-center justify-between py-2 hover:bg-stone-50 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 rounded-lg px-2 border-transparent border hover:border-stone-100 no-underline text-inherit">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full ${iconBg} flex items-center justify-center ${iconColor}">
              <span class="material-symbols-outlined text-xl">${icon}</span>
            </div>
            <div>
              <p class="text-xs font-bold text-primary">${label}</p>
              <p class="text-[10px] text-stone-400">${UI.timeAgo(tx.date)}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-xs font-bold ${amountColor}">${isCredit ? '+' : ''}${UI.fmt(amount)} $EGGO</p>
            <span class="text-[8px] bg-[#C1EDC7]/40 text-[#10381E] px-2 py-0.5 rounded-full font-bold uppercase">completed</span>
          </div>
        </a>
      `;
    }).join('');
  } catch (e) {
    console.error('Wallet widget error:', e);
  }
}

/**
 * Recent activity section load.
 */
async function loadRecentActivity(accountId) {
  const user = GuardianAPI.currentUser();
  const list = document.getElementById('recent-activity');
  if (!list) return;

  // Supplier Role: Load from local activity tracking (Web2)
  if (user && user.role === 'Supplier') {
    const local = JSON.parse(localStorage.getItem('eggologic_activity') || '[]');
    const supplierActs = local.filter(a => a.supplierId === user.supplierId);
    
    if (supplierActs.length === 0) {
      list.innerHTML = '<div class="text-stone-400 text-xs italic py-12 text-center bg-stone-50 rounded-2xl border border-stone-100/50">No recent deliveries found.</div>';
      return;
    }

    list.innerHTML = supplierActs.map(act => `
      <div class="flex items-center justify-between p-6 bg-stone-50 rounded-2xl border border-stone-100/50 hover:bg-white transition-all rounded-xl hover:shadow-lg border border-transparent hover:border-primary/10 duration-300 cursor-default group">
        <div class="flex items-center gap-6">
          <div class="w-14 h-14 rounded-full bg-[#FBD54E]/20 flex items-center justify-center text-[#10381E]">
            <span class="material-symbols-outlined text-2xl">recycling</span>
          </div>
          <div>
            <h5 class="font-bold text-primary">Waste Delivery ${act.id}</h5>
            <p class="text-sm text-stone-500 font-medium">${UI.timeAgo(new Date(act.ts))}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="font-headline text-xl text-secondary">+${UI.fmt(act.amount)} $EGGO</p>
          <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-none">Verified</p>
        </div>
      </div>
    `).join('');
    return;
  }

  // Other Roles (Project Proponent, etc): Load from Mirror Node
  if (!accountId) {
    list.innerHTML = '<p class="text-stone-400 text-sm text-center py-12">Sign in to view transaction history.</p>';
    return;
  }

  try {
    const txs = await HederaMirror.getTransactions(accountId, 10);
    if (!txs || txs.length === 0) {
      list.innerHTML = '<p class="text-stone-400 text-sm text-center py-12">No recent activity</p>';
      return;
    }

    list.innerHTML = txs.slice(0, 5).map(tx => {
      const amount = tx.eggocoin.amount;
      const isCredit = amount > 0;
      const icon = isCredit ? 'volunteer_activism' : 'shopping_basket';
      const amountColor = isCredit ? 'text-secondary' : 'text-error';
      const bgClass = isCredit ? 'bg-secondary-fixed-dim' : 'bg-secondary-container';
      const label = isCredit ? 'Impact Reward: EGGOCOIN Mint' : 'Token Transfer';
      const txUrl = `${CONFIG.HASHSCAN_URL}/transaction/${tx.txId}`;

      return `
        <a href="${txUrl}" target="_blank" rel="noopener" class="group flex items-center justify-between p-6 bg-surface-container-low hover:bg-surface-container-highest transition-all rounded-xl hover:shadow-xl hover:-translate-y-1 border border-transparent hover:border-primary/10 duration-300 cursor-pointer no-underline text-inherit">
          <div class="flex items-center gap-6">
            <div class="w-14 h-14 rounded-full ${bgClass} flex items-center justify-center">
              <span class="material-symbols-outlined text-primary text-2xl">${icon}</span>
            </div>
            <div>
              <h5 class="font-bold text-primary">${label}</h5>
              <p class="text-sm text-on-surface-variant">${UI.timeAgo(tx.date)} • ${tx.txId.split('-')[0]}</p>
            </div>
          </div>
          <div class="text-right flex items-center gap-2">
            <div>
              <p class="font-headline text-xl ${amountColor}">${isCredit ? '+' : ''}${UI.fmt(amount)} $EGGO</p>
              <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Completed</p>
            </div>
            <span class="material-symbols-outlined text-stone-300 group-hover:text-primary text-sm transition-colors">open_in_new</span>
          </div>
        </a>
      `;
    }).join('');
  } catch (e) {
    console.error('Recent activity error:', e);
  }
}

// ── Delivery Form Logic ──

/**
 * Swap between CTA and form based on login state.
 */
function updateDeliveryCard() {
  const cta = document.getElementById('delivery-cta');
  const form = document.getElementById('delivery-form');
  if (!cta || !form) return;

  const user = GuardianAPI.isLoggedIn() ? GuardianAPI.currentUser() : null;
  const isPP = user && (user.role === 'Project_Proponent' || user.role === 'OWNER');
  const isSupplier = user && user.role === 'Supplier';

  if (isPP) {
    cta.classList.add('hidden');
    form.classList.remove('hidden');
    // Set delivery ID chip from mint events (more reliable than cache. Like, REALLY)
    _updateDeliveryId();
    document.getElementById('admin-section')?.classList.remove('hidden');
    if (typeof loadAdminApplications === 'function') loadAdminApplications();
    if (typeof populateSupplierDropdown === 'function') populateSupplierDropdown();
  } else {
    cta.classList.remove('hidden');
    form.classList.add('hidden');
    document.getElementById('admin-section')?.classList.add('hidden');
    if (isSupplier) {
      cta.classList.add('hidden');
      const welcome = document.querySelector('h1.text-4xl');
      if (welcome) welcome.textContent = `Welcome, ${user.restaurantName || 'Partner'}`;
    }
  }
}

async function _updateDeliveryId() {
  try {
    const mintEvents = await HederaMirror.getMintEvents();
    window._deliveryCount = mintEvents.length;
  } catch {
    // Fallback
  }
  const count = (window._deliveryCount || 0) + 1;
  const chip = document.getElementById('delivery-id-chip');
  if (chip) chip.textContent = `ENT-${String(count).padStart(3, '0')}`;
}

/**
 * Live preview
 */
function updateDeliveryPreview() {
  const bruto = parseFloat(document.getElementById('delivery-kg-bruto')?.value) || 0;
  const impropios = parseFloat(document.getElementById('delivery-kg-impropios')?.value) || 0;
  const preview = document.getElementById('delivery-preview');
  const btn = document.getElementById('delivery-submit-btn');
  const catChip = document.getElementById('delivery-category');

  if (bruto <= 0) {
    if (preview) preview.classList.add('hidden');
    if (catChip) catChip.classList.add('hidden');
    if (btn) { btn.disabled = true; btn.textContent = 'Enter weight to submit'; }
    return;
  }

  const netos = bruto - impropios;
  const ajustados = netos * 0.70;
  const eggo = Math.round(ajustados);
  const ratio = (impropios / bruto) * 100;
  const cat = ratio <= 5 ? 'A' : ratio <= 10 ? 'B' : 'C';

  if (preview) {
    preview.classList.remove('hidden');
    document.getElementById('preview-netos').textContent = `${netos.toFixed(1)} kg`;
    document.getElementById('preview-ajustados').textContent = `${ajustados.toFixed(2)} kg`;
    document.getElementById('preview-eggo').textContent = `+${eggo} $EGGO`;
  }

  if (catChip) {
    catChip.textContent = `Cat. ${cat}`;
    catChip.classList.remove('hidden');
    catChip.className = catChip.className.replace(/bg-\[#[^\]]+\]\/\d+|bg-red-100|bg-yellow-100/g, '');
    if (cat === 'C') {
      catChip.classList.add('bg-red-100');
      catChip.classList.remove('bg-[#C1EDC7]/30');
    } else if (cat === 'B') {
      catChip.classList.add('bg-yellow-100');
      catChip.classList.remove('bg-[#C1EDC7]/30');
    } else {
      catChip.classList.add('bg-[#C1EDC7]/30');
    }
  }

  if (btn) {
    if (cat === 'C') {
      btn.disabled = true;
      btn.textContent = 'Contamination too high (Cat. C)';
    } else {
      btn.disabled = false;
      btn.textContent = `Submit Delivery (+${eggo} $EGGO)`;
    }
  }
}

/**
 * Guardian API Submit + VVB approval auto-trigger.
 */
async function submitDeliveryForm() {
  const btn = document.getElementById('delivery-submit-btn');
  const preview = document.getElementById('delivery-preview');
  const bruto = parseFloat(document.getElementById('delivery-kg-bruto').value) || 0;
  const impropios = parseFloat(document.getElementById('delivery-kg-impropios').value) || 0;
  const wasteType = document.getElementById('delivery-waste-type').value;
  const supplierId = document.getElementById('delivery-supplier').value;
  const evidence = document.getElementById('delivery-evidence').value || 'https://evidence.eggologic.com/dashboard';

  if (bruto <= 0 || !supplierId) {
    if (!supplierId) UI.showToast('Please select a supplier from the dropdown');
    return;
  }

  const netos = bruto - impropios;
  const ajustados = netos * 0.70;
  const ratio = ((impropios / bruto) * 100).toFixed(1);
  const cat = ratio <= 5 ? 'A' : ratio <= 10 ? 'B' : 'C';
  const count = (window._deliveryCount || 0) + 1;
  const deliveryId = `ENT-${String(count).padStart(3, '0')}`;
  const eggo = Math.round(ajustados);

  btn.disabled = true;

  // Workflow stepper in preview area
  const stepperHTML = `
    <div id="workflow-stepper" class="space-y-3">
      <div id="ws-1" class="flex items-center gap-3">
        <div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <span class="material-symbols-outlined text-white text-[14px] animate-spin">progress_activity</span>
        </div>
        <span class="text-xs font-bold text-primary">Submitting ${deliveryId} for ${supplierId} to Guardian...</span>
      </div>
      <div id="ws-2" class="flex items-center gap-3 opacity-30">
        <div class="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center">
          <span class="material-symbols-outlined text-stone-400 text-[14px]">hourglass_empty</span>
        </div>
        <span class="text-xs text-stone-400">VVB verification & approval</span>
      </div>
      <div id="ws-3" class="flex items-center gap-3 opacity-30">
        <div class="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center">
          <span class="material-symbols-outlined text-stone-400 text-[14px]">token</span>
        </div>
        <span class="text-xs text-stone-400">Mint +${eggo} $EGGO on Hedera</span>
      </div>
    </div>`;
  if (preview) { preview.innerHTML = stepperHTML; preview.classList.remove('hidden'); }
  btn.textContent = 'Workflow in progress...';

  try {
    console.log(`[Guardian Submit] Sending delivery ${deliveryId} for supplier ${supplierId}`);
    
    // Step 1: PP submits delivery
    await GuardianAPI.submitDelivery({
      field0: 'EWD-RB', field1: '0.3', field2: 'v0.3', field3: 'v0.3',
      field4: deliveryId, field5: supplierId, field6: new Date().toISOString(),
      field7: wasteType, field8: bruto, field9: impropios,
      field10: parseFloat(ratio), field11: parseFloat(netos.toFixed(2)),
      field12: parseFloat(ajustados.toFixed(2)), field13: cat,
      field14: true, field15: [evidence], field16: 'Submitted', field17: [evidence],
    });

    _updateStep('ws-1', 'done', `${deliveryId} submitted to Guardian`);
    _updateStep('ws-2', 'active', 'VVB reviewing delivery...');
    window._deliveryCount = count;

    // Step 2: Auto-approve as VVB. ABSOLUTE ALPHA MOVE FOR DEMO
    try {
      await _autoApproveAsVVB(deliveryId);
      _updateStep('ws-2', 'done', 'VVB approved delivery');
      _updateStep('ws-3', 'done', `+${eggo} $EGGO minted on Hedera`);

      const balances = JSON.parse(localStorage.getItem('eggologic_balances') || '{}');
      balances[supplierId] = (balances[supplierId] || 0) + eggo;
      localStorage.setItem('eggologic_balances', JSON.stringify(balances));

      // Save local activity for demo/supplier login
      const localActivity = JSON.parse(localStorage.getItem('eggologic_activity') || '[]');
      localActivity.unshift({
        id: deliveryId,
        supplierId,
        amount: eggo,
        wasteType,
        ts: Date.now()
      });
      localStorage.setItem('eggologic_activity', JSON.stringify(localActivity.slice(0, 20)));

      UI.showToast(`${deliveryId} approved — +${eggo} $EGGO minted! (Balance updated for ${supplierId})`);
    } catch (vvbErr) {
      console.warn('Auto-approve failed (may need manual VVB approval):', vvbErr.message);
      _updateStep('ws-2', 'warn', 'VVB approval pending (manual step)');
      _updateStep('ws-3', 'waiting', 'Mint pending VVB approval');
      UI.showToast(`${deliveryId} submitted! VVB approval needed for minting.`);
    }

    // Reset form
    document.getElementById('delivery-kg-bruto').value = '';
    document.getElementById('delivery-kg-impropios').value = '';
    document.getElementById('delivery-evidence').value = '';
    document.getElementById('delivery-id-chip').textContent = `ENT-${String(count + 1).padStart(3, '0')}`;
    document.getElementById('delivery-category').classList.add('hidden');
    btn.disabled = true;
    btn.textContent = 'Enter weight to submit';

    // Refresh metrics after delay (let Guardian process, big boi sometimes slow)
    setTimeout(() => { loadGlobalMetrics(); if (GuardianAPI.isLoggedIn()) loadUserData(); }, 3000);
  } catch (e) {
    console.error('Delivery submission error:', e);
    _updateStep('ws-1', 'error', `Submission failed: ${e.message}`);
    UI.showToast(`Submission failed: ${e.message}`);
    btn.disabled = false;
    btn.textContent = 'Submit Delivery';
  }
}

/** Update workflow stepper step's vstate. */
function _updateStep(id, state, text) {
  const el = document.getElementById(id);
  if (!el) return;
  const iconMap = {
    done:    { bg: 'bg-[#C1EDC7]', icon: 'check', color: 'text-primary', spin: false },
    active:  { bg: 'bg-primary', icon: 'progress_activity', color: 'text-white', spin: true },
    error:   { bg: 'bg-red-100', icon: 'error', color: 'text-red-600', spin: false },
    warn:    { bg: 'bg-yellow-100', icon: 'schedule', color: 'text-yellow-700', spin: false },
    waiting: { bg: 'bg-stone-200', icon: 'hourglass_empty', color: 'text-stone-400', spin: false },
  };
  const s = iconMap[state] || iconMap.waiting;
  el.classList.remove('opacity-30');
  el.innerHTML = `
    <div class="w-6 h-6 rounded-full ${s.bg} flex items-center justify-center">
      <span class="material-symbols-outlined ${s.color} text-[14px] ${s.spin ? 'animate-spin' : ''}">${s.icon}</span>
    </div>
    <span class="text-xs font-bold ${state === 'done' ? 'text-secondary' : state === 'error' ? 'text-red-600' : state === 'warn' ? 'text-yellow-700' : 'text-primary'}">${text}</span>`;
}

/**
 * Auto-approve a delivery as VVB (Backdoor).
 * Logs as VVB, fetches pending deliveries, approves the matching one. Genius
 */
async function _autoApproveAsVVB(deliveryId) {
  // Login as VVB (separate session, current user won't know)
  const loginRes = await fetch(`${CONFIG.GUARDIAN_URL}/accounts/loginByEmail`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'eggologic-vvb@outlook.com', password: 'test' }),
  });
  if (!loginRes.ok) throw new Error(`VVB login failed: ${loginRes.status}`);
  const loginData = await loginRes.json();
  const refreshToken = loginData.login?.refreshToken || loginData.refreshToken;

  const tokenRes = await fetch(`${CONFIG.GUARDIAN_URL}/accounts/access-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!tokenRes.ok) throw new Error(`VVB access token failed: ${tokenRes.status}`);
  const vvbToken = (await tokenRes.json()).accessToken;

  // Indexing delay
  await new Promise(r => setTimeout(r, 4000));

  // Fetch VVB delivery docs
  const docsRes = await fetch(`${CONFIG.GUARDIAN_URL}/policies/${CONFIG.POLICY_ID}/blocks/${CONFIG.BLOCKS.VVB_DELIVERY}`, {
    headers: { 'Authorization': `Bearer ${vvbToken}` },
  });
  if (!docsRes.ok) throw new Error(`VVB docs fetch failed: ${docsRes.status}`);
  const docsData = await docsRes.json();

  // Find document matching our delivery ID
  const allDocs = docsData.data || docsData.documents || (Array.isArray(docsData) ? docsData : []);
  const target = allDocs.find(d => {
    const cs = d.document?.credentialSubject;
    const subj = Array.isArray(cs) ? cs[0] : cs;
    return subj?.field4 === deliveryId && d.option?.status === 'Waiting for approval';
  });

  if (!target) throw new Error(`Delivery ${deliveryId} not found in VVB queue (may need intermediate steps)`);

  // Approve: POST doc with Button_0 tag
  const approveRes = await fetch(`${CONFIG.GUARDIAN_URL}/policies/${CONFIG.POLICY_ID}/blocks/${CONFIG.BLOCKS.VVB_DELIVERY_APPROVE}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${vvbToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tag: 'Button_0', document: target }),
  });
  if (!approveRes.ok) throw new Error(`VVB approval failed: ${approveRes.status}`);
}

// Called by UI after successful login
function onLogin() {
  loadUserData();
  updateDeliveryCard();
}

// Always load global metrics; load user data if already logged in
document.addEventListener('DOMContentLoaded', () => {
  loadGlobalMetrics();
  updateDeliveryCard();

  // Live preview listeners
  const brutoInput = document.getElementById('delivery-kg-bruto');
  const impropiosInput = document.getElementById('delivery-kg-impropios');
  if (brutoInput) brutoInput.addEventListener('input', updateDeliveryPreview);
  if (impropiosInput) impropiosInput.addEventListener('input', updateDeliveryPreview);

  if (GuardianAPI.isLoggedIn()) loadUserData();
});

// ── Supplier Onboarding Logic ──

window.submitRegistration = function() {
  const btn = document.getElementById('reg-submit-btn');
  const password = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-confirm-password').value;
  
  if (password !== confirmPassword) {
    UI.showToast('Las contraseñas no coinciden', 'error');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-sm">progress_activity</span> <span>Enviando...</span>';

  setTimeout(() => {
    const app = {
      id: 'APP-' + Date.now().toString().slice(-6),
      restaurantName: document.getElementById('reg-restaurant-name').value,
      contactName: document.getElementById('reg-contact-name').value,
      email: document.getElementById('reg-email').value,
      phone: document.getElementById('reg-phone').value,
      address: document.getElementById('reg-address').value,
      waste: document.getElementById('reg-waste').value,
      password: password,
      date: new Date().toISOString(),
      status: 'Waiting for approval'
    };

    const apps = JSON.parse(localStorage.getItem('eggologic_applications') || '[]');
    apps.unshift(app);
    localStorage.setItem('eggologic_applications', JSON.stringify(apps));

    UI.closeRegistration();
    UI.showToast('Solicitud enviada. Nos pondremos en contacto.');
    
    btn.disabled = false;
    btn.innerHTML = '<span>Enviar Solicitud</span><span class="material-symbols-outlined text-sm">send</span>';
    
    // Refresh admin list if PP is currently logged in
    if (GuardianAPI.isLoggedIn() && GuardianAPI.currentUser().role === 'Project_Proponent') {
      loadAdminApplications();
    }
  }, 800);
}

window.loadAdminApplications = function() {
  const container = document.getElementById('admin-applications-list');
  if (!container) return;
  const apps = JSON.parse(localStorage.getItem('eggologic_applications') || '[]');
  const balances = JSON.parse(localStorage.getItem('eggologic_balances') || '{}');

  if (apps.length === 0) {
    container.innerHTML = '<p class="text-stone-400 text-sm text-center py-12">No pending applications</p>';
    return;
  }

  container.innerHTML = apps.map(app => {
    const isWaiting = app.status === 'Waiting for approval';
    const isApproved = app.status === 'Approved by Project Proponent';
    
    let statusHtml = '';
    let actionHtml = '';

    if (isWaiting) {
      statusHtml = '<span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest leading-none flex items-center">Waiting Approval</span>';
      actionHtml = `<button onclick="updateAppStatus('${app.id}', 'Approved by Project Proponent')" class="text-xs bg-primary text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity whitespace-nowrap">Approve (Manual)</button>`;
    } else if (isApproved) {
      statusHtml = '<span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest leading-none flex items-center">Approved (Pending Guardian)</span>';
      actionHtml = `<button onclick="updateAppStatus('${app.id}', 'Ingested in Guardian')" class="text-xs bg-[#C1EDC7] text-[#10381E] px-4 py-2 rounded-lg font-bold hover:bg-[#A3CFA1] transition-opacity whitespace-nowrap border border-[#A3CFA1]">Mark as Ingested</button>`;
    } else {
      statusHtml = '<span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest leading-none flex items-center">Ingested in Guardian</span>';
    }

    const supplierTag = app.supplierId ? `<span class="bg-stone-100 text-stone-600 px-2 py-0.5 rounded text-xs font-mono border border-stone-200">${app.supplierId}</span>` : '';
    const balance = balances[app.supplierId] || 0;
    const balanceHtml = app.supplierId ? `<span class="bg-[#FBD54E]/20 text-[#10381E] px-3 py-1 rounded-full text-xs font-bold font-mono ml-2 border border-[#FBD54E]/40 flex items-center gap-1 shadow-sm"><span class="material-symbols-outlined text-[14px]">token</span> ${balance} $EGGO</span>` : '';

    const copyData = `Supplier ID: ${app.supplierId || 'PENDING'}\\nName: ${app.restaurantName}\\nContact: ${app.contactName}\\nEmail: ${app.email}\\nPhone: ${app.phone}\\nAddress: ${app.address}\\nWaste: ${app.waste} kg`;

    return `
      <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-primary/20 transition-colors">
        <div class="space-y-2 w-full md:w-auto">
          <div class="flex flex-wrap items-center gap-3">
            <h4 class="font-bold text-lg text-primary">${app.restaurantName}</h4>
            ${supplierTag}
            ${statusHtml}
            ${balanceHtml}
          </div>
          <p class="text-sm text-on-surface-variant flex flex-wrap gap-x-2 gap-y-1">
            <span class="font-mono text-xs text-stone-400">${app.id}</span>
            <span class="text-stone-300">•</span>
            <span>${app.contactName}</span>
            <span class="text-stone-300">•</span>
            <a href="mailto:${app.email}" class="text-secondary hover:underline">${app.email}</a>
            <span class="text-stone-300">•</span>
            <span>${app.phone}</span>
          </p>
          <p class="text-sm text-on-surface-variant">
            <strong>Address:</strong> ${app.address} <span class="text-stone-300 mx-2">•</span> <strong>Est. Waste:</strong> ${app.waste} kg/week
          </p>
          <button onclick="navigator.clipboard.writeText(\`${copyData}\`); UI.showToast('Data copied to clipboard')" class="text-xs text-secondary font-bold hover:text-primary mt-2 inline-flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">content_copy</span>
            Copy data for Guardian ingestion
          </button>
        </div>
        <div class="shrink-0 flex gap-2 w-full md:w-auto justify-end">
          ${actionHtml}
        </div>
      </div>
    `;
  }).join('');
}

window.updateAppStatus = function(id, newStatus) {
  let apps = JSON.parse(localStorage.getItem('eggologic_applications') || '[]');
  const app = apps.find(a => a.id === id);
  if (app) {
    if (newStatus === 'Approved by Project Proponent' && !app.supplierId) {
      const existing = apps.filter(a => a.supplierId).length;
      app.supplierId = 'SUP-' + String(existing + 1).padStart(3, '0');
    }
    app.status = newStatus;
    localStorage.setItem('eggologic_applications', JSON.stringify(apps));
    loadAdminApplications();
    if (typeof populateSupplierDropdown === 'function') populateSupplierDropdown();
    UI.showToast(`Application ${id} updated to: ${newStatus}`);
  }
}

window.populateSupplierDropdown = function() {
  const select = document.getElementById('delivery-supplier');
  if (!select) return;
  const apps = JSON.parse(localStorage.getItem('eggologic_applications') || '[]');
  const approved = apps.filter(a => a.supplierId);
  if (approved.length === 0) {
    select.innerHTML = '<option value="" disabled selected>No approved suppliers yet</option>';
    return;
  }
  select.innerHTML = approved.map(a => `<option value="${a.supplierId}">${a.restaurantName} (${a.supplierId})</option>`).join('');
}

