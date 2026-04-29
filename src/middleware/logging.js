/**
 * Request logging middleware with Cloud Logging integration.
 */

const morgan = require('morgan');
const winston = require('winston');

/** Winston logger instance */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'elite-election' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Add Cloud Logging transport in production
if (process.env.ENABLE_CLOUD_LOGGING === 'true') {
  try {
    const { LoggingWinston } = require('@google-cloud/logging-winston');
    logger.add(new LoggingWinston({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
      logName: 'elite-election',
      resource: { type: 'cloud_run_revision' }
    }));
    logger.info('Cloud Logging transport enabled');
  } catch (error) {
    logger.warn('Cloud Logging unavailable, using console only:', error.message);
  }
}

/** Morgan HTTP request logger */
const httpLogger = morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) },
  skip: (req) => req.url === '/api/health'
});

module.exports = { logger, httpLogger };
