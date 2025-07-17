
const { google } = require("googleapis");
const fs = require("fs");
require("dotenv").config();

async function uploadVideoToYouTube(videoPath, title = "beqoAI Otomatik Yükleme") {
  console.log("🎬 uploadVideoToYouTube başladı:", videoPath);

  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
  });

  const youtube = google.youtube({
    version: "v3",
    auth: oauth2Client,
  });

  const fileSize = fs.statSync(videoPath).size;

  try {
    const res = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: title,
          description: "",
        },
        status: {
          privacyStatus: "public",
        },
      },
      media: {
        body: fs.createReadStream(videoPath),
      },
    }, {
      onUploadProgress: evt => {
        const progress = (evt.bytesRead / fileSize) * 100;
        console.log(`📤 Yükleme: ${progress.toFixed(2)}%`);
      }
    });

    console.log("✅ Video Yüklendi: https://youtube.com/watch?v=" + res.data.id);
    return res.data.id;

  } catch (err) {
    console.error("❌ YouTube yükleme hatası:", err.response?.data || err.message);
    return null;
  }
}

module.exports = uploadVideoToYouTube;
