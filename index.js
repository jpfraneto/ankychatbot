const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const qrcode = require('qrcode-terminal');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Client, LocalAuth } = require('whatsapp-web.js');

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

app.use(limiter);
app.use(helmet());

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ error: 'An error occurred. Please try again later.' });
});

app.get('/api/hello', (req, res) => {
  res.send({ message: 'Hello World' });
});

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: __dirname + '/.session' }),
});

client.on('qr', qr => {
  console.log('Scan the QR code to authenticate your WhatsApp account:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp client is ready!');
});

client.on('message', async message => {
  console.log('The message from the user is:', message);
  if (message.body === '!ping') {
    return await message.reply('pong');
  }
  return message.reply(
    'Wena conchetumare!!!!! Está funcionando esta wea. Un lujo. Ahora viene automatizar todo para que sea la voz de Anky.'
  );
});

client.initialize();

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening at http://0.0.0.0:${port}`);
});
