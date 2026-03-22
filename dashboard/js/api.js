// Eggologic Dashboard — Guardian API Wrapper
// Handles auth (login, token refresh) and policy data fetching.

const GuardianAPI = (() => {
  const STORAGE_KEY = 'eggologic_auth';

  // --- Auth State (persisted in localStorage) ---
  function _loadAuth() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch { return {}; }
  }
  function _saveAuth(auth) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  }

  /**
   * Login with email/password → stores refreshToken + accessToken + timestamp
   */
  async function login(email, password) {
    const account = CONFIG.ACCOUNTS.find(a => a.email === email);
    let supplierId = null;
    let restaurantName = null;

    if (!account) {
      const apps = JSON.parse(localStorage.getItem('eggologic_applications') || '[]');
      const restaurant = apps.find(a => a.email === email && (a.status === 'Approved by Project Proponent' || a.status === 'Ingested in Guardian'));
      if (restaurant) {
        supplierId = restaurant.supplierId;
        restaurantName = restaurant.restaurantName;
      }
    }

    try {
      // For hardcoded accounts, try real login. For restaurants, skip to "offline" success for demo.
      if (account) {
        const res = await fetch(`${CONFIG.GUARDIAN_URL}/accounts/loginByEmail`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw new Error(`Login failed: ${res.status}`);
        const data = await res.json();
        const refreshToken = data.login?.refreshToken || data.refreshToken;
        if (!refreshToken) throw new Error('No refreshToken in response');
  
        // Immediately get access token
        const accessToken = await _getAccessToken(refreshToken);
  
        const auth = {
          email,
          refreshToken,
          accessToken,
          ts: Date.now(),
          hedera: account?.hedera || null,
          role: account?.role || null,
        };
        _saveAuth(auth);
        return auth;
      } else if (supplierId) {
        // Successful Restaurant Login (Demo bypass)
        const auth = {
          email,
          refreshToken: 'offline-restaurant',
          accessToken: 'offline-restaurant',
          ts: Date.now(),
          hedera: null,
          role: 'Supplier',
          supplierId,
          restaurantName,
          offline: true,
        };
        _saveAuth(auth);
        return auth;
      } else {
        throw new Error('Account not found or not approved');
      }
    } catch (e) {
      console.warn('[Guardian] Login failed (or demo bypass):', e.message);
      if (account) {
        const auth = {
          email,
          refreshToken: 'offline-mode',
          accessToken: 'offline-mode',
          ts: Date.now(),
          hedera: account?.hedera || null,
          role: account?.role || null,
          offline: true,
        };
        _saveAuth(auth);
        return auth;
      }
      throw e;
    }
  }

  async function _getAccessToken(refreshToken) {
    const res = await fetch(`${CONFIG.GUARDIAN_URL}/accounts/access-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) throw new Error(`Access token failed: ${res.status}`);
    const data = await res.json();
    return data.accessToken;
  }

  /**
   * Returns a valid access token, refreshing if expired.
   */
  async function getToken() {
    const auth = _loadAuth();
    if (!auth.refreshToken) throw new Error('Not logged in');

    // Check if token is still fresh
    if (auth.accessToken && (Date.now() - auth.ts) < CONFIG.TOKEN_TTL_MS) {
      return auth.accessToken;
    }

    // Refresh
    const accessToken = await _getAccessToken(auth.refreshToken);
    auth.accessToken = accessToken;
    auth.ts = Date.now();
    _saveAuth(auth);
    return accessToken;
  }

  /**
   * Generic authenticated GET to Guardian API.
   */
  async function get(path) {
    const token = await getToken();
    const res = await fetch(`${CONFIG.GUARDIAN_URL}${path}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.status === 401) {
      // Token expired mid-flight — force refresh and retry once
      const auth = _loadAuth();
      auth.ts = 0;
      _saveAuth(auth);
      const newToken = await getToken();
      const retry = await fetch(`${CONFIG.GUARDIAN_URL}${path}`, {
        headers: { 'Authorization': `Bearer ${newToken}` },
      });
      if (!retry.ok) throw new Error(`Guardian GET ${path}: ${retry.status}`);
      return retry.json();
    }
    if (!res.ok) throw new Error(`Guardian GET ${path}: ${res.status}`);
    return res.json();
  }

  /**
   * Fetch documents from a specific policy block.
   * Tries local cache first (pre-fetched via fetch-guardian-cache.js),
   * falls back to live Guardian API.
   */
  async function getBlockData(blockId) {
    // Prefer live API when logged in (cache may be stale)
    // pageSize=50 overrides Guardian's default of 10
    if (isLoggedIn() && !_loadAuth().offline) {
      try {
        return await get(`/policies/${CONFIG.POLICY_ID}/blocks/${blockId}?pageSize=50`);
      } catch (e) {
        console.warn('[Guardian] Live API failed, trying cache:', e.message);
      }
    }
    // Fallback to local cache (pre-fetched data, avoids CORS issues)
    const cached = await _tryCache(blockId);
    if (cached) return cached;
    return get(`/policies/${CONFIG.POLICY_ID}/blocks/${blockId}?pageSize=50`);
  }

  /**
   * Load pre-fetched Guardian data from data/guardian-cache.json.
   */
  let _cachePromise = null;
  async function _tryCache(blockId) {
    try {
      if (!_cachePromise) {
        _cachePromise = fetch('data/guardian-cache.json').then(r => r.ok ? r.json() : null).catch(() => null);
      }
      const cache = await _cachePromise;
      if (!cache || !cache.blocks) return null;
      // Find block by ID — cache keys are names like VVB_DELIVERY
      const blockName = Object.keys(CONFIG.BLOCKS).find(k => CONFIG.BLOCKS[k] === blockId);
      if (blockName && cache.blocks[blockName]) {
        console.log(`[Guardian] Using cached data for ${blockName}`);
        return cache.blocks[blockName];
      }
      return null;
    } catch { return null; }
  }

  /**
   * Check if user is currently logged in (has stored auth).
   */
  function isLoggedIn() {
    const auth = _loadAuth();
    return !!(auth.refreshToken);
  }

  /**
   * Get current auth info without network calls.
   */
  function currentUser() {
    return _loadAuth();
  }

  /**
   * Logout — clear stored auth.
   */
  function logout() {
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Generic authenticated POST to Guardian API.
   */
  async function post(path, body) {
    const token = await getToken();
    const res = await fetch(`${CONFIG.GUARDIAN_URL}${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (res.status === 401) {
      const auth = _loadAuth();
      auth.ts = 0;
      _saveAuth(auth);
      const newToken = await getToken();
      const retry = await fetch(`${CONFIG.GUARDIAN_URL}${path}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!retry.ok) throw new Error(`Guardian POST ${path}: ${retry.status}`);
      return retry.json();
    }
    if (!res.ok) throw new Error(`Guardian POST ${path}: ${res.status}`);
    return res.json();
  }

  /**
   * Submit a waste delivery document to the Guardian policy.
   */
  async function submitDelivery(doc) {
    const auth = _loadAuth();
    if (auth.offline) {
      throw new Error('Cannot submit: logged in offline mode. Ensure the CORS proxy is deployed and GUARDIAN_URL is set in config.js');
    }
    return post(`/policies/${CONFIG.POLICY_ID}/blocks/${CONFIG.BLOCKS.PP_DELIVERY_FORM}`, {
      document: doc,
      ref: null,
    });
  }

  return { login, getToken, get, post, getBlockData, isLoggedIn, currentUser, logout, submitDelivery };
})();
