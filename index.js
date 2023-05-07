require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cron = require('node-cron');
const qrcode = require('qrcode-terminal');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const prisma = require('./prismaClient');
const { Client, LocalAuth } = require('whatsapp-web.js');

const phoneNumber = '56985491126';
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

app.use(limiter);
app.use(helmet());

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ error: 'An error occurred. Please try again later.' });
});

app.get('/', (req, res) => {
  res.send({ message: 'wena compare!!' });
});

app.get('/api/hello', (req, res) => {
  res.send({ message: 'Hello World' });
});

app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany({
    where: {},
  });
  res.json(users);
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

  cron.schedule('0 * * * *', async () => {
    const timestamp = new Date().toLocaleString();
    const messageText = `Hello ${timestamp}`;

    const id = { id: { _serialized: `whatsapp:${phoneNumber}@c.us` } };
    const info = await client.sendMessage(id, messageText);

    console.log(`Message sent: ${messageText}`);
  });
});

client.on('message', async message => {
  console.log('The message from the user is:', message);
  if (message.body === '!ping') {
    return await message.reply('pong');
  }
  return message.reply(
    'Esto significa que está funcionando este tema. Anky está agarrando forma. Anky está empezando su viaje.'
  );
});

client.initialize();

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening at http://0.0.0.0:${port}`);
});
