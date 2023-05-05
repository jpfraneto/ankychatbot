const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const client = new Client();

client.on('qr', qr => {
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

module.exports = client;
