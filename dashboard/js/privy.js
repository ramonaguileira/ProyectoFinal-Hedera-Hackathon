// Eggologic — Privy Web2 Login
// Loaded via <script type="module"> in each HTML page
// SDK served by esm.sh (resolves all deps - big headache)
// Headless email OTP (send code → verify code)
//That CAPS dude a fun one - y'all guys should meet him!

let privyClient = null;
let _pendingEmail = null;

async function initPrivy() {
  // Skip init if using placeholder creds
  if (!CONFIG.PRIVY_APP_ID || CONFIG.PRIVY_APP_ID === 'YOUR_PRIVY_APP_ID') {
    console.info('[Privy] No App ID configured — Web2 login disabled');
    return;
  }

  try {
    const PrivyModule = await import('https://esm.sh/@privy-io/js-sdk-core@0.60.0');
    const Privy = PrivyModule.default;
    const LocalStorage = PrivyModule.LocalStorage;

    privyClient = new Privy({
      appId: CONFIG.PRIVY_APP_ID,
      clientId: CONFIG.PRIVY_CLIENT_ID,
      storage: new LocalStorage(),
    });

    // Check if already auth from previous session from sessionStorage flag
    const savedUser = getPrivyUser();
    if (savedUser) {
      window.UI?.updateAuthUI?.();
    }

    // Show Privy login section now that SDK loaded
    const section = document.getElementById('privy-section');
    if (section) section.classList.remove('hidden');
  } catch (e) {
    console.warn('[Privy] SDK failed to load, Web2 login unavailable:', e.message);
  }
}

// Step 1: OTP code2email
async function privySendCode() {
  const emailInput = document.getElementById('privy-email');
  const email = emailInput?.value?.trim();
  if (!email) {
    UI.showToast('Please enter your email');
    return;
  }
  if (!privyClient) {
    UI.showToast('Web2 login unavailable');
    return;
  }

  const btn = document.getElementById('privy-send-btn');
  try {
    if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
    _pendingEmail = email;
    await privyClient.auth.email.sendCode(email);

    // Show OTP input, hide email input
    document.getElementById('privy-email-step')?.classList.add('hidden');
    document.getElementById('privy-otp-step')?.classList.remove('hidden');
    document.getElementById('privy-otp')?.focus();
  } catch (e) {
    UI.showToast('Failed to send code: ' + e.message);
  } finally {
    if (btn) { btn.textContent = 'Send Code'; btn.disabled = false; }
  }
}

// Step 2: OTP Verify
async function privyVerifyCode() {
  const code = document.getElementById('privy-otp')?.value?.trim();
  if (!code || !_pendingEmail) return;

  const btn = document.getElementById('privy-verify-btn');
  try {
    if (btn) { btn.textContent = 'Verifying...'; btn.disabled = true; }
    const authSession = await privyClient.auth.email.loginWithCode(
      _pendingEmail,
      code,
    );

    const user = authSession?.user || privyClient.user;
    setPrivySession({
      id: user?.id || _pendingEmail,
      email: _pendingEmail,
    });
    _pendingEmail = null;

    UI.closeLogin();
    UI.updateAuthUI();
    UI.showToast('Signed in via Privy');
    if (typeof onLogin === 'function') onLogin();
  } catch (e) {
    UI.showToast('Invalid code — try again');
  } finally {
    if (btn) { btn.textContent = 'Verify'; btn.disabled = false; }
  }
}

// Reset the Privy form back to step 1
function privyReset() {
  _pendingEmail = null;
  const emailInput = document.getElementById('privy-email');
  if (emailInput) emailInput.value = '';
  const otpInput = document.getElementById('privy-otp');
  if (otpInput) otpInput.value = '';
  document.getElementById('privy-email-step')?.classList.remove('hidden');
  document.getElementById('privy-otp-step')?.classList.add('hidden');
}

async function privyLogout() {
  try {
    if (privyClient) await privyClient.auth.logout();
  } catch (_) {}
  sessionStorage.removeItem('privy_user');
  privyReset();
  UI.updateAuthUI();
  location.reload();
}

function setPrivySession(info) {
  sessionStorage.setItem('privy_user', JSON.stringify({
    privyUser: true,
    id: info.id,
    email: info.email || 'Web2 User',
  }));
}

function getPrivyUser() {
  try {
    return JSON.parse(sessionStorage.getItem('privy_user'));
  } catch (_) {
    return null;
  }
}

function isPrivyLoggedIn() {
  return !!getPrivyUser();
}

// Expose to global scope for use by ui.js and onclick handlers
window.Privy = {
  init: initPrivy, sendCode: privySendCode, verifyCode: privyVerifyCode,
  reset: privyReset, logout: privyLogout, getUser: getPrivyUser, isLoggedIn: isPrivyLoggedIn,
};

// Auto-init when DOM is ready (CONFIG loaded before this module - regular script tag)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPrivy);
} else {
  initPrivy();
}
