/**
 * Client-side worker inference tool
 *
 * Uso:
 *   node measure-workers.js
 *
 * Requisitos:
 *   node >= 18 (fetch nativo)
 */

const fs = require("fs");
const path = require("path");

// ---------- CONFIG ----------
const API_URL = "http://localhost:8000/v2.0/removebg?format=png";
// const API_URL = "https://rembg2.ivanageraldine.com/v2.0/removebg?format=png";
const API_KEY = "MY_API_KEY";

const IMAGE_PATH = "./images/image-2k.png";

// cuántos requests totales lanzar
const TOTAL_REQUESTS = 4;

// dispararlas TODAS juntas
// (NO limitar concurrencia)
const CONCURRENCY = TOTAL_REQUESTS;
// ----------------------------

function makeFormData() {
  const form = new FormData();
  const buffer = fs.readFileSync(IMAGE_PATH);
  form.append("image_file", new Blob([buffer]), path.basename(IMAGE_PATH));
  return form;
}

async function timedRequest(i) {
  const form = makeFormData();
  const t0 = performance.now();

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "X-Api-Key": API_KEY },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`req ${i} -> HTTP ${res.status}`);
  }

  await res.arrayBuffer(); // consumir respuesta

  const t1 = performance.now();
  return { id: i, time: +(t1 - t0).toFixed(2) };
}

(async () => {
  console.log("🔥 warmup...");
  await timedRequest("warmup"); // calentar backend

  console.log(`🚀 launching ${TOTAL_REQUESTS} requests in parallel...\n`);

  const start = performance.now();

  const tasks = Array.from({ length: TOTAL_REQUESTS }, (_, i) => timedRequest(i + 1));

  const results = await Promise.all(tasks);

  const total = +(performance.now() - start).toFixed(2);

  console.table(results);
  console.log(`\n⏱ total wall time: ${total} ms`);

  // ---------- ORDER results ----------
  results.sort((a, b) => a.time - b.time);
  console.table(results);

  // ---------- robust inference ----------
  const THRESHOLD_MS = results[0].time * 0.4;
  // 40% del más rápido (tolerante a red)

  let waves = [];
  let current = [results[0]];

  for (let i = 1; i < results.length; i++) {
    if (results[i].time - results[i - 1].time <= THRESHOLD_MS) {
      current.push(results[i]);
    } else {
      waves.push(current);
      current = [results[i]];
    }
  }
  waves.push(current);

  // print
  console.log("\n📊 inferred waves:");
  waves.forEach((w, i) => {
    console.log(`wave ${i + 1}: ${w.length} reqs`);
  });

  const estimatedWorkers = Math.max(...waves.map((w) => w.length));
  console.log(`\n🧠 estimated workers ≈ ${estimatedWorkers}`);
})();
