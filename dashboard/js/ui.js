// EGGOLOGIC Dashboard — Vanilla is GOOD(Login modal, nav, loading states).

const UI = (() => {

  /**
   * Inject HTML login into the page.
   * Call once on DOMContentLoaded. My Vanilla JS professor would be SO proud for this :') 
   */
  function initLoginModal() {
    const modal = document.createElement('div');
    modal.id = 'login-modal';
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm hidden';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl relative">
        <button onclick="UI.closeLogin()" class="absolute top-4 right-4 text-stone-400 hover:text-stone-700">
          <span class="material-symbols-outlined">close</span>
        </button>
        <div class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 bg-[#10381E] rounded-full flex items-center justify-center">
            <span class="material-symbols-outlined text-white">egg</span>
          </div>
          <h2 class="text-2xl font-bold text-[#10381E]">Sign In</h2>
        </div>
        <div id="login-error" class="hidden mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm"></div>
        <div class="space-y-4">
          <div>
            <label class="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1 block">Email</label>
            <input id="login-email" type="email" placeholder="you@email.com" class="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10381E]/20 bg-stone-50" />
          </div>
          <div>
            <label class="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1 block">Password</label>
            <input id="login-password" type="password" value="test" class="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10381E]/20 bg-stone-50" />
          </div>
          <button id="login-submit" onclick="UI.doLogin()" class="w-full py-3 bg-[#10381E] text-white rounded-full font-bold text-sm hover:opacity-90 transition-opacity mt-4">
            Sign In
          </button>
        </div>
        <p class="text-[10px] text-stone-400 text-center mt-6 italic">Project Proponents should use their Guardian email. Registered Restaurants use their application email.</p>
      </div>
    `;
    document.body.appendChild(modal);
  }

  function initRegistrationModal() {
    const modal = document.createElement('div');
    modal.id = 'registration-modal';
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm hidden';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl p-8 md:p-10 w-full max-w-xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onclick="UI.closeRegistration()" class="absolute top-4 right-4 text-stone-400 hover:text-stone-700">
          <span class="material-symbols-outlined">close</span>
        </button>
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-[#FBD54E] rounded-full flex items-center justify-center">
            <span class="material-symbols-outlined text-[#10381E]">storefront</span>
          </div>
          <h2 class="text-2xl font-bold text-[#10381E]">Quiero Ser Parte</h2>
        </div>
        <p class="text-sm text-stone-500 mb-8 border-b border-stone-100 pb-4">Únete a EGGOLOGIC. Completa este formulario para registrar tu restaurante y sumarte a la economía circular real.</p>
        
        <form id="registration-form" onsubmit="event.preventDefault(); window.submitRegistration();" class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Nombre del Restaurante *</label>
              <input id="reg-restaurant-name" type="text" required class="w-full px-4 py-3 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10381E]/20 bg-stone-50" />
            </div>
            <div>
              <label class="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Nombre de Contacto *</label>
              <input id="reg-contact-name" type="text" required class="w-full px-4 py-3 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10381E]/20 bg-stone-50" />
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Correo Electrónico *</label>
              <input id="reg-email" type="email" required class="w-full px-4 py-3 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10381E]/20 bg-stone-50" />
            </div>
            <div>
              <label class="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Número de Teléfono *</label>
              <input id="reg-phone" type="tel" required class="w-full px-4 py-3 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10381E]/20 bg-stone-50" placeholder="+598..." />
            </div>
          </div>

          <div>
            <label class="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Dirección Físico *</label>
            <input id="reg-address" type="text" required class="w-full px-4 py-3 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10381E]/20 bg-stone-50" />
          </div>
          
          <div>
            <label class="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">Desperdicio Orgánico Semanal Estimado (kg) *</label>
            <input id="reg-waste" type="number" min="0" required placeholder="ej. 50" class="w-full px-4 py-3 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10381E]/20 bg-stone-50" />
          </div>

          <div class="flex items-start gap-3 mt-6 pt-4 border-t border-stone-100">
            <input type="checkbox" id="reg-terms" required class="mt-1 w-4 h-4 text-[#10381E] bg-gray-100 border-gray-300 rounded focus:ring-[#10381E]" />
            <label for="reg-terms" class="text-xs text-stone-500 leading-snug">
              Acepto los términos y condiciones de la plataforma y consiento el tratamiento de mis datos personales en cumplimiento estricto con la <a href="https://www.impo.com.uy/bases/leyes/18331-2008" target="_blank" class="font-bold text-[#10381E] hover:underline">Ley No. 18.331 de Protección de Datos Personales</a> de la República Oriental del Uruguay y su decreto reglamentario.
            </label>
          </div>
          
          <button type="submit" id="reg-submit-btn" class="w-full py-4 mt-6 bg-[#10381E] text-white rounded-full font-bold text-sm hover:opacity-90 transition-opacity flex justify-center items-center gap-2 shadow-lg">
            <span>Enviar Solicitud</span>
            <span class="material-symbols-outlined text-sm">send</span>
          </button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }

  function openLogin() {
    document.getElementById('login-modal').classList.remove('hidden');
  }

  function closeLogin() {
    document.getElementById('login-modal').classList.add('hidden');
  }

  function openRegistration() {
    document.getElementById('registration-modal').classList.remove('hidden');
  }

  function closeRegistration() {
    document.getElementById('registration-modal').classList.add('hidden');
    document.getElementById('registration-form').reset();
  }

  async function doLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    const btn = document.getElementById('login-submit');

    errorEl.classList.add('hidden');
    btn.textContent = 'Signing in...';
    btn.disabled = true;

    try {
      await GuardianAPI.login(email, password);
      closeLogin();
      updateAuthUI();
      const user = GuardianAPI.currentUser();
      showToast(`Signed in as ${user.role || 'User'}`);
      // Data load Triggoor
      if (typeof onLogin === 'function') onLogin();
    } catch (e) {
      errorEl.textContent = e.message;
      errorEl.classList.remove('hidden');
    } finally {
      btn.textContent = 'Sign In';
      btn.disabled = false;
    }
  }

  /**
   * Nav bar update auth button for login state.
   */
  function updateAuthUI() {
    const authBtn = document.getElementById('auth-btn');
    if (!authBtn) return;

    if (GuardianAPI.isLoggedIn()) {
      const user = GuardianAPI.currentUser();
      authBtn.innerHTML = `
        <div class="w-6 h-6 rounded-full bg-[#C1EDC7] flex items-center justify-center">
          <span class="material-symbols-outlined text-[14px] text-[#10381E]">person</span>
        </div>
        <span class="text-white text-xs font-semibold">${user.role || 'User'}</span>
        <span class="material-symbols-outlined text-white text-sm cursor-pointer" onclick="event.stopPropagation(); GuardianAPI.logout(); UI.updateAuthUI(); location.reload();">logout</span>
      `;
      authBtn.onclick = null;
    } else {
      authBtn.innerHTML = `
        <div class="w-6 h-6 rounded-full overflow-hidden border border-white/20 bg-white/10 flex items-center justify-center">
          <span class="material-symbols-outlined text-[14px] text-white">person</span>
        </div>
        <span class="text-white text-xs font-semibold">Log In</span>
        <span class="material-symbols-outlined text-white text-sm">keyboard_arrow_down</span>
      `;
      authBtn.onclick = () => UI.openLogin();
    }
  }

  /**
   * Set text (with optional formatting).
   */
  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = value;
      el.classList.add('fade-in');
    }
  }

  /**
   * innerHTML by ID.
   */
  function setHTML(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  /**
   * Show a skeleton loading state inside elements.
   * Chad shimmer animation instead of virgin "···".
   */
  function showLoading(id) {
    const el = document.getElementById(id);
    if (el) {
      el.dataset.original = el.textContent;
      // Light skeleton for elements inside dark stuff
      const isDark = el.closest('.hero-curved-bg, .glass-card, [class*="bg-primary"], [class*="bg-\\[\\#10381E"]');
      const cls = isDark ? 'skeleton-light' : 'skeleton';
      el.innerHTML = `<span class="${cls}" style="display:inline-block;min-width:4rem;height:1em;">&nbsp;</span>`;
    }
  }

  /**
   * Format for numbers with separatoors.
   */
  function fmt(n, decimals = 0) {
    return Number(n).toLocaleString('en-US', { maximumFractionDigits: decimals });
  }

  /**
   * Timestamp to relative time (e.g., "2 hours ago, 1 day ago, 6 FULL YEARS OF MY LIFE ON YOUR TRAIL").
   */
  function timeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  }

  /**
   * Mobile hamburger injection
   */
  function initMobileMenu() {
    // Find desktop nav links
    const nav = document.querySelector('nav');
    if (!nav) return;

    // Hamburger button (4 smol screens)
    const hamburger = document.createElement('button');
    hamburger.id = 'hamburger-btn';
    hamburger.className = 'md:hidden text-white p-2';
    hamburger.innerHTML = '<span class="material-symbols-outlined text-2xl">menu</span>';
    hamburger.setAttribute('aria-label', 'Open menu');

    // Insert hamburger BEFORE auth button (!)
    const authBtn = document.getElementById('auth-btn');
    if (authBtn && authBtn.parentElement) {
      authBtn.parentElement.insertBefore(hamburger, authBtn);
    }

    // Overlay + panel
    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    overlay.id = 'mobile-overlay';

    const panel = document.createElement('div');
    panel.className = 'mobile-menu-panel';
    panel.id = 'mobile-panel';

    // Get current for active state
    const currentPage = location.pathname.split('/').pop() || 'index.html';

    panel.innerHTML = `
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <span class="material-symbols-outlined text-white text-sm">egg</span>
          </div>
          <span class="text-white font-bold">EGGOLOGIC</span>
        </div>
        <button id="mobile-close" class="text-white/60 hover:text-white">
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>
      <nav class="flex flex-col">
        <a href="index.html" class="${currentPage === 'index.html' ? 'nav-active' : ''}">Dashboard</a>
        <a href="impact.html" class="${currentPage === 'impact.html' ? 'nav-active' : ''}">Impact Report</a>
        <a href="wallet.html" class="${currentPage === 'wallet.html' ? 'nav-active' : ''}">Wallet</a>
        <a href="marketplace.html" class="${currentPage === 'marketplace.html' ? 'nav-active' : ''}">Marketplace</a>
      </nav>
      <div id="mobile-auth-slot" class="mt-auto"></div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    // Toggle handlers
    hamburger.addEventListener('click', () => {
      overlay.classList.add('open');
      panel.classList.add('open');
    });
    const closeMenu = () => {
      overlay.classList.remove('open');
      panel.classList.remove('open');
    };
    overlay.addEventListener('click', closeMenu);
    document.getElementById('mobile-close').addEventListener('click', closeMenu);
  }

  /**
   * Page load: login modal + auth state + nav links + mobile menu.
   */
  function init() {
    initLoginModal();
    initRegistrationModal();
    initMobileMenu();
    updateAuthUI();
  }

  /**
   * Show skeleton rows in container (for transaction lists, holder lists, etc.).
   */
  function showSkeletonRows(id, count = 3) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = Array.from({ length: count }, () => `
      <div class="flex items-center justify-between py-4 px-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full skeleton"></div>
          <div class="space-y-2">
            <div class="skeleton" style="width:120px;height:12px;"></div>
            <div class="skeleton" style="width:80px;height:10px;"></div>
          </div>
        </div>
        <div class="text-right space-y-2">
          <div class="skeleton" style="width:60px;height:14px;"></div>
          <div class="skeleton" style="width:50px;height:8px;"></div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Show toast of shame - would've been nice tho...definitely shipping this wen mainnet prod
   */
  function showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    requestAnimationFrame(() => {
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    });
  }

  return { init, initLoginModal, openLogin, closeLogin, openRegistration, closeRegistration, doLogin, updateAuthUI, setText, setHTML, showLoading, showSkeletonRows, showToast, fmt, timeAgo };
})();

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', () => UI.init());
