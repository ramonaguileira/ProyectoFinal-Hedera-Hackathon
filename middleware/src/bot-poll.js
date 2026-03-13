const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });
const { handleTelegramUpdate } = require('./services/telegram.service');
const logger = require('./utils/logger');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = `https://api.telegram.org/bot${TOKEN}`;

let offset = 0;

async function pollTelegram() {
  try {
    const response = await axios.get(`${API_URL}/getUpdates?offset=${offset}&timeout=30`);
    const updates = response.data.result;

    for (const update of updates) {
      offset = update.update_id + 1;
      logger.info(`Processing update ${update.update_id}`);
      await handleTelegramUpdate(update);
    }
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      // Timeout is normal with long polling
    } else {
      logger.error(`Polling error: ${err.message}`);
    }
  }
  
  // Continue polling
  setTimeout(pollTelegram, 1000);
}

logger.info('Starting Telegram Bot in Polling Mode (local connection)...');
pollTelegram();
