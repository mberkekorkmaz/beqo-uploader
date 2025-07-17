const { google } = require("googleapis");
const fs = require("fs");

async function uploadVideoToYouTube(videoPath, message) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.CLIENT_EMAIL,
      private_key: process.env.PRIVATE_KEY.replace(/\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/youtube.upload"],
  });

  const youtube = google.youtube({
    version: "v3",
    auth: await auth.getClient(),
  });

  try {
    const res = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: "Discord'dan Otomatik Video",
          description: "",
        },
        status: {
          privacyStatus: "public",
        },
      },
      media: {
        body: fs.createReadStream(videoPath),
      },
    });

    console.log("✅ Video yüklendi:", res.data.id);
    await message.reply(`✅ Video yüklendi: https://youtu.be/${res.data.id}`);
  } catch (err) {
    console.error("❌ YouTube yükleme hatası:", err.message);
    await message.reply("❌ YouTube'a yükleme başarısız.");
  } finally {
    fs.unlinkSync(videoPath);
  }
}

module.exports = uploadVideoToYouTube;
