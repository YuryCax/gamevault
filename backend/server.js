require('./utils/load_keys');
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const csurf = require('csurf');
const { Server } = require('socket.io');
const { createAdapter } = require('socket.io-redis');
const { connectRedis, sentinelClient } = require('./utils/redis-sentinel');
const { connectMongoDB } = require('./utils/mongodb-connect');
const { logger } = require('./utils/log');
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const Backend = require('i18next-fs-backend');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();
const server = require('http').createServer(app); // Создаём HTTP-сервер
const io = new Server(server, { cors: { origin: process.env.CORS_ORIGIN } });

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    backend: {
      loadPath: './src/locales/{{lng}}.json', // Путь к файлам локализации
    },
    fallbackLng: 'en',
    preload: ['en', 'ru', 'uk', 'hi', 'zh', 'tg', 'uz'],
    detection: {
      order: ['header', 'querystring', 'cookie'],
      caches: ['cookie'],
    },
  });

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use(i18nextMiddleware.handle(i18next));
app.use(csurf());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

io.adapter(createAdapter({ pubClient: sentinelClient, subClient: sentinelClient.duplicate() }));

app.use('/api/admin', require('./routes/admin'));
app.use('/api/poker', require('./routes/poker'));
app.use('/api/roulette', require('./routes/roulette'));
app.use('/api/dice', require('./routes/dice'));
app.use('/api/slots', require('./routes/slots'));
app.use('/api/blackjack', require('./routes/blackjack'));
app.use('/api/tournaments', require('./routes/tournament'));
app.use('/api/promotions', require('./routes/promotion'));
app.use('/api/engagement', require('./routes/engagement'));
app.use('/api/user', require('./routes/user'));

const startServer = async () => {
  try {
    await connectMongoDB();
    await connectRedis();
    server.listen(5000, () => logger.info('Server running on port 5000'));
  } catch (err) {
    logger.error(`Server startup error: ${err.message}`);
    process.exit(1);
  }
};

startServer();