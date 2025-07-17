const { google } = require("googleapis");
const fs = require("fs");
require("dotenv").config();

const auth = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

auth.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const youtube = google.youtube({
  version: "v3",
  auth,
});

async function uploadVideoToYouTube(filePath, discordChannel) {
  try {
    const res = await youtube.videos.insert({
      part: "snippet,status",
      requestBody: {
        snippet: {
          title: "Discord'dan Yüklenen Video",
          description: "",
        },
        status: {
          privacyStatus: "public",
        },
      },
      media: {
        body: fs.createReadStream(filePath),
      },
    });

    console.log("✅ Video yüklendi:", res.data.id);
    if (discordChannel) {
      await discordChannel.send(`✅ Video yüklendi: https://youtu.be/${res.data.id}`);
    }
  } catch (err) {
    console.error("❌ YouTube yükleme hatası:", err.message);
    if (discordChannel) {
      await discordChannel.send("❌ YouTube yükleme hatası oluştu.");
    }
  }
}

module.exports = uploadVideoToYouTube;