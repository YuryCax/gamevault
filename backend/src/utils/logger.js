const winston = require('winston');
const { createLogger, format, transports } = winston;
const WinstonLogstash = require('winston-logstash');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new WinstonLogstash({
      port: process.env.LOGSTASH_PORT || 5044,
      host: process.env.LOGSTASH_HOST || 'logstash',
      node_name: 'gamevault-backend',
    }),
  ],
});

module.exports = { logger };