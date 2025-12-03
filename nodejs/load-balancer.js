const express = require("express");
const axios = require("axios");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

/**
 * ================================
 * CONFIG
 * ================================
 */
const PORT = 3000;

const workers = ["https://py.fgp.one", "http://localhost:8000"];

const MAX_CPU = 85;
const MAX_MEM = 85;
const STATUS_TIMEOUT = 1500;

/**
 * ================================
 * MORGAN
 * ================================
 */
morgan.token("worker", (req) => req._worker || "none");

app.use(morgan(":method :url :status :res[content-length] - :response-time ms → :worker"));

/**
 * ================================
 * STATUS (ON-DEMAND)
 * ================================
 */
async function getWorkerStatus(worker) {
  try {
    const res = await axios.get(`${worker}/status`, {
      timeout: STATUS_TIMEOUT,
      headers: { "X-Health-Check": "1" },
    });

    const cpu = res.data.cpu ?? 0;
    const memory = res.data.memory ?? 0;

    return {
      worker,
      ok: true,
      cpu,
      memory,
      busy: res.data.busy === true || cpu > MAX_CPU || memory > MAX_MEM,
    };
  } catch (err) {
    return {
      worker,
      ok: false,
      busy: true,
    };
  }
}

/**
 * ================================
 * PICK BEST WORKER
 * ================================
 */
async function pickWorker() {
  const checks = await Promise.all(workers.map((w) => getWorkerStatus(w)));

  const available = checks.filter((w) => w.ok && !w.busy).sort((a, b) => a.cpu + a.memory - (b.cpu + b.memory));

  return available.length ? available[0].worker : null;
}

/**
 * ================================
 * NO WORKERS GUARD
 * ================================
 */
app.use(async (req, res, next) => {
  const target = await pickWorker();

  if (!target) {
    req._worker = "none";
    return res.status(503).json({
      error: "Todos los workers están ocupados",
    });
  }

  req._worker = target;
  req._target = target;
  next();
});

/**
 * ================================
 * PROXY
 * ================================
 */
app.use(
  createProxyMiddleware({
    changeOrigin: true,
    xfwd: true,

    router: (req) => req._target,

    onProxyReq: (proxyReq) => {
      proxyReq.setHeader("X-Forwarded-By", "node-balancer");
    },

    onError: (err, req, res) => {
      console.error("❌ Proxy error:", err.message);
      res.status(502).json({ error: "Bad gateway" });
    },
  })
);

/**
 * ================================
 * START
 * ================================
 */
app.listen(PORT, () => {
  console.log(`🟢 Load balancer activo en :${PORT}`);
});
