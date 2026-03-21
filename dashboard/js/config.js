// Eggologic Dashboard — Shared Configuration
const CONFIG = {
  // Guardian Managed Service
  GUARDIAN_URL: 'https://guardianservice.app/api/v1',
  POLICY_ID: '69bc4638e755119d0774dd03',

  // Hedera Testnet Mirror Node
  MIRROR_URL: 'https://testnet.mirrornode.hedera.com',

  // Token IDs
  EGGOCOIN_TOKEN: '0.0.8287358',
  NFT_TOKEN: '0.0.8287362',

  // Guardian Block IDs (from published policy)
  BLOCKS: {
    VVB_DELIVERY:    '3a5afd50-d4a5-49ca-866b-75477790ae4c',
    VVB_IMPACT_CALC: 'a77f0551-9cce-41c9-889d-c7b1110c059e',
    TOKEN_HISTORY:   'cd9ed4c2-ff79-474c-bd7c-6a9c525c6035',
    REGISTRY_SUPPLIER: 'd6b1e092-59c1-48af-8671-1a5dfdeaaddb',
  },

  // User Accounts (for demo login selector)
  ACCOUNTS: [
    { role: 'OWNER',             email: 'r.aguileira88@gmail.com', hedera: '0.0.7166777' },
    { role: 'Registry',          email: 'eggologic-registry@outlook.com', hedera: '0.0.8292724' },
    { role: 'Project_Proponent', email: 'eggologic-proponent@outlook.com', hedera: '0.0.8294621' },
    { role: 'Operator',          email: 'eggologic-operator@outlook.com', hedera: '0.0.8294659' },
    { role: 'VVB',               email: 'eggologic-vvb@outlook.com', hedera: '0.0.8294709' },
  ],

  // Token expiry buffer (re-auth 2 min before expiry)
  TOKEN_TTL_MS: 28 * 60 * 1000, // 28 minutes
};
