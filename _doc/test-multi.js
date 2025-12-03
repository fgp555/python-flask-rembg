const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");

const imagesDir = "./images";
const outDir = "./out";
const API_URL = "http://localhost:3000/v2.0/removebg";
const API_KEY = "MY_API_KEY";

// ✅ crear carpeta out si no existe
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function sendImage(file) {
  const form = new FormData();
  form.append("image_file", fs.createReadStream(file));

  const res = await axios.post(API_URL, form, {
    headers: {
      "X-Api-Key": API_KEY,
      ...form.getHeaders(),
    },
    responseType: "arraybuffer",
  });

  const outputPath = path.join(outDir, path.basename(file));
  fs.writeFileSync(outputPath, res.data);

  console.log("✅", outputPath);
}

async function run() {
  const images = fs.readdirSync(imagesDir).map((f) => path.join(imagesDir, f));

  await Promise.all(images.map(sendImage)); // 🔥 paralelo
}

run().catch(console.error);
