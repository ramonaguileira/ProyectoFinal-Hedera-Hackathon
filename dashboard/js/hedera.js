// EGGOLOGIC Dashboard — Mirror Node Queries

const HederaMirror = (() => {

  async function _get(path) {
    const res = await fetch(`${CONFIG.MIRROR_URL}${path}`);
    if (!res.ok) throw new Error(`Mirror Node ${path}: ${res.status}`);
    return res.json();
  }

  /**
   * Get $EGGO balance for accs
   * Returns balance as a number, or 0 if brokeasf.
   */
  async function getEggocoinBalance(accountId) {
    const data = await _get(`/api/v1/tokens/${CONFIG.EGGOCOIN_TOKEN}/balances?account.id=${accountId}`);
    if (data.balances && data.balances.length > 0) {
      return data.balances[0].balance;
    }
    return 0;
  }

  /**
   * Token info (name, symbol, total supply, decimals).
   */
  async function getTokenInfo(tokenId) {
    return _get(`/api/v1/tokens/${tokenId}`);
  }

  /**
   * Get $EGGO TS.
   */
  async function getEggocoinSupply() {
    const info = await getTokenInfo(CONFIG.EGGOCOIN_TOKEN);
    return {
      totalSupply: parseInt(info.total_supply, 10),
      name: info.name,
      symbol: info.symbol,
      decimals: parseInt(info.decimals, 10),
      createdTimestamp: parseFloat(info.created_timestamp) * 1000,
    };
  }

  /**
   * Get $EGGO tx's for acc.
   * Follows pagination to collect all $EGGO txs. This puzzled me more that what I'm willing to disclose.
   */
  async function getTransactions(accountId, targetCount = 50) {
    let allTxs = [];
    let nextPath = `/api/v1/transactions?account.id=${accountId}&transactiontype=CRYPTOTRANSFER&limit=100&order=desc`;

    while (nextPath && allTxs.length < targetCount) {
      const data = await _get(nextPath);
      if (!data.transactions) break;

      data.transactions.forEach(tx => {
        // Find $EGGO transfers for THIS account (correct sign: + received, - sent)
        const eggTransfer = (tx.token_transfers || []).find(
          t => t.token_id === CONFIG.EGGOCOIN_TOKEN && t.account === accountId
        );
        if (eggTransfer) {
          allTxs.push({
            txId: tx.transaction_id,
            timestamp: tx.consensus_timestamp,
            date: new Date(parseFloat(tx.consensus_timestamp) * 1000),
            memo: atob(tx.memo_base64 || ''),
            eggocoin: {
              account: eggTransfer.account,
              amount: eggTransfer.amount,
            },
            tokenTransfers: tx.token_transfers || [],
          });
        }
      });

      // Follow pagination if more results needed
      nextPath = (allTxs.length < targetCount && data.links?.next) ? data.links.next : null;
    }

    return allTxs.slice(0, targetCount);
  }

  /**
   * Get balance (all holders).
   */
  async function getAllBalances() {
    const data = await _get(`/api/v1/tokens/${CONFIG.EGGOCOIN_TOKEN}/balances`);
    return data.balances || [];
  }

  /**
   * Get NFT's for account.
   */
  async function getNFTs(accountId) {
    const data = await _get(`/api/v1/tokens/${CONFIG.NFT_TOKEN}/nfts?account.id=${accountId}`);
    return data.nfts || [];
  }

  /**
   * Get CIT NFT(Circular Impact NFT) total supply.
   */
  async function getCITSupply() {
    const info = await getTokenInfo(CONFIG.NFT_TOKEN);
    return parseInt(info.total_supply, 10);
  }

  /**
   * Get CIT NFT count for a specific account.
   */
  async function getUserCIT(accountId) {
    const nfts = await getNFTs(accountId);
    return nfts.length;
  }

  /**
   * Get all minted CIT NFTs (serial, holder, timestamp).
   */
  async function getAllCITNfts() {
    const data = await _get(`/api/v1/tokens/${CONFIG.NFT_TOKEN}/nfts?order=desc&limit=25`);
    return (data.nfts || []).map(nft => ({
      serial: nft.serial_number,
      account: nft.account_id,
      timestamp: parseFloat(nft.created_timestamp) * 1000,
    }));
  }

  /**
   * Get all minting events for $EGGO (treasury transfers).
   */
  async function getMintEvents() {
    const info = await getTokenInfo(CONFIG.EGGOCOIN_TOKEN);
    const treasuryId = info.treasury_account_id;
    const data = await _get(
      `/api/v1/transactions?account.id=${treasuryId}&transactiontype=TOKENMINT&limit=100&order=desc`
    );
    // Filter to only $EGGO mints (treasury minted other tokens from different policies since we screwed up a gazillion times while buidlng the policy)
    return (data.transactions || []).filter(tx => tx.entity_id === CONFIG.EGGOCOIN_TOKEN);
  }

  return {
    getEggocoinBalance,
    getTokenInfo,
    getEggocoinSupply,
    getTransactions,
    getAllBalances,
    getNFTs,
    getMintEvents,
    getCITSupply,
    getUserCIT,
    getAllCITNfts,
  };
})();
