require('dotenv').config();
const express = require('express');
const app = express();
const axios = require('axios');
const port = process.env.PORT || 3000;
const cron = require('node-cron');
const qrcode = require('qrcode-terminal');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const prisma = require('./prismaClient');

let isAuthenticated = false;
const { Client, LocalAuth, createWid } = require('whatsapp-web.js');

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
  authStrategy: new LocalAuth({
    dataPath: __dirname + '/.session',
    puppeteer: {
      args: ['--no-sandbox'],
    },
  }),
});

// This is for updating the users every day, and sending them a message that will let them know what they need to work on.
const fetchUsers = async () => {
  console.log('inside the fetchUser function');
  if (!isAuthenticated) {
    console.log('Client is not authenticated yet. Please wait and try again.');
    return;
  }
  const response = await axios.get('https://www.sadhana.lat/api/anky-whatsapp');
  const result = await response.data;
  result.users.forEach(async user => {
    const messageText = createWhatsappMessage(user);
    const sanitized_number = user.whatsapp.toString().replace(/[- )(]/g, '');
    const strippedNumber = user.whatsapp.replace(/\D/g, '');
    const number_details = await client.getNumberId(strippedNumber);
    if (number_details) {
      const sendMessageData = await client.sendMessage(
        number_details._serialized,
        messageText
      ); // send message
      console.log(`The message to ${user.name} was sent.`);
    } else {
      console.log(`Error sending message to ${user.name}: ${error.message}`);
    }
  });
};

function createWhatsappMessage(user) {
  const { name, whatsapp, sadhanas } = user;

  let message = `Hello, ${name}! This is Anky once again 🐒 Here are your sadhanas for today:\n\n`;

  sadhanas.forEach((sadhana, index) => {
    const { title, dayIndex } = sadhana;

    message += `🌟 #${index + 1} -  ${title}: Day ${dayIndex} of ${
      sadhana.targetSessions
    } 📅\n`;
  });
  message +=
    "\nRemember, staying committed to your challenges is crucial for your personal growth. You've got this! 💪\n\n";
  message += 'I wish you a fantastic and productive day! 🚀\n\n';
  message += 'Go to www.sadhana.lat/dashboard and get it going!';
  return message;
}

// This is for updating the active sadhanas every day at 3:33 UTC.
cron.schedule('33 3 * * *', async () => {
  try {
    const response = await axios.get(
      'https://www.sadhana.lat/api/update-sadhanas'
    );
    const result = await response.json();
    console.log('The sadhanas were updated successfully.');
  } catch (error) {
    console.error('Error updating sadhanas:', error);
  }
});

client.on('qr', qr => {
  console.log('Scan the QR code to authenticate your WhatsApp account:');
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
  console.log('Authenticated with WhatsApp');
  isAuthenticated = true;
});

client.on('ready', () => {
  console.log('WhatsApp client is ready!');
  fetchUsers();
  cron.schedule('33 3 * * *', fetchUsers, { timezone: 'UTC' });
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
