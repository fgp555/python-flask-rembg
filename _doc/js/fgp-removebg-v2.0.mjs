import fs from "node:fs";

async function removeBg(
  blob,
  { compressImage = false, maxWidth = null, format = "png" } = {}
) {
  const formData = new FormData();
  formData.append("size", "auto");
  formData.append("image_file", blob);

  // Construir la URL con parámetros
  const params = new URLSearchParams();
  if (compressImage) params.append("compress_image", "true");
  if (maxWidth) params.append("max_width", maxWidth);
  if (format) params.append("format", format);

  const url = `https://api.frankgp.com/v2.0/removebg${
    params.toString() ? "?" + params.toString() : ""
  }`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "X-Api-Key": "MY_API_KEY" },
    body: formData,
  });

  if (response.ok) {
    return await response.arrayBuffer();
  } else {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
}

const inputPath = "../item-bottom01.jpg";
const fileBlob = await fs.openAsBlob(inputPath);

// ejemplo 1: PNG sin compresión
const result1 = await removeBg(fileBlob, { format: "png" });
fs.writeFileSync("no-bg.png", Buffer.from(result1));

// ejemplo 2: JPEG comprimido
const result2 = await removeBg(fileBlob, { format: "jpeg", compressImage: true });
fs.writeFileSync("no-bg.jpg", Buffer.from(result2));

// ejemplo 3: PNG redimensionado a 720px
const result3 = await removeBg(fileBlob, { format: "png", maxWidth: 720 });
fs.writeFileSync("no-bg-720.png", Buffer.from(result3));

// ejemplo 4: JPEG comprimido + redimensionado a 720px
const result4 = await removeBg(fileBlob, {
  format: "jpeg",
  compressImage: true,
  maxWidth: 720,
});
fs.writeFileSync("no-bg-720.jpg", Buffer.from(result4));

// ejemplo 5: WEBP con compresión
const result5 = await removeBg(fileBlob, { format: "webp", compressImage: true });
fs.writeFileSync("no-bg.webp", Buffer.from(result5));

// ejemplo 6: WEBP redimensionado a 720px
const result6 = await removeBg(fileBlob, { format: "webp", maxWidth: 720 });
fs.writeFileSync("no-bg-720.webp", Buffer.from(result6));
