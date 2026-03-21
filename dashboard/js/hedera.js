// Eggologic Dashboard — Hedera Mirror Node Queries

const HederaMirror = (() => {

  async function _get(path) {
    const res = await fetch(`${CONFIG.MIRROR_URL}${path}`);
    if (!res.ok) throw new Error(`Mirror Node ${path}: ${res.status}`);
    return res.json();
  }

  /**
   * Get EGGOCOIN balance for a Hedera account.
   * Returns the balance as a number, or 0 if no balance found.
   */
  async function getEggocoinBalance(accountId) {
    const data = await _get(`/api/v1/tokens/${CONFIG.EGGOCOIN_TOKEN}/balances?account.id=${accountId}`);
    if (data.balances && data.balances.length > 0) {
      return data.balances[0].balance;
    }
    return 0;
  }

  /**
   * Get token info (name, symbol, total supply, decimals).
   */
  async function getTokenInfo(tokenId) {
    return _get(`/api/v1/tokens/${tokenId}`);
  }

  /**
   * Get EGGOCOIN total supply.
   */
  async function getEggocoinSupply() {
    const info = await getTokenInfo(CONFIG.EGGOCOIN_TOKEN);
    return {
      totalSupply: parseInt(info.total_supply, 10),
      name: info.name,
      symbol: info.symbol,
      decimals: parseInt(info.decimals, 10),
    };
  }

  /**
   * Get recent token transfers for an account.
   * Returns array of { amount, from, to, timestamp, txId }.
   */
  async function getTransactions(accountId, limit = 25) {
    const data = await _get(
      `/api/v1/transactions?account.id=${accountId}&transactiontype=CRYPTOTRANSFER&limit=${limit}&order=desc`
    );
    if (!data.transactions) return [];

    return data.transactions.map(tx => {
      // Find the EGGOCOIN transfer in this transaction
      const eggTransfer = (tx.token_transfers || []).find(
        t => t.token_id === CONFIG.EGGOCOIN_TOKEN
      );
      return {
        txId: tx.transaction_id,
        timestamp: tx.consensus_timestamp,
        date: new Date(parseFloat(tx.consensus_timestamp) * 1000),
        memo: atob(tx.memo_base64 || ''),
        eggocoin: eggTransfer ? {
          account: eggTransfer.account,
          amount: eggTransfer.amount,
        } : null,
        // Include all token transfers for detailed view
        tokenTransfers: tx.token_transfers || [],
      };
    }).filter(tx => tx.eggocoin); // Only return txs that involve EGGOCOIN
  }

  /**
   * Get all EGGOCOIN balances (all holders).
   */
  async function getAllBalances() {
    const data = await _get(`/api/v1/tokens/${CONFIG.EGGOCOIN_TOKEN}/balances`);
    return data.balances || [];
  }

  /**
   * Get NFT holdings for an account.
   */
  async function getNFTs(accountId) {
    const data = await _get(`/api/v1/tokens/${CONFIG.NFT_TOKEN}/nfts?account.id=${accountId}`);
    return data.nfts || [];
  }

  /**
   * Get all minting events for EGGOCOIN (treasury transfers).
   */
  async function getMintEvents() {
    const info = await getTokenInfo(CONFIG.EGGOCOIN_TOKEN);
    const treasuryId = info.treasury_account_id;
    const data = await _get(
      `/api/v1/transactions?account.id=${treasuryId}&transactiontype=TOKENMINT&limit=50&order=desc`
    );
    return data.transactions || [];
  }

  return {
    getEggocoinBalance,
    getTokenInfo,
    getEggocoinSupply,
    getTransactions,
    getAllBalances,
    getNFTs,
    getMintEvents,
  };
})();
