require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const { google } = require('googleapis');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const CHANNEL_ID = '1387766634214850611';

client.once('ready', () => {
  console.log(`Bot giriş yaptı: ${client.user.tag}`);
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (message.channel.id !== CHANNEL_ID) return;

  const attachment = message.attachments.first();
  if (!attachment || !attachment.name.endsWith('.mp4')) {
    return message.reply('Lütfen bir MP4 dosyası gönder.');
  }

  const filePath = `./${attachment.name}`;
  const dest = fs.createWriteStream(filePath);

  const response = await fetch(attachment.url);
  response.body.pipe(dest);

  dest.on('finish', async () => {
    await uploadToYouTube(filePath, attachment.name);
    fs.unlinkSync(filePath);
    message.reply('Video başarıyla yüklendi!');
  });

  dest.on('error', err => {
    console.error('Dosya indirilemedi:', err);
    message.reply('Bir hata oluştu.');
  });
});

async function uploadToYouTube(filePath, title) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    access_token: process.env.ACCESS_TOKEN,
    refresh_token: process.env.REFRESH_TOKEN,
    scope: 'https://www.googleapis.com/auth/youtube.upload',
    token_type: 'Bearer',
    expiry_date: true,
  });

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  const res = await youtube.videos.insert({
    part: 'snippet,status',
    requestBody: {
      snippet: {
        title: title,
        description: '',
      },
      status: {
        privacyStatus: 'public',
      },
    },
    media: {
      body: fs.createReadStream(filePath),
    },
  });

  console.log('Video yüklendi:', res.data);
}

client.login(process.env.DISCORD_BOT_TOKEN);
