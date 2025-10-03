const express = require("express");
const axios = require("axios");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

/**
 * ================================
 * CONFIG
 * ================================
 */
const PORT = 3000;

const workers = ["https://python.fgp.one", "http://localhost:5000"];

const HEALTH_INTERVAL = 5000; // ms
const MAX_CPU = 85;
const MAX_MEM = 85;

/**
 * ================================
 * STATE
 * ================================
 */
const workerStatus = {};

/**
 * ================================
 * HEALTH CHECK
 * ================================
 */
async function checkWorkers() {
  for (const w of workers) {
    try {
      const res = await axios.get(`${w}/status`, {
        timeout: 1500,
        headers: { "X-Health-Check": "1" },
      });

      workerStatus[w] = {
        status: "ok",
        cpu: res.data.cpu,
        memory: res.data.memory,
        busy: res.data.busy === true || res.data.cpu > MAX_CPU || res.data.memory > MAX_MEM,
        updated: Date.now(),
      };
    } catch (err) {
      workerStatus[w] = {
        status: "down",
        busy: true,
        error: err.message,
        updated: Date.now(),
      };
    }
  }
}

setInterval(checkWorkers, HEALTH_INTERVAL);
checkWorkers();

/**
 * ================================
 * PICK BEST WORKER
 * ================================
 */
function pickWorker() {
  const available = Object.entries(workerStatus)
    .filter(([_, w]) => w.status === "ok" && w.busy === false)
    .sort((a, b) => a[1].cpu + a[1].memory - (b[1].cpu + b[1].memory));

  return available.length ? available[0][0] : null;
}

/**
 * ================================
 * PROXY (SINGLE INSTANCE)
 * ================================
 */
const proxy = createProxyMiddleware({
  changeOrigin: true,
  xfwd: true,

  router: () => {
    const target = pickWorker();
    if (!target) throw new Error("NO_WORKERS");
    return target;
  },

  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader("X-Forwarded-By", "node-balancer");
    console.log(`➡️  ${req.method} ${req.originalUrl} → ${proxyReq.protocol}//${proxyReq.host}`);
  },

  onError: (err, req, res) => {
    if (err.message === "NO_WORKERS") {
      return res.status(503).json({
        error: "Todos los workers están ocupados",
      });
    }

    console.error("❌ Proxy error:", err.message);
    res.status(502).json({ error: "Bad gateway" });
  },
});

app.use(proxy);

/**
 * ================================
 * ADMIN ENDPOINT (OPTIONAL)
 * ================================
 */
app.get("/__balancer/status", (req, res) => {
  res.json({
    workers: workerStatus,
    time: new Date().toISOString(),
  });
});

/**
 * ================================
 * START
 * ================================
 */
app.listen(PORT, () => {
  console.log(`🟢 Load balancer activo en :${PORT}`);
});
