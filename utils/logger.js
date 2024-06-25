const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
    winston.format.errors({ stack: true }), // To capture stack trace
    winston.format.colorize({ all: true })
  ),
  // Console logging
  transports: [
    new winston.transports.Console(),
    // File logging: separate files for errors and combined logs
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

module.exports = logger;