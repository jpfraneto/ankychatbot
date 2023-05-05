const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const whatsappClient = require('./whatsappClient');

whatsappClient.on('ready', () => {
  console.log('WhatsApp client is ready!');

  app.use(limiter);
  app.use(helmet());

  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({ error: 'An error occurred. Please try again later.' });
  });

  app.get('/api/hello', (req, res) => {
    res.send({ message: 'Hello World' });
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening at http://0.0.0.0:${port}`);
  });
});

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

whatsappClient.initialize();
