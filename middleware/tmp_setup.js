require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const {Client, AccountId, PrivateKey, TokenCreateTransaction, TokenType, TokenSupplyType, TopicCreateTransaction} = require('@hashgraph/sdk');

(async function(){
  try {
    const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
    const operatorKey = PrivateKey.fromStringED25519(process.env.HEDERA_OPERATOR_KEY);
    const client = Client.forTestnet().setOperator(operatorId, operatorKey);

    const tokenTx = await new TokenCreateTransaction()
      .setTokenName('Eggologic Puntos')
      .setTokenSymbol('EGGOCOINS')
      .setTokenType(TokenType.FungibleCommon)
      .setDecimals(2)
      .setInitialSupply(0)
      .setTreasuryAccountId(operatorId)
      .setSupplyType(TokenSupplyType.Infinite)
      .setAdminKey(operatorKey.publicKey)
      .setSupplyKey(operatorKey.publicKey)
      .setTokenMemo('Eggologic supplier incentive points')
      .execute(client);
    const tokenReceipt = await tokenTx.getReceipt(client);
    const eggToken = tokenReceipt.tokenId.toString();

    const nftTx = await new TokenCreateTransaction()
      .setTokenName('Creditos Ambientales Eggologic')
      .setTokenSymbol('CARBONCOIN')
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(operatorId)
      .setSupplyType(TokenSupplyType.Infinite)
      .setAdminKey(operatorKey.publicKey)
      .setSupplyKey(operatorKey.publicKey)
      .setTokenMemo('1 NFT = 1 tCO2e avoided via CDM AMS-III.F composting')
      .execute(client);
    const nftReceipt = await nftTx.getReceipt(client);
    const nftToken = nftReceipt.tokenId.toString();

    const deliveriesTx = await new TopicCreateTransaction().setTopicMemo('Eggologic:Deliveries').execute(client);
    const deliveriesTopic = (await deliveriesTx.getReceipt(client)).topicId.toString();
    const batchesTx = await new TopicCreateTransaction().setTopicMemo('Eggologic:Batches').execute(client);
    const batchesTopic = (await batchesTx.getReceipt(client)).topicId.toString();
    const prodTx = await new TopicCreateTransaction().setTopicMemo('Eggologic:Production').execute(client);
    const prodTopic = (await prodTx.getReceipt(client)).topicId.toString();

    const out = { eggToken, nftToken, deliveriesTopic, batchesTopic, prodTopic };
    fs.writeFileSync('setup-output.json', JSON.stringify(out, null, 2));
    console.log('Done, wrote setup-output.json');
  } catch (error) {
    fs.writeFileSync('setup-output.json', JSON.stringify({ error: error.message }, null, 2));
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
