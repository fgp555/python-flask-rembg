import fs from "node:fs";

async function removeBg(blob) {
  const formData = new FormData();
  formData.append("size", "auto");
  formData.append("image_file", blob);
  const url = "https://api.remove.bg/v1.0/removebg";
  // const url = "https://api.frankgp.com/v1.0/removebg";

  const response = await fetch(url, {
    method: "POST",
    headers: { "X-Api-Key": "1iHxMgoQAgdc68uGSFTiLRGo" },
    body: formData,
  });

  if (response.ok) {
    return await response.arrayBuffer();
  } else {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
}

const inputPath = "./image.png";
const fileBlob = await fs.openAsBlob(inputPath);
const rbgResultData = await removeBg(fileBlob);
fs.writeFileSync("no-bg.png", Buffer.from(rbgResultData));
