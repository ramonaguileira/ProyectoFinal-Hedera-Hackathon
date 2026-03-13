require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const { Client, AccountId, PrivateKey, AccountInfoQuery } = require('@hashgraph/sdk');

(async function () {
  try {
    const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
    const operatorKey = PrivateKey.fromStringED25519(process.env.HEDERA_OPERATOR_KEY);
    const client = Client.forTestnet().setOperator(operatorId, operatorKey);

    const info = await new AccountInfoQuery().setAccountId(operatorId).execute(client);
    const pubKey = info.key ? info.key.toString() : 'none';
    const privPub = operatorKey.publicKey.toString();
    const out = { account: operatorId.toString(), accountKey: pubKey, derivedPubFromPriv: privPub };
    fs.writeFileSync('check-key-output.json', JSON.stringify(out, null, 2));
    console.log('Wrote check-key-output.json');
  } catch (err) {
    fs.writeFileSync('check-key-output.json', JSON.stringify({ error: err.message }, null, 2));
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
