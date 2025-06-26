const express = require("express");
const fetch = require("node-fetch");
const Jimp = require("jimp");

const app = express();
const PORT = process.env.PORT || 3000;

// Changed route from /get-profile-pic-hex to /get
app.get("/get", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: "Missing userId parameter" });
  }

  try {
    // Step 1: Get thumbnail URL from Roblox
    const thumbURL = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png`;
    const thumbRes = await fetch(thumbURL);
    const thumbJson = await thumbRes.json();
    const imageUrl = thumbJson.data[0].imageUrl;

    // Step 2: Load and resize image using Jimp
    const image = await Jimp.read(imageUrl);
    image.resize(10, 10);

    const hexColors = [];

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const color = image.getPixelColor(x, y);
        const hex = Jimp.intToRGBA(color);
        const hexString = ((1 << 24) + (hex.r << 16) + (hex.g << 8) + hex.b)
          .toString(16)
          .slice(1);
        hexColors.push(hexString);
      }
    }

    // Return a single string with dots separating each hex code
    return res.send(hexColors.join('.'));

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Failed to process image" });
  }
});

app.listen(PORT, () => {
  console.log("API is running on port", PORT);
});
