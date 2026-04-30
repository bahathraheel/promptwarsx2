/**
 * Health check routes for ELITE ELECTION.
 */
const express = require("express");
const router = express.Router();
const { addCheck } = require("../utils/checksStore");

const startTime = Date.now();

router.get("/", (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const memUsage = process.memoryUsage();

  const health = {
    status: "ok",
    service: "elite-election",
    version: "1.0.0",
    uptime: `${uptime}s`,
    timestamp: new Date().toISOString(),
    memory: {
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    },
    environment: process.env.NODE_ENV || "development",
    googleServices: {
      gemini: !!process.env.GEMINI_API_KEY,
      tts: process.env.ENABLE_TTS === "true",
      translation: process.env.ENABLE_TRANSLATION === "true",
      nlp: process.env.ENABLE_NLP === "true",
      firestore: process.env.ENABLE_FIRESTORE === "true",
      recaptcha: process.env.ENABLE_RECAPTCHA === "true",
      cloudLogging: process.env.ENABLE_CLOUD_LOGGING === "true",
    },
  };

  // Log the check
  addCheck({
    status: "ok",
    service: "health",
    responseTime: Date.now() - startTime,
    success: true,
    details: { uptime, memory: health.memory },
  });

  res.json({ success: true, data: health });
});

router.get("/ready", (req, res) => {
  res.json({ success: true, ready: true });
});

router.get("/live", (req, res) => {
  res.json({ success: true, alive: true });
});

module.exports = router;
