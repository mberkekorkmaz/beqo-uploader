
const fs = require("fs");
const { google } = require("googleapis");
require("dotenv").config();

async function uploadVideoToYouTube(videoPath) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.YT_CLIENT_ID,
    process.env.YT_CLIENT_SECRET,
    process.env.YT_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.YT_REFRESH_TOKEN,
  });

  const youtube = google.youtube({
    version: "v3",
    auth: oauth2Client,
  });

  try {
    const res = await youtube.videos.insert({
      part: "snippet,status",
      requestBody: {
        snippet: {
          title: "Otomatik Yüklenen Video",
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

    console.log("✅ YouTube Yükleme Başarılı:", res.data.id);
  } catch (err) {
    console.error("❌ YouTube Yükleme Hatası:", err.message);
  }
}

module.exports = uploadVideoToYouTube;
