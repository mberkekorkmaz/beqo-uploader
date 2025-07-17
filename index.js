const { Client, GatewayIntentBits } = require("discord.js");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const CHANNEL_ID = "1387766634214850611"; // Discord kanal ID

client.once("ready", () => {
  console.log(`✅ Bot giriş yaptı: ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== CHANNEL_ID) return;

  const attachment = message.attachments.first();
  if (!attachment) return;

  const url = attachment.url;
  const fileName = `video_${Date.now()}.mp4`;
  const filePath = path.join(__dirname, fileName);

  try {
    const response = await fetch(url);
    const buffer = await response.buffer(); // HATA buradaydı, düzeltildi
    fs.writeFileSync(filePath, buffer);
    console.log("🎉 Video indirildi:", fileName);

    // Buraya YouTube yükleme fonksiyonunu çağıracaksın
    // await uploadToYouTube(filePath);

  } catch (err) {
    console.error("❌ Video indirme hatası:", err);
  }
});

client.login(process.env.BOT_TOKEN);
