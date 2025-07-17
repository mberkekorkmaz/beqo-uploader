const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
  console.log(`Bot ${client.user.tag} olarak giriş yaptı`);
});

app.post('/upload', upload.single('video'), async (req, res) => {
  const title = req.body.title || 'Otomatik Yüklenen Video';
  const filePath = req.file.path;

  const auth = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );
  auth.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

  const youtube = google.youtube({ version: 'v3', auth });

  try {
    const response = await youtube.videos.insert({
      part: 'snippet,status',
      requestBody: {
        snippet: { title: title },
        status: { privacyStatus: 'public' }
      },
      media: {
        body: fs.createReadStream(filePath)
      }
    });
    fs.unlinkSync(filePath);
    res.status(200).send(`Video yüklendi! ID: ${response.data.id}`);
  } catch (err) {
    console.error('Yükleme hatası:', err);
    res.status(500).send('Yükleme başarısız.');
  }
});

client.login(process.env.BOT_TOKEN);
app.listen(3000, () => console.log('Express çalışıyor'));
