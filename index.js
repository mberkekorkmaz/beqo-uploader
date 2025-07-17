
const { Client, GatewayIntentBits } = require("discord.js");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const uploadVideoToYouTube = require("./uploadVideoToYouTube");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const CHANNEL_ID = "1387766634214850611";

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
    const buffer = await response.buffer();
    fs.writeFileSync(filePath, buffer);
    console.log("🎉 Video indirildi:", fileName);

    await message.channel.send("📤 Video YouTube'a yükleniyor...");
    await uploadVideoToYouTube(filePath);
    await message.channel.send("✅ Video YouTube'a başarıyla yüklendi!");

  } catch (err) {
    console.error("❌ Video işleme hatası:", err.message);
    await message.channel.send("❌ Video yüklenirken bir hata oluştu.");
  }
});

client.login(process.env.BOT_TOKEN);
