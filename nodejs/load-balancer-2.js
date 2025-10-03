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

const workers = [
  "https://python.fgp.one",
  "http://localhost:5000"
];

const MAX_CPU = 85;
const MAX_MEM = 85;
const STATUS_TIMEOUT = 1500;

/**
 * ================================
 * STATUS ON-DEMAND
 * ================================
 */
async function getWorkerStatus(worker) {
  try {
    const res = await axios.get(`${worker}/status`, {
      timeout: STATUS_TIMEOUT,
      headers: { "X-Health-Check": "1" }
    });

    const cpu = res.data.cpu ?? 0;
    const memory = res.data.memory ?? 0;

    return {
      worker,
      status: "ok",
      cpu,
      memory,
      busy:
        res.data.busy === true ||
        cpu > MAX_CPU ||
        memory > MAX_MEM
    };

  } catch (err) {
    return {
      worker,
      status: "down",
      busy: true,
      error: err.message
    };
  }
}

/**
 * ================================
 * PICK BEST WORKER (ON REQUEST)
 * ================================
 */
async function pickWorker() {
  const results = await Promise.all(
    workers.map(w => getWorkerStatus(w))
  );

  const available = results
    .filter(w => w.status === "ok" && w.busy === false)
    .sort((a, b) => (a.cpu + a.memory) - (b.cpu + b.memory));

  return available.length ? available[0].worker : null;
}

/**
 * ================================
 * PROXY (SINGLE INSTANCE)
 * ================================
 */
const proxy = createProxyMiddleware({
  changeOrigin: true,
  xfwd: true,

  router: async () => {
    const target = await pickWorker();
    if (!target) throw new Error("NO_WORKERS");
    return target;
  },

  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader("X-Forwarded-By", "node-balancer");
    console.log(
      `➡️  ${req.method} ${req.originalUrl} → ${proxyReq.protocol}//${proxyReq.host}`
    );
  },

  onError: (err, req, res) => {
    if (err.message === "NO_WORKERS") {
      return res.status(503).json({
        error: "Todos los workers están ocupados"
      });
    }

    console.error("❌ Proxy error:", err.message);
    res.status(502).json({ error: "Bad gateway" });
  }
});

app.use(proxy);

/**
 * ================================
 * START
 * ================================
 */
app.listen(PORT, () => {
  console.log(`🟢 Load balancer activo en :${PORT}`);
});
