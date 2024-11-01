const winston = require('winston');

const logger = winston.createLogger({
  level: 'info', // Log all levels (info, warn, error, etc.)
  format: winston.format.json(),
  transports: [
    // Log all levels to combined.log
    new winston.transports.File({ filename: 'combined.log' }),
    // Log only errors to error.log
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
});

// If not in production, also log to the console
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

module.exports = logger;
