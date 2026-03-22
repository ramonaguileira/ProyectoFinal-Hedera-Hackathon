// EGGOLOGIC Dashboard Config
// I ALMOST LOST MY WITS WITH THIS ONE - GOD BLESS CLOUDFLARE.
const CONFIG = {
  // Guardian API via CORS proxy (Cloudflare Worker)
  GUARDIAN_URL: 'https://eggologic-proxy.sargas.workers.dev/api/v1',
  // Direct Guardian URL (for reference)
  GUARDIAN_DIRECT: 'https://guardianservice.app/api/v1',
  POLICY_ID: '69bc4638e755119d0774dd03',

  // Hedera Testnet Mirror Node
  MIRROR_URL: 'https://testnet.mirrornode.hedera.com',

  // Token IDs
  EGGOCOIN_TOKEN: '0.0.8287358',
  NFT_TOKEN: '0.0.8287362',

  // Guardian Block IDs (from policy)
  BLOCKS: {
    VVB_DELIVERY:    '3a5afd50-d4a5-49ca-866b-75477790ae4c',
    VVB_IMPACT_CALC: 'a77f0551-9cce-41c9-889d-c7b1110c059e',
    TOKEN_HISTORY:   'cd9ed4c2-ff79-474c-bd7c-6a9c525c6035',
    REGISTRY_SUPPLIER: 'd6b1e092-59c1-48af-8671-1a5dfdeaaddb',
    PP_DELIVERY_FORM:  'b322eaa1-7611-4704-be60-b033db83dadb',
    VVB_DELIVERY_APPROVE: '337cef47-e484-48bb-9249-a952cb72f203',
  },

  // User Accounts (for demo login)
  ACCOUNTS: [
    { role: 'OWNER',             email: 'r.aguileira88@gmail.com', hedera: '0.0.7166777' },
    { role: 'Registry',          email: 'eggologic-registry@outlook.com', hedera: '0.0.8292724' },
    { role: 'Project_Proponent', email: 'eggologic-proponent@outlook.com', hedera: '0.0.8294621' },
    { role: 'Operator',          email: 'eggologic-operator@outlook.com', hedera: '0.0.8294659' },
    { role: 'VVB',               email: 'eggologic-vvb@outlook.com', hedera: '0.0.8294709' },
  ],

  // HashScan Explorer
  HASHSCAN_URL: 'https://hashscan.io/testnet',

  // Token expiry buffer (re-auth 2 min before expiry)
  TOKEN_TTL_MS: 28 * 60 * 1000, // 28 minutes

  // Privy Web2 Login
  PRIVY_APP_ID: 'cmn16aenv00690dl5hmuo3o52',
  PRIVY_CLIENT_ID: 'client-WY6XayFzWx76HmRD2mw1bMtFyaEKAstPjWL2apyddy2w7',
};
