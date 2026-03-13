const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });
const express = require('express');
const cron = require('node-cron');
const { initHederaClient } = require('./config/hedera');
const { pollDeliveries } = require('./jobs/poll-deliveries');
const { processBatches } = require('./jobs/process-batches');
const { checkCarbonThreshold } = require('./jobs/carbon-accumulator');
const webhookRoutes = require('./routes/webhook.routes');
const supplierRoutes = require('./routes/supplier.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const logger = require('./utils/logger');

const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/webhook', webhookRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'eggologic-middleware' }));

// Initialize Hedera client
try {
  initHederaClient();
} catch (err) {
  logger.error(`Hedera initialization failed: ${err.message}`);
}

// Cron jobs
const interval = process.env.POLLING_INTERVAL_MINUTES || 5;
cron.schedule(`*/${interval} * * * *`, async () => {
  logger.info('Polling for new deliveries...');
  await pollDeliveries();
});

cron.schedule('0 18 * * 5', async () => {
  logger.info('Processing weekly batch closures...');
  await processBatches();
});

cron.schedule('0 * * * *', async () => {
  await checkCarbonThreshold();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`Eggologic middleware running on port ${PORT}`);
  logger.info(`Polling Google Sheets every ${interval} minutes`);
});

module.exports = app;
