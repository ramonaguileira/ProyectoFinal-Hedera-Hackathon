const axios = require('axios');
const { addDeliveryRow } = require('./sheets.service');
const { processOperatorInput } = require('./ai.service');
const { pollDeliveries } = require('../jobs/poll-deliveries');
const { getWeekNumber } = require('../utils/date.utils');
const logger = require('../utils/logger');

// This will be configured via TELEGRAM_BOT_TOKEN in .env
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = `https://api.telegram.org/bot${TOKEN}`;

async function handleTelegramUpdate(update) {
  if (!update.message) return;

  const chatId = update.message.chat.id;
  const text = update.message.text || update.message.caption || "";
  const photo = update.message.photo;
  const voice = update.message.voice;

  try {
    // 1. Send "Processing" message
    await sendMessage(chatId, "🔄 Procesando con IA (Gemini 1.5 Flash)...");

    const mediaFiles = [];
    let photoUrl = "";

    // 2. Handle Photo
    if (photo && photo.length > 0) {
      const fileId = photo[photo.length - 1].file_id;
      const fileRes = await axios.get(`${API_URL}/getFile?file_id=${fileId}`);
      const filePath = fileRes.data.result.file_path;
      photoUrl = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;
      
      // Download for Gemini
      const imgRes = await axios.get(photoUrl, { responseType: 'arraybuffer' });
      mediaFiles.push({
        mimeType: "image/jpeg",
        data: Buffer.from(imgRes.data).toString('base64')
      });
    }

    // 3. Handle Voice
    if (voice) {
      const fileId = voice.file_id;
      const fileRes = await axios.get(`${API_URL}/getFile?file_id=${fileId}`);
      const filePath = fileRes.data.result.file_path;
      const voiceUrl = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;
      
      // Download for Gemini
      const voiceRes = await axios.get(voiceUrl, { responseType: 'arraybuffer' });
      mediaFiles.push({
        mimeType: voice.mime_type || "audio/ogg",
        data: Buffer.from(voiceRes.data).toString('base64')
      });
    }

    // 4. Process with AI (now more powerful)
    const extractedData = await processOperatorInput(text, mediaFiles);
    logger.info(`Telegram AI extract: ${JSON.stringify(extractedData)}`);

    // 5. Validation Check
    if (extractedData.is_complete === false) {
      await sendMessage(chatId, `🤔 No pude completar el registro. ${extractedData.missing_info || "Por favor, dime el proveedor y el peso de forma clara."}`);
      return;
    }

    // 6. Record to Sheets
    const rowData = {
      ...extractedData,
      Foto: photoUrl,
      Fecha: new Date().toLocaleDateString('es-ES'),
      Semana: `W${getWeekNumber(new Date())}`,
      external_id: extractedData.external_id
    };

    await addDeliveryRow(rowData);

    // 7. Trigger Sync
    pollDeliveries().catch(e => logger.error(`Sync error: ${e.message}`));

    // 8. Confirm to user with detailed response
    let responseMsg = `✅ **¡Entrega Registrada!**\n\n` +
      `📍 **ID:** \`${extractedData.external_id}\`\n` +
      `📍 **Proveedor:** ${extractedData.supplier_id}\n` +
      `⚖️ **Peso:** ${extractedData.kg_brutos} kg\n` +
      `♻️ **Impropios:** ${(extractedData.pct_impropios || 0) * 100}%\n` +
      `📦 **Tipo:** ${extractedData.waste_type}\n\n` +
      `🔗 [Ver en Google Sheets](https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SPREADSHEET_ID})`;
    
    await sendMessage(chatId, responseMsg, "Markdown");

    // 9. Interactive Follow-up for empty optional fields
    if (extractedData.empty_optional_fields && extractedData.empty_optional_fields.length > 0) {
      const followUp = extractedData.follow_up_suggestion || 
        `💡 Noté que no mencionaste: ${extractedData.empty_optional_fields.join(', ')}. ¿Te gustaría completarlos o los dejamos así?`;
      
      // Delay it slightly for better UX
      setTimeout(() => {
        sendMessage(chatId, followUp);
      }, 1500);
    }

  } catch (err) {
    logger.error(`Telegram Bot Error: ${err.message}`);
    await sendMessage(chatId, "❌ Error procesando la entrega. Revisa que el audio se escuche bien o que el texto sea claro.");
  }
}

async function sendMessage(chatId, text, parseMode = "") {
  try {
    await axios.post(`${API_URL}/sendMessage`, {
      chat_id: chatId,
      text: text,
      parse_mode: parseMode
    });
  } catch (err) {
    logger.error(`Error sending message: ${err.message}`);
  }
}

module.exports = { handleTelegramUpdate };
