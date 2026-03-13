const express = require('express');
const router = express.Router();
const { addDeliveryRow } = require('../services/sheets.service');
const { processOperatorInput } = require('../services/ai.service');
const { pollDeliveries } = require('../jobs/poll-deliveries');
const logger = require('../utils/logger');

/**
 * Endpoint for AI-powered operator input (WhatsApp/Telegram/Audio)
 * Body: { text: "...", image: "base64...", photoUrl: "..." }
 */
const { handleTelegramUpdate } = require('../services/telegram.service');

router.post('/telegram-webhook', async (req, res) => {
  handleTelegramUpdate(req.body).catch(err => logger.error('Telegram Error: ' + err.message));
  res.sendStatus(200);
});

router.post('/operator-input', async (req, res) => {
  try {
    const { text, image, photoUrl } = req.body;
    
    // 1. Process with AI
    const mediaFiles = [];
    if (image) mediaFiles.push({ mimeType: 'image/jpeg', data: image });
    
    const extractedData = await processOperatorInput(text, mediaFiles);
    logger.info(`AI Extracted data: ${JSON.stringify(extractedData)}`);

    // 2. Add to Google Sheets
    const rowData = {
      ...extractedData,
      Foto: photoUrl || (image ? 'Attached' : '')
    };
    
    await addDeliveryRow(rowData);
    logger.info(`Added row to Sheets for ${extractedData.supplier_id}`);

    // 3. Trigger immediate poll to sync with Hedera/Guardian
    pollDeliveries().catch(err => logger.error(`Poll error after webhook: ${err.message}`));

    res.json({ 
      status: 'success', 
      message: 'Delivery recorded and syncing',
      data: extractedData 
    });
  } catch (err) {
    logger.error(`Webhook error: ${err.message}`);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

router.post('/form-submit', async (req, res) => {
  await pollDeliveries();
  res.json({ status: 'processed' });
});

module.exports = router;
