import { Router } from "express";

const router = Router();
const BACKEND = process.env.PIPELINE_BACKEND_URL || "http://20.98.68.88:8005";

async function proxyRequest(
  backendPath: string,
  method: string,
): Promise<{ status: number; data: unknown }> {
  const url = `${BACKEND}${backendPath}`;
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(30000),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

router.post("/pipeline/run-async", async (_req, res) => {
  try {
    const { status, data } = await proxyRequest("/pipeline/run-async", "POST");
    res.status(status).json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Proxy error";
    res.status(502).json({ error: msg });
  }
});

router.get("/pipeline/status", async (_req, res) => {
  try {
    const { status, data } = await proxyRequest("/pipeline/status", "GET");
    res.status(status).json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Proxy error";
    res.status(502).json({ error: msg });
  }
});

router.get("/pipeline/results", async (_req, res) => {
  try {
    const { status, data } = await proxyRequest("/pipeline/results", "GET");
    res.status(status).json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Proxy error";
    res.status(502).json({ error: msg });
  }
});

export default router;
