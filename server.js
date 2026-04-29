/**
 * ELITE ELECTION — Express Server Entry Point
 * An immersive 3D AI election assistant.
 */

require('dotenv').config();

const express = require('express');
const compression = require('compression');
const path = require('path');
const { createHelmetMiddleware, createCorsMiddleware, csrfProtection } = require('./src/middleware/security');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const { httpLogger, logger } = require('./src/middleware/logging');
const { errorHandler } = require('./src/utils/errors');

const app = express();
const PORT = process.env.PORT || 8080;

// ─── Global Middleware ───
app.use(createHelmetMiddleware());
app.use(createCorsMiddleware());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(httpLogger);

// ─── Static Files ───
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  etag: true,
  lastModified: true
}));

// ─── Rate Limiting ───
app.use('/api/', apiLimiter);

// ─── API Routes ───
app.use('/api/health', require('./src/routes/health'));
app.use('/api/zones', require('./src/routes/zones'));
app.use('/api/assistant', require('./src/routes/assistant'));
app.use('/api/timeline', require('./src/routes/timeline'));
app.use('/api/checks', require('./src/routes/checks'));
app.use('/api/translate', require('./src/routes/translate'));
app.use('/api/accessibility', require('./src/routes/accessibility'));

// ─── SPA Fallback ───
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/text-mode', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'text-mode.html'));
});

// ─── 404 Handler ───
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` }
  });
});

// ─── Error Handler ───
app.use(errorHandler);

// ─── Start Server ───
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`🗳️  ELITE ELECTION running on port ${PORT}`);
    logger.info(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`   3D Experience: http://localhost:${PORT}`);
    logger.info(`   Text-Only Mode: http://localhost:${PORT}/text-mode`);
    logger.info(`   API Health: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
